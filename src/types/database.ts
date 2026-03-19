export type AgeBand = "under-18" | "18-24" | "25-34" | "35-44" | "45-54" | "55-64" | "65-plus";

export type RiskTolerance = "conservative" | "moderate" | "aggressive";

export interface Profile {
  id: string;
  age_band: AgeBand | null;
  financial_goals: string[];
  risk_tolerance: RiskTolerance | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

// Plaid types

export type PlaidItemStatus = "active" | "error" | "revoked";

export interface PlaidItem {
  id: string;
  user_id: string;
  access_token: string;
  item_id: string;
  institution_name: string | null;
  institution_id: string | null;
  cursor: string | null;
  status: PlaidItemStatus;
  error_code: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export type AccountType = "depository" | "credit" | "loan" | "investment" | "other";

export interface LinkedAccount {
  id: string;
  user_id: string;
  plaid_item_id: string;
  account_id: string;
  name: string | null;
  official_name: string | null;
  type: AccountType | null;
  subtype: string | null;
  mask: string | null;
  current_balance: number | null;
  available_balance: number | null;
  iso_currency_code: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  linked_account_id: string;
  transaction_id: string;
  amount: number;
  iso_currency_code: string;
  date: string;
  name: string | null;
  merchant_name: string | null;
  category_primary: string | null;
  category_detailed: string | null;
  pending: boolean;
  created_at: string;
}
