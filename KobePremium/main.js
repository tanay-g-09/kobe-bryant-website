/* ══════════════════════════════════════════════════════════
   KOBE BRYANT — THE BLACK MAMBA
   Complete JavaScript — v3 Final
   ══════════════════════════════════════════════════════════ */
'use strict';

/* ── UTILITIES ──────────────────────────────────────────── */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);
const qs = (root, s) => root.querySelector(s);

/* ── THEME ──────────────────────────────────────────────── */
(function initTheme() {
  const saved = localStorage.getItem('kb-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
})();

/* ── LOADER ─────────────────────────────────────────────── */
on(window, 'load', () => {
  const loader = $('#loader');
  if (!loader) return;
  // Minimum display of 1.6s for cinematic effect
  const minTime = 1600;
  const startTime = performance.now();
  const hide = () => {
    const elapsed = performance.now() - startTime;
    const delay = Math.max(0, minTime - elapsed);
    setTimeout(() => {
      loader.classList.add('out');
      document.body.classList.add('hero-loaded');
      // Remove from DOM after transition
      setTimeout(() => loader.remove(), 900);
    }, delay);
  };
  hide();
});

/* ── CURSOR ─────────────────────────────────────────────── */
(function initCursor() {
  const dot  = $('#cur-dot');
  const ring = $('#cur-ring');
  if (!dot || !ring || !matchMedia('(pointer:fine)').matches) return;

  let rx = 0, ry = 0, mx = 0, my = 0;

  on(document, 'mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
  });

  // Smooth ring follow
  const follow = () => {
    rx += (mx - rx) * 0.11;
    ry += (my - ry) * 0.11;
    ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(follow);
  };
  follow();

  // Hover states
  on(document, 'mouseover', e => {
    if (e.target.closest('a,button,[role="button"]')) {
      dot.classList.add('hover');
      ring.classList.add('hover');
    }
  });
  on(document, 'mouseout', e => {
    if (e.target.closest('a,button,[role="button"]')) {
      dot.classList.remove('hover');
      ring.classList.remove('hover');
    }
  });
  on(document, 'mousedown', () => dot.classList.add('pressed'));
  on(document, 'mouseup', () => dot.classList.remove('pressed'));
})();

/* ── SCROLL PROGRESS ────────────────────────────────────── */
(function initScrollProgress() {
  const bar = $('#scroll-bar');
  if (!bar) return;
  const update = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + '%';
    bar.setAttribute('aria-valuenow', Math.round(scrollY / max * 100));
  };
  on(window, 'scroll', update, { passive: true });
  update();
})();

/* ── NAVBAR ─────────────────────────────────────────────── */
(function initNav() {
  const nav = $('#nav');
  if (!nav) return;
  const update = () => nav.classList.toggle('scrolled', scrollY > 60);
  on(window, 'scroll', update, { passive: true });
  update();
})();

/* ── MOBILE MENU ────────────────────────────────────────── */
(function initMenu() {
  const btn  = $('#menu-btn');
  const menu = $('#nav-menu');
  if (!btn || !menu) return;

  const open = () => {
    menu.classList.add('open');
    btn.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    menu.classList.remove('open');
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  on(btn, 'click', () => menu.classList.contains('open') ? close() : open());
  $$('#nav-menu .nl').forEach(l => on(l, 'click', close));
  on(document, 'keydown', e => e.key === 'Escape' && close());
})();

/* ── THEME TOGGLE ───────────────────────────────────────── */
(function initThemeToggle() {
  const btn  = $('#theme-btn');
  const html = document.documentElement;
  if (!btn) return;

  const apply = theme => {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('kb-theme', theme);
  };

  on(btn, 'click', () => {
    apply(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });
})();

/* ── INTERSECTION OBSERVERS ─────────────────────────────── */
(function initReveal() {
  // Section reveals
  const sectionObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in-view');
      sectionObs.unobserve(e.target);
    });
  }, { threshold: 0.07, rootMargin: '0px 0px -50px 0px' });

  $$('.reveal-section').forEach(el => sectionObs.observe(el));

  // Stagger parent/child reveals
  const staggerObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in-view');
      staggerObs.unobserve(e.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  $$('.stagger-parent').forEach(el => staggerObs.observe(el));

  // Timeline items
  const tlObs = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (!e.isIntersecting) return;
      setTimeout(() => e.target.classList.add('in-view'), i * 90);
      tlObs.unobserve(e.target);
    });
  }, { threshold: 0.15 });

  $$('.tl-item').forEach(el => tlObs.observe(el));
})();

