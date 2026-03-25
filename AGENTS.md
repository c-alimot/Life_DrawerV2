# Life Drawer Agent Instructions

This file gives project-level guidance to AI coding agents working in this repository.

## Primary Design Source

For all UI, styling, screen updates, and component work, treat the design system below as the source of truth:

- [life-drawer-design-system (1).md](/Users/char/Documents/Life_DrawerV2/life-drawer-design-system%20%281%29.md)

If a screen or component conflicts with the design system, prefer the design system unless the user explicitly asks for an exception.

## Current Auth Flow Source of Truth

The current first-time user flow is:

1. `onboarding`
2. `intro`
3. `login` or `signup`
4. app

When editing these screens, keep them visually consistent with each other.

## Required UI Rules

### Color system
- Main background: `#EDEAE4`
- Primary brand/action: `#8C9A7F`
- Secondary/deeper sage: `#556950`
- Accent 1: `#DAC8B1`
- Accent 2: `#B39C87`
- Main text: `#2F2924`
- Secondary text: `#6F6860`
- Muted text: `#8A8178`
- White surface: `#FFFFFF`
- Soft surface: `#F8F6F2`

### Auth, intro, and onboarding screens
- Always use the light palette, even if the device or browser is in dark mode.
- Keep text dark brown, not white, on light backgrounds.
- Use pill-shaped primary CTAs.
- Use white or soft-white form surfaces with soft shadow instead of heavy borders.
- Keep the visual tone calm, warm, and minimal.

### Typography
- Use serif styling for emotionally important headers and welcome/auth/onboarding titles.
- Use sans-serif styling for body text, labels, navigation, helper copy, and buttons.
- Keep headers elegant but not oversized.

### Interaction styling
- Keep shadows subtle.
- Avoid harsh black, neon accents, or cool-gray defaults.
- Avoid loud animations; motion should be soft and minimal.
- Checkboxes should show a visible checkmark when selected.

## When Updating UI

Before changing screens or components:

1. Check the design-system markdown first.
2. Keep onboarding, intro, login, and signup visually aligned.
3. Reuse existing palette and spacing choices instead of inventing new ones.
4. Prefer refining current patterns over introducing new visual systems.

## If The User Asks For New Screens

Design new screens to match the current Life Drawer auth and onboarding style:

- warm light canvas
- dark-brown text
- sage CTAs
- rounded soft-white cards and fields
- calm editorial hierarchy

Do not default to generic blue mobile-app styling.
