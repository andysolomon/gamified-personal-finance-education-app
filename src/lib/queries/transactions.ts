import type { SupabaseClient } from "@supabase/supabase-js";

import type { Transaction } from "@/types/database";
import type { TransactionWithCategory } from "@/types/database";
import type { AppCategory } from "@/lib/categories";
import { getAppCategory, getSubcategory } from "@/lib/categories";

export function enrichTransaction(tx: Transaction): TransactionWithCategory {
  return {
    ...tx,
    app_category: getAppCategory(tx.category_primary),
    app_subcategory: getSubcategory(tx.category_detailed),
  };
}

export interface TransactionFilters {
  accountId?: string;
  category?: AppCategory;
  startDate?: string;
  endDate?: string;
}

export async function getTransactions(
  supabase: SupabaseClient,
  filters?: TransactionFilters,
): Promise<TransactionWithCategory[]> {
  let query = supabase
    .from("transactions")
    .select("*")
    .order("date", { ascending: false });

  if (filters?.accountId) {
    query = query.eq("linked_account_id", filters.accountId);
  }

  if (filters?.startDate) {
    query = query.gte("date", filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte("date", filters.endDate);
  }

  const { data, error } = await query;
  if (error) throw error;

  let enriched = (data ?? []).map(enrichTransaction);

  if (filters?.category) {
    enriched = enriched.filter((tx) => tx.app_category === filters.category);
  }

  return enriched;
}
