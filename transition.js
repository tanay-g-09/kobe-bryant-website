/*!
 * ══════════════════════════════════════════════════════════
 *  KOBE BRYANT — "24" Page Transition
 *
 *  Clean, cinematic, premium. The number 24 is the hero.
 *  No GSAP required. Pure CSS + requestAnimationFrame.
 *
 *  Sequence (820ms total):
 *   0ms   — overlay wipes up from bottom (court-floor style)
 *  140ms  — "24" scales in from 0, gold glow blooms
 *  180ms  — "MAMBA OUT" subtitle fades in
 *  360ms  — page navigates to destination
 *   ---   — new page: overlay drops down, content rises in
 *  820ms  — transition fully complete, overlay removed
 *
 *  Works on:  all pages → all pages
 *  Fallback:  prefers-reduced-motion → instant navigation
 *  History:   back/forward button triggers reveal-in only
 * ══════════════════════════════════════════════════════════
 */
(function (W) {
  'use strict';

  /* ── guard ── */
  const noMotion = () => W.matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* ── CSS — injected once, never duplicated ── */
  function injectCSS() {
    if (document.getElementById('kt24-css')) return;
    const s = document.createElement('style');
    s.id = 'kt24-css';
    s.textContent = `
      /* ── Overlay panel ── */
      #kt24-overlay {
        position: fixed;
        inset: 0;
        z-index: 19999;
        pointer-events: none;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0;
        overflow: hidden;
        /* Dark panel with subtle grain */
        background:
          url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='.045'/%3E%3C/svg%3E"),
          #080808;
        background-size: 200px, cover;
        transform: translateY(100%);
        will-change: transform;
      }

      /* ── Entry: panel slides UP from below ── */
      #kt24-overlay.kt24-enter {
        transform: translateY(0%);
        transition: transform 0.38s cubic-bezier(0.76, 0, 0.24, 1);
      }

      /* ── Exit: panel drops DOWN out of view ── */
      #kt24-overlay.kt24-exit {
        transform: translateY(-100%);
        transition: transform 0.42s cubic-bezier(0.76, 0, 0.24, 1);
      }

      /* ── Gold court line at the base of the panel ── */
      #kt24-overlay::before {
        content: '';
        position: absolute;
        bottom: 0; left: 0; right: 0;
        height: 2px;
        background: linear-gradient(
          90deg,
          transparent 0%,
          rgba(253,185,39,0.15) 15%,
          rgba(253,185,39,0.55) 50%,
          rgba(253,185,39,0.15) 85%,
          transparent 100%
        );
        opacity: 0;
        transition: opacity 0.3s 0.12s ease;
      }
      #kt24-overlay.kt24-enter::before { opacity: 1; }

      /* ── The "24" numeral ── */
      #kt24-num {
        font-family: 'Bebas Neue', Impact, sans-serif;
        font-size: clamp(7rem, 22vw, 16rem);
        line-height: 0.88;
        letter-spacing: -0.02em;
        color: #FDB927;
        opacity: 0;
        transform: scale(0.72);
        will-change: transform, opacity;
        /* Glow */
        text-shadow:
          0 0 60px rgba(253,185,39,0.35),
          0 0 120px rgba(253,185,39,0.15);
      }
      #kt24-num.kt24-num-in {
        opacity: 1;
        transform: scale(1);
        transition:
          opacity 0.22s ease-out,
          transform 0.38s cubic-bezier(0.34, 1.42, 0.64, 1);
      }
      #kt24-num.kt24-num-out {
        opacity: 0;
        transform: scale(1.12);
        transition:
          opacity 0.18s ease-in,
          transform 0.24s ease-in;
      }

      /* ── "MAMBA OUT" sub-label ── */
      #kt24-sub {
        font-family: 'DM Mono', 'Courier New', monospace;
        font-size: clamp(0.6rem, 1.4vw, 0.78rem);
        font-weight: 400;
        letter-spacing: 0.32em;
        text-transform: uppercase;
        color: rgba(253,185,39,0.48);
        opacity: 0;
        transform: translateY(8px);
        will-change: transform, opacity;
        margin-top: 0.5rem;
      }
      #kt24-sub.kt24-sub-in {
        opacity: 1;
        transform: translateY(0);
        transition: opacity 0.28s 0.16s ease-out, transform 0.28s 0.16s ease-out;
      }
      #kt24-sub.kt24-sub-out {
        opacity: 0;
        transition: opacity 0.16s ease-in;
      }

      /* ── Gold ring bloom behind the 24 ── */
      #kt24-ring {
        position: absolute;
        top: 50%;
        left: 50%;
        width: clamp(160px, 35vw, 320px);
        height: clamp(160px, 35vw, 320px);
        transform: translate(-50%, -50%) scale(0);
        border-radius: 50%;
        background: radial-gradient(
          ellipse at center,
          rgba(253,185,39,0.10) 0%,
          rgba(253,185,39,0.04) 40%,
          transparent 70%
        );
        pointer-events: none;
      }
      #kt24-ring.kt24-ring-in {
        transform: translate(-50%, -50%) scale(1);
        transition: transform 0.5s 0.08s cubic-bezier(0.34, 1.2, 0.64, 1);
      }

      /* ── Page content during transitions ── */
      html.kt24-leaving  main,
      html.kt24-leaving  #main { opacity: 1; }

      html.kt24-arriving main,
      html.kt24-arriving #main {
        opacity: 0;
        transform: translateY(18px);
      }
      html.kt24-arrived  main,
      html.kt24-arrived  #main {
        opacity: 1;
        transform: translateY(0);
        transition: opacity 0.55s 0.08s ease-out,
                    transform 0.55s 0.08s cubic-bezier(0.16, 1, 0.3, 1);
      }

      /* ── Accessibility ── */
      @media (prefers-reduced-motion: reduce) {
        #kt24-overlay,
        #kt24-overlay.kt24-enter,
        #kt24-overlay.kt24-exit { transition: none !important; }
        html.kt24-arriving main,
        html.kt24-arriving #main,
        html.kt24-arrived  main,
        html.kt24-arrived  #main { transition: none !important; opacity: 1 !important; transform: none !important; }
      }
    `;
    document.head.appendChild(s);
  }

  /* ── Build overlay DOM — created fresh each session ── */
  function buildOverlay() {
    const existing = document.getElementById('kt24-overlay');
    if (existing) return existing;

    const el = document.createElement('div');
    el.id = 'kt24-overlay';
    el.setAttribute('aria-hidden', 'true');
    el.setAttribute('role', 'presentation');

    const ring = document.createElement('div');
    ring.id = 'kt24-ring';

    const num = document.createElement('div');
    num.id = 'kt24-num';
    num.textContent = '24';

    const sub = document.createElement('div');
    sub.id = 'kt24-sub';
    sub.textContent = 'Mamba Out';

    el.appendChild(ring);
    el.appendChild(num);
    el.appendChild(sub);
    document.body.appendChild(el);
    return el;
  }

  /* ── Utility: raf-based timeout ── */
  function wait(ms) {
    return new Promise(res => setTimeout(res, ms));
  }

  /* ── EXIT ANIMATION — play when leaving a page ── */
  async function playExit(href) {
    if (noMotion()) { W.location.href = href; return; }

    const overlay = buildOverlay();
    const num     = overlay.querySelector('#kt24-num');
    const sub     = overlay.querySelector('#kt24-sub');
    const ring    = overlay.querySelector('#kt24-ring');

    // Ensure clean start state
    overlay.classList.remove('kt24-exit');
    num.classList.remove('kt24-num-in', 'kt24-num-out');
    sub.classList.remove('kt24-sub-in', 'kt24-sub-out');
    ring.classList.remove('kt24-ring-in');
    overlay.style.transform = 'translateY(100%)';
    overlay.style.transition = '';

    // Block input
    overlay.style.pointerEvents = 'all';

    // Slight delay before panel rises — cinematic pause
    await wait(20);

    // 1. Panel wipes up
    overlay.classList.add('kt24-enter');

    await wait(130);

    // 2. Ring blooms behind number
    ring.classList.add('kt24-ring-in');

    // 3. "24" pops in
    num.classList.add('kt24-num-in');

    await wait(165);

    // 4. Sub-label fades in
    sub.classList.add('kt24-sub-in');

    await wait(220);

    // 5. Navigate — new page starts loading under overlay
    W.location.href = href;
  }

  /* ── ENTER ANIMATION — play when new page is ready ── */
  async function playEnter() {
    if (noMotion()) {
      document.documentElement.classList.remove('kt24-arriving');
      return;
    }

    const overlay = buildOverlay();
    const num     = overlay.querySelector('#kt24-num');
    const sub     = overlay.querySelector('#kt24-sub');
    const ring    = overlay.querySelector('#kt24-ring');

    // Panel is currently covering the screen (set by arriving class)
    // Make sure it's in the "entered" position
    overlay.style.transform   = 'translateY(0)';
    overlay.style.transition  = 'none';
    overlay.style.pointerEvents = 'all';
    num.classList.add('kt24-num-in');
    sub.classList.add('kt24-sub-in');
    ring.classList.add('kt24-ring-in');

    // New page content is hidden
    document.documentElement.classList.add('kt24-arriving');

    await wait(40);

    // Number fades out
    num.classList.add('kt24-num-out');
    sub.classList.add('kt24-sub-out');
    ring.classList.remove('kt24-ring-in');

    await wait(120);

    // Panel drops down revealing the new page
    overlay.classList.remove('kt24-enter');
    overlay.classList.add('kt24-exit');

    // Reveal page content with rise animation
    document.documentElement.classList.remove('kt24-arriving');
    document.documentElement.classList.add('kt24-arrived');

    await wait(440);

    // Clean up
    document.documentElement.classList.remove('kt24-arrived');
    overlay.classList.remove('kt24-exit', 'kt24-enter');
    overlay.style.pointerEvents = 'none';
    overlay.style.transform = 'translateY(100%)';
    overlay.style.transition = '';
    num.classList.remove('kt24-num-in', 'kt24-num-out');
    sub.classList.remove('kt24-sub-in', 'kt24-sub-out');
  }

  /* ── INTERCEPT all same-site navigation ── */
  function intercept() {
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href]');
      if (!a) return;

      const href = a.getAttribute('href') || '';

      // Skip: external, anchors, mailto, tel, download, new tab
      if (
        href.startsWith('http') ||
        href.startsWith('//') ||
        href.startsWith('#') ||
        href.startsWith('mailto') ||
        href.startsWith('tel') ||
        a.hasAttribute('download') ||
        a.getAttribute('target') === '_blank'
      ) return;

      // Skip non-HTML links
      if (!/\.html?$|^[a-z][a-z0-9-]*$/.test(href) && !href.startsWith('/') && !href.startsWith('./')) return;

      // Skip: same page
      try {
        const current = W.location.pathname.split('/').pop() || 'index.html';
        const target  = href.split('?')[0].split('#')[0];
        if (current === target) return;
        if (current === '' && (target === 'index.html' || target === '/')) return;
      } catch (_) {}

      e.preventDefault();
      if (noMotion()) { W.location.href = href; return; }
      playExit(href);
    }, true);

    // Back/forward: just run enter animation on the revealed page
    W.addEventListener('popstate', () => {
      if (!noMotion()) playEnter();
    });
  }

  /* ── Bootstrap ── */
  function init() {
    injectCSS();
    buildOverlay(); // Pre-build so first transition is instant
    intercept();
    // Run enter animation on every page load
    // (handles both direct visits and navigations)
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', playEnter);
    } else {
      playEnter();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for debugging
  W.KT24 = { playExit, playEnter };

})(window);
