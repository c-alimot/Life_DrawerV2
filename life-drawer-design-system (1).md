# Life Drawer Design System

## 1. Overview

Life Drawer is a calm, reflective journaling product designed primarily for mobile, with a responsive system that scales gracefully across tablet and web. The visual language should feel quiet, grounded, warm, and personal. It should never feel loud, overly polished, or overly tech-heavy.

The interface is built around softness, clarity, and emotional safety. The system combines editorial typography, muted earthy colors, generous spacing, rounded shapes, and low-pressure interface patterns to support thoughtful journaling and reflection.

## 2. Brand Attributes

### Core personality
- Calm
- Thoughtful
- Reflective
- Personal
- Organized
- Warm
- Gentle
- Minimal

### Product feeling
Users should feel:
- welcomed, not overwhelmed
- guided, not rushed
- organized, not boxed in
- reflective, not clinical
- safe, private, and in control

### Design principles
- Prioritize emotional calm over visual intensity
- Keep layouts clean and breathable
- Use soft contrast instead of harsh contrast
- Make actions clear without making them aggressive
- Let content and reflection be the focus
- Build for clarity first, decoration second

---

## 3. Responsive Design Approach

Although Life Drawer is designed mobile-first, every component should adapt cleanly across larger screens.

### Responsive goals
- Preserve the calm, centered feel on all devices
- Avoid stretching mobile layouts too wide on tablet and desktop
- Keep reading widths comfortable
- Increase whitespace as screens get larger
- Introduce structure, not clutter, on web

### Recommended breakpoints
```txt
Mobile: 0-767px
Tablet: 768-1023px
Desktop/Web: 1024px+
Large Desktop: 1440px+
```

### Layout behavior by size

#### Mobile
- Single-column layout
- Primary navigation through menu or bottom tabs
- Full-width cards and buttons
- Touch-first spacing and hit areas

#### Tablet
- Wider content containers
- More generous gutters
- Cards may sit in 2-column layouts where appropriate
- Keep forms and onboarding centered with max width

#### Desktop/Web
- Use centered content areas with max widths
- Avoid edge-to-edge stretching for journaling content
- Support split layouts when helpful:
  - sidebar + content
  - list + detail
  - insights panels
- Preserve mobile hierarchy and softness, not enterprise dashboard styling

### Container widths
```txt
Mobile container: 100% width with 16-24px horizontal padding
Tablet content max width: 720-860px
Desktop content max width: 960-1200px
Reading/form width: 480-640px
Large card sections: 1100-1280px max
```

---

## 4. Color System

The palette is warm, earthy, soft, and grounded. The product should feel calm and reflective, with sage greens, warm neutrals, and muted clay accents carrying the visual identity.

### Core Brand Colors

#### Background
Primary app background and main canvas color.

```txt
Background: #EDEAE4
```

#### Primary
Main brand action color used for primary buttons, filled states, active elements, and emphasis.

```txt
Primary: #8C9A7F
```

#### Secondary
Deeper sage used for stronger CTAs, selected states, prominent buttons, and deeper icon fills.

```txt
Secondary: #556950
```

#### Accent 1
Warm sand used for supportive accents, feature panels, examples, and gentle visual contrast.

```txt
Accent 1: #DAC8B1
```

#### Accent 2
Muted taupe-clay used for borders, secondary accents, dividers, and warm structural contrast.

```txt
Accent 2: #B39C87
```

### Status Colors

These should stay soft, readable, and aligned with the calm tone of the product.

#### Success
```txt
Text/Border: #4F7A63
Background: #DCE9E1
```

#### Warning
```txt
Text/Border: #B07A3A
Background: #F1E2CF
```

#### Error
```txt
Text/Border: #A6544E
Background: #F2D9D7
```

### Supporting Neutrals

Use these to complete the UI system while staying visually aligned to the palette above.

```txt
Text / Primary: #2F2924
Text / Secondary: #6F6860
Text / Muted: #8A8178
White: #FFFFFF
Surface / Soft White: #F8F6F2
```

