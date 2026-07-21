-- Create stores table
create table public.stores (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  user_id uuid references auth.users not null
);

-- Enable RLS
alter table public.stores enable row level security;

-- Create policies
create policy "Users can view their own stores." on public.stores
  for select using (auth.uid() = user_id);

create policy "Users can insert their own stores." on public.stores
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own stores." on public.stores
  for update using (auth.uid() = user_id);

create policy "Users can delete their own stores." on public.stores
  for delete using (auth.uid() = user_id);
