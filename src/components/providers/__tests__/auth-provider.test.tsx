import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AuthContext, type AuthContextValue } from "@/components/providers/auth-provider";

// We test the context contract rather than the full provider (which needs Supabase)
describe("AuthContext", () => {
  it("provides context values to children", () => {
    const mockValue: AuthContextValue = {
      user: null,
      profile: null,
      isLoading: false,
      signOut: vi.fn(),
      refreshProfile: vi.fn(),
    };

    function TestConsumer() {
      return (
        <AuthContext.Consumer>
          {(value) => <div>{value ? "has context" : "no context"}</div>}
        </AuthContext.Consumer>
      );
    }

    render(
      <AuthContext.Provider value={mockValue}>
        <TestConsumer />
      </AuthContext.Provider>,
    );

    expect(screen.getByText("has context")).toBeInTheDocument();
  });

  it("renders children", () => {
    const mockValue: AuthContextValue = {
      user: null,
      profile: null,
      isLoading: false,
      signOut: vi.fn(),
      refreshProfile: vi.fn(),
    };

    render(
      <AuthContext.Provider value={mockValue}>
        <div>child content</div>
      </AuthContext.Provider>,
    );

    expect(screen.getByText("child content")).toBeInTheDocument();
  });
});
