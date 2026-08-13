// The whole app's state. Originally ported from the design's `DCLogic`
// class as local-only mock data; now backed by Supabase for real — auth,
// events, crew, the group list, private lists and the live feed all read
// and write through features/cabana/supabase/*, with realtime subscriptions
// keeping everyone's view in sync.
//
// The screen-switching shape is unchanged from the original port: one
// scrolling area, one bottom bar, overlays on top, no route pushes.

import type { Session } from '@supabase/supabase-js';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { DAY, findVibe, type Pack } from './data';
import { registerForPushNotifications, unregisterPushNotifications } from './notifications/push';
import { cancelAllReminders, reconcileReminders } from './notifications/reminders';
import { authErrorMessage, signIn, signOut as authSignOut, signUp } from './supabase/auth';
import { supabase } from './supabase/client';
import * as db from './supabase/queries';
import type { RawEventFull } from './supabase/queries';
import { NO_COLOR, SWATCHES } from './theme';
import { fmt, fromIso, iso, splitThing } from './utils';

export type Screen =
  | 'onboard'
  | 'auth'
  | 'booting'
  | 'events'
  | 'event'
  | 'good'
  | 'me'
  | 'create'
  | 'invite'
  | 'pack';

export type EventTab = 'home' | 'list' | 'mystuff' | 'crew';

export type CrewMember = {
  /** Profile id — also what `ListItem.who` and `FeedEntry.who` point at. */
  id: string;
  /** Full display name for the Crew tab ("Sam (you)"). */
  name: string;
  /** First-name-ish label for the home strip and who-claimed chips ("You"). */
  short: string;
  initial: string;
  color: string;
  role: 'host' | 'guest';
  /** Derived captions — computed once per fetch, not stored. */
  tag: string;
  sub: string;
};

export type ListItem = {
  id: string;
  emoji: string;
  name: string;
  /** Profile id of whoever claimed it, or null while it's up for grabs. */
  who: string | null;
  done: boolean;
};

export type MineItem = { id: string; name: string; done: boolean };

export type FeedEntry = { id: string; text: string; who: string | null; ts: number };

export type CabanaEvent = {
  id: string;
  code?: string;
  name: string;
  theme: string;
  where: string;
  /** ISO timestamp. */
  date: string;
  startNote: string;
  hostId: string;
  crew: CrewMember[];
  items: ListItem[];
  mine: MineItem[];
  feed: FeedEntry[];
};

const EMPTY_EVENT: CabanaEvent = {
  id: '',
  name: '',
  theme: 'Beach',
  where: '',
  date: new Date().toISOString(),
  startNote: '',
  hostId: '',
  crew: [],
  items: [],
  mine: [],
  feed: [],
};

type AddMode = 'list' | 'mine';

/** Someone whose profile row hasn't loaded yet gets this rather than a crash. */
const UNKNOWN_MEMBER = { color: NO_COLOR, initial: '?', label: 'Someone' };

/** Resolves a claimed-by id (or null) to a colour/initial/label to render. */
export function resolveWho(
  who: string | null,
  event: CabanaEvent,
  myId: string | null,
  myInitial: string,
  myColor: string,
): { color: string; initial: string; label: string } | null {
  if (!who) return null;
  if (who === myId) return { color: myColor, initial: myInitial, label: 'You' };
  const member = event.crew.find((c) => c.id === who);
  return member ? { color: member.color, initial: member.initial, label: member.short } : UNKNOWN_MEMBER;
}

/**
 * Turns raw crew-member data into the tag/sub captions the design shows
 * ("host", "2 sorted", "new 👋" · "Cooler box, drinks · all packed"). Purely
 * a function of what they've claimed and when they joined — nothing here is
 * stored, it's recomputed on every fetch.
 */
