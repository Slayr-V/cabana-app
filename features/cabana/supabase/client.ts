// The one Supabase client for the app. Sessions persist in AsyncStorage so a
// signed-in person stays signed in across launches — that's the whole point
// of wiring auth up for real instead of the local "have they seen onboarding"
// flag this replaced.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

import type { Database } from './types';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to ' +
      '.env and fill in your project\'s values from Project Settings → API.',
  );
}

export const supabase = createClient<Database>(url, anonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // This is a native app, not a web redirect flow — there's no URL bar
    // for a session to land in.
    detectSessionInUrl: false,
  },
});
