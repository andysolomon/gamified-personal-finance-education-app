import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
    push: vi.fn(),
  }),
}));

// Mock PlaidLinkButton to avoid Plaid SDK dependency in tests
vi.mock("@/components/plaid/plaid-link-button", () => ({
  PlaidLinkButton: ({ children }: { children?: React.ReactNode }) => (
    <button>{children ?? "Link Bank Account"}</button>
  ),
}));

import { LinkedAccountsList } from "../linked-accounts-list";
import type { LinkedAccountWithItem } from "@/lib/queries/linked-accounts";

const mockAccount: LinkedAccountWithItem = {
  id: "la-1",
  user_id: "user-1",
  plaid_item_id: "pi-1",
  account_id: "acct-1",
  name: "Checking",
  official_name: "Gold Checking",
  type: "depository",
  subtype: "checking",
  mask: "1234",
  current_balance: 1500.5,
  available_balance: 1400.0,
  iso_currency_code: "USD",
  created_at: "2026-03-15T00:00:00Z",
  updated_at: "2026-03-15T00:00:00Z",
  plaid_items: {
    institution_name: "Chase",
    status: "active",
    updated_at: "2026-03-15T10:30:00Z",
  },
};

describe("LinkedAccountsList", () => {
  it("renders empty state when no accounts and plaid enabled", () => {
    render(<LinkedAccountsList initialAccounts={[]} plaidEnabled={true} />);
    expect(
      screen.getByText("Link a bank account to see your balances and transactions."),
    ).toBeInTheDocument();
    expect(screen.getByText("Link Your First Account")).toBeInTheDocument();
  });

  it("renders nothing when no accounts and plaid disabled", () => {
    const { container } = render(
      <LinkedAccountsList initialAccounts={[]} plaidEnabled={false} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders account list", () => {
    render(<LinkedAccountsList initialAccounts={[mockAccount]} plaidEnabled={true} />);
    expect(screen.getByText("Chase")).toBeInTheDocument();
    expect(screen.getByText(/Checking/)).toBeInTheDocument();
    expect(screen.getByText(/1234/)).toBeInTheDocument();
    expect(screen.getByText("$1,500.50")).toBeInTheDocument();
  });

  it("shows status indicator for active account", () => {
    render(<LinkedAccountsList initialAccounts={[mockAccount]} plaidEnabled={true} />);
    const indicator = screen.getByTitle("Connected");
    expect(indicator).toBeInTheDocument();
  });

  it("shows status indicator for error account", () => {
    const errorAccount: LinkedAccountWithItem = {
      ...mockAccount,
      plaid_items: { ...mockAccount.plaid_items, status: "error" },
    };
    render(
      <LinkedAccountsList initialAccounts={[errorAccount]} plaidEnabled={true} />,
    );
    const indicator = screen.getByTitle("Needs attention");
    expect(indicator).toBeInTheDocument();
  });

  it("shows link another button when accounts exist", () => {
    render(<LinkedAccountsList initialAccounts={[mockAccount]} plaidEnabled={true} />);
    expect(screen.getByText("Link Another Account")).toBeInTheDocument();
  });

  it("hides link button when plaid disabled", () => {
    render(
      <LinkedAccountsList initialAccounts={[mockAccount]} plaidEnabled={false} />,
    );
    expect(screen.queryByText("Link Another Account")).not.toBeInTheDocument();
  });
});
