// The five CSS keyframe animations declared in the handoff's <style> block,
// reimplemented on RN's Animated. Names, durations, delays and easings match
// the originals; each one is a drop-in wrapper around whatever it decorates.

import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, type ViewStyle, type StyleProp } from 'react-native';

type WrapProps = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  pointerEvents?: 'auto' | 'none' | 'box-none' | 'box-only';
};

/**
 * `@keyframes cbFloat` — a lazy bob-and-tilt, used on the oversized emoji
 * that sit behind the onboarding, event-card and hero artwork.
 * `0%{translateY(0) rotate(0)} 50%{translateY(-7px) rotate(6deg)} 100%{…}`
 */
export function Float({ children, style, duration = 6000, pointerEvents }: WrapProps & { duration?: number }) {
  const v = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, {
          toValue: 1,
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(v, {
          toValue: 0,
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [v, duration]);

  return (
    <Animated.View
      pointerEvents={pointerEvents ?? 'none'}
      style={[
        style,
        {
          transform: [
            { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -7] }) },
            { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '6deg'] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/**
 * `@keyframes cbRise` — the confetti flecks drifting up the invite screen.
 * `0%{translateY(0) scale(.4);opacity:0} 25%{opacity:1} 100%{translateY(-90px) scale(1);opacity:0}`
 */
export function Rise({ children, style, duration = 2600, delay = 0 }: WrapProps & { duration?: number; delay?: number }) {
  const v = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(v, {
          toValue: 1,
          duration,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [v, duration, delay]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        style,
        {
          opacity: v.interpolate({ inputRange: [0, 0.25, 1], outputRange: [0, 1, 0] }),
          transform: [
            { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -90] }) },
            { scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/**
 * `@keyframes cbShimmer` — the loading skeleton's breathing opacity.
 * `0%{opacity:.55} 50%{opacity:1} 100%{opacity:.55}` over 1.4s.
 */
export function Shimmer({ children, style }: WrapProps) {
  const v = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [v]);

  return (
    <Animated.View
      style={[style, { opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] }) }]}
    >
      {children}
    </Animated.View>
  );
}

/**
 * `@keyframes cbPop` — the overshoot every bottom sheet, the toast and the
 * invite screen's hero emoji enter with.
 * `0%{scale(.7) translateY(8px);opacity:0} 60%{scale(1.04)} 100%{scale(1)}`
 */
export function Pop({ children, style, duration = 300 }: WrapProps & { duration?: number }) {
  const v = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(v, {
      toValue: 1,
      duration,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, [v, duration]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: v.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 1, 1] }),
          transform: [
            { scale: v.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0.7, 1.04, 1] }) },
            { translateY: v.interpolate({ inputRange: [0, 0.6, 1], outputRange: [8, 0, 0] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/**
 * `@keyframes cbFade` — each update row easing in as it lands on the feed.
 * `0%{opacity:0;translateY(10px)} 100%{opacity:1;translateY(0)}` over .3s.
 */
export function Fade({ children, style }: WrapProps) {
  const v = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(v, {
      toValue: 1,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, [v]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: v,
          transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/**
 * Converts a CSS gradient angle into the `start`/`end` unit-square points
 * expo-linear-gradient wants. CSS measures clockwise from "to top", so 170deg
 * is almost straight down with a slight rightward lean.
 */
export const gradientPoints = (angleDeg: number) => {
  const rad = (angleDeg * Math.PI) / 180;
  const dx = Math.sin(rad);
  const dy = -Math.cos(rad);
  return {
    start: { x: 0.5 - dx / 2, y: 0.5 - dy / 2 },
    end: { x: 0.5 + dx / 2, y: 0.5 + dy / 2 },
  };
};

/** Memoised `gradientPoints` for use inside render. */
export const useGradientPoints = (angleDeg: number) =>
  useMemo(() => gradientPoints(angleDeg), [angleDeg]);
