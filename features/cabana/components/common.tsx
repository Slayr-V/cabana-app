// Small pieces that recur across screens: avatars, the black pill button,
// the emoji+label chip, and the six-colour swatch row.

import React from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { INK, ink, PILL, SWATCHES, WHITE } from '../theme';
import { jakarta, outfit } from '../type';

/**
 * CSS `outline` doesn't affect layout, so a selected swatch or vibe tile can
 * grow a ring without nudging its neighbours. RN has no outline — this draws
 * one as an absolutely positioned border sitting `offset` px clear of the
 * element's edge.
 */
export function Ring({ width, offset, color }: { width: number; offset: number; color: string }) {
  const inset = -(offset + width);
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: inset,
        left: inset,
        right: inset,
        bottom: inset,
        borderRadius: PILL,
        borderWidth: width,
        borderColor: color,
      }}
    />
  );
}

/** Circular initial badge. Sizes vary from 20px chips up to the 74px profile. */
export function Avatar({
  size,
  color,
  initial,
  fontSize,
  style,
}: {
  size: number;
  color: string;
  initial: string;
  fontSize: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: PILL,
          backgroundColor: color,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <Text style={{ fontFamily: outfit[700], fontSize, color: INK }}>{initial}</Text>
    </View>
  );
}

/** The full-width black pill used as the primary action on most screens. */
export function PrimaryButton({
  label,
  onPress,
  paddingVertical = 19,
  fontSize = 16.5,
  background = INK,
  color = WHITE,
  style,
}: {
  label: string;
  onPress: () => void;
  paddingVertical?: number;
  fontSize?: number;
  background?: string;
  color?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        { backgroundColor: background, borderRadius: PILL, paddingVertical, alignItems: 'center' },
        style,
      ]}
    >
      <Text style={{ color, fontFamily: outfit[700], fontSize }}>{label}</Text>
    </Pressable>
  );
}

/**
 * "🔊 Speaker" as a rounded chip. Used for the open-items nudge, the pack
 * contents, and the quick-add suggestions.
 */
export function Chip({
  emoji,
  name,
  onPress,
  background = WHITE,
  bordered = true,
  paddingVertical = 9,
  paddingHorizontal = 15,
}: {
  emoji: string;
  name: string;
  onPress?: () => void;
  background?: string;
  bordered?: boolean;
  paddingVertical?: number;
  paddingHorizontal?: number;
}) {
  const content = (
    <>
      <Text style={styles.chipEmoji}>{emoji}</Text>
      <Text style={styles.chipLabel}>{name}</Text>
    </>
  );

  const style = [
    styles.chip,
    {
      backgroundColor: background,
      paddingVertical,
      paddingHorizontal,
      borderWidth: bordered ? 1.5 : 0,
      borderColor: ink(0.12),
    },
  ];

  if (!onPress) return <View style={style}>{content}</View>;
  return (
    <Pressable style={style} onPress={onPress} accessibilityRole="button">
      {content}
    </Pressable>
  );
}

/** The six-colour picker, shown at sign-up and again on the profile. */
export function SwatchRow({ selected, onPick }: { selected: string; onPick: (c: string) => void }) {
  return (
    <View style={styles.swatchRow}>
      {SWATCHES.map((c) => (
        <Pressable
          key={c}
          accessibilityRole="button"
          accessibilityLabel={`Pick ${c}`}
          accessibilityState={{ selected: c === selected }}
          onPress={() => onPick(c)}
          style={[styles.swatch, { backgroundColor: c }]}
        >
          {c === selected && <Ring width={2.5} offset={3} color={INK} />}
        </Pressable>
      ))}
    </View>
  );
}

/** Uppercase micro-label above a field or section. */
export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <Text style={styles.fieldLabel}>{children}</Text>;
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: PILL,
  },
  chipEmoji: {
    fontSize: 14,
  },
  chipLabel: {
    fontSize: 13.5,
    fontFamily: outfit[700],
    color: INK,
  },
  swatchRow: {
    flexDirection: 'row',
    gap: 10,
  },
  swatch: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: PILL,
  },
  fieldLabel: {
    fontSize: 11.5,
    fontFamily: jakarta[700],
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: ink(0.4),
  },
});
