import { describe, expect, it, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
const mockLinkTokenCreate = vi.fn();
const mockIsPlaidConfigured = vi.fn();

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
    return { user: result.user, supabase: {}, errorResponse: null };
  },
}));

vi.mock("@/lib/plaid/client", () => ({
  isPlaidConfigured: () => mockIsPlaidConfigured(),
  getPlaidClient: () => ({
    linkTokenCreate: mockLinkTokenCreate,
  }),
}));

const { POST } = await import("../route");

function createRequest() {
  return new Request("http://localhost:3000/api/plaid/link-token", {
    method: "POST",
    headers: { Authorization: "Bearer test-token" },
  });
}

describe("POST /api/plaid/link-token", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    mockGetUser.mockReturnValue({ error: "Unauthorized" });
    const response = await POST(createRequest());
    expect(response.status).toBe(401);
  });

  it("returns 503 when Plaid is not configured", async () => {
    mockGetUser.mockReturnValue({ user: { id: "user-1" } });
    mockIsPlaidConfigured.mockReturnValue(false);
    const response = await POST(createRequest());
    expect(response.status).toBe(503);
    const data = await response.json();
    expect(data.error).toBe("Bank linking is not available");
  });

  it("returns link_token on success", async () => {
    mockGetUser.mockReturnValue({ user: { id: "user-1" } });
    mockIsPlaidConfigured.mockReturnValue(true);
    mockLinkTokenCreate.mockResolvedValue({
      data: { link_token: "link-sandbox-123" },
    });

    const response = await POST(createRequest());
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.link_token).toBe("link-sandbox-123");
  });

  it("returns 500 on Plaid error", async () => {
    mockGetUser.mockReturnValue({ user: { id: "user-1" } });
    mockIsPlaidConfigured.mockReturnValue(true);
    mockLinkTokenCreate.mockRejectedValue(new Error("Plaid error"));

    const response = await POST(createRequest());
    expect(response.status).toBe(500);
  });
});
