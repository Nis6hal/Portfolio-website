/**
 * case-nav.js — Shared utilities for case study pages
 *
 * 1. CUSTOM CURSOR  — injects #cursor-dot + #cursor-ring and wires up the
 *    same cursor behaviour as the main portfolio page.
 *
 * 2. DYNAMIC PAGINATION — fetches visible projects from the API, finds where
 *    the current page sits, then rewrites .case-pagination so hidden projects
 *    never appear in Next / Prev links.
 *
 * Usage: include as the last <script> in every Projects/*.html page.
 */

/* ── 1. CUSTOM CURSOR ─────────────────────────────────────────────────────── */
(function () {
  const isTouchDevice  = navigator.maxTouchPoints > 0;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (isTouchDevice || prefersReduced || window.innerWidth <= 768) {
    document.body.classList.add('touch-device');
    return;
  }

  // Inject the two cursor elements if they don't already exist
  function ensureEl(id, styles) {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement('div');
      el.id = id;
      Object.assign(el.style, styles);
      document.body.appendChild(el);
    }
    return el;
  }

  // Styles match what styles.css defines via #cursor-dot / #cursor-ring,
  // but we set them inline as a fallback guarantee.
  const dot  = ensureEl('cursor-dot',  {});
  const ring = ensureEl('cursor-ring', {});

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

  // Normalise a caseStudyUrl to just its filename (e.g. "smart-bus.html")
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
    // Only projects that have a case study page
    projects = all.filter(p => p.caseStudyUrl && p.caseStudyUrl.trim());
  } catch {
    // API unavailable — leave existing static links in place
    return;
  }

  const idx = projects.findIndex(p => filename(p.caseStudyUrl) === currentFile);
  if (idx === -1) return; // This page isn't in the visible list — leave as-is

  const prev = idx > 0                   ? projects[idx - 1] : null;
  const next = idx < projects.length - 1 ? projects[idx + 1] : null;

  function buildLink(project, direction) {
    const href  = filename(project.caseStudyUrl); // We're already in Projects/
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
