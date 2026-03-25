# Life Drawer — What Not to Do

Use this file alongside the main Life Drawer brief and technical handoff. Its purpose is to prevent AI coding assistants like Claude or Codex from drifting away from the intended product quality, structure, and user experience.

---

## Do Not Build This as a Static Prototype
Life Drawer must not be built as a visual-only mockup, UI shell, or design demo.

Do not:
- build screens that only look finished but do not actually work
- use fake data for the core app without clearly separating it from development seed data
- leave major actions disconnected from the backend
- treat the project like a clickable portfolio prototype instead of a real product

This app should function like a real application with working auth, real storage, and real user data.

---

## Do Not Use Placeholder Screens for Core Features
Do not create placeholder screens for the main product areas and leave them unfinished.

Do not:
- create pages that only say things like "Coming Soon," "To Be Built," or "Placeholder Screen"
- leave the Home, Drawers, Life Phases, Create Entry, Entry Detail, Reflection, Search, or Profile screens as empty shells
- build fake navigation that leads to unfinished screens for core app flows
- leave important tabs connected to blank pages just to make the app look complete

Core screens should be genuinely functional, even in MVP form.
If a feature is included in the navigation, it should do something real.

---

## Do Not Use Placeholder Buttons or Fake Actions
Do not add buttons, cards, menus, or forms that appear usable but do nothing.

Do not:
- add CTA buttons with no actual logic behind them
- leave save, edit, delete, upload, or submit actions disconnected
- simulate success states without writing to the backend
- show fake confirmation flows for actions that are not implemented
- include dead controls that mislead the user

If a button is visible in the main app experience, it should have real behavior or be intentionally removed until ready.

---

## Do Not Fake Authentication
Authentication must not be mocked in a way that makes the app seem functional when it is not.

Do not:
- hardcode a logged-in user
- bypass auth for the main experience unless explicitly in a temporary dev-only setup
- use fake session objects as the final solution
- skip protected routes
- ignore sign out, session restore, or auth state changes

Life Drawer should use real Supabase Auth flows.

---

## Do Not Treat It Like a Generic Notes App
Life Drawer is not a plain notes app, to-do app, or generic diary clone.

Do not:
- reduce the concept to only title + body text notes
- organize everything only by chronological feed
- remove the meaning of Drawers and Life Phases
- design it like a productivity dashboard first and a reflective archive second

The product is centered on memory, identity, life context, and reflection.

---

## Do Not Ignore Drawers and Life Phases
These are core product features, not optional extras.

Do not:
- treat drawers as simple folders with no emotional or contextual meaning
- remove life phases because they feel harder to implement
- flatten everything into one general journal feed
- make entries impossible to connect to drawers or phases

The structure of the app depends on these concepts.

---

## Do Not Keep Core Data Only in Local State
Do not build the app so that major user content disappears on refresh, logout, or reinstall.

Do not:
- store entries only in component state
- store drawers only locally as the main solution
- treat local storage as the primary source of truth for long-term user content
- skip backend persistence for core journaling data

Use Supabase as the source of truth for user data.

---

## Do Not Skip Real CRUD
Main content entities should support actual create, read, update, and delete flows where appropriate.

Do not:
- allow users to create drawers but not edit them
- allow users to create entries but not reopen or update them
- show lists of content without detail views
- leave delete flows unimplemented for core records
- stop at a one-way data entry experience

At minimum, drawers, life phases, and entries should have real CRUD coverage appropriate to MVP.

---

## Do Not Ignore Privacy and Security
This is a journaling app. User data is sensitive.

Do not:
- expose user data publicly
- allow one user to read another user’s entries
- skip row-level security
- write database policies loosely just to make development easier
- ignore proper user ownership of records

All user-generated content should be protected by user-scoped access rules.

---

## Do Not Make the UI Loud, Harsh, or Off-Brand
Life Drawer should feel calm, emotionally safe, minimal, and warm.

Do not:
- use neon colors or overly saturated palettes
- use sharp, aggressive UI styling
- overload screens with too many actions at once
- create a cluttered dashboard
- make the interface feel childish, gimmicky, or overly gamified

The product should feel premium, soft, and intentional.

---

## Do Not Overcomplicate the MVP
The MVP should be complete, but it should not be bloated.

Do not:
- add too many advanced features before the core flows work
- prioritize animations over functionality
- build unnecessary systems before auth and data models are stable
- add excessive filters, analytics, or AI features too early

Get the core experience working end-to-end first.

---

## Do Not Leave Empty States Unexplained
Some screens will naturally start empty for new users, but they should still feel intentional.

Do not:
- leave blank white screens with no message
- show empty pages with no guidance
- make users guess what to do next

Each empty state should explain what the feature is for and what action the user can take next.

---

## Do Not Write Messy or Duplicated Code
The project should be maintainable.

Do not:
- duplicate the same logic across many screens
- mix database logic directly into every UI component
- use inconsistent naming
- keep everything in one giant file
- ignore reusable components, hooks, services, or typed models

Keep the architecture clean and scalable.

---

## Do Not Leave Error and Loading States Out
A real app needs proper state handling.

Do not:
- ignore loading indicators during auth or data fetches
- fail silently when an action breaks
- show unclear or raw backend error messages
- leave the user confused after failed actions

The experience should communicate clearly when something is happening or when something went wrong.

---

## Do Not Treat Reflection as an Afterthought
Reflection is one of Life Drawer’s main product values.

Do not:
- build only data capture with no revisit experience
- ignore mood, memory resurfacing, or reflective review opportunities
- make the app feel like storage only

Even if the reflection system starts simple, it should still be present and meaningful.

---

## Do Not Present the Final Result Like a Class Demo
The finished app should feel like a product-ready build.

Do not:
- leave obvious temporary shortcuts in the final version
- keep debug text visible in the UI
- rely on fake interactions for core journeys
- make the app feel unfinished behind polished visuals

The end result should feel believable as a real mobile product.

---

## Minimum Quality Standard
The final build should not include:
- placeholder core screens
- dead buttons
- fake CRUD
- fake auth
- blank navigation destinations
- unprotected user data
- unfinished primary flows

If a feature is shown as part of the main app experience, it should work in a real and honest way.
