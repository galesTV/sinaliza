# Design System Master File — Sinaliza PWA

> **LOGIC:** When building a specific page, first check `design-system/sinaliza/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Sinaliza (plataforma de aprendizagem de Libras — PWA)
**Direction:** B — **Constellation** (approved creative direction, November 2026)
**Revised:** 2026-11-14 — formalized the Constellation direction; preserves the foundation (spacing scale, surface model, motion tier, UX checklist) of the earlier ui-ux-pro-max draft mapped onto the real brand tokens.
**Category:** Language learning platform (adult beginners)
**Installed skills:** `ui-ux-pro-max` (design intelligence), `motion-design` (LottieFiles — motion principles), `web-design-guidelines` (Vercel — UI review checklist).

---

## 1. Visual concept — Constellation

**Constellation is the central visual metaphor.** A hand tracked by MediaPipe is a set of 21 landmarks joined by bone connections — literally a constellation. Sinaliza adopts this as its visual language: **nodes** (landmarks), **edges** (connections), **trajectories** (movement over time), and **spatial relationships** (the geometry that distinguishes one configuration from another).

This language communicates what the product is:

- **Learning through observation and practice** — you see the hand as structured geometry, then reproduce it.
- **Hand configuration, movement, and space as information** — the constellation makes the invisible structure of a sign visible.
- **A structured journey** — progress maps onto a constellation that fills in as the learner advances.
- **Technology as a foundation, not a costume** — the same geometry that powers recognition powers the visuals. The product never looks like a generic AI dashboard because its ornament is literally its data.

### Visual vocabulary

| Element | Spec | Meaning |
|---------|------|---------|
| Node | filled point, 2–4px, `--color-accent` or `--color-primary-soft`; amber `--color-highlight` for the emphasized/selected node | a hand landmark; a unit of progress |
| Edge | 1–2px line, violet→cyan or single-tone at 0.4–0.85 opacity | a bone connection; a relationship |
| Trajectory arc | fading trail or dashed line along a path | movement over time; a journey segment |
| Specimen frame | thin `--color-border` circle or rect framing one configuration | one catalog entry under observation |

### Meaningful vs. decorative use

Constellation elements are **meaningful** when they encode real geometry or real state:

- Hand-tracking overlays (the laboratory already draws landmarks as cyan/violet nodes and edges — that rendering is the canonical reference).
- Alphabet/catalog diagrams derived from the real 21-landmark topology.
- Progress constellations where filled nodes map to completed steps.
- Feedback that compares the learner's geometry to a reference.

They are **decorative** — allowed only in restrained doses — on heroes, section backgrounds, empty states, and loading surfaces, at low opacity behind nothing text-heavy.

**Never:**

- Never draw a "hand constellation" that misrepresents hand anatomy — use the real 21-landmark/connection topology or an abstract pattern that is clearly not a hand.
- Never use constellation graphics to imply recognition capability the product does not have (AGENTS.md §3, §17 — experimental assistance, not sign understanding).
- Never place dense node/edge patterns behind body text or controls.
- Never literalize hands into illustrations that could be mistaken for real Libras sign references (AGENTS.md §9).

---

## 2. Color system

Dark theme only. Existing identity preserved; one restrained warm accent added.

| Role | Value | CSS Variable | Contrast / usage |
|------|-------|--------------|------------------|
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
| **Highlight (amber)** | `#F0A848` | `--color-highlight` *(planned — not yet defined in `globals.css`)* | **8.8:1 on background** — see rules below |
| Ring / focus | `#35c9e8` | `--color-ring` | visible focus, 2px outline + offset |
| Destructive | `#dc2626` | `--color-destructive` | use with icon + text, never color alone |
| On Destructive | `#ffffff` | `--color-on-destructive` | — |
| Success / progress | `#83dfb8` | `--color-success` | progress indicators; always paired with label |

### Amber rules

