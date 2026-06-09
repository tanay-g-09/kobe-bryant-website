/* ══════════════════════════════════════════════════════════
   KOBE BRYANT — THE BLACK MAMBA
   main.js — Every Button Functional, Final Version
   ══════════════════════════════════════════════════════════ */
'use strict';

/* ────────────────────────────────────────────────────────
   UTILITIES
──────────────────────────────────────────────────────── */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);

/* ────────────────────────────────────────────────────────
   THEME — apply immediately to prevent flash
──────────────────────────────────────────────────────── */
(function initTheme() {
  const saved = localStorage.getItem('kb-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
})();

/* ────────────────────────────────────────────────────────
   LOADER
──────────────────────────────────────────────────────── */
on(window, 'load', () => {
  const loader = $('#loader');
  if (!loader) return;
  const MIN = 1600;
  const t0  = performance.now();
  setTimeout(() => {
    loader.classList.add('out');
    document.body.classList.add('hero-loaded');
    setTimeout(() => loader.remove(), 900);
  }, Math.max(0, MIN - (performance.now() - t0)));
});

/* ────────────────────────────────────────────────────────
   CUSTOM CURSOR
──────────────────────────────────────────────────────── */
(function initCursor() {
  const dot  = $('#cur-dot');
  const ring = $('#cur-ring');
  if (!dot || !ring || !matchMedia('(pointer:fine)').matches) return;

  let rx = 0, ry = 0, mx = 0, my = 0;

  on(document, 'mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
  });

  (function followRing() {
    rx += (mx - rx) * 0.11;
    ry += (my - ry) * 0.11;
    ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(followRing);
  })();

  on(document, 'mouseover', e => {
    if (e.target.closest('a,button,[role="button"],[data-share]')) {
      dot.classList.add('hover'); ring.classList.add('hover');
    }
  });
  on(document, 'mouseout', e => {
    if (e.target.closest('a,button,[role="button"],[data-share]')) {
      dot.classList.remove('hover'); ring.classList.remove('hover');
    }
  });
  on(document, 'mousedown', () => dot.classList.add('pressed'));
  on(document, 'mouseup',   () => dot.classList.remove('pressed'));
})();

/* ────────────────────────────────────────────────────────
   SCROLL PROGRESS BAR
──────────────────────────────────────────────────────── */
(function initScrollProgress() {
  const bar = $('#scroll-bar');
  if (!bar) return;
  on(window, 'scroll', () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const pct = max > 0 ? (scrollY / max) * 100 : 0;
    bar.style.width = pct + '%';
    bar.setAttribute('aria-valuenow', Math.round(pct));
  }, { passive: true });
})();

/* ────────────────────────────────────────────────────────
   STICKY NAVBAR
──────────────────────────────────────────────────────── */
(function initNav() {
  const nav = $('#nav');
  if (!nav) return;
  const update = () => nav.classList.toggle('scrolled', scrollY > 60);
  on(window, 'scroll', update, { passive: true });
  update();
})();

/* ────────────────────────────────────────────────────────
   MOBILE HAMBURGER MENU
──────────────────────────────────────────────────────── */
(function initMenu() {
  const btn  = $('#menu-btn');
  const menu = $('#nav-menu');
  if (!btn || !menu) return;

  const open = () => {
    menu.classList.add('open');
    btn.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    // Focus first link for accessibility
    const first = menu.querySelector('a');
    if (first) setTimeout(() => first.focus(), 50);
  };
  const close = () => {
    menu.classList.remove('open');
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    btn.focus();
  };

  on(btn, 'click', () => menu.classList.contains('open') ? close() : open());

  // Close when clicking any nav link
  $$('#nav-menu a, #nav-menu .nl').forEach(l => on(l, 'click', close));

  // Close on Escape
  on(document, 'keydown', e => { if (e.key === 'Escape') close(); });

  // Close on outside click
  on(document, 'click', e => {
    if (menu.classList.contains('open') && !nav.contains(e.target)) close();
  });
})();

/* ────────────────────────────────────────────────────────
   THEME TOGGLE (slider switch)
──────────────────────────────────────────────────────── */
(function initThemeToggle() {
  const btn  = $('#theme-btn');
  const html = document.documentElement;
  if (!btn) return;

  const apply = theme => {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('kb-theme', theme);
    btn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);

    // Announce to screen readers
    const msg = document.createElement('div');
    msg.setAttribute('role', 'status');
    msg.setAttribute('aria-live', 'polite');
    msg.className = 'sr-only';
    msg.textContent = `${theme === 'dark' ? 'Dark' : 'Light'} mode enabled`;
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 2000);
  };

  on(btn, 'click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    apply(next);
  });

  // Support keyboard
  on(btn, 'keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
  });
})();

/* ────────────────────────────────────────────────────────
   BACK TO TOP BUTTON
──────────────────────────────────────────────────────── */
(function initBackTop() {
  const btn = $('#back-top');
  if (!btn) return;

  on(window, 'scroll', () => {
    btn.classList.toggle('show', scrollY > 600);
  }, { passive: true });

  on(btn, 'click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Focus back on skip link for accessibility
    const skip = $('.skip-link');
    if (skip) setTimeout(() => skip.focus(), 500);
  });
})();

