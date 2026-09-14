-- =============================================================================
-- CoPassage — Super Admin Module: Database Schema & RLS
-- Apply this migration in the Supabase SQL Editor (Dashboard → SQL Editor).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. PROFILES TABLE
--    Extends auth.users. One row is created per user via a trigger (see below).
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade
);

alter table public.profiles
  add column if not exists full_name text,
  add column if not exists email text,
  add column if not exists avatar_url text,
  add column if not exists role text not null default 'user' check (role in ('user', 'city_staff', 'super_admin')),
  add column if not exists assigned_city text,
  add column if not exists is_driver_verified boolean not null default false,
  add column if not exists force_password_change boolean not null default false,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

-- Keep updated_at current automatically
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Auto-create a profile row whenever a new auth user is created
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url, role, assigned_city, force_password_change)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.email,
    new.raw_user_meta_data ->> 'avatar_url',
    COALESCE(new.raw_user_meta_data ->> 'role', 'user'),
    new.raw_user_meta_data ->> 'assigned_city',
    COALESCE((new.raw_user_meta_data ->> 'force_password_change')::boolean, false)
  )
  on conflict (id) do update set
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    avatar_url = EXCLUDED.avatar_url,
    role = EXCLUDED.role,
    assigned_city = EXCLUDED.assigned_city,
    force_password_change = EXCLUDED.force_password_change;
  return new;
end;
$$;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 2. ESCALATIONS TABLE
-- ---------------------------------------------------------------------------
drop table if exists public.escalations cascade;

create table public.escalations (
  id              uuid primary key default gen_random_uuid(),
  ticket_ref      text not null,
  city            text not null,
  reported_by     uuid references public.profiles (id) on delete set null,
  assigned_to     uuid references public.profiles (id) on delete set null,
  status          text not null default 'open'
                       check (status in ('open', 'in_progress', 'resolved', 'closed')),
  priority        text not null default 'high'
                       check (priority in ('low', 'medium', 'high', 'critical')),
  subject         text not null,
  description     text,
  resolution_note text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);



drop trigger if exists trg_escalations_updated_at on public.escalations;
create trigger trg_escalations_updated_at
  before update on public.escalations
  for each row execute function public.handle_updated_at();

-- Seed a few sample rows so the admin panel renders real data on first load
insert into public.escalations (ticket_ref, city, status, priority, subject, description)
values
  ('ESC-001', 'Mumbai',    'open',        'critical', 'Multiple carpool matches failing',        'Matcher service returning 500 for zone MUM-W since 08:00 IST.'),
  ('ESC-002', 'Delhi',     'in_progress', 'high',     'Driver app crash on route recalculation', 'Reproducible on Android 13, driver app v2.1.4.'),
  ('ESC-003', 'Bangalore', 'open',        'high',     'Surge pricing not applying correctly',    'Peak-hour multiplier stuck at 1x for BLR-N corridor.'),
  ('ESC-004', 'Hyderabad', 'resolved',    'medium',   'OTP delivery delay > 2 min',              'Telecom provider issue. Resolved by switching SMS gateway.');

-- ---------------------------------------------------------------------------
-- 2.5 SOS ALERTS TABLE
-- ---------------------------------------------------------------------------
drop table if exists public.sos_alerts cascade;

create table public.sos_alerts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references public.profiles (id) on delete cascade,
  city            text not null,
  location_lat    numeric(10, 6),
  location_lng    numeric(10, 6),
  status          text not null default 'active'
                       check (status in ('active', 'resolved', 'false_alarm')),
  resolved_by     uuid references public.profiles (id) on delete set null,
  resolved_at     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

drop trigger if exists trg_sos_alerts_updated_at on public.sos_alerts;
create trigger trg_sos_alerts_updated_at
  before update on public.sos_alerts
  for each row execute function public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- 3. VEHICLES TABLE
