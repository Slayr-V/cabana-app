// Sign up / log in. A segmented pill switches modes; sign-up adds a name
// field and the colour picker, log in drops both.

import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useCabana } from '../state';
import { ink, INK, noOutline, PILL, WHITE } from '../theme';
import { jakarta, outfit } from '../type';
import { FieldLabel, SwatchRow } from '../components/common';

export function AuthScreen() {
  const { authMode, fName, fEmail, fPass, myColor, setField, finishAuth } = useCabana();
  const isSignup = authMode === 'signup';

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>{isSignup ? 'Make yourself a Cabana' : 'Welcome back'}</Text>
      <Text style={styles.blurb}>
        {isSignup ? 'One account, all your plans and your crew.' : 'Pick up where the crew left off.'}
      </Text>

      <View style={styles.segment}>
        <Pressable
          style={[styles.segmentTab, { backgroundColor: isSignup ? INK : 'transparent' }]}
          onPress={() => setField('authMode', 'signup')}
          accessibilityRole="button"
        >
          <Text style={[styles.segmentLabel, { color: isSignup ? WHITE : ink(0.45) }]}>Sign up</Text>
        </Pressable>
        <Pressable
          style={[styles.segmentTab, { backgroundColor: !isSignup ? INK : 'transparent' }]}
          onPress={() => setField('authMode', 'login')}
          accessibilityRole="button"
        >
          <Text style={[styles.segmentLabel, { color: !isSignup ? WHITE : ink(0.45) }]}>Log in</Text>
        </Pressable>
      </View>

      {isSignup && (
        <View style={[styles.field, styles.fieldFirst]}>
          <FieldLabel>Your name</FieldLabel>
          <TextInput
            value={fName}
            onChangeText={(v) => setField('fName', v)}
            placeholder="Sam"
            placeholderTextColor={ink(0.25)}
            style={styles.input}
          />
        </View>
      )}

      {/* the design gives this field a flat 11px top margin in both modes */}
      <View style={[styles.field, styles.fieldNext]}>
        <FieldLabel>Email or number</FieldLabel>
        <TextInput
          value={fEmail}
          onChangeText={(v) => setField('fEmail', v)}
          placeholder="sam@cabana.app"
          placeholderTextColor={ink(0.25)}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />
      </View>

      <View style={[styles.field, styles.fieldNext]}>
        <FieldLabel>Password</FieldLabel>
        <TextInput
          value={fPass}
          onChangeText={(v) => setField('fPass', v)}
          placeholder="••••••••"
          placeholderTextColor={ink(0.25)}
          secureTextEntry
          style={styles.input}
        />
      </View>

      {isSignup && (
        <>
          <View style={styles.swatchLabel}>
            <FieldLabel>Pick your colour</FieldLabel>
          </View>
          <SwatchRow selected={myColor} onPick={(c) => setField('myColor', c)} />
        </>
      )}

      <Pressable style={styles.cta} onPress={finishAuth} accessibilityRole="button">
        <Text style={styles.ctaLabel}>{isSignup ? 'Create my account' : 'Log me in'}</Text>
      </Pressable>

      <Pressable style={styles.secondary} onPress={finishAuth} accessibilityRole="button">
        <Text style={styles.secondaryLabel}>Continue with a phone number</Text>
      </Pressable>

      <Text style={styles.legal}>
        By carrying on you agree to be a good guest.{'\n'}House rules &amp; privacy.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    minHeight: '100%',
    paddingTop: 66,
    paddingHorizontal: 26,
    paddingBottom: 34,
    backgroundColor: WHITE,
  },
  title: {
    fontFamily: outfit[800],
    fontSize: 34,
    letterSpacing: -1.3,
    lineHeight: 35.7,
    color: INK,
  },
  blurb: {
    fontSize: 15,
    fontFamily: jakarta[500],
    color: ink(0.5),
    marginTop: 8,
  },
  segment: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 26,
    backgroundColor: WHITE,
    borderWidth: 1.5,
    borderColor: ink(0.12),
    borderRadius: PILL,
    padding: 5,
  },
  segmentTab: {
    flex: 1,
    alignItems: 'center',
    borderRadius: PILL,
    paddingVertical: 11,
  },
  segmentLabel: {
    fontFamily: outfit[700],
    fontSize: 14,
  },
  field: {
    borderRadius: 26,
    backgroundColor: WHITE,
    borderWidth: 1.5,
    borderColor: ink(0.1),
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  fieldFirst: {
    marginTop: 16,
  },
  fieldNext: {
    marginTop: 11,
  },
  input: {
    ...noOutline,
    width: '100%',
    fontFamily: outfit[700],
    fontSize: 19,
    letterSpacing: -0.4,
    color: INK,
    marginTop: 6,
    padding: 0,
  },
  swatchLabel: {
    paddingTop: 24,
    paddingHorizontal: 4,
    paddingBottom: 11,
  },
  cta: {
    marginTop: 26,
    backgroundColor: INK,
    borderRadius: PILL,
    paddingVertical: 19,
    alignItems: 'center',
  },
  ctaLabel: {
    color: WHITE,
    fontFamily: outfit[700],
    fontSize: 16.5,
  },
  secondary: {
    marginTop: 12,
    borderRadius: PILL,
    borderWidth: 1.5,
    borderColor: ink(0.14),
    paddingVertical: 17,
    alignItems: 'center',
  },
  secondaryLabel: {
    fontFamily: outfit[700],
    fontSize: 15.5,
    color: INK,
  },
  legal: {
    textAlign: 'center',
    fontSize: 12.5,
    fontFamily: jakarta[500],
    color: ink(0.4),
    marginTop: 18,
    lineHeight: 18.75,
  },
});