Amber is a **restrained highlight**: the glint on a selected catalog specimen, the emphasized landmark node, a milestone/achievement moment, a rare badge. Small doses — points, rings, short labels, tiny fills — never large surfaces.

- **Implementation status:** `--color-highlight` is a planned token — the first change that uses it must add the variable and its `@theme` mapping to `apps/pwa/src/app/globals.css` before use.
- Amber is **not** a semantic color. Success stays `#83dfb8`, destructive `#dc2626`, warning/feedback stay paired with icon + text. Never use amber to mean success, error, or warning.
- Amber text on `--color-background`/`--color-surface*` passes AA (≈8.8:1) — allowed for short labels only.
- On amber fills, use navy (`#10172b`) text/icons (≈8.8:1). **Never white text on amber (≈1.8:1 — fails).**
- One warm accent per view at most; if cyan is already highlighting an element, amber does not compete beside it.

### Contrast requirements

- Normal text ≥4.5:1 (WCAG AA). Large text (≥24px, or ≥18.66px bold) and non-text UI ≥3:1.
- Verified pairs are the table above; any new pairing must be measured before use.
- `--color-primary` at ~3.5:1 on background is for filled buttons (white text), borders, gradients, icons — not body text.

---

## 3. Typography

Sora/Inter direction preserved — no issue found.

