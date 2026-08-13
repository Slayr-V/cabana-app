// The two bottom tab bars, plus the single-action bars that replace them on
// the Create and Pack screens. All of them are frosted white strips with a
// hairline top border, pinned below the scrolling area.

import { BlurView } from 'expo-blur';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useCabana, type EventTab, type Screen } from '../state';
import { DIM, INK, ink, WHITE } from '../theme';
import { outfit } from '../type';
import { BagIcon, CalendarIcon, CrewIcon, HomeIcon, ListIcon, PersonIcon, SparkleIcon } from './icons';
import { Shimmer } from './anim';

type IconComponent = (props: { color: string; size?: number }) => React.JSX.Element;

function TabButton({
  Icon,
  active,
  onPress,
  label,
}: {
  Icon: IconComponent;
  active: boolean;
  onPress: () => void;
  label: string;
}) {
  return (
    <Pressable
      style={styles.tab}
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
    >
      <Icon color={active ? INK : DIM} size={25} />
    </Pressable>
  );
}

/** Events / Good stuff / Me — shown on the three top-level screens. */
export function MainTabBar() {
  const { screen, go } = useCabana();
  const is = (s: Screen) => screen === s;

  return (
    <Frosted style={styles.mainBar}>
      <TabButton Icon={CalendarIcon} active={is('events')} onPress={() => go('events')} label="Events" />
      <TabButton Icon={SparkleIcon} active={is('good')} onPress={() => go('good')} label="Good stuff" />
      <TabButton Icon={PersonIcon} active={is('me')} onPress={() => go('me')} label="Me" />
    </Frosted>
  );
}

/** Home / Group list / My stuff / Crew — shown inside an event. */
export function EventTabBar() {
  const { eventTab, setEventTab } = useCabana();
  const is = (t: EventTab) => eventTab === t;

  return (
    <Frosted style={styles.eventBar}>
      <TabButton Icon={HomeIcon} active={is('home')} onPress={() => setEventTab('home')} label="Home" />
      <TabButton Icon={ListIcon} active={is('list')} onPress={() => setEventTab('list')} label="Group list" />
      <TabButton Icon={BagIcon} active={is('mystuff')} onPress={() => setEventTab('mystuff')} label="My stuff" />
      <TabButton Icon={CrewIcon} active={is('crew')} onPress={() => setEventTab('crew')} label="Crew" />
    </Frosted>
  );
}

/** The loading state's greyed-out three-slot bar. */
export function SkeletonTabBar() {
  return (
    <Shimmer style={styles.skeletonBar}>
      <View style={styles.skeletonRow}>
        {[0, 1, 2].map((n) => (
          <View key={n} style={styles.tab}>
            <View style={styles.skeletonGlyph} />
          </View>
        ))}
      </View>
    </Shimmer>
  );
}

/** The full-width primary button that stands in for the tab bar on Create/Pack. */
export function ActionBar({
  label,
  onPress,
  borderAlpha = 0.06,
  backgroundAlpha = 0.94,
  fontSize = 16,
}: {
  label: string;
  onPress: () => void;
  borderAlpha?: number;
  backgroundAlpha?: number;
  fontSize?: number;
}) {
  return (
    <Frosted
      style={[styles.actionBar, { borderTopColor: ink(borderAlpha) }]}
      overlayColor={`rgba(255,255,255,${backgroundAlpha})`}
    >
      <Pressable style={styles.actionButton} onPress={onPress} accessibilityRole="button">
        <Text style={[styles.actionLabel, { fontSize }]}>{label}</Text>
      </Pressable>
    </Frosted>
  );
}

/**
 * `background:rgba(255,255,255,.94);backdrop-filter:blur(14px)` — a real blur
 * underneath, with the near-opaque white wash sitting on top of it.
 */
function Frosted({
  children,
  style,
  overlayColor = 'rgba(255,255,255,0.94)',
}: {
  children: React.ReactNode;
  style?: object | object[];
  overlayColor?: string;
}) {
  return (
    <View style={[styles.frostedBase, style]}>
      <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: overlayColor }]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  frostedBase: {
    flexShrink: 0,
    borderTopWidth: 1,
    borderTopColor: ink(0.06),
  },
  mainBar: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingHorizontal: 18,
    paddingBottom: 26,
    gap: 6,
  },
  eventBar: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingHorizontal: 14,
    paddingBottom: 26,
    gap: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  skeletonBar: {
    flexShrink: 0,
    backgroundColor: WHITE,
    borderTopWidth: 1,
    borderTopColor: ink(0.06),
    paddingTop: 10,
    paddingHorizontal: 18,
    paddingBottom: 26,
  },
  skeletonRow: {
    flexDirection: 'row',
    gap: 6,
  },
  skeletonGlyph: {
    width: 25,
    height: 25,
    borderRadius: 8,
    backgroundColor: '#EDEDF0',
  },
  actionBar: {
    paddingTop: 12,
    paddingHorizontal: 22,
    paddingBottom: 26,
  },
  actionButton: {
    backgroundColor: INK,
    borderRadius: 999,
    paddingVertical: 18,
    alignItems: 'center',
  },
  actionLabel: {
    color: WHITE,
    fontFamily: outfit[700],
  },
});
