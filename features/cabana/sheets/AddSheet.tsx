// "What else do we need?" — free-text entry plus a row of usually-forgotten
// suggestions. Same sheet serves the group list and My Stuff.

import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { SUGGESTIONS } from '../data';
import { useCabana } from '../state';
import { ink, INK, noOutline, PILL, WHITE } from '../theme';
import { jakarta, outfit } from '../type';
import { splitThing } from '../utils';
import { Sheet } from '../components/Sheet';

export function AddSheet() {
  const { addMode, draft, setField, closeAdd, addThing } = useCabana();
  const isMine = addMode === 'mine';

  return (
    <Sheet onDismiss={closeAdd}>
      <Text style={styles.title}>{isMine ? 'What goes in your bag?' : 'What else do we need?'}</Text>

      <View style={styles.inputWrap}>
        <TextInput
          value={draft}
          onChangeText={(v) => setField('draft', v)}
          onSubmitEditing={() => addThing(draft)}
          placeholder={isMine ? 'Toothbrush, hat, charger…' : 'Ice, speaker, watermelon…'}
          placeholderTextColor={ink(0.3)}
          returnKeyType="done"
          autoFocus
          style={styles.input}
        />
      </View>

      <Text style={styles.suggestLabel}>Usually forgotten</Text>
      <View style={styles.suggestions}>
        {SUGGESTIONS[isMine ? 'mine' : 'list'].map((raw) => {
          const parts = splitThing(raw);
          return (
            <Pressable
              key={raw}
              style={styles.chip}
              onPress={() => addThing(raw)}
              accessibilityRole="button"
            >
              <Text style={styles.chipEmoji}>{parts?.emoji}</Text>
              <Text style={styles.chipLabel}>{parts?.name}</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable style={styles.cta} onPress={() => addThing(draft)} accessibilityRole="button">
        <Text style={styles.ctaLabel}>{isMine ? 'Add to my bag' : 'Add to the list'}</Text>
      </Pressable>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: outfit[800],
    fontSize: 24,
    letterSpacing: -0.9,
    color: INK,
  },
  inputWrap: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    ...noOutline,
    flex: 1,
    fontFamily: outfit[700],
    fontSize: 16.5,
    color: INK,
    padding: 0,
  },
  suggestLabel: {
    fontSize: 11.5,
    fontFamily: jakarta[700],
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: ink(0.4),
    paddingTop: 20,
    paddingHorizontal: 2,
    paddingBottom: 10,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: WHITE,
    borderWidth: 1.5,
    borderColor: ink(0.12),
    borderRadius: PILL,
    paddingVertical: 9,
    paddingHorizontal: 15,
  },
  chipEmoji: {
    fontSize: 14,
  },
  chipLabel: {
    fontSize: 13.5,
    fontFamily: outfit[700],
    color: INK,
  },
  cta: {
    marginTop: 24,
    backgroundColor: INK,
    borderRadius: PILL,
    paddingVertical: 17,
    alignItems: 'center',
  },
  ctaLabel: {
    color: WHITE,
    fontFamily: outfit[700],
    fontSize: 16,
  },
});
