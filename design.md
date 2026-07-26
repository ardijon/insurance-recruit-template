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

| Token | Light | Dark | Usage |
|---|---|---|---|
| `bg-base` | `#F8F9FA` | `#0B1420` | Main page background |
| `bg-surface` | `#EEF1F5` | `#111827` | Cards, alternating sections |
| `text-primary` | `#111827` | `#F3F4F6` | Main body text |
| `text-secondary` | `#6B7280` | `#9CA3AF` | Secondary text/descriptions |
| `border` | `#D1D5DB` | `#1F2937` | Dividers, form borders |
| `brand-emphasis` | `#0C4A6E` | `#6FA8DC` | Headers, emphasized text (manager profile heading) |
| `brand-cta` | `#0369A1` | `#3B82C4` | Buttons, primary links, application-form CTA |
| `accent` | `#E68A2E` | `#D9A94A` | High scores, success wall, achievement badges |
| `success` | `#16A34A` | `#22C55E` | Confirmations, form-submission success message |

## 4. Component Patterns
- Buttons: `brand-cta` color, white/`text-primary` text depending on theme
- Forms / inputs: 3-step form with progress bar (proposal §2.5), borders using the `border` token
- Cards / tiles: `bg-surface` background — success wall grid (§2.2), manager profile card (§2.1)
- Navigation: Sticky header with smooth-scroll links to page sections (Manager Profile, Success Wall, Growth Path, FAQ) and a prominent CTA button linking to `/apply`; dark-mode toggle lives in the header

## 5. Do-Not-Change List
(empty for now — fill in after the first built version)

## 6. Verification Checklist
- [ ] No new colors/fonts/spacing values outside §2–§3.
- [ ] RTL rendering checked (not just LTR-mirrored by the browser default).
- [ ] Both light and dark themes checked against the tokens above, not hard-coded colors.
- [ ] Components reused from §4 rather than re-implemented.
- [ ] Diff reviewed for unrelated visual changes before commit.