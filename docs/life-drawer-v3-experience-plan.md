# Life Drawer V3 Experience Plan

## Phase 1A scope

This document records the implementation plan for the Life Drawer V3 experience. It is an audit and migration plan only. It does not change current application behaviour, routes, database schema, or existing Mood data.

### Product model

Life Drawer V3 is organised around **Capture. Place. Return.**

- **Capture:** write an Entry, optionally with tags, image, voice memo, and location.
- **Place:** every newly created Entry belongs to one Drawer; an Entry may belong to more than one Drawer if the product continues to support multi-placement.
- **Return:** help someone revisit and add reflections to earlier Entries without treating the experience as analytics-first.

### V3 rules to implement in later phases

- Replace new-entry **Mood** selection with **Status**.
- Require a Drawer and a Status when creating an Entry.
- Keep tags, image, voice memo, and location optional.
- Present entry options in this order: **Drawer → Tags → Status → Image → Voice Memo → Location**.
- Support these Status values:
  - `in_the_moment`
  - `still_unfolding`
  - `something_changed`
  - `settled`
  - `looking_back`
- Preserve legacy Mood data and make it readable while V3 is rolled out.
- Add Status history and Return reflections in subsequent phases.
- Rename the **visible** Insights experience to **Return** later; do not rename the route in this phase.
- Add Drawer filtering by Status later.
- Rewrite onboarding and add a demo account only after core entry and Return flows are stable.

### Explicit non-goals for Phase 1A

- Do not drop, overwrite, or backfill `entries.mood`.
- Do not make the live app require Status or Drawer selection yet.
- Do not rename `/insights`, SQL RPC names, feature folders, or navigation route keys.
- Do not run a production migration or regenerate Supabase types.
- Do not redesign the current entry flow in code.

## Current architecture summary

| Area | Current implementation | V3 implication |
| --- | --- | --- |
| App shell | Expo Router app with tab routes and root auth/onboarding redirects | Keep route changes incremental and preserve deep links. |
| Authentication | Supabase Auth session is hydrated into Zustand | All Entry, Drawer, Return, and Status queries must continue to scope by authenticated user. |
| State | `auth.store` holds the signed-in profile; entry forms use local React Hook Form state | New Status form state can follow existing form patterns; draft persistence is not currently guaranteed. |
| Data access | Feature API wrappers call Supabase services | Add Status mapping and mutations in service/API layers rather than directly in screens. |
| Database | Supabase tables with user-scoped joins and security-invoker RPCs | Status filters and history queries should be implemented server-side and user-scoped. |
| Styling | Shared theme/components plus screen-local warm palette values | New V3 controls should reuse the warm palette and serif/sans hierarchy. |
| Validation | TypeScript, Expo lint, and web export scripts are available; no test script is declared | Add focused unit/integration coverage as Status behaviour is implemented. |

## Current Entry flow and data model

### Entry data today

`entries` currently carries title, content, nullable text `mood`, media fields, optional location, occurrence date, and Return metadata. Drawer and Tag membership live in `entry_drawers` and `entry_tags` join tables.

The TypeScript model mirrors that shape: `Entry`, `EntryDraft`, `CreateEntryRequest`, `UpdateEntryRequest`, and `SearchEntriesRequest` all model Mood as optional. `DrawerEntryFilter` has Return-oriented filters but no Status values.

### Creation and edit flow today

- `CreateEntryScreen` and `EditEntryScreen` each maintain form values and selection state locally.
- Both schemas require only title and content; Mood is optional.
- Drawer selection is optional. A starter “My Life Drawer” can appear in the UI but is filtered out before `entry_drawers` persistence, so it is not a guaranteed database placement.
- The form option grid is currently **Drawers → Tags → Images → Voice Memo → Mood**. Location is a separate inline metadata action, not an option tile.
- `EntryMediaToolbar` uses a wrapping grid (`flexWrap`) rather than a horizontally scrollable carousel.
- The creation service inserts the Entry, uploads media, updates media fields, then inserts Drawer and Tag links. These operations are not one database transaction, so partial writes must remain a migration risk until a server-side transactional path is added.
- Editing replaces Drawer and Tag join links after updating the Entry. A V3 save must not accidentally erase legacy Mood values or allow an Entry to become Drawer-less.
- Detail and search surfaces still display and filter Mood, so Mood removal cannot be a one-screen change.

