import { describe, expect, it } from "vitest";
import { formatCurrency } from "@/lib/format";

describe("formatCurrency", () => {
  it("formats USD by default", () => {
    expect(formatCurrency(1234.56)).toBe("$1,234.56");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });

  it("formats negative amounts", () => {
    expect(formatCurrency(-42.5)).toBe("-$42.50");
  });

  it("formats with explicit currency", () => {
    expect(formatCurrency(1000, "USD")).toBe("$1,000.00");
  });

  it("rounds to two decimal places", () => {
    expect(formatCurrency(10.999)).toBe("$11.00");
  });
});