/* ────────────────────────────────────────────────────────
   SMOOTH ANCHOR SCROLLING (all #hash links)
──────────────────────────────────────────────────────── */
$$('a[href^="#"]').forEach(a => {
  on(a, 'click', e => {
    const id = a.getAttribute('href');
    if (id === '#') return;
    const target = $(id);
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
    // Update URL without jump
    history.pushState(null, '', id);
    // Focus target for accessibility
    target.setAttribute('tabindex', '-1');
    setTimeout(() => { target.focus({ preventScroll: true }); }, 600);
  });
});

/* ────────────────────────────────────────────────────────
   SHARE BUTTONS — all [data-share] elements
──────────────────────────────────────────────────────── */
(function initShare() {
  $$('[data-share]').forEach(btn => {
    on(btn, 'click', async () => {
      const shareData = {
        title: 'Kobe Bryant — The Black Mamba',
        text:  'A cinematic tribute to twenty years, five championships, and one obsession with greatness.',
        url:   window.location.origin + '/index.html'
      };

      try {
        if (navigator.share) {
          await navigator.share(shareData);
          showToast('Thanks for sharing! 🐍');
        } else {
          // Fallback: copy to clipboard
          await navigator.clipboard.writeText(shareData.url);
          showToast('Link copied to clipboard! 🐍');

          // Visual feedback on the button itself
          const orig = btn.innerHTML;
          btn.innerHTML = btn.innerHTML.replace(
            /(Share.*)/,
            '<span style="color:var(--gold)">Copied! ✓</span>'
          );
          setTimeout(() => { btn.innerHTML = orig; }, 2500);
        }
      } catch (err) {
        // User cancelled share or clipboard blocked — silent fail
        if (err.name !== 'AbortError') {
          showToast('Copy the URL from your address bar!');
        }
      }
    });
  });
})();

