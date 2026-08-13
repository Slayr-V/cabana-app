// "Add to which event?" — pick the destination for a starter pack.

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { findPack, findVibe } from '../data';
import { useCabana } from '../state';
import { INK, ink } from '../theme';
import { jakarta, outfit } from '../type';
import { fmt } from '../utils';
import { Gradient } from '../components/Gradient';
import { Sheet } from '../components/Sheet';

export function PickerSheet() {
  const { events, now, pack, setField, addPack } = useCabana();
  const current = findPack(pack);
  const close = () => setField('pickerOpen', false);

  const upcoming = events
    .filter((e) => new Date(e.date).getTime() > now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <Sheet onDismiss={close}>
      <Text style={styles.title}>Add to which event?</Text>
      <Text style={styles.subtitle}>
        {current.name} · {current.items.length} things
      </Text>

      <View style={styles.rows}>
        {upcoming.map((e) => {
          const vibe = findVibe(e.theme);
          return (
            <Pressable
              key={e.id}
              onPress={() => addPack(current, e.id)}
              accessibilityRole="button"
            >
              <Gradient angle={150} colors={[vibe.c1, vibe.c2]} style={styles.row}>
                <Text style={styles.rowEmoji}>{vibe.emoji}</Text>
                <View style={styles.rowBody}>
                  <Text style={styles.rowName}>{e.name}</Text>
                  <Text style={styles.rowDate}>
                    {fmt(new Date(e.date))}
                    {e.where ? ` · ${e.where}` : ''}
                  </Text>
                </View>
                <Text style={styles.rowChevron}>›</Text>
              </Gradient>
            </Pressable>
          );
        })}
      </View>

      <Pressable onPress={close} accessibilityRole="button">
        <Text style={styles.notNow}>Not now</Text>
      </Pressable>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: outfit[800],
    fontSize: 24,
    letterSpacing: -0.9,
    color: INK,
  },
  subtitle: {
    fontSize: 13.5,
    color: ink(0.5),
    fontFamily: jakarta[500],
    marginTop: 4,
  },
  rows: {
    gap: 10,
    marginTop: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    borderRadius: 24,
    paddingVertical: 15,
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  rowEmoji: {
    fontSize: 24,
    lineHeight: 29,
  },
  rowBody: {
    flex: 1,
  },
  rowName: {
    fontFamily: outfit[700],
    fontSize: 16.5,
    letterSpacing: -0.4,
    color: INK,
  },
  rowDate: {
    fontSize: 12.5,
    color: ink(0.55),
    fontFamily: jakarta[600],
  },
  rowChevron: {
    fontSize: 18,
    color: ink(0.4),
  },
  notNow: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
    fontFamily: jakarta[700],
    color: ink(0.45),
  },
});
