# Life Drawer — AI Coding Context File

## Project Summary
Life Drawer is a reflective journaling and life-archiving app designed to help people capture, organize, and revisit their life through meaningful categories called **Drawers** and broader periods called **Life Phases**.

The app is not meant to feel like a traditional diary or a plain chronological feed. Instead of forcing users into a timeline-first experience, Life Drawer is designed around **context, identity, emotion, and memory**.

Users should be able to:
- capture moments in different formats
- organize memories by area of life
- create and customize their own drawers
- define life phases that reflect chapters of their life
- revisit past entries in a way that feels emotionally meaningful
- understand patterns in their life through reflection

The overall product should feel calm, private, intentional, emotionally safe, and beautifully minimal.

---

## Core Product Vision
Life Drawer helps users preserve their life in a more personal and organized way than a normal journaling app.

Instead of asking, "What happened today?" the app supports questions like:
- What part of my life does this belong to?
- What was I feeling?
- What chapter of my life was this?
- What do I want to remember later?

The app should support both:
- **new journalers** who want a guided and emotionally approachable experience
- **existing journalers / memory keepers** who already save photos, notes, voice memos, or reflections and want a better way to organize them

---

## Main App Goals
1. Make journaling feel less intimidating and more flexible.
2. Let users organize their lives by context, not just date.
3. Make memory capture possible through multiple content types.
4. Create an emotionally thoughtful experience that encourages reflection.
5. Help users revisit their past in a structured but personal way.
6. Give users a strong sense of ownership through customization.
7. Keep the interface minimal, elegant, and easy to use.

---

## Primary Concepts

### 1. Drawers
Drawers are the core organizing system of the app.
A drawer represents a category or area of the user’s life.

Examples:
- Family
- Career
- Health
- Travel
- School
- Relationships
- Personal Growth
- Hobbies
- Finance

Users can:
- create their own drawers
- rename drawers
- choose an icon or emoji for each drawer
- choose a color or accent style for each drawer
- archive or delete drawers if needed

A journal entry should belong to one drawer, and optionally to a life phase.

### 2. Life Phases
Life Phases represent larger chapters or seasons of life.
These are not just date ranges. They should feel emotionally meaningful.

Examples:
- First Year at University
- Healing Era
- New Job Season
- Summer 2025
- Moving Out
- Post Graduation

Users can:
- create custom life phases
- name each phase
- optionally set start and end dates
- choose an icon or emoji
- optionally give each phase a short description

Entries can belong to a life phase to help users reflect on who they were during that period.

### 3. Entries
Entries are the content users capture.
An entry can be short, long, emotional, practical, messy, or polished.
The app should support different ways of documenting life.

Possible entry types:
- text journal entry
- photo-based entry
- voice memo entry
- mixed media entry
- quick note
- prompt response

Each entry can include:
- title
- body text
- created date
- updated date
- drawer
- life phase
- mood / emotion tag
- optional custom tags
- optional media attachments
- favorite / pin state

### 4. Reflection
Reflection is a major product value.
The app should not only store entries but also help users revisit and learn from them.

Examples of reflection features:
- prompts
- memory resurfacing
- mood trends
- entries from the same drawer over time
- entries from a specific life phase
- reflection summaries

---

## User Types

### New User
A new user needs:
- a clear onboarding flow
- help understanding what drawers and life phases are
- starter guidance
- optional suggested drawers
- a low-pressure way to create a first entry

### Returning User
A returning user needs:
- quick sign in
- fast access to their drawers and recent entries
- the ability to continue previous reflection habits
- access to saved content and memories

---

## Information Architecture / Main Pages

## 1. Welcome / Landing Screen
### Goal
Introduce the product in a calm, beautiful, emotionally clear way.

### This page should do
- explain the core value of Life Drawer
- make the app feel safe and inviting
- encourage sign up or sign in

### Possible content
- product name and short description
- soft visual branding
- CTA buttons for Sign Up and Log In
- short line explaining drawers / life phases / reflection

---

## 2. Sign Up Page
### Goal
Let new users create an account simply and clearly.

