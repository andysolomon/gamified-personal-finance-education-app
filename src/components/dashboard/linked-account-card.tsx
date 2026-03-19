import { formatCurrency } from "@/lib/format";
import type { LinkedAccountWithItem } from "@/lib/queries/linked-accounts";

interface LinkedAccountCardProps {
  account: LinkedAccountWithItem;
}

export function LinkedAccountCard({ account }: LinkedAccountCardProps) {
  const status = account.plaid_items?.status ?? "active";
  const institutionName = account.plaid_items?.institution_name ?? "Unknown Bank";
  const lastSynced = account.plaid_items?.updated_at;

  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="flex items-center gap-3">
        <div
          className={`h-2.5 w-2.5 rounded-full ${
            status === "active" ? "bg-green-500" : "bg-amber-500"
          }`}
          title={status === "active" ? "Connected" : "Needs attention"}
        />
        <div>
          <p className="font-medium">{institutionName}</p>
          <p className="text-sm text-muted-foreground">
            {account.name}
            {account.mask ? ` ····${account.mask}` : ""}
          </p>
          {lastSynced && (
            <p className="text-xs text-muted-foreground">
              Last synced:{" "}
              {new Date(lastSynced).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>
      </div>
      <div className="text-right">
        {account.current_balance != null && (
          <p className="font-semibold">
            {formatCurrency(account.current_balance, account.iso_currency_code)}
          </p>
        )}
        {account.available_balance != null &&
          account.available_balance !== account.current_balance && (
            <p className="text-sm text-muted-foreground">
              {formatCurrency(account.available_balance, account.iso_currency_code)}{" "}
              available
            </p>
          )}
      </div>
    </div>
  );
}
