// Month calendar for picking an event date. Today gets a hairline ring, the
// selected day goes solid black, and past days grey out but stay pickable —
// exactly as the design has it.

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useCabana } from '../state';
import { INK, ink, PILL, WHITE } from '../theme';
import { outfit } from '../type';
import { buildMonth, fmtMonthYear, iso, shiftMonth } from '../utils';
import { Sheet } from '../components/Sheet';

const WEEK_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function DateSheet() {
  const { draftDate, calMonth, setField } = useCabana();
  const month = calMonth ?? draftDate.slice(0, 7);
  const close = () => setField('dateSheetOpen', false);
  const today = iso(new Date());

  return (
    <Sheet onDismiss={close} paddingTop={24} grabberAlpha={0.13}>
      <View style={styles.header}>
        <Text style={styles.title}>{fmtMonthYear(month)}</Text>
        <View style={styles.nav}>
          <Pressable
            style={styles.navButton}
            onPress={() => setField('calMonth', shiftMonth(month, -1))}
            accessibilityRole="button"
            accessibilityLabel="Previous month"
          >
            <Text style={styles.navGlyph}>‹</Text>
          </Pressable>
          <Pressable
            style={styles.navButton}
            onPress={() => setField('calMonth', shiftMonth(month, 1))}
            accessibilityRole="button"
            accessibilityLabel="Next month"
          >
            <Text style={styles.navGlyph}>›</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.weekRow}>
        {WEEK_LABELS.map((label, i) => (
          <View key={i} style={styles.weekCell}>
            <Text style={styles.weekLabel}>{label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {buildMonth(month).map((cell) => {
          if (cell.blank) return <View key={cell.id} style={styles.cell} />;

          const selected = cell.iso === draftDate;
          const past = cell.iso < today;
          const isToday = cell.iso === today;

          return (
            <Pressable
              key={cell.id}
              style={styles.cell}
              onPress={() => setField('draftDate', cell.iso)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <View
                style={[
                  styles.day,
                  selected && styles.daySelected,
                  !selected && isToday && styles.dayToday,
                ]}
              >
                <Text
                  style={[
                    styles.dayLabel,
                    { color: selected ? WHITE : past ? ink(0.28) : INK },
                  ]}
                >
                  {cell.day}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <Pressable style={styles.done} onPress={close} accessibilityRole="button">
        <Text style={styles.doneLabel}>Done</Text>
      </Pressable>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: outfit[800],
    fontSize: 21,
    letterSpacing: -0.7,
    color: INK,
  },
  nav: {
    flexDirection: 'row',
    gap: 8,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: PILL,
    backgroundColor: WHITE,
    borderWidth: 1.5,
    borderColor: ink(0.12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  navGlyph: {
    fontSize: 15,
    color: INK,
  },
  weekRow: {
    flexDirection: 'row',
    marginTop: 18,
  },
  weekCell: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    paddingBottom: 6,
  },
  weekLabel: {
    fontSize: 11,
    fontFamily: outfit[700],
    letterSpacing: 0.5,
    color: ink(0.35),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  day: {
    width: 38,
    height: 38,
    borderRadius: PILL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daySelected: {
    backgroundColor: INK,
  },
  dayToday: {
    borderWidth: 1.5,
    borderColor: ink(0.25),
  },
  dayLabel: {
    fontFamily: outfit[700],
    fontSize: 15,
  },
  done: {
    marginTop: 20,
    backgroundColor: INK,
    borderRadius: PILL,
    paddingVertical: 16,
    alignItems: 'center',
  },
  doneLabel: {
    color: WHITE,
    fontFamily: outfit[700],
    fontSize: 15.5,
  },
});
