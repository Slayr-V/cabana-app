// The whole app's state, ported from the `class Component extends DCLogic`
// block at the bottom of `Cabana.dc.html`. The design is a single-surface
// state machine — one scrolling area, one bottom bar, overlays on top — and
// swapping screens never animates or pushes a route. This provider keeps
// that shape exactly; the router only ever mounts one screen.

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { DAY, FEED_TTL, findVibe, type Pack } from './data';
import { CREW_COLORS, SWATCHES } from './theme';
import { fmt, fromIso, iso, splitThing } from './utils';

const ACCOUNT_KEY = 'cabana.account';

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
  name: string;
  /** Short display name; "You" identifies the signed-in person. */
  short: string;
  initial: string;
  color: string;
  tag: string;
  sub: string;
  pending?: boolean;
};

export type ListItem = {
  id: string;
  emoji: string;
  name: string;
  /** Short name of whoever claimed it, or null while it's up for grabs. */
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
  crew: CrewMember[];
  items: ListItem[];
  mine: MineItem[];
  feed: FeedEntry[];
  pastLine?: string;
  left?: boolean;
};

type AddMode = 'list' | 'mine';

/** Seed events, built relative to "now" so the countdown always reads well. */
const seedEvents = (): CabanaEvent[] => {
  const now = new Date();
  const at = (days: number, hour: number) => {
    const d = new Date(now.getTime() + days * DAY);
    d.setHours(hour, 0, 0, 0);
    return d.toISOString();
  };

  return [
    {
      id: 'e1',
      code: 'PONTA26',
      name: 'Ponta Do Ouro',
      theme: 'Beach',
      where: 'Mozambique',
      date: at(3, 16),
      startNote: '',
      crew: [
        { name: 'Sam (you)', short: 'You', initial: 'S', color: CREW_COLORS.You, tag: 'host', sub: 'Host · nothing ticked off yet' },
        { name: 'Fifi', short: 'Fifi', initial: 'F', color: CREW_COLORS.Fifi, tag: '2 sorted', sub: 'Cooler box, drinks · all packed' },
        { name: 'Jason', short: 'Jason', initial: 'J', color: CREW_COLORS.Jason, tag: 'in', sub: 'Nothing ticked off yet' },
        { name: 'Mia', short: 'Mia', initial: 'M', color: CREW_COLORS.Mia, tag: 'new 👋', sub: 'Sunscreen · joined 1h ago' },
        { name: 'Thabo', short: 'Thabo', initial: 'T', color: CREW_COLORS.Thabo, tag: 'in', sub: 'Nothing ticked off yet' },
        { name: 'Lebo', short: 'Lebo', initial: 'L', color: CREW_COLORS.Lebo, tag: 'invited', sub: 'Invited · hasn’t opened it yet', pending: true },
      ],
      items: [
        { id: '1', emoji: '🧊', name: 'Cooler box', who: 'Fifi', done: true },
        { id: '2', emoji: '🔊', name: 'Speaker', who: null, done: false },
        { id: '3', emoji: '🍹', name: 'Drinks & mixers', who: 'Fifi', done: true },
        { id: '4', emoji: '🧴', name: 'Sunscreen', who: 'Mia', done: true },
        { id: '5', emoji: '🍖', name: 'Braai meat', who: null, done: false },
        { id: '6', emoji: '🧺', name: 'Picnic blanket', who: null, done: false },
        { id: '7', emoji: '❄️', name: 'Ice', who: null, done: false },
        { id: '8', emoji: '🎲', name: 'Cards & games', who: null, done: false },
      ],
      mine: [
        { id: 'm1', name: 'Swimsuit (the good one)', done: true },
        { id: 'm2', name: 'Charger + power bank', done: false },
        { id: 'm3', name: 'Passport', done: true },
        { id: 'm4', name: 'Meds & plasters', done: false },
      ],
      feed: [
        { id: 'f1', text: 'Fifi ticked off the drinks', who: 'Fifi', ts: now.getTime() - 40000 },
        { id: 'f2', text: 'Mia joined the crew', who: 'Mia', ts: now.getTime() - 95000 },
        { id: 'f3', text: 'Fifi ticked off the cooler box', who: 'Fifi', ts: now.getTime() - 170000 },
      ],
    },
    {
      id: 'e2',
      code: 'NOMI30',
      name: 'Nomi turns 30',
      theme: 'Birthday',
      where: 'The rooftop',
      date: at(30, 19),
      startNote: '',
      crew: [
        { name: 'Sam (you)', short: 'You', initial: 'S', color: CREW_COLORS.You, tag: 'going', sub: 'Nothing claimed yet' },
        { name: 'Nomi', short: 'Nomi', initial: 'N', color: CREW_COLORS.Nomi, tag: 'birthday', sub: 'The reason we’re here' },
        { name: 'Fifi', short: 'Fifi', initial: 'F', color: CREW_COLORS.Fifi, tag: 'going', sub: 'Nothing claimed yet' },
      ],
      items: [],
      mine: [],
      feed: [{ id: 'f4', text: 'Nomi’s birthday is locked in', who: 'Nomi', ts: now.getTime() - 60000 }],
    },
    {
      id: 'e0',
      name: 'Winter braai',
      theme: 'Braai',
      where: 'Jason’s place',
      date: new Date(now.getTime() - 26 * DAY).toISOString(),
      startNote: '',
      crew: [],
      items: [],
      mine: [],
      feed: [],
      pastLine: 'Everyone brought everything. Rare.',
    },
  ];
};

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

  toggleItem: (id: string) => void;
  toggleMine: (id: string) => void;
  removeItem: (id: string) => void;
  removeMine: (id: string) => void;
  addThing: (raw: string) => void;
  addPack: (pack: Pack, targetId: string) => void;
  joinByCode: () => void;
  createEvent: () => void;
  leaveTrip: () => void;

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
  const [eventTab, setEventTabState] = useState<EventTab>('home');
  const [activeId, setActiveId] = useState('e1');
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
  const [events, setEvents] = useState<CabanaEvent[]>(seedEvents);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bootTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // `componentDidMount`: a 1s heartbeat drives every countdown, the "3m ago"
  // stamps and the 5-minute feed window.
  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    if (bootTimer.current) clearTimeout(bootTimer.current);
  }, []);

  const boot = useCallback(() => {
    setScreen('booting');
    if (bootTimer.current) clearTimeout(bootTimer.current);
    bootTimer.current = setTimeout(() => setScreen('events'), 1700);
  }, []);

  // Returning users skip straight past onboarding into the skeleton, exactly
  // as the mockup's localStorage check does.
  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(ACCOUNT_KEY)
      .then((value) => {
        if (cancelled) return;
        if (value === '1') boot();
        setHydrated(true);
      })
      .catch(() => {
        if (!cancelled) setHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, [boot]);

  const flash = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 2000);
  }, []);

  const active = useMemo(
    () => events.find((e) => e.id === activeId) ?? events[0],
    [events, activeId],
  );

  const patchActive = useCallback(
    (fn: (e: CabanaEvent) => CabanaEvent) => {
      setEvents((prev) => prev.map((e) => (e.id === activeId ? fn(e) : e)));
    },
    [activeId],
  );

  /** Prepend an update and drop anything already past the 5-minute window. */
  const pushFeed = useCallback(
    (entry: { text: string; who: string | null }) => {
      const next: FeedEntry = { id: `f${Date.now()}${Math.random()}`, ts: Date.now(), ...entry };
      patchActive((e) => ({
        ...e,
        feed: [next, ...e.feed.filter((x) => Date.now() - x.ts < FEED_TTL)].slice(0, 6),
      }));
    },
    [patchActive],
  );

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

  const finishAuth = useCallback(() => {
    AsyncStorage.setItem(ACCOUNT_KEY, '1').catch(() => {});
    setFPass('');
    boot();
  }, [boot]);

  const signOut = useCallback(() => {
    AsyncStorage.removeItem(ACCOUNT_KEY).catch(() => {});
    setScreen('onboard');
    setObIdx(0);
    setAuthMode('signup');
    setFName('');
    setFEmail('');
    setFPass('');
  }, []);

  /**
   * Tapping a row toggles it — unless a swipe is open or the tap was really
   * the end of a drag, in which case it just closes the swipe.
   */
  const toggleItem = useCallback(
    (id: string) => {
      if (swipeOpen) {
        setSwipeOpen(null);
        return;
      }
      const it = active.items.find((i) => i.id === id);
      if (!it) return;
      const next = !it.done;
      const who = it.who ?? 'You';
      patchActive((e) => ({
        ...e,
        items: e.items.map((i) => (i.id === id ? { ...i, done: next, who: next ? who : null } : i)),
      }));
      if (next) {
        pushFeed({ text: `${who} packed the ${it.name.toLowerCase()}`, who });
        flash('Sorted! 🎉');
      } else {
        pushFeed({ text: `${it.name} is up for grabs again`, who: null });
      }
    },
    [active, patchActive, pushFeed, flash, swipeOpen],
  );

  const toggleMine = useCallback(
    (id: string) => {
      if (swipeOpen) {
        setSwipeOpen(null);
        return;
      }
      patchActive((e) => ({
        ...e,
        mine: e.mine.map((i) => (i.id === id ? { ...i, done: !i.done } : i)),
      }));
    },
    [patchActive, swipeOpen],
  );

  const removeItem = useCallback(
    (id: string) => {
      const it = active.items.find((i) => i.id === id);
      if (it) pushFeed({ text: `You took ${it.name.toLowerCase()} off the list`, who: 'You' });
      patchActive((e) => ({ ...e, items: e.items.filter((i) => i.id !== id) }));
      setSwipeOpen(null);
      flash('Off the list');
    },
    [active, patchActive, pushFeed, flash],
  );

  const removeMine = useCallback(
    (id: string) => {
      patchActive((e) => ({ ...e, mine: e.mine.filter((i) => i.id !== id) }));
      setSwipeOpen(null);
      flash('Removed from your bag');
    },
    [patchActive, flash],
  );

  const addThing = useCallback(
    (raw: string) => {
      const p = splitThing(raw);
      if (!p) return;
      if (addMode === 'mine') {
        patchActive((e) => ({
          ...e,
          mine: [...e.mine, { id: `m${Date.now()}`, name: p.name, done: false }],
        }));
        flash('In your bag 🎒');
      } else {
        patchActive((e) => ({
          ...e,
          items: [...e.items, { id: String(Date.now()), emoji: p.emoji, name: p.name, who: null, done: false }],
        }));
        pushFeed({ text: `You added ${p.name.toLowerCase()} to the list`, who: 'You' });
        flash('On the list ✨');
      }
      setDraft('');
      setAddOpen(false);
    },
    [addMode, patchActive, pushFeed, flash],
  );

  /** Merge a starter pack into an event, skipping anything already listed. */
  const addPack = useCallback(
    (packToAdd: Pack, targetId: string) => {
      const target = events.find((e) => e.id === targetId) ?? active;
      const existing = target.items.map((i) => i.name.toLowerCase());
      const fresh = packToAdd.items
        .map((x) => splitThing(x))
        .filter((p): p is { emoji: string; name: string } => !!p)
        .filter((p) => existing.indexOf(p.name.toLowerCase()) < 0)
        .map((p, n) => ({
          id: String(Date.now() + n),
          emoji: p.emoji,
          name: p.name,
          who: null,
          done: false,
        }));

      setEvents((prev) =>
        prev.map((e) =>
          e.id === target.id
            ? {
                ...e,
                items: [...e.items, ...fresh],
                feed: [
                  {
                    id: `f${Date.now()}`,
                    text: `You added the ${packToAdd.name.toLowerCase()} starter list`,
                    who: 'You',
                    ts: Date.now(),
                  },
                  ...e.feed,
                ].slice(0, 6),
              }
            : e,
        ),
      );
      setActiveId(target.id);
      setScreen('event');
      setEventTabState('list');
      setPickerOpen(false);
      flash(`${fresh.length} things added 🧺`);
    },
    [events, active, flash],
  );

  const joinByCode = useCallback(() => {
    const code = codeDraft.trim().toUpperCase();
    if (!code) {
      flash('Type a code first');
      return;
    }
    const target = events.find((e) => (e.code ?? '').toUpperCase() === code);
    if (!target) {
      flash('No event with that code 🤔');
      return;
    }
    const inIt = target.crew.some((c) => c.short === 'You');
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id !== target.id) return e;
        if (inIt) return { ...e, left: false };
        return {
          ...e,
          left: false,
          crew: [
            ...e.crew,
            {
              name: 'Sam (you)',
              short: 'You',
              initial: 'S',
              color: CREW_COLORS.You,
              tag: 'new 👋',
              sub: 'Just joined · nothing ticked off yet',
            },
          ],
          feed: [
            { id: `f${Date.now()}`, text: `You joined with code ${code}`, who: 'You', ts: Date.now() },
            ...e.feed,
          ].slice(0, 6),
        };
      }),
    );
    setCodeDraft('');
    setActiveId(target.id);
    setScreen('event');
    setEventTabState('home');
    flash(inIt ? 'You’re already in 🎉' : 'You’re in! 🎉');
  }, [codeDraft, events, flash]);

  const createEvent = useCallback(() => {
    const vibe = findVibe(draftTheme);
    const name = draftName.trim() || vibe.label;
    const d = fromIso(draftDate, 18);
    const id = `e${Date.now()}`;
    const created: CabanaEvent = {
      id,
      code:
        (name.replace(/[^A-Za-z0-9]/g, '').slice(0, 5).toUpperCase() || 'CABANA') +
        String(d.getFullYear()).slice(2),
      name,
      theme: vibe.name,
      where: draftWhere.trim(),
      date: d.toISOString(),
      startNote: `Kicks off ${fmt(d)}`,
      crew: [
        {
          name: 'Sam (you)',
          short: 'You',
          initial: 'S',
          color: CREW_COLORS.You,
          tag: 'host',
          sub: 'Host · nothing claimed yet',
        },
      ],
      items: [],
      mine: [],
      feed: [{ id: `f${id}`, text: `You started ${name}`, who: 'You', ts: Date.now() }],
    };
    setEvents((prev) => [...prev, created]);
    setActiveId(id);
    setScreen('invite');
    setEventTabState('home');
    setDraftName('');
    setDraftWhere('');
    setDateSheetOpen(false);
  }, [draftTheme, draftName, draftDate, draftWhere]);

  /**
   * Leaving frees up everything you'd claimed and wipes your private list for
   * that trip, then drops you on the next upcoming event you're still in.
   */
  const leaveTrip = useCallback(() => {
    const id = activeId;
    const fallback = events.find(
      (e) => e.id !== id && new Date(e.date).getTime() > Date.now() && !e.left,
    );
    setEvents((prev) =>
      prev.map((e) =>
        e.id !== id
          ? e
          : {
              ...e,
              left: true,
              crew: e.crew.filter((c) => c.short !== 'You'),
              items: e.items.map((i) => (i.who === 'You' ? { ...i, who: null, done: false } : i)),
              mine: [],
            },
      ),
    );
    setLeaveOpen(false);
    setScreen('events');
    setEventTabState('home');
    if (fallback) setActiveId(fallback.id);
    flash('You left the trip');
  }, [activeId, events, flash]);

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
    toggleItem,
    toggleMine,
    removeItem,
    removeMine,
    addThing,
    addPack,
    joinByCode,
    createEvent,
    leaveTrip,
    openAdd,
    closeAdd,
    startCreate,
    flash,
  };

  // Hold the first paint until the stored account flag is read, so returning
  // users never see a frame of onboarding before the skeleton.
  if (!hydrated) return null;

  return <CabanaContext.Provider value={value}>{children}</CabanaContext.Provider>;
}

/** Whoever claimed an item gets their colour; "You" always uses your picker. */
export const colorFor = (who: string | null, myColor: string) =>
  who === 'You' ? myColor : (who && CREW_COLORS[who]) || '#F2F2F5';
