-- Create plaid_items table for storing Plaid access tokens and item metadata
create table public.plaid_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  access_token text not null,
  item_id text unique not null,
  institution_name text,
  institution_id text,
  cursor text,
  status text not null default 'active' check (status in ('active', 'error', 'revoked')),
  error_code text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create linked_accounts table for bank accounts from Plaid
create table public.linked_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  plaid_item_id uuid references public.plaid_items on delete cascade not null,
  account_id text unique not null,
  name text,
  official_name text,
  type text check (type in ('depository', 'credit', 'loan', 'investment', 'other')),
  subtype text,
  mask text,
  current_balance numeric(14,2),
  available_balance numeric(14,2),
  iso_currency_code text default 'USD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create transactions table
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  linked_account_id uuid references public.linked_accounts on delete cascade not null,
  transaction_id text unique not null,
  amount numeric(14,2) not null,
  iso_currency_code text default 'USD',
  date date not null,
  name text,
  merchant_name text,
  category_primary text,
  category_detailed text,
  pending boolean default false,
  created_at timestamptz not null default now()
);

-- Enable RLS on all tables
alter table public.plaid_items enable row level security;
alter table public.linked_accounts enable row level security;
alter table public.transactions enable row level security;

-- RLS policies for plaid_items
create policy "Users can view own plaid items"
  on public.plaid_items for select
  using (auth.uid() = user_id);

create policy "Users can insert own plaid items"
  on public.plaid_items for insert
  with check (auth.uid() = user_id);

create policy "Users can update own plaid items"
  on public.plaid_items for update
  using (auth.uid() = user_id);

-- RLS policies for linked_accounts
create policy "Users can view own linked accounts"
  on public.linked_accounts for select
  using (auth.uid() = user_id);

create policy "Users can insert own linked accounts"
  on public.linked_accounts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own linked accounts"
  on public.linked_accounts for update
  using (auth.uid() = user_id);

-- RLS policies for transactions
create policy "Users can view own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own transactions"
  on public.transactions for update
  using (auth.uid() = user_id);

create policy "Users can delete own transactions"
  on public.transactions for delete
  using (auth.uid() = user_id);

-- Reuse handle_updated_at() trigger for plaid_items and linked_accounts
create trigger on_plaid_item_updated
  before update on public.plaid_items
  for each row execute function public.handle_updated_at();

create trigger on_linked_account_updated
  before update on public.linked_accounts
  for each row execute function public.handle_updated_at();

-- Indexes
create index idx_plaid_items_user_id on public.plaid_items(user_id);
create index idx_linked_accounts_user_id on public.linked_accounts(user_id);
create index idx_linked_accounts_plaid_item_id on public.linked_accounts(plaid_item_id);
create index idx_transactions_user_id on public.transactions(user_id);
create index idx_transactions_linked_account_id on public.transactions(linked_account_id);
create index idx_transactions_date on public.transactions(date);
