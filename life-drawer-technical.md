# Life Drawer — Technical AI Handoff File

## What This Project Is
Life Drawer is a mobile-first journaling and life-archiving app. It helps users capture memories, reflections, and life moments in a way that feels more personal than a normal notes app or diary.

## Build Expectation
This project should be built as a fully functioning app, not just a visual prototype or front-end mockup.

The app should include:
- working authentication
- protected user sessions
- real database integration
- full CRUD functionality for drawers, life phases, and entries
- persistent user data
- working onboarding flow
- functional navigation between all main screens
- error handling and loading states
- clean, maintainable, reusable code

The final result should feel like a real product-ready application and not a class demo with placeholder behavior.
The app is built around two core concepts:

- **Drawers** = categories or areas of life
- **Life Phases** = larger chapters or seasons of life

Instead of organizing life only by date, the app organizes memories by meaning, context, and identity.

Examples:
- A user may save an entry under the drawer **Family**
- That same entry may also belong to the life phase **First Year Living Alone**

This app should feel calm, emotionally safe, minimal, elegant, and private.

---

## Core Product Goal
Help users document their life in a way that feels:
- less overwhelming than traditional journaling
- more organized than random notes or photo dumps
- more reflective than simple memory storage
- more personal than timeline-only journaling apps

The product should support both:
- people new to journaling
- people who already document their lives through notes, photos, screenshots, or voice memos

---

## Primary User Experience Goals
1. Make first-time journaling feel approachable.
2. Let users organize memories by category and life chapter.
3. Support multiple forms of capture, not just long writing.
4. Encourage reflection and revisiting.
5. Create a polished, product-ready experience, not a school-project feel.

---

## MVP Scope
The MVP should include:

### Authentication
- sign up
- log in
- log out
- persistent session
- forgot password
- protected routes

### Onboarding
- intro to the app
- explain drawers
- explain life phases
- allow starter drawer creation or selection
- save onboarding completion

### Core entities
- profile
- drawers
- life phases
- entries

### Entry creation
- create text-based entries
- assign drawer
- optionally assign life phase
- add mood
- add tags
- save timestamps

### Browsing and retrieval
- home dashboard
- drawers list + drawer detail
- life phases list + life phase detail
- entry detail
- search/filter entries
- reflection page with basic insights

### Nice-to-have for MVP if time allows
- media upload
- favorite/pin entry
- memory resurfacing
- editable profile
- current life phase indicator

---

## Post-MVP / Future Features
- voice memo entries
- photo-rich entries
- mixed media entries
- prompt library
- calendar view
- smarter insights
- emotional trend charts
- AI-assisted reflection prompts
- export / backup
- richer profile customization
- reminders or gentle reflection nudges

---

## Recommended Tech Stack
Use this stack unless there is a strong reason to change it:

- **Expo React Native**
- **TypeScript**
- **Expo Router**
- **Supabase**
- **Supabase Auth**
- **Supabase Postgres**
- **Supabase Storage** for media
- **AsyncStorage** only for lightweight local support if needed
- **React Hook Form** for forms
- **Zod** for validation
- **React Query / TanStack Query** for server state
- **Expo Image Picker** for image uploads if media is enabled
- **Expo AV / newer Expo audio package** only if voice memos are added

---

## High-Level Product Architecture

### Frontend responsibilities
- render screens
- manage local UI state
- manage form validation
- handle session state
- fetch and mutate Supabase data
- display empty states, errors, and loading states
- keep UX polished and calm

### Backend responsibilities via Supabase
- authentication
- data storage
- user profile storage
- row-level security
- media storage
- server-side protected access rules

---

## Core Product Concepts

## 1. Drawers
A Drawer is a personal life category.

Examples:
- Family
- Career
- School
- Health
- Travel
- Relationships
- Personal Growth
- Creativity
- Finance

Each drawer should belong to one user.

A drawer needs:
- title
- optional description
- icon or emoji
- optional color/accent
- archive state

A user can create many drawers.

An entry belongs to exactly one drawer.

---

## 2. Life Phases
A Life Phase is a larger season or chapter in a user’s life.