### Should include
- name
- email
- password
- confirm password
- optional continue with Google or Apple later if implemented
- validation and clear error states

### Functional expectations
- create user account with Supabase Auth
- handle invalid email and weak password
- optionally require email confirmation depending on auth settings
- create starter profile record in database after sign up

---

## 3. Log In Page
### Goal
Let existing users securely access their account.

### Should include
- email
- password
- forgot password link
- link to sign up

### Functional expectations
- authenticate with Supabase Auth
- show clear login errors
- persist session
- redirect authenticated user to app home

---

## 4. Onboarding Flow
### Goal
Help the user understand how the app works and set up their first structure.

### This flow should do
- introduce drawers
- introduce life phases
- explain that journaling can be flexible
- help user create or choose starter drawers
- optionally create their first life phase

### Possible onboarding steps
1. Welcome to Life Drawer
2. What are Drawers?
3. What are Life Phases?
4. Choose starter drawers
5. Create your first life phase (optional)
6. Create your first entry or go to dashboard

### Functional expectations
- save onboarding completion state
- insert starter drawers into the database for that user
- optionally seed templates

---

## 5. Home / Dashboard
### Goal
Serve as the main hub after login.

### This page should do
- show the user a quick overview of their life archive
- make it easy to start a new entry
- show recent activity
- highlight drawers or phases
- encourage continued use

### Possible sections
- greeting / welcome back
- quick add entry button
- recent entries
- active life phase
- favorite drawers
- reflection prompt card
- memory resurfacing card

### Functional expectations
- fetch user profile
- fetch recent entries
- fetch top or recent drawers
- fetch current / pinned life phase if one exists

---

## 6. Drawers Page
### Goal
Let the user browse and manage all drawers.

### This page should do
- show all user-created drawers
- allow drawer creation
- let users tap into a drawer to see its entries

### Functional expectations
- create drawer
- edit drawer
- archive drawer
- delete drawer if safe
- show number of entries per drawer

### Drawer detail view should include
- drawer title
- icon / emoji
- description if used
- list or grid of related entries
- filters by date, mood, or life phase

---

## 7. Life Phases Page
### Goal
Let users create and browse the major chapters of their life.

### This page should do
- show all life phases
- allow new life phase creation
- open a life phase to see related entries

### Functional expectations
- create phase
- edit phase
- archive phase
- optionally mark one as current
- associate entries with a phase

### Life phase detail view should include
- phase name
- icon / emoji
- date range
- short description
- related entries
- reflection summary in future versions

---

## 8. Create Entry Page
### Goal
Give users a simple but meaningful way to capture a moment.

### This page should do
- support journaling without overwhelming the user
- allow structure without forcing too much structure

### Fields
- title
- body text
- drawer selection
- life phase selection (optional)
- mood / emotion
- tags
- media upload (optional)
- date auto-generated

### Functional expectations
- create entry record
- upload media if included
- link entry to user
- link entry to drawer
- link entry to life phase if chosen
- save timestamps
- support draft-like UX in future if needed

---

## 9. Entry Detail Page
### Goal
Let users view and revisit one saved entry clearly.

### Should include
- title
- date
- drawer
- life phase
- full body
- emotion / tags
- media if attached
- edit and delete actions

### Functional expectations
- read one entry
- update entry
- delete entry
- favorite or pin entry

---

## 10. Reflection / Insights Page
### Goal
Help users reflect on their life, not just store entries.

### This page should do
- surface patterns and memories
- make the app feel thoughtful and emotionally intelligent

### Possible content
- entries by mood
- entries across life phases
- most-used drawers
- reflection prompts
- random resurfaced memory
- monthly or seasonal summaries

### Functional expectations
- aggregate entry data
- show simple mood counts or trends
- filter by drawer or phase
- support memory resurfacing logic

---

## 11. Search / Archive Page
### Goal
Help users find old memories easily.

### This page should do
- support search by keyword
- filter by drawer
- filter by life phase
- filter by tag or mood
- sort by date

### Functional expectations
- text search over entries
- filter queries
- paginated or efficient loading if needed

