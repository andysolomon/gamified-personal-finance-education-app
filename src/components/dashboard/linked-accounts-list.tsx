"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import type { LinkedAccountWithItem } from "@/lib/queries/linked-accounts";
import { PlaidLinkButton } from "@/components/plaid/plaid-link-button";
import { LinkedAccountCard } from "./linked-account-card";

interface LinkedAccountsListProps {
  initialAccounts: LinkedAccountWithItem[];
  plaidEnabled: boolean;
}

export function LinkedAccountsList({
  initialAccounts,
  plaidEnabled,
}: LinkedAccountsListProps) {
  const router = useRouter();

  const handleLinkSuccess = useCallback(() => {
    router.refresh();
  }, [router]);

  if (!plaidEnabled && initialAccounts.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="text-lg font-semibold">Linked Accounts</h2>

      {initialAccounts.length === 0 ? (
        <div className="mt-4 text-center">
          <p className="text-muted-foreground">
            Link a bank account to see your balances and transactions.
          </p>
          {plaidEnabled && (
            <div className="mt-4">
              <PlaidLinkButton onSuccess={handleLinkSuccess}>
                Link Your First Account
              </PlaidLinkButton>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="mt-4 space-y-3">
            {initialAccounts.map((account) => (
              <LinkedAccountCard key={account.id} account={account} />
            ))}
          </div>
          {plaidEnabled && (
            <div className="mt-4">
              <PlaidLinkButton onSuccess={handleLinkSuccess}>
                Link Another Account
              </PlaidLinkButton>
            </div>
          )}
        </>
      )}
    </div>
  );
}
