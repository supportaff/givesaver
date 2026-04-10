-- GiveSaver Production Schema
-- Run this in your Supabase SQL editor

-- ─── EXTENSIONS ────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── DONATIONS TABLE ───────────────────────────────────────────
create table if not exists public.donations (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  description text,
  quantity    text not null,
  category    text not null check (category in ('FOOD','CLOTHES','BOOKS')),
  item_type   text not null,
  expires_at  text,
  status      text not null default 'AVAILABLE' check (status in ('AVAILABLE','CLAIMED','COLLECTED')),
  address     text not null,
  city        text not null default 'Chennai',
  donor_name  text not null,
  donor_type  text not null check (donor_type in ('Individual','Business','NGO','Institution')),
  phone       text not null,
  photo_url   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger donations_updated_at
  before update on public.donations
  for each row execute function public.set_updated_at();

-- ─── NGO REGISTRATIONS TABLE ───────────────────────────────────
create table if not exists public.ngo_registrations (
  id               uuid primary key default uuid_generate_v4(),
  org_name         text not null,
  reg_number       text not null,
  year_established integer not null,
  focus_area       text not null,
  operating_area   text not null,
  address          text not null,
  website          text,
  receiver_name    text not null,
  designation      text not null,
  whatsapp         text not null,
  alternate_phone  text,
  email            text not null,
  id_type          text not null,
  id_number        text not null,
  status           text not null default 'PENDING' check (status in ('PENDING','APPROVED','REJECTED')),
  created_at       timestamptz not null default now()
);

-- ─── ROW LEVEL SECURITY ────────────────────────────────────────
alter table public.donations         enable row level security;
alter table public.ngo_registrations enable row level security;

create policy "Public read donations"
  on public.donations for select using (true);

create policy "Anyone can post donation"
  on public.donations for insert with check (true);

create policy "Anyone can update donation status"
  on public.donations for update using (true);

create policy "Anyone can register NGO"
  on public.ngo_registrations for insert with check (true);

create policy "Service role reads NGO registrations"
  on public.ngo_registrations for select
  using (auth.role() = 'service_role');

-- ─── STORAGE BUCKET ──────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('donation-photos', 'donation-photos', true)
on conflict (id) do nothing;

create policy "Anyone can upload donation photos"
  on storage.objects for insert
  with check (bucket_id = 'donation-photos');

create policy "Public read donation photos"
  on storage.objects for select
  using (bucket_id = 'donation-photos');