### Existing Return relationships

Entries can reference another Entry with `parent_entry_id` and `reflection_type` (`update`, `response`, or `continuation`). This is the existing connected-reflection mechanism and should remain independent from a Status event history. A reflection can cause a Status update, but it must not be assumed that every reflection changes Status.

## Current Drawer flow

Drawers are user-owned collections connected through `entry_drawers`. The current service fetches a Drawer’s Entry IDs through the `get_drawer_filtered_entry_ids` RPC, then hydrates Entries with Drawer and Tag relations.

Current Drawer filters are:

- `all`
- `saved_for_later`
- `connected_reflections`
- `revisited`
- `not_revisited`

The future Status filter belongs in the same request/type/RPC chain, but should be added only after `entries.current_status` exists and is indexed. Status filtering must return legacy entries with a deliberate treatment of `NULL` (recommended label: **No status yet**) rather than silently excluding them.

## Current Return and Insights flow

Return already exists as a feature across Home, Drawer, Entry detail, settings, and the `/insights` tab. It selects eligible earlier entries using resurfacing preferences, viewing history, saved-for-later state, reflection context, cooldowns, and dismissal dates.

The `/insights` route currently provides both factual collection summaries and Return-oriented content. Its visible title, bottom-nav label, tab title, Home card, settings copy, feature-folder names, service names, RPC names, and generated types use “Insights.”

V3 should position this experience as **Return** in the interface while retaining factual summaries. This avoids implying that Return only means an automated resurfacing card and keeps existing deeper exploration useful.

## Current onboarding and first-run flow

The root layout gates users through `onboarding → intro → login/signup → app`. Completion is stored locally with the `life-drawer:onboarding-complete` key, using AsyncStorage on native and localStorage on web.

The current onboarding slides describe calm journaling, organisation, and looking back; the intro features say capture, organise, and reflect. Neither flow currently explains required Drawer placement, Status, Status changes over time, or a demo account.

Later V3 onboarding should introduce **Capture. Place. Return.** before teaching individual controls. The demo account must be a real, isolated account/data strategy—not a client-side bypass of auth or Row Level Security.

## File map

| Concern | Current files | Likely V3 files |
| --- | --- | --- |
| Routing and tabs | `app/_layout.tsx`, `app/(tabs)/_layout.tsx`, `app/(tabs)/insights.tsx` | Same routes initially; optional future `app/(tabs)/return.tsx` compatibility route. |
| App navigation | `src/components/layout/AppBottomNav.tsx`, `src/features/home/screens/HomeScreen.tsx` | Same files for visible Return rename. |
| Entry screens | `src/features/entries/screens/CreateEntryScreen.tsx`, `src/features/entries/screens/EditEntryScreen.tsx`, `src/features/entries/screens/EntryDetailScreen.tsx` | Same screens plus a Status picker/history presentation. |
| Entry option UI | `src/components/ui/EntryMediaToolbar.tsx`, `src/components/ui/EntryMoodPickerModal.tsx`, `src/components/ui/EntrySelectionModal.tsx` | New `EntryOptionsCarousel` and `EntryStatusPickerModal`; retire Mood picker only after compatibility work. |
| Shared types/constants | `src/types/index.ts`, `src/constants/mood.ts`, `src/constants/moods.ts` | Add `status.ts`, Status types, and compatibility helpers; do not remove Mood types initially. |
| Entry persistence | `src/services/supabase/entries.ts`, `src/features/entries/api/entries.api.ts`, entry hooks | Add status-aware create/update methods and history reads. |
| Drawers | `src/features/drawers/screens/DrawerDetailScreen.tsx`, `src/features/drawers/hooks/useDrawerEntries.ts`, `src/services/supabase/drawers.ts` | Extend filters, request types, and RPC input after schema rollout. |
| Return/Insights | `src/features/return/*`, `src/features/insights/*`, `src/services/supabase/return.ts`, `src/services/supabase/insights.ts` | Keep candidates separate; add Status-aware Return copy/rules only after product decisions. |
| Onboarding | `src/features/auth/screens/OnboardingScreen.tsx`, `src/features/auth/screens/IntroScreen.tsx`, `src/features/auth/utils/onboarding.ts` | Rewrite copy and slides in a dedicated post-core phase. |
| Database/types | `supabase/migrations/*`, `src/services/supabase/types.ts` | New forward-only migration and regenerated database types. |
| Supporting documentation | `docs/return-experience.md` | This document plus migration/runbook documentation. |