Examples:
- Healing Era
- Last Semester at School
- Summer 2026
- New Job Season
- Moving Out
- Post Graduation

A life phase needs:
- title
- optional description
- optional start date
- optional end date
- icon or emoji
- is_current boolean
- archive state

An entry can belong to zero or one life phase.

---

## 3. Entries
Entries are the main saved content.

MVP entry type:
- text entry

Potential future types:
- photo entry
- voice memo entry
- mixed media entry
- prompt-based entry
- quick capture

An entry needs:
- title
- body
- drawer
- optional life phase
- optional mood
- optional tags
- entry date
- favorite state optional
- created_at
- updated_at

---

## 4. Reflection
Reflection is not just a page. It is a core product value.

The app should help users revisit and understand their life through:
- recent entries
- drawer-based browsing
- life phase-based browsing
- mood-based browsing
- resurfaced older memories
- simple patterns and summaries

For MVP, keep reflection logic simple and reliable.

---

## Screen Goals and Expected Behavior

## 1. Welcome Screen
### Goal
Introduce the app and make it feel calm, intentional, and emotionally clear.

### Must do
- explain what Life Drawer is
- explain the value in one or two short lines
- offer Sign Up and Log In
- visually establish the design tone

### Example message direction
Capture your life through the moments, categories, and chapters that matter most.

---

## 2. Sign Up Screen
### Goal
Allow a new user to create an account with minimal friction.

### Needs
- full name optional or required depending on preference
- email
- password
- confirm password
- validation
- sign up button
- link to log in

### Logic
- call Supabase signUp
- handle errors
- create a profile row after account creation
- depending on auth settings, either:
  - require email confirmation
  - or allow direct sign in for development

---

## 3. Log In Screen
### Goal
Allow returning users to access their account.

### Needs
- email
- password
- forgot password
- login button
- link to sign up

### Logic
- call Supabase signInWithPassword
- show useful error messages
- persist session
- redirect to onboarding or app home depending on state

---

## 4. Forgot Password / Reset Flow
### Goal
Allow users to recover access.

### Needs
- email input
- send reset link
- reset password screen if implemented through deep linking or web fallback

### Logic
- use Supabase password reset flow
- ensure redirect URL is configured correctly

---

## 5. Onboarding
### Goal
Help users understand the mental model of the app before entering the full product.

### Step goals
1. Introduce Life Drawer
2. Explain Drawers
3. Explain Life Phases
4. Offer starter drawers
5. Optionally create a first life phase
6. Mark onboarding as complete

### Onboarding should feel
- light
- warm
- guided
- not too long
- not corporate

### Logic
- save onboarding_completed on profile
- create selected starter drawers in the database

---

## 6. Home Dashboard
### Goal
Serve as the main emotional and functional hub after login.

### Should show
- greeting
- quick add entry CTA
- recent entries
- active/current life phase if one exists
- featured or recently used drawers
- reflection prompt or memory card

### Logic
- fetch profile
- fetch recent entries
- fetch current life phase
- fetch frequently used or recently updated drawers

### Empty state
If the user has no entries yet, the screen should guide them into creating one.

---

## 7. Drawers List Screen
### Goal
Let users see and manage their life categories.

### Should include
- list/grid of drawers
- create drawer button
- entry count
- icon/emoji
- optional archived section later

### Logic
- fetch all drawers for current user
- create drawer
- edit drawer
- archive drawer

---

## 8. Drawer Detail Screen
### Goal
Show everything connected to one drawer.

### Should include
- drawer header
- optional description
- list of related entries
- filter by date, mood, or life phase if supported
- edit drawer action

### Logic
- fetch drawer by id
- fetch entries where drawer_id matches

---

## 9. Life Phases List Screen
### Goal
Let users browse and manage major life chapters.

### Should include
- list of phases
- create phase button
- optional current phase badge
- date range display if available

### Logic
- fetch all life phases for current user
- create phase
- edit phase
- archive phase
- optionally mark one as current

---

## 10. Life Phase Detail Screen
### Goal
Show all entries connected to a specific life phase.

