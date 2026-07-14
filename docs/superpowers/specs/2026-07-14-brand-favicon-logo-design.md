# Design: Finance OS favicon & logo

**Date:** 2026-07-14  
**Status:** Approved (conversation) — awaiting written-spec confirmation

## Goal

Ship a solid monogram brand mark for browser favicon and in-app logo, then wire it into the App Router and shell. Commit and push to `main`.

## Decisions (locked)

| Decision | Choice |
|----------|--------|
| Mark | Monogram **“F”** (evolves current sidebar letter) |
| Color | Solid teal fill + dark “F” (strong tab presence) |
| Shape | Rounded square “app icon” (~12–14% corner radius) |
| Wordmark | Keep text “Finance OS” beside the mark where space allows |

## Visual spec

- **Canvas:** square SVG, viewBox `0 0 32 32` (scalable)
- **Background:** rounded rect, fill `#2DD4BF` (teal-400 / app primary signal)
- **Letter:** geometric “F”, fill `#0F1F1C`, optically centered, bold weight, no stroke
- **Effects:** none (no glow, gradient, or drop shadow)
- **Favicon sizes:** same SVG via Next metadata file convention; optional `apple-icon` PNG derived from the mark if needed later (out of scope unless trivial)

## Deliverables

1. `public/logo.svg` — shared brand mark
2. `src/app/icon.svg` — App Router favicon (Next.js file convention)
3. Replace sidebar CSS “F” span with `<Image>` / `<img>` of the mark
4. Optional polish: show mark next to “Finance OS” on login/signup/home header (same asset) — in scope if one-line change

## Out of scope

- Light-mode variant
- Animated logo
- Full wordmark SVG
- Social OG image redesign
- Replacing landing hero typography with the mark as hero brand (hero stays text)

## Acceptance

- Browser tab shows teal “F” icon for Finance OS routes
- Sidebar brand uses the SVG mark; collapsed sidebar shows mark only
- Assets are vector (SVG) and crisp at 16px and 32px
- Changes committed and pushed to `main`