/* ────────────────────────────────────────────────────────
   TOAST NOTIFICATION
──────────────────────────────────────────────────────── */
function showToast(message, duration = 3000) {
  // Remove existing toast
  const existing = $('.kb-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'kb-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.textContent = message;
  document.body.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('kb-toast-show'));
  });

  setTimeout(() => {
    toast.classList.remove('kb-toast-show');
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

/* ────────────────────────────────────────────────────────
   CONTACT FORM — full validation + feedback
──────────────────────────────────────────────────────── */
(function initContactForm() {
  const form      = $('#contact-form');
  const success   = $('#form-success');
  const submitBtn = $('#submit-btn');
  if (!form) return;

  // Auto-grow textareas
  $$('textarea', form).forEach(ta => {
    on(ta, 'input', () => {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 300) + 'px';
    });
  });

  // Validate a single field, return true if valid
  const validate = field => {
    const wrap = field.closest('.field');
    if (!wrap) return true;
    let valid = field.value.trim() !== '';
    if (field.type === 'email' && valid) {
      valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(field.value.trim());
    }
    wrap.classList.toggle('has-error', !valid);
    wrap.classList.toggle('has-ok',    valid);
    return valid;
  };

  // Live validation after first blur
  $$('input, textarea', form).forEach(f => {
    on(f, 'blur',  () => validate(f));
    on(f, 'input', () => { if (f.closest('.field').classList.contains('has-error')) validate(f); });
  });

  // Form submit
  on(form, 'submit', async e => {
    e.preventDefault();
    const fields   = $$('input[required], textarea[required]', form);
    const allValid = fields.map(validate).every(Boolean);
    if (!allValid) {
      // Focus first invalid field
      const firstErr = form.querySelector('.field.has-error input, .field.has-error textarea');
      if (firstErr) firstErr.focus();
      return;
    }

    // Loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    // Simulate network (replace with real fetch in production)
    await new Promise(r => setTimeout(r, 1400));

    // Show success
    form.classList.add('hidden');
    if (success) {
      success.removeAttribute('hidden');
      success.focus();
    }
    showToast('Message sent! We\'ll be in touch soon. 🐍');
  });

  // "Send Another" reset
  window.resetContactForm = () => {
    form.reset();
    $$('.field', form).forEach(w => w.classList.remove('has-error', 'has-ok'));
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
    form.classList.remove('hidden');
    if (success) success.setAttribute('hidden', '');
    // Focus first input
    const first = form.querySelector('input');
    if (first) first.focus();
  };
})();

/* ────────────────────────────────────────────────────────
   QUOTE ROTATOR — full keyboard + auto-play
──────────────────────────────────────────────────────── */
(function initQuoteRotator() {
  const slides = $$('.qr-slide');
  const dots   = $$('.qr-dot');
  const prev   = $('.qr-prev');
  const next   = $('.qr-next');
  if (!slides.length) return;

  let cur = 0;
  let timer = null;
  let paused = false;

  const goTo = n => {
    slides[cur].classList.remove('active');
    dots[cur].classList.remove('active');
    dots[cur].setAttribute('aria-selected', 'false');
    cur = ((n % slides.length) + slides.length) % slides.length;
    slides[cur].classList.add('active');
    dots[cur].classList.add('active');
    dots[cur].setAttribute('aria-selected', 'true');
  };

  const startTimer = () => {
    clearInterval(timer);
    if (!paused) timer = setInterval(() => goTo(cur + 1), 5000);
  };

  dots.forEach(d => on(d, 'click', () => { goTo(+d.dataset.idx); startTimer(); }));
  on(prev, 'click', () => { goTo(cur - 1); startTimer(); });
  on(next, 'click', () => { goTo(cur + 1); startTimer(); });

  // Keyboard support on the rotator container
  const container = $('.quote-rotator');
  if (container) {
    container.setAttribute('tabindex', '0');
    on(container, 'keydown', e => {
      if (e.key === 'ArrowLeft')  { goTo(cur - 1); startTimer(); }
      if (e.key === 'ArrowRight') { goTo(cur + 1); startTimer(); }
      if (e.key === ' ') { e.preventDefault(); paused = !paused; startTimer(); }
    });

    // Pause on hover / focus
    on(container, 'mouseenter', () => { paused = true;  clearInterval(timer); });
    on(container, 'mouseleave', () => { paused = false; startTimer(); });
    on(container, 'focusin',   () => { paused = true;  clearInterval(timer); });
    on(container, 'focusout',  () => { paused = false; startTimer(); });
  }

  startTimer();
})();

/* ────────────────────────────────────────────────────────
   TICKER — pause on hover
──────────────────────────────────────────────────────── */
(function initTicker() {
  const track  = $('.ticker-track');
  const ticker = $('.hero-ticker');
  if (!track || !ticker) return;
  on(ticker, 'mouseenter', () => track.style.animationPlayState = 'paused');
  on(ticker, 'mouseleave', () => track.style.animationPlayState = 'running');
})();

/* ────────────────────────────────────────────────────────
   SCROLL REVEAL — sections, stagger parents, timeline items
──────────────────────────────────────────────────────── */
(function initReveal() {
  const opts = { threshold: 0.08, rootMargin: '0px 0px -50px 0px' };

  const secObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in-view');
      secObs.unobserve(e.target);
    });
  }, opts);
  $$('.reveal-section').forEach(el => secObs.observe(el));

  const stagObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in-view');
      stagObs.unobserve(e.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  $$('.stagger-parent').forEach(el => stagObs.observe(el));

  // Timeline — stagger each item individually
  const tlObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      // Find index among all tl-items
      const all = $$('.tl-item');
      const idx = all.indexOf(e.target);
      setTimeout(() => e.target.classList.add('in-view'), idx * 70);
      tlObs.unobserve(e.target);
    });
  }, { threshold: 0.15 });
  $$('.tl-item').forEach(el => tlObs.observe(el));
})();

/* ────────────────────────────────────────────────────────
   ANIMATED STAT COUNTERS
──────────────────────────────────────────────────────── */
(function initCounters() {
  const ease = t => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;

  const animate = el => {
    const target = +el.dataset.target;
    const suffix = el.dataset.suffix || '';
    const dur    = 2200;
    const t0     = performance.now();

    const tick = now => {
      const p = Math.min((now - t0) / dur, 1);
      const v = Math.round(ease(p) * target);
      el.textContent = (target >= 1000 ? v.toLocaleString() : v) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = (target >= 1000 ? target.toLocaleString() : target) + suffix;
    };
    requestAnimationFrame(tick);
  };

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      animate(e.target);
      obs.unobserve(e.target);
    });
  }, { threshold: 0.5 });

  $$('.sc-num[data-target]').forEach(el => obs.observe(el));
})();

/* ────────────────────────────────────────────────────────
   HERO PARALLAX (reduced motion safe)
──────────────────────────────────────────────────────── */
(function initParallax() {
  if (!matchMedia('(prefers-reduced-motion:no-preference)').matches) return;
  const photo   = $('.hero-photo');
  const content = $('.hero-content');
  if (!photo) return;

  let ticking = false;
  on(window, 'scroll', () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      const y = scrollY;
      if (y < innerHeight * 1.2) {
        photo.style.transform   = `scale(1.04) translateY(${y * 0.25}px)`;
        if (content) {
          content.style.transform = `translateY(${y * 0.1}px)`;
          content.style.opacity   = Math.max(0, 1 - y / 650);
        }
      }
      ticking = false;
    });
    ticking = true;
  }, { passive: true });
})();