### Should include
- title
- icon/emoji
- optional description
- date range
- entries in this phase
- edit action

### Logic
- fetch phase by id
- fetch entries where life_phase_id matches

---

## 11. Create Entry Screen
### Goal
Make it easy to capture a moment without overwhelming the user.

### Required fields for MVP
- title
- body
- drawer selector

### Optional fields
- life phase selector
- mood selector
- tag input
- media upload later

### Logic
- validate required fields
- create entry row
- save timestamps
- redirect to entry detail or back to previous screen
- update query cache if React Query is used

### UX note
This screen should not feel like a complicated form. It should feel like a calm writing space.

---

## 12. Entry Detail Screen
### Goal
Let the user revisit one memory clearly and beautifully.

### Should include
- title
- body
- created date
- drawer
- life phase if exists
- mood/tags if exists
- edit action
- delete action
- favorite toggle if enabled

### Logic
- fetch one entry
- update entry
- delete entry

---

## 13. Edit Entry Screen
### Goal
Allow updates without friction.

### Logic
- preload existing entry values
- save changes
- maintain updated_at
- prevent cross-user access through RLS

---

## 14. Reflection Screen
### Goal
Help users make meaning from their saved life archive.

### MVP ideas
- recent entries
- entries by mood
- most-used drawers
- entries in current life phase
- a random older memory resurfacing block

### Logic
- aggregate entries with simple queries
- keep it lightweight and readable
- avoid overcomplicated analytics in first version

---

## 15. Search Screen
### Goal
Allow users to find memories later.

### Should support
- keyword search
- filter by drawer
- filter by life phase
- filter by mood
- sort by newest/oldest

### Logic
- text search over title/body
- filtered queries
- pagination or limited results if needed

---

## 16. Profile / Settings Screen
### Goal
Give access to account info and basic settings.

### Should include
- name
- email
- logout
- password reset option
- delete account option later if safely implemented

---

## Routing Suggestion (Expo Router)

Possible route structure:

```txt
app/
  _layout.tsx
  index.tsx                    -> welcome
  (auth)/
    login.tsx
    signup.tsx
    forgot-password.tsx
    reset-password.tsx
  (onboarding)/
    index.tsx
    drawers.tsx
    life-phase.tsx
  (tabs)/
    _layout.tsx
    home.tsx
    drawers.tsx
    add-entry.tsx
    phases.tsx
    reflection.tsx
    profile.tsx
  drawers/
    [id].tsx
    edit.tsx
    create.tsx
  phases/
    [id].tsx
    edit.tsx
    create.tsx
  entries/
    [id].tsx
    edit/[id].tsx
```

This can be adjusted, but the structure should clearly separate:
- auth routes
- onboarding routes
- protected app routes
- entity detail/edit routes

---

## Suggested Folder Structure

```txt
src/
  components/
    ui/
    forms/
    cards/
    layout/
    empty-states/
  features/
    auth/
    onboarding/
    drawers/
    life-phases/
    entries/
    reflection/
    search/
    profile/
  lib/
    supabase.ts
    queryClient.ts
    utils.ts
    constants.ts
  hooks/
  services/
  store/
  types/
  styles/
```

### Architecture principle
Keep features modular.
Do not let everything live in one giant screen file.

---

## Database Design

## Table: profiles
One row per authenticated user.

Suggested columns:
- id uuid primary key references auth.users(id)
- email text
- full_name text
- avatar_url text nullable
- onboarding_completed boolean default false
- created_at timestamptz default now()
- updated_at timestamptz default now()

---

## Table: drawers
Suggested columns:
- id uuid primary key default gen_random_uuid()
- user_id uuid not null references profiles(id)
- title text not null
- description text nullable
- icon text nullable
- color text nullable
- is_archived boolean default false
- created_at timestamptz default now()
- updated_at timestamptz default now()

---

## Table: life_phases
Suggested columns:
- id uuid primary key default gen_random_uuid()
- user_id uuid not null references profiles(id)
- title text not null
- description text nullable
- icon text nullable
- start_date date nullable
- end_date date nullable
- is_current boolean default false
- is_archived boolean default false
- created_at timestamptz default now()
- updated_at timestamptz default now()

