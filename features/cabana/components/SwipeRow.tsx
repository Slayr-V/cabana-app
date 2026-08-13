// Swipe-left-to-remove row, used by both the group list and My Stuff.
//
// The design drives this from raw pointer events: the row translates with the
// drag, clamped to -112px, snaps open at -104px once you pass -50px, and a
// `_moved` flag stops the drag from also firing the row's tap handler. Same
// numbers here, on PanResponder — which additionally lets the vertical scroll
// win when the gesture is more up-down than left-right.

import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';

import { useCabana } from '../state';
import { DANGER_SWIPE_BG, DANGER_SWIPE_TEXT, ink } from '../theme';
import { outfit } from '../type';

/** Resting offset once a row is snapped open. */
const OPEN_X = -104;
/** Hard stop — the row can't be dragged further than this. */
const MAX_X = -112;
/** Past this, releasing snaps open instead of closed. */
const SNAP_X = -50;
/** `transition:transform .18s cubic-bezier(.2,.8,.2,1)` */
const SETTLE_MS = 180;
const SETTLE_EASING = Easing.bezier(0.2, 0.8, 0.2, 1);

type Props = {
  /** Identifies this row in the store, so only one can be open at a time. */
  swipeKey: string;
  onDelete: () => void;
  onPress: () => void;
  children: React.ReactNode;
};

export function SwipeRow({ swipeKey, onDelete, onPress, children }: Props) {
  const { swipeOpen, setSwipeOpen } = useCabana();
  const isOpen = swipeOpen === swipeKey;

  const tx = useRef(new Animated.Value(0)).current;
  const openRef = useRef(false);
  const movedRef = useRef(false);

  const settle = useRef((open: boolean) => {
    Animated.timing(tx, {
      toValue: open ? OPEN_X : 0,
      duration: SETTLE_MS,
      easing: SETTLE_EASING,
      useNativeDriver: true,
    }).start();
  }).current;

  // Keeps this row in sync when something else closes it — opening another
  // row, changing tab, or a delete landing.
  useEffect(() => {
    openRef.current = isOpen;
    settle(isOpen);
  }, [isOpen, settle]);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_e, g) =>
          Math.abs(g.dx) > 3 && Math.abs(g.dx) > Math.abs(g.dy),
        onPanResponderGrant: () => {
          movedRef.current = false;
        },
        onPanResponderMove: (_e, g) => {
          movedRef.current = true;
          const base = openRef.current ? OPEN_X : 0;
          tx.setValue(Math.max(MAX_X, Math.min(0, base + g.dx)));
        },
        onPanResponderRelease: (_e, g) => {
          const base = openRef.current ? OPEN_X : 0;
          const shouldOpen = base + g.dx < SNAP_X;
          openRef.current = shouldOpen;
          settle(shouldOpen);
          setSwipeOpen(shouldOpen ? swipeKey : null);
          setTimeout(() => {
            movedRef.current = false;
          }, 60);
        },
        onPanResponderTerminate: () => {
          settle(openRef.current);
        },
      }),
    [tx, settle, setSwipeOpen, swipeKey],
  );

  return (
    <View style={styles.clip}>
      <Pressable style={styles.deleteLayer} onPress={onDelete} accessibilityRole="button">
        <Text style={styles.deleteLabel}>🗑 Remove</Text>
      </Pressable>
      <Animated.View style={{ transform: [{ translateX: tx }] }} {...pan.panHandlers}>
        <Pressable
          onPress={() => {
            if (!movedRef.current) onPress();
          }}
          style={styles.row}
        >
          {children}
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    position: 'relative',
    borderRadius: 22,
    overflow: 'hidden',
  },
  deleteLayer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 18,
    backgroundColor: DANGER_SWIPE_BG,
  },
  deleteLabel: {
    fontFamily: outfit[700],
    fontSize: 13.5,
    color: DANGER_SWIPE_TEXT,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1.5,
    borderColor: ink(0.09),
  },
});