/* ────────────────────────────────────────────────────────
   MAGNETIC BUTTONS
──────────────────────────────────────────────────────── */
(function initMagnetic() {
  if (!matchMedia('(pointer:fine)').matches) return;
  $$('.btn-gold, .btn-outline, .btn-submit').forEach(btn => {
    on(btn, 'mousemove', e => {
      const r  = btn.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width  / 2) * 0.13;
      const dy = (e.clientY - r.top  - r.height / 2) * 0.13;
      btn.style.cssText += `;transform:translate(${dx}px,${dy}px) translateY(-3px);transition:transform .07s`;
    });
    on(btn, 'mouseleave', () => {
      btn.style.transform  = '';
      btn.style.transition = 'transform .5s cubic-bezier(.16,1,.3,1),box-shadow .25s,background .2s';
    });
  });
})();

/* ────────────────────────────────────────────────────────
   3D CARD TILT
──────────────────────────────────────────────────────── */
(function initTilt() {
  if (!matchMedia('(pointer:fine)').matches) return;
  $$('.mp-card,.ach-card,.now-card,.bg-card,.tribute-card,.lc,.stat-card').forEach(card => {
    on(card, 'mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width  - 0.5) * 9;
      const y = ((e.clientY - r.top)  / r.height - 0.5) * 9;
      card.style.transform  = `perspective(700px) rotateX(${-y}deg) rotateY(${x}deg) translateZ(8px)`;
      card.style.transition = 'transform .05s';
    });
    on(card, 'mouseleave', () => {
      card.style.transform  = '';
      card.style.transition = 'transform .6s cubic-bezier(.16,1,.3,1),border-color .3s,box-shadow .3s,background .3s';
    });
  });
})();

/* ────────────────────────────────────────────────────────
   QUOTE WORD-BY-WORD REVEAL
──────────────────────────────────────────────────────── */
(function initWordReveal() {
  $$('blockquote p').forEach(p => {
    if (p.querySelector('.q-word')) return; // already done
    const words = p.textContent.split(' ');
    p.innerHTML = words.map((w, i) =>
      `<span class="q-word" style="--wi:${i}">${w}</span>`
    ).join(' ');
  });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('words-visible');
      obs.unobserve(e.target);
    });
  }, { threshold: 0.35 });

  $$('blockquote').forEach(el => obs.observe(el));
})();

