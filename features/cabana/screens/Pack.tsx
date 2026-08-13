// A starter pack, opened from Good Stuff: tinted header, then every item in
// the pack as a chip. Adding them to an event happens from the action bar.

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { findPack } from '../data';
import { useCabana } from '../state';
import { INK, ink, PILL } from '../theme';
import { jakarta, outfit } from '../type';
import { splitThing } from '../utils';

export function PackScreen() {
  const { pack, go } = useCabana();
  const current = findPack(pack);

  return (
    <View>
      <View style={[styles.header, { backgroundColor: current.tint }]}>
        <Pressable
          style={styles.back}
          onPress={() => go('good')}
          accessibilityRole="button"
          accessibilityLabel="Back to Good Stuff"
        >
          <Text style={styles.backGlyph}>‹</Text>
        </Pressable>
        <Text style={styles.emoji}>{current.emoji}</Text>
        <Text style={styles.name}>{current.name}</Text>
        <Text style={styles.blurb}>{current.blurb}</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.chips}>
          {current.items.map((raw, i) => {
            const parts = splitThing(raw);
            return (
              <View key={`${raw}${i}`} style={styles.chip}>
                <Text style={styles.chipEmoji}>{parts?.emoji}</Text>
                <Text style={styles.chipLabel}>{parts?.name}</Text>
              </View>
            );
          })}
        </View>
        <Text style={styles.foot}>Nothing is claimed — the crew picks from here</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 56,
    paddingHorizontal: 22,
    paddingBottom: 26,
    overflow: 'hidden',
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
  emoji: {
    fontSize: 52,
    lineHeight: 61,
    marginTop: 20,
  },
  name: {
    fontFamily: outfit[800],
    fontSize: 32,
    letterSpacing: -1.2,
    lineHeight: 33.6,
    marginTop: 8,
    color: INK,
  },
  blurb: {
    fontSize: 14,
    fontFamily: jakarta[600],
    color: ink(0.55),
    marginTop: 5,
  },
  body: {
    paddingTop: 20,
    paddingHorizontal: 22,
    paddingBottom: 30,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#fff',
    borderRadius: PILL,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1.5,
    borderColor: ink(0.09),
  },
  chipEmoji: {
    fontSize: 14,
  },
  chipLabel: {
    fontSize: 13.5,
    fontFamily: outfit[700],
    color: INK,
  },
  foot: {
    textAlign: 'center',
    marginTop: 22,
    fontSize: 13,
    fontFamily: jakarta[600],
    color: ink(0.4),
  },
});
