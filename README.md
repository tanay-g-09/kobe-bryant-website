# 🐍 Kobe Bryant — The Black Mamba
### A Cinematic Premium Tribute Website

> *"The most important thing is to try and inspire people so that they can be great in whatever they want to do."*
> — Kobe Bean Bryant, 1978 – 2020

---

## Overview

A fully hand-coded, award-quality tribute website to Kobe Bryant — built without any JavaScript frameworks, CSS preprocessors, or component libraries. Pure HTML, CSS, and vanilla JS delivering a cinematic, documentary-style experience across four pages.

**Live feel:** Think ESPN Films meets Awwwards. Dark-first design, gold accents, Bebas Neue display type, smooth page transitions, and scroll-triggered animations throughout.

---

## Pages

| File | Page | Description |
|------|------|-------------|
| `index.html` | Home | Hero, stats, gallery, timeline, Mamba Mentality, quotes, legacy, tributes |
| `about.html` | About | Full biography, achievements grid, diptych panels, beyond-basketball section |
| `now.html` | Legacy | Memorial hero, Gianna section, living legacy dashboard, jersey retirement |
| `contact.html` | Contact | Validated contact form with EmailJS integration and fallback |

---

## File Structure

```
KobeBryant-Premium/
│
├── index.html          — Home page
├── about.html          — Biography page
├── now.html            — Legacy / memorial page
├── contact.html        — Contact form page
│
├── styles.css          — Main stylesheet (5,191 lines)
├── images.css          — Image focal points, Ken Burns, lazy-load states
├── main.js             — All interactions, animations, observers (2,028 lines)
├── transition.js       — Cinematic "24" page transition engine (386 lines)
│
├── EMAILJS_SETUP.md    — Step-by-step guide to activate contact form emails
│
└── img/                — All images in both .png and .webp formats
    ├── img-hero.png / .webp
    ├── img-spotlight.png / .webp
    ├── img-espn.png / .webp
    ├── img-thankyou.png / .webp
    ├── img-trophy2010.png / .webp
    ├── img-wave.png / .webp
    ├── img-locker.png / .webp
    ├── img-celtics.png / .webp
    ├── img-grid9.png / .webp
    ├── img-allstar2011.png / .webp
    ├── img-gianna-smile.png / .webp
    ├── img-mamba-academy.png / .webp
    ├── img-jersey-retire.png / .webp
    └── img-collage.png / .webp
```

> **Note:** Root-level `.png` files (e.g. `img-hero.png`) are fallbacks for older browsers. The `img/` folder contains the primary assets with `.webp` versions for modern browsers — always prefer `img/` paths.

---

## Features

### Visual & Animation
- **Cinematic page transitions** — A custom `24` overlay wipes in/out between every page navigation (820ms sequence, zero dependencies)
- **Hero parallax** — Background image drifts at 25% scroll speed; content fades at 65vh
- **Ken Burns effect** — Fullbleed sections scale from `1.06` to `1.0` over 8 seconds on scroll-in
- **Scroll reveal** — Every section, card, and timeline item enters via `IntersectionObserver` with staggered delays
- **Animated stat counters** — Numbers ease-count from 0 to target using a cubic bezier curve; pulse gold on completion
- **Quote word-by-word reveal** — Blockquote words animate in sequentially (40ms per word)
- **Particle canvas** — 55 floating gold particles on the hero (GPU-accelerated, reduced-motion safe)
- **Mamba wave canvas** — 5 layered sine waves animate in the Mamba Mentality section background

### Interaction
- **3D card tilt** — All cards `rotateX/Y` up to 9° following the cursor (desktop only)
- **Magnetic buttons** — CTA buttons drift toward the cursor within their bounding box
- **Custom cursor** — Gold dot + trailing ring with hover expansion and click press states
- **Gallery lightbox** — Click any gallery image to open a full-screen modal with keyboard/backdrop dismiss
- **Quote rotator** — Auto-plays every 5s, pauses on hover/focus, supports keyboard arrows and touch swipe
- **Diptych tap reveal** — Mobile touch reveals caption overlays on tap
- **Ambient sound toggle** — Arena crowd ambience generated via Web Audio API (off by default, in nav)
- **Back-to-top button** — Appears after 600px scroll, smooth scrolls with accessible focus management
- **Scroll progress bar** — 2px gold bar at top of viewport tracks reading progress

### Easter Eggs
- **Type "mamba"** — Triggers a gold flash animation across the page
- **4 AM mode** — Visit between 4–5 AM and a special badge appears in the hero: *"4 AM — Kobe's hour"*
- **Keyboard shortcuts** — Press `?` to open a shortcuts panel; `H/A/L/C` navigate between pages
- **Console signature** — Styled gold/purple Kobe tribute message in the browser console

### Performance
- **Page prefetch on hover** — Any nav link hovered triggers `<link rel="prefetch">` for instant subsequent navigation
- **`<picture>` + WebP** — Every image uses `<source type="image/webp">` with PNG fallback
- **`loading="lazy"`** — All below-the-fold images defer loading
- **`fetchpriority="high"`** — Hero image loads immediately, before the browser discovers it
- **`will-change: transform`** — Applied to all GPU-animated elements
- **`backface-visibility: hidden`** — Forces GPU compositing on animated cards
- **Session storage loader skip** — Returning visitors within the same session skip the full loader animation

### Accessibility
- **Skip link** — Keyboard-visible `Skip to content` link at page top
- **ARIA landmarks** — All major regions labelled (`role="main"`, `role="navigation"`, `aria-label`)
- **Focus trap** — Mobile nav captures Tab/Shift+Tab within the overlay
- **`aria-current="page"`** — Active nav link marked for screen readers
- **`prefers-reduced-motion`** — All animations disabled; elements appear immediately
- **Keyboard quote rotator** — Arrow keys navigate, Space pauses autoplay
- **Screen reader announcements** — Theme changes announced via `aria-live="polite"`

