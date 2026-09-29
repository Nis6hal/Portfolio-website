/**
 * case-nav.js — Shared utilities for case study pages
 *
 * 1. CUSTOM CURSOR  — injects #cursor-dot + #cursor-ring (same as index.html)
 *    and wires up the same cursor behaviour as the main portfolio page.
 *    Runs synchronously so there is no flash of the native cursor.
 *
 * 2. DYNAMIC PAGINATION — fetches visible projects from the API, finds where
 *    the current page sits, then rewrites .case-pagination so hidden projects
 *    never appear in Next / Prev links.
 *
 * Usage: include as the last <script> in every Projects/*.html page.
 */

/* ── 1. CUSTOM CURSOR (synchronous — no timing gap) ─────────────────────── */
(function () {
  const isTouchDevice  = navigator.maxTouchPoints > 0;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (isTouchDevice || prefersReduced || window.innerWidth <= 768) {
    document.body.classList.add('touch-device');
    return;
  }

  // Re-use existing elements if they were already added to the HTML,
  // otherwise create them — matches what index.html does with hardcoded divs.
  let dot  = document.getElementById('cursor-dot');
  let ring = document.getElementById('cursor-ring');

  if (!dot) {
    dot = document.createElement('div');
    dot.id = 'cursor-dot';
    document.body.appendChild(dot);
  }
  if (!ring) {
    ring = document.createElement('div');
    ring.id = 'cursor-ring';
    document.body.appendChild(ring);
  }

  let rx = 0, ry = 0, mx = 0, my = 0;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  }, { passive: true });

  (function lerp() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(lerp);
  })();

  // Apply hover / click states to all interactive elements
  document.querySelectorAll('a, button, [role="button"]').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'),    { passive: true });
  document.addEventListener('mouseup',   () => document.body.classList.remove('cursor-click'), { passive: true });
})();

/* ── 2. DYNAMIC PAGINATION ───────────────────────────────────────────────── */
(async function () {
  const API_BASE =
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:3000'
      : 'https://nischal-portfolio-api.onrender.com';

  const pagination = document.querySelector('.case-pagination');
  if (!pagination) return;

  function filename(url) {
    if (!url) return '';
    return url.split('/').pop().toLowerCase();
  }

  const currentFile = filename(window.location.pathname);

  let projects = [];
  try {
    const res = await fetch(`${API_BASE}/api/projects`);
    if (!res.ok) throw new Error('API unavailable');
    const all = await res.json();
    projects = all.filter(p => p.caseStudyUrl && p.caseStudyUrl.trim());
  } catch {
    return; // API unavailable — leave existing static links in place
  }

  const idx = projects.findIndex(p => filename(p.caseStudyUrl) === currentFile);
  if (idx === -1) return;

  const prev = idx > 0                   ? projects[idx - 1] : null;
  const next = idx < projects.length - 1 ? projects[idx + 1] : null;

  function buildLink(project, direction) {
    const href  = filename(project.caseStudyUrl);
    const label = direction === 'prev' ? 'Previous Case Study' : 'Next Case Study';
    const icon  = direction === 'prev'
      ? `<i class="fas fa-arrow-left"></i> ${project.title}`
      : `${project.title} <i class="fas fa-arrow-right"></i>`;
    const style = direction === 'next' ? ' style="text-align:right;"' : '';
    return `
      <a href="${href}" class="case-page-btn"${style}>
        <span class="case-page-label">${label}</span>
        <span class="case-page-title">${icon}</span>
      </a>`;
  }

  const backLink = `
    <a href="../index.html#portfolio" class="case-page-btn">
      <span class="case-page-label">Portfolio</span>
      <span class="case-page-title"><i class="fas fa-arrow-left"></i> All Projects</span>
    </a>`;

  const leftHTML  = prev ? buildLink(prev, 'prev') : backLink;
  const rightHTML = next ? buildLink(next, 'next') : `
    <a href="../index.html#portfolio" class="case-page-btn" style="text-align:right;">
      <span class="case-page-label">Return</span>
      <span class="case-page-title">Back to Portfolio <i class="fas fa-home"></i></span>
    </a>`;

  pagination.innerHTML = leftHTML + rightHTML;
})();


/* ── 3. READING PROGRESS BAR ────────────────────────────────────────────── */
(function () {
  const header = document.querySelector('.case-nav');
  if (!header) return;
  let bar = document.querySelector('.case-reading-bar');
  if (!bar) {
    bar = document.createElement('div');
    bar.className = 'case-reading-bar';
    header.appendChild(bar);
  }
  function updateProgress() {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
    bar.style.width = Math.min(100, Math.max(0, progress)) + '%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
})();

/* ── 4. CODE COPY BUTTONS ───────────────────────────────────────────────── */
(function () {
  document.querySelectorAll('.code-copy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const parent = btn.closest('.code-window') || btn.closest('.case-challenge-box');
      const codeEl = parent ? parent.querySelector('code') : null;
      if (!codeEl) return;
      try {
        await navigator.clipboard.writeText(codeEl.innerText);
        const origHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check" style="color:var(--accent-primary);"></i> Copied!';
        setTimeout(() => { btn.innerHTML = origHTML; }, 2000);
      } catch (err) {
        console.warn('Copy failed:', err);
      }
    });
  });
})();

/* ── 5. IMAGE LIGHTBOX MODAL ────────────────────────────────────────────── */
(function () {
  const previewImg = document.querySelector('.case-banner-frame img');
  if (!previewImg) return;

  const lightbox = document.createElement('div');
  lightbox.className = 'case-lightbox';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-label', 'Image preview');
  lightbox.innerHTML = `
    <button class="case-lightbox-close" aria-label="Close image preview"><i class="fas fa-times"></i></button>
    <img src="${previewImg.src}" alt="${previewImg.alt}">
  `;
  document.body.appendChild(lightbox);

  const openLightbox = () => {
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  const closeLightbox = () => {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  };

  previewImg.addEventListener('click', openLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.closest('.case-lightbox-close')) {
      closeLightbox();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
  });
})();

/* ── 6. QUICK-JUMP SCROLLSPY ────────────────────────────────────────────── */
(function () {
  const quickLinks = document.querySelectorAll('.case-quick-link');
  if (!quickLinks.length) return;

  const targets = Array.from(quickLinks).map(link => {
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) return null;
    return document.getElementById(href.slice(1));
  }).filter(Boolean);

  function highlightOnScroll() {
    const scrollPos = window.scrollY + 130;
    let activeId = '';
    targets.forEach(section => {
      if (section.offsetTop <= scrollPos) {
        activeId = section.id;
      }
    });
    quickLinks.forEach(link => {
      const match = link.getAttribute('href') === '#' + activeId;
      link.classList.toggle('active', match);
    });
  }
  window.addEventListener('scroll', highlightOnScroll, { passive: true });
  highlightOnScroll();
})();

/* ── 7. PRODUCT SHOWCASE TAB SWITCHING ──────────────────────────────────── */
(function () {
  const tabBtns = document.querySelectorAll('.showcase-tab-btn');
  if (!tabBtns.length) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.tab;
      if (!targetId) return;

      tabBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.showcase-tab-pane').forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add('active');
      }
    });
  });
})();
