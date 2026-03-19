"use client";

import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { DateRangePreset } from "@/lib/date-utils";

const DATE_PRESETS: { value: DateRangePreset; label: string }[] = [
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
  { value: "all", label: "All" },
];

interface TransactionToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  accountId: string | null;
  onAccountChange: (accountId: string | null) => void;
  accounts: Array<{ id: string; name: string | null; mask: string | null }>;
  dateRange: DateRangePreset;
  onDateRangeChange: (range: DateRangePreset) => void;
}

export function TransactionToolbar({
  searchQuery,
  onSearchChange,
  accountId,
  onAccountChange,
  accounts,
  dateRange,
  onDateRangeChange,
}: TransactionToolbarProps) {
  return (
    <div className="flex gap-3 flex-wrap items-center">
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search transactions..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>

      <Select
        value={accountId ?? ""}
        onChange={(e) => onAccountChange(e.target.value || null)}
        className="w-full sm:w-48"
        aria-label="Filter by account"
      >
        <option value="">All accounts</option>
        {accounts.map((account) => (
          <option key={account.id} value={account.id}>
            {account.name ?? "Account"}{account.mask ? ` (****${account.mask})` : ""}
          </option>
        ))}
      </Select>

      <div className="flex gap-1">
        {DATE_PRESETS.map((preset) => (
          <Button
            key={preset.value}
            variant={dateRange === preset.value ? "secondary" : "outline"}
            size="sm"
            onClick={() => onDateRangeChange(preset.value)}
          >
            {preset.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
