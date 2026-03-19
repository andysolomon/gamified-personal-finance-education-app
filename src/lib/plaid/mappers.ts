import type { AccountBase, Transaction as PlaidTransaction } from "plaid";

export function mapPlaidTransaction(
  tx: PlaidTransaction,
  userId: string,
  linkedAccountId: string,
) {
  return {
    user_id: userId,
    linked_account_id: linkedAccountId,
    transaction_id: tx.transaction_id,
    amount: tx.amount,
    iso_currency_code: tx.iso_currency_code ?? "USD",
    date: tx.date,
    name: tx.name ?? null,
    merchant_name: tx.merchant_name ?? null,
    category_primary: tx.personal_finance_category?.primary ?? null,
    category_detailed: tx.personal_finance_category?.detailed ?? null,
    pending: tx.pending,
  };
}

export function mapPlaidAccount(
  account: AccountBase,
  userId: string,
  plaidItemId: string,
) {
  return {
    user_id: userId,
    plaid_item_id: plaidItemId,
    account_id: account.account_id,
    name: account.name ?? null,
    official_name: account.official_name ?? null,
    type: account.type ?? null,
    subtype: account.subtype ?? null,
    mask: account.mask ?? null,
    current_balance: account.balances.current ?? null,
    available_balance: account.balances.available ?? null,
    iso_currency_code: account.balances.iso_currency_code ?? "USD",
  };
}
