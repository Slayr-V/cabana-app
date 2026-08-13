// Bottom sheet: a full-bleed scrim that dismisses on tap, plus a white panel
// pinned to the bottom with 34px top corners and the cbPop entrance. Four of
// these exist in the design (add a thing, leave the trip, pick an event, pick
// a date) and they only differ in padding and grabber opacity.

import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ink, sheetShadow, WHITE } from '../theme';
import { Pop } from './anim';

type Props = {
  onDismiss: () => void;
  children: React.ReactNode;
  /** The date sheet uses 24px top padding; every other sheet uses 26px. */
  paddingTop?: number;
  /** The date sheet's grabber sits at .13 alpha; the rest at .15. */
  grabberAlpha?: number;
};

export function Sheet({ onDismiss, children, paddingTop = 26, grabberAlpha = 0.15 }: Props) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Pressable style={[StyleSheet.absoluteFill, styles.scrim]} onPress={onDismiss} />
      <Pop style={styles.panelWrap}>
        <View style={[styles.panel, { paddingTop }]}>
          <View style={[styles.grabber, { backgroundColor: ink(grabberAlpha) }]} />
          {children}
        </View>
      </Pop>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    backgroundColor: ink(0.35),
  },
  panelWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  panel: {
    backgroundColor: WHITE,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingHorizontal: 22,
    paddingBottom: 30,
    ...sheetShadow,
  },
  grabber: {
    width: 44,
    height: 5,
    borderRadius: 99,
    alignSelf: 'center',
    marginBottom: 20,
  },
});
