import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

const mockOpen = vi.fn();
const mockUsePlaidLink = vi.fn();

vi.mock("react-plaid-link", () => ({
  usePlaidLink: (...args: unknown[]) => mockUsePlaidLink(...args),
}));

import { PlaidLinkButton } from "../plaid-link-button";

describe("PlaidLinkButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePlaidLink.mockReturnValue({ open: mockOpen, ready: false });
    global.fetch = vi.fn();
  });

  it("renders the button", () => {
    render(<PlaidLinkButton />);
    expect(screen.getByText("Link Bank Account")).toBeInTheDocument();
  });

  it("renders custom children", () => {
    render(<PlaidLinkButton>Connect Bank</PlaidLinkButton>);
    expect(screen.getByText("Connect Bank")).toBeInTheDocument();
  });

  it("fetches link token on click", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ link_token: "link-sandbox-123" }),
    });

    render(<PlaidLinkButton />);
    fireEvent.click(screen.getByText("Link Bank Account"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/plaid/link-token",
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  it("shows error on 503 (Plaid not configured)", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: async () => ({ error: "Bank linking is not available" }),
    });

    render(<PlaidLinkButton />);
    fireEvent.click(screen.getByText("Link Bank Account"));

    await waitFor(() => {
      expect(screen.getByText("Bank linking coming soon")).toBeInTheDocument();
    });
  });

  it("shows error on fetch failure", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("Network error"),
    );

    render(<PlaidLinkButton />);
    fireEvent.click(screen.getByText("Link Bank Account"));

    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });
  });

  it("calls onExit when Plaid Link exits", () => {
    const onExit = vi.fn();
    let capturedOnExit: () => void;

    mockUsePlaidLink.mockImplementation((config: { onExit: () => void }) => {
      capturedOnExit = config.onExit;
      return { open: mockOpen, ready: false };
    });

    render(<PlaidLinkButton onExit={onExit} />);

    // Simulate Plaid Link exit
    capturedOnExit!();
    expect(onExit).toHaveBeenCalled();
  });
});
