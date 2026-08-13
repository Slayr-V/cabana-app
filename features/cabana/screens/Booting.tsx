// The 1.7s loading state a returning user lands on: a shimmering skeleton of
// the events screen — header block plus three card outlines.

import React from 'react';
import { StyleSheet, View } from 'react-native';

import { PILL } from '../theme';
import { Shimmer } from '../components/anim';

export function BootingScreen() {
  return (
    <View>
      <Shimmer style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <View style={styles.titleBar} />
            <View style={styles.subtitleBar} />
          </View>
          <View style={styles.avatar} />
        </View>
      </Shimmer>

      <Shimmer style={styles.cards}>
        {[1, 2, 3].map((n) => (
          <View key={n} style={styles.card}>
            <View style={styles.cardLabel} />
            <View style={styles.cardTitle} />
            <View style={styles.cardMeta} />
            <View style={styles.cardFooter}>
              <View style={styles.avatarStack}>
                <View style={styles.stackAvatar} />
                <View style={[styles.stackAvatar, styles.stackAvatarOverlap]} />
                <View style={[styles.stackAvatar, styles.stackAvatarOverlap]} />
              </View>
              <View style={styles.cardClock} />
            </View>
          </View>
        ))}
      </Shimmer>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 64,
    paddingHorizontal: 22,
    paddingBottom: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  titleBar: {
    width: 168,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#EDEDF0',
  },
  subtitleBar: {
    width: 210,
    height: 14,
    borderRadius: 8,
    backgroundColor: '#F1F1F4',
    marginTop: 10,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: PILL,
    backgroundColor: '#EDEDF0',
  },
  cards: {
    paddingTop: 6,
    paddingHorizontal: 22,
    paddingBottom: 8,
    gap: 16,
  },
  card: {
    borderRadius: 30,
    padding: 22,
    backgroundColor: '#F1F1F4',
  },
  cardLabel: {
    width: 120,
    height: 22,
    borderRadius: PILL,
    backgroundColor: '#E6E6EB',
  },
  cardTitle: {
    width: 200,
    height: 28,
    borderRadius: 10,
    backgroundColor: '#E6E6EB',
    marginTop: 16,
  },
  cardMeta: {
    width: 150,
    height: 14,
    borderRadius: 8,
    backgroundColor: '#E9E9EE',
    marginTop: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  avatarStack: {
    flexDirection: 'row',
  },
  stackAvatar: {
    width: 34,
    height: 34,
    borderRadius: PILL,
    backgroundColor: '#E6E6EB',
  },
  stackAvatarOverlap: {
    marginLeft: -9,
  },
  cardClock: {
    width: 88,
    height: 34,
    borderRadius: PILL,
    backgroundColor: '#E6E6EB',
  },
});