/* ────────────────────────────────────────────────────────
   HERO PARTICLES CANVAS
──────────────────────────────────────────────────────── */
(function initParticles() {
  const canvas = $('#hero-particles');
  if (!canvas || !matchMedia('(prefers-reduced-motion:no-preference)').matches) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  const pts = Array.from({ length: 55 }, () => ({
    x:  Math.random(),
    y:  Math.random(),
    r:  Math.random() * 1.6 + 0.4,
    vx: (Math.random() - 0.5) * 0.00025,
    vy: (Math.random() - 0.5) * 0.00025,
    a:  Math.random() * 0.45 + 0.08
  }));

  const resize = () => {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  };
  resize();
  on(window, 'resize', resize);

  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    pts.forEach(p => {
      p.x = (p.x + p.vx + 1) % 1;
      p.y = (p.y + p.vy + 1) % 1;
      ctx.beginPath();
      ctx.arc(p.x * W, p.y * H, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(253,185,39,${p.a})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  };
  draw();
})();

/* ────────────────────────────────────────────────────────
   MAMBA CANVAS (wave animation in mamba section)
──────────────────────────────────────────────────────── */
(function initMambaCanvas() {
  const canvas = $('#mamba-canvas');
  if (!canvas || !matchMedia('(prefers-reduced-motion:no-preference)').matches) return;
  const ctx = canvas.getContext('2d');
  let W, H, t = 0;

  const resize = () => {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  };
  resize();
  on(window, 'resize', resize);

  const draw = () => {
    t += 0.007;
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(0, H / 2);
      for (let x = 0; x <= W; x += 3) {
        const phase = (i / 5) * Math.PI * 2;
        const y = H / 2 + Math.sin(x * 0.007 + t + phase) * (H * 0.06 * (i + 1) / 5);
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(253,185,39,${0.015 - i * 0.002})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    requestAnimationFrame(draw);
  };
  draw();
})();

/* ────────────────────────────────────────────────────────
   TRIBUTE CARD CLICK — expand quote
──────────────────────────────────────────────────────── */
(function initTributeCards() {
  $$('.tribute-card').forEach(card => {
    const quote = card.querySelector('.tc-quote');
    if (!quote) return;
    // Store original and truncated
    const full = quote.textContent.trim();
    const trunc = full.length > 120 ? full.slice(0, 120).trim() + '…' : null;

    if (!trunc) return; // Short enough — no expand needed

    let expanded = false;

    // Create toggle button
    const toggle = document.createElement('button');
    toggle.className = 'tc-toggle';
    toggle.textContent = 'Read more';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.style.cssText = `
      background:none;border:none;
      font-family:var(--font-mono);font-size:.68rem;
      letter-spacing:.1em;text-transform:uppercase;
      color:var(--gold);cursor:pointer;
      margin-top:.75rem;display:block;
      transition:opacity .2s;cursor:none;
    `;

    // Start truncated
    quote.textContent = trunc;
    card.appendChild(toggle);

    on(toggle, 'click', e => {
      e.stopPropagation();
      expanded = !expanded;
      quote.textContent = expanded ? full : trunc;
      toggle.textContent = expanded ? 'Read less' : 'Read more';
      toggle.setAttribute('aria-expanded', expanded);
    });
  });
})();

/* ────────────────────────────────────────────────────────
   RECORDS LIST — hover highlight rows
──────────────────────────────────────────────────────── */
(function initRecordsList() {
  $$('.rec-list li').forEach(li => {
    on(li, 'mouseenter', () => li.style.color = 'var(--ink)');
    on(li, 'mouseleave', () => li.style.color = '');
    li.style.transition = 'color .2s';
  });
})();

/* ────────────────────────────────────────────────────────
   STATS GRID — click to show fun fact
──────────────────────────────────────────────────────── */
(function initStatCards() {
  const facts = {
    0: "If Kobe scored 25 pts every single game for 20 seasons, that's still only 33,250 — he actually got 33,643.",
    1: "Kobe's 5 rings came in three different decades: 2000s (3×), 2009, and 2010. A dynasty that spanned generations.",
    2: "In that 81-point game, he scored 55 in the second half alone — more than most players score in full games.",
    3: "18 All-Star selections means he was named an All-Star every single season of his career from 1998 onward.",
    4: "25.0 PPG career average. Only 5 players in NBA history have a higher career scoring average.",
    5: "6,306 career assists — 4.7 per game. A scoring machine who also elevated everyone around him."
  };

  $$('.stat-card').forEach((card, i) => {
    if (facts[i]) {
      card.setAttribute('title', facts[i]);
      card.style.cursor = 'pointer';
      on(card, 'click', () => showToast(facts[i], 5000));
    }
  });
})();

/* ────────────────────────────────────────────────────────
   TIMELINE ITEMS — click to show more detail
──────────────────────────────────────────────────────── */
(function initTimeline() {
  $$('.tl-item').forEach(item => {
    // Make keyboard-focusable
    item.setAttribute('tabindex', '0');
    item.style.cursor = 'pointer';

    const activate = () => item.classList.toggle('tl-expanded');
    on(item, 'click', activate);
    on(item, 'keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } });
  });
})();

/* ────────────────────────────────────────────────────────
   KEYBOARD EASTER EGG — type "mamba"
──────────────────────────────────────────────────────── */
(function initEasterEgg() {
  let buf = '';
  on(document, 'keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    buf = (buf + e.key.toLowerCase()).slice(-5);
    if (buf === 'mamba') {
      buf = '';
      document.body.classList.add('mamba-mode');
      showToast('🐍 Mamba Mentality activated! Type "mamba" anytime.', 4000);
      setTimeout(() => document.body.classList.remove('mamba-mode'), 3500);
    }
  });
})();

/* ────────────────────────────────────────────────────────
   GALLERY IMAGE — click to open lightbox
──────────────────────────────────────────────────────── */
(function initLightbox() {
  const galleryImg = document.querySelector('.gallery-img-full img');
  if (!galleryImg) return;

  galleryImg.style.cursor = 'zoom-in';
  galleryImg.setAttribute('tabindex', '0');
  galleryImg.setAttribute('role', 'button');
  galleryImg.setAttribute('aria-label', 'Click to view full-size gallery image');

  const openLightbox = () => {
    const lb = document.createElement('div');
    lb.className = 'kb-lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Photo gallery lightbox');
    lb.innerHTML = `
      <div class="lb-backdrop"></div>
      <div class="lb-inner">
        <img src="${galleryImg.src}" alt="${galleryImg.alt}" class="lb-img"/>
        <button class="lb-close" aria-label="Close lightbox">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
        <p class="lb-caption">${galleryImg.alt}</p>
      </div>
    `;
    document.body.appendChild(lb);
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => lb.classList.add('lb-open'));

    const close = () => {
      lb.classList.remove('lb-open');
      setTimeout(() => { lb.remove(); document.body.style.overflow = ''; }, 400);
    };

    lb.querySelector('.lb-close').addEventListener('click', close);
    lb.querySelector('.lb-backdrop').addEventListener('click', close);
    on(document, 'keydown', function handler(e) {
      if (e.key === 'Escape') { close(); document.removeEventListener('keydown', handler); }
    });

    lb.querySelector('.lb-close').focus();
  };

  on(galleryImg, 'click', openLightbox);
  on(galleryImg, 'keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(); } });
})();

/* ────────────────────────────────────────────────────────
   SR-ONLY UTILITY CLASS (injected once)
──────────────────────────────────────────────────────── */
(function addSROnly() {
  if ($('.sr-only-style')) return;
  const style = document.createElement('style');
  style.className = 'sr-only-style';
  style.textContent = `.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}`;
  document.head.appendChild(style);
})();

/* ────────────────────────────────────────────────────────
   CONSOLE SIGNATURE
──────────────────────────────────────────────────────── */
console.log(
  '%c 24 %c KOBE BEAN BRYANT %c\n%c"The most important thing is to try and inspire people\nso that they can be great in whatever they want to do."\n%c— 1978–2020  ·  Mamba Forever 🐍\n%cTip: Type "mamba" on your keyboard for a surprise.',
  'background:#FDB927;color:#000;font-size:28px;font-weight:900;padding:4px 10px;border-radius:4px 0 0 4px;',
  'background:#552583;color:#FDB927;font-size:14px;font-weight:700;padding:4px 14px;border-radius:0 4px 4px 0;letter-spacing:3px;',
  '',
  'color:#FDB927;font-size:13px;font-style:italic;padding:8px 0;line-height:1.6;',
  'color:#666;font-size:11px;letter-spacing:2px;',
  'color:#444;font-size:10px;'
);

/* ────────────────────────────────────────────────────────
   COPY-TO-CLIPBOARD BUTTONS (data-copy on non-contact pages)
──────────────────────────────────────────────────────── */
(function initCopyButtons() {
  document.querySelectorAll('[data-copy]').forEach(btn => {
    if (btn.closest('#contact-form, .s-contact')) return; // handled by contact page script
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        showToast('Copied to clipboard! ✓');
      } catch {
        showToast('Value: ' + btn.dataset.copy);
      }
    });
  });
})();

