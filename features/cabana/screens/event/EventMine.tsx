// My Stuff — the private per-event packing list. Same swipe rows as the group
// list, minus the "who claimed it" chip, since nobody else ever sees this.

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useCabana } from '../../state';
import { INK, ink, PILL, WHITE } from '../../theme';
import { jakarta, outfit } from '../../type';
import { SwipeRow } from '../../components/SwipeRow';

export function EventMine() {
  const { active, myColor, openAdd, toggleMine, removeMine } = useCabana();

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>My stuff</Text>
      <View style={styles.privateBadge}>
        <Text style={styles.privateLabel}>🔒 Only you can see this</Text>
      </View>

      {active.mine.length === 0 && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>🎒</Text>
          <Text style={styles.emptyTitle}>Your bag is empty</Text>
          <Text style={styles.emptyBlurb}>Add your own things — nobody else sees this list.</Text>
          <Pressable style={styles.emptyCta} onPress={() => openAdd('mine')} accessibilityRole="button">
            <Text style={styles.emptyCtaLabel}>Add to my bag</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.rows}>
        {active.mine.map((m) => (
          <SwipeRow
            key={m.id}
            swipeKey={`m${m.id}`}
            onDelete={() => removeMine(m.id)}
            onPress={() => toggleMine(m.id)}
          >
            {m.done ? (
              <>
                <View style={[styles.tick, { backgroundColor: myColor }]}>
                  <Text style={styles.tickGlyph}>✓</Text>
                </View>
                <Text style={[styles.name, styles.nameDone]}>{m.name}</Text>
              </>
            ) : (
              <>
                <View style={styles.emptyTick} />
                <Text style={styles.name}>{m.name}</Text>
              </>
            )}
          </SwipeRow>
        ))}
      </View>

      <Pressable style={styles.addRow} onPress={() => openAdd('mine')} accessibilityRole="button">
        <Text style={styles.addPlus}>+</Text>
        <Text style={styles.addLabel}>Add to my bag</Text>
      </Pressable>

      {active.mine.length > 0 && <Text style={styles.hint}>Swipe a row left to remove it</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingTop: 22,
    paddingHorizontal: 22,
    paddingBottom: 30,
  },
  title: {
    fontFamily: outfit[800],
    fontSize: 26,
    letterSpacing: -0.9,
    color: INK,
  },
  privateBadge: {
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: WHITE,
    borderWidth: 1.5,
    borderColor: ink(0.12),
    borderRadius: PILL,
    paddingVertical: 6,
    paddingHorizontal: 13,
  },
  privateLabel: {
    fontSize: 12,
    fontFamily: jakarta[700],
    color: ink(0.55),
  },
  emptyCard: {
    marginTop: 22,
    borderRadius: 28,
    backgroundColor: '#fff',
    paddingVertical: 26,
    paddingHorizontal: 22,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: ink(0.09),
  },
  emptyEmoji: {
    fontSize: 38,
    lineHeight: 45,
  },
  emptyTitle: {
    fontFamily: outfit[800],
    fontSize: 20,
    letterSpacing: -0.6,
    marginTop: 12,
    color: INK,
  },
  emptyBlurb: {
    fontSize: 13.5,
    color: ink(0.5),
    fontFamily: jakarta[500],
    marginTop: 5,
    lineHeight: 19.6,
    textAlign: 'center',
  },
  emptyCta: {
    marginTop: 18,
    alignSelf: 'stretch',
    backgroundColor: INK,
    borderRadius: PILL,
    paddingVertical: 15,
    alignItems: 'center',
  },
  emptyCtaLabel: {
    color: WHITE,
    fontFamily: outfit[700],
    fontSize: 15.5,
  },
  rows: {
    gap: 9,
    marginTop: 20,
  },
  tick: {
    width: 26,
    height: 26,
    borderRadius: PILL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickGlyph: {
    fontSize: 13,
    color: INK,
  },
  emptyTick: {
    width: 26,
    height: 26,
    borderRadius: PILL,
    borderWidth: 2,
    borderColor: ink(0.15),
  },
  name: {
    flex: 1,
    fontFamily: jakarta[600],
    fontSize: 15,
    color: INK,
  },
  nameDone: {
    textDecorationLine: 'line-through',
    opacity: 0.4,
  },
  addRow: {
    marginTop: 16,
    borderRadius: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: ink(0.14),
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addPlus: {
    fontSize: 19,
    fontFamily: outfit[700],
    color: ink(0.45),
  },
  addLabel: {
    fontFamily: outfit[700],
    fontSize: 15,
    color: ink(0.45),
  },
  hint: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: jakarta[600],
    color: ink(0.35),
    marginTop: 14,
  },
});
