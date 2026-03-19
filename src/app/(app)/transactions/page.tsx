import { TransactionList } from "@/components/transactions/transaction-list";
import { getLinkedAccountsWithItems } from "@/lib/queries/linked-accounts";
import { getTransactions } from "@/lib/queries/transactions";
import { createClient } from "@/lib/supabase/server";

export default async function TransactionsPage() {
  const supabase = await createClient();

  let transactions: Awaited<ReturnType<typeof getTransactions>> = [];
  try {
    transactions = await getTransactions(supabase);
  } catch {
    // If the table doesn't exist yet or query fails, show empty state
  }

  let accounts: Awaited<ReturnType<typeof getLinkedAccountsWithItems>> = [];
  try {
    accounts = await getLinkedAccountsWithItems(supabase);
  } catch {
    // If accounts can't be fetched, toolbar will show empty dropdown
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Transactions</h1>
      <p className="text-muted-foreground mt-2">
        Your recent transactions across all accounts.
      </p>

      <div className="mt-6">
        <TransactionList initialTransactions={transactions} accounts={accounts} />
      </div>
    </div>
  );
}
