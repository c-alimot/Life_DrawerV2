# Return Experience

## Purpose

Return helps someone optionally revisit older Entries, notice connected reflections, and write a new reflection without changing the original Entry. It is not a productivity, streak, or recommendation system.

## Product rules

- Return is optional and can be paused globally.
- Entries and Drawers remain available through normal browsing, search, filters, and connected-reflection history when excluded from Return.
- Return uses only user-owned Entries, Drawers, Tags, saved-for-later status, dates, and explicit reflection links.
- The app does not infer sentiment, themes from Entry text, or mental-health meaning.

## Data model

`entries` stores Return fields: `parent_entry_id`, `reflection_type`, `last_viewed_at`, `revisit_count`, `saved_for_later`, `resurfacing_enabled`, `last_resurfaced_at`, `resurface_count`, and `return_dismissed_until`.

`drawers.resurfacing_enabled` excludes an entire Drawer from automatic suggestions without changing its Entries. A child reflection references its parent with the same `user_id`, enforced by `entries_parent_entry_user_fk`.

## Eligibility and priority

Automated Home, Drawer, and Insights Return suggestions require:

1. Authenticated ownership and global Return enabled.
2. Entry and every linked Drawer included in Return suggestions.
3. An Entry at least 30 days old with a meaningful preview.
4. No view in the last 7 days, no display in the last 21 days, and no active temporary dismissal.

Home and Insights use this order: saved for later, from around this time (only when enabled), continuing reflection, not viewed recently, then from the collection. Drawer Return uses: saved for later, continuing reflection, least recently viewed, then earlier collection Entries.

The candidate query is capped at 60 candidate rows. Results are selected deterministically by the shared selector; do not add surface-specific eligibility checks outside `basicReturnEntry.ts` and `isEntryEligibleForReturn.ts`.

## Tracking

- A full Entry route records a revisit through `record_entry_view`; previews and route prefetching do not.
- The first post-create Entry route uses `skipReturnView=1`, so it does not count as a revisit.
- Client-side five-second deduplication protects strict-mode and repeated-render view and display mutations.
- Home, Drawer, and Insights record a Return display only after a card is shown. That shared timestamp activates the 21-day cooldown.

## Reflections

`returnService.createLinkedReflection` verifies the original Entry belongs to the authenticated user before creating a child. `getReflectionChain` walks ancestors and descendants with cycle guards, returns chronological Entries, and preserves branches. Missing parents leave remaining accessible Entries intact.

## Settings and privacy

`profiles` stores global Return, Home, around-this-time, Insights, and notification-frequency preferences. Global Return disables automatic surfaces but preserves sub-setting values. Notification delivery is not implemented; the stored frequency is UI-only and any future notification must use generic copy without Entry details.

Excluded content is managed in Settings. Entry exclusions reveal only an Entry date; Drawer exclusions reveal a Drawer name. Restore actions re-enable only the selected Entry or Drawer, so individual Entry exclusions remain in force when a Drawer is restored.

Automated candidate services scope direct queries to `user_id`. SQL RPCs use `security invoker`, `auth.uid()`, and authenticated-only grants. This repository does not define a separate app-lock or locked-Entry model; private media is protected with per-user storage policies. If a lock model is introduced, exclude locked content from automated Return until protected previews are implemented.

## Main surfaces

- Home: `HomeReturnSection`, `useBasicReturnEntry`
- Entry detail and reflection history: `EntryDetailScreen`, `ConnectedReflectionsSection`
- Drawer: `DrawerOverview`, `DrawerReturnSection`, `useDrawerReturn`
- Insights: `InsightsReturnSection`, `useInsights`
- Settings and exclusions: `SettingsScreen`, `useExcludedReturnContent`

Normal Entry routes are `/entry/[entryId]`; Drawer filters use `/drawers/[drawerId]`; Tag browsing uses `/all-entries?tagId=...`.

## Database functions

Return tracking uses `record_entry_view` and `record_home_return_display`. Drawer and Insights summaries are implemented by the `get_drawer_*` and `get_insights_*` RPCs. Review migration order in `supabase/migrations` before deploying to a new environment.

## Validation

Run:

```sh
npx tsc --noEmit
npm run lint
npm run build:web
```

There is currently no configured unit, integration, or end-to-end test runner. Manually cover: Home dismiss/replace/open; Drawer filters and Return; reflection creation/history; Insights Return and comparisons; Entry and Drawer exclusions; global/Home/Insights settings; and normal search/browsing after Return is disabled.

## Known limitations

- Notification delivery and notification permissions are not implemented.
- App-lock/locked-Entry behavior is not modeled in the current schema.
- Excluded-content management lists the most recent 50 Entries and Drawers per group, while showing exact totals.
