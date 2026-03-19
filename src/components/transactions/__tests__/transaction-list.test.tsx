import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { TransactionList } from "../transaction-list";
import type { LinkedAccountWithItem } from "@/lib/queries/linked-accounts";
import type { TransactionWithCategory } from "@/types/database";

const mockTransaction = (overrides: Partial<TransactionWithCategory> = {}): TransactionWithCategory => ({
  id: "tx-1",
  user_id: "user-1",
  linked_account_id: "la-1",
  transaction_id: "plaid-tx-1",
  amount: 42.5,
  iso_currency_code: "USD",
  date: "2026-03-15",
  name: "COFFEE SHOP",
  merchant_name: "Blue Bottle Coffee",
  category_primary: "FOOD_AND_DRINK",
  category_detailed: "FOOD_AND_DRINK_COFFEE",
  pending: false,
  created_at: "2026-03-15T00:00:00Z",
  app_category: "food",
  app_subcategory: "coffee",
  ...overrides,
});

const mockAccounts = [
  {
    id: "la-1",
    user_id: "user-1",
    plaid_item_id: "item-1",
    account_id: "plaid-acc-1",
    name: "Checking",
    official_name: "TOTAL CHECKING",
    mask: "1234",
    type: "depository",
    subtype: "checking",
    current_balance: 1000,
    available_balance: 900,
    iso_currency_code: "USD",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    plaid_items: {
      institution_name: "Chase",
      status: "active",
      updated_at: "2026-01-01T00:00:00Z",
    },
  },
  {
    id: "la-2",
    user_id: "user-1",
    plaid_item_id: "item-1",
    account_id: "plaid-acc-2",
    name: "Savings",
    official_name: "SAVINGS ACCOUNT",
    mask: "5678",
    type: "depository",
    subtype: "savings",
    current_balance: 5000,
    available_balance: 5000,
    iso_currency_code: "USD",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    plaid_items: {
      institution_name: "Chase",
      status: "active",
      updated_at: "2026-01-01T00:00:00Z",
    },
  },
] as LinkedAccountWithItem[];

const mockTransactions: TransactionWithCategory[] = [
  mockTransaction(),
  mockTransaction({
    id: "tx-2",
    transaction_id: "plaid-tx-2",
    linked_account_id: "la-2",
    amount: -2500,
    date: "2026-03-10",
    name: "PAYROLL",
    merchant_name: null,
    category_primary: "INCOME",
    category_detailed: null,
    app_category: "income",
    app_subcategory: null,
  }),
  mockTransaction({
    id: "tx-3",
    transaction_id: "plaid-tx-3",
    linked_account_id: "la-1",
    amount: 15.0,
    date: "2026-01-05",
    name: "UBER TRIP",
    merchant_name: "Uber",
    category_primary: "TRANSPORTATION",
    category_detailed: "TRANSPORTATION_RIDE_SHARE",
    app_category: "transport",
    app_subcategory: "ride share",
  }),
];