---

## Table: entries
Suggested columns:
- id uuid primary key default gen_random_uuid()
- user_id uuid not null references profiles(id)
- drawer_id uuid not null references drawers(id)
- life_phase_id uuid nullable references life_phases(id)
- title text not null
- body text not null
- mood text nullable
- favorite boolean default false
- entry_date date default current_date
- created_at timestamptz default now()
- updated_at timestamptz default now()

---

## Table: entry_tags
Two options:
1. keep tags as a text[] on entries for MVP simplicity
2. normalize into a separate table

If normalized:
- id uuid primary key default gen_random_uuid()
- entry_id uuid not null references entries(id) on delete cascade
- tag_name text not null

For MVP, text[] may be simpler.

---

## Table: entry_media
Only needed if media uploads are implemented.

Suggested columns:
- id uuid primary key default gen_random_uuid()
- entry_id uuid not null references entries(id) on delete cascade
- media_type text not null
- file_path text not null
- file_url text nullable
- created_at timestamptz default now()

---

## Suggested Supabase Storage Buckets
If media is enabled:
- `entry-media`

Folder strategy:
- `{user_id}/{entry_id}/filename`

---

## Data Relationships
- one user has many drawers
- one user has many life phases
- one user has many entries
- one drawer has many entries
- one life phase can have many entries
- one entry belongs to one drawer
- one entry can belong to zero or one life phase

---

## Row Level Security Expectations
All user-owned tables must have RLS enabled.

Each user should only be able to:
- read their own rows
- insert rows for themselves
- update their own rows
- delete their own rows if allowed

Basic rule direction:
- `user_id = auth.uid()`

Tables that need RLS:
- profiles
- drawers
- life_phases
- entries
- entry_tags if used
- entry_media if used

Storage access should also be locked down by user ownership rules.

---

## Auth Requirements
Use Supabase Auth.

### Required flows
- sign up
- sign in
- sign out
- session restore
- forgot password
- auth state listener
- route guarding

### Important auth behavior
After authentication:
- if onboarding_completed is false -> go to onboarding
- if onboarding_completed is true -> go to home

### Email verification note
If email confirmation is enabled:
- configure redirect URLs correctly
- handle return from confirmation
- make sure confirmed users can complete sign in without confusion

If testing locally:
- note whether email confirmation is disabled for development

---

## How Data Should Store

### Source of truth
Supabase database should be the source of truth.

### What should be stored where
- auth credentials -> Supabase Auth
- profile data -> profiles table
- drawer data -> drawers table
- life phase data -> life_phases table
- journal entries -> entries table
- uploaded media -> Supabase Storage + entry_media table
- temporary form drafts -> local component state or lightweight local persistence if needed

### Important rule
Do not rely on local-only storage for real user content unless explicitly building an offline-first mode.

---

## Core Functions to Implement

## Auth
- signUp(email, password)
- signIn(email, password)
- signOut()
- sendPasswordReset(email)
- getCurrentSession()
- listenToAuthState()

## Profile
- createProfile()
- getProfile()
- updateProfile()
- markOnboardingComplete()

## Drawers
- createDrawer()
- getDrawers()
- getDrawerById()
- updateDrawer()
- archiveDrawer()
- deleteDrawer()

## Life Phases
- createLifePhase()
- getLifePhases()
- getLifePhaseById()
- updateLifePhase()
- archiveLifePhase()
- markCurrentLifePhase()
- deleteLifePhase()

## Entries
- createEntry()
- getEntries()
- getEntryById()
- updateEntry()
- deleteEntry()
- favoriteEntry()
- searchEntries()
- filterEntries()

## Reflection
- getRecentEntries()
- getEntriesByDrawer()
- getEntriesByLifePhase()
- getEntriesByMood()
- getRandomResurfacedEntry()

## Media if included
- uploadEntryMedia()
- getEntryMedia()
- deleteEntryMedia()

---

## Design System Direction

## Brand personality
- calm
- warm
- reflective
- private
- soft
- elegant
- minimal
- emotionally safe