### SEO
- **OpenGraph tags** — `og:title`, `og:description`, `og:image`, `og:url`, `og:type` on all pages
- **Twitter Card** — `summary_large_image` card on all pages
- **Canonical URLs** — `<link rel="canonical">` on every page
- **JSON-LD structured data** — Schema.org `Person` + `WebPage` on index page
- **Meta description** — Unique per page
- **`theme-color`** — `#080808` for browser chrome on mobile

---

## Typography

| Role | Font | Weight |
|------|------|--------|
| Display / headings | Bebas Neue | 400 |
| Serif / body / quotes | Cormorant Garamond | 300, 400, 600 italic |
| Monospace / labels / UI | DM Mono | 300, 400 |

All fonts served via Google Fonts with `preconnect` for fastest load.

---

## Design Tokens (CSS Variables)

Defined in `:root` in `styles.css`:

```css
--gold:         #FDB927   /* Lakers gold — primary accent */
--purple:       #552583   /* Lakers purple — secondary accent */
--bg:           #080808   /* Near-black background */
--bg2:          #0d0d0d   /* Alternate section background */
--surface:      #111111   /* Card surface */
--surface2:     #161616   /* Elevated card surface */
--ink:          #f5f1ea   /* Primary text */
--ink-muted:    #9a9088   /* Secondary text */
--ink-dim:      #4a4540   /* Tertiary / decorative text */
--border:       rgba(255,255,255,.07)
--border-gold:  rgba(253,185,39,.2)
--font-display: 'Bebas Neue', Impact, sans-serif
--font-serif:   'Cormorant Garamond', Georgia, serif
--font-mono:    'DM Mono', 'Courier New', monospace
--ease-out:     cubic-bezier(0.16, 1, 0.3, 1)
--ease-bounce:  cubic-bezier(0.34, 1.56, 0.64, 1)
--side:         clamp(1.25rem, 5vw, 5rem)  /* Horizontal page padding */
```

Light theme overrides every variable when `[data-theme="light"]` is set on `<html>`.

---

## Page Transition System (`transition.js`)

The `KT24` engine intercepts all same-page `<a>` clicks and plays:

1. **Exit (820ms total)**
   - `0ms` — Dark panel wipes up from bottom of screen
   - `130ms` — Gold ring blooms behind the `24`
   - `140ms` — `24` scales in from 72% with bounce easing
   - `165ms` — `"Mamba Out"` subtitle fades in
   - `220ms` — Browser navigates to destination

2. **Enter (on new page)**
   - Overlay is already covering the screen
   - `24` fades out, panel drops down
   - Page content rises in with `translateY(18px) → 0`

**Fallback:** `prefers-reduced-motion` users get instant navigation. Back/forward browser buttons trigger only the enter animation.

---

## Contact Form Setup

The contact form requires a one-time EmailJS configuration to send real emails. Until configured, it falls back to opening the user's native mail app.

See **`EMAILJS_SETUP.md`** for the complete step-by-step guide.

**Quick summary:**
1. Create a free account at [emailjs.com](https://www.emailjs.com)
2. Connect your Gmail account
3. Create a template using the provided variable names
4. Paste your `publicKey`, `SERVICE_ID`, and `TEMPLATE_ID` into `contact.html`

---

## Running Locally

No build step. No Node. No bundler. Open directly in a browser:

```bash
# Option 1 — just open the file
open index.html

# Option 2 — local server (recommended, fixes some CORS behaviour)
npx serve .
# or
python3 -m http.server 8080
```

> **Recommended:** Use a local server rather than `file://` to ensure `<picture>` WebP sources and prefetch links resolve correctly.

---

## Browser Support

| Browser | Support |
|---------|---------|
| Chrome 90+ | ✅ Full |
| Firefox 88+ | ✅ Full |
| Safari 14+ | ✅ Full |
| Edge 90+ | ✅ Full |
| Safari iOS 14+ | ✅ Full (touch gestures) |
| Chrome Android | ✅ Full |

Custom cursor is disabled on touch/coarse-pointer devices. Parallax and canvas animations are disabled on `prefers-reduced-motion`.

---

## Deployment

The site is entirely static — drop all files into any static host:

| Host | Command / Method |
|------|-----------------|
| **Netlify** | Drag the folder into [app.netlify.com/drop](https://app.netlify.com/drop) |
| **Vercel** | `vercel --prod` in the project folder |
| **GitHub Pages** | Push to repo → Settings → Pages → Deploy from branch |
| **Cloudflare Pages** | Connect repo → build command: *(none)* → output: `/` |

No `.env` files. No server-side code. No database.

After deploying, update the `canonical` URLs in each HTML file's `<head>` from `https://kobe-tribute.com/` to your actual domain.

---

## Credits

- **Built by:** TanayG (2025)
- **Tribute to:** Kobe Bean Bryant — August 23, 1978 – January 26, 2020
- **Images:** Editorial / archival photographs
- **Fonts:** Google Fonts (Bebas Neue, Cormorant Garamond, DM Mono)
- **Contact delivery:** EmailJS (free tier)

> This is an unofficial fan tribute. Not affiliated with the Bryant family, Los Angeles Lakers, or the NBA.

---

## In Loving Memory

*Kobe Bean Bryant · Gianna Maria-Onore Bryant*
*1978 – 2020 · 2006 – 2020*

**Mamba Forever 🐍**

---

*Press `?` on any page for keyboard shortcuts.*
