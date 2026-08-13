// The home screen: a wordmark, your avatar, one gradient card per upcoming
// event with a live countdown, and a dashed "Start something" row.

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DAY, findVibe } from '../data';
import { useCabana, type CabanaEvent } from '../state';
import { cardShadow, INK, ink, PILL, WHITE } from '../theme';
import { jakarta, outfit } from '../type';
import { fmt, pad } from '../utils';
import { Float } from '../components/anim';
import { CardGradient } from '../components/Gradient';

export function EventsScreen() {
  const { events, now, myColor, go, openEvent, startCreate } = useCabana();

  const upcoming = events
    .filter((e) => new Date(e.date).getTime() > now && !e.left)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const greeting =
    upcoming.length === 1
      ? 'Hey Sam — one good thing coming up'
      : `Hey Sam — ${upcoming.length} good things coming up`;

  return (
    <View>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.wordmark}>Cabana</Text>
            <Text style={styles.greeting}>{greeting}</Text>
          </View>
          <Pressable
            onPress={() => go('me')}
            accessibilityRole="button"
            accessibilityLabel="Your profile"
            style={[styles.me, { backgroundColor: myColor }]}
          >
            <Text style={styles.meInitial}>S</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.list}>
        {upcoming.map((event) => (
          <EventCard key={event.id} event={event} now={now} myColor={myColor} onOpen={() => openEvent(event.id)} />
        ))}

        <Pressable style={styles.startRow} onPress={startCreate} accessibilityRole="button">
          <View style={[styles.startPlus, { backgroundColor: myColor }]}>
            <Text style={styles.startPlusGlyph}>+</Text>
          </View>
          <View>
            <Text style={styles.startTitle}>Start something</Text>
            <Text style={styles.startBlurb}>A braai, a festival, a road trip…</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

function EventCard({
  event,
  now,
  myColor,
  onOpen,
}: {
  event: CabanaEvent;
  now: number;
  myColor: string;
  onOpen: () => void;
}) {
  const vibe = findVibe(event.theme);
  const date = new Date(event.date);
  const left = date.getTime() - now;
  const clock = `${pad(Math.floor(left / DAY))}:${pad(Math.floor((left % DAY) / 3600000))}:${pad(
    Math.floor((left % 3600000) / 60000),
  )}`;
  const dateLine = fmt(date) + (event.where ? ` · ${event.where}` : '');

  return (
    <Pressable onPress={onOpen} accessibilityRole="button" style={styles.cardShadow}>
      <CardGradient theme={event.theme} style={styles.card}>
        <Float duration={6000} style={styles.cardDecor}>
          <Text style={styles.cardDecorEmoji}>{vibe.emoji}</Text>
        </Float>

        <View style={styles.cardBody}>
          <View style={styles.cardLabelWrap}>
            <Text style={styles.cardLabel}>{vibe.label}</Text>
          </View>
          <Text style={styles.cardName}>{event.name}</Text>
          <Text style={styles.cardDate}>{dateLine}</Text>

          <View style={styles.cardFooter}>
            <View style={styles.crewStack}>
              {event.crew.slice(0, 5).map((c, i) => (
                <View
                  key={`${c.short}${i}`}
                  style={[
                    styles.crewAvatar,
                    { backgroundColor: c.short === 'You' ? myColor : c.color },
                  ]}
                >
                  <Text style={styles.crewInitial}>{c.initial}</Text>
                </View>
              ))}
            </View>
            <View style={styles.clockPill}>
              <Text style={styles.clockLabel}>{clock}</Text>
            </View>
          </View>
        </View>
      </CardGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 64,
    paddingHorizontal: 22,
    paddingBottom: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  wordmark: {
    fontFamily: outfit[800],
    fontSize: 38,
    letterSpacing: -1.4,
    lineHeight: 38,
    color: INK,
  },
  greeting: {
    fontSize: 14.5,
    fontFamily: jakarta[400],
    color: ink(0.5),
    marginTop: 5,
  },
  me: {
    width: 46,
    height: 46,
    borderRadius: PILL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meInitial: {
    fontFamily: outfit[700],
    fontSize: 16,
    color: INK,
  },
  list: {
    paddingTop: 6,
    paddingHorizontal: 22,
    paddingBottom: 8,
    gap: 16,
  },
  cardShadow: {
    borderRadius: 30,
    ...cardShadow,
  },
  card: {
    borderRadius: 30,
    padding: 22,
    overflow: 'hidden',
  },
  cardDecor: {
    position: 'absolute',
    right: -18,
    top: -22,
    opacity: 0.42,
  },
  cardDecorEmoji: {
    fontSize: 92,
    lineHeight: 108,
  },
  cardBody: {
    position: 'relative',
  },
  cardLabelWrap: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,.75)',
    borderRadius: PILL,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  cardLabel: {
    fontSize: 11.5,
    fontFamily: jakarta[700],
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    color: INK,
  },
  cardName: {
    fontFamily: outfit[800],
    fontSize: 30,
    letterSpacing: -1,
    lineHeight: 31.5,
    marginTop: 14,
    color: INK,
  },
  cardDate: {
    fontSize: 14,
    color: ink(0.62),
    marginTop: 4,
    fontFamily: jakarta[500],
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 22,
    gap: 10,
  },
  crewStack: {
    flexDirection: 'row',
  },
  crewAvatar: {
    width: 34,
    height: 34,
    borderRadius: PILL,
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,.85)',
    marginLeft: -9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crewInitial: {
    fontSize: 12.5,
    fontFamily: outfit[700],
    color: INK,
  },
  clockPill: {
    backgroundColor: INK,
    borderRadius: PILL,
    paddingVertical: 9,
    paddingHorizontal: 15,
  },
  clockLabel: {
    color: WHITE,
    fontSize: 12.5,
    fontFamily: outfit[700],
  },
  startRow: {
    borderRadius: 26,
    padding: 19,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: ink(0.16),
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },
  startPlus: {
    width: 38,
    height: 38,
    borderRadius: PILL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startPlusGlyph: {
    fontFamily: outfit[700],
    fontSize: 22,
    lineHeight: 22,
    marginTop: -1,
    color: INK,
  },
  startTitle: {
    fontFamily: outfit[700],
    fontSize: 16.5,
    color: INK,
  },
  startBlurb: {
    fontSize: 12.5,
    fontFamily: jakarta[400],
    color: ink(0.45),
  },
});
