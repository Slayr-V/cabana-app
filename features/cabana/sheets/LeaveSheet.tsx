// Confirmation before leaving a trip — spells out that claimed items go back
// up for grabs and the private list is deleted.

import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { useCabana } from '../state';
import { DANGER, INK, ink, PILL, WHITE } from '../theme';
import { jakarta, outfit } from '../type';
import { Sheet } from '../components/Sheet';

export function LeaveSheet() {
  const { active, setField, leaveTrip } = useCabana();
  const close = () => setField('leaveOpen', false);

  return (
    <Sheet onDismiss={close}>
      <Text style={styles.title}>Leave {active.name}?</Text>
      <Text style={styles.blurb}>
        Anything you ticked off goes back up for grabs, and your private My Stuff list for this trip
        is deleted.
      </Text>

      <Pressable style={styles.confirm} onPress={leaveTrip} accessibilityRole="button">
        <Text style={styles.confirmLabel}>Yes, leave the trip</Text>
      </Pressable>
      <Pressable onPress={close} accessibilityRole="button">
        <Text style={styles.stay}>Stay</Text>
      </Pressable>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: outfit[800],
    fontSize: 23,
    letterSpacing: -0.8,
    color: INK,
  },
  blurb: {
    fontSize: 14,
    fontFamily: jakarta[500],
    color: ink(0.5),
    marginTop: 6,
    lineHeight: 21,
  },
  confirm: {
    marginTop: 22,
    backgroundColor: DANGER,
    borderRadius: PILL,
    paddingVertical: 17,
    alignItems: 'center',
  },
  confirmLabel: {
    color: WHITE,
    fontFamily: outfit[700],
    fontSize: 16,
  },
  stay: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
    fontFamily: jakarta[700],
    color: ink(0.45),
  },
});
