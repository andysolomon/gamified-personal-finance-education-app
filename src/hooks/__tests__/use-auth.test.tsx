import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useAuth } from "@/hooks/use-auth";
import { AuthContext, type AuthContextValue } from "@/components/providers/auth-provider";

function createWrapper(value: AuthContextValue) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
  };
}

describe("useAuth", () => {
  it("throws when used outside AuthProvider", () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      "useAuth must be used within an AuthProvider",
    );
  });

  it("returns context value when inside AuthProvider", () => {
    const mockValue: AuthContextValue = {
      user: null,
      profile: null,
      isLoading: false,
      signOut: async () => {},
      refreshProfile: async () => {},
    };

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(mockValue),
    });

    expect(result.current.user).toBeNull();
    expect(result.current.profile).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it("returns user when authenticated", () => {
    const mockUser = { id: "123", email: "test@example.com" } as AuthContextValue["user"];
    const mockValue: AuthContextValue = {
      user: mockUser,
      profile: null,
      isLoading: false,
      signOut: async () => {},
      refreshProfile: async () => {},
    };

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(mockValue),
    });

    expect(result.current.user).toBe(mockUser);
  });
});