function deriveCrewCaption(
  role: 'host' | 'guest',
  joinedAt: string,
  claimedNames: string[],
  now: number,
): { tag: string; sub: string } {
  if (role === 'host') {
    return {
      tag: 'host',
      sub: claimedNames.length > 0 ? `Host · ${claimedNames.join(', ')}` : 'Host · nothing ticked off yet',
    };
  }
  if (claimedNames.length > 0) {
    return { tag: `${claimedNames.length} sorted`, sub: `${claimedNames.join(', ')} · all packed` };
  }
  const justJoined = now - new Date(joinedAt).getTime() < 3 * 3600 * 1000;
  return justJoined
    ? { tag: 'new 👋', sub: 'Just joined · nothing ticked off yet' }
    : { tag: 'in', sub: 'Nothing ticked off yet' };
}

/** Raw Supabase rows → the shape every screen renders. */
function mapRawEvent(raw: RawEventFull, myId: string): CabanaEvent {
  const now = Date.now();

  const items: ListItem[] = raw.event_items.map((i) => ({
    id: i.id,
    emoji: i.emoji,
    name: i.name,
    who: i.claimed_by,
    done: i.done,
  }));

  const claimedNamesByMember = new Map<string, string[]>();
  for (const item of items) {
    if (!item.who) continue;
    const list = claimedNamesByMember.get(item.who) ?? [];
    list.push(item.name);
    claimedNamesByMember.set(item.who, list);
  }

  const crew: CrewMember[] = raw.event_members
    .filter((m): m is typeof m & { profiles: NonNullable<(typeof m)['profiles']> } => !!m.profiles)
    .map((m) => {
      const p = m.profiles;
      const isMe = p.id === myId;
      const { tag, sub } = deriveCrewCaption(
        m.role,
        m.joined_at,
        claimedNamesByMember.get(p.id) ?? [],
        now,
      );
      return {
        id: p.id,
        name: isMe ? `${p.name} (you)` : p.name,
        short: isMe ? 'You' : p.name.split(' ')[0] || p.name,
        initial: p.name.trim()[0]?.toUpperCase() ?? '?',
        color: p.color,
        role: m.role,
        tag,
        sub,
      };
    })
    .sort((a, b) => (a.role === b.role ? 0 : a.role === 'host' ? -1 : 1));

  const feed: FeedEntry[] = raw.feed_entries
    .map((f) => ({ id: f.id, text: f.text, who: f.who_id, ts: new Date(f.created_at).getTime() }))
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 6);

  return {
    id: raw.id,
    code: raw.code,
    name: raw.name,
    theme: raw.theme,
    where: raw.where_text,
    date: raw.date,
    startNote: raw.start_note,
    hostId: raw.host_id,
    crew,
    items,
    mine: [],
    feed,
  };
}

type CabanaStore = {
  /** Bumped every second so countdowns, feed ages and the feed TTL stay live. */
  now: number;

  screen: Screen;
  obIdx: number;
  authMode: 'signup' | 'login';
  fName: string;
  fEmail: string;
  fPass: string;
  myColor: string;
  /** Set once signed in; drives every "is this mine" check across the app. */
  myId: string | null;
  myName: string;
  myInitial: string;

  eventTab: EventTab;
  activeId: string;
  codeDraft: string;
  addOpen: boolean;
  addMode: AddMode;
  draft: string;
  leaveOpen: boolean;
  pickerOpen: boolean;
  dateSheetOpen: boolean;
  toast: string | null;
  pack: string;
  draftName: string;
  draftDate: string;
  draftWhere: string;
  draftTheme: string;
  calMonth: string | null;
  /** Key of the one row currently swiped open, if any. */
  swipeOpen: string | null;
  events: CabanaEvent[];

  active: CabanaEvent;

  setField: <K extends keyof EditableFields>(key: K, value: EditableFields[K]) => void;
  go: (screen: Screen) => void;
  setEventTab: (tab: EventTab) => void;
  openEvent: (id: string) => void;
  setSwipeOpen: (key: string | null) => void;

  nextOnboard: () => void;
  skipOnboard: () => void;
  finishAuth: () => void;
  signOut: () => void;
  pickColor: (color: string) => void;

  toggleItem: (id: string) => void;
  toggleMine: (id: string) => void;
  removeItem: (id: string) => void;
  removeMine: (id: string) => void;
  addThing: (raw: string) => void;
  addPack: (pack: Pack, targetId: string) => void;
  joinByCode: () => void;
  createEvent: () => void;
  leaveTrip: () => void;
  nudge: (memberId?: string) => void;

  openAdd: (mode: AddMode) => void;
  closeAdd: () => void;
  startCreate: () => void;
  flash: (msg: string) => void;
};