### Color usage rules
- Use `#8C9A7F` as the standard primary brand color
- Use `#556950` for stronger emphasis and high-importance actions
- Use `#EDEAE4` as the main page background
- Use `#DAC8B1` and `#B39C87` as warm supporting accents
- Keep status colors soft and never overly saturated
- Avoid cool grays, neon tones, or harsh black
- Onboarding, intro, sign in, and create account should always render on the light palette, even if the device/system theme is dark


---

## 5. Typography

Life Drawer uses elegant editorial headings paired with comfortable, readable body text.

### Font Families

#### Display / Headings
Cormorant Garamond

Used for:
- page titles
- onboarding headlines
- welcome screens
- section headings
- reflective emphasis

This serif should create a soft, graceful, and elevated feeling without becoming too formal or ornate.

#### Body / UI
Proza Libre

Used for:
- body copy
- forms
- labels
- navigation
- buttons
- helper text
- metadata
- supporting descriptions

This sans-serif should keep the interface grounded, readable, and calm across mobile and web.

### Type pairing rationale
- Cormorant Garamond brings warmth, elegance, and a personal editorial feel
- Proza Libre keeps the UI approachable and highly legible
- Together they balance reflection and usability

### Type scale
```txt
Display XL: 40 / 48
Display L: 32 / 40
Heading 1: 28 / 36
Heading 2: 24 / 32
Heading 3: 20 / 28
Title: 18 / 26
Body L: 18 / 30
Body M: 16 / 28
Body S: 14 / 22
Caption: 12 / 18
Overline: 12 / 16
Button: 16 / 24 semibold
```

### Auth and onboarding type references
These are the current target scales used in the entry flow:

```txt
Onboarding title: 30 / 40 italic serif
Intro title: 38 / 44 serif
Auth title: 32 / 40 serif
Auth field label: 11 / 14 with increased letter spacing
Primary CTA label: 14 / 18 bold, letter spacing 2.2
```

### Responsive typography behavior
- On mobile, headings should feel refined but not oversized
- On tablet and desktop, increase heading scale slightly while maintaining generous whitespace
- Keep reading text between 16px and 18px for comfort
- Limit long line lengths on web for readability

### Typography usage rules
- Use Cormorant Garamond only for headings and emotionally important text
- Use Proza Libre for all functional and body text
- Keep body copy relaxed with generous line spacing
- Use muted colors for secondary copy
- Avoid overusing serif text in dense UI areas


---

## 6. Spacing System

Spacing should feel airy and intentional. The app should never feel cramped.

### Base spacing scale
```txt
4px
8px
12px
16px
20px
24px
32px
40px
48px
64px
80px
96px
```

### Usage guidance
- 8-12px for tight internal spacing
- 16px for default spacing between related items
- 24-32px for section spacing
- 40px+ for major vertical breathing room

### Responsive spacing
- Mobile horizontal padding: 16-20px
- Tablet horizontal padding: 24-32px
- Desktop section gutters: 32-48px
- Increase outer spacing on larger screens before increasing component density

---

## 7. Grid and Layout

### Mobile grid
- Single column
- 16-20px outer padding
- 12-16px gaps between stacked cards and controls

### Tablet grid
- 8-column or flexible auto-fit system
- 24-32px outer padding
- 16-24px gaps

### Desktop grid
- 12-column grid
- Max-width containers
- Use grid only where it improves clarity
- Journaling views should favor centered reading layouts over dense dashboards

### Alignment rules
- Left-align interface content by default
- Center empty states and onboarding content when emotionally helpful
- Keep actions grouped logically and consistently
- Avoid scattered floating elements

---

## 8. Shape, Corners, and Borders

The system uses soft rounded rectangles and quiet outlines.

### Radius scale
```txt
Small: 10px
Medium: 14px
Large: 18px
XL: 24px
Pill: 999px
```

### Recommended usage
- Inputs: 14-16px radius
- Primary CTAs: pill
- Secondary auth/action buttons: pill
- Cards: 18-20px radius
- Tags/chips: pill
- Modals/sheets: 24px radius