## Mood migration assessment

### What Mood is

Mood is a nullable text column on `entries`. A prior migration normalised numeric legacy values to the current string values and retained nulls. The app limits new values in TypeScript, but the database has no Status-like check constraint for Mood.

Mood is currently used in form schemas, picker UI, entry creation/update payloads, mapping helpers, entry detail display, and search/filter types. Return candidate queries also select the column as part of Entry hydration.

### Safe deprecation approach

1. Preserve `entries.mood` and `MoodValue` untouched while Status is introduced.
2. Add separate Status fields and history with no Mood backfill or inferred conversion.
3. Display Status when present; otherwise render the legacy Mood label where it is currently meaningful.
4. Stop offering Mood selection for newly created V3 Entries once Status creation is available.
5. On edit, preserve a legacy Mood value unless a separate, explicitly approved cleanup migration is planned.
6. Remove Mood UI and APIs only after product-approved retention, export, search, and historical-display decisions are documented.

This avoids falsely translating an emotional snapshot into a temporal state and allows existing entries to remain truthful.

## Status technical proposal

### Options considered

| Option | Strengths | Drawbacks | Decision |
| --- | --- | --- | --- |
| History-only `entry_status_history` | Single source of truth; simple audit model | Every list/filter needs a latest-event query; harder pagination/indexing; a missing history row complicates UI | Do not choose as the primary design. |
| `entries.current_status` plus `entry_status_history` | Fast current-state reads and Drawer filters; immutable historical narrative; clear legacy `NULL` state | Requires transactional consistency between cache and history | **Recommended.** |

### Recommended model

Use a nullable `entries.current_status` and an append-only `entry_status_history` table.

`entries.current_status`

- `text NULL` with a check constraint limited to the five V3 values.
- `NULL` means a legacy Entry with no Status yet.
- Indexed for user-and-status filtering, for example `(user_id, current_status, created_at desc)` with a partial index where status is not null.
- Never populated by a Mood conversion.

`entry_status_history`

- `id uuid primary key`.
- `entry_id uuid not null` and `user_id uuid not null`.
- Composite foreign key `(entry_id, user_id)` to `entries(id, user_id)` so a user cannot write history for another user’s Entry.
- `status text not null` with the same allowed-value constraint.
- `recorded_at timestamptz not null default now()`.
- `source text not null`, constrained to an initial set such as `creation`, `entry_edit`, `status_correction`, and `reflection`.
- `note text null` for an optional explanation only if the product asks for one later.
- `reflection_entry_id uuid null`, referencing `(id, user_id)` with `ON DELETE SET NULL`, so a deleted reflection does not erase the historical status event.
- Index `(user_id, entry_id, recorded_at desc, id desc)` for entry history and deterministic latest-event lookup.

### Write contract

Status writes must run through one server-side transaction/RPC:

1. Verify the authenticated user owns the Entry and supplied Drawer IDs.
2. Insert or update the Entry and its required Drawer relationship.
3. Insert a Status-history row whenever a Status is created or changed.
4. Update `entries.current_status` to that exact event’s Status.
5. Return the hydrated Entry and latest Status event.

