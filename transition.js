/*!
 * ═══════════════════════════════════════════════════════════════
 *  KOBE BRYANT — THE BLACK MAMBA
 *  Page Transition System: "The Jump Shot"
 *
 *  Architecture:
 *   ┌──────────────────────────────────────────────────────────┐
 *   │  KobeTransition                                          │
 *   │   ├─ buildOverlay()    — creates DOM once, reuses       │
 *   │   ├─ buildSVG()        — Kobe silhouette + ball SVG     │
 *   │   ├─ buildParticles()  — canvas particle system         │
 *   │   ├─ play(href)        — full GSAP timeline sequence    │
 *   │   ├─ revealIn()        — entrance animation on load     │
 *   │   └─ intercept()       — hijacks all page-nav links     │
 *   │                                                          │
 *   │  Sequence (1.4s total):                                  │
 *   │   0.00 — overlay fades in + spotlight blooms            │
 *   │   0.18 — Kobe silhouette enters from bottom             │
 *   │   0.40 — gather / crouch                                │
 *   │   0.58 — JUMP — body lifts, knees tuck                  │
 *   │   0.76 — RELEASE — arm extends, ball leaves hand        │
 *   │   0.82 — ball arc across screen with light trail        │
 *   │   1.00 — screen brightens, page begins loading          │
 *   │   1.10 — cinematic wipe from arc trajectory             │
 *   │   1.40 — new page loaded, revealIn() plays              │
 *   └──────────────────────────────────────────────────────────┘
 *
 *  Dependencies: GSAP 3 (loaded via CDN in each HTML page)
 *  Fallback:     instant navigation if prefers-reduced-motion
 * ═══════════════════════════════════════════════════════════════
 */

