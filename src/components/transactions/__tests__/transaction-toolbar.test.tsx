import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TransactionToolbar } from "../transaction-toolbar";

const defaultProps = {
  searchQuery: "",
  onSearchChange: vi.fn(),
  accountId: null,
  onAccountChange: vi.fn(),
  accounts: [
    { id: "acc-1", name: "Checking", mask: "1234" },
    { id: "acc-2", name: "Savings", mask: "5678" },
  ],
  dateRange: "all" as const,
  onDateRangeChange: vi.fn(),
};

describe("TransactionToolbar", () => {
  it("renders search input", () => {
    render(<TransactionToolbar {...defaultProps} />);
    expect(screen.getByPlaceholderText("Search transactions...")).toBeInTheDocument();
  });

  it("renders account dropdown with options", () => {
    render(<TransactionToolbar {...defaultProps} />);
    const select = screen.getByLabelText("Filter by account");
    expect(select).toBeInTheDocument();
    expect(screen.getByText("All accounts")).toBeInTheDocument();
    expect(screen.getByText("Checking (****1234)")).toBeInTheDocument();
    expect(screen.getByText("Savings (****5678)")).toBeInTheDocument();
  });

  it("renders date preset buttons", () => {
    render(<TransactionToolbar {...defaultProps} />);
    expect(screen.getByRole("button", { name: "7 days" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "30 days" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "90 days" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
  });

  it("calls onSearchChange when typing", async () => {
    const onSearchChange = vi.fn();
    render(<TransactionToolbar {...defaultProps} onSearchChange={onSearchChange} />);
    const input = screen.getByPlaceholderText("Search transactions...");
    await userEvent.setup().type(input, "coffee");
    expect(onSearchChange).toHaveBeenCalled();
  });

  it("calls onAccountChange when selecting account", async () => {
    const onAccountChange = vi.fn();
    render(<TransactionToolbar {...defaultProps} onAccountChange={onAccountChange} />);
    const select = screen.getByLabelText("Filter by account");
    await userEvent.setup().selectOptions(select, "acc-1");
    expect(onAccountChange).toHaveBeenCalledWith("acc-1");
  });

  it("calls onDateRangeChange when clicking preset", async () => {
    const onDateRangeChange = vi.fn();
    render(<TransactionToolbar {...defaultProps} onDateRangeChange={onDateRangeChange} />);
    await userEvent.setup().click(screen.getByRole("button", { name: "7 days" }));
    expect(onDateRangeChange).toHaveBeenCalledWith("7");
  });
});