/* ── STAT COUNTERS ──────────────────────────────────────── */
(function initCounters() {
  const ease = t => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;

  const animate = el => {
    const target = +el.dataset.target;
    const suffix = el.dataset.suffix || '';
    const dur    = 2000;
    const start  = performance.now();
    const tick = now => {
      const p = Math.min((now - start) / dur, 1);
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

/* ── PARALLAX HERO ──────────────────────────────────────── */
(function initParallax() {
  if (!matchMedia('(prefers-reduced-motion:no-preference)').matches) return;
  const photo   = $('.hero-photo');
  const content = $('.hero-content');
  const hero    = $('.s-hero');
  if (!hero || !photo) return;

  let ticking = false;
  on(window, 'scroll', () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      const y = scrollY;
      if (y < window.innerHeight) {
        photo.style.transform = `scale(1.03) translateY(${y * 0.28}px)`;
        if (content) {
          content.style.transform = `translateY(${y * 0.12}px)`;
          content.style.opacity   = Math.max(0, 1 - y / 600);
        }
      }
      ticking = false;
    });
    ticking = true;
  }, { passive: true });
})();

/* ── BACK TO TOP ────────────────────────────────────────── */
(function initBackTop() {
  const btn = $('#back-top');
  if (!btn) return;
  on(window, 'scroll', () => btn.classList.toggle('show', scrollY > 600), { passive: true });
  on(btn, 'click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* ── SMOOTH ANCHOR SCROLL ───────────────────────────────── */
$$('a[href^="#"]').forEach(a => {
  on(a, 'click', e => {
    const target = $(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    window.scrollTo({
      top: target.getBoundingClientRect().top + scrollY - 80,
      behavior: 'smooth'
    });
  });
});

/* ── MAGNETIC BUTTONS ───────────────────────────────────── */
(function initMagnetic() {
  if (!matchMedia('(pointer:fine)').matches) return;
  $$('.btn-gold,.btn-outline').forEach(btn => {
    on(btn, 'mousemove', e => {
      const r  = btn.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width/2)  * 0.14;
      const dy = (e.clientY - r.top  - r.height/2) * 0.14;
      btn.style.cssText += `transform:translate(${dx}px,${dy}px) translateY(-3px);transition:transform .08s`;
    });
    on(btn, 'mouseleave', () => {
      btn.style.transform = '';
      btn.style.transition = 'transform .5s cubic-bezier(.16,1,.3,1),box-shadow .25s,background .2s';
    });
  });
})();

/* ── 3D CARD TILT ───────────────────────────────────────── */
(function initTilt() {
  if (!matchMedia('(pointer:fine)').matches) return;
  $$('.mp-card,.ach-card,.now-card,.bg-card').forEach(card => {
    on(card, 'mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width  - 0.5) * 10;
      const y = ((e.clientY - r.top)  / r.height - 0.5) * 10;
      card.style.transform = `perspective(700px) rotateX(${-y}deg) rotateY(${x}deg) translateZ(10px)`;
      card.style.transition = 'transform .06s';
    });
    on(card, 'mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform .6s cubic-bezier(.16,1,.3,1),border-color .3s,box-shadow .3s,background .3s';
    });
  });
})();

/* ── CONTACT FORM ───────────────────────────────────────── */
(function initContactForm() {
  const form    = $('#contact-form');
  const success = $('#form-success');
  const submitBtn = $('#submit-btn');
  if (!form) return;

  // Auto-grow textarea
  $$('textarea', form).forEach(ta => {
    on(ta, 'input', () => { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px'; });
  });

  // Field validation
  const validate = field => {
    const wrap = field.closest('.field');
    if (!wrap) return true;
    let ok = field.value.trim() !== '';
    if (field.type === 'email') ok = ok && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
    wrap.classList.toggle('has-error', !ok);
    wrap.classList.toggle('has-ok', ok);
    return ok;
  };

  $$('input,textarea', form).forEach(f => {
    on(f, 'blur', () => validate(f));
    on(f, 'input', () => { if (f.closest('.field').classList.contains('has-error')) validate(f); });
  });

  on(form, 'submit', async e => {
    e.preventDefault();
    const fields = $$('input[required],textarea[required]', form);
    const ok = fields.map(validate).every(Boolean);
    if (!ok) return;

    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    await new Promise(r => setTimeout(r, 1400));

    form.classList.add('hidden');
    success.removeAttribute('hidden');
  });

  window.resetContactForm = () => {
    form.reset();
    $$('.field', form).forEach(w => w.classList.remove('has-error','has-ok'));
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
    form.classList.remove('hidden');
    success.setAttribute('hidden', '');
  };
})();

/* ── MARQUEE / TICKER PAUSE ON HOVER ───────────────────── */
(function initTicker() {
  const track = $('.ticker-track');
  if (!track) return;
  on(track.parentElement, 'mouseenter', () => track.style.animationPlayState = 'paused');
  on(track.parentElement, 'mouseleave', () => track.style.animationPlayState = 'running');
})();

/* ── QUOTE WORD-BY-WORD REVEAL ──────────────────────────── */
(function initQuoteReveal() {
  $$('blockquote p').forEach(p => {
    const words = p.textContent.split(' ');
    p.innerHTML = words.map((w,i) =>
      `<span class="q-word" style="--wi:${i}">${w}</span>`
    ).join(' ');
  });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      qs(e.target, 'p') && e.target.classList.add('words-visible');
      obs.unobserve(e.target);
    });
  }, { threshold: 0.4 });

  $$('blockquote').forEach(el => obs.observe(el));
})();

