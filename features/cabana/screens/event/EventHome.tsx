// The event's Home tab: list status, what still needs a hero, the crew strip,
// the live updates feed, and the way out.

import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FEED_TTL, findVibe } from '../../data';
import { useCabana } from '../../state';
import { DANGER, INK, ink, PILL, WHITE } from '../../theme';
import { jakarta, outfit } from '../../type';
import { relativeAge } from '../../utils';
import { Fade } from '../../components/anim';

export function EventHome() {
  const { active, now, myColor, setEventTab, openAdd, setField, go } = useCabana();
  const vibe = findVibe(active.theme);

  const total = active.items.length + active.mine.length;
  const done =
    active.items.filter((i) => i.done).length + active.mine.filter((i) => i.done).length;
  const ratio = total ? done / total : 0;
  const openItems = active.items.filter((i) => !i.done);
  const liveFeed = active.feed.filter((f) => now - f.ts < FEED_TTL);

  const headline =
    ratio > 0.8
      ? 'Nearly party-ready 🎉'
      : ratio > 0.45
        ? `Getting there, crew ${vibe.emoji}`
        : 'Early days, plenty of time ☀️';
  const sortedLine = `${done} of ${total} things are sorted`;

  return (
    <View style={styles.screen}>
      {active.items.length === 0 ? (
        <Pressable style={styles.emptyCard} onPress={() => openAdd('list')} accessibilityRole="button">
          <Text style={styles.emptyEmoji}>🧺</Text>
          <Text style={styles.emptyTitle}>Nothing on the list yet</Text>
          <Text style={styles.emptyBlurb}>Add the first thing and the crew can start claiming.</Text>
          <View style={[styles.emptyCta, { backgroundColor: myColor }]}>
            <Text style={styles.emptyCtaLabel}>＋ Add the first thing</Text>
          </View>
        </Pressable>
      ) : (
        <View style={styles.statusCard}>
          <Text style={styles.statusHeadline}>{headline}</Text>
          <Text style={styles.statusSub}>{sortedLine}</Text>
          <Pressable
            style={styles.statusLink}
            onPress={() => setEventTab('list')}
            accessibilityRole="button"
          >
            <Text style={styles.statusLinkLabel}>See the group list →</Text>
          </Pressable>
        </View>
      )}

      {openItems.length > 0 && (
        <View style={styles.heroCard}>
          <Text style={styles.heroCardDecor}>👀</Text>
          <Text style={styles.heroCardKicker}>Still needs a hero</Text>
          <View style={styles.heroCardChips}>
            {openItems.map((item) => (
              <Pressable
                key={item.id}
                style={styles.heroChip}
                onPress={() => setEventTab('list')}
                accessibilityRole="button"
              >
                <Text style={styles.heroChipEmoji}>{item.emoji}</Text>
                <Text style={styles.heroChipLabel}>{item.name}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.heroCardFoot}>Nobody has ticked these off yet</Text>
        </View>
      )}

      <View>
        <Text style={styles.sectionHeading}>The crew</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.crewStrip}>
          {active.crew.map((c, i) => (
            <View key={`${c.short}${i}`} style={styles.crewCard}>
              <View
                style={[
                  styles.crewAvatar,
                  { backgroundColor: c.short === 'You' ? myColor : c.color },
                ]}
              >
                <Text style={styles.crewInitial}>{c.initial}</Text>
              </View>
              <Text style={styles.crewName}>{c.short}</Text>
              <Text style={styles.crewTag}>{c.tag}</Text>
            </View>
          ))}
          <Pressable style={styles.inviteCard} onPress={() => go('invite')} accessibilityRole="button">
            <View style={styles.invitePlus}>
              <Text style={styles.invitePlusGlyph}>+</Text>
            </View>
            <Text style={styles.crewName}>Invite</Text>
          </Pressable>
        </ScrollView>
      </View>

      <View>
        <View style={styles.updatesHeader}>
          <Text style={styles.sectionHeadingInline}>Updates</Text>
          <Text style={styles.updatesWindow}>last 5 minutes</Text>
        </View>

        <View style={styles.feed}>
          {liveFeed.map((f) => (
            <Fade key={f.id} style={styles.feedRow}>
              <Text style={styles.feedText}>{f.text}</Text>
              <Text style={styles.feedWhen}>{relativeAge(Math.max(0, now - f.ts))}</Text>
            </Fade>
          ))}
          {liveFeed.length === 0 && (
            <View style={styles.feedEmpty}>
              <Text style={styles.feedEmptyLabel}>
                All quiet right now — updates show up here as the crew ticks things off.
              </Text>
            </View>
          )}
        </View>

        <Pressable
          style={styles.leave}
          onPress={() => setField('leaveOpen', true)}
          accessibilityRole="button"
        >
          <Text style={styles.leaveLabel}>Leave this trip</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingTop: 22,
    paddingHorizontal: 22,
    paddingBottom: 30,
    gap: 16,
  },
  emptyCard: {
    borderRadius: 28,
    backgroundColor: '#fff',
    padding: 22,
    borderWidth: 1.5,
    borderColor: ink(0.09),
  },
  emptyEmoji: {
    fontSize: 30,
    lineHeight: 36,
  },
  emptyTitle: {
    fontFamily: outfit[800],
    fontSize: 21,
    letterSpacing: -0.7,
    marginTop: 10,
    color: INK,
  },
  emptyBlurb: {
    fontSize: 14,
    color: ink(0.5),
    marginTop: 4,
    fontFamily: jakarta[500],
  },
  emptyCta: {
    marginTop: 16,
    alignSelf: 'flex-start',
    borderRadius: PILL,
    paddingVertical: 11,
    paddingHorizontal: 17,
  },
  emptyCtaLabel: {
    fontSize: 13.5,
    fontFamily: outfit[700],
    color: INK,
  },
  statusCard: {
    borderRadius: 28,
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 22,
    borderWidth: 1.5,
    borderColor: ink(0.09),
  },
  statusHeadline: {
    fontFamily: outfit[800],
    fontSize: 22,
    letterSpacing: -0.7,
    color: INK,
  },
  statusSub: {
    fontSize: 14,
    color: ink(0.5),
    marginTop: 4,
    fontFamily: jakarta[500],
  },
  statusLink: {
    marginTop: 16,
    alignSelf: 'flex-start',
    backgroundColor: WHITE,
    borderWidth: 1.5,
    borderColor: ink(0.12),
    borderRadius: PILL,
    paddingVertical: 9,
    paddingHorizontal: 16,
  },
  statusLinkLabel: {
    fontSize: 13,
    fontFamily: outfit[700],
    color: INK,
  },
  heroCard: {
    borderRadius: 28,
    backgroundColor: '#F6F084',
    paddingVertical: 20,
    paddingHorizontal: 22,
    overflow: 'hidden',
  },
  heroCardDecor: {
    position: 'absolute',
    right: 14,
    bottom: -10,
    fontSize: 66,
    lineHeight: 78,
    opacity: 0.5,
  },
  heroCardKicker: {
    fontSize: 12,
    fontFamily: jakarta[700],
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: ink(0.55),
  },
  heroCardChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  heroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(255,255,255,.85)',
    borderRadius: PILL,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  heroChipEmoji: {
    fontSize: 14,
  },
  heroChipLabel: {
    fontSize: 13.5,
    fontFamily: outfit[700],
    color: INK,
  },
  heroCardFoot: {
    fontSize: 12.5,
    color: ink(0.5),
    marginTop: 14,
    fontFamily: jakarta[600],
  },
  sectionHeading: {
    fontFamily: outfit[700],
    fontSize: 16,
    letterSpacing: -0.3,
    paddingTop: 8,
    paddingHorizontal: 4,
    paddingBottom: 12,
    color: INK,
  },
  sectionHeadingInline: {
    fontFamily: outfit[700],
    fontSize: 16,
    letterSpacing: -0.3,
    color: INK,
  },
  crewStrip: {
    gap: 10,
    paddingBottom: 4,
  },
  crewCard: {
    width: 82,
    borderRadius: 24,
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: ink(0.09),
  },
  crewAvatar: {
    width: 44,
    height: 44,
    borderRadius: PILL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crewInitial: {
    fontFamily: outfit[700],
    fontSize: 16,
    color: INK,
  },
  crewName: {
    fontSize: 12.5,
    fontFamily: jakarta[700],
    marginTop: 8,
    color: INK,
  },
  crewTag: {
    fontSize: 10.5,
    color: ink(0.4),
    fontFamily: jakarta[600],
  },
  inviteCard: {
    width: 82,
    borderRadius: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: ink(0.15),
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  invitePlus: {
    width: 44,
    height: 44,
    borderRadius: PILL,
    backgroundColor: WHITE,
    borderWidth: 1.5,
    borderColor: ink(0.12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  invitePlusGlyph: {
    fontFamily: outfit[700],
    fontSize: 22,
    lineHeight: 22,
    marginTop: -1,
    color: INK,
  },
  updatesHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingHorizontal: 4,
    paddingBottom: 12,
  },
  updatesWindow: {
    fontSize: 11.5,
    fontFamily: jakarta[600],
    color: ink(0.35),
  },
  feed: {
    gap: 9,
  },
  feedRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 22,
    paddingVertical: 15,
    paddingHorizontal: 18,
    borderWidth: 1.5,
    borderColor: ink(0.09),
  },
  feedText: {
    flex: 1,
    fontSize: 14.5,
    fontFamily: jakarta[600],
    lineHeight: 19.6,
    color: INK,
  },
  feedWhen: {
    fontSize: 11,
    color: ink(0.35),
    fontFamily: jakarta[600],
  },
  feedEmpty: {
    borderRadius: 22,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: ink(0.13),
    paddingVertical: 20,
    paddingHorizontal: 18,
  },
  feedEmptyLabel: {
    textAlign: 'center',
    fontSize: 13.5,
    fontFamily: jakarta[600],
    color: ink(0.38),
  },
  leave: {
    marginTop: 22,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: ink(0.1),
    paddingVertical: 17,
    alignItems: 'center',
  },
  leaveLabel: {
    fontFamily: outfit[700],
    fontSize: 14.5,
    color: DANGER,
  },
});
