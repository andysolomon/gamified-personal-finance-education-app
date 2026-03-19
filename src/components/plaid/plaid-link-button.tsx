"use client";

import { useCallback, useState } from "react";
import { usePlaidLink } from "react-plaid-link";

import type { LinkedAccount } from "@/types/database";

interface PlaidLinkButtonProps {
  onSuccess?: (accounts: LinkedAccount[]) => void;
  onExit?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function PlaidLinkButton({
  onSuccess,
  onExit,
  className,
  children,
}: PlaidLinkButtonProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExchanging, setIsExchanging] = useState(false);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (publicToken, metadata) => {
      setIsExchanging(true);
      try {
        const response = await fetch("/api/plaid/exchange-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            public_token: publicToken,
            metadata: {
              institution: metadata.institution
                ? {
                    name: metadata.institution.name,
                    institution_id: metadata.institution.institution_id,
                  }
                : { name: "Unknown", institution_id: "" },
              accounts: metadata.accounts.map((acct) => ({
                id: acct.id,
                name: acct.name,
                type: acct.type,
                subtype: acct.subtype,
                mask: acct.mask,
              })),
            },
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to link account");
        }

        const data = await response.json();
        onSuccess?.(data.accounts);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to link account");
      } finally {
        setIsExchanging(false);
      }
    },
    onExit: () => {
      onExit?.();
    },
  });

  const fetchLinkToken = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/plaid/link-token", {
        method: "POST",
      });

      if (response.status === 503) {
        setError("Bank linking coming soon");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to initialize bank linking");
      }

      const data = await response.json();
      setLinkToken(data.link_token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initialize bank linking");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Once we have a link token and Plaid Link is ready, open it
  const handleOpen = useCallback(() => {
    if (linkToken && ready) {
      open();
    } else {
      fetchLinkToken();
    }
  }, [linkToken, ready, open, fetchLinkToken]);

  // After getting the link token, auto-open
  if (linkToken && ready && !isExchanging) {
    open();
  }

  const buttonText = isLoading
    ? "Connecting..."
    : isExchanging
      ? "Linking account..."
      : children ?? "Link Bank Account";

  return (
    <div>
      <button
        onClick={handleOpen}
        disabled={isLoading || isExchanging}
        className={
          className ??
          "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none"
        }
      >
        {buttonText}
      </button>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}
