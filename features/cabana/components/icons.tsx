// The seven tab-bar glyphs, transcribed path-for-path from the inline SVGs in
// the design. All of them share the same 24-box, 1.9 stroke, round caps.

import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

type IconProps = { color: string; size?: number };

const stroke = {
  fill: 'none',
  strokeWidth: 1.9,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const Frame = ({ color, size = 25, children }: IconProps & { children: React.ReactNode }) => (
  <Svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color}>
    {children}
  </Svg>
);

/** Event tab bar — Home. */
export const HomeIcon = ({ color, size }: IconProps) => (
  <Frame color={color} size={size}>
    <Path d="M4 10.6 12 4l8 6.6V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z" stroke={color} {...stroke} />
  </Frame>
);

/** Event tab bar — Group list. */
export const ListIcon = ({ color, size }: IconProps) => (
  <Frame color={color} size={size}>
    <Path d="M9 6h11M9 12h11M9 18h11" stroke={color} {...stroke} />
    <Path d="M4 6h.01M4 12h.01M4 18h.01" stroke={color} {...stroke} />
  </Frame>
);

/** Event tab bar — My stuff. */
export const BagIcon = ({ color, size }: IconProps) => (
  <Frame color={color} size={size}>
    <Path d="M5 8h14l-1 12H6z" stroke={color} {...stroke} />
    <Path d="M9 8V6.5a3 3 0 0 1 6 0V8" stroke={color} {...stroke} />
  </Frame>
);

/** Event tab bar — Crew. */
export const CrewIcon = ({ color, size }: IconProps) => (
  <Frame color={color} size={size}>
    <Circle cx="9" cy="9" r="3.4" stroke={color} {...stroke} />
    <Path d="M3 19c1.1-2.9 3.4-4.4 6-4.4s4.9 1.5 6 4.4" stroke={color} {...stroke} />
    <Path d="M16.5 6.4a3.2 3.2 0 0 1 0 6.2M17.5 14.9c2 .5 3.5 1.9 4.3 4.1" stroke={color} {...stroke} />
  </Frame>
);

/** Main tab bar — Events. */
export const CalendarIcon = ({ color, size }: IconProps) => (
  <Frame color={color} size={size}>
    <Rect x="3" y="5" width="18" height="16" rx="4" stroke={color} {...stroke} />
    <Path d="M8 3v4M16 3v4M3 10h18" stroke={color} {...stroke} />
  </Frame>
);

/** Main tab bar — Good stuff. */
export const SparkleIcon = ({ color, size }: IconProps) => (
  <Frame color={color} size={size}>
    <Path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" stroke={color} {...stroke} />
    <Path d="M18.5 16.6l.6 1.7 1.7.6-1.7.6-.6 1.7-.6-1.7-1.7-.6 1.7-.6z" stroke={color} {...stroke} />
  </Frame>
);

/** Main tab bar — Me. */
export const PersonIcon = ({ color, size }: IconProps) => (
  <Frame color={color} size={size}>
    <Circle cx="12" cy="8.5" r="3.8" stroke={color} {...stroke} />
    <Path d="M4.5 20c1.4-3.6 4.2-5.4 7.5-5.4s6.1 1.8 7.5 5.4" stroke={color} {...stroke} />
  </Frame>
);
