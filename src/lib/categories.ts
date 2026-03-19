export type AppCategory =
  | "food"
  | "transport"
  | "entertainment"
  | "shopping"
  | "housing"
  | "health"
  | "travel"
  | "services"
  | "income"
  | "transfers";

export const APP_CATEGORIES: readonly AppCategory[] = [
  "food",
  "transport",
  "entertainment",
  "shopping",
  "housing",
  "health",
  "travel",
  "services",
  "income",
  "transfers",
] as const;

export const CATEGORY_MAP: Record<string, AppCategory> = {
  FOOD_AND_DRINK: "food",
  TRANSPORTATION: "transport",
  ENTERTAINMENT: "entertainment",
  GENERAL_MERCHANDISE: "shopping",
  RENT_AND_UTILITIES: "housing",
  HOME_IMPROVEMENT: "housing",
  MEDICAL: "health",
  PERSONAL_CARE: "health",
  TRAVEL: "travel",
  GENERAL_SERVICES: "services",
  GOVERNMENT_AND_NON_PROFIT: "services",
  INCOME: "income",
  TRANSFER_IN: "transfers",
  TRANSFER_OUT: "transfers",
  LOAN_PAYMENTS: "transfers",
  BANK_FEES: "transfers",
};

export function getAppCategory(plaidPrimary: string | null): AppCategory | null {
  if (plaidPrimary === null) return null;
  return CATEGORY_MAP[plaidPrimary] ?? "services";
}

export const CATEGORY_META: Record<AppCategory, { label: string; icon: string; color: string }> = {
  food: { label: "Food & Drink", icon: "utensils", color: "text-orange-500" },
  transport: { label: "Transportation", icon: "car", color: "text-blue-500" },
  entertainment: { label: "Entertainment", icon: "film", color: "text-purple-500" },
  shopping: { label: "Shopping", icon: "shopping-bag", color: "text-pink-500" },
  housing: { label: "Housing", icon: "home", color: "text-teal-500" },
  health: { label: "Health & Wellness", icon: "heart-pulse", color: "text-red-500" },
  travel: { label: "Travel", icon: "plane", color: "text-sky-500" },
  services: { label: "Services & Fees", icon: "briefcase", color: "text-gray-500" },
  income: { label: "Income", icon: "wallet", color: "text-green-500" },
  transfers: { label: "Transfers & Payments", icon: "arrow-left-right", color: "text-slate-500" },
};

export function getSubcategory(plaidDetailed: string | null): string | null {
  if (plaidDetailed === null) return null;

  // Find the matching primary prefix and strip it
  for (const primary of Object.keys(CATEGORY_MAP)) {
    if (plaidDetailed.startsWith(primary + "_")) {
      return plaidDetailed
        .slice(primary.length + 1)
        .toLowerCase()
        .replace(/_/g, " ");
    }
  }

  return null;
}
