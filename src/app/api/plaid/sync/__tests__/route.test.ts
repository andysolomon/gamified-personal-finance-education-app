import { describe, expect, it, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
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
}));

vi.mock("@/lib/plaid/sync", () => ({
  syncTransactions: (...args: unknown[]) => mockSyncTransactions(...args),
}));

const { POST } = await import("../route");

const validPlaidItemId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

function createRequest(body: unknown = { plaid_item_id: validPlaidItemId }) {
  return new Request("http://localhost:3000/api/plaid/sync", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer test-token",
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/plaid/sync", () => {
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

  it("returns 400 for missing plaid_item_id", async () => {
    mockGetUser.mockReturnValue({ user: { id: "user-1" }, supabase: {} });
    mockIsPlaidConfigured.mockReturnValue(true);
    const response = await POST(createRequest({}));
    expect(response.status).toBe(400);
  });

  it("returns 400 for non-UUID plaid_item_id", async () => {
    mockGetUser.mockReturnValue({ user: { id: "user-1" }, supabase: {} });
    mockIsPlaidConfigured.mockReturnValue(true);
    const response = await POST(createRequest({ plaid_item_id: "not-a-uuid" }));
    expect(response.status).toBe(400);
  });

  it("returns 404 when syncTransactions returns 'not found' error", async () => {
    mockGetUser.mockReturnValue({ user: { id: "user-1" }, supabase: {} });
    mockIsPlaidConfigured.mockReturnValue(true);
    mockSyncTransactions.mockResolvedValue({
      added: 0,
      modified: 0,
      removed: 0,
      error: "Plaid item not found",
    });

    const response = await POST(createRequest());
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe("Plaid item not found");
  });

  it("returns 500 when syncTransactions returns other error", async () => {
    mockGetUser.mockReturnValue({ user: { id: "user-1" }, supabase: {} });
    mockIsPlaidConfigured.mockReturnValue(true);
    mockSyncTransactions.mockResolvedValue({
      added: 0,
      modified: 0,
      removed: 0,
      error: "Unknown sync error",
    });

    const response = await POST(createRequest());
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe("Unknown sync error");
  });

  it("returns 200 with SyncResult on success", async () => {
    mockGetUser.mockReturnValue({ user: { id: "user-1" }, supabase: {} });
    mockIsPlaidConfigured.mockReturnValue(true);
    mockSyncTransactions.mockResolvedValue({
      added: 5,
      modified: 2,
      removed: 1,
    });

    const response = await POST(createRequest());
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ added: 5, modified: 2, removed: 1 });
  });
});