describe("TransactionList", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date("2026-03-16T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders all transactions", () => {
    render(<TransactionList initialTransactions={mockTransactions} accounts={mockAccounts} />);
    expect(screen.getByText("Blue Bottle Coffee")).toBeInTheDocument();
    expect(screen.getByText("PAYROLL")).toBeInTheDocument();
    expect(screen.getByText("Uber")).toBeInTheDocument();
  });

  it("renders filter pills for all categories", () => {
    render(<TransactionList initialTransactions={mockTransactions} accounts={mockAccounts} />);
    expect(screen.getByRole("button", { name: "Food & Drink" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Transportation" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Income" })).toBeInTheDocument();
  });

  it("filters by category when pill clicked", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<TransactionList initialTransactions={mockTransactions} accounts={mockAccounts} />);

    await user.click(screen.getByRole("button", { name: "Food & Drink" }));

    expect(screen.getByText("Blue Bottle Coffee")).toBeInTheDocument();
    expect(screen.queryByText("PAYROLL")).not.toBeInTheDocument();
    expect(screen.queryByText("Uber")).not.toBeInTheDocument();
  });

  it("resets filter when All category clicked", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<TransactionList initialTransactions={mockTransactions} accounts={mockAccounts} />);

    await user.click(screen.getByRole("button", { name: "Food & Drink" }));
    expect(screen.queryByText("PAYROLL")).not.toBeInTheDocument();

    // Toolbar renders before CategoryFilter, so date "All" is [0] and category "All" is [1]
    const allButtons = screen.getAllByRole("button", { name: "All" });
    await user.click(allButtons[1]!);
    expect(screen.getByText("Blue Bottle Coffee")).toBeInTheDocument();
    expect(screen.getByText("PAYROLL")).toBeInTheDocument();
    expect(screen.getByText("Uber")).toBeInTheDocument();
  });

  it("shows empty state when no transactions", () => {
    render(<TransactionList initialTransactions={[]} accounts={mockAccounts} />);
    expect(
      screen.getByText("No transactions yet. Link a bank account to see your transactions here."),
    ).toBeInTheDocument();
  });

  it("shows empty state when filter has no matches", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<TransactionList initialTransactions={mockTransactions} accounts={mockAccounts} />);

    await user.click(screen.getByRole("button", { name: "Shopping" }));
    expect(
      screen.getByText("No transactions match your filters."),
    ).toBeInTheDocument();
  });

  it("renders toolbar with search input, account dropdown, and date buttons", () => {
    render(<TransactionList initialTransactions={mockTransactions} accounts={mockAccounts} />);
    expect(screen.getByPlaceholderText("Search transactions...")).toBeInTheDocument();
    expect(screen.getByLabelText("Filter by account")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "7 days" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "30 days" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "90 days" })).toBeInTheDocument();
  });

  it("filters by search query (case-insensitive, matches merchant_name)", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<TransactionList initialTransactions={mockTransactions} accounts={mockAccounts} />);

    const input = screen.getByPlaceholderText("Search transactions...");
    await user.type(input, "blue bottle");

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText("Blue Bottle Coffee")).toBeInTheDocument();
    expect(screen.queryByText("PAYROLL")).not.toBeInTheDocument();
    expect(screen.queryByText("Uber")).not.toBeInTheDocument();
  });

  it("search matches name field when merchant_name is null", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<TransactionList initialTransactions={mockTransactions} accounts={mockAccounts} />);

    const input = screen.getByPlaceholderText("Search transactions...");
    await user.type(input, "payroll");

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText("PAYROLL")).toBeInTheDocument();
    expect(screen.queryByText("Blue Bottle Coffee")).not.toBeInTheDocument();
  });

  it("filters by account", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<TransactionList initialTransactions={mockTransactions} accounts={mockAccounts} />);

    const select = screen.getByLabelText("Filter by account");
    await user.selectOptions(select, "la-2");

    // Only tx-2 has linked_account_id "la-2"
    expect(screen.getByText("PAYROLL")).toBeInTheDocument();
    expect(screen.queryByText("Blue Bottle Coffee")).not.toBeInTheDocument();
    expect(screen.queryByText("Uber")).not.toBeInTheDocument();
  });

  it("shows all when 'All accounts' selected", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<TransactionList initialTransactions={mockTransactions} accounts={mockAccounts} />);

    const select = screen.getByLabelText("Filter by account");
    await user.selectOptions(select, "la-2");
    expect(screen.queryByText("Blue Bottle Coffee")).not.toBeInTheDocument();

    await user.selectOptions(select, "");
    expect(screen.getByText("Blue Bottle Coffee")).toBeInTheDocument();
    expect(screen.getByText("PAYROLL")).toBeInTheDocument();
    expect(screen.getByText("Uber")).toBeInTheDocument();
  });

  it("filters by date range", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<TransactionList initialTransactions={mockTransactions} accounts={mockAccounts} />);

    await user.click(screen.getByRole("button", { name: "7 days" }));

    // tx-1 (2026-03-15) and tx-2 (2026-03-10) are within 7 days of 2026-03-16
    // tx-3 (2026-01-05) is not
    expect(screen.getByText("Blue Bottle Coffee")).toBeInTheDocument();
    expect(screen.getByText("PAYROLL")).toBeInTheDocument();
    expect(screen.queryByText("Uber")).not.toBeInTheDocument();
  });

  it("shows all when 'All' date range clicked", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<TransactionList initialTransactions={mockTransactions} accounts={mockAccounts} />);

    await user.click(screen.getByRole("button", { name: "7 days" }));
    expect(screen.queryByText("Uber")).not.toBeInTheDocument();

    // Date preset "All" is the first "All" button (toolbar renders before category filter)
    const allButtons = screen.getAllByRole("button", { name: "All" });
    await user.click(allButtons[0]!);
    expect(screen.getByText("Uber")).toBeInTheDocument();
  });

  it("applies combined filters (category + search)", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    // Add another food transaction
    const transactions = [
      ...mockTransactions,
      mockTransaction({
        id: "tx-4",
        transaction_id: "plaid-tx-4",
        name: "STARBUCKS",
        merchant_name: "Starbucks",
        app_category: "food",
      }),
    ];

    render(<TransactionList initialTransactions={transactions} accounts={mockAccounts} />);

    await user.click(screen.getByRole("button", { name: "Food & Drink" }));

    const input = screen.getByPlaceholderText("Search transactions...");
    await user.type(input, "star");

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText("Starbucks")).toBeInTheDocument();
    expect(screen.queryByText("Blue Bottle Coffee")).not.toBeInTheDocument();
    expect(screen.queryByText("PAYROLL")).not.toBeInTheDocument();
  });

  it("shows result count when filters are active", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<TransactionList initialTransactions={mockTransactions} accounts={mockAccounts} />);

    await user.click(screen.getByRole("button", { name: "Food & Drink" }));
    expect(screen.getByText("Showing 1 of 3 transactions")).toBeInTheDocument();
  });

  it("hides result count when no filters active", () => {
    render(<TransactionList initialTransactions={mockTransactions} accounts={mockAccounts} />);
    expect(screen.queryByText(/Showing \d+ of \d+ transactions/)).not.toBeInTheDocument();
  });

  it("clears all filters when 'Clear filters' clicked", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<TransactionList initialTransactions={mockTransactions} accounts={mockAccounts} />);

    // Apply filters that result in no matches
    await user.click(screen.getByRole("button", { name: "Shopping" }));
    expect(screen.getByText("No transactions match your filters.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Clear filters" }));

    expect(screen.getByText("Blue Bottle Coffee")).toBeInTheDocument();
    expect(screen.getByText("PAYROLL")).toBeInTheDocument();
    expect(screen.getByText("Uber")).toBeInTheDocument();
  });
});