### Borders
- Default border: 1px solid taupe
- Strong emphasis border: 1.5px if needed
- Avoid heavy dividers
- Prefer bordered surfaces over harsh shadows

### Shadows
Shadows should be very subtle and used sparingly.

```txt
Shadow soft:
0 2px 10px rgba(47, 41, 36, 0.06)

Shadow elevated:
0 8px 24px rgba(47, 41, 36, 0.08)
```

Use shadows mainly on:
- sheets
- floating cards
- overlays
- desktop elevation moments
- auth inputs
- auth consent cards
- intro feature cards

---

## 9. Iconography

Icons should feel soft, minimal, rounded, and slightly organic.

### Icon style
- Rounded line icons or soft filled icons
- Minimal detail
- Calm visual weight
- Consistent corner softness
- Prefer simple symbolic metaphors

### Icon themes from current UI
- leaf
- drawers
- ripple/drop
- journal
- tag
- calendar
- search
- menu
- help

### Icon usage
- Use sage fills or ink outlines
- Keep icons medium-sized and easy to scan
- Pair icons with text for clarity in key actions
- Avoid overly sharp or technical icon sets

### Icon sizes
```txt
Small: 16px
Default: 20px
Medium: 24px
Large: 32px
Feature icon: 48-64px
```

---

## 10. Buttons

Buttons should feel supportive, soft, and clear.

### Button types

#### Primary button
Used for main CTAs such as:
- Next
- Get started
- Save
- Create account
- Create first entry

Style:
- Sage background
- White text
- Pill radius
- Semibold text
- 14px label with wide tracking for auth/onboarding/intro entry actions

#### Secondary button
Used for supporting actions such as:
- Sign in
- Edit
- Search
- Previous

Style:
- Cream or white surface
- Taupe or sage border
- Ink or sage text
- Use pill radius when paired directly under a primary CTA in auth/intro flows

#### Tertiary / text button
Used for:
- Skip
- Forgot password
- Create account link
- Back if not icon-led

Style:
- No strong container
- Ink or green text depending on emphasis
- Minimal emphasis

### Button sizing
```txt
Height small: 40px
Height default: 48px
Height large: 56px
Auth / onboarding / intro CTA: 66-72px
Horizontal padding: 16-24px
```

### Interaction states
- Default
- Hover
- Pressed
- Focused
- Disabled
- Loading

### State guidance
- Hover on web: slightly deepen fill or border
- Pressed: reduce brightness slightly
- Disabled: muted background and text
- Focus: visible accessible ring, brand-aligned

---

## 11. Form System

Forms should feel calm, spacious, and easy to complete.

### Input fields
Style:
- Rounded rectangle
- White background
- No visible stroke as the primary separation
- Soft shadow/elevation instead of a border-led treatment
- Dark text
- Large tap target

### Input specs
```txt
Height: 72px on auth screens
Radius: 18px on auth screens
Horizontal padding: 16px
Label spacing above input: 8px
Gap between fields: 16-20px
```

### Field content hierarchy
1. Label
2. Input
3. Helper text or validation
4. Optional action

### Form rules
- Labels should stay outside fields for clarity
- Placeholders should be lighter than entered text
- Error messages should be clear and calm
- Password and auth screens should be centered and uncluttered
- On web, forms should stay within readable max widths

### Checkbox style
- Rounded square or soft square
- Taupe border
- Sage selected state
- Visible white checkmark when selected
- Comfortable spacing between checkbox and text

---

## 12. Cards and Surfaces

Cards are key to the product's structure.

### Card types
- empty state cards
- drawer cards
- recent entry cards
- educational callout cards
- onboarding content blocks

### Card styling
- Soft white or cream surface
- Minimal border or no border
- Large radius
- Soft shadow when the card needs separation on a light canvas
- Generous inner padding

### Card padding
```txt
Small card: 16px
Default card: 20-24px
Feature card: 24-32px
```

### Responsive card behavior
- Mobile: full-width stacked cards
- Tablet: allow 2-column arrangements where useful
- Desktop: use grids for organization, but keep journaling and reading areas focused

