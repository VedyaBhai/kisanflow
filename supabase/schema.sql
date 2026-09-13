-- KISANFLOW Phase 2 schema
-- Run this in Supabase SQL Editor.
-- No DROP statements are used so it is safe to run on a fresh project.

create extension if not exists pgcrypto;

do $$ begin
  create type public.farmer_produce_status as enum ('AVAILABLE', 'RESERVED', 'ALLOCATED', 'SOLD', 'INACTIVE');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.demand_status as enum ('OPEN', 'MATCHING', 'PARTIALLY_FILLED', 'FULFILLED', 'CANCELLED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.lot_status as enum ('COLLECTING', 'READY_FOR_LOGISTICS', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED');
exception when duplicate_object then null; end $$;

create table if not exists public.farmers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  language text default 'en',
  state text default 'Telangana',
  district text,
  mandal text,
  village text,
  latitude double precision,
  longitude double precision,
  farm_area numeric(10,2),
  soil_type text,
  irrigation_type text,
  whatsapp_opt_in boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.farmer_produce (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid not null references public.farmers(id) on delete cascade,
  crop text not null,
  variety text,
  quantity_kg numeric(14,2) not null check (quantity_kg >= 0),
  quality_grade text,
  harvest_date date,
  available_from timestamptz,
  expected_price numeric(12,2),
  status public.farmer_produce_status not null default 'AVAILABLE',
  created_at timestamptz not null default now()
);

create table if not exists public.buyers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  buyer_type text,
  state text default 'Telangana',
  district text,
  location text,
  created_at timestamptz not null default now()
);

create table if not exists public.buyer_demands (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.buyers(id) on delete cascade,
  crop text not null,
  quantity_kg numeric(14,2) not null check (quantity_kg > 0),
  quality_grade text,
  destination text not null,
  latitude double precision,
  longitude double precision,
  required_date date,
  max_price_per_kg numeric(12,2),
  status public.demand_status not null default 'OPEN',
  created_at timestamptz not null default now()
);

create table if not exists public.virtual_lots (
  id uuid primary key default gen_random_uuid(),
  buyer_demand_id uuid not null unique references public.buyer_demands(id) on delete cascade,
  crop text not null,
  target_quantity_kg numeric(14,2) not null check (target_quantity_kg > 0),
  allocated_quantity_kg numeric(14,2) not null default 0 check (allocated_quantity_kg >= 0),
  remaining_quantity_kg numeric(14,2) generated always as (
    greatest(target_quantity_kg - allocated_quantity_kg, 0)
  ) stored,
  status public.lot_status not null default 'COLLECTING',
  created_at timestamptz not null default now()
);

create table if not exists public.lot_contributions (
  id uuid primary key default gen_random_uuid(),
  virtual_lot_id uuid not null references public.virtual_lots(id) on delete cascade,
  farmer_id uuid not null references public.farmers(id) on delete restrict,
  farmer_produce_id uuid references public.farmer_produce(id) on delete set null,
  quantity_kg numeric(14,2) not null check (quantity_kg > 0),
  accepted_price_per_kg numeric(12,2),
  status text not null default 'ACCEPTED',
  created_at timestamptz not null default now()
);

create table if not exists public.market_prices (
  id bigint generated always as identity primary key,
  date date not null,
  state text not null,
  district text,
  market text,
  commodity text not null,
  variety text,
  grade text,
  min_price numeric(12,2),
  max_price numeric(12,2),
  modal_price numeric(12,2),
  arrival_quantity numeric(14,2),
  source text not null default 'Government OGD / Agmarknet',
  created_at timestamptz not null default now(),
  unique(date, state, district, market, commodity, variety, grade)
);

create table if not exists public.weather (
  id bigint generated always as identity primary key,
  date date not null,
  district text not null,
  rainfall_mm numeric(10,2),
  temperature_c numeric(6,2),
  humidity numeric(6,2),
  source text not null default 'IMD',
  created_at timestamptz not null default now(),
  unique(date, district)
);

create table if not exists public.crop_production (
  id bigint generated always as identity primary key,
  year integer not null,
  district text not null,
  season text,
  crop text not null,
  area_hectares numeric(14,2),
  production_tonnes numeric(14,2),
  source text not null default 'Government of India OGD',
  created_at timestamptz not null default now(),
  unique(year, district, season, crop)
);

create table if not exists public.demand_forecasts (
  id bigint generated always as identity primary key,
  crop text not null,
  district text not null,
  forecast_date date not null,
  predicted_demand_kg numeric(14,2) not null,
  lower_bound_kg numeric(14,2),
  upper_bound_kg numeric(14,2),
  confidence numeric(5,2),
  model_version text not null,
  created_at timestamptz not null default now(),
  unique(crop, district, forecast_date, model_version)
);

create index if not exists idx_farmer_produce_crop_status on public.farmer_produce(crop, status);
create index if not exists idx_farmer_produce_farmer on public.farmer_produce(farmer_id);
create index if not exists idx_demands_crop_status on public.buyer_demands(crop, status);
create index if not exists idx_market_prices_lookup on public.market_prices(state, district, market, commodity, date);
create index if not exists idx_weather_lookup on public.weather(district, date);
create index if not exists idx_crop_production_lookup on public.crop_production(district, crop, year);
create index if not exists idx_forecast_lookup on public.demand_forecasts(crop, district, forecast_date);
create index if not exists idx_lot_contributions_lot on public.lot_contributions(virtual_lot_id);

-- For the initial development phase, disable anonymous writes by default.
-- We will add proper Auth/RLS policies once farmer/buyer login is wired.
alter table public.farmers enable row level security;
alter table public.farmer_produce enable row level security;
alter table public.buyers enable row level security;
alter table public.buyer_demands enable row level security;
alter table public.virtual_lots enable row level security;
alter table public.lot_contributions enable row level security;
alter table public.market_prices enable row level security;
alter table public.weather enable row level security;
alter table public.crop_production enable row level security;
alter table public.demand_forecasts enable row level security;

-- Public read policies for non-sensitive analytical data.
-- Policies are wrapped in DO blocks so this file can be re-run safely.

do $$ begin
  create policy "market_prices_public_read" on public.market_prices
    for select to anon, authenticated using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "weather_public_read" on public.weather
    for select to anon, authenticated using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "crop_production_public_read" on public.crop_production
    for select to anon, authenticated using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "demand_forecasts_public_read" on public.demand_forecasts
    for select to anon, authenticated using (true);
exception when duplicate_object then null; end $$;

-- Farmer/buyer/demand write policies are intentionally deferred until authentication
-- and role-based access are implemented. Do not expose them publicly.
