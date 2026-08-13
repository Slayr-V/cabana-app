// The shared "who's bringing what" list. Tapping a row claims and ticks it
// off in your colour; swiping left removes it.

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { resolveWho, useCabana } from '../../state';
import { INK, ink, NO_COLOR, PILL, WHITE } from '../../theme';
import { jakarta, outfit } from '../../type';
import { withAlpha } from '../../utils';
import { SwipeRow } from '../../components/SwipeRow';

export function EventList() {
  const { active, myId, myInitial, myColor, openAdd, toggleItem, removeItem } = useCabana();

  const total = active.items.length + active.mine.length;
  const done =
    active.items.filter((i) => i.done).length + active.mine.filter((i) => i.done).length;
  const subline =
    active.items.length === 0 ? 'Nothing here yet' : `${done} of ${total} things are sorted`;

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Who’s bringing what</Text>
      <Text style={styles.subline}>{subline}</Text>

      {active.items.length === 0 && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>🧺</Text>
          <Text style={styles.emptyTitle}>The list is empty</Text>
          <Text style={styles.emptyBlurb}>
            Type in the first thing someone needs to bring — ice, a speaker, the meat.
          </Text>
          <Pressable style={styles.emptyCta} onPress={() => openAdd('list')} accessibilityRole="button">
            <Text style={styles.emptyCtaLabel}>Add the first thing</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.rows}>
        {active.items.map((item) => {
          const who = resolveWho(item.who, active, myId, myInitial, myColor);
          const color = who?.color ?? NO_COLOR;
          return (
            <SwipeRow
              key={item.id}
              swipeKey={`i${item.id}`}
              onDelete={() => removeItem(item.id)}
              onPress={() => toggleItem(item.id)}
            >
              {item.done ? (
                <>
                  <View style={[styles.tick, { backgroundColor: color }]}>
                    <Text style={styles.tickGlyph}>✓</Text>
                  </View>
                  <Text style={[styles.name, styles.nameDone]}>{item.name}</Text>
                  <View style={[styles.whoChip, { backgroundColor: withAlpha(color, '40') }]}>
                    <View style={[styles.whoAvatar, { backgroundColor: color }]}>
                      <Text style={styles.whoInitial}>{who?.initial ?? '?'}</Text>
                    </View>
                    <Text style={styles.whoLabel}>{who?.label ?? ''}</Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.emptyTick} />
                  <Text style={styles.name}>{item.name}</Text>
                </>
              )}
            </SwipeRow>
          );
        })}
      </View>

      <Pressable style={styles.addRow} onPress={() => openAdd('list')} accessibilityRole="button">
        <Text style={styles.addPlus}>+</Text>
        <Text style={styles.addLabel}>Add something to the list</Text>
      </Pressable>

      {active.items.length > 0 && <Text style={styles.hint}>Swipe a row left to remove it</Text>}
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
  subline: {
    fontSize: 13.5,
    color: ink(0.5),
    fontFamily: jakarta[500],
    marginTop: 3,
  },
  emptyCard: {
    marginTop: 24,
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
  whoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: PILL,
    paddingVertical: 5,
    paddingLeft: 6,
    paddingRight: 11,
  },
  whoAvatar: {
    width: 20,
    height: 20,
    borderRadius: PILL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whoInitial: {
    fontSize: 10.5,
    fontFamily: outfit[700],
    color: INK,
  },
  whoLabel: {
    fontSize: 12,
    fontFamily: outfit[700],
    color: INK,
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