/* ────────────────────────────────────────────────────────
   DIPTYCH PANELS — keyboard accessible + hover reveal
──────────────────────────────────────────────────────── */
(function initDiptych() {
  $$('.dip-panel').forEach(panel => {
    panel.setAttribute('tabindex', '0');
    panel.setAttribute('role', 'img');
    const label = panel.dataset.label || '';
    const cap   = panel.dataset.caption || '';
    if (label || cap) panel.setAttribute('aria-label', `${label} — ${cap}`);
  });
})();

/* ────────────────────────────────────────────────────────
   FULL-BLEED SECTIONS — subtle Ken Burns on scroll-in
──────────────────────────────────────────────────────── */
(function initFullbleed() {
  if (!matchMedia('(prefers-reduced-motion:no-preference)').matches) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      const img = e.target.querySelector('.fb-img');
      if (!img) return;
      if (e.isIntersecting) {
        img.style.transform = 'scale(1)';
        img.style.transition = 'transform 8s ease-out';
      }
    });
  }, { threshold: 0.1 });

  $$('.s-fullbleed').forEach(el => {
    const img = el.querySelector('.fb-img');
    if (img) { img.style.transform = 'scale(1.06)'; }
    obs.observe(el);
  });
})();

/* ────────────────────────────────────────────────────────
   NOW PAGE CARDS — click to expand detail
──────────────────────────────────────────────────────── */
(function initNowCards() {
  $$('.now-card').forEach(card => {
    const p = card.querySelector('p');
    if (!p) return;
    const full  = p.textContent.trim();
    const trunc = full.length > 130 ? full.slice(0, 130).trim() + '…' : null;
    if (!trunc) return;

    let open = false;
    p.textContent = trunc;

    const btn = document.createElement('button');
    btn.className   = 'nc-read-more';
    btn.textContent = 'Read more';
    btn.setAttribute('aria-expanded', 'false');
    btn.style.cssText = `
      display:block; background:none; border:none;
      font-family:var(--font-mono); font-size:.68rem;
      letter-spacing:.1em; text-transform:uppercase;
      color:var(--gold); cursor:pointer;
      margin-top:.65rem; padding:0;
      transition:opacity .2s;
    `;
    card.appendChild(btn);

    on(btn, 'click', () => {
      open = !open;
      p.textContent = open ? full : trunc;
      btn.textContent = open ? 'Read less' : 'Read more';
      btn.setAttribute('aria-expanded', String(open));
    });
  });
})();

/* ────────────────────────────────────────────────────────
   MEMORIAL HERO — parallax on scroll (now.html)
──────────────────────────────────────────────────────── */
(function initMemorialParallax() {
  if (!matchMedia('(prefers-reduced-motion:no-preference)').matches) return;
  const photo = document.querySelector('.mem-photo');
  const hero  = document.querySelector('.s-memorial');
  if (!photo || !hero) return;

  let ticking = false;
  on(window, 'scroll', () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      const rect = hero.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        const progress = -rect.top / window.innerHeight;
        photo.style.transform = `scale(1.06) translateY(${progress * 60}px)`;
      }
      ticking = false;
    });
    ticking = true;
  }, { passive: true });
})();

/* ────────────────────────────────────────────────────────
   TRIBUTE NUMBERS — count-up on scroll
──────────────────────────────────────────────────────── */
(function initTributeNumbers() {
  const nums = $$('.tribute-nums');
  nums.forEach(el => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        el.style.opacity = '0';
        el.style.transform = 'scale(.8)';
        el.style.transition = 'opacity 1.2s ease, transform 1.2s cubic-bezier(.16,1,.3,1)';
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            el.style.opacity = '0.07';
            el.style.transform = 'scale(1)';
          });
        });
        obs.unobserve(el);
      });
    }, { threshold: 0.3 });
    obs.observe(el);
  });
})();