- **Display/headings:** Sora (`--font-display`) — weights 600–650, tight tracking, hero/page titles only.
- **Body/UI:** Inter (`--font-sans`) — base 16px, line-height 1.5–1.75.
- **Scale:** 12 (labels/eyebrows) · 14 (secondary) · 16 (body) · 18–20 (section lead) · 24–28 (section titles) · 32–44 (page titles).
- **Hierarchy by role, not just size:**
  - *Eyebrow* — 11–12px uppercase, `letter-spacing 0.1–0.13em`, cyan, optional leading dot (a "star" marking the section's constellation).
  - *Title* — Sora, one per view; states the learning context.
  - *Lead* — 18–20px Inter, muted-to-foreground, one sentence of context under a title.
  - *Body* — 16px Inter; lesson text, descriptions.
  - *Secondary/caption* — 12–14px Inter muted; metadata, hints, honest status labels.
- **Numeric data:** `tabular-nums` for counts, XP, progress values.
- Portuguese text is the default — headings wrap gracefully; never force uppercase on accented words longer than a label.

---

## 4. Components and surfaces

Depth = surface steps (`surface` → `surface-elevated`) + thin `--color-border` + restrained violet/cyan radial glows — not heavy drop shadows. **Avoid generic card repetition**: when a list is homogeneous (letters, modules), differentiate layout/rhythm instead of stamping identical rounded boxes.

### Spacing (4/8px rhythm, density 5/10)

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` | tight inline gaps |
| `--space-sm` | `8px` | icon↔label, chip gaps |
| `--space-md` | `16px` | standard padding/gaps |
| `--space-lg` | `24px` | card padding, section padding |
| `--space-xl` | `32px` | large gaps, card grids |
| `--space-2xl` | `48px` | section separation |
| `--space-3xl` | `64px`+ | page-level rhythm |

### Radius & elevation

| Token | Value | Usage |
|-------|-------|-------|
| radius | `10–12px` | buttons, chips, inputs |
| radius-lg | `14–16px` | cards |
| radius-xl | `20–24px` | panels, hero containers |
| `--shadow-md` | `0 10px 30px rgba(0,0,0,0.2)` | cards/panels on navy |
| glow | `0 0 Npx rgba(105,87,232,0.2–0.3)` | brand glow on key elements only |

### Buttons / links

```css
/* Primary CTA — one per screen */
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

**Action hierarchy is explicit:** one primary CTA per screen; secondary actions are ghost/outline; destructive actions are clearly marked and never the default. Tertiary actions are text links, not button-shaped.

### Cards / panels / lesson surfaces

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

- **Lesson surface** = the stage: elevated surface, generous padding, the constellation/specimen framed as the protagonist; chrome (nav, progress) recedes to `--color-surface`.
- **Feedback states** use border + icon + text: success edge `--color-success`, error edge `--color-destructive`, selection edge `--color-accent`; amber only for the "star moment" highlight.

### Navigation

- Active item = **color + weight + indicator** (never color alone): accent text, 600 weight, leading dot or underline marker, `aria-current="page"`.
- Desktop: top bar with brand + sections; mobile: bottom nav (≤5 items, icon + label) or accessible disclosed menu.
- Skip link to `#main-content` as the first focusable element.

### Progress

- Step indicators / progress bars pair track + fill with visible text (`N of M`, `%`) — progress is never color-only.
- Where a progress *constellation* is used, filled nodes still carry a text label; the visual is additive.

### Page patterns (learning context)

Journey-first hierarchy: greeting/context → next action (single primary CTA) → learning paths overview → progress/activity. One primary action per screen.

- **Dashboard:** welcome block → "continue/start learning" primary CTA → path cards → activity placeholder.
- **Path detail:** purpose + scope → module list with clear entry point → honest status of what's not built yet.

---

## 5. Alphabet catalog (Hand Archive principles)

The Libras alphabet is presented as a **visual catalog of specimens** — consistent framing that invites comparison, extensible to future visual material.

- **Uniform specimen frame:** every letter/configuration in the same frame, same scale, same node/edge rendering — comparison happens by looking across cells, not by re-reading style.
- **Grid organization:** scannable grid ordered by the pedagogical sequence the team defines; grouping labels (vogais, consoantes…) are captions, not hard rules — the ordering is a content decision, not a design one.
- **Comparison states:** selecting one specimen may pin it side-by-side with another; the emphasized specimen gets the amber node/edge highlight.
- **Extensible cells:** a catalog cell must accommodate any future visual reference — static diagram, image, video, or frame sequence — without redesigning the grid.
- **Empty/planned states:** letters without validated content show an honest placeholder ("em breve" style), never a fabricated illustration.

**Boundary:** the system defines *presentation* only. No hand illustrations, sign descriptions, mnemonics, or pedagogical claims are invented here — content awaits validated references (AGENTS.md §18).

---

## 6. Motion

**Default implementation:** CSS transitions for routine UI feedback; the `motion` package (Motion for React — the stack's animation library, already used in `apps/landing`) is the sanctioned choice for JS-driven animation and is added to `apps/pwa` when a component first needs it — it is not yet a PWA dependency. Motion tier: **Subtle (2/10)** — choreography with intent, never scroll spectacle.

- **Purposeful transitions:** 150–300ms, `ease-out` on entry; animate `transform`/`opacity` only.
- **Feedback motion:** success = brief settle (scale 1→1.0 or a single node pulse); error = short attention nudge; loading = skeleton or one restrained ambient loop — never spinners-on-spinners.
- **Ambient movement** is allowed only where it teaches the metaphor (a slowly drawn constellation on a hero/empty state) and must pause when off-screen and under `prefers-reduced-motion`.
- **`prefers-reduced-motion: reduce`** removes transitions/animations globally (already in `globals.css`); any JS-driven motion must check `matchMedia('(prefers-reduced-motion: reduce)')`.
- **Constellation motion** (node-by-node draw, trajectory trails) follows the `motion-design` skill's timing/easing tables; keep total sequences under ~600ms for UI feedback.
- **Precedence:** installed skills (`motion-design`, `ui-ux-pro-max`, `web-design-guidelines`) are advisory references — where their generic recommendations conflict with this document or AGENTS.md, the project rules win. Example: the skill's "always three motion layers" does not override the ambient-motion restriction above; simple feedback does not require ambient movement.
- **No GSAP** without a specific future requirement (and no GSAP skill installed); if ever added, register `ScrollTrigger` once and gate on reduced-motion.

---

## 7. Responsive behavior

- **Mobile-first:** the learning experience is designed for the phone first; layouts scale up, not down.
- **Touch targets ≥44×44px** (WCAG 2.2 floor is 24×24 — we target 44); spacing between adjacent targets ≥8px.
- **Hierarchy across sizes:** 375px — one column, journey order vertical, primary CTA always visible without scrolling past it; 768px — catalog grids 3–4 cols, nav may move to a top bar; ≥1024px — wider specimen grids, side-by-side comparison comfortable, max content width ~72rem centered.
- **No horizontal scroll at 375 / 768 / 1024 / 1440;** `min-h-dvh` on app shells; safe-area insets respected on iOS.
- Catalog cells stay square-ish at every breakpoint so specimens remain comparable.

---

## 8. Accessibility

- **Contrast:** WCAG AA everywhere — verified pairs in §2; measure anything new.
- **Keyboard:** every interaction reachable by keyboard; tab order matches visual order; skip link present.
- **Focus:** visible `:focus-visible` ring (2px cyan, 3px offset) on all interactive elements — never removed without an equivalent visible indicator.
- **Semantics:** native controls over divs; `aria-current` on active nav; `role`/`aria-*` only where native HTML can't express it; live regions for async feedback the user must notice.
- **Never communicate status through color alone** — pair every status color with icon and/or text (border + icon + label is the standard pattern).
- **Reduced motion:** supported globally; decorative motion off, functional state changes still legible.
- **Camera-free path:** the educational experience is fully usable without camera access (AGENTS.md §15); constellation visuals never gate content.
- Icons: decorative `aria-hidden`; meaningful ones have text alternatives.

---

## 9. Future visual lesson content — open decision

The design system must be **capable of supporting** — as content possibilities, not as a chosen format — text, images, videos, frame sequences, captions, and accessible descriptions of all of the above.

- **The actual lesson format and educational methodology remain open** pending the discussion with Prof. Fernanda on **November 18, 2026**. Do not let any layout, catalog cell, or lesson surface assume a single media type.
- Practical consequence: lesson surfaces reserve a flexible media slot (aspect-ratio-agnostic container, consistent framing, caption/description region) and the catalog cell accepts any media type (§5).
- Every visual format must ship with a text alternative path: captions for video, alt/description for images and frame sequences.
- This section documents **capability only** — it decides nothing about pedagogy.

---

## 10. Anti-Patterns (Do NOT Use)

- ❌ Generic SaaS/template look that drops the navy+violet+cyan identity
- ❌ Constellation decoration behind dense text, or fake hand "constellations" with wrong anatomy
- ❌ Amber as success/error/warning, or large amber surfaces, or white text on amber
- ❌ Emojis as icons — inline SVG only, consistent stroke width
- ❌ Information conveyed by color alone
- ❌ Instant state changes — always transition (150–300ms)
- ❌ Invisible focus states
- ❌ Layout-shifting hovers; heavy shadows; decorative clutter; gamification noise
- ❌ Fake functionality presented as working (placeholder data must be labeled as placeholder)
- ❌ Literal hand illustrations that could misrepresent Libras signs
- ❌ Inventing lesson content, sign descriptions, or pedagogical claims

---

## 11. Pre-Delivery Checklist

- [ ] Constellation elements encode real geometry/state, or are clearly restrained brand texture
- [ ] Semantic HTML landmarks; `h1`→`h6` sequential
- [ ] Skip link; tab order matches visual order; `aria-current` on active nav
- [ ] Text contrast ≥4.5:1 (verified pairs above); non-text UI ≥3:1
- [ ] Amber used only as restrained highlight; semantic colors untouched
- [ ] Touch targets ≥44×44px; `cursor-pointer` on clickable elements
- [ ] `prefers-reduced-motion` respected (CSS rule + JS `matchMedia` check)
- [ ] Responsive at 375 / 768 / 1024 / 1440; no horizontal scroll; `min-h-dvh`
- [ ] Decorative icons `aria-hidden`; meaningful ones have text alternatives
- [ ] Placeholder/future features clearly labeled, never disguised as functional
- [ ] No new runtime dependencies; Motion/CSS only for animation
