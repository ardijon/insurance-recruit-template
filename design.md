## 1. Direction & Layout
- Text direction: RTL (Persian)
- Layout system: Tailwind CSS v4 with `@theme inline` custom tokens
- Base spacing scale: Tailwind's default scale
- Theme: light/dark mode with a user-facing toggle — default follows
  system preference (`prefers-color-scheme`), implemented via a class-based
  `.dark` variant (`@custom-variant dark (&:where(.dark, .dark *));`)

## 2. Typography
- Primary Persian typeface: Vazirmatn — per proposal §2.1.
- Fallback / Latin typeface: Vazirmatn itself (full Latin glyph set, avoids visual mismatch between two fonts)
- Type scale: Tailwind's default scale (`text-sm` through `text-4xl`)

## 3. Color Tokens

All values verified against WCAG 2.1 AA (contrast ratios computed on the
theme's own `bg-base` / component pairing). `cta-contrast` exists because
white text on `brand-cta` fails AA in dark mode (4.06:1) — buttons use
`text-cta-contrast` instead of `text-white`.

| Token | Light | Dark | Usage |
|---|---|---|---|
| `bg-base` | `#FAF8F4` | `#0B1420` | Main page background |
| `bg-surface` | `#F1EDE6` | `#111C2B` | Cards, alternating sections |
| `text-primary` | `#1E1B16` (16.2:1) | `#F3F4F6` (15.6:1) | Main body text |
| `text-secondary` | `#6B6459` (5.5:1) | `#9CA3AF` (7.3:1) | Secondary text/descriptions |
| `border` | `#D6CFC2` | `#223047` | Dividers, form borders (decorative) |
| `brand-emphasis` | `#1B3A4B` (11.3:1) | `#6FA8DC` (7.3:1) | Headers, emphasized text |
| `brand-cta` | `#256079` (6.9:1 w/ white) | `#4A90D9` (5.5:1) | Buttons, primary links, form CTA |
| `cta-contrast` | `#FFFFFF` | `#0B1420` | Text/icon color on `brand-cta` fills |
| `accent` | `#8A5C13` (5.5:1) | `#D9A94A` (8.6:1) | High scores, success wall, badges |
| `success` | `#15803D` (4.7:1) | `#22C55E` (8.1:1) | Confirmations, form success |
| `danger` | `#B91C1C` (6.1:1) | `#F87171` (6.7:1) | Destructive actions, errors |
| `shadow-card` | warm-tinted soft shadow | deep soft shadow | Elevation level 1 (cards) |
| `shadow-pop` | larger, softer | deeper | Elevation level 2 (modals/menus) |
| `.glass` utility | `bg-base` @ 78% + blur(12px) | same | Chrome surfaces only: sticky headers, filter bars |

Content semantics (insurance recruitment): deep petrol/navy = trust &
financial stability; warm ivory (not sterile white) = human warmth;
gold accent = growth & achievement (success wall, badges); green =
confirmation; restrained red = destructive without alarming.

## 4. Component Patterns
- Buttons: `brand-cta` fill + `cta-contrast` text/icon (never `text-white` — dark-mode AA), hover `opacity-90`, focus `ring-2 ring-brand-cta/40`
- Destructive buttons: `bg-danger/10 text-danger hover:bg-danger/20` — never hard-coded red
- Forms / inputs: 3-step form with progress bar (proposal §2.5), `bg-bg-base` fields on `bg-surface` cards, border `border`, focus `border-brand-cta` + `ring-brand-cta/30`, placeholders at `/70` opacity
- Cards / tiles: `bg-surface` + `ring-1 ring-border/60` + `shadow-card` — dark mode keeps a subtle ring instead of heavy shadow
- Elevation: 0 = `bg-base`, 1 = `bg-surface` + `shadow-card`, 2 = popover + `shadow-pop` + blur
- Glass utility (`.glass`): reserved for chrome surfaces only — sticky headers, sticky filter bars, admin sidebar — never content containers (readability)
- Aesthetic direction: minimal flat base + limited "Soft Glass" chrome + soft shadows; no neumorphism (fails contrast on principle)
- Navigation (public): sticky glass header with smooth-scroll links (Manager Profile, Success Wall, Growth Path, FAQ, Location) + CTA; theme via admin-set class in `app/layout.tsx`
- Navigation (admin): right-side grouped sidebar (RTL) — گروه‌های مدیریت / محتوای سایت / سیستم — bottom utility block (view site, password, logout, date, theme); mobile = slim top bar + bottom tab bar + "more" drawer with same grouping

## 5. Do-Not-Change List
(empty for now — fill in after the first built version)

## 6. Verification Checklist
- [ ] No new colors/fonts/spacing values outside §2–§3.
- [ ] RTL rendering checked (not just LTR-mirrored by the browser default).
- [ ] Both light and dark themes checked against the tokens above, not hard-coded colors.
- [ ] Components reused from §4 rather than re-implemented.
- [ ] Diff reviewed for unrelated visual changes before commit.