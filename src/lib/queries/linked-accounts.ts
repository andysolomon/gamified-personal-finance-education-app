import type { SupabaseClient } from "@supabase/supabase-js";

import type { LinkedAccount, PlaidItem } from "@/types/database";

export type LinkedAccountWithItem = LinkedAccount & {
  plaid_items: Pick<PlaidItem, "institution_name" | "status" | "updated_at">;
};

export async function getLinkedAccountsWithItems(
  supabase: SupabaseClient,
): Promise<LinkedAccountWithItem[]> {
  const { data, error } = await supabase
    .from("linked_accounts")
    .select(
      "*, plaid_items(institution_name, status, updated_at)",
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as LinkedAccountWithItem[];
}
