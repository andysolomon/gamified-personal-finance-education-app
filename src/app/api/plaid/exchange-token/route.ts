import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/api/auth";
import { getPlaidClient, isPlaidConfigured } from "@/lib/plaid/client";
import { syncTransactions } from "@/lib/plaid/sync";
import { exchangeTokenRequestSchema } from "@/lib/validations/plaid";

export async function POST(request: Request) {
  const { user, supabase, errorResponse } = await getAuthenticatedUser(request);
  if (errorResponse) return errorResponse;

  if (!isPlaidConfigured()) {
    return NextResponse.json(
      { error: "Bank linking is not available" },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = exchangeTokenRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.issues },
      { status: 400 },
    );
  }

  const { public_token, metadata } = parsed.data;

  try {
    const plaidClient = getPlaidClient();

    // Exchange public token for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token,
    });

    const { access_token, item_id } = exchangeResponse.data;

    // Insert plaid_item
    const { data: plaidItem, error: insertError } = await supabase!
      .from("plaid_items")
      .insert({
        user_id: user!.id,
        access_token,
        item_id,
        institution_name: metadata.institution.name,
        institution_id: metadata.institution.institution_id,
      })
      .select()
      .single();

    if (insertError) {
      // Handle duplicate item_id (unique constraint)
      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: "This institution is already linked" },
          { status: 409 },
        );
      }
      throw insertError;
    }

    // Insert linked accounts from metadata
    const accountRows = metadata.accounts.map((acct) => ({
      user_id: user!.id,
      plaid_item_id: plaidItem.id,
      account_id: acct.id,
      name: acct.name,
      type: acct.type,
      subtype: acct.subtype,
      mask: acct.mask,
    }));

    const { error: accountsError } = await supabase!
      .from("linked_accounts")
      .insert(accountRows);

    if (accountsError) throw accountsError;

    // Run initial sync
    await syncTransactions(supabase!, plaidItem.id);

    // Fetch accounts with balances to return
    const { data: accounts } = await supabase!
      .from("linked_accounts")
      .select("*")
      .eq("plaid_item_id", plaidItem.id);

    return NextResponse.json({ accounts: accounts ?? [] });
  } catch (err) {
    console.error("Plaid exchange error:", err);
    return NextResponse.json(
      { error: "Failed to link bank account" },
      { status: 500 },
    );
  }
}
