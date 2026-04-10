-- GiveSaver Database Schema
-- Run this in your Supabase SQL editor: https://supabase.com/dashboard/project/fwfpaposaqvccuenjjek/sql

-- ─── EXTENSIONS ────────────────────────────────────────────────
extension if not exists "uuid-ossp";

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
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-update updated_at
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

-- Donations: anyone can read available ones
create policy "Public read donations"
  on public.donations for select
  using (true);

-- Donations: anyone (anon) can insert
create policy "Anyone can post donation"
  on public.donations for insert
  with check (true);

-- NGO registrations: insert open, read restricted to service role
create policy "Anyone can register NGO"
  on public.ngo_registrations for insert
  with check (true);

create policy "Service role reads NGO registrations"
  on public.ngo_registrations for select
  using (auth.role() = 'service_role');

-- ─── SEED SAMPLE DONATIONS ─────────────────────────────────────
insert into public.donations (title, description, quantity, category, item_type, expires_at, status, address, city, donor_name, donor_type, phone) values
  ('Fresh Vegetable Bundle', 'Assorted seasonal vegetables — tomatoes, brinjals, spinach, curry leaves.', '5 kg', 'FOOD', 'Vegetables', 'Expires in 2 days', 'AVAILABLE', '12 Anna Nagar', 'Chennai', 'Priya Rajan', 'Individual', '+91 98400 12345'),
  ('Cooked Biryani – 30 Portions', 'Event leftovers from a wedding function. Freshly cooked, packed in sealed containers.', '30 portions', 'FOOD', 'Cooked Food', 'Expires in 6 hours', 'AVAILABLE', '45 T Nagar', 'Chennai', 'Star Catering Co.', 'Business', '+91 98401 55678'),
  ('Surplus Mangoes & Bananas', 'Fresh farm produce collected this morning. Perfectly ripe and ready to eat.', '8 kg', 'FOOD', 'Fruits', 'Expires in 3 days', 'AVAILABLE', '10 Chromepet', 'Chennai', 'Green Farms', 'Business', '+91 98402 77890'),
  ('Basmati Rice – 10 kg', 'Unopened premium basmati rice pack. Best before Dec 2026.', '10 kg', 'FOOD', 'Grains & Pulses', 'Best before: Dec 2026', 'CLAIMED', '22 Velachery', 'Chennai', 'Ramesh Kumar', 'Individual', '+91 98403 11234'),
  ('Bakery Surplus – Bread & Buns', 'End-of-day surplus from our bakery. Fresh bread loaves, dinner rolls, cream buns.', '40 pieces', 'FOOD', 'Bakery', 'Expires today', 'AVAILABLE', '7 Mylapore', 'Chennai', 'Daily Bread Bakery', 'Business', '+91 98404 33456'),
  ('Men''s Winter Jackets', 'Gently used warm jackets, sizes M to XL. Washed and dry-cleaned.', '8 pieces', 'CLOTHES', 'Winter Wear', null, 'AVAILABLE', '78 Adyar', 'Chennai', 'Meena Sundar', 'Individual', '+91 98405 44567'),
  ('Children''s School Uniforms', 'Clean school uniforms for kids aged 6–12. Various sizes.', '15 sets', 'CLOTHES', 'Children''s Wear', null, 'AVAILABLE', '9 Mylapore', 'Chennai', 'Helping Hand Trust', 'NGO', '+91 98406 55678'),
  ('Women''s Sarees & Salwars', 'Traditional sarees and salwar sets in good condition.', '20 pieces', 'CLOTHES', 'Women''s Wear', null, 'COLLECTED', '5 Nungambakkam', 'Chennai', 'Anitha Krishnan', 'Individual', '+91 98407 66789'),
  ('CBSE Textbooks – Class 6 to 10', 'Lightly used CBSE textbooks. Great condition, no torn pages.', '30 books', 'BOOKS', 'Textbooks', null, 'AVAILABLE', '18 Kilpauk', 'Chennai', 'Suresh Babu', 'Individual', '+91 98410 99012'),
  ('English Novels & Story Books', 'Collection of fiction novels. Authors include R.K. Narayan, Ruskin Bond.', '15 books', 'BOOKS', 'Story Books', null, 'AVAILABLE', '33 Besant Nagar', 'Chennai', 'Lakshmi Priya', 'Individual', '+91 98411 10123'),
  ('UPSC & TNPSC Exam Books', 'Reference books and previous year papers for government exams.', '12 books', 'BOOKS', 'Reference Books', null, 'CLAIMED', '67 Tambaram', 'Chennai', 'Vijay Mohan', 'Individual', '+91 98412 21234'),
  ('Children''s Activity & Colouring Books', 'Colouring books and learning workbooks for ages 3–8.', '20 books', 'BOOKS', 'Children Books', null, 'AVAILABLE', '55 Anna Nagar West', 'Chennai', 'Bright Minds School', 'Institution', '+91 98413 32345');
