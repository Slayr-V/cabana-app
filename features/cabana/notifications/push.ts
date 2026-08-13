// Push token registration. Two things gate this: push only works on a real
// device (never a simulator), and the person has to grant permission — both
// checked before we ever call Expo's token API.

import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { registerPushToken } from '../supabase/queries';

// Foreground notifications still show a banner + sound — without this
// handler they'd arrive silently while the app is open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('default', {
    name: 'default',
    importance: Notifications.AndroidImportance.DEFAULT,
  }).catch(() => {});
}

/**
 * Asks for permission if needed, fetches this device's Expo push token, and
 * saves it to the signed-in person's profile. Safe to call every launch —
 * it's a no-op once permission is already granted and the token is fresh.
 */
export async function registerForPushNotifications(userId: string): Promise<string | null> {
  if (!Device.isDevice) return null; // simulators can't receive push

  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;
  if (status !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }
  if (status !== 'granted') return null;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const { data: token } = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined,
  );

  await registerPushToken(userId, token);
  return token;
}

/** Called on sign-out so a shared/borrowed device stops receiving pushes for this account. */
export async function unregisterPushNotifications(userId: string) {
  await registerPushToken(userId, null).catch(() => {});
}
