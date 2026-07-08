# WriterApp — Design Review & Improvement Plan

A design pass on the modernized app (July 2026), based on screenshots of the
live app in light, dark, and mobile layouts. Each numbered item below is
implemented as its own commit, in order.

## Principles

- The app's identity is a *calm writing surface*. Chrome should defer to the
  text at every opportunity.
- No frameworks, no build step. Everything stays in `index.html`,
  `style.css`, `editor.js`.
- Every state (light, dark, mobile, all themes) gets checked visually before
  a change ships.

## Changes

### 1. Fade the chrome while writing

The toolbar and status bar are permanently visible, which contradicts the
distraction-free promise. While the user is typing, both bars fade to
near-invisible; they return on mouse movement, keyboard focus leaving the
editor, or touch. Respect `prefers-reduced-motion` (no fade animation, just
show/hide).

### 2. Consolidate controls into a settings popover

On mobile the toolbar wraps into three rows and pushes the sheet halfway
down the screen; on desktop three labeled form controls read like a settings
page. Move Font / Size / Background into a popover opened by a single "Aa"
button. Final toolbar: **Writer · Aa · Load · Save** on one row at every
viewport width.

### 3. Replace the font-size number input with an A− / A+ stepper

Typing a number is nobody's mental model for text size, and the bordered
input showing "14" is the most utilitarian element on screen. Stepper
buttons adjust size within sensible bounds (10–32pt), which also eliminates
garbage input by construction.

### 4. Give the dark-mode sheet more presence

In dark mode the sheet is nearly indistinguishable from the page background;
the shadow reads as black-on-black. Lift the sheet a couple of shades above
the background and strengthen its border so the "page on a desk" metaphor
survives the theme.

### 5. Quieter, warmer status signals

"Draft autosaved at 11:29 PM" permanently displayed is the app talking about
itself. Replace with a brief "Saved ✓" that fades after ~2 seconds. Add
reading time to the counts ("53 words · 279 characters · 1 min read").

### 6. Warm up the palette and themes

- Tint the gray felt texture warmer with a CSS overlay so it stops reading
  gloomy.
- Make **Plain** (warm paper) the default theme — it photographs best.
- Add a **Midnight** theme: a deep, modern dark gradient, so dark-background
  writing is a choice rather than only an OS setting.

### 7. Manual light / dark / auto toggle

Users are currently locked to their OS color-scheme preference. Add a small
toggle (auto → light → dark) persisted with the other preferences.

### 8. Compress felt.png

`felt.png` is 1.5 MB — the whole rest of the app is ~20 KB. Recompress to
WebP (~100 KB target) and update references. The original stays in git
history.

### 9. Micro-polish

- `::selection` and `caret-color` in the accent color
- **Save** becomes a filled accent button; Load stays quiet
- ~200ms transitions when switching themes and fonts
- Visible `:focus-visible` rings; comfortable touch targets on mobile
- `hyphens: none`, a touch more top padding in the sheet
- Status bar text must not wrap on narrow screens

## Future ideas (not in this pass)

- Typewriter mode: keep the caret vertically centered while typing
- Session word count ("+312 today")
- Ambient audio, done properly this time