/* ────────────────────────────────────────────────────────
   SCROLL-TRIGGERED SECTION EYEBROWS — type-on effect
──────────────────────────────────────────────────────── */
(function initEyebrowTypeOn() {
  if (!matchMedia('(prefers-reduced-motion:no-preference)').matches) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el   = e.target;
      const text = el.textContent;
      el.textContent = '';
      el.style.borderRight = '1px solid var(--gold)';

      let i = 0;
      const interval = setInterval(() => {
        el.textContent = text.slice(0, ++i);
        if (i >= text.length) {
          clearInterval(interval);
          setTimeout(() => el.style.borderRight = 'none', 400);
        }
      }, 38);
      obs.unobserve(el);
    });
  }, { threshold: 0.8 });

  // Only apply to hero eyebrows, not all of them (too aggressive)
  $$('.s-memorial .section-eyebrow, .s-memorial .mdb-month').forEach(el => {
    obs.observe(el);
  });
})();

/* ────────────────────────────────────────────────────────
   IN-MEMORIAM BLOCK — subtle glow pulse
──────────────────────────────────────────────────────── */
(function initInMemoriam() {
  const block = document.querySelector('.in-memoriam');
  if (!block) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      block.style.transition = 'box-shadow 1.5s ease';
      block.style.boxShadow  = '0 0 0 1px rgba(253,185,39,0.2), inset 3px 0 0 var(--gold), 0 4px 24px rgba(253,185,39,0.08)';
      obs.unobserve(block);
    });
  }, { threshold: 0.6 });
  obs.observe(block);
})();

/* ────────────────────────────────────────────────────────
   IMAGE LAZY LOAD with fade-in
──────────────────────────────────────────────────────── */
(function initImageFadeIn() {
  if (!('IntersectionObserver' in window)) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const img = e.target;
      img.style.opacity    = '0';
      img.style.transition = 'opacity .6s ease, filter .6s ease';
      img.style.filter     = 'blur(4px)';

      const loaded = () => {
        img.style.opacity = '1';
        img.style.filter  = img.dataset.filterFinal || '';
      };

      if (img.complete) loaded();
      else img.addEventListener('load', loaded, { once: true });
      obs.unobserve(img);
    });
  }, { rootMargin: '0px 0px 100px 0px', threshold: 0 });

  $$('img[loading="lazy"]').forEach(img => obs.observe(img));
})();

/* ────────────────────────────────────────────────────────
   NAV ACTIVE STATE — update based on current page filename
──────────────────────────────────────────────────────── */
(function syncActiveNav() {
  const current = window.location.pathname.split('/').pop() || 'index.html';
  $$('#nav-menu .nl').forEach(link => {
    const href = link.getAttribute('href') || '';
    const matches = href === current || (href === 'index.html' && current === '');
    link.classList.toggle('active', matches);
    if (matches) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
})();

/* ────────────────────────────────────────────────────────
   FOOTER BRAND NUMBER — random shimmer
──────────────────────────────────────────────────────── */
(function initFooterShimmer() {
  const num = document.querySelector('.fb-num');
  if (!num) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      num.style.transition = 'opacity 1.2s ease';
      num.style.opacity    = '0.6';
      setTimeout(() => { num.style.opacity = '0.4'; }, 1200);
      obs.unobserve(num);
    });
  }, { threshold: 0.5 });
  obs.observe(num);
})();

console.log('%c[KobeSite] All systems initialised. Mamba Out. 🐍', 'color:#FDB927;font-family:monospace;font-size:12px');

/* ═══════════════════════════════════════════════════════════
   IMAGE SYSTEM — Complete observer & lazy-load engine
   Works with images.css focal points and picture elements
   ═══════════════════════════════════════════════════════════ */

/* ── IMG-IN-VIEW: fires Ken Burns + content animations ──── */
(function initImgInView() {
  const targets = [
    '.s-fullbleed',
    '.s-diptych .dip-panel',
    '.gallery-img-wrap',
    '.s-photo-break',
    '.s-cta',
    '.s-memorial',
    '.page-hero-section',
    '.s-contact-hero',
    '.intro-img-col',
  ];

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('img-in-view');
      obs.unobserve(e.target);
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => obs.observe(el));
  });

  // Also observe the intro-img-col badge trigger
  document.querySelectorAll('.intro-img-col').forEach(el => {
    const badge = el.querySelector('.intro-img-badge');
    if (badge) {
      new IntersectionObserver(([e]) => {
        if (e.isIntersecting) el.classList.add('img-in-view');
      }, { threshold: 0.15 }).observe(el);
    }
  });
})();

