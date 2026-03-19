import type { SupabaseClient } from "@supabase/supabase-js";
import type { RemovedTransaction } from "plaid";

import { getPlaidClient } from "./client";
import { mapPlaidTransaction } from "./mappers";

export interface SyncResult {
  added: number;
  modified: number;
  removed: number;
  error?: string;
}

export async function syncTransactions(
  supabase: SupabaseClient,
  plaidItemId: string,
): Promise<SyncResult> {
  const plaidClient = getPlaidClient();

  // Fetch the plaid item
  const { data: plaidItem, error: itemError } = await supabase
    .from("plaid_items")
    .select("*")
    .eq("id", plaidItemId)
    .single();

  if (itemError || !plaidItem) {
    return { added: 0, modified: 0, removed: 0, error: "Plaid item not found" };
  }

  // Build a map of account_id → linked_account row
  const { data: linkedAccounts } = await supabase
    .from("linked_accounts")
    .select("id, account_id")
    .eq("plaid_item_id", plaidItemId);

  const accountMap = new Map<string, string>();
  for (const acct of linkedAccounts ?? []) {
    accountMap.set(acct.account_id, acct.id);
  }

  let cursor: string | undefined = plaidItem.cursor ?? undefined;
  let totalAdded = 0;
  let totalModified = 0;
  let totalRemoved = 0;
  let hasMore = true;

  try {
    while (hasMore) {
      const response = await plaidClient.transactionsSync({
        access_token: plaidItem.access_token,
        cursor,
      });

      const { added, modified, removed, next_cursor, has_more } = response.data;

      // Insert added transactions
      if (added.length > 0) {
        const rows = added
          .map((tx) => {
            const linkedAccountId = accountMap.get(tx.account_id);
            if (!linkedAccountId) return null;
            return mapPlaidTransaction(tx, plaidItem.user_id, linkedAccountId);
          })
          .filter(Boolean);

        if (rows.length > 0) {
          const { error } = await supabase.from("transactions").upsert(rows, {
            onConflict: "transaction_id",
          });
          if (error) throw error;
        }
        totalAdded += rows.length;
      }

      // Upsert modified transactions
      if (modified.length > 0) {
        const rows = modified
          .map((tx) => {
            const linkedAccountId = accountMap.get(tx.account_id);
            if (!linkedAccountId) return null;
            return mapPlaidTransaction(tx, plaidItem.user_id, linkedAccountId);
          })
          .filter(Boolean);

        if (rows.length > 0) {
          const { error } = await supabase.from("transactions").upsert(rows, {
            onConflict: "transaction_id",
          });
          if (error) throw error;
        }
        totalModified += rows.length;
      }

      // Delete removed transactions
      if (removed.length > 0) {
        const removedIds = (removed as RemovedTransaction[])
          .map((r) => r.transaction_id)
          .filter(Boolean);

        if (removedIds.length > 0) {
          const { error } = await supabase
            .from("transactions")
            .delete()
            .in("transaction_id", removedIds);
          if (error) throw error;
        }
        totalRemoved += removedIds.length;
      }

      cursor = next_cursor;
      hasMore = has_more;
    }

    // Update cursor on plaid_item
    await supabase
      .from("plaid_items")
      .update({ cursor })
      .eq("id", plaidItemId);

    // Update account balances
    try {
      const balancesResponse = await plaidClient.accountsGet({
        access_token: plaidItem.access_token,
      });

      for (const account of balancesResponse.data.accounts) {
        const linkedAccountId = accountMap.get(account.account_id);
        if (!linkedAccountId) continue;

        await supabase
          .from("linked_accounts")
          .update({
            current_balance: account.balances.current,
            available_balance: account.balances.available,
          })
          .eq("id", linkedAccountId);
      }
    } catch {
      // Balance update failure is non-fatal
    }

    return { added: totalAdded, modified: totalModified, removed: totalRemoved };
  } catch (err) {
    // Update item status on error
    const errorMessage = err instanceof Error ? err.message : "Unknown sync error";

    await supabase
      .from("plaid_items")
      .update({
        status: "error",
        error_code: "SYNC_ERROR",
        error_message: errorMessage,
      })
      .eq("id", plaidItemId);

    return {
      added: totalAdded,
      modified: totalModified,
      removed: totalRemoved,
      error: errorMessage,
    };
  }
}
