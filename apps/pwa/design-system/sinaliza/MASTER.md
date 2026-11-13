# Design System Master File — Sinaliza PWA

> **LOGIC:** When building a specific page, first check `design-system/sinaliza/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Sinaliza (plataforma de aprendizagem de Libras — PWA)
**Generated:** 2026-11-13 with [ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) (`--design-system`, Motion 2/10 Subtle, Density 5/10 Standard), then **adapted to the existing Sinaliza brand identity**.
**Category:** Language learning platform (adult beginners)

**Adaptation note:** the generator's first-pass suggestion (Claymorphism, light indigo palette, playful kids fonts) was rejected — it conflicts with the established Sinaliza identity. This document keeps the skill's structure, spacing scale, motion tier, and UX checklist, mapped onto the real brand tokens from `apps/landing`/`apps/pwa` (`globals.css`) and `AGENTS.md` §9. Style resolved as **Soft UI Evolution**: subtle depth, modern dark UI, accessibility-first.

---

## Global Rules

### Color Palette (dark theme — the only theme)

| Role | Value | CSS Variable | Contrast check |
|------|-------|--------------|----------------|
| Background | `#10172b` | `--color-background` | — |
| Foreground | `#f4f6fc` | `--color-foreground` | 16.5:1 on background |
| Surface (card) | `#151f38` | `--color-surface` | fg 15.1:1, muted 7.6:1 |
| Surface elevated | `#1b2743` | `--color-surface-elevated` | fg 13.7:1, muted 6.9:1 |
| Muted (secondary text) | `#a7b1c8` | `--color-muted` | 8.3:1 on background |
| Border | `rgba(190,204,235,0.12)` | `--color-border` | decorative separator |
| Primary (violet) | `#6957e8` | `--color-primary` | fills, gradients, icons; ≥3:1 for large text/UI |
| On Primary | `#ffffff` | `--color-on-primary` | 5.1:1 on primary (AA for buttons) |
| Accent (cyan) | `#35c9e8` | `--color-accent` | 9.1:1 on background — highlights, eyebrows, focus ring |
| Soft violet text | `#c7c0ff` | `--color-primary-soft` | 8.8:1 on elevated surfaces (nav CTA, badges) |
| Ring / focus | `#35c9e8` | `--color-ring` | visible focus, 2px outline + offset |
| Destructive | `#dc2626` | `--color-destructive` | use with icon + text, never color alone |
| On Destructive | `#ffffff` | `--color-on-destructive` | — |
| Success / progress | `#83dfb8` | `--color-success` | progress indicators; always paired with label |

**Color notes:** never convey meaning by color alone — pair status colors with icon/text. `primary` at 3.5:1 on background is reserved for filled buttons (with white text), borders, gradients and icons — not for body text.

### Typography

- **Display/headings:** Sora (`--font-display`, `font-display`) — weights 600–650, tight tracking on hero/page titles only.
- **Body/UI:** Inter (`--font-sans`) — base 16px, line-height 1.5–1.75.
- **Type scale:** 12 (labels/eyebrows) · 14 (secondary) · 16 (body) · 18–20 (section lead) · 24–28 (section titles) · 32–44 (page titles).
- **Eyebrow labels:** 11–12px, uppercase, `letter-spacing 0.1–0.13em`, accent color, optional leading dot.
- **Numeric data:** `tabular-nums` for counts, XP, progress values.

### Spacing Variables

