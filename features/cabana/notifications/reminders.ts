// Local, on-device countdown reminders — "3 days to go", "1 sleep left",
// "it's today!" — for every upcoming event the person is part of. These need
// no backend: they're scheduled entirely on the device from data already in
// local state.
//
// Rescheduled wholesale whenever the event list changes (created, joined,
// left, date edited) rather than diffed — cancel-everything-and-rebuild is
// simple and this runs on state changes, not on a hot path.

import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';

import { DAY } from '../data';

const CHANNEL_TAG = 'cabana-reminder';

type ReminderEvent = { id: string; name: string; theme: string; date: string };

/** Offsets before an event's start, and the copy for each. */
const OFFSETS: { beforeMs: number; hour: number; title: string; body: (name: string) => string }[] = [
  { beforeMs: 3 * DAY, hour: 9, title: 'Coming up', body: (name) => `${name} is in 3 days — how's the list looking?` },
  { beforeMs: 1 * DAY, hour: 9, title: 'Tomorrow!', body: (name) => `${name} is tomorrow. One sleep to go.` },
  { beforeMs: 0, hour: 8, title: 'Today’s the day 🎉', body: (name) => `${name} is today!` },
];

const atHour = (date: Date, hour: number) => {
  const d = new Date(date);
  d.setHours(hour, 0, 0, 0);
  return d;
};

/** Replaces every scheduled reminder with a fresh set built from `events`. */
export async function reconcileReminders(events: ReminderEvent[]) {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.content.data?.tag === CHANNEL_TAG)
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );

  const now = Date.now();
  for (const event of events) {
    const eventDate = new Date(event.date);
    for (const offset of OFFSETS) {
      const triggerDate = atHour(new Date(eventDate.getTime() - offset.beforeMs), offset.hour);
      if (triggerDate.getTime() <= now) continue; // don't schedule reminders in the past

      await Notifications.scheduleNotificationAsync({
        content: {
          title: offset.title,
          body: offset.body(event.name),
          data: { tag: CHANNEL_TAG, eventId: event.id },
        },
        trigger: { type: SchedulableTriggerInputTypes.DATE, date: triggerDate },
      });
    }
  }
}

export async function cancelAllReminders() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.content.data?.tag === CHANNEL_TAG)
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}