For a brand-new Entry, the initial Status event uses `source = 'creation'`. For a status correction during edit, append an event rather than mutating history. A linked reflection only uses `source = 'reflection'` when the writer explicitly changes Status as part of that reflection.

This transaction is also the right place to address the existing multi-step Entry/media/link sequence. Media upload may still happen before or after the transactional metadata write, but failure recovery must be specified so a required Drawer and Status are not partially persisted.

### Existing Entry compatibility

- Existing Entries start with `current_status = NULL` and no Status history.
- V3 read paths must tolerate missing Status history.
- An existing Entry should not be automatically assigned Status.
- When a user edits and saves an existing Entry after the V3 requirement is activated, prompt for a Status and create its first history event; do not erase its Mood.
- Product should decide separately whether an edit that changes only title/content may be saved without Status during a temporary compatibility window. Recommended: require Status only once the V3 edit UI is enabled, with a clear inline explanation for legacy entries.

## Insights-to-Return route assessment

### Recommended rollout

Keep `/insights` as the canonical implementation route during the visible rename. Change only user-facing labels first:

- Bottom navigation label: **Return**.
- Tab header and Home card title: **Return**.
- Settings copy: **Return** rather than “Return content in Insights.”
- Page introduction: explain revisiting, continuation, and collection context.

Do not rename feature folders, services, SQL RPCs, preference keys, generated database types, or the route in the same release. These names are implementation details with wide references and no user-visible benefit from an immediate change.

If a `/return` URL is later required, add it as a compatibility route that redirects to the same screen, migrate internal links deliberately, and retain `/insights` as a redirect for existing bookmarks/deep links. Only rename RPCs and internal modules when their contracts are versioned and callers have been migrated.

## Entry options carousel assessment

### Current state

`EntryMediaToolbar` is a wrapping tile grid. The desired V3 sequence needs six controls and an explicit visual order, so the current 22%-width grid will either wrap unpredictably or make status/location feel secondary.

### Proposed component boundary

Create a presentation component such as `EntryOptionsCarousel` that accepts a stable ordered array of typed option objects. Reuse the existing button content/rendering patterns where possible, but keep form state and modal ownership in Create/Edit screens.

Required ordered keys:

1. `drawer`
2. `tags`
3. `status`
4. `image`
5. `voice-memo`
6. `location`

### Behaviour and accessibility requirements

- Use a horizontal `ScrollView`/`FlatList` with an explicit item width, visible focus state, and a non-hidden final item.
- Provide an accessible label and current selection summary for every button.
- Preserve keyboard activation and focus order on web; do not rely only on touch swiping.
- Ensure mouse-wheel/trackpad horizontal access on web or provide visible previous/next affordances.
- Avoid overlay controls that intercept tile presses or hide screen-reader content.
- Maintain current image, audio recording, and location permission/error behaviour while moving their triggers.
- Include a concise scroll affordance only when content overflows; it must not reduce contrast or obscure labels.

## Implementation sequence

1. Confirm product wording, Status labels/icons, required-field copy, multi-Drawer policy, and legacy edit policy.
2. Add Status domain types/constants and compatibility-safe display helpers; keep Mood types intact.
3. Add a forward-only Supabase migration for `current_status`, `entry_status_history`, constraints, indexes, ownership-safe foreign keys, and RPC grants.
4. Regenerate Supabase database types and add service mappings without switching UI behaviour yet.
5. Add transactional create/update Status persistence and focused tests for ownership, history append, rollback, and legacy nulls.
6. Build `EntryStatusPickerModal` and `EntryOptionsCarousel` with the required order and accessibility behaviour.
7. Update Create Entry: require persisted Drawer and Status, validate before submit, and handle draft/permission/media failures.
8. Update Edit Entry and detail: preserve Mood, display Status/history, and create the first Status event for legacy Entries only on intentional V3 save.
9. Extend Drawer request types, screen controls, SQL RPC, and indexes with Status and “No status yet” filters.
10. Rename visible Insights labels/copy to Return while retaining `/insights` and existing implementation identifiers.
11. Align Return candidate and reflection flows with Status language only where product rules explicitly require it.
12. Rewrite onboarding and intro around Capture. Place. Return after the new create flow is live.
13. Design and implement a secure demo-account provisioning/reset strategy.
14. Add analytics/error monitoring for Status write failures, required-field abandonment, and carousel interaction issues.
15. Run regression, accessibility, migration, and rollback validation before releasing V3 broadly.

