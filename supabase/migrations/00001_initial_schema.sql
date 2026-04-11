-- ============================================================
-- ProCaddie — Initial Database Schema
-- All 7 core tables with indexes, RLS policies, and triggers
-- ============================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ---------- Users ----------
-- Extended user profile (supplements Supabase Auth users)
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  handicap_index numeric(4, 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "Users can read own data" on public.users
  for select using (auth.uid() = id);

create policy "Users can update own data" on public.users
  for update using (auth.uid() = id);

create policy "Users can insert own data" on public.users
  for insert with check (auth.uid() = id);

-- ---------- Player Profiles ----------
create table public.player_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  shot_shape text not null default 'straight' check (shot_shape in ('draw', 'fade', 'straight', 'varies')),
  miss_tendency text not null default 'varies' check (miss_tendency in ('left', 'right', 'short', 'long', 'varies')),
  risk_tolerance text not null default 'moderate' check (risk_tolerance in ('aggressive', 'moderate', 'conservative')),
  strengths text[] not null default '{}',
  weaknesses text[] not null default '{}',
  preferred_tee_box text not null default 'white' check (preferred_tee_box in ('championship', 'blue', 'white', 'forward')),
  updated_at timestamptz not null default now(),
  constraint unique_user_profile unique (user_id)
);

alter table public.player_profiles enable row level security;

create policy "Users can read own profile" on public.player_profiles
  for select using (auth.uid() = user_id);

create policy "Users can update own profile" on public.player_profiles
  for update using (auth.uid() = user_id);

create policy "Users can insert own profile" on public.player_profiles
  for insert with check (auth.uid() = user_id);

-- ---------- Club Distances ----------
create table public.club_distances (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.player_profiles(id) on delete cascade,
  club_name text not null,
  carry_distance_yards integer not null,
  total_distance_yards integer not null,
  club_type text not null check (club_type in ('driver', 'wood', 'hybrid', 'iron', 'wedge', 'putter')),
  sort_order integer not null default 0
);

create index idx_club_distances_profile on public.club_distances(profile_id);

alter table public.club_distances enable row level security;

create policy "Users can manage own club distances" on public.club_distances
  for all using (
    exists (
      select 1 from public.player_profiles
      where id = club_distances.profile_id
      and user_id = auth.uid()
    )
  );

-- ---------- Courses ----------
create table public.courses (
  id uuid primary key default uuid_generate_v4(),
  external_id text not null,
  name text not null,
  city text,
  state text,
  country text,
  latitude numeric(10, 7) not null,
  longitude numeric(10, 7) not null,
  par integer not null,
  rating numeric(4, 1),
  slope integer,
  num_holes integer not null default 18,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  constraint unique_external_id unique (external_id)
);

create index idx_courses_name on public.courses using gin (to_tsvector('english', name));

alter table public.courses enable row level security;

-- Courses are readable by all authenticated users
create policy "Authenticated users can read courses" on public.courses
  for select using (auth.role() = 'authenticated');

-- Only service role can insert/update courses (via API routes)
create policy "Service role can manage courses" on public.courses
  for all using (auth.jwt() ->> 'role' = 'service_role');

-- ---------- Holes ----------
create table public.holes (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid not null references public.courses(id) on delete cascade,
  hole_number integer not null,
  par integer not null,
  distance_yards jsonb not null default '{}',
  handicap_index integer,
  tee_latitude numeric(10, 7) not null,
  tee_longitude numeric(10, 7) not null,
  green_latitude numeric(10, 7) not null,
  green_longitude numeric(10, 7) not null,
  aerial_image_url text,
  feature_segments jsonb,
  created_at timestamptz not null default now(),
  constraint unique_course_hole unique (course_id, hole_number)
);

create index idx_holes_course on public.holes(course_id);

alter table public.holes enable row level security;

create policy "Authenticated users can read holes" on public.holes
  for select using (auth.role() = 'authenticated');

create policy "Service role can manage holes" on public.holes
  for all using (auth.jwt() ->> 'role' = 'service_role');

-- ---------- Hole Strategies ----------
create table public.hole_strategies (
  id uuid primary key default uuid_generate_v4(),
  hole_id uuid not null references public.holes(id) on delete cascade,
  profile_id uuid not null references public.player_profiles(id) on delete cascade,
  tee_strategy jsonb not null default '{}',
  approach_strategy jsonb not null default '{}',
  green_strategy jsonb not null default '{}',
  scoring_notes jsonb not null default '{}',
  overall_notes text not null default '',
  generated_at timestamptz not null default now(),
  claude_model_version text not null default '',
  constraint unique_hole_profile_strategy unique (hole_id, profile_id)
);

create index idx_strategies_hole on public.hole_strategies(hole_id);
create index idx_strategies_profile on public.hole_strategies(profile_id);

alter table public.hole_strategies enable row level security;

create policy "Users can read own strategies" on public.hole_strategies
  for select using (
    exists (
      select 1 from public.player_profiles
      where id = hole_strategies.profile_id
      and user_id = auth.uid()
    )
  );

create policy "Service role can manage strategies" on public.hole_strategies
  for all using (auth.jwt() ->> 'role' = 'service_role');

-- ---------- User Notes ----------
create table public.user_notes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  hole_id uuid not null references public.holes(id) on delete cascade,
  note_text text not null,
  note_type text not null default 'general' check (note_type in ('general', 'tee', 'approach', 'green', 'weather', 'pin')),
  round_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_notes_user_hole on public.user_notes(user_id, hole_id);

alter table public.user_notes enable row level security;

create policy "Users can manage own notes" on public.user_notes
  for all using (auth.uid() = user_id);

-- ---------- Updated At Trigger ----------
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on public.users
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.player_profiles
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.user_notes
  for each row execute function public.handle_updated_at();
