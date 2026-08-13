// Design tokens, transcribed verbatim from the Claude Design handoff
// (`Cabana.dc.html`). The mockup inlines every value as a literal, so this
// file is the de-duplicated version of exactly those literals — nothing here
// is invented, rounded or "improved". Where the mockup uses a one-off value
// for a single element it stays inline at the call site rather than being
// promoted to a token, so this set keeps matching the design's own vocabulary.

/** The single ink colour the whole app is drawn in. */
export const INK = '#241F1B';

/** Inactive tab-bar tint (`dim` in the handoff's renderVals). */
export const DIM = 'rgba(36,31,27,.35)';

export const WHITE = '#FFFFFF';

/** Destructive text/fill (Leave trip, Sign out, swipe-to-remove). */
export const DANGER = '#B4544A';
export const DANGER_SWIPE_BG = '#F0A9A0';
export const DANGER_SWIPE_TEXT = '#5A1F19';

/**
 * Ink at partial alpha. The handoff writes these as `rgba(36,31,27,.NN)`
 * literals dozens of times; `ink(0.5)` is the same value, spelled once.
 */
export const ink = (alpha: number) => `rgba(36,31,27,${alpha})`;

/**
 * Font families. The handoff loads Outfit (headings, buttons, numerals) and
 * Plus Jakarta Sans (body copy) from Google Fonts, and leans on CSS weight
 * synthesis. React Native has no synthesis, so every weight the design uses
 * maps to a real loaded family here.
 */
export const font = {
  // 'Outfit', sans-serif
  outfit700: 'Outfit_700Bold',
  outfit800: 'Outfit_800ExtraBold',
  // 'Plus Jakarta Sans', system-ui, sans-serif
  jakarta400: 'PlusJakartaSans_400Regular',
  jakarta500: 'PlusJakartaSans_500Medium',
  jakarta600: 'PlusJakartaSans_600SemiBold',
  jakarta700: 'PlusJakartaSans_700Bold',
} as const;

/** `border-radius:999px` — full pills, avatars, swatches. */
export const PILL = 999;

/**
 * Every input in the design carries `border:none;outline:none` — the field's
 * look comes from the rounded card around it, never from the input itself.
 * React Native (and RN Web especially) draws a focus outline by default, so
 * each input style spreads this to switch it off.
 */
export const noOutline = { outlineWidth: 0 } as const;

/** The six colours a person can pick as "their" colour. */
export const SWATCHES = ['#F6F084', '#AFB7F7', '#BDE6CE', '#FBC9B0', '#DCC7F3', '#F8C1CF'] as const;

/** Human names for the swatches, shown on the profile screen. */
export const COLOR_NAMES: Record<string, string> = {
  '#F6F084': 'sunshine yellow',
  '#AFB7F7': 'periwinkle',
  '#BDE6CE': 'mint',
  '#FBC9B0': 'peach',
  '#DCC7F3': 'lilac',
  '#F8C1CF': 'blush',
};

/** Per-person colours for the seeded crew. */
export const CREW_COLORS: Record<string, string> = {
  Fifi: '#AFB7F7',
  Jason: '#BDE6CE',
  Mia: '#FBC9B0',
  Thabo: '#DCC7F3',
  You: '#F6F084',
  Nomi: '#F8C1CF',
  Lebo: '#F2F2F5',
};

/** Fallback fill for a person with no assigned colour. */
export const NO_COLOR = '#F2F2F5';

/**
 * `box-shadow:0 8px 22px rgba(120,124,200,.18)` on the event cards. RN can't
 * express a coloured shadow's exact CSS blur, so this is the closest native
 * equivalent (iOS shadow* + Android elevation).
 */
export const cardShadow = {
  shadowColor: '#787CC8',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.18,
  shadowRadius: 11,
  elevation: 6,
} as const;

/** `box-shadow:0 -20px 50px rgba(36,31,27,.18)` on every bottom sheet. */
export const sheetShadow = {
  shadowColor: INK,
  shadowOffset: { width: 0, height: -20 },
  shadowOpacity: 0.18,
  shadowRadius: 25,
  elevation: 24,
} as const;

/** `box-shadow:0 12px 30px rgba(36,31,27,.28)` on the toast. */
export const toastShadow = {
  shadowColor: INK,
  shadowOffset: { width: 0, height: 12 },
  shadowOpacity: 0.28,
  shadowRadius: 15,
  elevation: 12,
} as const;
