-- ───────────────────────────────────────────────────────────────
-- scrap_rates: managed by admin, read publicly on /rates page
-- ───────────────────────────────────────────────────────────────
create table if not exists public.scrap_rates (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,                          -- e.g. "Newspaper", "Iron"
  category    text not null,                          -- paper | plastic | metal | ewaste | appliances | glass | other
  unit        text not null default 'kg',             -- kg | piece | ton
  price       numeric(10,2) not null,                 -- e.g. 14.50
  city        text not null default 'Chennai',
  active      boolean not null default true,          -- only active items shown on website
  updated_at  timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

-- Enable RLS
alter table public.scrap_rates enable row level security;

-- Public read for active rates
create policy "Public can read active scrap rates"
  on public.scrap_rates for select
  using (active = true);

-- Index for fast city+active lookups
create index if not exists idx_scrap_rates_city_active on public.scrap_rates(city, active);

-- Seed sample rates for Chennai
insert into public.scrap_rates (name, category, unit, price, city) values
  ('Newspaper',           'paper',      'kg',    14.00, 'Chennai'),
  ('Cardboard / Box',     'paper',      'kg',    8.00,  'Chennai'),
  ('Books / Notebooks',   'paper',      'kg',    10.00, 'Chennai'),
  ('Hard Plastic',        'plastic',    'kg',    12.00, 'Chennai'),
  ('PET Bottles',         'plastic',    'kg',    8.00,  'Chennai'),
  ('Iron / Steel',        'metal',      'kg',    28.00, 'Chennai'),
  ('Copper Wire',         'metal',      'kg',    420.00,'Chennai'),
  ('Aluminium',           'metal',      'kg',    85.00, 'Chennai'),
  ('Brass',               'metal',      'kg',    240.00,'Chennai'),
  ('Mobile Phone',        'ewaste',     'piece', 150.00,'Chennai'),
  ('Laptop',              'ewaste',     'piece', 500.00,'Chennai'),
  ('PCB / Circuit Board', 'ewaste',     'kg',    120.00,'Chennai'),
  ('Washing Machine',     'appliances', 'piece', 800.00,'Chennai'),
  ('Refrigerator',        'appliances', 'piece', 600.00,'Chennai'),
  ('Air Conditioner',     'appliances', 'piece', 700.00,'Chennai'),
  ('Ceiling Fan',         'appliances', 'piece', 120.00,'Chennai'),
  ('Glass Bottles',       'glass',      'kg',    2.00,  'Chennai')
;

-- ───────────────────────────────────────────────────────────────
-- pickup_requests: submitted by website users
-- ───────────────────────────────────────────────────────────────
create table if not exists public.pickup_requests (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  phone         text not null,
  address       text not null,
  category      text not null,
  time_slot     text not null,
  date          date not null,
  notes         text,
  city          text not null default 'Chennai',
  -- status: PENDING | ASSIGNED | COMPLETED | CANCELLED
  status        text not null default 'PENDING'
                  check (status in ('PENDING','ASSIGNED','COMPLETED','CANCELLED')),
  -- partner assigned to this pickup
  partner_name  text,
  partner_phone text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.pickup_requests enable row level security;

-- Anyone can insert (submit pickup form — no login)
create policy "Anyone can submit pickup request"
  on public.pickup_requests for insert
  with check (true);

-- Admin reads/updates via service role — no extra policy needed

create index if not exists idx_pickup_requests_status
  on public.pickup_requests(status, created_at desc);

create index if not exists idx_pickup_requests_city
  on public.pickup_requests(city, created_at desc);

-- ───────────────────────────────────────────────────────────────
-- Auto-update updated_at on row change
-- ───────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_pickup_requests_updated_at
  before update on public.pickup_requests
  for each row execute function public.set_updated_at();

create trigger trg_scrap_rates_updated_at
  before update on public.scrap_rates
  for each row execute function public.set_updated_at();

-- ───────────────────────────────────────────────────────────────
-- Migration patch: add partner columns if table already exists
-- (safe to run multiple times)
-- ───────────────────────────────────────────────────────────────
do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public'
      and table_name='pickup_requests'
      and column_name='partner_name'
  ) then
    alter table public.pickup_requests add column partner_name text;
    alter table public.pickup_requests add column partner_phone text;
  end if;
end $$;
