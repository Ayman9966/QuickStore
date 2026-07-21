-- Create stores table
create table public.stores (
  id uuid default gen_random_uuid() primary key,
  store_id text unique not null,
  username text unique not null,
  password text not null,
  store_name text not null,
  whatsapp_number text,
  business_type text,
  language text,
  is_subscribed boolean default false,
  subscription_end_date timestamp with time zone,
  registered_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_active_at timestamp with time zone default timezone('utc'::text, now()) not null,
  settings jsonb default '{}'::jsonb,
  products jsonb default '[]'::jsonb,
  user_id uuid references auth.users
);

-- Enable RLS
alter table public.stores enable row level security;

-- Create policies (for simplicity during migration, allow all for now)
create policy "Allow all access" on public.stores for all using (true);