## Risk register

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Mood is treated as equivalent to Status | Historical data becomes misleading | Never backfill Status from Mood; show legacy Mood separately. |
| Required Drawer is only validated in UI | Orphan entries still reach the database/API | Enforce in the transactional server-side write contract and verify drawer ownership. |
| Multi-step entry writes partially succeed | Entries, media, and join rows become inconsistent | Add a transaction/RPC for relational metadata; define cleanup/retry for media failures. |
| `current_status` drifts from history | Filters and detail view disagree | Write both in one transaction; test deterministic latest-event logic and prohibit direct client writes. |
| History records cross-user data | Privacy/RLS breach | Use composite user-scoped foreign keys, RLS, security-invoker RPCs, and ownership tests. |
| Existing entries disappear from Status filters | Users lose access to legacy content | Include an explicit `NULL` / “No status yet” filter behaviour. |
| Route rename breaks links or preferences | Broken navigation and confusing settings | Change visible labels first; preserve `/insights` and implementation names until compatibility routing is tested. |
| Carousel reduces discoverability/accessibility | Users cannot find or activate options | Test touch, keyboard, screen reader, narrow screens, and web trackpads; add accessible affordances. |
| Location or microphone changes regress permissions | Lost capture capability or repeated prompts | Move triggers without changing permission lifecycle; test denial, retry, and removal states. |
| Onboarding ships before core rules | New users learn an inaccurate flow | Schedule onboarding after required Drawer/Status behaviour is stable. |
| Demo account is not isolated/resettable | Privacy or data contamination | Use a dedicated account/data reset design with RLS and environment safeguards. |
| Migration lacks rollback/recovery | Release failure risks user data | Use additive forward migration, deploy backups, validate on a staging copy, and document rollback by disabling V3 writes rather than dropping columns. |

## Validation plan for later implementation

- Type-check all Status-aware TypeScript models and screens.
- Test create/edit validation for required Drawer and Status.
- Test legacy entries with Mood only, Status only, and neither value.
- Test history ordering, repeated corrections, linked reflections, entry deletion, and reflection deletion.
- Test RLS/RPC ownership boundaries with at least two users.
- Test Drawer Status filtering, pagination, null Status handling, and indexes against realistic volumes.
- Test Return routes and deep links before and after visible rename.
- Test carousel on iOS, Android, and web with screen reader and keyboard paths.
- Run Supabase migration checks against a disposable/staging database before production.

## Phase 1A outcome

Phase 1A creates the implementation map only. The next code phase should begin with the Status data contract and transaction design, because required Drawer/Status UX is unsafe to ship before the persistence and compatibility rules are in place.

## Phase 1B implementation notes

Phase 1B implements the additive Status foundation described above. `entries.current_status` remains nullable, and no Mood value is copied into it. The `entry_status_history` table is read-only to clients; ownership-checked, security-definer RPCs perform atomic initial and subsequent Status writes.

The visible Insights experience is now named **Return** at `/return`. The legacy `/insights` route redirects to `/return` while forwarding query parameters. Existing feature, service, preference, and SQL RPC identifiers retain their Insights names to avoid a broad compatibility-breaking rename.

The project has no configured test runner or local Supabase configuration. Phase 1B therefore adds a dependency-free runtime Status validation check; RPC/RLS integration checks must run against a started local Supabase stack or staging database before the migration is deployed.

## Phase 2A implementation notes

The existing Entry forms now require a persisted Drawer and an explicit Status, while tags, images, voice memos, and location remain optional. The former visual starter Drawer is not offered because it was not a persisted Drawer relationship and therefore could not satisfy the Place rule.

