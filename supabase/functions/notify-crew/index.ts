// notify-crew — fans a push notification out to an event's crew.
//
// Called by the client right after a mutation worth telling people about
// (an item gets claimed, someone nudges the crew, a new person joins). The
// caller's identity comes from their own JWT, never a client-supplied field,
// and is checked against `is_event_member` before anything is sent — so this
// can't be used to spam a crew you're not part of.
//
// Invoke from the app with:
//   supabase.functions.invoke('notify-crew', { body: { event_id, title, body } })

import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

type Payload = {
  event_id: string;
  title: string;
  body: string;
  /** Only send to this one crew member (a targeted "Nudge") instead of everyone. */
  only_user_id?: string;
};

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const authHeader = req.headers.get('Authorization') ?? '';
  let payload: Payload;
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'invalid JSON body' }, 400);
  }
  if (!payload.event_id || !payload.title || !payload.body) {
    return json({ error: 'event_id, title and body are required' }, 400);
  }

  // Identify the caller from their own token — never trust a client-supplied
  // user id for who's sending this.
  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user) return json({ error: 'unauthenticated' }, 401);

  const { data: isMember } = await userClient.rpc('is_event_member', {
    target_event: payload.event_id,
  });
  if (!isMember) return json({ error: 'not a member of this event' }, 403);

  // Service role from here on — reading push tokens needs to see every
  // member's profile, not just the caller's own.
  const serviceClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  let membersQuery = serviceClient
    .from('event_members')
    .select('profiles!inner(expo_push_token)')
    .eq('event_id', payload.event_id)
    .neq('user_id', user.id);

  if (payload.only_user_id) {
    membersQuery = membersQuery.eq('user_id', payload.only_user_id);
  }

  const { data: members, error } = await membersQuery;
  if (error) return json({ error: error.message }, 500);

  const tokens = (members ?? [])
    .map((m) => (m.profiles as unknown as { expo_push_token: string | null }).expo_push_token)
    .filter((t): t is string => !!t && t.startsWith('ExponentPushToken'));

  if (tokens.length === 0) return json({ sent: 0 });

  // Expo caps a single push request at 100 messages.
  const messages = tokens.map((to) => ({
    to,
    title: payload.title,
    body: payload.body,
    sound: 'default',
    data: { event_id: payload.event_id },
  }));

  let sent = 0;
  for (let i = 0; i < messages.length; i += 100) {
    const batch = messages.slice(i, i + 100);
    const res = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(batch),
    });
    if (res.ok) sent += batch.length;
  }

  return json({ sent });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