(function (global) {
  'use strict';

  /* ── CONSTANTS ─────────────────────────────────────────── */
  const GOLD        = '#FDB927';
  const GOLD_DIM    = 'rgba(253,185,39,0.6)';
  const WHITE       = '#ffffff';
  const BG          = 'rgba(8,8,8,0.97)';
  const DURATION    = 1.45;            // total seconds
  const MOBILE_BREAKPOINT = 768;

  /* ── REDUCED MOTION CHECK ───────────────────────────────── */
  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── GSAP READINESS ────────────────────────────────────── */
  const gsapReady = () => typeof gsap !== 'undefined';

  /* ════════════════════════════════════════════════════════
     PARTICLE SYSTEM — lightweight canvas confetti/sparks
  ════════════════════════════════════════════════════════ */
  class ParticleSystem {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx    = canvas.getContext('2d');
      this.particles = [];
      this.raf    = null;
      this.active = false;
    }

    resize() {
      this.canvas.width  = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    /**
     * Burst particles from (x,y) along a parabolic arc direction.
     * type: 'trail' | 'burst' | 'sparks'
     */
    burst(x, y, type = 'trail', count = 22) {
      for (let i = 0; i < count; i++) {
        const angle  = type === 'trail'
          ? (-Math.PI * 0.55) + (Math.random() - 0.5) * 0.6
          : Math.random() * Math.PI * 2;
        const speed  = type === 'burst'
          ? Math.random() * 4 + 2
          : Math.random() * 3 + 1.5;
        const size   = Math.random() * (type === 'burst' ? 4 : 2.5) + 0.8;
        const life   = Math.random() * 0.5 + 0.4;
        this.particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (type === 'trail' ? 2 : 0),
          size,
          life,
          maxLife: life,
          color: Math.random() > 0.35 ? GOLD : WHITE,
          gravity: type === 'sparks' ? 0.15 : 0.08,
        });
      }
      if (!this.active) this._draw();
    }

    _draw() {
      this.active = true;
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.particles = this.particles.filter(p => {
        p.x  += p.vx;
        p.y  += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.97;
        p.life -= 0.025;

        const alpha = Math.max(0, p.life / p.maxLife);
        ctx.globalAlpha = alpha * 0.85;
        ctx.fillStyle   = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur  = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        ctx.fill();
        return p.life > 0;
      });

      ctx.globalAlpha = 1;
      ctx.shadowBlur  = 0;

      if (this.particles.length > 0) {
        this.raf = requestAnimationFrame(() => this._draw());
      } else {
        this.active = false;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
    }

    clear() {
      this.particles = [];
      cancelAnimationFrame(this.raf);
      this.active = false;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  /* ════════════════════════════════════════════════════════
     KOBE SVG SILHOUETTE — pure SVG, no raster images
     Anatomy:
       #kb-body    — torso + legs (main mass)
       #kb-arm     — shooting arm
       #kb-hand    — hand / wrist
       #kb-ball    — basketball
       #kb-shadow  — ground shadow
  ════════════════════════════════════════════════════════ */
  function buildKobeSVG() {
    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    const scale    = isMobile ? 0.68 : 1;
    const W = 220 * scale;
    const H = 340 * scale;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 220 340`);
    svg.setAttribute('width',  W);
    svg.setAttribute('height', H);
    svg.setAttribute('aria-hidden', 'true');
    svg.id = 'kobe-svg';
    svg.style.cssText = `
      position:absolute;
      bottom:0;
      left:50%;
      transform:translateX(-50%) translateY(100%);
      filter:drop-shadow(0 0 24px rgba(253,185,39,0.35));
      will-change:transform,opacity;
      pointer-events:none;
    `;

    svg.innerHTML = `
      <defs>
        <!-- Gold gradient for silhouette fill -->
        <linearGradient id="kg-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stop-color="#FDB927" stop-opacity="0.92"/>
          <stop offset="100%" stop-color="#c9881a" stop-opacity="0.75"/>
        </linearGradient>
        <!-- Spotlight beneath feet -->
        <radialGradient id="kg-spot" cx="50%" cy="100%" r="50%">
          <stop offset="0%"   stop-color="#FDB927" stop-opacity="0.22"/>
          <stop offset="100%" stop-color="#FDB927" stop-opacity="0"/>
        </radialGradient>
        <!-- Ball gradient -->
        <radialGradient id="kg-ball" cx="35%" cy="35%" r="65%">
          <stop offset="0%"   stop-color="#FDB927"/>
          <stop offset="60%"  stop-color="#e07b00"/>
          <stop offset="100%" stop-color="#a05000"/>
        </radialGradient>
        <!-- Ball glow -->
        <filter id="kg-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <!-- Silhouette glow -->
        <filter id="kg-sil-glow" x="-20%" y="-10%" width="140%" height="120%">
          <feGaussianBlur stdDeviation="4" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      <!-- Ground spotlight bloom -->
      <ellipse id="kb-shadow" cx="110" cy="332" rx="65" ry="10"
               fill="url(#kg-spot)" opacity="0.7"/>

      <!-- ── LEGS ── -->
      <g id="kb-legs" filter="url(#kg-sil-glow)">
        <!-- Left leg — slightly bent at launch -->
        <path id="kb-leg-l"
          d="M95 240 C88 265 82 285 78 320 L88 320 C91 290 97 268 104 244 Z"
          fill="url(#kg-body)"/>
        <!-- Right leg — drive leg, more extended -->
        <path id="kb-leg-r"
          d="M115 240 C122 262 128 282 134 318 L144 318 C137 280 130 258 122 244 Z"
          fill="url(#kg-body)"/>
        <!-- Shoes -->
        <ellipse cx="83"  cy="320" rx="12" ry="5" fill="#1a1a1a" opacity="0.9"/>
        <ellipse cx="139" cy="318" rx="12" ry="5" fill="#1a1a1a" opacity="0.9"/>
      </g>

      <!-- ── TORSO ── -->
      <g id="kb-torso" filter="url(#kg-sil-glow)">
        <!-- Main torso block -->
        <path id="kb-body-main"
          d="M88 140 C80 150 76 175 78 205 C80 230 86 245 95 252
             L115 254 C124 248 132 234 135 208 C138 178 135 152 128 140 Z"
          fill="url(#kg-body)"/>
        <!-- Jersey number 24 hint -->
        <text x="108" y="205" text-anchor="middle" font-family="'Bebas Neue',sans-serif"
              font-size="22" fill="rgba(8,8,8,0.55)" font-weight="700">24</text>
      </g>

      <!-- ── NON-SHOOTING ARM (left, slightly raised) ── -->
      <g id="kb-arm-off" filter="url(#kg-sil-glow)">
        <path d="M88 155 C74 162 65 178 62 198 C66 204 72 203 76 198
                 C79 182 86 168 94 162 Z"
              fill="url(#kg-body)"/>
      </g>

      <!-- ── SHOOTING ARM GROUP (animated) ── -->
      <g id="kb-arm-shoot" style="transform-origin:128px 148px" filter="url(#kg-sil-glow)">
        <!-- Upper arm -->
        <path id="kb-arm-upper"
          d="M128 148 C138 142 148 136 158 126 C162 121 160 115 156 113
             C150 120 140 128 130 136 Z"
          fill="url(#kg-body)"/>
        <!-- Forearm + wrist -->
        <path id="kb-arm-fore"
          d="M158 126 C168 118 176 110 182 100 C185 95 183 89 179 88
             C173 96 165 106 157 114 Z"
          fill="url(#kg-body)"/>
        <!-- Hand / fingers -->
        <g id="kb-hand">
          <ellipse cx="184" cy="86" rx="8" ry="6" fill="url(#kg-body)" transform="rotate(-20,184,86)"/>
          <!-- Finger details -->
          <path d="M180 82 C182 76 185 73 188 74" stroke="rgba(8,8,8,0.3)" stroke-width="1" fill="none"/>
          <path d="M183 80 C185 74 188 71 191 72" stroke="rgba(8,8,8,0.3)" stroke-width="1" fill="none"/>
        </g>
      </g>

      <!-- ── HEAD ── -->
      <g id="kb-head" filter="url(#kg-sil-glow)">
        <!-- Neck -->
        <rect x="103" y="120" width="14" height="24" rx="4" fill="url(#kg-body)"/>
        <!-- Head -->
        <ellipse id="kb-head-shape" cx="110" cy="108" rx="22" ry="24" fill="url(#kg-body)"/>
        <!-- Eyes — subtle -->
        <circle cx="103" cy="106" r="2.5" fill="rgba(8,8,8,0.45)"/>
        <circle cx="118" cy="106" r="2.5" fill="rgba(8,8,8,0.45)"/>
      </g>

      <!-- ── BASKETBALL ── -->
      <g id="kb-ball-group" filter="url(#kg-glow)">
        <circle id="kb-ball" cx="192" cy="72" r="20"
                fill="url(#kg-ball)" opacity="0.95"/>
        <!-- Ball lines -->
        <path d="M173 70 Q192 56 211 70" stroke="rgba(8,8,8,0.4)" stroke-width="1.2" fill="none"/>
        <path d="M173 74 Q192 88 211 74" stroke="rgba(8,8,8,0.4)" stroke-width="1.2" fill="none"/>
        <path d="M192 52 Q206 72 192 92"  stroke="rgba(8,8,8,0.4)" stroke-width="1.2" fill="none"/>
        <!-- Highlight -->
        <ellipse cx="185" cy="64" rx="5" ry="3.5" fill="rgba(255,255,255,0.25)"
                 transform="rotate(-25,185,64)"/>
      </g>

      <!-- ── MOTION BLUR STREAKS (hidden, revealed during jump) ── -->
      <g id="kb-streaks" opacity="0">
        <line x1="80"  y1="300" x2="75"  y2="340" stroke="${GOLD_DIM}" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="100" y1="295" x2="96"  y2="338" stroke="${GOLD_DIM}" stroke-width="1"   stroke-linecap="round"/>
        <line x1="120" y1="293" x2="117" y2="338" stroke="${GOLD_DIM}" stroke-width="1"   stroke-linecap="round"/>
        <line x1="140" y1="297" x2="137" y2="340" stroke="${GOLD_DIM}" stroke-width="1.5" stroke-linecap="round"/>
      </g>
    `;

    return svg;
  }

  /* ════════════════════════════════════════════════════════
     BALL ARC PATH — SVG path for ball trajectory
  ════════════════════════════════════════════════════════ */
  function buildBallArcSVG() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'kobe-arc-svg';
    svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = `
      position:fixed; inset:0; width:100%; height:100%;
      pointer-events:none; z-index:10002;
      overflow:visible;
    `;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Arc: starts at release point (65% x, 55% y), apexes at (80% x, 15% y), lands off-screen right
    const x0 = vw * 0.5 + 190, y0 = vh * 0.45;  // release
    const x1 = vw * 0.72,      y1 = vh * 0.08;   // apex
    const x2 = vw * 1.1,       y2 = vh * 0.55;   // off-screen

    svg.innerHTML = `
      <defs>
        <!-- Ball glow for arc -->
        <filter id="arc-glow">
          <feGaussianBlur stdDeviation="5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <!-- Light trail gradient -->
        <linearGradient id="trail-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stop-color="${GOLD}" stop-opacity="0"/>
          <stop offset="40%"  stop-color="${GOLD}" stop-opacity="0.7"/>
          <stop offset="100%" stop-color="${WHITE}" stop-opacity="0.9"/>
        </linearGradient>
      </defs>

      <!-- Arc path (invisible guide) -->
      <path id="arc-path"
        d="M ${x0} ${y0} Q ${x1} ${y1} ${x2} ${y2}"
        fill="none" stroke="none"/>

      <!-- Light trail along arc -->
      <path id="arc-trail"
        d="M ${x0} ${y0} Q ${x1} ${y1} ${x2} ${y2}"
        fill="none"
        stroke="url(#trail-grad)"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-dasharray="1 1000"
        stroke-dashoffset="0"
        opacity="0"/>

      <!-- Flying basketball -->
      <g id="arc-ball" filter="url(#arc-glow)" opacity="0"
         style="transform-origin: center">
        <circle r="18" fill="${GOLD}" opacity="0.95"/>
        <circle r="18" fill="none" stroke="rgba(8,8,8,0.35)" stroke-width="0"/>
        <!-- Ball seams -->
        <path d="M -16 0 Q 0 -12 16 0" stroke="rgba(8,8,8,0.4)" stroke-width="1.2" fill="none"/>
        <path d="M -16 0 Q 0  12 16 0"  stroke="rgba(8,8,8,0.4)" stroke-width="1.2" fill="none"/>
        <path d="M 0 -16 Q 10 0 0 16"   stroke="rgba(8,8,8,0.4)" stroke-width="1.2" fill="none"/>
        <!-- Highlight -->
        <ellipse cx="-5" cy="-6" rx="5" ry="3.5" fill="rgba(255,255,255,0.28)" transform="rotate(-20,-5,-6)"/>
      </g>

      <!-- Spotlight bloom at release -->
      <circle id="arc-bloom" cx="${x0}" cy="${y0}" r="0"
              fill="rgba(253,185,39,0.12)" opacity="0"/>

      <!-- Wipe reveal mask -->
      <rect id="wipe-rect" x="${-vw}" y="0" width="${vw}" height="${vh}"
            fill="rgba(8,8,8,0)" opacity="0"/>
    `;

    return svg;
  }

  /* ════════════════════════════════════════════════════════
     OVERLAY DOM — built once, reused for every transition
  ════════════════════════════════════════════════════════ */
  function buildOverlay() {
    const el = document.createElement('div');
    el.id = 'kt-overlay';
    el.setAttribute('aria-hidden', 'true');
    el.setAttribute('role', 'presentation');
    el.style.cssText = `
      position:fixed; inset:0; z-index:10000;
      pointer-events:none;
      opacity:0;
      will-change:opacity;
      overflow:hidden;
      background:${BG};
    `;

    /* Spotlight layer */
    const spotlight = document.createElement('div');
    spotlight.id = 'kt-spotlight';
    spotlight.style.cssText = `
      position:absolute;
      bottom:0; left:50%;
      transform:translateX(-50%);
      width:600px; height:400px;
      background:radial-gradient(ellipse at 50% 100%,
        rgba(253,185,39,0.18) 0%,
        rgba(253,185,39,0.06) 40%,
        transparent 70%
      );
      opacity:0;
      transition:opacity 0.4s ease;
      pointer-events:none;
    `;

    /* Court floor line — subtle */
    const courtLine = document.createElement('div');
    courtLine.id = 'kt-court';
    courtLine.style.cssText = `
      position:absolute;
      bottom:0; left:0; right:0;
      height:2px;
      background:linear-gradient(90deg,
        transparent 0%,
        rgba(253,185,39,0.15) 20%,
        rgba(253,185,39,0.35) 50%,
        rgba(253,185,39,0.15) 80%,
        transparent 100%
      );
      opacity:0;
    `;

    /* Particles canvas */
    const canvas = document.createElement('canvas');
    canvas.id = 'kt-canvas';
    canvas.style.cssText = `
      position:absolute; inset:0;
      width:100%; height:100%;
      pointer-events:none;
    `;

    /* Screen flash for release moment */
    const flash = document.createElement('div');
    flash.id = 'kt-flash';
    flash.style.cssText = `
      position:absolute; inset:0;
      background:rgba(253,185,39,0.0);
      pointer-events:none;
      will-change:opacity;
    `;

    /* Cinematic wipe panel — slides from arc trajectory */
    const wipe = document.createElement('div');
    wipe.id = 'kt-wipe';
    wipe.style.cssText = `
      position:absolute; inset:0;
      background:${BG};
      transform:translateY(100%);
      will-change:transform;
    `;

    el.appendChild(courtLine);
    el.appendChild(spotlight);
    el.appendChild(canvas);
    el.appendChild(flash);
    el.appendChild(wipe);

    return el;
  }

  /* ════════════════════════════════════════════════════════
     MAIN TRANSITION ENGINE
  ════════════════════════════════════════════════════════ */
  const KobeTransition = {

    overlay:   null,
    particles: null,
    arcSVG:    null,
    kobeSVG:   null,
    isPlaying: false,
    _resolveNav: null,

    /* ── Init — call once on DOMContentLoaded ── */
    init() {
      if (this.overlay) return; // already initialised

      this.overlay = buildOverlay();
      document.body.appendChild(this.overlay);

      /* Resize canvas */
      const canvas = this.overlay.querySelector('#kt-canvas');
      this.particles = new ParticleSystem(canvas);
      this.particles.resize();
      window.addEventListener('resize', () => this.particles.resize());

      this.intercept();
      this.revealIn();
    },

    /* ── Intercept all page navigation links ── */
    intercept() {
      /* Use event delegation so dynamically injected links are covered */
      document.addEventListener('click', e => {
        const link = e.target.closest('a[href]');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href) return;

        /* Skip: hash-only, external, mailto, tel, download */
        if (
          href.startsWith('#') ||
          href.startsWith('http') ||
          href.startsWith('mailto') ||
          href.startsWith('tel') ||
          link.hasAttribute('download') ||
          link.getAttribute('target') === '_blank'
        ) return;

        /* Skip: same page */
        const isSamePage = () => {
          try {
            const current = window.location.pathname.split('/').pop() || 'index.html';
            const target  = href.split('?')[0].split('#')[0];
            return current === target || (current === '' && target === 'index.html');
          } catch { return false; }
        };
        if (isSamePage()) return;

        /* Only intercept .html links or root-relative */
        if (!href.endsWith('.html') && !href.startsWith('/') && !href.match(/^[a-z]/i)) return;

        e.preventDefault();
        if (this.isPlaying) return;

        if (prefersReducedMotion() || !gsapReady()) {
          window.location.href = href;
          return;
        }

        this.play(href);
      }, { capture: true });

      /* Handle popstate (browser back/forward) */
      window.addEventListener('popstate', () => {
        if (prefersReducedMotion() || !gsapReady()) return;
        this.revealIn();
      });
    },

    /* ── Full jump-shot transition sequence ── */
    play(href) {
      if (this.isPlaying || !gsapReady()) {
        window.location.href = href;
        return;
      }
      this.isPlaying = true;

      const overlay   = this.overlay;
      const spotlight = overlay.querySelector('#kt-spotlight');
      const courtLine = overlay.querySelector('#kt-court');
      const flash     = overlay.querySelector('#kt-flash');
      const wipe      = overlay.querySelector('#kt-wipe');

      /* Build fresh SVGs each time (size may have changed) */
      if (this.kobeSVG) this.kobeSVG.remove();
      if (this.arcSVG)  this.arcSVG.remove();

      this.kobeSVG = buildKobeSVG();
      this.arcSVG  = buildBallArcSVG();

      overlay.appendChild(this.kobeSVG);
      document.body.appendChild(this.arcSVG); /* arc above overlay */

      /* Enable pointer events to block user input during transition */
      overlay.style.pointerEvents = 'all';

      /* Grab SVG children */
      const kobe      = this.kobeSVG;
      const armShoot  = kobe.querySelector('#kb-arm-shoot');
      const ball      = kobe.querySelector('#kb-ball-group');
      const shadow    = kobe.querySelector('#kb-shadow');
      const streaks   = kobe.querySelector('#kb-streaks');
      const head      = kobe.querySelector('#kb-head');
      const torso     = kobe.querySelector('#kb-torso');
      const legs      = kobe.querySelector('#kb-legs');
      const armOff    = kobe.querySelector('#kb-arm-off');

      const arcBall   = this.arcSVG.querySelector('#arc-ball');
      const arcTrail  = this.arcSVG.querySelector('#arc-trail');
      const arcBloom  = this.arcSVG.querySelector('#arc-bloom');

      /* Calculate ball release world position */
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const releaseX = vw * 0.5 + 190 * (window.innerWidth < MOBILE_BREAKPOINT ? 0.68 : 1);
      const releaseY = vh * 0.45;

      /* GSAP master timeline */
      const tl = gsap.timeline({
        onComplete: () => {
          /* Navigate after wipe */
          window.location.href = href;
        }
      });

      /* ── PHASE 0: Overlay fades in (0.00 – 0.20s) ── */
      tl.to(overlay, {
        opacity: 1,
        duration: 0.22,
        ease: 'power2.inOut',
      }, 0);

      tl.to(spotlight, {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
      }, 0.05);

      tl.to(courtLine, {
        opacity: 1,
        duration: 0.25,
        ease: 'power2.out',
      }, 0.08);

      /* ── PHASE 1: Kobe enters from bottom (0.18 – 0.45s) ── */
      tl.to(kobe, {
        y: '0%',          /* translateY: 100% → 0% */
        opacity: 1,
        duration: 0.32,
        ease: 'power3.out',
        onStart: () => {
          gsap.set(kobe, { opacity: 0 });
        }
      }, 0.18);

      /* ── PHASE 2: Gather / crouch (0.38 – 0.54s) ── */
      tl.to(kobe, {
        scaleY: 0.88,
        scaleX: 1.06,
        y: '4%',
        duration: 0.2,
        ease: 'power2.inOut',
        transformOrigin: 'bottom center',
      }, 0.38);

      /* Shadow grows with crouch */
      tl.to(shadow, {
        scaleX: 1.3,
        opacity: 1,
        duration: 0.2,
        ease: 'power2.inOut',
        transformOrigin: 'center',
      }, 0.38);

      /* Arm cocks back */
      tl.to(armShoot, {
        rotation: 12,
        duration: 0.18,
        ease: 'power2.inOut',
      }, 0.40);

      /* ── PHASE 3: JUMP — body lifts (0.54 – 0.72s) ── */
      tl.to(kobe, {
        scaleY: 1.06,
        scaleX: 0.95,
        y: '-28%',
        duration: 0.22,
        ease: 'power3.out',
        transformOrigin: 'bottom center',
      }, 0.54);

      /* Shadow shrinks as Kobe leaves the ground */
      tl.to(shadow, {
        scaleX: 0.5,
        opacity: 0.3,
        duration: 0.22,
        ease: 'power2.out',
        transformOrigin: 'center',
      }, 0.54);

      /* Motion blur streaks appear */
      tl.to(streaks, {
        opacity: 0.6,
        duration: 0.16,
        ease: 'power2.out',
      }, 0.54);

      /* Particles burst from feet */
      tl.add(() => {
        const kobeRect = kobe.getBoundingClientRect();
        const px = kobeRect.left + kobeRect.width / 2;
        const py = kobeRect.bottom;
        this.particles.burst(px, py, 'trail', 18);
      }, 0.56);

      /* ── PHASE 4: RELEASE — arm extends (0.68 – 0.80s) ── */
      tl.to(armShoot, {
        rotation: -38,
        duration: 0.18,
        ease: 'power4.out',
      }, 0.68);

      /* Head tilts back — following the shot */
      tl.to(head, {
        y: -4,
        rotation: -5,
        duration: 0.16,
        ease: 'power2.out',
        transformOrigin: '50% 100%',
      }, 0.70);

      /* Kobe body leans into release */
      tl.to(torso, {
        rotation: -6,
        duration: 0.18,
        ease: 'power2.out',
        transformOrigin: 'bottom center',
      }, 0.68);

      /* Streaks fade */
      tl.to(streaks, {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
      }, 0.72);

      /* ── PHASE 5: BALL SEPARATES — arc begins (0.76s) ── */
      /* Ball in hand group fades */
      tl.to(ball, {
        opacity: 0,
        scale: 0,
        duration: 0.12,
        ease: 'power2.in',
      }, 0.76);

      /* Arc ball appears at release point */
      tl.set(arcBall, {
        x: releaseX,
        y: releaseY,
        opacity: 0,
        scale: 0.7,
      }, 0.76);

      tl.to(arcBall, {
        opacity: 1,
        scale: 1,
        duration: 0.1,
        ease: 'power2.out',
      }, 0.76);

      /* Trail reveals */
      tl.to(arcTrail, {
        opacity: 1,
        strokeDasharray: '800 0',
        duration: 0.45,
        ease: 'power3.out',
      }, 0.78);

      /* Bloom at release */
      tl.to(arcBloom, {
        r: 120,
        opacity: 0.8,
        duration: 0.15,
        ease: 'power2.out',
      }, 0.76);

      tl.to(arcBloom, {
        r: 200,
        opacity: 0,
        duration: 0.25,
        ease: 'power2.in',
      }, 0.91);

      /* ── PHASE 6: Ball travels arc (0.78 – 1.15s) ── */
      /* Use MotionPath if available, else fallback to two tweens */
      if (typeof gsap.registerPlugin !== 'undefined' && typeof MotionPathPlugin !== 'undefined') {
        tl.to(arcBall, {
          motionPath: {
            path: '#arc-path',
            align: '#arc-path',
            alignOrigin: [0.5, 0.5],
          },
          rotation: 540,
          duration: 0.42,
          ease: 'power1.inOut',
        }, 0.78);
      } else {
        /* Manual arc interpolation */
        const arcX1 = vw * 0.72, arcY1 = vh * 0.08;
        const arcX2 = vw * 1.1,  arcY2 = vh * 0.55;

        tl.to(arcBall, {
          x: arcX1,
          y: arcY1,
          rotation: 270,
          duration: 0.22,
          ease: 'power2.out',
        }, 0.78);

        tl.to(arcBall, {
          x: arcX2,
          y: arcY2,
          rotation: 540,
          scale: 0.3,
          opacity: 0,
          duration: 0.22,
          ease: 'power2.in',
        }, 1.00);
      }

      /* Particle burst at apex */
      tl.add(() => {
        this.particles.burst(vw * 0.72, vh * 0.08, 'burst', 28);
        this.particles.burst(vw * 0.72, vh * 0.08, 'sparks', 16);
      }, 0.99);

      /* ── PHASE 7: Screen brightens (0.92 – 1.05s) ── */
      tl.to(flash, {
        backgroundColor: 'rgba(253,185,39,0.14)',
        duration: 0.13,
        ease: 'power2.out',
      }, 0.92);

      tl.to(flash, {
        backgroundColor: 'rgba(253,185,39,0.0)',
        duration: 0.22,
        ease: 'power2.in',
      }, 1.05);

      /* ── PHASE 8: Kobe dissolves (1.00s) ── */
      tl.to(kobe, {
        opacity: 0,
        y: '-50%',
        scale: 0.85,
        duration: 0.28,
        ease: 'power2.in',
      }, 1.00);

      tl.to(spotlight, {
        opacity: 0,
        duration: 0.25,
        ease: 'power2.in',
      }, 1.00);

      /* ── PHASE 9: Cinematic wipe (1.05 – 1.40s) ── */
      /* Wipe slides UP from bottom */
      tl.fromTo(wipe, {
        y: '100%',
      }, {
        y: '0%',
        duration: 0.38,
        ease: 'expo.inOut',
      }, 1.05);

      /* Arc elements fade */
      tl.to([arcTrail, arcBall], {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
      }, 1.10);

      /* Nav happens at 1.43s (onComplete) */

      return tl;
    },

    /* ── Page reveal on arrival ── */
    revealIn() {
      if (!gsapReady()) return;
      if (prefersReducedMotion()) return;

      /* Wait for DOM to be ready */
      const run = () => {
        const main = document.getElementById('main') || document.body;

        /* Page starts invisible (set by CSS class .kt-entering) */
        document.documentElement.classList.add('kt-entering');

        const tl = gsap.timeline({
          onComplete: () => {
            document.documentElement.classList.remove('kt-entering');
            this.isPlaying = false;
            /* Clean up arc SVG */
            const old = document.getElementById('kobe-arc-svg');
            if (old) old.remove();
            /* Re-enable pointer events */
            if (this.overlay) this.overlay.style.pointerEvents = 'none';
          }
        });

        /* Overlay wipe exits upward */
        if (this.overlay) {
          const wipe = this.overlay.querySelector('#kt-wipe');
          tl.to(wipe, {
            y: '-100%',
            duration: 0.5,
            ease: 'expo.inOut',
          }, 0);

          /* Overlay itself fades fully */
          tl.to(this.overlay, {
            opacity: 0,
            duration: 0.3,
            ease: 'power2.out',
          }, 0.3);
        }

        /* Page content slides up elegantly */
        tl.from(main, {
          y: 28,
          opacity: 0,
          duration: 0.55,
          ease: 'power3.out',
          clearProps: 'all',
        }, 0.15);
      };

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
      } else {
        /* Small delay to prevent flash */
        setTimeout(run, 20);
      }
    },

  }; /* end KobeTransition */

  /* ════════════════════════════════════════════════════════
     CSS injected into <head> — keeps overlay styles
     scoped and prevents FOUC
  ════════════════════════════════════════════════════════ */
  function injectStyles() {
    if (document.getElementById('kt-styles')) return;

    const style = document.createElement('style');
    style.id = 'kt-styles';
    style.textContent = `
      /* Prevent page flash during incoming transition */
      html.kt-entering #main,
      html.kt-entering main {
        opacity: 0;
        transform: translateY(20px);
      }

      /* Kobe SVG transitions */
      #kobe-svg {
        transform-box: fill-box;
      }
      #kb-arm-shoot {
        transform-box: fill-box;
        transform-origin: 128px 148px;
      }
      #kb-ball-group {
        transform-box: fill-box;
        transform-origin: center;
      }
      #kb-head {
        transform-box: fill-box;
        transform-origin: center bottom;
      }
      #kb-torso {
        transform-box: fill-box;
        transform-origin: center bottom;
      }
      #arc-ball {
        transform-box: fill-box;
        transform-origin: center center;
      }

      /* Overlay visibility helpers */
      #kt-overlay {
        pointer-events: none;
      }

      /* Reduced motion: skip everything */
      @media (prefers-reduced-motion: reduce) {
        #kt-overlay,
        #kobe-arc-svg { display: none !important; }
      }
    `;
    document.head.appendChild(style);
  }

  /* ════════════════════════════════════════════════════════
     BOOTSTRAP — auto-init when GSAP is ready
  ════════════════════════════════════════════════════════ */
  function bootstrap() {
    injectStyles();

    if (gsapReady()) {
      KobeTransition.init();
    } else {
      /* GSAP not yet loaded — retry */
      let retries = 0;
      const check = setInterval(() => {
        retries++;
        if (gsapReady()) {
          clearInterval(check);
          KobeTransition.init();
        } else if (retries > 40) {
          /* Give up after 2s — navigation still works without animation */
          clearInterval(check);
          console.warn('[KobeTransition] GSAP not found — falling back to standard navigation.');
        }
      }, 50);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }

  /* Expose for debugging */
  global.KobeTransition = KobeTransition;

})(window);