---

## 13. Navigation

Navigation should stay simple and low-pressure.

### Mobile navigation
Patterns may include:
- top app bar
- drawer menu
- contextual action buttons
- optional tab navigation for core areas

### Current primary sections
- Home
- Life Phases
- Drawers
- Tags
- Insights
- Account & Settings
- Help & Support

### Navigation style
- Large readable labels
- Soft outlined containers
- Clear active state
- Generous spacing
- Avoid cramped icon-only navigation where labels matter

### Web navigation recommendations
On web, navigation can adapt into:
- left sidebar navigation
- top navigation with secondary panel
- hybrid sidebar + content layout

Keep content areas centered and uncluttered. Avoid turning the app into a dense productivity dashboard.

---

## 14. Page Patterns

### Onboarding
- Centered illustration and content
- Layered soft circles behind the illustration
- Large top/bottom breathing room
- Single primary CTA at the bottom
- Progress indicators with one elongated active pill
- Previous in the top-left on later slides
- Skip as small text below the CTA

### Welcome / intro
- Strong title
- Short value proposition
- Larger standalone logo with no enclosing badge
- White feature cards with soft shadow
- Minimal inline icons with no icon circles
- Two clear actions: create account and sign in
- Two reassurance lines under the actions

### Auth pages
- Light full-screen canvas
- Back action pinned in the top-left
- Main content centered lower on the page
- Minimal distractions
- Large serif title
- White shadowed fields
- Pill green submit button with white text
- Supporting links in dark brown or green depending on emphasis

### Home / empty state
- Greeting or page title
- Primary actions at top
- Empty state card when no content exists
- Helpful education beneath main action

### Entry creation
- Focus on writing area
- Title, date, and optional metadata
- Minimal toolbar
- Save action clearly visible
- Writing area should dominate the page

### Life phases / drawers / tags
- Educational top section for first-time users
- Primary create action
- Example content or starter suggestions
- Clear card/chip-based organization

---

## 15. Empty States and First-Time UX

Empty states are a major part of Life Drawer because many users start with no content.

### Empty state goals
- reduce pressure
- explain the purpose of the feature
- invite action gently
- make the next step obvious

### Empty state formula
1. soft icon or illustration
2. short reassuring title
3. short explanation
4. primary CTA
5. optional examples or starter suggestions

### Tone examples
- “No entries yet”
- “Your journey starts here”
- “Create your first drawer”
- “Organize with tags”

Tone should be encouraging, not gamified or overly cheerful.

---

## 16. Chips, Tags, and Metadata

Tags and supporting metadata should feel lightweight and flexible.

### Tag chip styling
- Pill shape
- Light background or white fill
- Taupe border
- Muted or sage text
- Optional small leading dot or icon

### Chip sizing
```txt
Height: 32-40px
Horizontal padding: 12-16px
Gap between chips: 8-12px
```

### Behavior
- Allow multi-line wrapping
- Keep touch targets large enough on mobile
- On web, allow inline wrapping with consistent rhythm

---

## 17. Motion and Interaction

Motion should be soft, subtle, and purposeful.

### Motion principles
- guide attention
- reinforce hierarchy
- avoid distraction
- support calmness

### Recommended motion
- button press micro-feedback
- gentle fade transitions
- slide transitions between onboarding screens
- subtle expand/collapse for drawers and lists

### Motion timing
```txt
Fast: 120ms
Default: 180-220ms
Slow: 280-320ms
```

### Motion easing
Use soft easing curves, not snappy or bouncy ones.

Avoid:
- dramatic spring motion
- large parallax
- flashy loaders
- excessive hover animation

---

## 18. Accessibility

Life Drawer should be calm and accessible.

### Accessibility requirements
- Meet WCAG contrast standards
- Maintain visible focus states on web
- Use minimum 44x44px touch targets
- Do not rely on color alone for states
- Support screen readers with clear labels
- Maintain readable font sizes and line heights
- Preserve logical heading structure

### Specific guidance
- Serif headings must remain readable at chosen weights
- Muted text should still pass contrast for body sizes
- Buttons must remain high contrast
- Form validation should be readable and specific

