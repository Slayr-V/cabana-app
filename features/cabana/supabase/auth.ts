// Sign-up/log-in against Supabase Auth. Name and colour ride along as
// sign-up metadata — the `handle_new_user` trigger in the schema reads them
// off `raw_user_meta_data` to populate the profiles row, so there's no
// separate "create my profile" round trip after auth succeeds.

import { supabase } from './client';

export async function signUp(input: {
  name: string;
  email: string;
  password: string;
  color: string;
}) {
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: { data: { name: input.name || 'Guest', color: input.color } },
  });
  if (error) throw error;
  return data;
}

export async function signIn(input: { email: string; password: string }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/** Turns a Supabase auth error into the short, human copy the toast can show. */
export function authErrorMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  if (/invalid login credentials/i.test(raw)) return 'Wrong email or password';
  if (/user already registered/i.test(raw)) return 'That email’s already got an account';
  if (/password.*(least|short|characters)/i.test(raw)) return 'Password’s too short';
  if (/invalid email/i.test(raw)) return 'That email doesn’t look right';
  if (/network/i.test(raw)) return 'No connection — try again';
  return raw;
}
