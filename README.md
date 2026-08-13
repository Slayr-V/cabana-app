# Cabana

Group event planning — the trip, the braai and the birthday in one place, so
nothing lives in 400 unread messages.

Built with Expo (SDK 54) + React Native, implementing the Claude Design handoff
`Cabana.dc.html` exactly.

## Running it

```bash
npm install
npx expo start          # then scan the QR with Expo Go
npx expo start --web    # or run it in a browser
```

The project is pinned to **Expo SDK 54** so it runs in the published Expo Go
app. Versions come from SDK 54's own `bundledNativeModules.json` — see
`AGENTS.md` before changing any of them.

If the CLI can't reach Expo's API (proxied or offline environments), start with
`EXPO_OFFLINE=1 npx expo start --web` to skip the dependency-version check.

### Backend setup

The app needs a Supabase project to sign in against. Copy `.env.example` to
`.env` and fill in your project's URL and anon key (Project Settings → API),
then apply the schema and deploy the notification function:

```bash
npx supabase login --token <personal-access-token>
npx supabase link --project-ref <your-project-ref>
npx supabase db push               # applies supabase/migrations/
npx supabase config push           # applies supabase/config.toml (turns off email confirmation)
npx supabase functions deploy notify-crew
```

The edge function needs `SUPABASE_URL`, `SUPABASE_ANON_KEY` and
`SUPABASE_SERVICE_ROLE_KEY` available to it — Supabase sets the first and
third of those automatically for every deployed function; set the anon key
yourself if it isn't already present:

```bash
npx supabase secrets set SUPABASE_ANON_KEY=<your-anon-key>
```

Push notifications only work on physical devices (not simulators), and only
outside Expo Go once the project is linked to an EAS project (`eas init`) —
without one, `expo-notifications` still works for local reminders, just not
for tokens tied to a standalone build.

## What's in it

Ten screens plus four bottom sheets, all on one surface:

| Screen | What it does |
| --- | --- |
| Onboarding | Three gradient slides, skippable |
| Sign up / Log in | Segmented pill, plus the six-colour picker |
| Loading | Shimmering skeleton for returning users |
| Events | Your upcoming events, each with a live countdown |
| Event › Home | List status, what still needs a hero, crew, updates feed |
| Event › Group list | Who's bringing what — tap to claim, swipe to remove |
| Event › My stuff | Your private packing list for that event |
| Event › Crew | The roster, with a Nudge for unopened invites |
| Good Stuff | Join by code, plus six starter packs |
| Me | Your colour, stats and settings |
| Create | Name it, pick a date and place, choose a vibe |
| Invite | The celebration screen with share options |
| Pack | A starter pack's contents |

Sheets: add a thing, leave the trip, pick an event, pick a date.

## Architecture

The design is a single-surface state machine — one scrolling area, one bottom
bar, overlays on top — and switching screens never pushes a route or animates.
The implementation keeps that shape:

```
app/
  _layout.tsx           Fonts, splash, providers. One route.
  index.tsx             Renders <CabanaApp />

features/cabana/
  CabanaApp.tsx          Screen switch + bottom bar + overlays
  state.tsx              All app state and actions — now backed by Supabase
  data.ts                Vibes, starter packs, onboarding slides
  theme.ts               Colours, fonts, shadows
  type.ts                Weight-indexed font families
  utils.ts               Date formatting, calendar building, countdown maths

  supabase/
    client.ts            The one Supabase client (session persisted to AsyncStorage)
    auth.ts               Sign-up/log-in/log-out + friendly error copy
    queries.ts             Every DB read/write + the realtime subscription
    types.ts                Hand-written Database type (regenerate once the project's live)

  notifications/
    push.ts                Expo push token registration
    reminders.ts            Local on-device countdown reminders

  components/           anim, Gradient, SwipeRow, Sheet, Toast, TabBars, icons, common
  screens/              One file per screen; event/ holds the four event tabs
  sheets/               The four bottom sheets

supabase/
  migrations/0001_init.sql   Schema, RLS policies, and the create/join/leave RPCs
  functions/notify-crew/     Edge function that fans a push out to an event's crew
  config.toml                 Auth config (email confirmation off, to match the design's UX)
```

### Notes on the port

A few things needed real translation rather than transcription, since CSS and
React Native disagree about them:

- **Fonts.** The design leans on CSS weight synthesis from two Google Fonts.
  RN has no synthesis, so every weight used maps to a real loaded face
  (`features/cabana/type.ts`).
- **Gradients.** CSS angles are converted to expo-linear-gradient's unit-square
  `start`/`end` points by `gradientPoints()` in `components/anim.tsx`.
- **Outlines.** CSS `outline` doesn't affect layout, so a selected swatch can
  grow a ring without nudging its neighbours. RN has no outline — `<Ring>`
  draws one as an absolutely positioned border at a negative inset.
- **Keyframes.** The five `@keyframes` become `Animated` wrappers (`Float`,
  `Rise`, `Shimmer`, `Pop`, `Fade`) with the same durations, delays and easings.
- **Swipe to remove.** The design drives this from raw pointer events;
  `SwipeRow` uses PanResponder with the same numbers (-104 open, -112 clamp,
  -50 snap threshold), which additionally lets vertical scrolling win.

### State and backend

Auth, profiles, events, crew, the group list, private lists and the live feed
are all real, backed by Supabase — a signed-up person's account and data
persist across launches and devices, not just a local flag. `CabanaProvider`
subscribes to Supabase's own auth listener as the single source of truth for
whether someone's signed in, fetches everything they belong to in one nested
query, and re-subscribes to realtime changes on the group list, crew and feed
so claims and joins made on someone else's phone show up live.

Mutations go through a small number of security-definer Postgres functions
(`create_event`, `join_event_by_code`, `leave_event`) rather than direct
table writes, so row-level security policies can stay narrow — a client never
needs broad read access to an `events` table just to look someone's event up
by its join code. See `supabase/migrations/0001_init.sql` for the full
schema and its comments.

A 1-second heartbeat in `CabanaProvider` still drives the countdowns, the
"3m ago" stamps on the feed, and the five-minute window after which updates
drop off — that part stayed exactly as the design specifies it.

### Notifications

Two kinds, matching what the design already gestures at with its "Nudge
crew" button and live updates feed:

- **Local reminders** — `features/cabana/notifications/reminders.ts`
  schedules on-device notifications as each event's countdown crosses 3 days,
  1 day, and the morning of. No backend involved; rebuilt from scratch
  whenever the event list changes.
- **Crew-activity push** — claiming an item, adding to the list, joining an
  event, or tapping Nudge all call the `notify-crew` edge function, which
  verifies the caller is actually a member of that event (from their own JWT,
  never a client-supplied field) and fans a real push out to the rest of the
  crew via Expo's push API. Each person's Expo push token lives on their
  `profiles` row, registered on sign-in.

Two adaptations from the mock worth knowing about: the design's "invited,
not yet joined" pending crew badge has no real-backend equivalent — a crew
row only exists once someone has actually joined by code — so the Crew tab's
Nudge button is repurposed for members who've joined but claimed nothing yet,
and it now sends a real push instead of a mocked toast.
