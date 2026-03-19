import { describe, expect, it } from "vitest";
import type { AccountBase, Transaction as PlaidTransaction } from "plaid";

import { mapPlaidAccount, mapPlaidTransaction } from "../mappers";

describe("mapPlaidTransaction", () => {
  const baseTx = {
    transaction_id: "tx-123",
    account_id: "acct-1",
    amount: 42.5,
    iso_currency_code: "USD",
    date: "2026-03-15",
    name: "Coffee Shop",
    merchant_name: "Starbucks",
    pending: false,
    personal_finance_category: {
      primary: "FOOD_AND_DRINK",
      detailed: "FOOD_AND_DRINK_COFFEE",
      confidence_level: "HIGH" as const,
    },
  } as PlaidTransaction;

  it("maps all fields correctly", () => {
    const result = mapPlaidTransaction(baseTx, "user-1", "la-1");

    expect(result).toEqual({
      user_id: "user-1",
      linked_account_id: "la-1",
      transaction_id: "tx-123",
      amount: 42.5,
      iso_currency_code: "USD",
      date: "2026-03-15",
      name: "Coffee Shop",
      merchant_name: "Starbucks",
      category_primary: "FOOD_AND_DRINK",
      category_detailed: "FOOD_AND_DRINK_COFFEE",
      pending: false,
    });
  });

  it("handles null merchant_name", () => {
    const tx = { ...baseTx, merchant_name: null } as PlaidTransaction;
    const result = mapPlaidTransaction(tx, "user-1", "la-1");
    expect(result.merchant_name).toBeNull();
  });

  it("handles missing personal_finance_category", () => {
    const tx = { ...baseTx, personal_finance_category: undefined } as PlaidTransaction;
    const result = mapPlaidTransaction(tx, "user-1", "la-1");
    expect(result.category_primary).toBeNull();
    expect(result.category_detailed).toBeNull();
  });

  it("handles null iso_currency_code with USD default", () => {
    const tx = { ...baseTx, iso_currency_code: null } as PlaidTransaction;
    const result = mapPlaidTransaction(tx, "user-1", "la-1");
    expect(result.iso_currency_code).toBe("USD");
  });
});

describe("mapPlaidAccount", () => {
  const baseAccount = {
    account_id: "acct-1",
    name: "Checking",
    official_name: "Gold Checking",
    type: "depository",
    subtype: "checking",
    mask: "1234",
    balances: {
      current: 1000.5,
      available: 900.0,
      iso_currency_code: "USD",
      limit: null,
      unofficial_currency_code: null,
    },
  } as AccountBase;

  it("maps all fields correctly", () => {
    const result = mapPlaidAccount(baseAccount, "user-1", "pi-1");

    expect(result).toEqual({
      user_id: "user-1",
      plaid_item_id: "pi-1",
      account_id: "acct-1",
      name: "Checking",
      official_name: "Gold Checking",
      type: "depository",
      subtype: "checking",
      mask: "1234",
      current_balance: 1000.5,
      available_balance: 900.0,
      iso_currency_code: "USD",
    });
  });

  it("handles null balances", () => {
    const account = {
      ...baseAccount,
      balances: {
        current: null,
        available: null,
        iso_currency_code: null,
        limit: null,
        unofficial_currency_code: null,
      },
    } as AccountBase;
    const result = mapPlaidAccount(account, "user-1", "pi-1");
    expect(result.current_balance).toBeNull();
    expect(result.available_balance).toBeNull();
    expect(result.iso_currency_code).toBe("USD");
  });

  it("handles null optional fields", () => {
    const account = {
      ...baseAccount,
      official_name: null,
      mask: null,
    } as AccountBase;
    const result = mapPlaidAccount(account, "user-1", "pi-1");
    expect(result.official_name).toBeNull();
    expect(result.mask).toBeNull();
  });
});
