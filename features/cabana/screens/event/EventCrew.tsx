// The crew roster. The design's Nudge button targeted an invite still
// sitting unopened; a real backend only ever has crew who've actually
// joined, so it's repurposed here for anyone who hasn't claimed anything
// yet — tapping it sends them a real push, not just a mocked toast.

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useCabana } from '../../state';
import { INK, ink, PILL, WHITE } from '../../theme';
import { jakarta, outfit } from '../../type';

export function EventCrew() {
  const { active, myColor, go, nudge } = useCabana();

  const crewLine = `${active.crew.length} in`;

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>The crew</Text>
      <Text style={styles.subline}>{crewLine}</Text>

      <View style={styles.rows}>
        {active.crew.map((c) => {
          const needsNudge = c.role !== 'host' && (c.tag === 'in' || c.tag === 'new 👋');
          return (
            <View key={c.id} style={styles.row}>
              <View
                style={[styles.avatar, { backgroundColor: c.short === 'You' ? myColor : c.color }]}
              >
                <Text style={styles.initial}>{c.initial}</Text>
              </View>
              <View style={styles.rowBody}>
                <Text style={styles.name}>{c.name}</Text>
                <Text style={styles.sub}>{c.sub}</Text>
              </View>
              {needsNudge && (
                <Pressable
                  style={styles.nudge}
                  onPress={() => nudge(c.id)}
                  accessibilityRole="button"
                >
                  <Text style={styles.nudgeLabel}>Nudge</Text>
                </Pressable>
              )}
            </View>
          );
        })}
      </View>

      <Pressable style={styles.inviteRow} onPress={() => go('invite')} accessibilityRole="button">
        <Text style={styles.inviteLabel}>＋ Invite more people</Text>
      </Pressable>
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
    borderWidth: 1.5,
    borderColor: ink(0.09),
    backgroundColor: WHITE,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: PILL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    fontFamily: outfit[700],
    fontSize: 16,
    color: INK,
  },
  rowBody: {
    flex: 1,
  },
  name: {
    fontFamily: outfit[700],
    fontSize: 16,
    color: INK,
  },
  sub: {
    fontSize: 12.5,
    color: ink(0.5),
    fontFamily: jakarta[600],
  },
  nudge: {
    borderRadius: PILL,
    backgroundColor: INK,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  nudgeLabel: {
    color: WHITE,
    fontSize: 12,
    fontFamily: outfit[700],
  },
  inviteRow: {
    marginTop: 16,
    borderRadius: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: ink(0.14),
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteLabel: {
    fontFamily: outfit[700],
    fontSize: 15,
    color: INK,
  },
});
