// The profile: your avatar in your colour, two stat tiles, the colour picker
// again, and the settings rows.

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useCabana } from '../state';
import { COLOR_NAMES, DANGER, INK, ink, PILL } from '../theme';
import { jakarta, outfit } from '../type';
import { SwatchRow } from '../components/common';

export function MeScreen() {
  const { myColor, setField, signOut } = useCabana();
  const colorName = COLOR_NAMES[myColor] ?? 'yours';

  return (
    <View style={styles.screen}>
      <View style={styles.identity}>
        <View style={[styles.avatar, { backgroundColor: myColor }]}>
          <Text style={styles.avatarInitial}>S</Text>
        </View>
        <View>
          <Text style={styles.name}>Sam</Text>
          <Text style={styles.colourLine}>Your colour is {colorName}</Text>
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>7</Text>
          <Text style={styles.statLabel}>events with the crew</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: myColor }]}>
          <Text style={styles.statValue}>41</Text>
          <Text style={[styles.statLabel, { color: ink(0.55) }]}>things you actually brought</Text>
        </View>
      </View>

      <View style={styles.settings}>
        <View style={styles.colourRow}>
          <View style={styles.settingRowInner}>
            <Text style={styles.settingLabel}>My colour</Text>
            <Text style={styles.settingValue}>{colorName}</Text>
          </View>
          <View style={styles.swatches}>
            <SwatchRow selected={myColor} onPick={(c) => setField('myColor', c)} />
          </View>
        </View>

        <SettingRow label="Nudges & updates" value="On ›" />
        <SettingRow label="Saved starter lists" value="3 ›" />
        <SettingRow label="Connected apps" value="WhatsApp ›" />

        <Pressable style={styles.signOut} onPress={signOut} accessibilityRole="button">
          <Text style={styles.signOutLabel}>Sign out</Text>
        </Pressable>
      </View>
    </View>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      <Text style={styles.settingValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingTop: 64,
    paddingHorizontal: 22,
    paddingBottom: 30,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 74,
    height: 74,
    borderRadius: PILL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: outfit[800],
    fontSize: 28,
    color: INK,
  },
  name: {
    fontFamily: outfit[800],
    fontSize: 26,
    letterSpacing: -0.9,
    color: INK,
  },
  colourLine: {
    fontSize: 13.5,
    color: ink(0.5),
    fontFamily: jakarta[600],
  },
  stats: {
    flexDirection: 'row',
    gap: 11,
    marginTop: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: '#fff',
    padding: 18,
  },
  statValue: {
    fontFamily: outfit[800],
    fontSize: 26,
    color: INK,
  },
  statLabel: {
    fontSize: 12.5,
    color: ink(0.5),
    fontFamily: jakarta[600],
    marginTop: 2,
  },
  settings: {
    marginTop: 22,
    borderRadius: 26,
    backgroundColor: '#fff',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: ink(0.09),
  },
  colourRow: {
    paddingVertical: 17,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: ink(0.06),
  },
  settingRowInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  swatches: {
    marginTop: 14,
  },
  settingRow: {
    paddingVertical: 17,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: ink(0.06),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  settingLabel: {
    fontFamily: jakarta[600],
    fontSize: 15,
    color: INK,
  },
  settingValue: {
    fontFamily: jakarta[600],
    fontSize: 15,
    color: ink(0.35),
  },
  signOut: {
    paddingVertical: 17,
    paddingHorizontal: 20,
  },
  signOutLabel: {
    fontFamily: jakarta[600],
    fontSize: 15,
    color: DANGER,
  },
});
