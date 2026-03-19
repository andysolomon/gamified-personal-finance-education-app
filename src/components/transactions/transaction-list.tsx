"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { CategoryFilter } from "@/components/transactions/category-filter";
import { TransactionRow } from "@/components/transactions/transaction-row";
import { TransactionToolbar } from "@/components/transactions/transaction-toolbar";
import { useDebounce } from "@/hooks/use-debounce";
import type { AppCategory } from "@/lib/categories";
import { getDateCutoff, type DateRangePreset } from "@/lib/date-utils";
import type { LinkedAccountWithItem } from "@/lib/queries/linked-accounts";
import type { TransactionWithCategory } from "@/types/database";

interface TransactionListProps {
  initialTransactions: TransactionWithCategory[];
  accounts: LinkedAccountWithItem[];
}

export function TransactionList({ initialTransactions, accounts }: TransactionListProps) {
  const [selectedCategory, setSelectedCategory] = useState<AppCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [accountId, setAccountId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRangePreset>("all");

  const debouncedSearch = useDebounce(searchQuery, 300);

  const filtered = useMemo(() => {
    let result = initialTransactions;

    if (selectedCategory !== null) {
      result = result.filter((tx) => tx.app_category === selectedCategory);
    }

    if (accountId !== null) {
      result = result.filter((tx) => tx.linked_account_id === accountId);
    }

    const cutoff = getDateCutoff(dateRange);
    if (cutoff !== null) {
      result = result.filter((tx) => tx.date >= cutoff);
    }

    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      result = result.filter(
        (tx) =>
          tx.merchant_name?.toLowerCase().includes(query) ||
          tx.name?.toLowerCase().includes(query),
      );
    }

    return result;
  }, [initialTransactions, selectedCategory, accountId, dateRange, debouncedSearch]);

  const hasActiveFilters =
    selectedCategory !== null ||
    accountId !== null ||
    dateRange !== "all" ||
    debouncedSearch !== "";

  function clearFilters() {
    setSelectedCategory(null);
    setSearchQuery("");
    setAccountId(null);
    setDateRange("all");
  }

  if (initialTransactions.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        No transactions yet. Link a bank account to see your transactions here.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <TransactionToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        accountId={accountId}
        onAccountChange={setAccountId}
        accounts={accounts}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />

      {hasActiveFilters && filtered.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Showing {filtered.length} of {initialTransactions.length} transactions
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No transactions match your filters.
          </p>
          <Button variant="outline" size="sm" className="mt-3" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      ) : (
        <div>
          {filtered.map((tx) => (
            <TransactionRow key={tx.id} transaction={tx} />
          ))}
        </div>
      )}
    </div>
  );
}
