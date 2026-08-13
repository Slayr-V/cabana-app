// Create an event: name it, pick a date and place, choose a vibe. The
// "Make it real" button lives in the bottom action bar, not here.

import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { VIBES } from '../data';
import { useCabana } from '../state';
import { ink, INK, noOutline, PILL, WHITE } from '../theme';
import { jakarta, outfit } from '../type';
import { fmt, fromIso } from '../utils';
import { FieldLabel } from '../components/common';
import { Gradient } from '../components/Gradient';

export function CreateScreen() {
  const { draftName, draftWhere, draftDate, draftTheme, setField, go } = useCabana();

  return (
    <View style={styles.screen}>
      <Pressable
        style={styles.back}
        onPress={() => go('events')}
        accessibilityRole="button"
        accessibilityLabel="Back to events"
      >
        <Text style={styles.backGlyph}>‹</Text>
      </Pressable>

      <Text style={styles.title}>What are we{'\n'}getting up to?</Text>

      <View style={styles.nameField}>
        <FieldLabel>Name it</FieldLabel>
        <TextInput
          value={draftName}
          onChangeText={(v) => setField('draftName', v)}
          placeholder="Beach weekend"
          placeholderTextColor={ink(0.25)}
          style={styles.nameInput}
        />
      </View>

      <View style={styles.pairRow}>
        <Pressable
          style={styles.pairField}
          onPress={() => {
            setField('calMonth', draftDate.slice(0, 7));
            setField('dateSheetOpen', true);
          }}
          accessibilityRole="button"
        >
          <FieldLabel>When</FieldLabel>
          <Text style={styles.pairValue}>{fmt(fromIso(draftDate))}</Text>
        </Pressable>

        <View style={styles.pairField}>
          <FieldLabel>Where</FieldLabel>
          <TextInput
            value={draftWhere}
            onChangeText={(v) => setField('draftWhere', v)}
            placeholder="Add a place"
            placeholderTextColor={ink(0.25)}
            style={styles.pairInput}
          />
        </View>
      </View>

      <View style={styles.vibeLabel}>
        <FieldLabel>Pick a vibe</FieldLabel>
      </View>

      <View style={styles.vibeGrid}>
        {VIBES.map((v) => (
          <Pressable
            key={v.name}
            style={styles.vibeTileWrap}
            onPress={() => setField('draftTheme', v.name)}
            accessibilityRole="button"
            accessibilityState={{ selected: v.name === draftTheme }}
          >
            <Gradient angle={165} colors={[v.c1, v.c2]} style={styles.vibeTile}>
              <Text style={styles.vibeEmoji}>{v.emoji}</Text>
              <Text style={styles.vibeName}>{v.name}</Text>
            </Gradient>
            {v.name === draftTheme && <VibeRing />}
          </Pressable>
        ))}
      </View>

      <Text style={styles.foot}>The list starts empty — you and the crew fill it in.</Text>
    </View>
  );
}

/** `outline-offset:2px;outline:3px solid #241F1B` on the selected vibe. */
function VibeRing() {
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: -5,
        left: -5,
        right: -5,
        bottom: -5,
        borderRadius: 27,
        borderWidth: 3,
        borderColor: INK,
      }}
    />
  );
}

const styles = StyleSheet.create({
  screen: {
    minHeight: '100%',
    paddingTop: 56,
    paddingHorizontal: 22,
    paddingBottom: 30,
    backgroundColor: WHITE,
  },
  back: {
    width: 36,
    height: 36,
    borderRadius: PILL,
    backgroundColor: WHITE,
    borderWidth: 1.5,
    borderColor: ink(0.12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  backGlyph: {
    fontSize: 16,
    color: INK,
  },
  title: {
    fontFamily: outfit[800],
    fontSize: 32,
    letterSpacing: -1.2,
    lineHeight: 33.6,
    marginTop: 20,
    color: INK,
  },
  nameField: {
    marginTop: 24,
    borderRadius: 26,
    backgroundColor: '#fff',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    borderColor: ink(0.1),
  },
  nameInput: {
    ...noOutline,
    width: '100%',
    fontFamily: outfit[700],
    fontSize: 22,
    letterSpacing: -0.6,
    color: INK,
    marginTop: 6,
    padding: 0,
  },
  pairRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 11,
  },
  pairField: {
    flex: 1,
    borderRadius: 26,
    backgroundColor: '#fff',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    borderColor: ink(0.1),
  },
  pairValue: {
    fontFamily: outfit[700],
    fontSize: 16,
    marginTop: 6,
    letterSpacing: -0.3,
    color: INK,
  },
  pairInput: {
    ...noOutline,
    width: '100%',
    fontFamily: outfit[700],
    fontSize: 16,
    color: INK,
    marginTop: 6,
    padding: 0,
  },
  vibeLabel: {
    paddingTop: 24,
    paddingHorizontal: 4,
    paddingBottom: 12,
  },
  vibeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  vibeTileWrap: {
    flexBasis: '30%',
    flexGrow: 1,
  },
  vibeTile: {
    borderRadius: 22,
    height: 104,
    padding: 13,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  vibeEmoji: {
    fontSize: 24,
    lineHeight: 29,
  },
  vibeName: {
    fontFamily: outfit[700],
    fontSize: 13.5,
    letterSpacing: -0.2,
    color: INK,
  },
  foot: {
    textAlign: 'center',
    fontSize: 12.5,
    fontFamily: jakarta[600],
    color: ink(0.4),
    marginTop: 24,
  },
});
