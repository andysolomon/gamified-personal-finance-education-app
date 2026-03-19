import { z } from "zod";

export const ageBandOptions = [
  { value: "under-18", label: "Under 18" },
  { value: "18-24", label: "18-24" },
  { value: "25-34", label: "25-34" },
  { value: "35-44", label: "35-44" },
  { value: "45-54", label: "45-54" },
  { value: "55-64", label: "55-64" },
  { value: "65-plus", label: "65+" },
] as const;

export const riskToleranceOptions = [
  { value: "conservative", label: "Conservative", description: "Prefer stability over growth" },
  { value: "moderate", label: "Moderate", description: "Balance between growth and stability" },
  { value: "aggressive", label: "Aggressive", description: "Maximize growth, accept higher risk" },
] as const;

export const financialGoalOptions = [
  "Build an emergency fund",
  "Pay off debt",
  "Save for retirement",
  "Invest in stocks",
  "Buy a home",
  "Start a business",
  "Save for education",
  "Build passive income",
] as const;

export const profileSchema = z.object({
  age_band: z.enum(["under-18", "18-24", "25-34", "35-44", "45-54", "55-64", "65-plus"], {
    message: "Please select your age range",
  }),
  financial_goals: z.array(z.string()).min(1, "Please select at least one financial goal"),
  risk_tolerance: z.enum(["conservative", "moderate", "aggressive"], {
    message: "Please select your risk tolerance",
  }),
});

export type ProfileInput = z.infer<typeof profileSchema>;
