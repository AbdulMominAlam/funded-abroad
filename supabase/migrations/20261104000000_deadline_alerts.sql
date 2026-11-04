-- Funded Abroad: email deadline alerts (double opt-in).
-- Run once in the Supabase SQL editor, or with `supabase db push`.
--
-- Security model
--   * Row Level Security is ON for every table and there are NO policies for the
--     public roles (anon, authenticated), and their table privileges are revoked.
--     The public anon / publishable key therefore cannot read, insert, update or
--     delete anything directly.
--   * The only public entry points are the Edge Functions `subscribe`, `confirm`
--     and `unsubscribe`, which validate input and use the service-role key
--     server-side (the service role bypasses RLS). The daily alerts job in
--     GitHub Actions also uses the service-role key.

create extension if not exists pgcrypto;

create table if not exists public.subscribers (
  id                uuid primary key default gen_random_uuid(),
  email             text not null check (char_length(email) between 3 and 254 and email = lower(email)),
  nationality       text check (nationality is null or nationality ~ '^[A-Z]{2}$'),
  level             text not null default 'masters' check (level in ('ug', 'masters', 'phd', 'intern', 'all')),
  shortlist         text[] not null default '{}' check (cardinality(shortlist) <= 200),
  frequency         text not null default 'weekly' check (frequency in ('weekly', 'none')),
  digest_day        smallint not null default 1 check (digest_day between 0 and 6), -- 0 = Sunday … 6 = Saturday (UTC)
  remind_shortlist  boolean not null default true,
  confirmed         boolean not null default false,
  confirmed_at      timestamptz,
  confirm_token     text unique,          -- random, single use, cleared after confirmation
  confirm_sent_at   timestamptz,
  pending           jsonb,                -- new preferences waiting for e-mail confirmation (already-confirmed subscribers)
  unsubscribe_token text not null unique default encode(gen_random_bytes(24), 'hex'),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create unique index if not exists subscribers_email_key on public.subscribers (email);

-- One row per e-mail actually sent, so nobody gets the same alert twice.
create table if not exists public.sent_notifications (
  id            bigint generated always as identity primary key,
  subscriber_id uuid not null references public.subscribers (id) on delete cascade,
  kind          text not null check (kind in ('digest', 'reminder14', 'reminder3')),
  dedupe_key    text not null,
  sent_at       timestamptz not null default now(),
  unique (subscriber_id, dedupe_key)
);

-- Basic abuse protection for the public `subscribe` function (hashed, never raw IPs/e-mails).
create table if not exists public.subscribe_attempts (
  id         bigint generated always as identity primary key,
  ip_hash    text not null,
  email_hash text not null,
  created_at timestamptz not null default now()
);
create index if not exists subscribe_attempts_ip_idx on public.subscribe_attempts (ip_hash, created_at);
create index if not exists subscribe_attempts_email_idx on public.subscribe_attempts (email_hash, created_at);

alter table public.subscribers enable row level security;
alter table public.sent_notifications enable row level security;
alter table public.subscribe_attempts enable row level security;

revoke all on public.subscribers, public.sent_notifications, public.subscribe_attempts from anon, authenticated;
revoke all on sequence public.sent_notifications_id_seq, public.subscribe_attempts_id_seq from anon, authenticated;

-- Housekeeping, called by the daily alerts job: drop unconfirmed sign-ups after 7 days
-- and rate-limit records after 2 days.
create or replace function public.alerts_cleanup()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.subscribers where confirmed = false and created_at < now() - interval '7 days';
  delete from public.subscribe_attempts where created_at < now() - interval '2 days';
  update public.subscribers set pending = null, confirm_token = null
   where confirmed = true and pending is not null and confirm_sent_at < now() - interval '7 days';
$$;
revoke all on function public.alerts_cleanup() from public, anon, authenticated;
