-- ============================================================================
-- Caley Hot Dog Giveaway — complete one-time database setup
-- ----------------------------------------------------------------------------
-- HOW TO USE:
--   1. Create a free project at https://supabase.com
--   2. Open the project → SQL Editor → New query
--   3. Paste this ENTIRE file and click "Run"
--   4. Add one admin user: Authentication → Users → Add user
--      (give it an email + password, enable "Auto Confirm")
--
-- This is safe to run more than once.
--
-- Security model (kept simple for a one-day event):
--   - The public form can ONLY call the submit_* / get_* functions below.
--     It can never read other attendees' phone/email directly.
--   - The admin dashboard reads the tables, but only when logged in
--     (any authenticated Supabase user = admin).
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- Tables
-- ----------------------------------------------------------------------------
create table if not exists public.event_participants (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text not null,
  interests text[] not null default '{}',
  consent_contact boolean not null default false,
  giveaway_opted_in boolean not null default false,
  ticket_number text unique,
  public_flow_token text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.event_referrals (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.event_participants(id) on delete cascade,
  referral_name text not null,
  referral_phone text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.giveaway_entries (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.event_participants(id) on delete cascade,
  ticket_number text unique not null,
  public_ticket_token text not null,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.giveaway_winners (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.giveaway_entries(id) on delete cascade,
  participant_id uuid references public.event_participants(id) on delete set null,
  ticket_number text not null,
  winner_name text not null,
  winner_phone text not null default '',
  prize_label text,
  draw_order int not null,
  drawn_by text,
  drawn_at timestamptz not null default now(),
  unique (entry_id)
);

-- Sequential, human-friendly ticket numbers: CALEY-0001, CALEY-0002, ...
create sequence if not exists public.giveaway_ticket_seq;

-- ----------------------------------------------------------------------------
-- Helper: random opaque token
-- Note: on Supabase, pgcrypto lives in the "extensions" schema, so we qualify
-- gen_random_bytes explicitly rather than relying on search_path.
-- ----------------------------------------------------------------------------
create or replace function public.gen_token()
returns text language sql volatile set search_path = extensions, public as $$
  select encode(extensions.gen_random_bytes(16), 'hex');
$$;

-- ----------------------------------------------------------------------------
-- submit_participant: register a lead (idempotent on phone/email)
-- ----------------------------------------------------------------------------
create or replace function public.submit_participant(
  p_full_name text,
  p_phone text,
  p_email text,
  p_interests text[],
  p_consent_contact boolean
)
returns table (
  participant_id uuid,
  public_flow_token text,
  already_exists boolean,
  ticket_number text
)
language plpgsql security definer set search_path = public as $$
declare
  v_row public.event_participants%rowtype;
  v_token text;
  v_id uuid;
begin
  select * into v_row
  from public.event_participants
  where phone = p_phone or lower(email) = lower(p_email)
  limit 1;

  if found then
    return query select v_row.id, v_row.public_flow_token, true, v_row.ticket_number;
    return;
  end if;

  v_token := public.gen_token();
  v_id := gen_random_uuid();

  insert into public.event_participants
    (id, full_name, phone, email, interests, consent_contact, giveaway_opted_in, public_flow_token)
  values
    (v_id, p_full_name, p_phone, p_email, coalesce(p_interests, '{}'), coalesce(p_consent_contact, false), false, v_token);

  return query select v_id, v_token, false, null::text;
end;
$$;

-- ----------------------------------------------------------------------------
-- get_participant_flow_state: resume the flow using the private flow token
-- ----------------------------------------------------------------------------
create or replace function public.get_participant_flow_state(
  p_participant_id uuid,
  p_public_flow_token text
)
returns table (
  participant_id uuid,
  full_name text,
  interests text[],
  giveaway_opted_in boolean,
  ticket_number text,
  public_ticket_token text,
  created_at timestamptz
)
language plpgsql security definer set search_path = public as $$
begin
  return query
  select
    p.id,
    p.full_name,
    p.interests,
    p.giveaway_opted_in,
    p.ticket_number,
    e.public_ticket_token,
    p.created_at
  from public.event_participants p
  left join public.giveaway_entries e on e.ticket_number = p.ticket_number
  where p.id = p_participant_id
    and p.public_flow_token = p_public_flow_token;
end;
$$;

-- ----------------------------------------------------------------------------
-- submit_referrals_and_create_ticket: add 3 referrals, mint a ticket
-- ----------------------------------------------------------------------------
create or replace function public.submit_referrals_and_create_ticket(
  p_participant_id uuid,
  p_public_flow_token text,
  p_referrals jsonb
)
returns table (
  participant_id uuid,
  ticket_number text,
  public_ticket_token text,
  already_had_ticket boolean
)
language plpgsql security definer set search_path = public as $$
declare
  v_row public.event_participants%rowtype;
  v_ticket text;
  v_token text;
  v_ref jsonb;
begin
  select * into v_row
  from public.event_participants
  where id = p_participant_id and public_flow_token = p_public_flow_token;

  if not found then
    raise exception 'Invalid or expired participant session.';
  end if;

  -- Already has a ticket → return it (idempotent)
  if v_row.giveaway_opted_in and v_row.ticket_number is not null then
    return query
    select v_row.id, v_row.ticket_number, e.public_ticket_token, true
    from public.giveaway_entries e
    where e.ticket_number = v_row.ticket_number;
    return;
  end if;

  -- Insert referrals
  for v_ref in select * from jsonb_array_elements(coalesce(p_referrals, '[]'::jsonb))
  loop
    insert into public.event_referrals (participant_id, referral_name, referral_phone)
    values (p_participant_id, v_ref->>'referral_name', v_ref->>'referral_phone');
  end loop;

  -- Mint ticket
  v_ticket := 'CALEY-' || lpad(nextval('public.giveaway_ticket_seq')::text, 4, '0');
  v_token := public.gen_token();

  insert into public.giveaway_entries (participant_id, ticket_number, public_ticket_token, status)
  values (p_participant_id, v_ticket, v_token, 'active');

  update public.event_participants
  set giveaway_opted_in = true, ticket_number = v_ticket
  where id = p_participant_id;

  return query select p_participant_id, v_ticket, v_token, false;
end;
$$;

-- ----------------------------------------------------------------------------
-- get_public_ticket: public ticket lookup (by token, or by number as fallback)
-- ----------------------------------------------------------------------------
create or replace function public.get_public_ticket(
  p_ticket_number text,
  p_public_ticket_token text
)
returns table (
  ticket_number text,
  public_ticket_token text,
  ticket_status text,
  display_name text,
  created_at timestamptz
)
language plpgsql security definer set search_path = public as $$
begin
  return query
  select
    e.ticket_number,
    e.public_ticket_token,
    e.status,
    p.full_name,
    e.created_at
  from public.giveaway_entries e
  join public.event_participants p on p.id = e.participant_id
  where
    (p_public_ticket_token is not null and e.public_ticket_token = p_public_ticket_token)
    or (p_public_ticket_token is null and e.ticket_number = p_ticket_number)
  limit 1;
end;
$$;

-- ----------------------------------------------------------------------------
-- record_giveaway_winner: admin records a draw result
-- ----------------------------------------------------------------------------
create or replace function public.record_giveaway_winner(
  p_entry_id uuid,
  p_prize_label text
)
returns table (
  winner_id uuid,
  entry_id uuid,
  participant_id uuid,
  ticket_number text,
  winner_name text,
  winner_phone text,
  prize_label text,
  draw_order int,
  drawn_at timestamptz
)
language plpgsql security definer set search_path = public as $$
declare
  v_entry public.giveaway_entries%rowtype;
  v_part public.event_participants%rowtype;
  v_order int;
  v_id uuid;
  v_now timestamptz := now();
begin
  select * into v_entry from public.giveaway_entries where id = p_entry_id;
  if not found then
    raise exception 'Ticket not found.';
  end if;

  -- Already recorded? Return the existing winner (idempotent / no double-draw)
  select w.id into v_id from public.giveaway_winners w where w.entry_id = p_entry_id;
  if found then
    return query
    select w.id, w.entry_id, w.participant_id, w.ticket_number, w.winner_name,
           w.winner_phone, w.prize_label, w.draw_order, w.drawn_at
    from public.giveaway_winners w where w.entry_id = p_entry_id;
    return;
  end if;

  select * into v_part from public.event_participants where id = v_entry.participant_id;

  select coalesce(max(gw.draw_order), 0) + 1 into v_order from public.giveaway_winners gw;

  v_id := gen_random_uuid();
  insert into public.giveaway_winners
    (id, entry_id, participant_id, ticket_number, winner_name, winner_phone, prize_label, draw_order, drawn_at)
  values
    (v_id, p_entry_id, v_entry.participant_id, v_entry.ticket_number,
     coalesce(v_part.full_name, ''), coalesce(v_part.phone, ''), p_prize_label, v_order, v_now);

  update public.giveaway_entries set status = 'winner' where id = p_entry_id;

  return query
  select v_id, p_entry_id, v_entry.participant_id, v_entry.ticket_number,
         coalesce(v_part.full_name, ''), coalesce(v_part.phone, ''), p_prize_label, v_order, v_now;
end;
$$;

-- Public giveaway status for a single ticket. Lets a participant's phone poll
-- "did I win, and which ticket was drawn most recently?" without exposing the
-- full winners table. Only public-safe fields (ticket number, first name).
create or replace function public.get_giveaway_status(p_ticket_number text)
returns table (
  you_won boolean,
  your_prize text,
  latest_ticket text,
  latest_name text,
  latest_prize text,
  latest_at timestamptz,
  total_winners int
)
language sql security definer set search_path = public as $$
  select
    exists (
      select 1 from public.giveaway_winners w
      where w.ticket_number = p_ticket_number
    ) as you_won,
    (select w.prize_label from public.giveaway_winners w
       where w.ticket_number = p_ticket_number
       order by w.draw_order desc limit 1) as your_prize,
    (select w.ticket_number from public.giveaway_winners w
       order by w.draw_order desc limit 1) as latest_ticket,
    (select split_part(w.winner_name, ' ', 1) from public.giveaway_winners w
       order by w.draw_order desc limit 1) as latest_name,
    (select w.prize_label from public.giveaway_winners w
       order by w.draw_order desc limit 1) as latest_prize,
    (select w.drawn_at from public.giveaway_winners w
       order by w.draw_order desc limit 1) as latest_at,
    (select count(*)::int from public.giveaway_winners) as total_winners;
$$;

-- ----------------------------------------------------------------------------
-- Row Level Security
--   - Public (anon): no direct table access; only the functions above.
--   - Admin (authenticated): full read + the admin actions.
-- ----------------------------------------------------------------------------
alter table public.event_participants enable row level security;
alter table public.event_referrals    enable row level security;
alter table public.giveaway_entries    enable row level security;
alter table public.giveaway_winners    enable row level security;

do $$
declare t text;
begin
  foreach t in array array['event_participants','event_referrals','giveaway_entries','giveaway_winners']
  loop
    execute format('drop policy if exists admin_read on public.%I', t);
    execute format('create policy admin_read on public.%I for select to authenticated using (true)', t);
  end loop;
end $$;

-- ----------------------------------------------------------------------------
-- Grants: anon can run the public flow; authenticated (admin) can run all.
-- ----------------------------------------------------------------------------
grant execute on function public.submit_participant(text, text, text, text[], boolean) to anon, authenticated;
grant execute on function public.get_participant_flow_state(uuid, text) to anon, authenticated;
grant execute on function public.submit_referrals_and_create_ticket(uuid, text, jsonb) to anon, authenticated;
grant execute on function public.get_public_ticket(text, text) to anon, authenticated;
grant execute on function public.get_giveaway_status(text) to anon, authenticated;
grant execute on function public.record_giveaway_winner(uuid, text) to authenticated;

-- Done. Now add one admin user in Authentication → Users.