---

## 12. Profile / Settings Page
### Goal
Let users manage their account and preferences.

### Should include
- profile name
- email
- theme or preference settings if added
- logout
- delete account
- privacy info

### Functional expectations
- read and update profile
- sign out
- trigger password reset if needed
- delete account flow in future if implemented carefully

---

## Authentication
Authentication should use **Supabase Auth**.

### Auth requirements
- email/password sign up
- email/password login
- session persistence
- protected app routes
- logout
- forgot password / reset password
- optional email verification depending on project setup

### Auth flow
1. User lands on welcome screen.
2. User signs up or logs in.
3. On successful sign up, create corresponding profile row.
4. If onboarding not completed, route to onboarding.
5. If onboarding completed, route to dashboard.
6. Unauthenticated users should not access protected app pages.

### Important auth notes
- If email confirmation is enabled in Supabase, the app must properly handle confirmed sessions and post-confirm redirect behavior.
- If email confirmation is disabled for testing, this should be clearly noted for development.
- Auth state should be listened to globally so the UI updates correctly.

---

## Data Storage / Backend
Backend should use **Supabase**.

### Main storage responsibilities
- authentication
- user profile storage
- drawers
- life phases
- entries
- tags / moods if normalized
- media files if uploads are enabled

### Recommended stack
- Expo React Native for mobile app
- TypeScript
- Expo Router if routing is used
- Supabase JS client
- AsyncStorage for lightweight local session support if needed
- Supabase Storage for uploaded images / voice files

---

## Recommended Database Structure

### profiles
Stores one row per authenticated user.

Suggested fields:
- id (uuid, same as auth user id)
- full_name
- email
- avatar_url (optional)
- onboarding_completed (boolean)
- created_at
- updated_at

### drawers
Stores user-created drawers.

Suggested fields:
- id
- user_id
- title
- description (optional)
- icon
- color
- is_archived
- created_at
- updated_at

### life_phases
Stores user-created life phases.

Suggested fields:
- id
- user_id
- title
- description (optional)
- icon
- start_date (optional)
- end_date (optional)
- is_current (boolean)
- is_archived
- created_at
- updated_at

### entries
Stores journal or memory entries.

Suggested fields:
- id
- user_id
- drawer_id
- life_phase_id (nullable)
- title
- body
- mood
- favorite (boolean)
- entry_date
- created_at
- updated_at

### entry_tags
If tags are normalized, store join relationships.

Suggested fields:
- id
- entry_id
- tag_name

### entry_media
Stores uploaded media references.

Suggested fields:
- id
- entry_id
- media_type
- file_path
- file_url
- created_at

---

## How Data Should Be Stored

### User account data
Stored in Supabase Auth and mirrored where needed in `profiles`.

### Journal content
Stored in relational tables connected to the user id.

### Drawer and phase organization
Stored in dedicated tables and linked to entries by foreign key.

### Media
Stored in Supabase Storage buckets, with references saved in database tables.

### Session
Handled through Supabase Auth, with persistent auth state in app session handling.

### Local temporary state
Can be stored locally only for UI convenience, but source of truth should be backend data.

---

## Core Functions the App Needs

### Account functions
- sign up
- log in
- log out
- forgot password
- restore session
- complete onboarding

### Drawer functions
- create drawer
- read drawers
- update drawer
- archive drawer
- delete drawer

### Life phase functions
- create life phase
- read life phases
- update life phase
- archive life phase
- mark current life phase
- delete life phase if safe

### Entry functions
- create entry
- read entries
- read single entry
- update entry
- delete entry
- attach media
- favorite / pin entry
- filter entries
- search entries

### Reflection functions
- fetch recent entries
- fetch entries by drawer
- fetch entries by phase
- fetch entries by mood
- resurface old memories
- generate simple insights from saved data

---

## Product Behavior Expectations

### For new users
- the app should feel welcoming, not dense
- empty states should guide the user clearly
- the first entry should feel easy to create
- the app should explain why drawers matter

