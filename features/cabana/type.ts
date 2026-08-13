// Weight-indexed font families. CSS synthesises weights from one family;
// React Native needs the real file, so `jakarta[600]` resolves to the actual
// Plus Jakarta Sans SemiBold face rather than a synthesised one.

import { font } from './theme';

export const jakarta = {
  400: font.jakarta400,
  500: font.jakarta500,
  600: font.jakarta600,
  700: font.jakarta700,
} as const;

export const outfit = {
  700: font.outfit700,
  800: font.outfit800,
} as const;
