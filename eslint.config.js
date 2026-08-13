// https://docs.expo.dev/guides/using-eslint/
const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
  {
    // Deno runtime code (Supabase Edge Functions) — different globals,
    // different module resolution (npm:/jsr: specifiers). Checked via the
    // Supabase CLI (`supabase functions deploy` typechecks on push), not
    // this config.
    ignores: ['node_modules/*', '.expo/*', 'dist/*', 'supabase/functions/**'],
  },
];
