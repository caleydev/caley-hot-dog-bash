// Supabase-ready stub. The app currently runs in local/demo mode.
// When Lovable Cloud / Supabase is enabled, wire up @supabase/supabase-js here
// and the supabaseEventAdapter will take over automatically.

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/*
Suggested SQL schema:

create table event_participants (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text not null,
  interests text[] not null,
  consent_contact boolean not null default false,
  giveaway_opted_in boolean not null default false,
  ticket_number text unique,
  created_at timestamptz default now()
);
create table event_referrals (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references event_participants(id) on delete cascade,
  referral_name text not null,
  referral_phone text not null,
  created_at timestamptz default now()
);
create table giveaway_entries (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references event_participants(id) on delete cascade,
  ticket_number text unique not null,
  status text not null default 'active',
  created_at timestamptz default now()
);
create table giveaway_winners (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid references giveaway_entries(id),
  ticket_number text not null,
  winner_name text not null,
  winner_phone text,
  prize_label text,
  draw_order int not null,
  drawn_at timestamptz default now()
);
*/