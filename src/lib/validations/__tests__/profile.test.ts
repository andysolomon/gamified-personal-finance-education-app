import { describe, expect, it } from "vitest";
import { profileSchema } from "@/lib/validations/profile";

describe("profileSchema", () => {
  it("accepts valid input", () => {
    const result = profileSchema.safeParse({
      age_band: "25-34",
      financial_goals: ["Build an emergency fund"],
      risk_tolerance: "moderate",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing age_band", () => {
    const result = profileSchema.safeParse({
      financial_goals: ["Save for retirement"],
      risk_tolerance: "moderate",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty financial_goals", () => {
    const result = profileSchema.safeParse({
      age_band: "25-34",
      financial_goals: [],
      risk_tolerance: "moderate",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing risk_tolerance", () => {
    const result = profileSchema.safeParse({
      age_band: "25-34",
      financial_goals: ["Pay off debt"],
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid age_band", () => {
    const result = profileSchema.safeParse({
      age_band: "invalid",
      financial_goals: ["Invest in stocks"],
      risk_tolerance: "moderate",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid risk_tolerance", () => {
    const result = profileSchema.safeParse({
      age_band: "18-24",
      financial_goals: ["Buy a home"],
      risk_tolerance: "invalid",
    });
    expect(result.success).toBe(false);
  });

  it("accepts multiple financial goals", () => {
    const result = profileSchema.safeParse({
      age_band: "35-44",
      financial_goals: ["Build an emergency fund", "Pay off debt", "Save for retirement"],
      risk_tolerance: "conservative",
    });
    expect(result.success).toBe(true);
  });
});
