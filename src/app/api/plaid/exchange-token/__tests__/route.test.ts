import { describe, expect, it, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
const mockItemPublicTokenExchange = vi.fn();
const mockIsPlaidConfigured = vi.fn();
const mockSyncTransactions = vi.fn();

vi.mock("@/lib/api/auth", () => ({
  getAuthenticatedUser: async (_req: Request) => {
    const result = mockGetUser();
    if (result.error) {
      const { NextResponse } = await import("next/server");
      return {
        user: null,
        supabase: null,
        errorResponse: NextResponse.json({ error: result.error }, { status: 401 }),
      };
    }
    return { user: result.user, supabase: result.supabase, errorResponse: null };
  },
}));

vi.mock("@/lib/plaid/client", () => ({
  isPlaidConfigured: () => mockIsPlaidConfigured(),
  getPlaidClient: () => ({
    itemPublicTokenExchange: mockItemPublicTokenExchange,
  }),
}));

vi.mock("@/lib/plaid/sync", () => ({
  syncTransactions: (...args: unknown[]) => mockSyncTransactions(...args),
}));

const { POST } = await import("../route");

const validBody = {
  public_token: "public-sandbox-123",
  metadata: {
    institution: { name: "Chase", institution_id: "ins_1" },
    accounts: [
      { id: "acct-1", name: "Checking", type: "depository", subtype: "checking", mask: "1234" },
    ],
  },
};

function createMockSupabase() {
  const mockSelectChain = vi.fn().mockReturnValue({
    eq: vi.fn().mockResolvedValue({
      data: [{ id: "la-1", name: "Checking", mask: "1234" }],
      error: null,
    }),
  });

  return {
    from: vi.fn((table: string) => {
      if (table === "plaid_items") {
        return {
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: "pi-1" },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === "linked_accounts") {
        return {
          insert: vi.fn().mockResolvedValue({ error: null }),
          select: mockSelectChain,
        };
      }
      return {};
    }),
  };
}

function createRequest(body: unknown = validBody) {
  return new Request("http://localhost:3000/api/plaid/exchange-token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer test-token",
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/plaid/exchange-token", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    mockGetUser.mockReturnValue({ error: "Unauthorized" });
    const response = await POST(createRequest());
    expect(response.status).toBe(401);
  });

  it("returns 503 when Plaid is not configured", async () => {
    mockGetUser.mockReturnValue({ user: { id: "user-1" }, supabase: {} });
    mockIsPlaidConfigured.mockReturnValue(false);
    const response = await POST(createRequest());
    expect(response.status).toBe(503);
  });

  it("returns 400 for invalid body", async () => {
    mockGetUser.mockReturnValue({ user: { id: "user-1" }, supabase: createMockSupabase() });
    mockIsPlaidConfigured.mockReturnValue(true);
    const response = await POST(createRequest({ invalid: true }));
    expect(response.status).toBe(400);
  });

  it("returns 200 with accounts on success", async () => {
    const mockSupabase = createMockSupabase();
    mockGetUser.mockReturnValue({ user: { id: "user-1" }, supabase: mockSupabase });
    mockIsPlaidConfigured.mockReturnValue(true);
    mockItemPublicTokenExchange.mockResolvedValue({
      data: { access_token: "access-123", item_id: "item-1" },
    });
    mockSyncTransactions.mockResolvedValue({ added: 5, modified: 0, removed: 0 });

    const response = await POST(createRequest());
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.accounts).toBeDefined();
  });

  it("returns 409 for duplicate institution", async () => {
    const mockSupabase = {
      from: vi.fn(() => ({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: "23505", message: "duplicate" },
            }),
          }),
        }),
      })),
    };

    mockGetUser.mockReturnValue({ user: { id: "user-1" }, supabase: mockSupabase });
    mockIsPlaidConfigured.mockReturnValue(true);
    mockItemPublicTokenExchange.mockResolvedValue({
      data: { access_token: "access-123", item_id: "item-1" },
    });

    const response = await POST(createRequest());
    expect(response.status).toBe(409);
  });

  it("returns 500 on Plaid error", async () => {
    const mockSupabase = createMockSupabase();
    mockGetUser.mockReturnValue({ user: { id: "user-1" }, supabase: mockSupabase });
    mockIsPlaidConfigured.mockReturnValue(true);
    mockItemPublicTokenExchange.mockRejectedValue(new Error("Plaid error"));

    const response = await POST(createRequest());
    expect(response.status).toBe(500);
  });
});