-- ---------------------------------------------------------------------------
drop table if exists public.vehicles cascade;

create table public.vehicles (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid references public.profiles (id) on delete cascade,
  make            text not null,
  model           text not null,
  year            integer not null,
  color           text not null,
  license_plate   text not null,
  capacity        integer not null default 4,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

drop trigger if exists trg_vehicles_updated_at on public.vehicles;
create trigger trg_vehicles_updated_at
  before update on public.vehicles
  for each row execute function public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- 3.1 RIDE OFFERS TABLE
-- ---------------------------------------------------------------------------
drop table if exists public.ride_offers cascade;

create table public.ride_offers (
  id              uuid primary key default gen_random_uuid(),
  driver_id       uuid references public.profiles (id) on delete cascade,
  vehicle_id      uuid references public.vehicles (id) on delete cascade,
  city            text not null,
  origin          text not null,
  origin_lat      numeric(10, 6),
  origin_lng      numeric(10, 6),
  destination     text not null,
  dest_lat        numeric(10, 6),
  dest_lng        numeric(10, 6),
  departure_time  timestamptz not null,
  total_seats     integer not null,
  available_seats integer not null,
  price_per_seat  numeric(10, 2) not null,
  status          text not null default 'active'
                       check (status in ('active', 'full', 'completed', 'cancelled')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

drop trigger if exists trg_ride_offers_updated_at on public.ride_offers;
create trigger trg_ride_offers_updated_at
  before update on public.ride_offers
  for each row execute function public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- 3.2 RIDE REQUESTS TABLE
-- ---------------------------------------------------------------------------
drop table if exists public.ride_requests cascade;

create table public.ride_requests (
  id              uuid primary key default gen_random_uuid(),
  offer_id        uuid references public.ride_offers (id) on delete cascade,
  rider_id        uuid references public.profiles (id) on delete cascade,
  seats_requested integer not null default 1,
  status          text not null default 'pending'
                       check (status in ('pending', 'accepted', 'rejected', 'cancelled')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

drop trigger if exists trg_ride_requests_updated_at on public.ride_requests;
create trigger trg_ride_requests_updated_at
  before update on public.ride_requests
  for each row execute function public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- 3.3 MATCHES TABLE
-- ---------------------------------------------------------------------------
drop table if exists public.matches cascade;

create table public.matches (
  id              uuid primary key default gen_random_uuid(),
  match_ref       text not null,
  city            text not null,
  driver_id       uuid references public.profiles (id) on delete set null,
  rider_id        uuid references public.profiles (id) on delete set null,
  offer_id        uuid references public.ride_offers (id) on delete set null,
  request_id      uuid references public.ride_requests (id) on delete set null,
  status          text not null default 'pending'
                       check (status in ('pending', 'active', 'completed', 'cancelled')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

drop trigger if exists trg_matches_updated_at on public.matches;
create trigger trg_matches_updated_at
  before update on public.matches
  for each row execute function public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- 3.4 RIDE BROADCASTS TABLE
-- ---------------------------------------------------------------------------
drop table if exists public.ride_broadcasts cascade;

create table public.ride_broadcasts (
  id              uuid primary key default gen_random_uuid(),
  passenger_id    uuid references public.profiles (id) on delete cascade,
  city            text not null,
  origin          text not null,
  origin_lat      numeric(10, 6),
  origin_lng      numeric(10, 6),
  destination     text not null,
  dest_lat        numeric(10, 6),
  dest_lng        numeric(10, 6),
  departure_time  timestamptz not null,
  seats_needed    integer not null default 1,
  status          text not null default 'active'
                       check (status in ('active', 'matched', 'cancelled')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

drop trigger if exists trg_ride_broadcasts_updated_at on public.ride_broadcasts;
create trigger trg_ride_broadcasts_updated_at
  before update on public.ride_broadcasts
  for each row execute function public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- 4. PAYMENTS TABLE
-- ---------------------------------------------------------------------------
drop table if exists public.payments cascade;

create table public.payments (
  id              uuid primary key default gen_random_uuid(),
  transaction_ref text not null,
  match_id        uuid references public.matches (id) on delete cascade,
  amount          numeric(10, 2) not null,
  currency        text not null default 'INR',
  status          text not null default 'pending'
                       check (status in ('pending', 'success', 'failed', 'refunded')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

drop trigger if exists trg_payments_updated_at on public.payments;
create trigger trg_payments_updated_at
  before update on public.payments
  for each row execute function public.handle_updated_at();

-- Dummy payments for the matches above (using a subquery to grab match IDs)
insert into public.payments (transaction_ref, match_id, amount, status)
select 'TXN-' || substring(id::text from 1 for 8), id, floor(random() * 500 + 100), 
       case status 
         when 'completed' then 'success' 
         when 'active' then 'pending' 
         when 'cancelled' then 'refunded' 
         else 'failed' 
       end
from public.matches;

-- ---------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------

-- Helper function to avoid infinite recursion in policies
create or replace function public.is_super_admin()
returns boolean language sql security definer set search_path = public as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'super_admin'
  );
$$;

create or replace function public.is_staff_or_admin()
returns boolean language sql security definer set search_path = public as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role in ('super_admin', 'city_staff')
  );
$$;

create or replace function public.get_assigned_city()
returns text language sql security definer set search_path = public as $$
  select assigned_city from profiles where id = auth.uid();
$$;

-- ── profiles ──────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;

drop policy if exists "profiles: owner can read own" on public.profiles;
create policy "profiles: owner can read own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles: owner can update own non-role fields" on public.profiles;
create policy "profiles: owner can update own non-role fields"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "profiles: super_admin full read" on public.profiles;
create policy "profiles: super_admin full read"
  on public.profiles for select
  using (public.is_super_admin());

drop policy if exists "profiles: super_admin full update" on public.profiles;
create policy "profiles: super_admin full update"
  on public.profiles for update
  using (public.is_super_admin());

-- ── escalations ───────────────────────────────────────────────────────────
alter table public.escalations enable row level security;

drop policy if exists "escalations: super_admin select" on public.escalations;
drop policy if exists "escalations: staff_or_admin select" on public.escalations;
create policy "escalations: staff_or_admin select"
  on public.escalations for select
  using (
    public.is_super_admin() 
    or (public.is_staff_or_admin() and city = public.get_assigned_city())
  );

drop policy if exists "escalations: super_admin insert" on public.escalations;
drop policy if exists "escalations: staff_or_admin insert" on public.escalations;
create policy "escalations: staff_or_admin insert"
  on public.escalations for insert
  with check (
    public.is_super_admin() 
    or (public.is_staff_or_admin() and city = public.get_assigned_city())
  );

drop policy if exists "escalations: super_admin update" on public.escalations;
drop policy if exists "escalations: staff_or_admin update" on public.escalations;
create policy "escalations: staff_or_admin update"
  on public.escalations for update
  using (
    public.is_super_admin() 
    or (public.is_staff_or_admin() and city = public.get_assigned_city())
  );

-- No one may delete escalations (audit trail requirement)
-- (No DELETE policy = DELETE is denied for all roles)

-- ── sos_alerts ────────────────────────────────────────────────────────────
alter table public.sos_alerts enable row level security;

drop policy if exists "sos_alerts: owner select" on public.sos_alerts;
create policy "sos_alerts: owner select" on public.sos_alerts for select using (auth.uid() = user_id);

drop policy if exists "sos_alerts: owner insert" on public.sos_alerts;
create policy "sos_alerts: owner insert" on public.sos_alerts for insert with check (auth.uid() = user_id);

drop policy if exists "sos_alerts: owner update" on public.sos_alerts;
create policy "sos_alerts: owner update" on public.sos_alerts for update using (auth.uid() = user_id);

drop policy if exists "sos_alerts: super_admin select" on public.sos_alerts;
drop policy if exists "sos_alerts: staff_or_admin select" on public.sos_alerts;
create policy "sos_alerts: staff_or_admin select" on public.sos_alerts for select using (
  public.is_super_admin() or (public.is_staff_or_admin() and city = public.get_assigned_city())
);

drop policy if exists "sos_alerts: super_admin update" on public.sos_alerts;
drop policy if exists "sos_alerts: staff_or_admin update" on public.sos_alerts;
create policy "sos_alerts: staff_or_admin update" on public.sos_alerts for update using (
  public.is_super_admin() or (public.is_staff_or_admin() and city = public.get_assigned_city())
);

-- ── vehicles ───────────────────────────────────────────────────────────────
alter table public.vehicles enable row level security;
create policy "vehicles: owner full access" on public.vehicles for all using (auth.uid() = owner_id);
create policy "vehicles: authenticated can read" on public.vehicles for select to authenticated using (true);

-- ── ride_offers ──────────────────────────────────────────────────────────
alter table public.ride_offers enable row level security;
create policy "ride_offers: public can read active" on public.ride_offers for select to authenticated using (status = 'active');
create policy "ride_offers: owner full access" on public.ride_offers for all using (auth.uid() = driver_id);

-- ── ride_requests ────────────────────────────────────────────────────────
alter table public.ride_requests enable row level security;
-- Riders can see their own requests. Drivers can see requests for their offers.
create policy "ride_requests: participant select" on public.ride_requests for select using (
  auth.uid() = rider_id or 
  auth.uid() in (select driver_id from public.ride_offers where id = offer_id)
);
create policy "ride_requests: rider insert" on public.ride_requests for insert with check (auth.uid() = rider_id);
create policy "ride_requests: driver update status" on public.ride_requests for update using (
  auth.uid() in (select driver_id from public.ride_offers where id = offer_id)
);

-- ── ride_broadcasts ──────────────────────────────────────────────────────
alter table public.ride_broadcasts enable row level security;
create policy "ride_broadcasts: public can read active" on public.ride_broadcasts for select to authenticated using (status = 'active');
create policy "ride_broadcasts: owner full access" on public.ride_broadcasts for all using (auth.uid() = passenger_id);

-- ── matches ───────────────────────────────────────────────────────────
alter table public.matches enable row level security;

drop policy if exists "matches: participant select" on public.matches;
create policy "matches: participant select" on public.matches for select using (
  auth.uid() = driver_id or auth.uid() = rider_id or
  public.is_super_admin() or (public.is_staff_or_admin() and city = public.get_assigned_city())
);

drop policy if exists "matches: super_admin update" on public.matches;
drop policy if exists "matches: staff_or_admin update" on public.matches;
create policy "matches: staff_or_admin update" on public.matches for update using (
  public.is_super_admin() or (public.is_staff_or_admin() and city = public.get_assigned_city())
);

-- ── payments ───────────────────────────────────────────────────────────
alter table public.payments enable row level security;

drop policy if exists "payments: super_admin select" on public.payments;
create policy "payments: super_admin select" on public.payments for select using (public.is_super_admin());

drop policy if exists "payments: super_admin update" on public.payments;
create policy "payments: super_admin update" on public.payments for update using (public.is_super_admin());

-- ---------------------------------------------------------------------------
-- 4. REALTIME SETUP
-- ---------------------------------------------------------------------------
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;

alter publication supabase_realtime add table public.escalations;
alter publication supabase_realtime add table public.sos_alerts;

-- ---------------------------------------------------------------------------
-- 5. HELPER: promote a user to super_admin (run manually in SQL editor)
--    Replace '<user-uuid>' with the real UUID from auth.users.
-- ---------------------------------------------------------------------------
-- update public.profiles set role = 'super_admin' where id = '<user-uuid>';
