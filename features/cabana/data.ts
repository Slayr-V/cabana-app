// Static content from the design handoff: the six vibes, the six starter
// packs, and the three onboarding slides. Copied verbatim — the copy, the
// emoji and the gradient stops are all part of the design.

export type Vibe = {
  name: string;
  emoji: string;
  /** Gradient start. */
  c1: string;
  /** Gradient end. */
  c2: string;
  /** Fallback event name / card label for this vibe. */
  label: string;
};

export const VIBES: Vibe[] = [
  { name: 'Beach', emoji: '🌴', c1: '#AFB7F7', c2: '#DDE0FC', label: 'Beach weekend' },
  { name: 'Birthday', emoji: '🎈', c1: '#F8C1CF', c2: '#FBE0E7', label: 'Birthday' },
  { name: 'Festival', emoji: '🎸', c1: '#DCC7F3', c2: '#EEE4FA', label: 'Festival' },
  { name: 'Camping', emoji: '⛺', c1: '#BDE6CE', c2: '#DEF3E7', label: 'Camping trip' },
  { name: 'Braai', emoji: '🔥', c1: '#F6F084', c2: '#FBF8C9', label: 'Braai' },
  { name: 'Road trip', emoji: '🚐', c1: '#FBC9B0', c2: '#FDE5D8', label: 'Road trip' },
];

export type Pack = {
  name: string;
  emoji: string;
  tint: string;
  blurb: string;
  /** Each entry is "<emoji> <name>", split at render time. */
  items: string[];
};

export const PACKS: Pack[] = [
  {
    name: 'Beach weekend',
    emoji: '🌊',
    tint: '#BEDFF5',
    blurb: 'Sun, salt and the things people always leave behind.',
    items: [
      '❄️ Ice', '🧊 Cooler box', '🔊 Speaker', '🧴 Sunscreen', '🩴 Slops', '🧺 Blanket',
      '🥤 Cups', '🍉 Watermelon', '🃏 Cards', '🩹 Plasters', '🕶️ Spare sunnies', '💦 Water',
      '🧻 Wet wipes', '📷 Film camera', '🧯 Firelighters', '🛁 Beach towels',
    ],
  },
  {
    name: 'Birthday',
    emoji: '🎉',
    tint: '#F8C1CF',
    blurb: 'Candles, cake and someone on decorations duty.',
    items: [
      '🎂 Cake', '🕯️ Candles', '🎈 Balloons', '🥂 Bubbles', '🧊 Ice', '🥤 Mixers',
      '🎁 Group gift', '📸 Polaroid', '🎵 Playlist', '🍕 Snacks', '🎀 Decorations',
      '🍾 Bottle opener', '🪑 Extra chairs', '🧻 Serviettes',
    ],
  },
  {
    name: 'Braai',
    emoji: '🔥',
    tint: '#F6F084',
    blurb: 'Fire, meat, and the tongs nobody remembers.',
    items: [
      '🍖 Meat', '🔥 Charcoal', '🧯 Firelighters', '🥗 Salad', '🍞 Rolls', '🧀 Cheese',
      '🧂 Spice', '🍺 Beers', '🧊 Ice', '🥄 Tongs', '🧻 Paper towel',
    ],
  },
  {
    name: 'Festival',
    emoji: '🎸',
    tint: '#DCC7F3',
    blurb: 'Three days, one bag, zero regrets.',
    items: [
      '⛺ Tent', '🛏️ Sleeping bag', '🎫 Tickets', '🔋 Power bank', '🧴 Sunscreen',
      '🕶️ Sunnies', '🧢 Hat', '🩴 Slops', '🧻 Wet wipes', '💧 Water bottle', '🍫 Snacks',
      '🧦 Dry socks', '🌧️ Poncho', '🪑 Camp chair', '🔦 Torch', '💊 Meds', '🎧 Earplugs',
    ],
  },
  {
    name: 'Camping',
    emoji: '⛺',
    tint: '#BDE6CE',
    blurb: 'Everything you need to be smug about being offline.',
    items: [
      '⛺ Tent', '🔨 Mallet', '🛏️ Sleeping bags', '🪵 Firewood', '🍳 Pan', '☕ Coffee',
      '🧊 Cooler', '🔦 Head torch', '🔋 Batteries', '🥫 Tinned food', '🚰 Water cans',
      '🧻 Loo roll', '🧴 Bug spray', '💊 First aid', '🧦 Warm socks', '🪑 Chairs',
      '🍫 Marshmallows', '🔪 Knife',
    ],
  },
  {
    name: 'Road trip',
    emoji: '🚐',
    tint: '#FBC9B0',
    blurb: 'Snacks, aux cable, one person who navigates.',
    items: [
      '🎵 Playlist', '🔌 Aux cable', '🔋 Car charger', '🍿 Snacks', '💧 Water', '☕ Flask',
      '🗺️ Route', '💵 Toll cash', '🧻 Wipes', '🕶️ Sunnies', '🩹 First aid', '⛽ Fuel card',
      '📷 Camera', '🧊 Cooler',
    ],
  },
];

export type OnboardSlide = {
  kicker: string;
  title: string;
  body: string;
  emoji: string;
  c1: string;
  c2: string;
};

export const ONBOARD: OnboardSlide[] = [
  {
    kicker: 'Welcome to Cabana',
    title: 'Every good plan starts in a group chat.',
    body: 'Cabana keeps the trip, the braai and the birthday in one place — so nothing lives in 400 unread messages.',
    emoji: '🌴',
    c1: '#AFB7F7',
    c2: '#DDE0FC',
  },
  {
    kicker: 'One shared list',
    title: 'Everyone sees who is bringing what.',
    body: 'Add the things you need. When someone ticks an item off, their colour lands on it and the crew stops asking.',
    emoji: '🧺',
    c1: '#BDE6CE',
    c2: '#DEF3E7',
  },
  {
    kicker: 'Then the countdown',
    title: 'Getting ready is half the fun.',
    body: 'A live countdown, your crew, and little updates as the plan comes together. Open it just to see what everyone is doing.',
    emoji: '🎉',
    c1: '#F8C1CF',
    c2: '#FBE0E7',
  },
];

/** Quick-add chips in the "add a thing" sheet, per list. */
export const SUGGESTIONS = {
  list: ['❄️ Ice', '🥤 Cups', '🍉 Watermelon', '🧯 Firelighters', '🔌 Aux cable', '🧻 Wet wipes'],
  mine: ['🩴 Slops', '🔌 Charger', '💊 Meds', '🕶️ Sunnies', '🪥 Toothbrush', '📖 Book'],
} as const;

/** Updates older than this drop off the event feed. */
export const FEED_TTL = 5 * 60 * 1000;

export const DAY = 86400000;

export const findVibe = (theme: string): Vibe => VIBES.find((v) => v.name === theme) ?? VIBES[0];

export const findPack = (name: string): Pack => PACKS.find((p) => p.name === name) ?? PACKS[0];