### For existing users
- the app should open quickly into meaningful content
- recent entries and active categories should be easy to access
- revisiting memories should feel emotionally rewarding

### Emotional tone
- calm
- reflective
- private
- intentional
- supportive
- elegant

The app should never feel loud, cluttered, childish, or overly gamified.

---

## Design System Direction
The design system should support a soft, thoughtful, premium-feeling experience.

### Brand feeling
- calm
- warm
- minimal
- intimate
- emotionally safe
- modern but soft

### Visual direction
- clean layouts
- generous white space
- rounded cards and containers
- soft shadows if used at all
- subtle hierarchy
- editorial feeling without being cold

### Likely typography direction
Use elegant serif + readable sans serif pairing.

Suggested pairing based on earlier direction:
- **Cormorant Garamond** for headings
- **Proza Libre** for body text

### Typography usage
- headings should feel reflective and elevated
- body text should feel clean and readable
- avoid harsh or overly technical UI typography

### Color direction
Use soft neutrals and nature-inspired tones.

Suggested palette direction:
- warm off-white / cream backgrounds
- soft taupe, mushroom, stone, or muted beige surfaces
- deeper muted green or earthy accent
- charcoal or dark brown text
- very soft muted status colors

The palette should feel cozy, mature, and calming.
Not bright, neon, or overly saturated.

### UI component style
- rounded buttons
- soft cards
- subtle borders
- icon + label patterns
- calm empty states
- minimal tab or bottom nav system
- thoughtful use of spacing

### Icon style
- simple outlined icons or gentle filled icons
- emojis can be supported for personalization in drawers / life phases
- icons should feel warm and not corporate

---

## UX Principles
1. Context over chronology.
2. Emotional clarity over productivity pressure.
3. Calm onboarding over feature overload.
4. Personalization without complexity.
5. Reflection should feel meaningful, not forced.
6. The interface should support both quick capture and deeper journaling.

---

## Suggested Navigation Structure
Depending on final app structure, navigation can include:
- Home
- Drawers
- Add Entry
- Life Phases
- Reflection
- Profile

For mobile, this can be a bottom tab navigation with nested stack routes.

---

## Empty State Guidance
The app will need strong empty states because many screens begin blank.

Examples:
- No drawers yet → prompt to create first drawer
- No life phases yet → explain what a life phase is and invite setup
- No entries yet → invite first reflection
- No search results → suggest different keywords or filters

Empty states should feel encouraging and soft, not robotic.

---

## Security and Privacy Expectations
Because this is a journaling app, privacy matters.

The app should:
- protect routes behind authentication
- use row-level security in Supabase
- ensure users only access their own data
- avoid exposing private content publicly
- treat journal data as sensitive personal content

---

## Supabase / Backend Requirements
At a minimum, implement:
- auth
- row-level security
- profiles table
- drawers table
- life_phases table
- entries table
- optional media storage bucket

### RLS expectation
Each table tied to user content should restrict access so users can only read and write rows where `user_id = auth.uid()`.

---

## Development Notes for AI Coding Assistant
When generating or refactoring code for this project:
- prioritize clean architecture
- use reusable components
- keep naming consistent
- separate UI components, hooks, services, and types
- keep auth flow stable and easy to debug
- avoid messy duplicated logic
- ensure forms have validation
- optimize for maintainability and product readiness

The UI should be polished enough to feel like a real product, not just a class demo.

---

## What Success Looks Like
A successful version of Life Drawer should allow a user to:
1. create an account
2. understand the concept quickly
3. create drawers and life phases
4. add meaningful entries
5. revisit memories by life category or life chapter
6. feel that their life is being stored in a more personal way than a normal notes app or diary

---

## Short Product Summary for AI Tools
Life Drawer is a mobile journaling and life-archiving app built around custom **Drawers** (life categories) and **Life Phases** (life chapters). It uses Supabase for authentication, database storage, and media storage. Users can sign up, log in, complete onboarding, create drawers and life phases, write entries, attach moods/tags/media, and revisit memories through reflection and search. The design system should feel calm, warm, minimal, elegant, and emotionally safe, with a soft premium mobile UX.
