# Finance OS Favicon & Logo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a solid teal rounded-square “F” monogram as favicon and in-app logo for Finance OS.

**Architecture:** One SVG brand mark lives in `public/logo.svg`. The App Router favicon is `src/app/icon.svg` (same artwork) so Next serves `/icon.svg` automatically. The sidebar `Brand` component (and auth/home headers) render that asset next to the wordmark.

**Tech Stack:** Next.js App Router metadata file conventions, SVG, React/`next/image` or plain `<img>` for static public assets.

## Global Constraints

- Mark: monogram “F” only (no wordmark SVG)
- Colors: fill `#2DD4BF`, letter `#0F1F1C`
- Shape: rounded square, ~12–14% corner radius
- No glow, gradient, or drop shadow
- Keep text “Finance OS” beside the mark where space allows
- Commit and push to `main` when done

---

## File structure

| File | Role |
|------|------|
| `public/logo.svg` | Canonical brand mark for UI |
| `src/app/icon.svg` | Favicon via Next file convention |
| `src/features/shell/components/app-sidebar.tsx` | Replace CSS “F” span with logo image |
| `src/app/login/page.tsx` | Optional: mark beside title |
| `src/app/signup/page.tsx` | Optional: mark beside title |
| `src/app/page.tsx` | Optional: mark in header |

---

### Task 1: Create SVG brand mark assets

**Files:**
- Create: `public/logo.svg`
- Create: `src/app/icon.svg`

**Interfaces:**
- Consumes: none
- Produces: identical 32×32 viewBox SVG mark (teal rounded rect + dark “F”)

- [ ] **Step 1: Write `public/logo.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" role="img" aria-label="Finance OS">
  <rect width="32" height="32" rx="6" fill="#2DD4BF"/>
  <path fill="#0F1F1C" d="M9 8h14v3.2H12.6v3.4H21V18h-8.4v6H9V8z"/>
</path>
</svg>
```

(Adjust the `path` during implementation so the “F” is optically centered and reads clearly at 16px; keep colors and `rx="6"` locked.)

- [ ] **Step 2: Copy the same artwork to `src/app/icon.svg`**

Same SVG content as `public/logo.svg` (Next App Router icon file).

- [ ] **Step 3: Smoke-check files exist**

Run: `Get-Item public/logo.svg, src/app/icon.svg`

Expected: both files exist, non-zero size.

- [ ] **Step 4: Commit**

```bash
git add public/logo.svg src/app/icon.svg
git commit -m "feat: add Finance OS brand mark SVG for logo and favicon"
```

---

### Task 2: Wire logo into app shell Brand

**Files:**
- Modify: `src/features/shell/components/app-sidebar.tsx` (`Brand` function)

**Interfaces:**
- Consumes: `/logo.svg` from Task 1
- Produces: `Brand` renders mark image + optional “Finance OS” text

- [ ] **Step 1: Replace the teal “F” span with the logo image**

In `Brand`, change:

```tsx
<span className="flex size-8 items-center justify-center rounded-md bg-teal-500/15 font-[family-name:var(--font-display)] text-sm font-semibold text-teal-400">
  F
</span>
```

to:

```tsx
<img
  src="/logo.svg"
  alt=""
  width={32}
  height={32}
  className="size-8 rounded-md"
/>
```

Keep the Link wrapper and the conditional “Finance OS” text for `!collapsed`.

- [ ] **Step 2: Visual check**

Run: `npm run dev` and open `/dashboard` (authenticated) or any shell route.

Expected: sidebar shows teal “F” mark; collapsed mode shows mark only.

- [ ] **Step 3: Commit**

```bash
git add src/features/shell/components/app-sidebar.tsx
git commit -m "feat: use brand mark SVG in app sidebar"
```

---

### Task 3: Wire mark on marketing/auth headers

**Files:**
- Modify: `src/app/page.tsx` (header brand)
- Modify: `src/app/login/page.tsx` (title link)
- Modify: `src/app/signup/page.tsx` (title link)

**Interfaces:**
- Consumes: `/logo.svg`
- Produces: consistent mark + wordmark on public surfaces

- [ ] **Step 1: Home header**

Wrap header brand in a flex row with `img` + existing “Finance OS” text:

```tsx
<span className="flex items-center gap-2.5 font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight">
  <img src="/logo.svg" alt="" width={28} height={28} className="size-7 rounded-md" />
  Finance OS
</span>
```

- [ ] **Step 2: Login and signup titles**

Same pattern inside the existing `Link` (mark + “Finance OS”).

- [ ] **Step 3: Favicon check**

Open any route in the browser; confirm the tab icon is the teal “F” (hard-refresh if cached).

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx src/app/login/page.tsx src/app/signup/page.tsx
git commit -m "feat: show brand mark on home and auth pages"
```

---

### Task 4: Push to main

**Files:** none (git only)

- [ ] **Step 1: Verify status**

Run: `git status; git log origin/main..HEAD --oneline`

Expected: clean tree; commits ahead of origin for brand work.

- [ ] **Step 2: Push**

Run: `git push -u origin HEAD`

Expected: `main` updated on remote.
