// Good Stuff: join an event by code, or open one of the six starter packs.

import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { PACKS } from '../data';
import { useCabana } from '../state';
import { ink, INK, noOutline, PILL, WHITE } from '../theme';
import { jakarta, outfit } from '../type';

export function GoodStuffScreen() {
  const { codeDraft, setField, joinByCode, go } = useCabana();

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Good Stuff</Text>
      <Text style={styles.subtitle}>Lists that already know what you forget</Text>

      <View style={styles.searchRow}>
        <View style={styles.searchField}>
          <Text style={styles.searchIcon}>🔎</Text>
          <TextInput
            value={codeDraft}
            onChangeText={(v) => setField('codeDraft', v.toUpperCase())}
            onSubmitEditing={joinByCode}
            placeholder="Have an event code?"
            placeholderTextColor={ink(0.3)}
            autoCapitalize="characters"
            autoCorrect={false}
            returnKeyType="go"
            style={styles.searchInput}
          />
        </View>
        <Pressable style={styles.joinButton} onPress={joinByCode} accessibilityRole="button">
          <Text style={styles.joinLabel}>Join</Text>
        </Pressable>
      </View>
      <Text style={styles.codeHint}>Ask the host for their code — try NOMI30</Text>

      <View style={styles.grid}>
        {PACKS.map((p) => (
          <Pressable
            key={p.name}
            style={[styles.packTile, { backgroundColor: p.tint }]}
            onPress={() => {
              setField('pack', p.name);
              go('pack');
            }}
            accessibilityRole="button"
          >
            <Text style={styles.packEmoji}>{p.emoji}</Text>
            <View>
              <Text style={styles.packName}>{p.name}</Text>
              <Text style={styles.packCount}>{p.items.length} things</Text>
            </View>
          </Pressable>
        ))}
      </View>

      <View style={styles.iceCard}>
        <Text style={styles.iceTitle}>Everyone forgets the ice</Text>
        <Text style={styles.iceBlurb}>Truly. Add it before anything else.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingTop: 64,
    paddingHorizontal: 22,
    paddingBottom: 30,
  },
  title: {
    fontFamily: outfit[800],
    fontSize: 36,
    letterSpacing: -1.3,
    lineHeight: 36,
    color: INK,
  },
  subtitle: {
    fontSize: 14.5,
    fontFamily: jakarta[400],
    color: ink(0.5),
    marginTop: 6,
  },
  searchRow: {
    marginTop: 20,
    flexDirection: 'row',
    gap: 9,
    alignItems: 'center',
  },
  searchField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: ink(0.12),
    borderRadius: PILL,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  searchIcon: {
    fontSize: 15,
    opacity: 0.45,
  },
  searchInput: {
    ...noOutline,
    flex: 1,
    fontFamily: outfit[700],
    fontSize: 15,
    color: INK,
    padding: 0,
  },
  joinButton: {
    backgroundColor: INK,
    borderRadius: PILL,
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  joinLabel: {
    color: WHITE,
    fontFamily: outfit[700],
    fontSize: 14.5,
  },
  codeHint: {
    fontSize: 12,
    fontFamily: jakarta[600],
    color: ink(0.38),
    marginTop: 9,
    paddingLeft: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 13,
    marginTop: 24,
  },
  packTile: {
    flexBasis: '47%',
    flexGrow: 1,
    borderRadius: 26,
    padding: 18,
    height: 132,
    justifyContent: 'space-between',
  },
  packEmoji: {
    fontSize: 30,
    lineHeight: 36,
  },
  packName: {
    fontFamily: outfit[700],
    fontSize: 17,
    letterSpacing: -0.4,
    color: INK,
  },
  packCount: {
    fontSize: 12,
    fontFamily: jakarta[600],
    color: ink(0.5),
  },
  iceCard: {
    marginTop: 22,
    borderRadius: 28,
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 22,
    borderWidth: 1.5,
    borderColor: ink(0.09),
  },
  iceTitle: {
    fontFamily: outfit[700],
    fontSize: 18,
    letterSpacing: -0.5,
    color: INK,
  },
  iceBlurb: {
    fontSize: 13.5,
    color: ink(0.5),
    fontFamily: jakarta[500],
    marginTop: 4,
  },
});