## UI should not feel
- harsh
- sterile
- loud
- childish
- gamified
- cluttered
- too corporate

---

## Typography
Recommended:
- **Cormorant Garamond** for headings
- **Proza Libre** for body text

### Usage
- headings should feel thoughtful and elevated
- body copy should feel clean and readable
- supporting UI text should be subtle and soft

---

## Color Direction
Use a muted, warm, nature-inspired palette.

Suggested direction:
- warm cream background
- soft beige / taupe surfaces
- muted sage or earthy green accents
- dark charcoal or deep brown text
- subtle muted support colors for states

### Avoid
- neon colors
- highly saturated accents
- heavy gradients
- flashy effects

---

## Component Style
- rounded cards
- gentle shadows only if needed
- soft borders
- generous spacing
- clear hierarchy
- minimal visual noise
- calm empty states
- polished buttons
- simple icons
- emoji support for personalization

---

## Spacing and Layout
- generous whitespace
- breathing room between sections
- visually soft composition
- mobile-first spacing rhythm
- avoid dense dashboards

---

## Motion
If motion is used:
- subtle
- slow
- calming
- never distracting

---

## Accessibility Expectations
- sufficient text contrast
- tap targets large enough for mobile
- readable text sizes
- labels for forms
- meaningful error messages
- avoid relying on color alone for meaning

---

## UX Principles
1. Context over chronology
2. Reflection over performance pressure
3. Guidance over overwhelm
4. Personalization without complexity
5. Calm clarity over feature overload
6. Emotional safety and privacy matter

---

## Empty State Guidance
This app needs thoughtful empty states.

Examples:
- no drawers yet
- no life phases yet
- no entries yet
- no search results
- no current life phase set

Each empty state should:
- explain what the feature is
- explain why it matters
- offer one clear next action

---

## Product Tone
All copy should feel:
- gentle
- clear
- human
- calm
- emotionally aware
- not robotic

Examples of tone direction:
- “Start with one small moment.”
- “Your life does not need to be perfectly organized to be worth remembering.”
- “Create a drawer for a part of life you want to hold onto.”

---

## Coding Expectations for Claude / Codex
When generating code for this project:

1. Use clean TypeScript.
2. Keep components reusable and modular.
3. Separate feature logic from presentational UI.
4. Use strong type definitions for entities.
5. Keep Supabase access in dedicated service/helper files.
6. Use validation for forms.
7. Handle loading, empty, and error states well.
8. Keep auth stable and easy to debug.
9. Avoid duplicated logic.
10. Build it like a real product, not a rushed prototype.

---

## Suggested Type Definitions

```ts
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url?: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Drawer {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface LifePhase {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  icon?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_current: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Entry {
  id: string;
  user_id: string;
  drawer_id: string;
  life_phase_id?: string | null;
  title: string;
  body: string;
  mood?: string | null;
  favorite: boolean;
  entry_date: string;
  created_at: string;
  updated_at: string;
  tags?: string[];
}
```

---

## Suggested Build Priority

### Phase 1
- auth setup
- profile creation
- protected routing
- onboarding completion logic

### Phase 2
- drawers CRUD
- life phases CRUD
- entries CRUD

### Phase 3
- home dashboard
- search/filter
- reflection page

### Phase 4
- media uploads
- polish
- better empty states
- animation
- profile settings improvements

---

## Definition of Done for MVP
The MVP is complete when a user can:

1. sign up or log in
2. complete onboarding
3. create drawers
4. create life phases
5. create and save entries
6. browse entries by drawer
7. browse entries by life phase
8. search or filter entries
9. view a reflection page with basic insights
10. securely access only their own data

---

## One-Paragraph Summary for AI Tools
Life Drawer is a calm, mobile-first journaling and life-archiving app built with Expo React Native, TypeScript, Expo Router, and Supabase. Its core structure is based on Drawers, which are personal life categories, and Life Phases, which are larger life chapters. Users can sign up, complete onboarding, create drawers and phases, write entries, and revisit memories through organized browsing, search, and reflection. The app must feel emotionally safe, elegant, minimal, and product-ready, with secure authentication, row-level security, and a soft premium design system.