---

## 19. Content and Voice

The product voice should sound:
- gentle
- clear
- human
- calm
- supportive
- respectful of privacy

### Voice guidelines
- Write in plain, warm language
- Avoid overly clinical or productivity-heavy wording
- Avoid guilt-based language
- Avoid urgency unless truly necessary
- Keep copy concise and emotionally safe

### Example voice style
Preferred:
- “Capture your thoughts, memories, and everyday moments”
- “Create your first entry whenever you’re ready”
- “Organize reflections your way”

Avoid:
- “Boost productivity now”
- “Stay on track”
- “Never miss a journal streak”
- “Optimize your life data”

---

## 20. Component Inventory

Core components for Life Drawer should include:

### Foundations
- color tokens
- typography tokens
- spacing tokens
- radius tokens
- elevation tokens

### Navigation
- app bar
- sidebar/drawer menu
- section list items
- back button
- overflow menu

### Actions
- primary button
- secondary button
- text button
- icon button
- FAB if needed, used sparingly

### Inputs
- text input
- password input
- textarea / journal editor
- checkbox
- chip selector
- search field

### Content
- entry card
- drawer card
- life phase card
- tag chip
- empty state card
- callout card
- modal/sheet
- section header

### Feedback
- inline validation
- toast
- loading state
- confirmation state
- empty state
- error state

---

## 21. Design Tokens Starter

```json
{
  "color": {
    "bg": {
      "primary": "#EDEAE4",
      "secondary": "#F8F6F2",
      "accent": "#DAC8B1"
    },
    "text": {
      "primary": "#2F2924",
      "secondary": "#6F6860",
      "placeholder": "#8A8178",
      "inverse": "#FFFFFF"
    },
    "border": {
      "default": "#B39C87",
      "strong": "#A48D79"
    },
    "brand": {
      "primary": "#8C9A7F",
      "secondary": "#556950",
      "soft": "#C9D3C2"
    },
    "state": {
      "success": "#4F7A63",
      "warning": "#B07A3A",
      "error": "#A6544E",
      "info": "#8AA0A4"
    }
  },
  "radius": {
    "sm": 10,
    "md": 14,
    "lg": 18,
    "xl": 24,
    "pill": 999
  },
  "spacing": {
    "xs": 4,
    "sm": 8,
    "md": 12,
    "lg": 16,
    "xl": 24,
    "2xl": 32,
    "3xl": 40,
    "4xl": 48
  }
}
```

---

## 22. Web Adaptation Notes

To make the mobile system work well on web:

- keep the same visual language and component shapes
- increase whitespace, not density
- introduce max-width content containers
- use sidebars only when they improve clarity
- keep form areas narrow and readable
- keep journaling/editor experiences centered and distraction-free
- support hover and keyboard focus states
- avoid making web feel like a completely different product

### Suggested web layouts
- onboarding/auth: centered single-column
- home: left nav + main content
- entry editor: centered writing canvas with optional side metadata panel
- drawers/tags/life phases: card grid or list layout with responsive wrapping
- insights: modular cards with generous spacing

### Current auth flow reference
The current first-time user sequence is:

```txt
Onboarding -> Intro -> Sign in / Create account -> App
```

Visual continuity between these four screens should be maintained through:
- the same light background
- dark-brown text
- pill CTAs
- soft white surfaces
- subtle shadows
- calm, editorial hierarchy

---

## 23. Visual Summary

Life Drawer should visually feel like:
- a quiet notebook
- a soft archival system
- a thoughtful personal space
- a modern but warm reflective product

It should not feel like:
- a corporate dashboard
- a highly gamified wellness app
- a loud social platform
- a cold data tool

---

## 24. Final Direction

The Life Drawer design system should always balance emotional warmth with structured organization. It should be elegant without feeling precious, modern without feeling cold, and responsive without losing its mobile-first intimacy.

When in doubt:
- simplify the layout
- soften the contrast
- increase breathing room
- make the next step clearer
- protect the reflective tone
