/*!
 * ═══════════════════════════════════════════════════════════════════
 *  KOBE BRYANT — THE BLACK MAMBA
 *  Page Transition v4: "The Shot"
 *
 *  Reference: Staples Center arena, Kobe's mid-range fadeaway,
 *             NBA All-Star 2011 Los Angeles, championship moments
 *
 *  Scene layout (left→right, bottom→top):
 *
 *       [HOOP + NET + BACKBOARD]           ← top-right quadrant
 *                   🏀  ← ball arcs from player to hoop
 *
 *       [COURT LINE + CROWD BOKEH]
 *       [KOBE SILHOUETTE — fadeaway]       ← bottom-left
 *
 *  Sequence (1.8s):
 *   0.00  Arena environment fades in (floor, crowd bokeh, spotlight)
 *   0.20  Kobe silhouette rises — gathering, ball in both hands
 *   0.45  Jump — off one foot, classic Kobe off-balance fadeaway
 *   0.60  Body leans back (fadeaway), shooting arm rises
 *   0.72  RELEASE — wrist flick, perfect follow-through, ball leaves
 *   0.80  Ball ascends in clean parabolic arc toward hoop
 *   1.05  Ball reaches apex — crowd flash cameras burst (particles)
 *   1.15  Ball descends into hoop — passes through net
 *   1.25  NET SWISH animation — chains ripple
 *   1.30  Arena flashes white (basket scored)
 *   1.40  Cinematic iris/wipe from hoop center outward
 *   1.80  New page revealed
 * ═══════════════════════════════════════════════════════════════════
 */