Mood is removed from new and edit forms without changing stored Mood values. Entry detail shows current Status when available; it shows the historical Mood label only for legacy Entries without Status.

Creating an Entry with Status writes the Entry first, then uses the atomic initial-Status RPC. If that Status write fails, the client deletes the newly created Entry rather than leaving a Status-less entry from a required-Status submission. Editing without a Status change creates no event; choosing a different Status appends one immutable history event. Status notes and historical corrections remain deferred to the dedicated future Status-management flow.

## Phase 2B implementation notes

`EntryOptionsCarousel` replaces the wrapping Entry option tile grid in both the create and edit forms. It receives six typed options in the fixed order **Drawer → Tags → Status → Image → Voice Memo → Location**, uses a native horizontal `ScrollView`, and has intentionally fixed 78-pixel tiles so a 320-pixel screen shows Drawer, Tags, Status, and part of Image without page-level horizontal scrolling.

The component measures its viewport and content to show right/left stepped edge fades and a small scroll-progress segment only while options overflow. Its one-time hint uses the same native `AsyncStorage`/web local-storage pattern as onboarding and is dismissed after horizontal scrolling. Focus and validation can call its `revealOption` handle; it uses immediate scrolling when the operating system requests reduced motion.

Drawer and Status have a visible required marker, accessible required/selected state, and existing inline validation messages. On a failed save, the form reveals and focuses Drawer first when both are missing, otherwise Status. Image previews and voice controls remain outside the carousel; the carousel only reflects their latest count or active/added state. Edit now also shows the saved Location and allows refreshing it through the existing location-permission pattern.

The project still has no component/integration test runner, so focused runtime coverage verifies the fixed option contract alongside the existing Status and requirement validation tests. Manual device and browser checks remain required for touch, keyboard, screen-reader, and layout behavior.

## Phase 3A implementation notes

Entry detail now has a secondary Current Status section with the latest Status-history date and an owner-only **Update Status** or **Add Status** action. Status history loads independently, so a history-read failure does not prevent the Entry from being read. Legacy Entries remain unchanged until the user explicitly adds their first Status; this uses the existing initial-Status RPC and does not require a Drawer, so older drawer-less Entries can receive a Status safely through the same ownership-checked write path.

`EntryStatusUpdateSheet` is a focused lightweight update flow. It uses the central Status labels and descriptions, allows an optional note of up to 2,000 characters, and does not create a connected reflection or alter the original Entry. A repeated current Status without a note cannot be saved; a same-Status update with a note remains valid. The mutation hook guards concurrent submissions locally, while the existing database RPC locks the Entry, writes history atomically, and returns an existing identical latest event to avoid duplicate history rows on retried requests.

After a successful write, the detail hook immediately updates current Status and appends the returned history event, then refreshes Status history. On a failed or stale write, the sheet keeps the selected Status and note while the detail data refreshes in the background. The Status card and Return action sheet keep **Update Status** (lightweight context) separate from **Reflect on this** (a new connected Entry).

## Phase 3B implementation notes

The Entry detail page now uses one chronological **How this Entry developed** timeline below the original Entry content. The display model is separate from database rows and combines the original Entry, its initial Status, later Status updates and notes, and all connected reflections in the root chain. A Status event that explicitly references a reflection becomes one combined timeline event; sibling and nested reflections remain separate chronological events. Missing linked reflections are represented only as unavailable, without revealing private content.

The reflection-chain query now uses a user-scoped recursive RPC with cycle protection instead of breadth-first client queries. It returns only the IDs, relationship metadata, current Status, dates, and short previews needed by the timeline in one database query. The timeline loader fetches the root Entry Status history once, keeps the main Entry readable while it loads, and provides a subtle retry state on failure.

Deleting a reflection follows the existing foreign-key behaviour: `entries.parent_entry_id` is set to `NULL` on children, and a linked Status event's reflection reference is set to `NULL` while the Status history event itself remains. The timeline therefore never exposes a deleted reflection's title or preview. No user-facing historical-event editing or deletion is added in this phase.
