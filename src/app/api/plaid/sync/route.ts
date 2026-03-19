import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/api/auth";
import { isPlaidConfigured } from "@/lib/plaid/client";
import { syncTransactions } from "@/lib/plaid/sync";
import { syncRequestSchema } from "@/lib/validations/plaid";

export async function POST(request: Request) {
  const { supabase, errorResponse } = await getAuthenticatedUser(request);
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

  const parsed = syncRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.issues },
      { status: 400 },
    );
  }

  const { plaid_item_id } = parsed.data;

  const result = await syncTransactions(supabase!, plaid_item_id);

  if (result.error) {
    if (result.error.toLowerCase().includes("not found")) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({
    added: result.added,
    modified: result.modified,
    removed: result.removed,
  });
}
