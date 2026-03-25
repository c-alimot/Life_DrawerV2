# Life Drawer

Life Drawer is an Expo + React Native journaling app built around reflective organization instead of a simple timeline. Entries can be grouped into drawers, associated with a current life phase, tagged, and enriched with photos, audio, mood, and location.

## Current architecture

- App shell: Expo Router
- Auth + data: Supabase
- State: Zustand + local screen state
- Forms: React Hook Form + Zod
- Media: Expo AV, Expo Image Picker, Expo Location

Legacy React Navigation files still exist under `src/navigation/`, but the active app path is the Expo Router `app/` tree.

## Setup

1. Install dependencies

```bash
npm install
```

2. Create `.env.local`

```bash
EXPO_PUBLIC_SUPABASE_URL=your-project-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

3. Start the app

```bash
npx expo start
```

## Supabase notes

The app expects:

- app tables for `profiles`, `life_phases`, `drawers`, `entries`, `tags`, `entry_drawers`, and `entry_tags`
- an `entry-media` storage bucket for uploaded images and audio

A recovery migration has been added under [supabase/migrations/20260320120000_recovery_schema.sql](/Users/char/Documents/Life_DrawerV2/supabase/migrations/20260320120000_recovery_schema.sql) to align the schema with the current app contract.

## Current product behavior

- Auth/session restore is gated in `app/_layout.tsx`
- Onboarding completion is persisted locally
- Signup, login, logout, and reset-password initiation are wired
- Entries support text, mood, drawers, tags, life phase association, images, audio, and location
- Voice-to-text is intentionally disabled in the UI until a production-ready implementation is chosen

## Verification

```bash
npx tsc --noEmit
npm run lint
```
