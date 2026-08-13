// Thin wrapper over expo-linear-gradient that speaks the same language as the
// design's CSS: an angle in degrees plus colour stops with percentages.

import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import { findVibe } from '../data';
import { gradientPoints } from './anim';

type Props = {
  /** CSS gradient angle — 170 means `linear-gradient(170deg, …)`. */
  angle: number;
  colors: readonly string[];
  /** Stop positions as fractions; omit for evenly spaced stops. */
  locations?: readonly number[];
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  pointerEvents?: 'auto' | 'none' | 'box-none' | 'box-only';
};

export function Gradient({ angle, colors, locations, style, children, pointerEvents }: Props) {
  const { start, end } = gradientPoints(angle);
  return (
    <LinearGradient
      colors={colors as [string, string, ...string[]]}
      locations={locations as [number, number, ...number[]] | undefined}
      start={start}
      end={end}
      style={style}
      pointerEvents={pointerEvents}
    >
      {children}
    </LinearGradient>
  );
}

/**
 * `heroGrad` — `linear-gradient(170deg, c1 0%, c2 60%, #FFFFFF 100%)`.
 * Backs the event hero and the invite screen.
 */
export function HeroGradient({ theme, style, children }: { theme: string } & Pick<Props, 'style' | 'children'>) {
  const vibe = findVibe(theme);
  return (
    <Gradient angle={170} colors={[vibe.c1, vibe.c2, '#FFFFFF']} locations={[0, 0.6, 1]} style={style}>
      {children}
    </Gradient>
  );
}

/**
 * `cardGrad` — `linear-gradient(160deg, c1 0%, c2 100%)`, the upcoming-event
 * cards on the home screen.
 */
export function CardGradient({ theme, style, children }: { theme: string } & Pick<Props, 'style' | 'children'>) {
  const vibe = findVibe(theme);
  return (
    <Gradient angle={160} colors={[vibe.c1, vibe.c2]} style={style}>
      {children}
    </Gradient>
  );
}