/* ── CANVAS PARTICLE BG (hero accent) ──────────────────── */
(function initParticles() {
  const canvas = $('#hero-particles');
  if (!canvas || !matchMedia('(prefers-reduced-motion:no-preference)').matches) return;
  const ctx = canvas.getContext('2d');
  let W, H, pts = [];

  const resize = () => {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  };
  resize();
  on(window, 'resize', resize);

  const GOLD = 'rgba(253,185,39,';
  for (let i = 0; i < 55; i++) {
    pts.push({
      x: Math.random() * 1,
      y: Math.random() * 1,
      r: Math.random() * 1.8 + 0.4,
      vx: (Math.random() - 0.5) * 0.0003,
      vy: (Math.random() - 0.5) * 0.0003,
      a: Math.random() * 0.5 + 0.1
    });
  }

  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = 1; if (p.x > 1) p.x = 0;
      if (p.y < 0) p.y = 1; if (p.y > 1) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x * W, p.y * H, p.r, 0, Math.PI * 2);
      ctx.fillStyle = GOLD + p.a + ')';
      ctx.fill();
    });
    requestAnimationFrame(draw);
  };
  draw();
})();

/* ── SNAKESKIN CANVAS (mamba section) ───────────────────── */
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
    t += 0.008;
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < 6; i++) {
      const phase = (i / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(0, H / 2);
      for (let x = 0; x <= W; x += 4) {
        const y = H/2 + Math.sin(x * 0.008 + t + phase) * (H * 0.08 * (i + 1) / 6);
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(253,185,39,${0.018 - i * 0.002})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    requestAnimationFrame(draw);
  };
  draw();
})();

/* ── SHARE FUNCTIONALITY ────────────────────────────────── */
(function initShare() {
  $$('[data-share]').forEach(btn => {
    on(btn, 'click', async () => {
      const data = {
        title: 'Kobe Bryant — The Black Mamba',
        text: 'A cinematic tribute to twenty years, five championships, and one obsession with greatness.',
        url: window.location.href
      };
      if (navigator.share) {
        try { await navigator.share(data); } catch(e) {}
      } else {
        navigator.clipboard?.writeText(window.location.href);
        const orig = btn.textContent;
        btn.textContent = 'Link copied!';
        setTimeout(() => btn.textContent = orig, 2000);
      }
    });
  });
})();

/* ── AUDIO EASTER EGG ───────────────────────────────────── */
(function initEasterEgg() {
  let keys = '';
  on(document, 'keydown', e => {
    keys += e.key.toLowerCase();
    if (keys.length > 5) keys = keys.slice(-5);
    if (keys === 'mamba') {
      document.body.classList.add('mamba-mode');
      setTimeout(() => document.body.classList.remove('mamba-mode'), 3000);
      keys = '';
    }
  });
})();

/* ── CONSOLE SIGNATURE ──────────────────────────────────── */
console.log(
  '%c 24 %c KOBE BEAN BRYANT %c\n%c"The most important thing is to try and inspire people\nso that they can be great in whatever they want to do."\n%c— 1978–2020 · Mamba Forever 🐍',
  'background:#FDB927;color:#000;font-size:28px;font-weight:900;padding:4px 8px;',
  'background:#552583;color:#FDB927;font-size:14px;font-weight:700;padding:4px 12px;letter-spacing:3px;',
  'background:transparent',
  'color:#FDB927;font-size:13px;font-style:italic;padding:8px 0;',
  'color:#888;font-size:11px;letter-spacing:2px;'
);
