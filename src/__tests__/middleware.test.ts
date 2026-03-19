import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";

// Mock the middleware module
const mockGetUser = vi.fn();

vi.mock("@/lib/supabase/middleware", () => ({
  updateSession: vi.fn().mockImplementation(async (request: NextRequest) => {
    const user = mockGetUser();
    return {
      user,
      supabaseResponse: NextResponse.next({ request }),
    };
  }),
}));

// Import after mocking
const { middleware } = await import("@/middleware");

function createRequest(path: string) {
  return new NextRequest(new URL(path, "http://localhost:3000"));
}

describe("middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects unauthenticated user from /dashboard to /login", async () => {
    mockGetUser.mockReturnValue(null);
    const response = await middleware(createRequest("/dashboard"));
    expect(response.status).toBe(307);
    expect(new URL(response.headers.get("location")!).pathname).toBe("/login");
    expect(new URL(response.headers.get("location")!).searchParams.get("returnUrl")).toBe(
      "/dashboard",
    );
  });

  it("allows unauthenticated user to access /login", async () => {
    mockGetUser.mockReturnValue(null);
    const response = await middleware(createRequest("/login"));
    expect(response.status).not.toBe(307);
  });

  it("redirects authenticated user from /login to /dashboard", async () => {
    mockGetUser.mockReturnValue({ id: "123", email: "test@example.com" });
    const response = await middleware(createRequest("/login"));
    expect(response.status).toBe(307);
    expect(new URL(response.headers.get("location")!).pathname).toBe("/dashboard");
  });

  it("allows authenticated user to access /dashboard", async () => {
    mockGetUser.mockReturnValue({ id: "123", email: "test@example.com" });
    const response = await middleware(createRequest("/dashboard"));
    expect(response.status).not.toBe(307);
  });

  it("redirects unauthenticated user from /onboarding to /login", async () => {
    mockGetUser.mockReturnValue(null);
    const response = await middleware(createRequest("/onboarding"));
    expect(response.status).toBe(307);
    expect(new URL(response.headers.get("location")!).pathname).toBe("/login");
  });

  it("allows authenticated user to access /onboarding", async () => {
    mockGetUser.mockReturnValue({ id: "123", email: "test@example.com" });
    const response = await middleware(createRequest("/onboarding"));
    expect(response.status).not.toBe(307);
  });
});
