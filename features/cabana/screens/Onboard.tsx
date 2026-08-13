// Three full-bleed slides on a vibe gradient, with a giant drifting emoji
// behind the copy, progress dots, and a Next / Let's go button.

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ONBOARD } from '../data';
import { useCabana } from '../state';
import { INK, ink, PILL, WHITE } from '../theme';
import { jakarta, outfit } from '../type';
import { Float } from '../components/anim';
import { Gradient } from '../components/Gradient';

export function OnboardScreen() {
  const { obIdx, nextOnboard, skipOnboard } = useCabana();
  const slide = ONBOARD[Math.min(obIdx, ONBOARD.length - 1)];
  const isLast = obIdx >= ONBOARD.length - 1;

  return (
    <Gradient
      angle={170}
      colors={[slide.c1, slide.c2, '#FFFFFF']}
      locations={[0, 0.55, 1]}
      style={styles.screen}
    >
      <Float duration={7000} style={styles.decor}>
        <Text style={styles.decorEmoji}>{slide.emoji}</Text>
      </Float>

      <View style={styles.topRow}>
        <Text style={styles.wordmark}>Cabana</Text>
        <Pressable onPress={skipOnboard} accessibilityRole="button">
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>

      <View style={styles.copyBlock}>
        <Text style={styles.kicker}>{slide.kicker}</Text>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.body}>{slide.body}</Text>
      </View>

      <View style={styles.dots}>
        {ONBOARD.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, { backgroundColor: i === obIdx ? INK : ink(0.18) }]}
          />
        ))}
      </View>

      <Pressable style={styles.cta} onPress={nextOnboard} accessibilityRole="button">
        <Text style={styles.ctaLabel}>{isLast ? 'Let’s go' : 'Next'}</Text>
      </Pressable>
    </Gradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: 62,
    paddingHorizontal: 26,
    paddingBottom: 34,
    overflow: 'hidden',
  },
  decor: {
    position: 'absolute',
    right: -34,
    top: 120,
    opacity: 0.3,
  },
  decorEmoji: {
    fontSize: 150,
    lineHeight: 176,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wordmark: {
    fontFamily: outfit[800],
    fontSize: 22,
    letterSpacing: -0.8,
    color: INK,
  },
  skip: {
    fontSize: 13.5,
    fontFamily: jakarta[700],
    color: ink(0.45),
  },
  copyBlock: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  kicker: {
    fontSize: 13,
    fontFamily: jakarta[700],
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    color: ink(0.45),
  },
  title: {
    fontFamily: outfit[800],
    fontSize: 40,
    letterSpacing: -1.7,
    lineHeight: 40.8,
    marginTop: 12,
    color: INK,
  },
  body: {
    fontSize: 16,
    fontFamily: jakarta[500],
    color: ink(0.6),
    lineHeight: 24,
    marginTop: 14,
    maxWidth: 300,
  },
  dots: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 30,
  },
  dot: {
    height: 5,
    borderRadius: 99,
    flex: 1,
  },
  cta: {
    marginTop: 22,
    backgroundColor: INK,
    borderRadius: PILL,
    paddingVertical: 19,
    alignItems: 'center',
  },
  ctaLabel: {
    color: WHITE,
    fontFamily: outfit[700],
    fontSize: 16.5,
  },
});