(function (global) {
  'use strict';

  /* ── PALETTE ──────────────────────────────────────────────────── */
  const C = {
    gold:       '#FDB927',
    goldDim:    'rgba(253,185,39,0.5)',
    purple:     '#552583',
    bg:         '#070707',
    bgMid:      '#0d0d0d',
    court:      '#C68B2D',
    courtLine:  'rgba(255,255,255,0.18)',
    crowd:      'rgba(255,255,255,0.06)',
    ballOrange: '#E8702A',
    ballDark:   '#9B3A00',
    netWhite:   'rgba(230,230,230,0.85)',
    boardWhite: 'rgba(245,245,245,0.92)',
    spotlight:  'rgba(253,185,39,0.14)',
  };

  const DURATION = 1.85;
  const isMobile = () => window.innerWidth < 768;
  const noMotion = () => window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  const hasGSAP  = () => typeof gsap !== 'undefined';

  /* ══════════════════════════════════════════════════════════════
     PARTICLE SYSTEM — camera flashes + court dust + net sparks
  ══════════════════════════════════════════════════════════════ */
  class Sparks {
    constructor(canvas) {
      this.c   = canvas;
      this.ctx = canvas.getContext('2d');
      this.pts = [];
      this.raf = null;
      this.on  = false;
    }
    resize() {
      this.c.width  = window.innerWidth;
      this.c.height = window.innerHeight;
    }
    flash(x, y, style = 'camera', n = 24) {
      /* camera flashes: white bokeh circles that pop and fade */
      /* swish sparks: golden short streaks downward */
      for (let i = 0; i < n; i++) {
        const angle = style === 'camera'
          ? Math.random() * Math.PI * 2
          : (Math.PI * 0.4) + (Math.random() - 0.5) * 1.2;
        const spd = style === 'camera'
          ? Math.random() * 5 + 2
          : Math.random() * 3 + 1;
        this.pts.push({
          x, y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          r:  style === 'camera' ? Math.random() * 4 + 1.5 : Math.random() * 2 + 0.8,
          life: Math.random() * 0.55 + 0.35,
          maxLife: 0,
          color: style === 'camera'
            ? (Math.random() > 0.5 ? '#ffffff' : C.gold)
            : C.gold,
          grav: style === 'swish' ? 0.12 : 0.04,
          style,
        });
        this.pts[this.pts.length-1].maxLife = this.pts[this.pts.length-1].life;
      }
      if (!this.on) this._tick();
    }
    _tick() {
      this.on = true;
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.c.width, this.c.height);
      this.pts = this.pts.filter(p => {
        p.x += p.vx; p.y += p.vy;
        p.vy += p.grav; p.vx *= 0.96;
        p.life -= 0.022;
        const a = Math.max(0, p.life / p.maxLife);
        ctx.globalAlpha = a * 0.9;
        if (p.style === 'camera') {
          /* Bokeh circle */
          ctx.shadowBlur  = 12;
          ctx.shadowColor = p.color;
          ctx.fillStyle   = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * a, 0, Math.PI * 2);
          ctx.fill();
        } else {
          /* Short gold streak */
          ctx.strokeStyle = p.color;
          ctx.lineWidth   = p.r;
          ctx.lineCap     = 'round';
          ctx.shadowBlur  = 6;
          ctx.shadowColor = C.gold;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 3, p.y - p.vy * 3);
          ctx.stroke();
        }
        return p.life > 0;
      });
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;
      if (this.pts.length) this.raf = requestAnimationFrame(() => this._tick());
      else { this.on = false; ctx.clearRect(0, 0, this.c.width, this.c.height); }
    }
    clear() {
      this.pts = [];
      cancelAnimationFrame(this.raf);
      this.on = false;
      this.ctx.clearRect(0, 0, this.c.width, this.c.height);
    }
  }

  /* ══════════════════════════════════════════════════════════════
     ARENA BACKGROUND SVG
     - Hardwood court floor with key/paint area
     - Crowd bokeh dots in the background
     - Arena ceiling lights
     - Scoreboard/jumbotron silhouette
  ══════════════════════════════════════════════════════════════ */
  function buildArenaSVG(vw, vh) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox', `0 0 ${vw} ${vh}`);
    svg.setAttribute('width', vw); svg.setAttribute('height', vh);
    svg.setAttribute('aria-hidden','true');
    svg.style.cssText = `position:absolute;inset:0;pointer-events:none;`;
    svg.id = 'kt-arena';

    /* Court Y position — bottom 45% of screen */
    const courtY = vh * 0.55;
    const floorH = vh - courtY;

    /* Crowd bokeh — randomised soft circles */
    let bokeh = '';
    for (let i = 0; i < 120; i++) {
      const cx = Math.random() * vw;
      const cy = Math.random() * (courtY * 0.85);
      const r  = Math.random() * 3.5 + 0.8;
      const o  = Math.random() * 0.18 + 0.04;
      const col = Math.random() > 0.6 ? '#ffffff' : (Math.random() > 0.5 ? C.gold : C.purple);
      bokeh += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="${col}" opacity="${o.toFixed(2)}"/>`;
    }

    /* Larger diffuse arena lights */
    let lights = '';
    const lightPositions = [
      [vw*0.12,vh*0.05], [vw*0.3,vh*0.03], [vw*0.55,vh*0.04],
      [vw*0.72,vh*0.06], [vw*0.88,vh*0.04],
    ];
    lightPositions.forEach(([lx,ly]) => {
      lights += `<circle cx="${lx.toFixed(0)}" cy="${ly.toFixed(0)}" r="28" fill="rgba(255,255,240,0.06)"/>`;
      lights += `<circle cx="${lx.toFixed(0)}" cy="${ly.toFixed(0)}" r="8"  fill="rgba(255,255,230,0.18)"/>`;
    });

    svg.innerHTML = `
      <defs>
        <!-- Court wood gradient -->
        <linearGradient id="ar-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stop-color="#C8882C" stop-opacity="0.92"/>
          <stop offset="60%"  stop-color="#A06820" stop-opacity="0.85"/>
          <stop offset="100%" stop-color="#7A4C10" stop-opacity="0.9"/>
        </linearGradient>
        <!-- Crowd fade -->
        <linearGradient id="ar-crowd" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stop-color="${C.bgMid}" stop-opacity="0.5"/>
          <stop offset="100%" stop-color="${C.bgMid}" stop-opacity="0.82"/>
        </linearGradient>
        <!-- Center spotlight on court -->
        <radialGradient id="ar-spot" cx="50%" cy="0%" r="70%">
          <stop offset="0%"   stop-color="${C.gold}"  stop-opacity="0.18"/>
          <stop offset="100%" stop-color="${C.gold}"  stop-opacity="0"/>
        </radialGradient>
        <!-- Floor perspective -->
        <linearGradient id="ar-floorpersp" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stop-color="rgba(0,0,0,0)"   />
          <stop offset="100%" stop-color="rgba(0,0,0,0.55)"/>
        </linearGradient>
      </defs>

      <!-- ── CROWD BACKGROUND ── -->
      <rect x="0" y="0" width="${vw}" height="${courtY}" fill="${C.bgMid}"/>
      ${bokeh}
      ${lights}
      <rect x="0" y="0" width="${vw}" height="${courtY}" fill="url(#ar-crowd)"/>

      <!-- Jumbotron silhouette -->
      <rect x="${vw*0.35}" y="${vh*0.01}" width="${vw*0.3}" height="${vh*0.1}" rx="6"
            fill="rgba(20,20,20,0.7)" stroke="rgba(253,185,39,0.12)" stroke-width="1"/>
      <text x="${vw*0.5}" y="${vh*0.07}" text-anchor="middle"
            font-family="'Bebas Neue',sans-serif" font-size="${isMobile()?'14':'20'}"
            fill="rgba(253,185,39,0.5)" letter-spacing="4">STAPLES CENTER</text>

      <!-- ── HARDWOOD FLOOR ── -->
      <rect x="0" y="${courtY}" width="${vw}" height="${floorH}" fill="url(#ar-floor)"/>

      <!-- Floor wood grain lines -->
      ${Array.from({length:22},(_,i)=>{
        const y = courtY + (i/22)*floorH;
        return `<line x1="0" y1="${y.toFixed(1)}" x2="${vw}" y2="${y.toFixed(1)}"
                  stroke="rgba(0,0,0,0.08)" stroke-width="0.7"/>`;
      }).join('')}

      <!-- Three-point arc perspective -->
      <ellipse cx="${vw*0.3}" cy="${courtY}" rx="${vw*0.36}" ry="${vh*0.09}"
               fill="none" stroke="${C.courtLine}" stroke-width="1.5" opacity="0.7"
               stroke-dasharray="4 4"/>

      <!-- Free-throw lane (paint) -->
      <rect x="${vw*0.12}" y="${courtY}" width="${vw*0.2}" height="${floorH*0.7}"
            fill="rgba(85,37,131,0.18)" stroke="${C.courtLine}" stroke-width="1"/>

      <!-- Free-throw circle -->
      <ellipse cx="${vw*0.22}" cy="${courtY}" rx="${vw*0.085}" ry="${vh*0.035}"
               fill="none" stroke="${C.courtLine}" stroke-width="1.2"/>

      <!-- Lakers center-court logo hint -->
      <circle cx="${vw*0.5}" cy="${courtY + floorH*0.4}" r="${Math.min(vw,vh)*0.08}"
              fill="none" stroke="rgba(253,185,39,0.1)" stroke-width="1.5"/>

      <!-- Court spotlight from above -->
      <rect x="0" y="${courtY}" width="${vw}" height="${floorH}"
            fill="url(#ar-spot)" opacity="0.6"/>
      <rect x="0" y="${courtY}" width="${vw}" height="${floorH}"
            fill="url(#ar-floorpersp)"/>
    `;
    return svg;
  }

  /* ══════════════════════════════════════════════════════════════
     KOBE SILHOUETTE SVG — full fadeaway jump-shot anatomy
     Faithful to Kobe's form:
     • Off one foot (right foot plant, body fades right-back)
     • Left arm guide hand drops early
     • Right arm fully extended overhead
     • Wrist fully cocked back (the "L" position)
     • Head tilted back following ball
     • Jersey #24, Lakers gold
  ══════════════════════════════════════════════════════════════ */
  function buildKobeSVG() {
    const scale = isMobile() ? 0.72 : 1;
    const W = Math.round(260 * scale);
    const H = Math.round(400 * scale);

    const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.id = 'kt-kobe';
    svg.setAttribute('viewBox','0 0 260 400');
    svg.setAttribute('width', W);
    svg.setAttribute('height', H);
    svg.setAttribute('aria-hidden','true');
    svg.style.cssText = `
      position:absolute;
      bottom:0;
      left: ${isMobile() ? '8%' : '12%'};
      transform: translateY(110%);
      filter: drop-shadow(0 0 28px rgba(253,185,39,0.38))
              drop-shadow(0 8px 40px rgba(0,0,0,0.8));
      will-change: transform, opacity, filter;
      pointer-events: none;
      transform-origin: bottom center;
    `;

    svg.innerHTML = `
      <defs>
        <linearGradient id="kg-gold" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%"  stop-color="#FDD05A" stop-opacity="0.95"/>
          <stop offset="55%" stop-color="#FDB927" stop-opacity="0.90"/>
          <stop offset="100%"stop-color="#C07010" stop-opacity="0.82"/>
        </linearGradient>
        <linearGradient id="kg-purple" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stop-color="#7040B0" stop-opacity="0.9"/>
          <stop offset="100%"stop-color="#3D1870" stop-opacity="0.8"/>
        </linearGradient>
        <radialGradient id="kg-shadow-gr" cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stop-color="rgba(253,185,39,0.28)"/>
          <stop offset="100%"stop-color="rgba(253,185,39,0)"/>
        </radialGradient>
        <filter id="kg-glow" x="-30%" y="-20%" width="160%" height="140%">
          <feGaussianBlur stdDeviation="3.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="kg-blur-light" x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur stdDeviation="1.2"/>
        </filter>
      </defs>

      <!-- ── GROUND SHADOW (scales with jump) ── -->
      <ellipse id="kb-shd" cx="100" cy="395" rx="55" ry="7"
               fill="url(#kg-shadow-gr)" opacity="0.6"/>

      <!-- ── SHOES ── -->
      <!-- Right shoe (plant foot — more visible) -->
      <g id="kb-shoe-r">
        <path d="M85 360 C80 362 70 364 65 363 C60 362 58 358 62 355
                 C68 352 80 353 90 355 Z"
              fill="#1A1A1A"/>
        <!-- Nike swoosh hint -->
        <path d="M66 360 C70 357 76 356 82 357"
              stroke="rgba(253,185,39,0.5)" stroke-width="1.2" fill="none" stroke-linecap="round"/>
        <!-- Sole accent -->
        <rect x="62" y="360" width="28" height="4" rx="2" fill="#2A2A2A"/>
      </g>
      <!-- Left shoe (follow-through, slightly lifted) -->
      <g id="kb-shoe-l">
        <path d="M115 368 C112 370 106 372 101 371 C97 370 96 366 99 363
                 C104 360 114 361 119 364 Z"
              fill="#1A1A1A"/>
        <path d="M101 368 C104 365 110 364 116 365"
              stroke="rgba(253,185,39,0.5)" stroke-width="1.2" fill="none" stroke-linecap="round"/>
      </g>

      <!-- ── LEGS — fadeaway form: body tilts back-right ── -->
      <g id="kb-legs" filter="url(#kg-glow)">
        <!-- Right leg (plant leg, bent at knee, powering upward) -->
        <path id="kb-leg-r-lower"
          d="M102 280 C100 305 92 330 85 358 L96 360 C104 335 112 308 114 283 Z"
          fill="url(#kg-gold)"/>
        <!-- Right knee highlight -->
        <ellipse cx="100" cy="298" rx="9" ry="7" fill="url(#kg-gold)" opacity="0.7"/>
        <!-- Left leg (follow-through, slightly bent back) -->
        <path id="kb-leg-l-lower"
          d="M118 275 C121 300 120 330 114 365 L124 366 C131 332 132 300 129 275 Z"
          fill="url(#kg-gold)"/>
        <!-- Shorts lower edge -->
        <path d="M92 252 C90 265 90 278 95 285 L130 285 C134 278 134 265 132 252 Z"
              fill="url(#kg-purple)" opacity="0.9"/>
      </g>

      <!-- ── SHORTS ── -->
      <g id="kb-shorts">
        <path d="M88 205 C84 220 84 240 88 255 L135 255 C139 240 139 220 135 205 Z"
              fill="url(#kg-purple)"/>
        <!-- Shorts side stripe -->
        <path d="M88 210 L88 254" stroke="rgba(253,185,39,0.35)" stroke-width="2" stroke-linecap="round"/>
        <path d="M135 210 L135 254" stroke="rgba(253,185,39,0.35)" stroke-width="2" stroke-linecap="round"/>
      </g>

      <!-- ── TORSO / JERSEY ── -->
      <g id="kb-torso" filter="url(#kg-glow)">
        <!-- Main jersey body -->
        <path id="kb-jersey"
          d="M90 145 C80 158 76 180 78 208 C80 230 86 250 93 258
             L130 258 C137 248 142 228 143 206 C145 178 141 155 130 142 Z"
          fill="url(#kg-gold)"/>
        <!-- Jersey number 24 -->
        <text x="111" y="218" text-anchor="middle"
              font-family="'Bebas Neue',Arial Narrow,sans-serif"
              font-size="30" font-weight="900"
              fill="url(#kg-purple)" opacity="0.82"
              letter-spacing="1">24</text>
        <!-- LAKERS wordmark hint -->
        <text x="111" y="178" text-anchor="middle"
              font-family="'Bebas Neue',Arial Narrow,sans-serif"
              font-size="14" fill="url(#kg-purple)" opacity="0.65"
              letter-spacing="2">LAKERS</text>
        <!-- Jersey seam lines -->
        <path d="M90 150 C90 175 88 195 88 210" stroke="rgba(0,0,0,0.12)" stroke-width="1" fill="none"/>
        <path d="M130 148 C130 173 132 193 132 210" stroke="rgba(0,0,0,0.12)" stroke-width="1" fill="none"/>
      </g>

      <!-- ── OFF/GUIDE HAND (left arm — drops on release) ── -->
      <g id="kb-arm-guide" filter="url(#kg-glow)">
        <!-- Upper arm -->
        <path d="M89 152 C76 160 66 176 62 196 C66 203 73 202 77 196
                 C80 180 88 167 95 160 Z"
              fill="url(#kg-gold)"/>
        <!-- Forearm dropping away -->
        <path id="kb-guide-fore"
          d="M62 196 C56 210 52 226 53 238 C57 242 63 240 66 234
             C66 222 68 208 73 200 Z"
              fill="url(#kg-gold)"/>
        <!-- Guide hand open, palm up -->
        <ellipse id="kb-guide-hand" cx="55" cy="244" rx="10" ry="7"
                 fill="url(#kg-gold)" transform="rotate(20,55,244)"/>
      </g>

      <!-- ── SHOOTING ARM (right — KEY ANIMATION ELEMENT) ── -->
      <g id="kb-arm-shoot" style="transform-origin:130px 148px" filter="url(#kg-glow)">
        <!-- Upper arm — rises from shoulder -->
        <path id="kb-shoot-upper"
          d="M130 148 C140 138 152 128 162 116 C166 110 163 103 158 101
             C150 110 140 122 132 134 Z"
          fill="url(#kg-gold)"/>
        <!-- Forearm — nearly vertical at full extension -->
        <path id="kb-shoot-fore"
          d="M162 116 C170 106 178 94 184 80 C187 73 184 67 180 67
             C174 78 166 92 160 106 Z"
          fill="url(#kg-gold)"/>
        <!-- Shooting wrist + hand — the "gooseneck" follow-through -->
        <g id="kb-wrist">
          <!-- Wrist bend — droops forward (follow-through) -->
          <path d="M180 67 C186 60 191 55 192 48 C194 43 191 38 186 39
                   C183 44 181 51 180 59 Z"
                fill="url(#kg-gold)"/>
          <!-- Index finger pointing at basket -->
          <path d="M192 48 C195 42 197 37 196 33"
                stroke="url(#kg-gold)" stroke-width="5" stroke-linecap="round" fill="none"/>
          <!-- Middle finger -->
          <path d="M188 46 C190 40 191 35 189 31"
                stroke="url(#kg-gold)" stroke-width="4.5" stroke-linecap="round" fill="none"/>
          <!-- Ring finger -->
          <path d="M184 47 C185 41 185 36 183 33"
                stroke="url(#kg-gold)" stroke-width="4" stroke-linecap="round" fill="none"/>
        </g>
        <!-- Elbow pad -->
        <ellipse cx="163" cy="115" rx="7" ry="5" fill="url(#kg-purple)" opacity="0.6"
                 transform="rotate(-30,163,115)"/>
      </g>

      <!-- ── HEAD & NECK ── -->
      <g id="kb-head" filter="url(#kg-glow)" style="transform-origin:111px 125px">
        <!-- Neck -->
        <rect x="105" y="122" width="13" height="25" rx="5" fill="url(#kg-gold)"/>
        <!-- Head shape — slightly tilted back (watching the shot) -->
        <ellipse id="kb-head-el" cx="112" cy="107" rx="23" ry="25" fill="url(#kg-gold)"/>
        <!-- Ear -->
        <ellipse cx="90" cy="110" rx="5" ry="8" fill="url(#kg-gold)" opacity="0.7"/>
        <!-- Eye (focused, slightly upward) -->
        <ellipse cx="104" cy="104" rx="3.5" ry="2.8" fill="rgba(8,8,8,0.55)"/>
        <ellipse cx="120" cy="103" rx="3.5" ry="2.8" fill="rgba(8,8,8,0.55)"/>
        <!-- Brow furrow — concentration -->
        <path d="M100 99 C103 96 108 96 112 97" stroke="rgba(8,8,8,0.4)" stroke-width="1.5"
              fill="none" stroke-linecap="round"/>
        <!-- Headband -->
        <rect x="89" y="93" width="46" height="9" rx="4" fill="rgba(85,37,131,0.65)"/>
      </g>

      <!-- ── MOTION BLUR STREAKS (beneath the jump) ── -->
      <g id="kb-motion" opacity="0" style="pointer-events:none">
        <line x1="82"  y1="360" x2="76"  y2="398" stroke="${C.goldDim}" stroke-width="2"   stroke-linecap="round" opacity="0.6"/>
        <line x1="100" y1="358" x2="95"  y2="398" stroke="${C.goldDim}" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>
        <line x1="118" y1="358" x2="113" y2="398" stroke="${C.goldDim}" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>
        <line x1="134" y1="362" x2="130" y2="400" stroke="${C.goldDim}" stroke-width="2"   stroke-linecap="round" opacity="0.6"/>
      </g>

      <!-- ── WRISTBAND ── -->
      <rect x="175" y="72" width="10" height="14" rx="4"
            fill="rgba(85,37,131,0.7)" id="kb-wristband"/>
    `;

    return svg;
  }

  /* ══════════════════════════════════════════════════════════════
     HOOP + BACKBOARD + NET SVG
     Positioned top-right, with proper NBA proportions and
     perspective foreshortening as seen from below court level.
  ══════════════════════════════════════════════════════════════ */
  function buildHoopSVG(vw, vh) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.id = 'kt-hoop';
    svg.setAttribute('aria-hidden','true');
    svg.style.cssText = `
      position:absolute;
      pointer-events:none;
      overflow:visible;
    `;

    const mob = isMobile();
    /* Hoop position: right side, upper third */
    const hx = mob ? vw * 0.72 : vw * 0.76;  /* rim center X */
    const hy = mob ? vh * 0.28 : vh * 0.25;  /* rim center Y */
    const rimR  = mob ? 32 : 44;    /* rim radius */
    const rimRY = rimR * 0.32;      /* perspective flatten */
    const netH  = rimR * 2.1;       /* net hangs below */
    const poleX = hx + rimR * 1.65; /* support arm x */
    const boardW = mob ? 90 : 120;
    const boardH = mob ? 52 : 70;
    const boardX = poleX - boardW * 0.5;
    const boardY = hy - boardH * 1.1;

    svg.style.left   = '0';
    svg.style.top    = '0';
    svg.style.width  = vw + 'px';
    svg.style.height = vh + 'px';

    /* Net chains — 9 strings creating the net bag shape */
    const netStrings = [];
    const netCount = 9;
    for (let i = 0; i < netCount; i++) {
      const t   = i / (netCount - 1);
      const sx  = (hx - rimR) + t * rimR * 2;
      const sy  = hy + rimRY * 0.4;
      /* Net converges to a slightly smaller oval at bottom */
      const ex  = (hx - rimR * 0.55) + t * rimR * 1.1;
      const ey  = hy + netH;
      /* Control points for realistic net drape */
      const cx1 = sx + (Math.sin(t * Math.PI) * rimR * 0.2);
      const cy1 = sy + netH * 0.35;
      const cx2 = ex + (Math.sin(t * Math.PI) * rimR * 0.1);
      const cy2 = ey - netH * 0.2;
      netStrings.push(`M ${sx.toFixed(1)} ${sy.toFixed(1)}
                       C ${cx1.toFixed(1)} ${cy1.toFixed(1)},
                         ${cx2.toFixed(1)} ${cy2.toFixed(1)},
                         ${ex.toFixed(1)} ${ey.toFixed(1)}`);
    }
    /* Horizontal net rings */
    const netRings = [0.25, 0.5, 0.75, 0.95].map(frac => {
      const y = hy + rimRY * 0.4 + netH * frac;
      const shrink = 1 - frac * 0.38;
      const rx = rimR * shrink;
      const ry = rimRY * shrink * 0.5;
      return `<ellipse cx="${hx.toFixed(1)}" cy="${y.toFixed(1)}"
                rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}"
                fill="none" stroke="${C.netWhite}" stroke-width="0.8" opacity="0.5"/>`;
    });

    svg.innerHTML = `
      <defs>
        <!-- Backboard glass -->
        <linearGradient id="hoop-board" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stop-color="rgba(235,240,255,0.88)"/>
          <stop offset="100%"stop-color="rgba(210,220,245,0.72)"/>
        </linearGradient>
        <!-- Rim chrome -->
        <linearGradient id="hoop-rim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stop-color="#E86010"/>
          <stop offset="50%" stop-color="#CC4800"/>
          <stop offset="100%"stop-color="#992800"/>
        </linearGradient>
        <!-- Board glow (lights up on score) -->
        <filter id="board-glow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="4" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <!-- Rim glow -->
        <filter id="rim-glow-f" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <!-- Net glow on swish -->
        <filter id="net-glow-f" x="-20%" y="-10%" width="140%" height="120%">
          <feGaussianBlur stdDeviation="3"/>
        </filter>
      </defs>

      <!-- Support pole / arm from wall -->
      <line x1="${(poleX+12).toFixed(0)}" y1="${(boardY-4).toFixed(0)}"
            x2="${(poleX+18).toFixed(0)}" y2="${(vh).toFixed(0)}"
            stroke="rgba(80,80,80,0.6)" stroke-width="4"/>
      <!-- Support arm to backboard -->
      <line x1="${(hx+rimR*0.6).toFixed(0)}" y1="${(boardY+boardH*0.5).toFixed(0)}"
            x2="${(poleX+12).toFixed(0)}" y2="${(boardY+boardH*0.6).toFixed(0)}"
            stroke="rgba(80,80,80,0.5)" stroke-width="3"/>

      <!-- ── BACKBOARD ── -->
      <g id="hoop-backboard" filter="url(#board-glow)">
        <!-- Main glass panel -->
        <rect x="${boardX}" y="${boardY}" width="${boardW}" height="${boardH}" rx="4"
              fill="url(#hoop-board)" stroke="rgba(180,180,200,0.4)" stroke-width="2"/>
        <!-- Board frame border -->
        <rect x="${boardX+3}" y="${boardY+3}" width="${boardW-6}" height="${boardH-6}" rx="2"
              fill="none" stroke="rgba(160,170,200,0.3)" stroke-width="1.5"/>
        <!-- Shooter's square — the white rectangle above rim -->
        <rect x="${(hx-rimR*0.65).toFixed(1)}" y="${(hy-rimR*1.6).toFixed(1)}"
              width="${(rimR*1.3).toFixed(1)}" height="${(rimR*0.85).toFixed(1)}"
              fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="2.5"/>
        <!-- NBA logo hint -->
        <text x="${(boardX+boardW*0.5).toFixed(0)}" y="${(boardY+boardH*0.3).toFixed(0)}"
              text-anchor="middle" font-size="9" fill="rgba(20,20,80,0.5)"
              font-family="sans-serif" font-weight="700">NBA</text>
      </g>

      <!-- ── RIM ── -->
      <!-- Back of rim (further from viewer) — darker -->
      <ellipse id="hoop-rim-back"
        cx="${hx.toFixed(1)}" cy="${(hy+rimRY*0.4).toFixed(1)}"
        rx="${rimR}" ry="${rimRY}"
        fill="none" stroke="url(#hoop-rim)"
        stroke-width="${mob?5:7}" opacity="0.55"/>
      <!-- Front of rim (closer to viewer) — full color -->
      <path id="hoop-rim-front"
        d="M ${(hx-rimR).toFixed(1)} ${hy}
           A ${rimR} ${rimRY} 0 0 0 ${(hx+rimR).toFixed(1)} ${hy}"
        fill="none" stroke="url(#hoop-rim)"
        stroke-width="${mob?6:8}" stroke-linecap="round"/>
      <!-- Rim bolt/weld details -->
      ${[-rimR*0.9, rimR*0.9].map(offset=>`
        <circle cx="${(hx+offset).toFixed(1)}" cy="${hy}" r="${mob?3:4}"
                fill="#CC4800" stroke="#992800" stroke-width="1"/>
      `).join('')}

      <!-- ── NET ── -->
      <g id="hoop-net" opacity="0.82">
        ${netStrings.map(d=>`<path d="${d}" fill="none" stroke="${C.netWhite}"
          stroke-width="1" stroke-linecap="round" opacity="0.7"/>`).join('')}
        ${netRings.join('')}
        <!-- Net bag bottom -->
        <ellipse cx="${hx.toFixed(1)}" cy="${(hy+netH).toFixed(1)}"
                 rx="${(rimR*0.5).toFixed(1)}" ry="${(rimRY*0.35).toFixed(1)}"
                 fill="none" stroke="${C.netWhite}" stroke-width="1" opacity="0.45"/>
      </g>

      <!-- Net glow layer (appears on swish) -->
      <g id="hoop-net-glow" opacity="0" filter="url(#net-glow-f)">
        ${netStrings.map(d=>`<path d="${d}" fill="none" stroke="${C.gold}"
          stroke-width="2.5" stroke-linecap="round"/>`).join('')}
      </g>

      <!-- Rim glow (appears when ball enters) -->
      <ellipse id="hoop-rim-glow" cx="${hx.toFixed(1)}" cy="${hy.toFixed(1)}"
               rx="${(rimR*1.2).toFixed(1)}" ry="${(rimRY*1.5).toFixed(1)}"
               fill="rgba(253,185,39,0)" stroke="rgba(253,185,39,0)"
               stroke-width="${mob?8:10}" filter="url(#rim-glow-f)"/>

      <!-- ── BALL THROUGH HOOP (the swish moment) ── -->
      <!-- Hidden circle that shows ball entering net -->
      <circle id="hoop-ball-thru" cx="${hx.toFixed(1)}" cy="${hy.toFixed(1)}"
              r="${(rimR*0.58).toFixed(1)}"
              fill="none" stroke="none" opacity="0"/>
    `;

    /* Store hoop geometry for ball arc calculation */
    svg._hoopX = hx;
    svg._hoopY = hy;
    svg._rimR  = rimR;
    svg._netH  = netH;

    return svg;
  }

  /* ══════════════════════════════════════════════════════════════
     FLYING BALL SVG — overlaid above everything
  ══════════════════════════════════════════════════════════════ */
  function buildBallSVG(vw, vh, hoopX, hoopY) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.id = 'kt-ball-svg';
    svg.setAttribute('aria-hidden','true');
    svg.style.cssText = `
      position:fixed; inset:0; width:100%; height:100%;
      pointer-events:none; z-index:10003; overflow:visible;
    `;

    const mob = isMobile();
    const br  = mob ? 18 : 24; /* ball radius */

    /* Release point — near Kobe's wrist (shooting hand) */
    const releaseX = mob ? vw * 0.26 : vw * 0.24;
    const releaseY = mob ? vh * 0.42 : vh * 0.38;

    /* Ball arc: release → apex → hoop */
    const apexX = (releaseX + hoopX) * 0.5 + (hoopX - releaseX) * 0.05;
    const apexY = Math.min(releaseY, hoopY) - vh * 0.22;

    /* Store for JS use */
    svg._releaseX = releaseX;
    svg._releaseY = releaseY;
    svg._hoopX    = hoopX;
    svg._hoopY    = hoopY;
    svg._apexX    = apexX;
    svg._apexY    = apexY;
    svg._br       = br;

    svg.innerHTML = `
      <defs>
        <radialGradient id="ball-grad" cx="35%" cy="32%" r="65%">
          <stop offset="0%"  stop-color="#F5A040"/>
          <stop offset="45%" stop-color="${C.ballOrange}"/>
          <stop offset="100%"stop-color="${C.ballDark}"/>
        </radialGradient>
        <filter id="ball-glow-f" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="6" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <!-- Ball shadow blur -->
        <filter id="ball-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4"/>
        </filter>

        <!-- Arc trail gradient -->
        <linearGradient id="arc-trail-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stop-color="${C.gold}" stop-opacity="0"/>
          <stop offset="50%"  stop-color="${C.gold}" stop-opacity="0.55"/>
          <stop offset="100%" stop-color="#ffffff"   stop-opacity="0.75"/>
        </linearGradient>
      </defs>

      <!-- Arc trail path -->
      <path id="kt-arc-trail"
        d="M ${releaseX} ${releaseY}
           Q ${apexX} ${apexY}
             ${hoopX} ${hoopY}"
        fill="none"
        stroke="url(#arc-trail-grad)"
        stroke-width="2"
        stroke-linecap="round"
        stroke-dasharray="600"
        stroke-dashoffset="600"
        opacity="0.7"/>

      <!-- Light streak along arc (thicker, more motion-blur-like) -->
      <path id="kt-arc-streak"
        d="M ${releaseX} ${releaseY}
           Q ${apexX} ${apexY}
             ${hoopX} ${hoopY}"
        fill="none"
        stroke="${C.gold}"
        stroke-width="1"
        stroke-linecap="round"
        stroke-dasharray="600"
        stroke-dashoffset="600"
        opacity="0"/>

      <!-- Ball shadow (on ground / approaching hoop) -->
      <circle id="kt-ball-shadow" cx="${releaseX}" cy="${releaseY+6}"
              r="${br*0.5}" fill="rgba(0,0,0,0.35)"
              filter="url(#ball-shadow)" opacity="0"/>

      <!-- THE BASKETBALL -->
      <g id="kt-ball" filter="url(#ball-glow-f)" opacity="0"
         style="transform-origin:${releaseX}px ${releaseY}px">
        <!-- Main sphere -->
        <circle id="ball-sphere" cx="0" cy="0" r="${br}" fill="url(#ball-grad)"/>
        <!-- Seam lines — rotate with ball spin animation -->
        <g id="ball-seams" stroke="rgba(30,10,0,0.42)" stroke-width="1.2" fill="none">
          <!-- Horizontal seam -->
          <path d="M ${-br} 0 Q 0 ${-br*0.62} ${br} 0"/>
          <path d="M ${-br} 0 Q 0 ${br*0.62}  ${br} 0"/>
          <!-- Vertical seam -->
          <path d="M 0 ${-br} Q ${br*0.62} 0  0 ${br}"/>
        </g>
        <!-- Highlight -->
        <ellipse cx="${-br*0.28}" cy="${-br*0.3}" rx="${br*0.28}" ry="${br*0.18}"
                 fill="rgba(255,255,255,0.22)" transform="rotate(-30)"/>
      </g>
    `;
    return svg;
  }

  /* ══════════════════════════════════════════════════════════════
     MAIN OVERLAY CONTAINER
  ══════════════════════════════════════════════════════════════ */
  function buildOverlay() {
    const el = document.createElement('div');
    el.id = 'kt-overlay';
    el.setAttribute('aria-hidden','true');
    el.style.cssText = `
      position:fixed; inset:0; z-index:10000;
      pointer-events:none; opacity:0;
      background:${C.bg};
      overflow:hidden;
      will-change:opacity;
    `;

    /* Ambient arena light bleed */
    const ambience = document.createElement('div');
    ambience.id = 'kt-ambience';
    ambience.style.cssText = `
      position:absolute; inset:0;
      background:
        radial-gradient(ellipse 80% 50% at 30% 100%, rgba(253,185,39,0.10) 0%, transparent 70%),
        radial-gradient(ellipse 60% 40% at 75% 30%, rgba(85,37,131,0.12) 0%, transparent 65%);
      opacity:0; pointer-events:none;
      transition: opacity 0.4s ease;
    `;

    /* Particles canvas */
    const canvas = document.createElement('canvas');
    canvas.id = 'kt-canvas';
    canvas.style.cssText = `position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:2;`;

    /* Screen flash — basket scored */
    const flash = document.createElement('div');
    flash.id = 'kt-flash';
    flash.style.cssText = `position:absolute;inset:0;background:rgba(253,185,39,0);pointer-events:none;z-index:3;will-change:background;`;

    /* Iris wipe — expands from hoop position */
    const iris = document.createElement('div');
    iris.id = 'kt-iris';
    iris.style.cssText = `
      position:absolute; inset:0;
      pointer-events:none; z-index:4;
      overflow:hidden;
    `;
    /* SVG iris mask */
    iris.innerHTML = `
      <svg id="kt-iris-svg" style="position:absolute;inset:0;width:100%;height:100%"
           preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <mask id="iris-mask">
            <rect width="100%" height="100%" fill="white"/>
            <circle id="iris-hole" cx="75%" cy="25%" r="0" fill="black"/>
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="${C.bg}" mask="url(#iris-mask)" id="iris-panel" opacity="0"/>
      </svg>
    `;

    /* Court floor atmosphere strip at bottom */
    const courtAtmos = document.createElement('div');
    courtAtmos.id = 'kt-court-atmos';
    courtAtmos.style.cssText = `
      position:absolute; bottom:0; left:0; right:0;
      height:45%; pointer-events:none;
      opacity:0; z-index:1;
    `;

    el.appendChild(courtAtmos);
    el.appendChild(ambience);
    el.appendChild(canvas);
    el.appendChild(flash);
    el.appendChild(iris);
    return el;
  }

  /* ══════════════════════════════════════════════════════════════
     NET SWISH ANIMATION via GSAP
     Each net string gets a "pluck" animation — wave ripple top→bottom
  ══════════════════════════════════════════════════════════════ */
  function animateNetSwish(hoopSVG, particles, hx, hy, netH) {
    if (!gsapReady()) return;
    const net   = hoopSVG.querySelector('#hoop-net');
    const glow  = hoopSVG.querySelector('#hoop-net-glow');
    const rimGl = hoopSVG.querySelector('#hoop-rim-glow');

    /* Net ripple — strings */
    const strings = net.querySelectorAll('path');
    strings.forEach((s, i) => {
      const delay = i * 0.018;
      gsap.to(s, {
        attr: { opacity: 1 },
        duration: 0.08,
        delay,
        yoyo: true,
        repeat: 3,
        ease: 'sine.inOut',
      });
      /* Lateral oscillation */
      gsap.fromTo(s, {
        x: 0,
      }, {
        x: (i % 2 === 0 ? 2.5 : -2.5),
        duration: 0.07,
        delay: delay + 0.02,
        yoyo: true, repeat: 5,
        ease: 'sine.inOut',
      });
    });

    /* Net glow flare */
    gsap.to(glow, { opacity: 0.7, duration: 0.12, ease: 'power2.out' });
    gsap.to(glow, { opacity: 0,   duration: 0.35, ease: 'power2.in', delay: 0.12 });

    /* Rim glow */
    gsap.to(rimGl, {
      attr: {
        fill: 'rgba(253,185,39,0.25)',
        stroke: 'rgba(253,185,39,0.6)',
      },
      duration: 0.1, ease: 'power3.out',
    });
    gsap.to(rimGl, {
      attr: {
        fill: 'rgba(253,185,39,0)',
        stroke: 'rgba(253,185,39,0)',
      },
      duration: 0.4, ease: 'power2.in', delay: 0.1,
    });

    /* Particle swish sparks at hoop */
    particles.flash(hx, hy + 10, 'swish', 20);
    particles.flash(hx, hy + 10, 'camera', 16);
  }

  /* ══════════════════════════════════════════════════════════════
     THE TRANSITION ENGINE
  ══════════════════════════════════════════════════════════════ */
  const KT = {
    overlay:   null,
    sparks:    null,
    arenaSVG:  null,
    kobeSVG:   null,
    hoopSVG:   null,
    ballSVG:   null,
    playing:   false,

    init() {
      if (this.overlay) return;
      this.overlay = buildOverlay();
      document.body.appendChild(this.overlay);

      const canvas = this.overlay.querySelector('#kt-canvas');
      this.sparks  = new Sparks(canvas);
      this.sparks.resize();
      window.addEventListener('resize', () => this.sparks.resize());

      this._intercept();
      this._revealIn();
    },

    _intercept() {
      document.addEventListener('click', e => {
        const a = e.target.closest('a[href]');
        if (!a) return;
        const href = a.getAttribute('href') || '';
        if (
          href.startsWith('#') || href.startsWith('http') ||
          href.startsWith('mailto') || href.startsWith('tel') ||
          a.getAttribute('target') === '_blank' || a.hasAttribute('download')
        ) return;
        if (!/\.(html?)$|^[a-z][^/]*$/.test(href) && !href.startsWith('/')) return;
        /* Same page check */
        try {
          const cur = window.location.pathname.split('/').pop() || 'index.html';
          const tgt = href.replace(/[?#].*/, '');
          if (cur === tgt || (!cur && tgt === 'index.html')) return;
        } catch(_) {}

        e.preventDefault();
        if (this.playing) return;

        if (noMotion() || !hasGSAP()) { window.location.href = href; return; }
        this._play(href);
      }, true);
    },

    _play(href) {
      if (this.playing || !hasGSAP()) { window.location.href = href; return; }
      this.playing = true;

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const ov = this.overlay;

      /* ── Build scene components ── */
      /* Remove old if any */
      ['kt-arena','kt-kobe','kt-hoop','kt-ball-svg'].forEach(id => {
        const old = document.getElementById(id);
        if (old) old.remove();
      });

      this.arenaSVG = buildArenaSVG(vw, vh);
      this.kobeSVG  = buildKobeSVG();
      this.hoopSVG  = buildHoopSVG(vw, vh);

      ov.querySelector('#kt-court-atmos').appendChild(this.arenaSVG);
      ov.appendChild(this.kobeSVG);
      ov.appendChild(this.hoopSVG);

      const hx = this.hoopSVG._hoopX;
      const hy = this.hoopSVG._hoopY;
      const netH = this.hoopSVG._netH;

      this.ballSVG = buildBallSVG(vw, vh, hx, hy);
      document.body.appendChild(this.ballSVG);

      /* ── Grab all animated elements ── */
      const kobe      = this.kobeSVG;
      const ambience  = ov.querySelector('#kt-ambience');
      const courtAtm  = ov.querySelector('#kt-court-atmos');
      const flash     = ov.querySelector('#kt-flash');
      const irisPanel = ov.querySelector('#iris-panel');
      const irisHole  = ov.querySelector('#iris-hole');

      const armShoot  = kobe.querySelector('#kb-arm-shoot');
      const armGuide  = kobe.querySelector('#kb-arm-guide');
      const guideFore = kobe.querySelector('#kb-guide-fore');
      const guideHand = kobe.querySelector('#kb-guide-hand');
      const wrist     = kobe.querySelector('#kb-wrist');
      const head      = kobe.querySelector('#kb-head');
      const torso     = kobe.querySelector('#kb-torso');
      const legs      = kobe.querySelector('#kb-legs');
      const shadow    = kobe.querySelector('#kb-shd');
      const motion    = kobe.querySelector('#kb-motion');
      const ballGroup = kobe.querySelector('#kb-ball-group') || kobe.querySelector('#kb-wristband');

      const arcTrail  = this.ballSVG.querySelector('#kt-arc-trail');
      const arcStreak = this.ballSVG.querySelector('#kt-arc-streak');
      const ktBall    = this.ballSVG.querySelector('#kt-ball');
      const ballSeams = this.ballSVG.querySelector('#ball-seams');
      const ballSph   = this.ballSVG.querySelector('#ball-sphere');
      const ballShd   = this.ballSVG.querySelector('#kt-ball-shadow');

      const irisHoleX = isMobile() ? '72%' : '76%';
      const irisHoleY = isMobile() ? '28%' : '25%';

      /* Set iris hole to hoop position */
      const hoopFracX = (hx / vw * 100).toFixed(1) + '%';
      const hoopFracY = (hy / vh * 100).toFixed(1) + '%';
      if (irisHole) {
        irisHole.setAttribute('cx', hoopFracX);
        irisHole.setAttribute('cy', hoopFracY);
      }

      /* Release point coords */
      const rx = this.ballSVG._releaseX;
      const ry = this.ballSVG._releaseY;
      const ax = this.ballSVG._apexX;
      const ay = this.ballSVG._apexY;
      const br = this.ballSVG._br;

      /* Enable pointer block */
      ov.style.pointerEvents = 'all';

      /* ════════════════════════════════════════════════
         MASTER GSAP TIMELINE
      ════════════════════════════════════════════════ */
      const tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        onComplete: () => { window.location.href = href; },
      });

      /* ── 0.00s — Overlay + arena fade in ── */
      tl.to(ov, { opacity:1, duration:0.25, ease:'power2.inOut' }, 0);
      tl.to(courtAtm, { opacity:1, duration:0.35 }, 0.05);
      tl.to(ambience, { opacity:1, duration:0.4  }, 0.05);

      /* ── 0.20s — Kobe enters from below ── */
      tl.to(kobe, {
        y: '0%', opacity:1,
        duration: 0.38,
        ease: 'power3.out',
        onStart: () => gsap.set(kobe, { opacity:0 }),
      }, 0.20);

      /* ── 0.42s — Gather/crouch ── */
      tl.to(kobe, {
        scaleY:0.90, scaleX:1.05, y:'3%',
        duration:0.18, ease:'power2.inOut',
        transformOrigin:'bottom center',
      }, 0.42);

      tl.to(shadow, {
        scaleX:1.35, opacity:0.9,
        duration:0.18, ease:'power2.inOut',
        transformOrigin:'center',
      }, 0.42);

      /* Arm cocks back with ball */
      tl.to(armShoot, {
        rotation: 18,
        duration: 0.16, ease:'power2.inOut',
      }, 0.44);

      /* ── 0.58s — JUMP off one foot (fadeaway lean) ── */
      tl.to(kobe, {
        scaleY:1.04, scaleX:0.96,
        y:'-22%',
        rotation: -5,           /* lean back — fadeaway */
        duration: 0.24,
        ease: 'power3.out',
        transformOrigin:'80% 100%', /* lean from right foot */
      }, 0.58);

      /* Shadow shrinks — Kobe off the ground */
      tl.to(shadow, {
        scaleX:0.45, scaleY:0.6, opacity:0.25,
        duration:0.22, ease:'power2.out',
        transformOrigin:'center',
      }, 0.58);

      /* Motion blur streaks */
      tl.to(motion, { opacity:0.65, duration:0.14, ease:'power2.out' }, 0.58);

      /* Particles from feet */
      tl.add(() => {
        const r = kobe.getBoundingClientRect();
        this.sparks.flash(r.left + r.width*0.5, r.bottom - 20, 'camera', 10);
      }, 0.60);

      /* ── 0.72s — RELEASE — arm extends fully ── */
      tl.to(armShoot, {
        rotation: -44,
        duration: 0.17,
        ease: 'power4.out',
      }, 0.70);

      /* Wrist snap forward */
      tl.to(wrist, {
        rotation: 28,
        y: -6,
        duration: 0.14,
        ease: 'power3.out',
        transformOrigin: 'top center',
      }, 0.72);

      /* Head tilts up — watching the shot */
      tl.to(head, {
        rotation: -12, y: -5,
        duration: 0.18, ease:'power2.out',
        transformOrigin:'bottom center',
      }, 0.70);

      /* Body leans further back — full fadeaway */
      tl.to(torso, {
        rotation: -8,
        duration: 0.20, ease:'power3.out',
        transformOrigin:'bottom center',
      }, 0.68);

      /* Guide hand drops */
      tl.to(guideFore, { rotation:20, y:12, duration:0.18, ease:'power2.inOut', transformOrigin:'top left' }, 0.70);
      tl.to(guideHand, { rotation:30, y:15, opacity:0.5, duration:0.2, ease:'power2.inOut' }, 0.72);

      /* Motion streaks fade */
      tl.to(motion, { opacity:0, duration:0.22, ease:'power2.in' }, 0.76);

      /* ── 0.80s — BALL APPEARS at release point ── */
      tl.set(ktBall, {
        x: rx, y: ry,
        scale: 0.7, opacity: 0,
      }, 0.78);

      tl.to(ktBall, {
        opacity: 1, scale: 1,
        duration: 0.1, ease:'power2.out',
      }, 0.78);

      /* Arc trail draws */
      tl.to(arcTrail, {
        strokeDashoffset: 0,
        opacity: 0.75,
        duration: 0.55,
        ease: 'power2.inOut',
      }, 0.80);

      tl.to(arcStreak, {
        strokeDashoffset: 0,
        opacity: 0.45,
        duration: 0.50,
        ease: 'power1.out',
      }, 0.82);

      /* ── 0.80–1.22s — Ball travels full arc to hoop ── */
      /* Segment 1: release → apex (ascending) */
      tl.to(ktBall, {
        x: ax, y: ay,
        rotation: 300,
        duration: 0.28,
        ease: 'power2.out',
      }, 0.80);

      /* Ball scales slightly up at apex (parallax feel) */
      tl.to(ktBall, { scale:1.12, duration:0.14, ease:'power1.out' }, 0.94);

      /* Crowd camera flashes at apex */
      tl.add(() => {
        this.sparks.flash(ax, ay - 30, 'camera', 32);
      }, 1.04);

      /* Segment 2: apex → hoop (descending) */
      tl.to(ktBall, {
        x: hx, y: hy,
        rotation: 600,
        scale: 0.88,
        duration: 0.26,
        ease: 'power2.in',
      }, 1.08);

      /* Ball shadow tracks below ball */
      tl.to(ballShd, { opacity:0.4, duration:0.1 }, 0.80);
      tl.to(ballShd, { x: hx, y: hy+8, opacity:0, duration:0.42, ease:'power2.inOut' }, 0.80);

      /* ── 1.22s — BALL ENTERS HOOP ── */
      /* Ball goes through net — scales down and fades */
      tl.to(ktBall, {
        scale: 0.5,
        y: hy + this.hoopSVG._netH * 0.5,
        opacity: 0,
        duration: 0.18,
        ease: 'power3.in',
      }, 1.22);

      /* Arc trails fade */
      tl.to([arcTrail, arcStreak], { opacity:0, duration:0.18, ease:'power2.in' }, 1.22);

      /* ── 1.22s — NET SWISH ── */
      tl.add(() => {
        animateNetSwish(this.hoopSVG, this.sparks, hx, hy, netH);
      }, 1.22);

      /* ── 1.28s — ARENA FLASH ── */
      tl.to(flash, {
        background: 'rgba(253,185,39,0.22)',
        duration: 0.08, ease:'power3.out',
      }, 1.28);

      tl.to(flash, {
        background: 'rgba(253,185,39,0)',
        duration: 0.28, ease:'power2.in',
      }, 1.36);

      /* Kobe silhouette fades/rises (celebration lean) */
      tl.to(kobe, {
        opacity: 0,
        y: '-55%',
        scale: 0.82,
        duration: 0.35,
        ease: 'power2.in',
      }, 1.22);

      /* Arena fades */
      tl.to([courtAtm, ambience], { opacity:0, duration:0.3, ease:'power2.in' }, 1.25);

      /* ── 1.35s — IRIS WIPE from hoop center ── */
      /* Reveal: the iris hole expands to fill screen */
      tl.to(irisPanel, { opacity:1, duration:0.05 }, 1.35);

      tl.to(irisHole, {
        attr: { r: Math.max(vw, vh) * 1.5 },
        duration: 0.50,
        ease: 'expo.inOut',
      }, 1.35);

      /* Navigate at ~1.85s (onComplete) */
      return tl;
    },

    /* ── Page enters after navigation ── */
    _revealIn() {
      if (!hasGSAP()) return;

      const run = () => {
        if (noMotion()) { this.playing = false; return; }
        document.documentElement.classList.add('kt-entering');

        const main = document.getElementById('main') || document.querySelector('main') || document.body;
        const tl = gsap.timeline({
          onComplete: () => {
            document.documentElement.classList.remove('kt-entering');
            this.playing = false;
            /* Cleanup */
            ['kt-kobe','kt-hoop','kt-arena','kt-ball-svg'].forEach(id => {
              const el = document.getElementById(id);
              if (el) el.remove();
            });
            if (this.overlay) {
              this.overlay.style.pointerEvents = 'none';
              /* Reset iris */
              const irisHole  = this.overlay.querySelector('#iris-hole');
              const irisPanel = this.overlay.querySelector('#iris-panel');
              if (irisHole)  irisHole.setAttribute('r','0');
              if (irisPanel) gsap.set(irisPanel, { opacity:0 });
            }
          },
        });

        /* Iris hole contracts away (revealing new page) */
        if (this.overlay) {
          const irisHole  = this.overlay.querySelector('#iris-hole');
          const irisPanel = this.overlay.querySelector('#iris-panel');

          if (irisPanel && +irisPanel.getAttribute('opacity') > 0) {
            /* Arriving page — iris already open, shrink to nothing */
            tl.to(irisHole, {
              attr: { r: 0 },
              duration: 0.55,
              ease: 'expo.inOut',
            }, 0.05);
            tl.to(irisPanel, { opacity:0, duration:0.15 }, 0.58);
          }

          tl.to(this.overlay, { opacity:0, duration:0.3, ease:'power2.out' }, 0.1);
        }

        /* Page content breathes in */
        tl.fromTo(main, {
          opacity: 0,
          y: 22,
          filter: 'brightness(0.7)',
        }, {
          opacity: 1,
          y: 0,
          filter: 'brightness(1)',
          duration: 0.65,
          ease: 'power3.out',
          clearProps: 'all',
        }, 0.08);
      };

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
      } else {
        setTimeout(run, 16);
      }
    },
  };

  /* ── CSS injection ── */
  function injectCSS() {
    if (document.getElementById('kt-css')) return;
    const s = document.createElement('style');
    s.id = 'kt-css';
    s.textContent = `
      html.kt-entering #main,
      html.kt-entering main {
        opacity:0;
        transform:translateY(18px);
      }
      #kt-overlay { transform:translateZ(0); backface-visibility:hidden; }
      #kt-kobe { transform-box:fill-box; }
      #kb-arm-shoot { transform-box:fill-box; }
      #kb-head { transform-box:fill-box; }
      #kb-torso { transform-box:fill-box; }
      #kb-wrist { transform-box:fill-box; }
      #kt-ball { transform-box:fill-box; transform-origin:center center; }
      @media (prefers-reduced-motion:reduce) {
        #kt-overlay,#kt-ball-svg { display:none!important; }
        html.kt-entering #main,html.kt-entering main { opacity:1!important;transform:none!important; }
      }
    `;
    document.head.appendChild(s);
  }

  /* ── Bootstrap ── */
  function boot() {
    injectCSS();
    const tryInit = () => {
      if (hasGSAP()) { KT.init(); return; }
      let n = 0;
      const id = setInterval(() => {
        if (hasGSAP()) { clearInterval(id); KT.init(); }
        else if (++n > 60) clearInterval(id);
      }, 50);
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tryInit);
    else tryInit();
  }

  boot();
  global.KobeTransition = KT;

})(window);
