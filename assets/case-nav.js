/**
 * case-nav.js — Dynamic case study pagination
 * Fetches the live list of VISIBLE projects from the API, finds where the
 * current page sits in that list, then rewrites the .case-pagination links
 * so that hidden projects never appear in Next / Prev navigation.
 *
 * Usage: include this script at the bottom of every Projects/*.html page.
 * It expects a <div class="case-pagination"> in the DOM.
 */
(async function () {
  const API_BASE =
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:3000'
      : 'https://nischal-portfolio-api.onrender.com';

  const pagination = document.querySelector('.case-pagination');
  if (!pagination) return;

  // Normalise a caseStudyUrl value to just its filename (e.g. "smart-bus.html")
  function filename(url) {
    if (!url) return '';
    return url.split('/').pop().toLowerCase();
  }

  // Current page filename
  const currentFile = filename(window.location.pathname);

  let projects = [];
  try {
    const res = await fetch(`${API_BASE}/api/projects`);
    if (!res.ok) throw new Error('API unavailable');
    const all = await res.json();
    // Keep only projects that have a caseStudyUrl (i.e. have a case study page)
    projects = all.filter(p => p.caseStudyUrl && p.caseStudyUrl.trim());
  } catch {
    // API unavailable — leave the existing static links in place
    return;
  }

  // Find current project index
  const idx = projects.findIndex(p => filename(p.caseStudyUrl) === currentFile);
  if (idx === -1) return; // Current page not in visible list — leave as-is

  const prev = idx > 0 ? projects[idx - 1] : null;
  const next = idx < projects.length - 1 ? projects[idx + 1] : null;

  function buildLink(project, direction) {
    // caseStudyUrl is relative to site root, e.g. "Projects/smart-bus.html"
    // We're already in the Projects/ folder, so strip the prefix
    const href = filename(project.caseStudyUrl);
    const label = direction === 'prev' ? 'Previous Case Study' : 'Next Case Study';
    const icon = direction === 'prev'
      ? `<i class="fas fa-arrow-left"></i> ${project.title}`
      : `${project.title} <i class="fas fa-arrow-right"></i>`;
    const style = direction === 'next' ? ' style="text-align:right;"' : '';
    return `
      <a href="${href}" class="case-page-btn"${style}>
        <span class="case-page-label">${label}</span>
        <span class="case-page-title">${icon}</span>
      </a>`;
  }

  // Back-to-portfolio link always present on left when no prev
  const backLink = `
    <a href="../index.html#portfolio" class="case-page-btn">
      <span class="case-page-label">Portfolio</span>
      <span class="case-page-title"><i class="fas fa-arrow-left"></i> All Projects</span>
    </a>`;

  let leftHTML = prev ? buildLink(prev, 'prev') : backLink;
  let rightHTML = next ? buildLink(next, 'next') : `
    <a href="../index.html#portfolio" class="case-page-btn" style="text-align:right;">
      <span class="case-page-label">Return</span>
      <span class="case-page-title">Back to Portfolio <i class="fas fa-home"></i></span>
    </a>`;

  pagination.innerHTML = leftHTML + rightHTML;
})();
