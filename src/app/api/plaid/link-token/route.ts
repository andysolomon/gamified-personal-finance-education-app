import { CountryCode, Products } from "plaid";
import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/api/auth";
import { getPlaidClient, isPlaidConfigured } from "@/lib/plaid/client";

export async function POST(request: Request) {
  const { user, errorResponse } = await getAuthenticatedUser(request);
  if (errorResponse) return errorResponse;

  if (!isPlaidConfigured()) {
    return NextResponse.json(
      { error: "Bank linking is not available" },
      { status: 503 },
    );
  }

  try {
    const plaidClient = getPlaidClient();
    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: user!.id },
      client_name: "Coinstack",
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: "en",
    });

    return NextResponse.json({ link_token: response.data.link_token });
  } catch (err) {
    console.error("Plaid linkTokenCreate error:", err);
    return NextResponse.json(
      { error: "Failed to create link token" },
      { status: 500 },
    );
  }
}
