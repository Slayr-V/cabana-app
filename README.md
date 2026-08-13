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
  CabanaApp.tsx         Screen switch + bottom bar + overlays
  state.tsx             All app state and actions (ported from the design's DCLogic class)
  data.ts               Vibes, starter packs, onboarding slides
  theme.ts              Colours, fonts, shadows
  type.ts               Weight-indexed font families
  utils.ts              Date formatting, calendar building, countdown maths

  components/           anim, Gradient, SwipeRow, Sheet, Toast, TabBars, icons, common
  screens/              One file per screen; event/ holds the four event tabs
  sheets/               The four bottom sheets
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

### State

All state is local and in-memory, seeded with two upcoming events and one past
one — the design specifies no backend. The only thing that persists is a
`cabana.account` flag in AsyncStorage, which decides whether a launch shows
onboarding or goes straight to the loading skeleton.

A 1-second heartbeat in `CabanaProvider` drives the countdowns, the "3m ago"
stamps on the feed, and the five-minute window after which updates drop off.
