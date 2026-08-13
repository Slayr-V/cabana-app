// The gradient header every event tab sits under: back / nudge controls, the
// event name, and a live DD:HH:MM countdown.

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { findVibe } from '../../data';
import { useCabana } from '../../state';
import { INK, ink, PILL } from '../../theme';
import { jakarta, outfit } from '../../type';
import { countdown, fmt, fmtTime, pad } from '../../utils';
import { Float } from '../../components/anim';
import { HeroGradient } from '../../components/Gradient';

export function EventHero() {
  const { active, now, go, flash } = useCabana();
  const vibe = findVibe(active.theme);
  const date = new Date(active.date);
  const { days, hours, mins } = countdown(date.getTime() - now);

  const meta = vibe.label + (active.where ? ` · ${active.where}` : '');
  const sleeps = days > 1 ? `${days} sleeps to go!` : days === 1 ? '1 sleep to go!' : 'It’s today! 🎉';
  const startLine = active.startNote || `Kicks off ${fmt(date)}, ${fmtTime(date)}`;

  return (
    <HeroGradient theme={active.theme} style={styles.hero}>
      <Float duration={7000} style={styles.decor}>
        <Text style={styles.decorEmoji}>{vibe.emoji}</Text>
      </Float>

      <View style={styles.controls}>
        <Pressable
          onPress={() => go('events')}
          accessibilityRole="button"
          accessibilityLabel="Back to events"
          style={styles.back}
        >
          <Text style={styles.backGlyph}>‹</Text>
        </Pressable>
        <Pressable
          onPress={() => flash('Nudge sent 📣')}
          accessibilityRole="button"
          style={styles.nudge}
        >
          <Text style={styles.nudgeLabel}>Nudge crew</Text>
        </Pressable>
      </View>

      <View style={styles.body}>
        <Text style={styles.meta}>{meta}</Text>
        <Text style={styles.name}>{active.name}</Text>
        <Text style={styles.sleeps}>{sleeps}</Text>

        <View style={styles.countdown}>
          <CountdownUnit value={pad(days)} label="days" />
          <Text style={styles.colon}>:</Text>
          <CountdownUnit value={pad(hours)} label="hours" />
          <Text style={styles.colon}>:</Text>
          <CountdownUnit value={pad(mins)} label="mins" />
        </View>

        <Text style={styles.startLine}>{startLine}</Text>
      </View>
    </HeroGradient>
  );
}

function CountdownUnit({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.unit}>
      <Text style={styles.unitValue}>{value}</Text>
      <Text style={styles.unitLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingTop: 60,
    paddingHorizontal: 22,
    paddingBottom: 26,
    overflow: 'hidden',
  },
  decor: {
    position: 'absolute',
    right: -30,
    top: 26,
    opacity: 0.32,
  },
  decorEmoji: {
    fontSize: 120,
    lineHeight: 141,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  back: {
    width: 36,
    height: 36,
    borderRadius: PILL,
    backgroundColor: 'rgba(255,255,255,.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backGlyph: {
    fontSize: 16,
    color: INK,
  },
  nudge: {
    borderRadius: PILL,
    backgroundColor: 'rgba(255,255,255,.7)',
    paddingVertical: 9,
    paddingHorizontal: 15,
  },
  nudgeLabel: {
    fontSize: 12.5,
    fontFamily: outfit[700],
    color: INK,
  },
  body: {
    marginTop: 24,
  },
  meta: {
    fontSize: 12,
    fontFamily: jakarta[700],
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: ink(0.5),
  },
  name: {
    fontFamily: outfit[800],
    fontSize: 38,
    letterSpacing: -1.5,
    lineHeight: 38.8,
    marginTop: 8,
    color: INK,
  },
  sleeps: {
    fontFamily: outfit[700],
    fontSize: 19,
    letterSpacing: -0.5,
    marginTop: 18,
    color: INK,
  },
  countdown: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  unit: {
    alignItems: 'center',
  },
  unitValue: {
    fontFamily: outfit[800],
    fontSize: 44,
    letterSpacing: -1.6,
    lineHeight: 44,
    color: INK,
    fontVariant: ['tabular-nums'],
  },
  unitLabel: {
    fontSize: 10,
    fontFamily: jakarta[700],
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: ink(0.45),
    marginTop: 4,
  },
  colon: {
    fontFamily: outfit[800],
    fontSize: 36,
    lineHeight: 39.6,
    color: ink(0.3),
    paddingBottom: 16,
  },
  startLine: {
    fontSize: 13.5,
    fontFamily: jakarta[600],
    color: ink(0.55),
    marginTop: 14,
  },
});
