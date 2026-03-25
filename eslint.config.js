// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      'dist/*',
      'src/navigation/**/*',
      'app_placeholder_backup/**/*',
      'LifeDrawer-v2/**/*',
      'src/services/supabase/test.ts',
    ],
    rules: {
      'import/no-unresolved': 'off',
    },
  },
]);