/* ── LAZY IMAGE FADE-IN (replaces old initImageFadeIn) ───── */
(function initLazyFade() {
  // Mark all lazy images as loading
  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    if (img.complete && img.naturalWidth > 0) {
      img.classList.add('img-loaded', 'loaded');
      return;
    }
    img.classList.add('img-loading');
    const onLoad = () => {
      img.classList.remove('img-loading');
      img.classList.add('img-loaded', 'loaded');
    };
    img.addEventListener('load', onLoad, { once: true });
    img.addEventListener('error', () => img.classList.add('img-loaded'), { once: true });
  });

  // Also handle eager images
  document.querySelectorAll('img:not([loading="lazy"])').forEach(img => {
    if (img.complete) { img.classList.add('img-loaded', 'loaded'); return; }
    img.addEventListener('load', () => img.classList.add('img-loaded', 'loaded'), { once: true });
  });
})();

/* ── GALLERY LIGHTBOX (updated for <picture> elements) ───── */
(function initGalleryLightbox() {
  const wrap   = document.getElementById('gallery-img-wrap');
  const expand = document.getElementById('gc-expand');
  if (!wrap) return;

  const openLB = () => {
    // Get the img inside the picture element
    const img = wrap.querySelector('img');
    if (!img) return;

    const lb = document.createElement('div');
    lb.className = 'kb-lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Photo gallery — full size');

    lb.innerHTML = `
      <div class="lb-backdrop"></div>
      <div class="lb-inner">
        <picture>
          <source srcset="${img.src.replace('.png','.webp').replace(/^img-/,'img/img-')}" type="image/webp"/>
          <img src="${img.src}" alt="${img.alt}" class="lb-img"/>
        </picture>
        <button class="lb-close" aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
        <p class="lb-caption">${(img.alt||'').split('—')[0].trim()}</p>
      </div>`;

    document.body.appendChild(lb);
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => requestAnimationFrame(() => lb.classList.add('lb-open')));

    const close = () => {
      lb.classList.remove('lb-open');
      setTimeout(() => { lb.remove(); document.body.style.overflow = ''; }, 420);
    };

    lb.querySelector('.lb-backdrop').addEventListener('click', close);
    lb.querySelector('.lb-close').addEventListener('click', close);
    document.addEventListener('keydown', function h(e) {
      if (e.key === 'Escape') { close(); document.removeEventListener('keydown', h); }
    });
    lb.querySelector('.lb-close').focus();
  };

  // Trigger from expand button
  if (expand) expand.addEventListener('click', openLB);

  // Trigger from clicking gallery image
  const img = wrap.querySelector('img');
  if (img) {
    img.style.cursor = 'zoom-in';
    img.setAttribute('tabindex', '0');
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', 'Click to expand photo gallery');
    img.addEventListener('click', openLB);
    img.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLB(); }
    });
  }
})();

/* ── DIPTYCH PANELS — img-in-view trigger per panel ─────── */
(function initDiptychObserver() {
  const panelObs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (!e.isIntersecting) return;
      setTimeout(() => e.target.classList.add('img-in-view'), i * 120);
      panelObs.unobserve(e.target);
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.dip-panel').forEach(p => panelObs.observe(p));
})();

/* ── CINEMATIC FULLBLEED — stagger text content in ──────── */
(function initFullbleedTextReveal() {
  // fbc-eyebrow, fbc-title, fbc-sub already use CSS transitions
  // triggered by .img-in-view class added by initImgInView above
  // This just adds a slight delay between them via CSS (already handled)
})();

/* ── PHOTO BREAK — observer ─────────────────────────────── */
(function initPhotoBreakObserver() {
  document.querySelectorAll('.s-photo-break').forEach(el => {
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) el.classList.add('img-in-view');
    }, { threshold: 0.08 }).observe(el);
  });
})();

/* ── PAGE HERO PARALLAX (phs-img) ───────────────────────── */
(function initPageHeroParallax() {
  if (!matchMedia('(prefers-reduced-motion:no-preference)').matches) return;

  const heroes = document.querySelectorAll('.page-hero-section, .s-contact-hero');
  if (!heroes.length) return;

  let raf = false;
  window.addEventListener('scroll', () => {
    if (raf) return;
    raf = true;
    requestAnimationFrame(() => {
      const sy = window.scrollY;
      heroes.forEach(hero => {
        const img = hero.querySelector('.phs-img, .coh-bg img');
        if (!img) return;
        const rect = hero.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        const progress = -rect.top / window.innerHeight;
        img.style.transform = `scale(1.05) translateY(${progress * 35}px)`;
      });
      raf = false;
    });
  }, { passive: true });
})();

/* ── kt24 ENTERING STATE — set before page loads ────────── */
// The transition.js sets the overlay. We need #main to start
// in the hidden state set by html.kt24-entering.
// This runs on every page load.
(function initKt24State() {
  const html = document.documentElement;
  // If transition overlay is covering (transform=0%), entering state applies
  const overlay = document.getElementById('kt24-overlay');
  if (overlay && (overlay.style.transform === 'translateY(0%)' || overlay.style.transform === 'translateY(0)')) {
    html.classList.add('kt24-entering');
  }
})();

console.log('%c[KobeSite v5] All systems live. Mamba Out 🐍', 'color:#FDB927;font-family:monospace;font-size:11px;');
