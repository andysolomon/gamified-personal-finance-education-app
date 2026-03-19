import { describe, expect, it, vi, afterEach } from "vitest";

import { getDateCutoff } from "../date-utils";

describe("getDateCutoff", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns null for "all" preset', () => {
    expect(getDateCutoff("all")).toBeNull();
  });

  it("returns correct cutoff for 7 days", () => {
    vi.setSystemTime(new Date("2026-03-15T12:00:00Z"));
    expect(getDateCutoff("7")).toBe("2026-03-08");
  });

  it("returns correct cutoff for 30 days", () => {
    vi.setSystemTime(new Date("2026-03-15T12:00:00Z"));
    expect(getDateCutoff("30")).toBe("2026-02-13");
  });

  it("returns correct cutoff for 90 days", () => {
    vi.setSystemTime(new Date("2026-03-15T12:00:00Z"));
    expect(getDateCutoff("90")).toBe("2025-12-15");
  });
});
