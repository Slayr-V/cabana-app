// The celebration screen right after creating an event — confetti drifting
// up the gradient, then the three ways to get the crew in.

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { findVibe } from '../data';
import { useCabana } from '../state';
import { INK, ink, PILL } from '../theme';
import { jakarta, outfit } from '../type';
import { Pop, Rise } from '../components/anim';
import { HeroGradient } from '../components/Gradient';

export function InviteScreen() {
  const { active, setEventTab, go } = useCabana();
  const vibe = findVibe(active.theme);

  const enterNew = () => {
    setEventTab('home');
    go('event');
  };

  const inviteCopy = `“Sam started ${active.name} on Cabana ${vibe.emoji} — come claim what you’re bringing.”`;

  return (
    <HeroGradient theme={active.theme} style={styles.screen}>
      <Rise duration={2600} style={[styles.fleck, { left: 34, top: 150 }]}>
        <Text style={{ fontSize: 22 }}>✨</Text>
      </Rise>
      <Rise duration={3100} delay={400} style={[styles.fleck, { right: 52, top: 200 }]}>
        <Text style={{ fontSize: 18 }}>🎉</Text>
      </Rise>
      <Rise duration={2900} delay={900} style={[styles.fleck, { left: '52%', top: 120 }]}>
        <Text style={{ fontSize: 16 }}>🌟</Text>
      </Rise>

      <View style={styles.headline}>
        <Pop duration={500}>
          <Text style={styles.heroEmoji}>{vibe.emoji}</Text>
        </Pop>
        <Text style={styles.title}>
          {active.name}
          {'\n'}is happening!
        </Text>
        <Text style={styles.blurb}>Now the fun part — get the crew in.</Text>
      </View>

      <View style={styles.actions}>
        <Pressable style={[styles.action, styles.whatsapp]} onPress={enterNew} accessibilityRole="button">
          <Text style={[styles.actionLabel, styles.whatsappLabel]}>Invite on WhatsApp</Text>
        </Pressable>
        <Pressable style={[styles.action, styles.messages]} onPress={enterNew} accessibilityRole="button">
          <Text style={styles.actionLabel}>Invite via Messages</Text>
        </Pressable>
        <Pressable style={[styles.action, styles.copy]} onPress={enterNew} accessibilityRole="button">
          <Text style={styles.actionLabel}>Copy invite link 🔗</Text>
        </Pressable>
      </View>

      <View style={styles.preview}>
        <Text style={styles.previewLabel}>They’ll see</Text>
        <Text style={styles.previewCopy}>{inviteCopy}</Text>
      </View>

      <Pressable onPress={enterNew} accessibilityRole="button">
        <Text style={styles.later}>I’ll invite later</Text>
      </Pressable>
    </HeroGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: 70,
    paddingHorizontal: 22,
    paddingBottom: 30,
    overflow: 'hidden',
  },
  fleck: {
    position: 'absolute',
  },
  headline: {
    alignItems: 'center',
  },
  heroEmoji: {
    fontSize: 62,
    lineHeight: 73,
  },
  title: {
    fontFamily: outfit[800],
    fontSize: 34,
    letterSpacing: -1.3,
    lineHeight: 35.7,
    marginTop: 16,
    textAlign: 'center',
    color: INK,
  },
  blurb: {
    fontSize: 14.5,
    color: ink(0.55),
    fontFamily: jakarta[600],
    marginTop: 10,
    textAlign: 'center',
  },
  actions: {
    marginTop: 34,
    gap: 11,
  },
  action: {
    borderRadius: PILL,
    paddingVertical: 17,
    alignItems: 'center',
  },
  actionLabel: {
    fontFamily: outfit[700],
    fontSize: 16,
    color: INK,
  },
  whatsapp: {
    backgroundColor: '#25D366',
  },
  whatsappLabel: {
    color: '#0B3D22',
  },
  messages: {
    backgroundColor: '#fff',
  },
  copy: {
    backgroundColor: 'rgba(255,255,255,.55)',
  },
  preview: {
    marginTop: 22,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,.72)',
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  previewLabel: {
    fontSize: 12,
    fontFamily: jakarta[700],
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: ink(0.4),
  },
  previewCopy: {
    fontSize: 15,
    fontFamily: jakarta[600],
    lineHeight: 21.75,
    marginTop: 8,
    color: INK,
  },
  later: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
    fontFamily: jakarta[700],
    color: ink(0.45),
  },
});
