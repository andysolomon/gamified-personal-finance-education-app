import { CATEGORY_META } from "@/lib/categories";
import { formatCurrency } from "@/lib/format";
import type { TransactionWithCategory } from "@/types/database";

interface TransactionRowProps {
  transaction: TransactionWithCategory;
}

export function TransactionRow({ transaction }: TransactionRowProps) {
  const displayName = transaction.merchant_name ?? transaction.name ?? "Unknown";
  const categoryMeta = transaction.app_category
    ? CATEGORY_META[transaction.app_category]
    : null;
  const isExpense = transaction.amount > 0;

  return (
    <div className="flex items-center justify-between py-3 border-b last:border-b-0">
      <div className="flex flex-col gap-1 min-w-0">
        <span className="font-medium truncate">{displayName}</span>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{transaction.date}</span>
          {categoryMeta && (
            <span className={`${categoryMeta.color} font-medium`}>
              {categoryMeta.label}
            </span>
          )}
        </div>
      </div>
      <span
        className={`font-medium tabular-nums whitespace-nowrap ml-4 ${
          isExpense ? "text-foreground" : "text-green-600"
        }`}
      >
        {isExpense ? "-" : "+"}
        {formatCurrency(Math.abs(transaction.amount), transaction.iso_currency_code)}
      </span>
    </div>
  );
}
