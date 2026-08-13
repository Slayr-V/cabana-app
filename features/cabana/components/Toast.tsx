// The little black pill that confirms an action ("Sorted! 🎉", "Nudge sent 📣").
// Sits 104px off the bottom so it clears the tab bar, and never takes taps.

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { INK, toastShadow, WHITE } from '../theme';
import { outfit } from '../type';
import { Pop } from './anim';

export function Toast({ message }: { message: string }) {
  return (
    <View style={styles.wrap} pointerEvents="none">
      {/* keyed on the message so a new toast replays the pop */}
      <Pop key={message} duration={350}>
        <View style={styles.pill}>
          <Text style={styles.label}>{message}</Text>
        </View>
      </Pop>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 104,
    alignItems: 'center',
    zIndex: 60,
  },
  pill: {
    backgroundColor: INK,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 20,
    ...toastShadow,
  },
  label: {
    color: WHITE,
    fontFamily: outfit[700],
    fontSize: 14.5,
  },
});