*Density: 5/10 — Standard; 4/8px rhythm*

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` | tight inline gaps |
| `--space-sm` | `8px` | icon↔label, chip gaps |
| `--space-md` | `16px` | standard padding/gaps |
| `--space-lg` | `24px` | card padding, section padding |
| `--space-xl` | `32px` | large gaps, card grids |
| `--space-2xl` | `48px` | section separation |
| `--space-3xl` | `64px`+ | page-level rhythm |

### Radius & Elevation

| Token | Value | Usage |
|-------|-------|-------|
| radius | `10–12px` | buttons, chips, inputs |
| radius-lg | `14–16px` | cards |
| radius-xl | `20–24px` | panels, hero containers |
| `--shadow-md` | `0 10px 30px rgba(0,0,0,0.2)` | cards/panels on navy |
| glow | `0 0 Npx rgba(105,87,232,0.2–0.3)` | brand glow on key elements only |

Depth comes from surface steps (`surface` → `surface-elevated`), thin `--color-border` outlines and restrained violet/cyan radial glows — not heavy drop shadows.

---

## Component Specs

### Buttons / links

```css
/* Primary CTA */
.btn-primary {
  background: linear-gradient(110deg, #6957e8, #8272f2);
  color: #ffffff;
  min-height: 44px;
  padding: 12px 20px;
  border-radius: 11px;
  font-weight: 600;
  transition: transform 180ms ease, box-shadow 180ms ease;
  cursor: pointer;
}
.btn-primary:hover { transform: translateY(-2px); }

/* Secondary / ghost */
.btn-secondary {
  background: rgba(255,255,255,0.025);
  border: 1px solid var(--color-border);
  color: var(--color-foreground);
}

/* All focusable elements */
:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 3px; }
```

### Cards / panels

```css
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 24px;
  transition: border-color 180ms ease, transform 180ms ease;
}
.card.interactive:hover { transform: translateY(-2px); border-color: rgba(169,158,255,0.35); }
```

### Navigation

- Active item = **color + weight + indicator** (never color alone): accent text, 600 weight, leading dot or underline marker, `aria-current="page"`.
- Desktop: top bar with brand + sections; mobile: bottom nav (≤5 items, icon + label) or accessible disclosed menu.
- Skip link to `#main-content` as the first focusable element.

### Progress

- Step indicators / progress bars with text labels (`N of M`, `%`); track + fill colors paired with visible text — progress is never color-only.

---

## Style Guidelines

**Style:** Soft UI Evolution (dark) — subtle layered depth, clean modern surfaces, accessibility-first; matches the landing page's radial glows, thin borders and rounded panels.

**Keywords:** calm, focused, educational, structured journey; organic/fluid brand accents (violet→cyan gradients, glow points) used sparingly.

**Page pattern (learning context):** Journey-first hierarchy — greeting/context → next action (single primary CTA) → learning paths overview → progress/activity. One primary action per screen.

### Page Pattern

- **Dashboard:** welcome block → "continue/start learning" primary CTA → path cards → activity placeholder.
- **Path detail:** purpose + scope → module list with clear entry point → honest status of what's not built yet.

---

## Motion

**Tier:** Subtle (2/10). No scroll choreography in this milestone.

- Transitions 150–300ms, `ease-out` on entry; animate `transform`/`opacity` only.
- `prefers-reduced-motion: reduce` removes transitions/animations (global CSS rule).
- No GSAP in this milestone (not a dependency); if added later, register `ScrollTrigger` once and gate on reduced-motion.

---

## Anti-Patterns (Do NOT Use)

- ❌ Generic SaaS/template look that drops the navy+violet+cyan identity
- ❌ Emojis as icons — inline SVG only, consistent stroke width
- ❌ Information conveyed by color alone
- ❌ Instant state changes — always transition (150–300ms)
- ❌ Invisible focus states
- ❌ Layout-shifting hovers; heavy shadows; decorative clutter; gamification noise
- ❌ Fake functionality presented as working (placeholder data must be labeled as placeholder)
- ❌ Literal hand illustrations that could misrepresent Libras signs

---

## Pre-Delivery Checklist

- [ ] Semantic HTML landmarks; `h1`→`h6` sequential
- [ ] Skip link; tab order matches visual order; `aria-current` on active nav
- [ ] Text contrast ≥4.5:1 (verified pairs above); non-text UI ≥3:1
- [ ] Touch targets ≥44×44px (WCAG 2.2 AA web floor: 24×24px — we target 44)
- [ ] `cursor-pointer` on clickable elements; visible `:focus-visible` ring
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive at 375 / 768 / 1024 / 1440; no horizontal scroll; `min-h-dvh`
- [ ] Decorative icons `aria-hidden`; meaningful ones have text alternatives
- [ ] Placeholder/future features clearly labeled, never disguised as functional
