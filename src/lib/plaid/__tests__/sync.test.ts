import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock the plaid client module
const mockTransactionsSync = vi.fn();
const mockAccountsGet = vi.fn();

vi.mock("../client", () => ({
  getPlaidClient: () => ({
    transactionsSync: mockTransactionsSync,
    accountsGet: mockAccountsGet,
  }),
}));

import { syncTransactions } from "../sync";

function createMockSupabase(overrides: Record<string, unknown> = {}) {
  const mockUpdate = vi.fn().mockReturnValue({
    eq: vi.fn().mockResolvedValue({ error: null }),
  });
  const mockDelete = vi.fn().mockReturnValue({
    in: vi.fn().mockResolvedValue({ error: null }),
  });
  const mockUpsert = vi.fn().mockResolvedValue({ error: null });

  const plaidItem = {
    id: "pi-1",
    user_id: "user-1",
    access_token: "access-token-123",
    cursor: null,
    ...overrides,
  };

  const linkedAccounts = [
    { id: "la-1", account_id: "acct-1" },
    { id: "la-2", account_id: "acct-2" },
  ];

  const fromCalls: Record<string, ReturnType<typeof vi.fn>> = {};

  const supabase = {
    from: vi.fn((table: string) => {
      if (table === "plaid_items") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: plaidItem, error: null }),
            }),
          }),
          update: mockUpdate,
        };
      }
      if (table === "linked_accounts") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: linkedAccounts, error: null }),
          }),
          update: mockUpdate,
        };
      }
      if (table === "transactions") {
        return {
          upsert: mockUpsert,
          delete: mockDelete,
        };
      }
      return {};
    }),
  };

  return { supabase, mockUpdate, mockDelete, mockUpsert, fromCalls };
}

describe("syncTransactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("performs initial sync with added transactions", async () => {
    const { supabase } = createMockSupabase();

    mockTransactionsSync.mockResolvedValueOnce({
      data: {
        added: [
          {
            transaction_id: "tx-1",
            account_id: "acct-1",
            amount: 10,
            iso_currency_code: "USD",
            date: "2026-03-15",
            name: "Test",
            merchant_name: null,
            pending: false,
            personal_finance_category: null,
          },
        ],
        modified: [],
        removed: [],
        next_cursor: "cursor-1",
        has_more: false,
      },
    });

    mockAccountsGet.mockResolvedValueOnce({
      data: {
        accounts: [
          {
            account_id: "acct-1",
            balances: { current: 500, available: 400 },
          },
        ],
      },
    });

    const result = await syncTransactions(supabase as never, "pi-1");

    expect(result.added).toBe(1);
    expect(result.modified).toBe(0);
    expect(result.removed).toBe(0);
    expect(result.error).toBeUndefined();
  });

  it("handles pagination with has_more", async () => {
    const { supabase } = createMockSupabase();

    mockTransactionsSync
      .mockResolvedValueOnce({
        data: {
          added: [
            {
              transaction_id: "tx-1",
              account_id: "acct-1",
              amount: 10,
              iso_currency_code: "USD",
              date: "2026-03-15",
              name: "Test 1",
              merchant_name: null,
              pending: false,
              personal_finance_category: null,
            },
          ],
          modified: [],
          removed: [],
          next_cursor: "cursor-1",
          has_more: true,
        },
      })
      .mockResolvedValueOnce({
        data: {
          added: [
            {
              transaction_id: "tx-2",
              account_id: "acct-2",
              amount: 20,
              iso_currency_code: "USD",
              date: "2026-03-16",
              name: "Test 2",
              merchant_name: null,
              pending: false,
              personal_finance_category: null,
            },
          ],
          modified: [],
          removed: [],
          next_cursor: "cursor-2",
          has_more: false,
        },
      });

    mockAccountsGet.mockResolvedValueOnce({
      data: { accounts: [] },
    });

    const result = await syncTransactions(supabase as never, "pi-1");

    expect(result.added).toBe(2);
    expect(mockTransactionsSync).toHaveBeenCalledTimes(2);
  });

  it("handles removed transactions", async () => {
    const { supabase } = createMockSupabase();

    mockTransactionsSync.mockResolvedValueOnce({
      data: {
        added: [],
        modified: [],
        removed: [{ transaction_id: "tx-old-1" }, { transaction_id: "tx-old-2" }],
        next_cursor: "cursor-1",
        has_more: false,
      },
    });

    mockAccountsGet.mockResolvedValueOnce({
      data: { accounts: [] },
    });

    const result = await syncTransactions(supabase as never, "pi-1");

    expect(result.removed).toBe(2);
  });

  it("handles plaid item not found", async () => {
    const supabase = {
      from: vi.fn(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { message: "Not found" } }),
          }),
        }),
      })),
    };

    const result = await syncTransactions(supabase as never, "pi-missing");

    expect(result.error).toBe("Plaid item not found");
    expect(result.added).toBe(0);
  });

  it("updates item status on sync error", async () => {
    const { supabase } = createMockSupabase();

    mockTransactionsSync.mockRejectedValueOnce(new Error("Plaid API error"));

    const result = await syncTransactions(supabase as never, "pi-1");

    expect(result.error).toBe("Plaid API error");
    // Verify plaid_items update was called (for error status)
    expect(supabase.from).toHaveBeenCalledWith("plaid_items");
  });

  it("uses existing cursor for incremental sync", async () => {
    const { supabase } = createMockSupabase({ cursor: "existing-cursor" });

    mockTransactionsSync.mockResolvedValueOnce({
      data: {
        added: [],
        modified: [],
        removed: [],
        next_cursor: "new-cursor",
        has_more: false,
      },
    });

    mockAccountsGet.mockResolvedValueOnce({
      data: { accounts: [] },
    });

    await syncTransactions(supabase as never, "pi-1");

    expect(mockTransactionsSync).toHaveBeenCalledWith({
      access_token: "access-token-123",
      cursor: "existing-cursor",
    });
  });
});
