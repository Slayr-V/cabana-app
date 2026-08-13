// Thin, typed wrappers over the Supabase calls the app needs. Domain shaping
// (turning these rows into the `CabanaEvent` shape the screens render) stays
// in state.tsx — this file only knows about the database.

import type { RealtimeChannel } from '@supabase/supabase-js';

import { supabase } from './client';
import type { EventItemRow, EventRow, MineItemRow, ProfileRow } from './types';

// ── profile ───────────────────────────────────────────────────────────

export async function fetchMyProfile(userId: string): Promise<ProfileRow> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) throw error;
  return data;
}

export async function updateMyColor(userId: string, color: string) {
  const { error } = await supabase.from('profiles').update({ color }).eq('id', userId);
  if (error) throw error;
}

export async function registerPushToken(userId: string, token: string | null) {
  const { error } = await supabase
    .from('profiles')
    .update({ expo_push_token: token })
    .eq('id', userId);
  if (error) throw error;
}

// ── events, nested ───────────────────────────────────────────────────

/** What one row of the nested "my events" query looks like. */
export type RawEventFull = EventRow & {
  event_items: EventItemRow[];
  feed_entries: { id: string; text: string; who_id: string | null; created_at: string }[];
  event_members: {
    id: string;
    user_id: string;
    role: 'host' | 'guest';
    joined_at: string;
    profiles: { id: string; name: string; color: string } | null;
  }[];
};

const EVENT_SELECT = `
  role,
  events (
    id, code, name, theme, where_text, date, start_note, host_id, created_at,
    event_items ( id, event_id, emoji, name, claimed_by, done, created_at ),
    feed_entries ( id, text, who_id, created_at ),
    event_members ( id, user_id, role, joined_at, profiles ( id, name, color ) )
  )
`;

/** Every event the signed-in person belongs to, fully hydrated in one round trip. */
export async function fetchMyEventsFull(userId: string): Promise<RawEventFull[]> {
  const { data, error } = await supabase
    .from('event_members')
    .select(EVENT_SELECT)
    .eq('user_id', userId);
  if (error) throw error;
  return ((data ?? []) as unknown as { events: RawEventFull }[])
    .map((row) => row.events)
    .filter((e): e is RawEventFull => !!e);
}

/** The signed-in person's private packing list, across every event at once. */
export async function fetchMyMineItems(userId: string): Promise<MineItemRow[]> {
  const { data, error } = await supabase.from('mine_items').select('*').eq('user_id', userId);
  if (error) throw error;
  return data ?? [];
}

// ── event lifecycle ──────────────────────────────────────────────────

export async function createEvent(input: {
  code: string;
  name: string;
  theme: string;
  where: string;
  date: string;
  startNote: string;
}): Promise<EventRow> {
  const { data, error } = await supabase.rpc('create_event', {
    p_code: input.code,
    p_name: input.name,
    p_theme: input.theme,
    p_where: input.where,
    p_date: input.date,
    p_start_note: input.startNote,
  });
  if (error) throw error;
  return data;
}

export async function joinEventByCode(code: string): Promise<EventRow> {
  const { data, error } = await supabase.rpc('join_event_by_code', { p_code: code });
  if (error) throw error;
  return data;
}

export async function leaveEvent(eventId: string): Promise<void> {
  const { error } = await supabase.rpc('leave_event', { p_event_id: eventId });
  if (error) throw error;
}

// ── group list ────────────────────────────────────────────────────────

export async function addEventItem(eventId: string, emoji: string, name: string) {
  const { error } = await supabase.from('event_items').insert({ event_id: eventId, emoji, name });
  if (error) throw error;
}

export async function addEventItems(
  eventId: string,
  items: { emoji: string; name: string }[],
) {
  if (items.length === 0) return;
  const { error } = await supabase
    .from('event_items')
    .insert(items.map((i) => ({ event_id: eventId, emoji: i.emoji, name: i.name })));
  if (error) throw error;
}

export async function claimEventItem(itemId: string, userId: string) {
  const { error } = await supabase
    .from('event_items')
    .update({ claimed_by: userId, done: true })
    .eq('id', itemId);
  if (error) throw error;
}

export async function releaseEventItem(itemId: string) {
  const { error } = await supabase
    .from('event_items')
    .update({ claimed_by: null, done: false })
    .eq('id', itemId);
  if (error) throw error;
}

export async function removeEventItem(itemId: string) {
  const { error } = await supabase.from('event_items').delete().eq('id', itemId);
  if (error) throw error;
}

// ── my stuff ──────────────────────────────────────────────────────────

export async function addMineItem(eventId: string, userId: string, name: string) {
  const { error } = await supabase
    .from('mine_items')
    .insert({ event_id: eventId, user_id: userId, name });
  if (error) throw error;
}

export async function toggleMineItem(itemId: string, done: boolean) {
  const { error } = await supabase.from('mine_items').update({ done }).eq('id', itemId);
  if (error) throw error;
}

export async function removeMineItem(itemId: string) {
  const { error } = await supabase.from('mine_items').delete().eq('id', itemId);
  if (error) throw error;
}

// ── feed ──────────────────────────────────────────────────────────────

export async function postFeedEntry(eventId: string, text: string, whoId: string) {
  const { error } = await supabase
    .from('feed_entries')
    .insert({ event_id: eventId, text, who_id: whoId });
  if (error) throw error;
}

// ── notifications ────────────────────────────────────────────────────

/** Fans a push out to the crew (or one member, for a targeted Nudge). */
export async function notifyCrew(input: {
  eventId: string;
  title: string;
  body: string;
  onlyUserId?: string;
}) {
  const { error } = await supabase.functions.invoke('notify-crew', {
    body: {
      event_id: input.eventId,
      title: input.title,
      body: input.body,
      only_user_id: input.onlyUserId,
    },
  });
  // A failed push send shouldn't block the action that triggered it — the
  // in-app feed entry already landed either way.
  if (error) console.warn('notify-crew failed', error.message);
}

// ── realtime ──────────────────────────────────────────────────────────

/**
 * Subscribes to every row change across an event's group list, crew and
 * feed, and calls `onChange` on any of them. Callers refetch on that signal
 * rather than patching individual deltas in — at this app's scale (a
 * friend group's worth of writes) a full refetch is simpler and plenty fast,
 * and it means the client never has to reimplement the server's join logic.
 */
export function subscribeToEvents(eventIds: string[], onChange: () => void): RealtimeChannel | null {
  if (eventIds.length === 0) return null;
  const filter = `event_id=in.(${eventIds.join(',')})`;

  const channel = supabase
    .channel(`events:${eventIds.join(',')}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'event_items', filter }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'event_members', filter }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'feed_entries', filter }, onChange)
    .subscribe();

  return channel;
}
