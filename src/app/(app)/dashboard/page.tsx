import { LinkedAccountsList } from "@/components/dashboard/linked-accounts-list";
import { getLinkedAccountsWithItems } from "@/lib/queries/linked-accounts";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const plaidEnabled = process.env.NEXT_PUBLIC_PLAID_ENABLED === "true";

  let accounts: Awaited<ReturnType<typeof getLinkedAccountsWithItems>> = [];
  try {
    accounts = await getLinkedAccountsWithItems(supabase);
  } catch {
    // If the table doesn't exist yet or query fails, show empty state
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground mt-2">Your financial overview at a glance.</p>

      <div className="mt-6">
        <LinkedAccountsList
          initialAccounts={accounts}
          plaidEnabled={plaidEnabled}
        />
      </div>
    </div>
  );
}