/** Fields the UI writes straight through (inputs, sheet flags, pickers). */
type EditableFields = {
  authMode: 'signup' | 'login';
  fName: string;
  fEmail: string;
  fPass: string;
  myColor: string;
  codeDraft: string;
  draft: string;
  leaveOpen: boolean;
  pickerOpen: boolean;
  dateSheetOpen: boolean;
  pack: string;
  draftName: string;
  draftDate: string;
  draftWhere: string;
  draftTheme: string;
  calMonth: string | null;
};

const CabanaContext = createContext<CabanaStore | null>(null);

export const useCabana = () => {
  const ctx = useContext(CabanaContext);
  if (!ctx) throw new Error('useCabana must be used inside <CabanaProvider>');
  return ctx;
};

/** Friendly-ish fallback for a Postgres/RLS error the UI wasn't expecting. */
function friendlyDbError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  if (/duplicate key/i.test(raw)) return 'That code’s taken — try again';
  if (/no event with that code/i.test(raw)) return 'No event with that code 🤔';
  if (/network|fetch/i.test(raw)) return 'No connection — try again';
  return 'Something went wrong — try again';
}

export function CabanaProvider({ children }: { children: React.ReactNode }) {
  const [now, setNow] = useState(() => Date.now());
  const [hydrated, setHydrated] = useState(false);

  const [screen, setScreen] = useState<Screen>('onboard');
  const [obIdx, setObIdx] = useState(0);
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');
  const [fName, setFName] = useState('');
  const [fEmail, setFEmail] = useState('');
  const [fPass, setFPass] = useState('');
  const [myColor, setMyColor] = useState<string>(SWATCHES[0]);
  const [myId, setMyId] = useState<string | null>(null);
  const [myName, setMyName] = useState('');

  const [eventTab, setEventTabState] = useState<EventTab>('home');
  const [activeId, setActiveId] = useState('');
  const [codeDraft, setCodeDraft] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [addMode, setAddMode] = useState<AddMode>('list');
  const [draft, setDraft] = useState('');
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [dateSheetOpen, setDateSheetOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [pack, setPack] = useState('Beach weekend');
  const [draftName, setDraftName] = useState('');
  const [draftDate, setDraftDate] = useState(() => iso(new Date(Date.now() + 14 * DAY)));
  const [draftWhere, setDraftWhere] = useState('');
  const [draftTheme, setDraftTheme] = useState('Beach');
  const [calMonth, setCalMonth] = useState<string | null>(null);
  const [swipeOpen, setSwipeOpen] = useState<string | null>(null);
  const [events, setEvents] = useState<CabanaEvent[]>([]);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const authBusy = useRef(false);
  const eventsRef = useRef<CabanaEvent[]>([]);
  eventsRef.current = events;
  const myIdRef = useRef<string | null>(null);
  myIdRef.current = myId;

  // `componentDidMount`: a 1s heartbeat drives every countdown, the "3m ago"
  // stamps and the 5-minute feed window.
  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const flash = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 2000);
  }, []);

  /** Refetches everything for the signed-in person and replaces `events`. */
  const refreshEvents = useCallback(async (userId: string) => {
    const [rawEvents, rawMine] = await Promise.all([
      db.fetchMyEventsFull(userId),
      db.fetchMyMineItems(userId),
    ]);
    const mineByEvent = new Map<string, MineItem[]>();
    for (const m of rawMine) {
      const list = mineByEvent.get(m.event_id) ?? [];
      list.push({ id: m.id, name: m.name, done: m.done });
      mineByEvent.set(m.event_id, list);
    }
    const mapped = rawEvents.map((r) => ({ ...mapRawEvent(r, userId), mine: mineByEvent.get(r.id) ?? [] }));
    setEvents(mapped);
    return mapped;
  }, []);

  // The single source of truth for "are we signed in": Supabase's own auth
  // listener. It fires once immediately with whatever session is already in
  // AsyncStorage (INITIAL_SESSION), then again on every sign-in/out/refresh —
  // so this one subscription replaces both the old localStorage check and
  // the fake boot-timer.
  useEffect(() => {
    let cancelled = false;

    const handleSession = async (session: Session | null) => {
      if (cancelled) return;
      if (!session) {
        setMyId(null);
        setMyName('');
        setEvents([]);
        cancelAllReminders().catch(() => {});
        setHydrated(true);
        return;
      }

      const uid = session.user.id;
      setScreen((s) => (s === 'onboard' || s === 'auth' ? 'booting' : s));
      try {
        const profile = await db.fetchMyProfile(uid);
        if (cancelled) return;
        setMyId(uid);
        setMyName(profile.name);
        setMyColor(profile.color);
        const mapped = await refreshEvents(uid);
        if (cancelled) return;
        setScreen((s) => (s === 'booting' ? 'events' : s));
        registerForPushNotifications(uid).catch(() => {});
        reconcileReminders(mapped).catch(() => {});
      } catch {
        if (!cancelled) flash('Couldn’t load your account — try again');
      } finally {
        if (!cancelled) setHydrated(true);
      }
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Realtime: any change to an event's list/crew/feed among events the
  // person belongs to triggers one coalesced refetch, so claims and joins
  // made by other people on their own devices show up here live.
  const eventIdsKey = events.map((e) => e.id).sort().join(',');
  useEffect(() => {
    if (!myId || events.length === 0) return;
    let debounce: ReturnType<typeof setTimeout> | null = null;
    const channel = db.subscribeToEvents(
      events.map((e) => e.id),
      () => {
        if (debounce) clearTimeout(debounce);
        debounce = setTimeout(() => {
          refreshEvents(myId).catch(() => {});
        }, 400);
      },
    );
    return () => {
      if (debounce) clearTimeout(debounce);
      if (channel) supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myId, eventIdsKey]);

  const active = useMemo(() => events.find((e) => e.id === activeId) ?? events[0] ?? EMPTY_EVENT, [events, activeId]);
  const myInitial = myName.trim()[0]?.toUpperCase() ?? 'Y';

  const setField = useCallback(
    <K extends keyof EditableFields>(key: K, value: EditableFields[K]) => {
      const setters: { [P in keyof EditableFields]: (v: EditableFields[P]) => void } = {
        authMode: setAuthMode,
        fName: setFName,
        fEmail: setFEmail,
        fPass: setFPass,
        myColor: setMyColor,
        codeDraft: setCodeDraft,
        draft: setDraft,
        leaveOpen: setLeaveOpen,
        pickerOpen: setPickerOpen,
        dateSheetOpen: setDateSheetOpen,
        pack: setPack,
        draftName: setDraftName,
        draftDate: setDraftDate,
        draftWhere: setDraftWhere,
        draftTheme: setDraftTheme,
        calMonth: setCalMonth,
      };
      setters[key](value);
    },
    [],
  );

  // Every screen change also dismisses whatever was floating above it.
  const go = useCallback((next: Screen) => {
    setScreen(next);
    setAddOpen(false);
    setPickerOpen(false);
    setSwipeOpen(null);
  }, []);

  const setEventTab = useCallback((tab: EventTab) => {
    setEventTabState(tab);
    setSwipeOpen(null);
  }, []);

  const openEvent = useCallback((id: string) => {
    setActiveId(id);
    setEventTabState('home');
    setScreen('event');
  }, []);

  const nextOnboard = useCallback(() => {
    setObIdx((i) => {
      if (i < 2) return i + 1;
      setScreen('auth');
      return i;
    });
  }, []);

  const skipOnboard = useCallback(() => setScreen('auth'), []);

  const finishAuth = useCallback(async () => {
    if (authBusy.current) return;
    authBusy.current = true;
    try {
      if (authMode === 'signup') {
        await signUp({ name: fName.trim(), email: fEmail.trim(), password: fPass, color: myColor });
      } else {
        await signIn({ email: fEmail.trim(), password: fPass });
      }
      setFPass('');
      // The auth listener above takes it from here — booting screen, data
      // load, and the transition to 'events' all happen off the SIGNED_IN
      // event it receives.
    } catch (err) {
      flash(authErrorMessage(err));
    } finally {
      authBusy.current = false;
    }
  }, [authMode, fName, fEmail, fPass, myColor, flash]);

  const signOut = useCallback(() => {
    const uid = myIdRef.current;
    (async () => {
      if (uid) await unregisterPushNotifications(uid);
      await cancelAllReminders().catch(() => {});
      await authSignOut().catch(() => {});
    })();
    setScreen('onboard');
    setObIdx(0);
    setAuthMode('signup');
    setFName('');
    setFEmail('');
    setFPass('');
    setMyColor(SWATCHES[0]);
  }, []);

  const pickColor = useCallback(
    (color: string) => {
      setMyColor(color);
      if (myId) db.updateMyColor(myId, color).catch(() => flash('Couldn’t save that colour'));
    },
    [myId, flash],
  );

  /**
   * Tapping a row toggles it — unless a swipe is open or the tap was really
   * the end of a drag, in which case it just closes the swipe. Anyone in the
   * crew can free up an item someone else claimed, same as the original
   * design's fully collaborative list.
   */
  const toggleItem = useCallback(
    (id: string) => {
      if (swipeOpen) {
        setSwipeOpen(null);
        return;
      }
      const it = active.items.find((i) => i.id === id);
      if (!it || !myId) return;
      const next = !it.done;
      (async () => {
        try {
          if (next) {
            await db.claimEventItem(id, myId);
            await db.postFeedEntry(active.id, `${myName} packed the ${it.name.toLowerCase()}`, myId);
            flash('Sorted! 🎉');
            db
              .notifyCrew({
                eventId: active.id,
                title: active.name,
                body: `${myName} packed the ${it.name.toLowerCase()}`,
              })
              .catch(() => {});
          } else {
            await db.releaseEventItem(id);
            await db.postFeedEntry(active.id, `${it.name} is up for grabs again`, myId);
          }
          await refreshEvents(myId);
        } catch (err) {
          flash(friendlyDbError(err));
        }
      })();
    },
    [active, myId, myName, flash, refreshEvents, swipeOpen],
  );

  const toggleMine = useCallback(
    (id: string) => {
      if (swipeOpen) {
        setSwipeOpen(null);
        return;
      }
      const it = active.mine.find((i) => i.id === id);
      if (!it || !myId) return;
      db.toggleMineItem(id, !it.done)
        .then(() => refreshEvents(myId))
        .catch(() => flash(friendlyDbError(new Error())));
    },
    [active, myId, flash, refreshEvents, swipeOpen],
  );

  const removeItem = useCallback(
    (id: string) => {
      if (!myId) return;
      const it = active.items.find((i) => i.id === id);
      setSwipeOpen(null);
      (async () => {
        try {
          if (it) await db.postFeedEntry(active.id, `${myName} took ${it.name.toLowerCase()} off the list`, myId);
          await db.removeEventItem(id);
          await refreshEvents(myId);
          flash('Off the list');
        } catch {
          flash(friendlyDbError(new Error()));
        }
      })();
    },
    [active, myId, myName, flash, refreshEvents],
  );

  const removeMine = useCallback(
    (id: string) => {
      if (!myId) return;
      setSwipeOpen(null);
      db
        .removeMineItem(id)
        .then(() => refreshEvents(myId))
        .then(() => flash('Removed from your bag'))
        .catch(() => flash(friendlyDbError(new Error())));
    },
    [myId, flash, refreshEvents],
  );

  const addThing = useCallback(
    (raw: string) => {
      const p = splitThing(raw);
      if (!p || !myId) return;
      setDraft('');
      setAddOpen(false);
      (async () => {
        try {
          if (addMode === 'mine') {
            await db.addMineItem(active.id, myId, p.name);
            flash('In your bag 🎒');
          } else {
            await db.addEventItem(active.id, p.emoji, p.name);
            await db.postFeedEntry(active.id, `${myName} added ${p.name.toLowerCase()} to the list`, myId);
            flash('On the list ✨');
            db
              .notifyCrew({
                eventId: active.id,
                title: active.name,
                body: `${myName} added ${p.name.toLowerCase()} to the list`,
              })
              .catch(() => {});
          }
          await refreshEvents(myId);
        } catch {
          flash(friendlyDbError(new Error()));
        }
      })();
    },
    [addMode, active, myId, myName, flash, refreshEvents],
  );

  /** Merge a starter pack into an event, skipping anything already listed. */
  const addPack = useCallback(
    (packToAdd: Pack, targetId: string) => {
      if (!myId) return;
      const target = eventsRef.current.find((e) => e.id === targetId) ?? active;
      const existing = target.items.map((i) => i.name.toLowerCase());
      const fresh = packToAdd.items
        .map((x) => splitThing(x))
        .filter((p): p is { emoji: string; name: string } => !!p)
        .filter((p) => existing.indexOf(p.name.toLowerCase()) < 0);

      setActiveId(target.id);
      setScreen('event');
      setEventTabState('list');
      setPickerOpen(false);

      (async () => {
        try {
          await db.addEventItems(target.id, fresh);
          await db.postFeedEntry(target.id, `${myName} added the ${packToAdd.name.toLowerCase()} starter list`, myId);
          flash(`${fresh.length} things added 🧺`);
          db
            .notifyCrew({
              eventId: target.id,
              title: target.name,
              body: `${myName} added the ${packToAdd.name.toLowerCase()} starter list`,
            })
            .catch(() => {});
          await refreshEvents(myId);
        } catch {
          flash(friendlyDbError(new Error()));
        }
      })();
    },
    [active, myId, myName, flash, refreshEvents],
  );

  const joinByCode = useCallback(() => {
    const code = codeDraft.trim().toUpperCase();
    if (!code || !myId) {
      if (!code) flash('Type a code first');
      return;
    }
    (async () => {
      try {
        const already = eventsRef.current.some((e) => (e.code ?? '').toUpperCase() === code);
        const event = await db.joinEventByCode(code);
        setCodeDraft('');
        setActiveId(event.id);
        setScreen('event');
        setEventTabState('home');
        flash(already ? 'You’re already in 🎉' : 'You’re in! 🎉');
        if (!already) {
          db
            .notifyCrew({ eventId: event.id, title: event.name, body: `${myName} joined the crew` })
            .catch(() => {});
        }
        await refreshEvents(myId);
      } catch (err) {
        flash(friendlyDbError(err));
      }
    })();
  }, [codeDraft, myId, myName, flash, refreshEvents]);

  const createEvent = useCallback(() => {
    if (!myId) return;
    const vibe = findVibe(draftTheme);
    const name = draftName.trim() || vibe.label;
    const d = fromIso(draftDate, 18);
    const codeBase =
      (name.replace(/[^A-Za-z0-9]/g, '').slice(0, 5).toUpperCase() || 'CABANA') +
      String(d.getFullYear()).slice(2);
    const where = draftWhere.trim();
    const startNote = `Kicks off ${fmt(d)}`;

    setDraftName('');
    setDraftWhere('');
    setDateSheetOpen(false);

    (async () => {
      try {
        let created;
        try {
          created = await db.createEvent({ code: codeBase, name, theme: vibe.name, where, date: d.toISOString(), startNote });
        } catch {
          // most likely a code collision — one retry with a random suffix
          const code = codeBase + String(Math.floor(Math.random() * 90 + 10));
          created = await db.createEvent({ code, name, theme: vibe.name, where, date: d.toISOString(), startNote });
        }
        setActiveId(created.id);
        setScreen('invite');
        setEventTabState('home');
        await refreshEvents(myId);
      } catch {
        flash(friendlyDbError(new Error()));
      }
    })();
  }, [myId, draftTheme, draftName, draftDate, draftWhere, flash, refreshEvents]);

  /**
   * Leaving frees up everything you'd claimed and wipes your private list for
   * that trip, then drops you on the next upcoming event you're still in.
   */
  const leaveTrip = useCallback(() => {
    if (!myId) return;
    const id = activeId;
    const fallback = eventsRef.current.find(
      (e) => e.id !== id && new Date(e.date).getTime() > Date.now(),
    );
    setLeaveOpen(false);
    setScreen('events');
    setEventTabState('home');
    if (fallback) setActiveId(fallback.id);
    (async () => {
      try {
        await db.leaveEvent(id);
        await refreshEvents(myId);
        flash('You left the trip');
      } catch {
        flash(friendlyDbError(new Error()));
      }
    })();
  }, [activeId, myId, flash, refreshEvents]);

  /** "Nudge crew" pushes everyone who hasn't claimed anything; a per-row Nudge targets just them. */
  const nudge = useCallback(
    (memberId?: string) => {
      const target = memberId ? active.crew.find((c) => c.id === memberId) : null;
      flash(target ? `Nudged ${target.short} 📣` : 'Nudge sent 📣');
      db
        .notifyCrew({
          eventId: active.id,
          title: active.name,
          body: memberId
            ? `${myName} is nudging you to pack for ${active.name.toLowerCase()}!`
            : `${myName} says: don't forget to pack for ${active.name.toLowerCase()}!`,
          onlyUserId: memberId,
        })
        .catch(() => {});
    },
    [active, myName, flash],
  );

  const openAdd = useCallback((mode: AddMode) => {
    setAddMode(mode);
    setDraft('');
    setAddOpen(true);
  }, []);

  const closeAdd = useCallback(() => {
    setAddOpen(false);
    setDraft('');
  }, []);

  const startCreate = useCallback(() => {
    setScreen('create');
    setAddOpen(false);
    setPickerOpen(false);
    setDateSheetOpen(false);
    setDraftName('');
    setDraftWhere('');
  }, []);

  const value: CabanaStore = {
    now,
    screen,
    obIdx,
    authMode,
    fName,
    fEmail,
    fPass,
    myColor,
    myId,
    myName,
    myInitial,
    eventTab,
    activeId,
    codeDraft,
    addOpen,
    addMode,
    draft,
    leaveOpen,
    pickerOpen,
    dateSheetOpen,
    toast,
    pack,
    draftName,
    draftDate,
    draftWhere,
    draftTheme,
    calMonth,
    swipeOpen,
    events,
    active,
    setField,
    go,
    setEventTab,
    openEvent,
    setSwipeOpen,
    nextOnboard,
    skipOnboard,
    finishAuth,
    signOut,
    pickColor,
    toggleItem,
    toggleMine,
    removeItem,
    removeMine,
    addThing,
    addPack,
    joinByCode,
    createEvent,
    leaveTrip,
    nudge,
    openAdd,
    closeAdd,
    startCreate,
    flash,
  };

  // Hold the first paint until the initial session check resolves, so a
  // signed-in person never sees a frame of onboarding before the skeleton.
  if (!hydrated) return null;

  return <CabanaContext.Provider value={value}>{children}</CabanaContext.Provider>;
}
