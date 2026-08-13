-- Cabana schema: profiles, events, crew, group list, private lists, live feed.
--
-- Design notes:
--   * Every table but `profiles` is reached only through security-definer
--     RPCs for its "entry point" mutation (create_event, join_event_by_code,
--     leave_event) so RLS policies can stay narrow — a client never needs
--     broad read access just to look up an event by its join code.
--   * `is_event_member()` is the one check nearly every policy below reduces
--     to: can the signed-in user see this row at all.
--   * The design's "invited, pending" crew badge (someone invited who
--     hasn't signed up yet) has no real-backend equivalent here — a crew
--     row only exists once someone has actually joined by code. The app
--     layer repurposes "Nudge" for members who've joined but claimed
--     nothing yet, which now sends a real push instead of a mocked one.

create extension if not exists pgcrypto;

-- ── profiles ──────────────────────────────────────────────────────────
-- One row per signed-up person, populated automatically from sign-up
-- metadata by the trigger below — the app never inserts this directly.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  color text not null default '#F6F084',
  expo_push_token text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are readable by any signed-in user"
  on public.profiles for select
  to authenticated
  using (true);

create policy "users can update their own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid());

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, color)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', 'Guest'),
    coalesce(new.raw_user_meta_data ->> 'color', '#F6F084')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── events ────────────────────────────────────────────────────────────
create table public.events (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  theme text not null,
  where_text text not null default '',
  date timestamptz not null,
  start_note text not null default '',
  host_id uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

alter table public.events enable row level security;

-- ── event_members ("the crew") ───────────────────────────────────────
create table public.event_members (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'guest' check (role in ('host', 'guest')),
  joined_at timestamptz not null default now(),
  unique (event_id, user_id)
);

alter table public.event_members enable row level security;

create function public.is_event_member(target_event uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.event_members
    where event_id = target_event and user_id = auth.uid()
  );
$$;

create policy "members can see events they're in"
  on public.events for select
  to authenticated
  using (public.is_event_member(id));

create policy "members can see their event's roster"
  on public.event_members for select
  to authenticated
  using (public.is_event_member(event_id));

create policy "members can leave (delete their own membership)"
  on public.event_members for delete
  to authenticated
  using (user_id = auth.uid());

-- ── event_items ("who's bringing what") ──────────────────────────────
create table public.event_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  emoji text not null default '🫶',
  name text not null,
  claimed_by uuid references public.profiles (id) on delete set null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.event_items enable row level security;

create policy "members can see the group list"
  on public.event_items for select
  to authenticated
  using (public.is_event_member(event_id));

create policy "members can add to the group list"
  on public.event_items for insert
  to authenticated
  with check (public.is_event_member(event_id));

create policy "members can update the group list"
  on public.event_items for update
  to authenticated
  using (public.is_event_member(event_id));

create policy "members can remove from the group list"
  on public.event_items for delete
  to authenticated
  using (public.is_event_member(event_id));

-- ── mine_items ("my stuff" — private per person, per event) ──────────
create table public.mine_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.mine_items enable row level security;

create policy "only the owner can see their private list"
  on public.mine_items for select
  to authenticated
  using (user_id = auth.uid());

create policy "only the owner can add to their private list"
  on public.mine_items for insert
  to authenticated
  with check (user_id = auth.uid() and public.is_event_member(event_id));

create policy "only the owner can update their private list"
  on public.mine_items for update
  to authenticated
  using (user_id = auth.uid());

create policy "only the owner can remove from their private list"
  on public.mine_items for delete
  to authenticated
  using (user_id = auth.uid());

-- ── feed_entries ("updates") ──────────────────────────────────────────
create table public.feed_entries (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  text text not null,
  who_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.feed_entries enable row level security;

create policy "members can see the updates feed"
  on public.feed_entries for select
  to authenticated
  using (public.is_event_member(event_id));

create policy "members can post updates"
  on public.feed_entries for insert
  to authenticated
  with check (public.is_event_member(event_id));

-- ── create_event(): host an event, become its first (host) member ────
create function public.create_event(
  p_code text, p_name text, p_theme text, p_where text,
  p_date timestamptz, p_start_note text
)
returns public.events
language plpgsql
security definer set search_path = public
as $$
declare
  v_event public.events;
begin
  insert into public.events (code, name, theme, where_text, date, start_note, host_id)
  values (p_code, p_name, p_theme, p_where, p_date, p_start_note, auth.uid())
  returning * into v_event;

  insert into public.event_members (event_id, user_id, role)
  values (v_event.id, auth.uid(), 'host');

  insert into public.feed_entries (event_id, text, who_id)
  values (v_event.id, 'You started ' || p_name, auth.uid());

  return v_event;
end;
$$;

-- ── join_event_by_code(): look up + join without a broad SELECT policy ─
create function public.join_event_by_code(p_code text)
returns public.events
language plpgsql
security definer set search_path = public
as $$
declare
  v_event public.events;
  v_already_in boolean;
begin
  select * into v_event from public.events where upper(code) = upper(p_code);

  if not found then
    raise exception 'no event with that code';
  end if;

  select exists (
    select 1 from public.event_members
    where event_id = v_event.id and user_id = auth.uid()
  ) into v_already_in;

  insert into public.event_members (event_id, user_id, role)
  values (v_event.id, auth.uid(), 'guest')
  on conflict (event_id, user_id) do nothing;

  if not v_already_in then
    insert into public.feed_entries (event_id, text, who_id)
    values (v_event.id, 'joined with code ' || upper(p_code), auth.uid());
  end if;

  return v_event;
end;
$$;

-- ── leave_event(): free claims, wipe the private list, drop membership ─
create function public.leave_event(p_event_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update public.event_items
  set claimed_by = null, done = false
  where event_id = p_event_id and claimed_by = auth.uid();

  delete from public.mine_items
  where event_id = p_event_id and user_id = auth.uid();

  delete from public.event_members
  where event_id = p_event_id and user_id = auth.uid();
end;
$$;

-- realtime: broadcast row changes to subscribed clients
alter publication supabase_realtime add table public.event_items;
alter publication supabase_realtime add table public.event_members;
alter publication supabase_realtime add table public.feed_entries;
