-- Create a table for public.products
create table public.products (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  name text null,
  description text null,
  price real null,
  image_url text null,
  constraint products_pkey primary key (id)
);

-- Set up Row Level Security (RLS)
-- See https://supabase.com/docs/guides/auth/row-level-security for more details.
alter table public.products
  enable row level security;

create policy "Allow public read access" on public.products
  for select using (true);