    // CHATBOT: To add new Q&A pairs, add entries to the RESPONSES array in getBotResponse()
    // Each entry needs: keywords (array of strings) and reply (string, use \n for line breaks)

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) document.body.classList.add('has-reduced-motion');

    /* ============ LOADING SCREEN ============ */
    (function () {
      const bar = document.getElementById('loadBar');
      const screen = document.getElementById('loading-screen');
      if (prefersReducedMotion) {
        bar.style.width = '100%';
        setTimeout(() => {
          screen.classList.add('hidden');
          setTimeout(() => { screen.style.display = 'none'; }, 150);
        }, 80);
        return;
      }
      let pct = 0;
      const iv = setInterval(() => {
        pct += Math.random() * 15 + 5;
        if (pct >= 100) { pct = 100; clearInterval(iv); }
        bar.style.width = pct + '%';
        if (pct === 100) {
          setTimeout(() => {
            screen.classList.add('hidden');
            setTimeout(() => { screen.style.display = 'none'; }, 500);
          }, 200);
        }
      }, 80);
    })();

    /* ============ CUSTOM CURSOR ============ */
    (function () {
      const isTouchDevice = navigator.maxTouchPoints > 0;
      if (isTouchDevice || prefersReducedMotion || window.innerWidth <= 768) {
        document.body.classList.add('touch-device');
        return;
      }
      const dot = document.getElementById('cursor-dot');
      const ring = document.getElementById('cursor-ring');
      let rx = 0, ry = 0, mx = 0, my = 0;
      document.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; dot.style.left = mx + 'px'; dot.style.top = my + 'px'; }, { passive: true });
      (function lerp() {
        rx += (mx - rx) * 0.12;
        ry += (my - ry) * 0.12;
        ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
        requestAnimationFrame(lerp);
      })();
      document.querySelectorAll('a,button,[role="button"]').forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
      });
      document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'), { passive: true });
      document.addEventListener('mouseup', () => document.body.classList.remove('cursor-click'), { passive: true });
    })();

    /* ============ THREE.JS HERO — REMOVED (minimalist redesign) ============ */

    /* ============ THREE.JS GLOBE — REMOVED (minimalist redesign) ============ */

    /* ============ HEADER SCROLL ============ */
    (function () {
      const scrollProgress = document.getElementById('scrollProgress');
      const mainHeader = document.getElementById('mainHeader');
      const scrollToTopBtn = document.getElementById('scrollToTop');
      const sections = Array.from(document.querySelectorAll('section[id]'));
      const navLinks = Array.from(document.querySelectorAll('.nav-link'));
      let ticking = false;

      function updateOnScroll() {
        const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
        scrollProgress.style.width = scrolled + '%';

        mainHeader.classList.toggle('scrolled', window.scrollY > 50);
        scrollToTopBtn.classList.toggle('visible', window.scrollY > 400);

        let current = '';
        sections.forEach(section => {
          if (window.scrollY >= section.offsetTop - 120) current = section.id;
        });
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + current);
        });
        ticking = false;
      }

      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(updateOnScroll);
          ticking = true;
        }
      }, { passive: true });

      updateOnScroll();
    })();

    /* ============ SCROLL TO TOP ============ */
    document.getElementById('scrollToTop').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    /* ============ MOBILE NAV ============ */
    const navToggle = document.getElementById('navToggle');
    const mobileNav = document.getElementById('mobileNav');
    navToggle.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open);
      mobileNav.setAttribute('aria-hidden', !open);
      navToggle.innerHTML = open ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    });
    function closeMobileNav() {
      mobileNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      mobileNav.setAttribute('aria-hidden', 'true');
      navToggle.innerHTML = '<i class="fas fa-bars"></i>';
    }

    /* ============ TYPEWRITER ============ */
    (function () {
      const el = document.getElementById('typewriter');
      const phrases = ['Computer Engineering Student', 'Problem Solver', 'Open Source Contributor', 'Open to Opportunities'];
      if (prefersReducedMotion) {
        el.textContent = phrases[0];
        return;
      }
      let pi = 0, ci = 0, deleting = false;
      function tick() {
        const phrase = phrases[pi];
        el.textContent = deleting ? phrase.slice(0, ci--) : phrase.slice(0, ci++);
        let delay = deleting ? 50 : 90;
        if (!deleting && ci > phrase.length) { delay = 1800; deleting = true; }
        if (deleting && ci < 0) { ci = 0; deleting = false; pi = (pi + 1) % phrases.length; delay = 300; }
        setTimeout(tick, delay);
      }
      setTimeout(tick, 1200);
    })();

    /* ============ HERO TITLE WORD ANIMATION ============ */
    (function () {
      const words = document.querySelectorAll('.hero-title .word');
      if (prefersReducedMotion) {
        words.forEach(w => { w.style.opacity = '1'; w.style.transform = 'translateY(0)'; });
        return;
      }
      words.forEach((w, i) => {
        setTimeout(() => {
          w.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
          w.style.opacity = '1'; w.style.transform = 'translateY(0)';
        }, 300 + i * 100);
      });
    })();

    /* ============ INTERSECTION OBSERVER ANIMATIONS ============ */
    (function () {
      // Timeline items
      const tlItems = document.querySelectorAll('.tl-item');
      const tlObs = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
      }, { threshold: 0.2 });
      tlItems.forEach(i => tlObs.observe(i));

      // Skill bars
      const skillBars = document.querySelectorAll('.skill-bar-fill');
      const sbObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.style.width = e.target.dataset.width + '%';
            sbObs.unobserve(e.target);
          }
        });
      }, { threshold: 0.5 });
      skillBars.forEach(b => sbObs.observe(b));

      // Hex fills
      const hexes = document.querySelectorAll('.hex-shape');
      const hxObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.querySelector('.hex-fill').style.height = e.target.dataset.progress + '%';
            hxObs.unobserve(e.target);
          }
        });
      }, { threshold: 0.5 });
      hexes.forEach(h => hxObs.observe(h));

      // Portfolio cards stagger
      const portItems = document.querySelectorAll('.port-item');
      const piObs = new IntersectionObserver((entries) => {
        entries.forEach((e, idx) => {
          if (e.isIntersecting) {
            setTimeout(() => e.target.classList.add('visible'), idx * 80);
            piObs.unobserve(e.target);
          }
        });
      }, { threshold: 0.1 });
      portItems.forEach(p => piObs.observe(p));

      // About stats count-up
      const statNums = document.querySelectorAll('.stat-num[data-count]');
      if (prefersReducedMotion) {
        statNums.forEach(n => { n.textContent = n.dataset.count; });
      } else {
        const snObs = new IntersectionObserver((entries) => {
          entries.forEach(e => {
            if (e.isIntersecting) {
              const target = parseInt(e.target.dataset.count);
              let cur = 0;
              const iv = setInterval(() => {
                cur++;
                e.target.textContent = cur;
                if (cur >= target) clearInterval(iv);
              }, 100);
              snObs.unobserve(e.target);
            }
          });
        }, { threshold: 0.5 });
        statNums.forEach(n => snObs.observe(n));
      }
    })();

    /* ============ PORTFOLIO FILTER & SEARCH ============ */
    (function () {
      const filterBtns = document.querySelectorAll('.filter-btn');
      const items = document.querySelectorAll('.port-item');
      const searchInput = document.getElementById('portfolioSearch');
      let activeFilter = 'all';

      function applyFilters() {
        const q = searchInput.value.toLowerCase().trim();
        items.forEach(item => {
          const cat = item.dataset.category;
          const title = item.dataset.title.toLowerCase();
          const matchFilter = activeFilter === 'all' || cat === activeFilter;
          const matchSearch = !q || title.includes(q);
          item.classList.toggle('hidden', !(matchFilter && matchSearch));
        });
      }

      filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          filterBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          activeFilter = btn.dataset.filter;
          applyFilters();
        });
      });
      searchInput.addEventListener('input', applyFilters);
    })();

    /* ============ MOBILE PORTFOLIO FLIP (TAP TO OPEN/CLOSE) ============ */
    let portfolioFlipInitialized = false;
    function initPortfolioFlip() {
      const grid = document.getElementById('portfolioGrid');
      if (!grid) return;

      // Use event delegation on the grid container
      grid.onclick = (e) => {
        // Find the card that was clicked
        const item = e.target.closest('.port-item');
        if (!item) return;

        // Don't flip if clicking buttons or links
        if (e.target.closest('.port-btn') || e.target.closest('a')) return;

        const isFlipped = item.classList.contains('is-flipped');

        // Close others
        document.querySelectorAll('.port-item').forEach(i => {
          if (i !== item) i.classList.remove('is-flipped');
        });

        // Toggle current
        item.classList.toggle('is-flipped', !isFlipped);
      };

      if (!portfolioFlipInitialized) {
        document.addEventListener('click', (e) => {
          if (!e.target.closest('.port-item')) {
            document.querySelectorAll('.port-item').forEach(i => i.classList.remove('is-flipped'));
          }
        }, { passive: true });
        portfolioFlipInitialized = true;
      }
    }

    /* ============ LIVE GITHUB DATA ============ */
    (async function () {
      const username = 'nis6hal';
      const repoGrid = document.getElementById('ghRepoGrid');
      const statusEl = document.getElementById('ghStatus');
      const reposEl = document.getElementById('ghPublicRepos');
      const starsEl = document.getElementById('ghTotalStars');
      const followersEl = document.getElementById('ghFollowers');
      const languagesEl = document.getElementById('ghLanguages');
      const bannerEl = document.getElementById('ghActivityBanner');
      const latestCommitEl = document.getElementById('ghLatestCommit');
      if (!repoGrid || !statusEl || !reposEl || !starsEl) return;

      const repoDescriptions = {
        'Smart-Gate-Automation-Using-License-Plate-Recognition': 'Real-time edge AI license plate detection system designed for automated gate entry, barrier control, and vehicle tracking.',
        'Complaint-Management-System': 'A full-stack complaint logging and administrative grievance tracking system with status workflows and role management.',
        'ReadLib': 'Local-first digital library and reading companion with integrated PDF reader, progress tracking, and offline support.',
        'SentimentAnalyzer_NLP-': 'Natural Language Processing sentiment classifier analyzing text sentiment and emotion polarity with machine learning models.',
        'AI-Powered-Academic-Tutor': 'Interactive AI study assistant designed to provide conceptual explanations, guided tutoring, and engineering problem breakdown.',
        'Portfolio-website': 'Personal portfolio and showcase platform with custom interactive theme, live GitHub sync, responsive design, and SEO.',
        'Typing-Speed-Testing-Website': 'Interactive web application to measure, benchmark, and improve typing speed with real-time WPM and accuracy metrics.',
        'Star-Worthy-Repos': 'Curated collection and index of high-value open-source tools, developer utilities, and standout repositories.',
        'Nis6hal': 'Personal profile repository and developer portfolio showcase on GitHub.'
      };

      const langColors = {
        JavaScript: '#f1e05a',
        Python: '#3572A5',
        HTML: '#e34c26',
        CSS: '#563d7c',
        TypeScript: '#3178c6',
        'C++': '#f34b7d',
        C: '#555555'
      };

      function timeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 30) return `${days}d ago`;
        const months = Math.floor(days / 30);
        if (months < 12) return `${months}mo ago`;
        return `${Math.floor(months / 12)}y ago`;
      }

      function animateCount(el, target) {
        if (!el || isNaN(target)) return;
        const start = parseInt(el.textContent, 10) || 0;
        if (start === target) return;
        const duration = 600;
        const startTime = performance.now();
        function update(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(start + (target - start) * ease);
          if (progress < 1) requestAnimationFrame(update);
          else el.textContent = target;
        }
        requestAnimationFrame(update);
      }

      function renderRepos(repos) {
        if (!repos || !repos.length) return;
        repoGrid.innerHTML = repos.map(repo => {
          const description = repo.description || repoDescriptions[repo.name] || 'Public open-source repository on GitHub.';
          const language = repo.language || 'Code';
          const dotColor = langColors[language] || 'var(--accent-primary)';
          const updatedDate = timeAgo(repo.pushed_at || repo.updated_at);
          return `
            <article class="gh-repo-card">
              <div class="gh-repo-top">
                <h3 class="gh-repo-name"><a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">${repo.name}</a></h3>
                <span class="gh-repo-visibility">${repo.private ? 'Private' : 'Public'}</span>
              </div>
              <p class="gh-repo-desc">${description}</p>
              <div class="gh-repo-meta">
                <span class="gh-meta-pill"><span class="gh-lang-dot" style="background:${dotColor};"></span> ${language}</span>
                <span class="gh-meta-pill">Updated ${updatedDate}</span>
              </div>
              <div class="gh-repo-footer">
                <div class="gh-repo-stats">
                  <span title="Stars"><i class="fas fa-star"></i> ${repo.stargazers_count || 0}</span>
                  <span title="Forks"><i class="fas fa-code-branch"></i> ${repo.forks_count || 0}</span>
                </div>
                <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="gh-repo-link">Open Repo <i class="fas fa-arrow-right"></i></a>
              </div>
            </article>
          `;
        }).join('');
      }

      // Check cache first for instant load
      try {
        const cached = localStorage.getItem('nb_gh_live_cache_v1');
        if (cached) {
          const data = JSON.parse(cached);
          if (data && data.repos) {
            animateCount(reposEl, data.publicRepos);
            animateCount(starsEl, data.totalStars);
            if (followersEl) animateCount(followersEl, data.followers);
            if (languagesEl) animateCount(languagesEl, data.languagesCount);
            renderRepos(data.repos);
            if (data.latestEvent && bannerEl && latestCommitEl) {
              latestCommitEl.innerHTML = data.latestEvent;
              bannerEl.style.display = 'inline-flex';
            }
          }
        }
      } catch (e) { /* ignore cache read err */ }

      try {
        const [userRes, reposRes, eventsRes] = await Promise.allSettled([
          fetch(`https://api.github.com/users/${username}`),
          fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`),
          fetch(`https://api.github.com/users/${username}/events/public?per_page=5`)
        ]);

        if (userRes.status !== 'fulfilled' || !userRes.value.ok || reposRes.status !== 'fulfilled' || !reposRes.value.ok) {
          throw new Error('GitHub API rate-limited or unavailable');
        }

        const user = await userRes.value.json();
        const allRepos = await reposRes.value.json();
        const repos = allRepos.filter(repo => !repo.fork);
        const featuredRepos = repos.slice().sort((a, b) => new Date(b.pushed_at || b.updated_at) - new Date(a.pushed_at || a.updated_at)).slice(0, 6);
        const totalStars = repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
        const languages = new Set(repos.map(repo => repo.language).filter(Boolean));

        animateCount(reposEl, user.public_repos ?? repos.length);
        animateCount(starsEl, totalStars);
        if (followersEl) animateCount(followersEl, user.followers ?? 7);
        if (languagesEl) animateCount(languagesEl, languages.size || 4);

        renderRepos(featuredRepos);

        let eventText = '';
        if (eventsRes.status === 'fulfilled' && eventsRes.value.ok) {
          const events = await eventsRes.value.json();
          if (Array.isArray(events) && events.length) {
            const push = events.find(e => e.type === 'PushEvent') || events[0];
            if (push && bannerEl && latestCommitEl) {
              const repoName = push.repo?.name || 'repository';
              const when = timeAgo(push.created_at);
              eventText = `Latest activity: <strong>Pushed to <a href="https://github.com/${repoName}" target="_blank" rel="noopener noreferrer" style="color:var(--accent-primary);text-decoration:underline;">${repoName}</a></strong> (${when})`;
              latestCommitEl.innerHTML = eventText;
              bannerEl.style.display = 'inline-flex';
            }
          }
        }

        statusEl.textContent = 'Live data synced with GitHub • Showing active repositories.';

        // Save fresh cache
        try {
          localStorage.setItem('nb_gh_live_cache_v1', JSON.stringify({
            publicRepos: user.public_repos ?? repos.length,
            totalStars,
            followers: user.followers ?? 7,
            languagesCount: languages.size || 4,
            repos: featuredRepos,
            latestEvent: eventText
          }));
        } catch (e) { /* ignore cache write err */ }

      } catch (err) {
        console.warn('[GitHub] Note:', err.message);
        statusEl.textContent = 'Showing public repositories. Click any repo to view code live on GitHub.';
      }
    })();

    /* ============ PROJECT MODAL DATA ============ */
    const projectData = {
      'smart-bus': {
        title: 'Smart Bus Arrival Detector',
        content: `<p>A mobile app that helps daily commuters track buses live and receive ML-powered arrival estimates across Pokhara routes.</p>
    <h3>Key Features</h3>
    <ul><li>Live bus location updates on an interactive map</li><li>ML-powered ETA predictions with route awareness</li><li>Push alerts for approaching buses</li><li>Route-level commute planning support</li></ul>
    <h3>Tech Stack</h3><div class="modal-tech"><span>React Native</span><span>Firebase</span><span>Google Maps</span><span>Machine Learning</span></div>
    <h3>Highlights</h3><p>Built for real commuter scenarios with practical ETA accuracy and lightweight mobile performance.</p>`
      },
      'gate-automation': {
        title: 'Gate Automation — License Plate Detection',
        content: `<p>An edge AI system for real-time license plate recognition, designed for automated gate and parking control.</p>
    <h3>Key Features</h3>
    <ul><li>Real-time plate detection at 30 FPS</li><li>Support for Nepali and international plates</li><li>Automated gate/barrier control integration</li><li>Vehicle entry/exit logging with timestamps</li></ul>
    <h3>Tech Stack</h3><div class="modal-tech"><span>Python</span><span>OpenCV</span><span>TensorFlow</span><span>Arduino</span><span>SQLite</span></div>
    <h3>Highlights</h3><p>98%+ detection accuracy across varied lighting conditions. Sub-100ms latency on low-power hardware.</p>`
      },
      portfolio: {
        title: 'Portfolio Website',
        content: `<p>The minimalist portfolio website you're currently viewing — built from scratch with vanilla HTML, CSS, and JavaScript.</p>
    <h3>Key Features</h3>
    <ul><li>Rule-based AI chatbot with score-based keyword matching</li><li>Animated skill bars and hexagonal progress displays</li><li>Section-wise motion and scroll-triggered interactions</li><li>Responsive design with custom cursor and micro-animations</li></ul>
    <h3>Tech Stack</h3><div class="modal-tech"><span>HTML5</span><span>CSS3</span><span>JavaScript</span></div>
    <h3>Highlights</h3><p>Single-file frontend architecture with smooth performance and responsive behavior across devices.</p>`
      },
      cinevault: {
        title: 'CineVault',
        content: `<p>A movie discovery and tracking application powered by the TMDb API with a sleek, responsive dark UI.</p>
    <h3>Key Features</h3>
    <ul><li>Browse trending, top-rated, and upcoming films</li><li>Search by title, genre, or keyword</li><li>Detailed movie pages with trailers, cast, and reviews</li><li>Responsive dark theme with smooth transitions</li></ul>
    <h3>Tech Stack</h3><div class="modal-tech"><span>React</span><span>TMDb API</span><span>CSS3</span><span>React Router</span></div>
    <h3>Highlights</h3><p>Lazy-loaded images, infinite scroll, and debounced search for a fluid browsing experience.</p>`
      },
      readlib: {
        title: 'ReadLib — Book Management System',
        content: `<p>A local-first book management app with an integrated PDF reader. All data stays on your device via IndexedDB.</p>
    <h3>Key Features</h3>
    <ul><li>Add and manage books with cover thumbnails</li><li>Track reading progress (Planned / Reading / Completed)</li><li>Built-in PDF reader powered by pdf.js</li><li>Sort, filter, and search your library</li><li>Glassmorphism UI with toast notifications</li></ul>
    <h3>Tech Stack</h3><div class="modal-tech"><span>React</span><span>IndexedDB</span><span>pdf.js</span><span>Vite</span></div>
    <h3>Highlights</h3><p>Fully local-first — no server needed. Persistent storage survives browser restarts. Deployed on Vercel.</p>`
      },
      unilib: {
        title: 'UniLib — Library Management System',
        content: `<p>A full-stack library management system designed for universities, with book inventory, member management, and borrowing workflows.</p>
    <h3>Key Features</h3>
    <ul><li>Book inventory with search and filtering</li><li>Member registration and management</li><li>Borrow/return workflows with due dates</li><li>Admin analytics dashboard with charts</li></ul>
    <h3>Tech Stack</h3><div class="modal-tech"><span>React</span><span>Node.js</span><span>MongoDB</span><span>Express</span></div>
    <h3>Highlights</h3><p>REST API with JWT auth. Role-based access for admins and members. Deployed with Docker.</p>`
      }
    };

    /* ============ MODAL LOGIC ============ */
    function openModal(id, data, type) {
      const modal = document.getElementById(id);
      const d = projectData[data];
      if (!d) {
        console.error('[Modal] No data found for key:', data);
        return;
      }
      document.getElementById('modalTitle').textContent = d.title;
      document.getElementById('modalContent').innerHTML = d.content;
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
      modal.querySelector('.modal-close').focus();
    }
    function closeModal(id) {
      document.getElementById(id).classList.remove('open');
      document.body.style.overflow = '';
    }
    function openCertModal(imageSrc, title) {
      const modal = document.getElementById('projectModal');
      if (!modal) return;
      document.getElementById('modalTitle').textContent = title || 'Certificate';
      document.getElementById('modalContent').innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
          <p style="margin:0; color:var(--text-muted); font-size:13px;"><i class="fas fa-shield-alt" style="color:var(--accent-primary); margin-right:6px;"></i> Verified Credential Preview</p>
          <a href="${imageSrc}" target="_blank" rel="noopener noreferrer" class="port-btn" style="font-size:12px; padding:6px 14px;">
            <i class="fas fa-external-link-alt"></i> Open Original
          </a>
        </div>
        <div class="cert-preview-wrap">
          <img src="${imageSrc}" alt="${title || 'Certificate image'}" loading="lazy">
        </div>
      `;
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
      modal.querySelector('.modal-close').focus();
    }
    function bindCertificationPreviewButtons() {
      document.querySelectorAll('.read-more-btn[data-cert-image]').forEach(btn => {
        btn.onclick = (e) => {
          e.preventDefault();
          openCertModal(btn.dataset.certImage, btn.dataset.certTitle);
        };
      });
    }

    /* ============ DYNAMIC CERTIFICATE SLIDER (AUTO-DETECTS FROM IMAGES/CERTS) ============ */
    (async function initCertSlider() {
      const track = document.getElementById('certSliderTrack');
      const dotsContainer = document.getElementById('certSliderDots');
      const prevBtn = document.getElementById('certSliderPrev');
      const nextBtn = document.getElementById('certSliderNext');
      const viewport = document.getElementById('certSliderViewport');
      if (!track || !viewport) return;

      const fallbackCerts = [
        {
          file: 'Cloud&Devops.jpg',
          path: 'Images/Certs/Cloud%26Devops.jpg',
          title: 'Cloud & DevOps Training Certificate'
        },
        {
          file: 'FundsofDS.jpg',
          path: 'Images/Certs/FundsofDS.jpg',
          title: 'Fundamentals of Data Science Certificate'
        },
        {
          file: 'Gitcerts.jpg',
          path: 'Images/Certs/Gitcerts.jpg',
          title: 'Git & GitHub Certification'
        },
        {
          file: 'NTCcerts.jpg',
          path: 'Images/Certs/NTCcerts.jpg',
          title: 'Nepal Telecom (NTC) Internship Certificate'
        }
      ];

      function formatCertTitle(filename) {
        const base = filename.replace(/\.[^/.]+$/, '');
        if (/cloud/i.test(base) && /devops/i.test(base)) return 'Cloud & DevOps Training Certificate';
        if (/ds|datascience/i.test(base)) return 'Fundamentals of Data Science Certificate';
        if (/git/i.test(base)) return 'Git & GitHub Certification';
        if (/ntc/i.test(base) || /intern/i.test(base)) return 'Nepal Telecom (NTC) Internship Certificate';

        return base
          .replace(/([a-z])([A-Z])/g, '$1 $2')
          .replace(/[_-]+/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase())
          .trim() + ' Certificate';
      }

      let certList = fallbackCerts;

      // 1. Check local cache first
      try {
        const cached = localStorage.getItem('nb_certs_auto_cache');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length) certList = parsed;
        }
      } catch (e) {}

      // 2. Query GitHub repo contents dynamically so any newly added images in Images/Certs/ appear automatically
      try {
        const res = await fetch('https://api.github.com/repos/Nis6hal/Portfolio-website/contents/Images/Certs');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length) {
            const imgRegex = /\.(jpe?g|png|webp|svg)$/i;
            const certFiles = data.filter(item => item.type === 'file' && imgRegex.test(item.name));
            if (certFiles.length > 0) {
              certList = certFiles.map(f => ({
                file: f.name,
                path: `Images/Certs/${encodeURIComponent(f.name).replace(/%26/g, '%26')}`,
                title: formatCertTitle(f.name)
              }));
              try {
                localStorage.setItem('nb_certs_auto_cache', JSON.stringify(certList));
              } catch (e) {}
            }
          }
        }
      } catch (err) {
        console.warn('[CertSlider] Auto-sync notice:', err.message);
      }

      // 3. Render slides
      function renderTrack(list) {
        track.innerHTML = list.map(c => `
          <div class="cert-slide" data-cert-image="${c.path}" data-cert-title="${c.title}" tabindex="0" role="button" aria-label="View ${c.title}">
            <div class="cert-slide-inner">
              <div class="cert-img-container">
                <img src="${c.path}" alt="${c.title}" loading="lazy">
                <div class="cert-overlay">
                  <span class="cert-zoom-btn"><i class="fas fa-expand-alt"></i> Click to Verify</span>
                </div>
              </div>
              <div class="cert-meta-info">
                <h4>${c.title}</h4>
                <span class="cert-badge"><i class="fas fa-shield-alt"></i> Verified Credential</span>
              </div>
            </div>
          </div>
        `).join('');

        track.querySelectorAll('.cert-slide').forEach(slide => {
          slide.addEventListener('click', () => {
            openCertModal(slide.dataset.certImage, slide.dataset.certTitle);
          });
          slide.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openCertModal(slide.dataset.certImage, slide.dataset.certTitle);
            }
          });
        });
      }

      renderTrack(certList);

      let currentIndex = 0;
      let autoplayTimer = null;
      let startX = 0;
      let isSwiping = false;

      function getVisibleCount() {
        if (window.innerWidth <= 768) return 1;
        if (window.innerWidth <= 1024) return 2;
        return 3;
      }

      function getMaxIndex() {
        const visible = getVisibleCount();
        return Math.max(0, certList.length - visible);
      }

      function updateDots() {
        if (!dotsContainer) return;
        const maxIdx = getMaxIndex();
        const totalPositions = maxIdx + 1;
        dotsContainer.innerHTML = Array.from({ length: totalPositions }).map((_, i) => `
          <button class="cert-dot ${i === currentIndex ? 'active' : ''}" data-idx="${i}" aria-label="Go to certificate slide ${i + 1}"></button>
        `).join('');

        dotsContainer.querySelectorAll('.cert-dot').forEach(btn => {
          btn.addEventListener('click', () => {
            goToSlide(parseInt(btn.dataset.idx, 10));
          });
        });
      }

      function goToSlide(index) {
        const maxIdx = getMaxIndex();
        currentIndex = Math.max(0, Math.min(index, maxIdx));
        const slides = track.querySelectorAll('.cert-slide');
        if (!slides.length) return;

        const slideWidth = slides[0].getBoundingClientRect().width;
        const gap = window.innerWidth <= 768 ? 16 : 24;
        const offset = currentIndex * (slideWidth + gap);
        track.style.transform = `translateX(-${offset}px)`;

        if (prevBtn) prevBtn.disabled = currentIndex === 0;
        if (nextBtn) nextBtn.disabled = currentIndex >= maxIdx;

        if (dotsContainer) {
          dotsContainer.querySelectorAll('.cert-dot').forEach((d, i) => {
            d.classList.toggle('active', i === currentIndex);
          });
        }
      }

      function nextSlide() {
        const maxIdx = getMaxIndex();
        if (currentIndex >= maxIdx) {
          goToSlide(0);
        } else {
          goToSlide(currentIndex + 1);
        }
      }

      function prevSlide() {
        const maxIdx = getMaxIndex();
        if (currentIndex <= 0) {
          goToSlide(maxIdx);
        } else {
          goToSlide(currentIndex - 1);
        }
      }

      if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetAutoplay(); });
      if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetAutoplay(); });

      function startAutoplay() {
        if (prefersReducedMotion || certList.length <= getVisibleCount()) return;
        stopAutoplay();
        autoplayTimer = setInterval(nextSlide, 4000);
      }

      function stopAutoplay() {
        if (autoplayTimer) {
          clearInterval(autoplayTimer);
          autoplayTimer = null;
        }
      }

      function resetAutoplay() {
        stopAutoplay();
        startAutoplay();
      }

      viewport.addEventListener('mouseenter', stopAutoplay);
      viewport.addEventListener('mouseleave', startAutoplay);

      // Touch swipe support for mobile
      viewport.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isSwiping = true;
        stopAutoplay();
      }, { passive: true });

      viewport.addEventListener('touchend', (e) => {
        if (!isSwiping) return;
        isSwiping = false;
        const endX = e.changedTouches[0].clientX;
        const diff = startX - endX;
        if (Math.abs(diff) > 40) {
          if (diff > 0) nextSlide();
          else prevSlide();
        }
        startAutoplay();
      }, { passive: true });

      window.addEventListener('resize', () => {
        updateDots();
        goToSlide(currentIndex);
      });

      updateDots();
      goToSlide(0);
      startAutoplay();
    })();

    // Use event delegation for dynamically loaded projects
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.details-btn');
      if (btn) {
        openModal('projectModal', btn.dataset.project, 'project');
      }
    });
    bindCertificationPreviewButtons();
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => { closeModal('projectModal'); });
    });
    document.querySelectorAll('.modal').forEach(m => {
      m.addEventListener('click', (e) => { if (e.target === m) { closeModal('projectModal'); } });
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeModal('projectModal'); closeChatWindow(); } });

    /* ============ CONTACT FORM ============ */
    document.getElementById('contactForm').addEventListener('submit', async function (e) {
      e.preventDefault();
      const btn = this.querySelector('button[type="submit"]');
      const btnText = this.querySelector('.btn-text');
      const btnLoad = this.querySelector('.btn-loading');
      const form = this;

      btnText.style.display = 'none';
      btnLoad.style.display = 'inline-flex';
      btn.disabled = true;

      const payload = {
        name: this.querySelector('[name="name"]').value.trim(),
        email: this.querySelector('[name="email"]').value.trim(),
        subject: this.querySelector('[name="subject"]')?.value.trim() || 'Portfolio Contact',
        message: this.querySelector('[name="message"]').value.trim()
      };

      try {
        const res = await fetch('https://nischal-portfolio-api.onrender.com/api/contact/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        btnText.style.display = 'inline-flex';
        btnLoad.style.display = 'none';
        btn.disabled = false;

        if (res.ok) {
          // Show success message
          const successEl = document.createElement('div');
          successEl.style.cssText = 'margin-bottom:16px;padding:14px 18px;background:rgba(102,217,255,0.1);border:1px solid rgba(102,217,255,0.3);border-radius:10px;color:#66d9ff;font-size:13px;line-height:1.6;';
          successEl.innerHTML = '✅ <strong>Verification email sent!</strong> Please check your inbox and click the confirm link to send your message.';
          form.insertBefore(successEl, form.firstChild);
          form.reset();
          setTimeout(() => successEl.remove(), 10000);
        } else {
          const errEl = document.createElement('div');
          errEl.style.cssText = 'margin-bottom:16px;padding:14px 18px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:10px;color:#ef4444;font-size:13px;';
          errEl.textContent = '❌ ' + (data.error || 'Something went wrong. Please try again.');
          form.insertBefore(errEl, form.firstChild);
          setTimeout(() => errEl.remove(), 6000);
        }
      } catch (err) {
        btnText.style.display = 'inline-flex';
        btnLoad.style.display = 'none';
        btn.disabled = false;
        console.error('Contact form error:', err);
      }
    });

    /* ============ CHATBOT ============ */
    const RESPONSES = [

      /* ── Greetings ── */
      {
        keywords: ['hello', 'hi', 'hey', 'sup', 'good morning', 'good evening', 'howdy', 'what\'s up', 'wassup'],
        reply: 'Hey there! 👋 I\'m Nischal\'s virtual assistant.\nAsk me about his skills, projects, certifications, availability — or anything else.\nWhat would you like to know?'
      },

      /* ── Who is Nischal ── */
      {
        keywords: ['who', 'about', 'tell me about', 'introduce', 'yourself', 'nischal'],
        reply: 'Nischal Bhandari is a Computer Engineering student in his 8th semester at Pokhara University, Nepal — graduating in 2026.\n\nHe builds web apps, AI-integrated tools, and full-stack solutions through academic and independent projects.\n\nOutside the keyboard: gaming 🎮, music 🎵, and hiking the trails around Pokhara 🥾.'
      },

      /* ── Education ── */
      {
        keywords: ['study', 'university', 'college', 'degree', 'education', 'student', 'pokhara university', 'course', 'graduating', 'graduation', 'semester'],
        reply: '🎓 Nischal completed Science stream from Chhorepatan Secondary School in 2022 and is now in the final semester of BE Computer Engineering at Pokhara University, graduating in 2026.\n\nHis studies span algorithms, system design, computer networks, AI/ML, and software engineering, supported by practical project builds.'
      },

      /* ── Skills ── */
      {
        keywords: ['skill', 'know', 'tech', 'stack', 'what can you', 'capable', 'proficient'],
        reply: 'Here\'s Nischal\'s skill snapshot:\n\n⚙️ Technical\n🔹 HTML/CSS\n🔹 JavaScript\n🔹 React\n🔹 Python\n🔹 MongoDB\n\n🤝 Professional\n🔹 Problem Solving\n🔹 Communication\n🔹 Team Work\n🔹 Creativity\n\nCheck the Skills section for the full breakdown!'
      },

      /* ── Favourite tech ── */
      {
        keywords: ['favourite', 'favorite', 'enjoy', 'love', 'prefer', 'best tech', 'fav', 'fun to use', 'enjoy working'],
        reply: 'Nischal genuinely loves:\n\n⚛️ React — building fast, interactive UIs\n🐍 Python + AI/ML — turning data into something useful\n🗄️ MongoDB — modeling practical app data\n🐳 Docker — containerizing everything\n\nHe\'s happiest when these collide in one project. 😄'
      },

      /* ── All projects ── */
      {
        keywords: ['project', 'work', 'built', 'made', 'what have you', 'show me', 'examples'],
        reply: 'Nischal has built 6 flagship projects:\n\n🚌 Smart Bus Arrival Detector — Real-time bus tracking with ML ETAs\n🚗 Gate Automation — Smart license plate detection for automated gate flow\n🌐 Portfolio Website — this site! (HTML, CSS, JS)\n🎬 CineVault — Movie discovery app (React, TMDb API)\n📚 ReadLib — Local-first book manager with built-in PDF reader\n📖 UniLib — Full-stack university library management system\n\nOpen the Portfolio section for details or check github.com/nis6hal.'
      },

      /* ── Smart Bus ── */
      {
        keywords: ['smart bus', 'bus', 'eta', 'arrival', 'commute', 'pokhara routes', 'route tracking'],
        reply: '🚌 Smart Bus Arrival Detector\nA commuter-first mobile app that tracks bus locations in real time and predicts ETAs.\n\n✨ Highlights:\n• Live bus tracking on map\n• ML-powered ETA predictions\n• Push alerts for approaching buses\n• Built around Pokhara route patterns\n\nStack: React Native · Firebase · Google Maps · ML'
      },

      /* ── Gate Automation / SLPD ── */
      {
        keywords: ['license plate', 'slpd', 'gate', 'parking', 'detection', 'opencv', 'plate', 'automation'],
        reply: '🚗 Gate Automation — License Plate Detection\nEdge AI for real-time license plate recognition — built for automated gate and parking control.\n\n✨ Highlights:\n• 98%+ detection accuracy across lighting conditions\n• Sub-100ms latency on low-power hardware\n• Supports Nepali & international plates\n\nStack: Python · OpenCV · TensorFlow · Arduino · SQLite'
      },

      /* ── CineVault ── */
      {
        keywords: ['cinevault', 'cine vault', 'movie', 'film', 'tmdb'],
        reply: '🎬 CineVault\nA movie discovery and tracking app powered by the TMDb API.\n\n✨ Highlights:\n• Browse trending, top-rated, and upcoming films\n• Search by title or genre with debounced input\n• Detailed pages with trailers, cast, and reviews\n• Sleek dark responsive UI\n\nStack: React · TMDb API · CSS3 · React Router'
      },

      /* ── ReadLib ── */
      {
        keywords: ['readlib', 'read lib', 'book', 'pdf', 'reader', 'library management'],
        reply: '📚 ReadLib — Book Management System\nA local-first book management app with an integrated PDF reader.\n\n✨ Highlights:\n• All data stays on your device (IndexedDB)\n• Track reading progress: Planned / Reading / Completed\n• Built-in PDF reader powered by pdf.js\n• Glassmorphism UI with sort/filter\n\nStack: React · IndexedDB · pdf.js · Vite'
      },

      /* ── UniLib ── */
      {
        keywords: ['unilib', 'uni lib', 'university library', 'full stack library'],
        reply: '📖 UniLib — Library Management System\nA full-stack library system designed for universities.\n\n✨ Highlights:\n• Book inventory, member management, borrow/return workflows\n• Admin analytics dashboard with charts\n• REST API with JWT auth and role-based access\n• Deployed with Docker\n\nStack: React · Node.js · MongoDB · Express'
      },

      /* ── Certifications ── */
      {
        keywords: ['certification', 'certificate', 'certified', 'credential', 'aws', 'cloud', 'devops', 'data science'],
        reply: '🏆 Nischal holds certifications in:\n\n☁️ Cloud & DevOps Training — AWS core services, Docker, CI/CD pipelines, infrastructure automation\n📊 Fundamentals of Data Science — Statistical analysis, data visualization, intro ML with Python, Pandas, NumPy\n\nCheck the Certifications section on this page for credential links!'
      },

      /* ── Availability / hire / internship ── */
      {
        keywords: ['available', 'hire', 'hiring', 'freelance', 'internship', 'job', 'work with', 'open to work', 'opportunity', 'looking for work', 'intern'],
        reply: '🚀 Absolutely! Following his engineering internship at Nepal Telecom (NTC — Ranipauwa, Pokhara), Nischal is highly motivated and actively seeking new challenges and impact-driven roles.\n\nHe is currently open to:\n💻 Software Engineer / Developer positions (Full-stack / Frontend / Python)\n✨ Advanced Engineering Internships & Fellowships\n🤝 High-impact project collaborations & Freelance work\n🌍 Remote-first teams globally\n\nDirect Contact:\n📧 itisnischal@gmail.com\n📸 Instagram: @nis6hal (Fastest response!)\n\nLet\'s build something great together! 🔥'
      },

      /* ── Collaborate ── */
      {
        keywords: ['collab', 'collaborate', 'team up', 'partner', 'work together', 'co-found', 'build together'],
        reply: 'Nischal loves teaming up on interesting problems! 🤝\n\nStartup idea, side project, hackathon, open-source — he\'s genuinely open.\n\n📧 itisnischal@gmail.com\n📸 Instagram: @nis6hal\n\nBring the idea, he\'ll bring the code. 🚀'
      },

      /* ── Goals ── */
      {
        keywords: ['goal', 'dream', 'aspire', 'future', 'plan', 'ambition', 'next step', 'vision', 'where do you see'],
        reply: '🏆 Nischal\'s goals:\n\n🎓 Graduate in Computer Engineering from Pokhara University in 2026\n💼 Scale from his NTC engineering internship into high-impact developer & engineering roles\n🌍 Work globally, build products used by thousands\n🤖 Keep pushing frontiers in AI/ML and full-stack software systems\n\nFinal semester, proven project track record, actively looking. 🔥'
      },

      /* ── Hobbies ── */
      {
        keywords: ['hobby', 'hobbies', 'fun', 'free time', 'outside coding', 'interest', 'personal', 'besides work', 'when not coding'],
        reply: 'Outside of coding, Nischal is into:\n\n🎮 Gaming — unwinding after a long build session\n🎵 Music — always something playing while he codes\n🥾 Hiking — Pokhara has incredible trails\n\nStepping away from the screen genuinely makes him a sharper problem-solver. 🧠'
      },

      /* ── Languages spoken ── */
      {
        keywords: ['language', 'speak', 'nepali', 'english', 'hindi', 'fluent', 'tongue'],
        reply: 'Nischal speaks:\n\n🇬🇧 English — professional fluency\n🇳🇵 Nepali — native\n🇮🇳 Hindi — conversational\n\nHappy to communicate in any of the three! 😊'
      },

      /* ── Experience ── */
      {
        keywords: ['experience', 'year', 'how long', 'background', 'journey', 'started', 'when did'],
        reply: '⏱️ Nischal\'s journey:\n\n2022 — Completed Science stream at Chhorepatan Secondary School and started BE Computer Engineering at Pokhara University\n2025 — Built production-focused projects (React, Node.js) and AI systems (Gate Automation, CineVault, ReadLib)\nMay–Aug 2026 — Engineering Intern at Nepal Telecom (NTC — Ranipauwa, Pokhara)\n2026+ — Graduating and actively seeking software engineering & developer opportunities\n\nCurrently in 8th semester with 6+ projects shipped and telecom internship completed. 🔥'
      },

      /* ── Contact ── */
      {
        keywords: ['contact', 'reach', 'email', 'message', 'dm', 'instagram', 'insta', 'get in touch', 'how to contact'],
        reply: 'Best ways to reach Nischal:\n\n📧 Email: itisnischal@gmail.com\n📸 Instagram: @nis6hal — DMs very welcome!\n\nOr use the Contact form at the bottom of this page.\nHe typically replies within 24 hours. ⚡'
      },

      /* ── GitHub ── */
      {
        keywords: ['github', 'code', 'repository', 'repo', 'open source', 'source code'],
        reply: '💻 github.com/nis6hal\n\nAll of Nischal\'s public project repos live here — worth a browse!'
      },

      /* ── Social links ── */
      {
        keywords: ['linkedin', 'twitter', 'social', 'follow', 'network'],
        reply: 'Find Nischal across the web:\n\n📸 Instagram: @nis6hal (best for DMs)\n💼 LinkedIn: linkedin.com/in/nis6hal\n🐦 Twitter/X: @nis6hal\n💻 GitHub: github.com/nis6hal\n🔵 Facebook: facebook.com/nis6hal'
      },

      /* ── CV / Resume ── */
      {
        keywords: ['cv', 'resume', 'download', 'pdf'],
        reply: '📄 Hit the "Download CV" button in the hero section at the top of this page — it downloads directly!'
      },

      /* ── Location ── */
      {
        keywords: ['location', 'nepal', 'pokhara', 'based', 'from', 'where are you', 'city', 'country'],
        reply: '📍 Pokhara, Nepal 🇳🇵 — a city at the foot of the Annapurna Himalayas.\n\nNischal works fully remotely and is open to teams anywhere in the world.'
      },

      /* ── Thanks ── */
      {
        keywords: ['thank', 'thanks', 'appreciate', 'great', 'awesome', 'helpful', 'nice', 'cool', 'cheers'],
        reply: 'You\'re welcome! 😊 Feel free to ask anything else.\nIf you\'d like to connect with Nischal: itisnischal@gmail.com or DM @nis6hal on Instagram. 🚀'
      }

    ];
    const FALLBACK = "Hmm, I\'m not sure about that one! 🤔\n\nBest to reach Nischal directly:\n📧 itisnischal@gmail.com\n📸 Instagram: @nis6hal\n\nOr try one of the quick questions below — I\'m better with those! 😄";

    function getBotResponse(input) {
      const lower = input.toLowerCase().trim();
      if (!lower) return FALLBACK;

      const words = lower.split(/[^a-z0-9+.#-]+/).filter(Boolean);
      let best = { score: 0, reply: FALLBACK, matches: 0 };

      for (const item of RESPONSES) {
        let score = 0;
        let matches = 0;

        for (const kw of item.keywords) {
          const needle = kw.toLowerCase().trim();
          if (!needle) continue;

          if (needle.includes(' ')) {
            if (lower.includes(needle)) {
              matches++;
              score += 8 + needle.length;
            }
          } else {
            const exactWordHit = words.includes(needle);
            const partialHit = lower.includes(needle);
            if (exactWordHit || partialHit) {
              matches++;
              score += exactWordHit ? 6 + needle.length : 2 + Math.floor(needle.length / 2);
            }
          }
        }

        if (score > best.score || (score === best.score && matches > best.matches)) {
          best = { score, reply: item.reply, matches };
        }
      }

      return best.score > 0 ? best.reply : FALLBACK;
    }

    const chatToggle = document.getElementById('chatToggle');
    const chatWindow = document.getElementById('chatWindow');
    const chatClose = document.getElementById('chatClose');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const chatSend = document.getElementById('chatSend');
    let chatOpen = false, welcomeSent = false;

    function openChat() {
      chatOpen = true;
      chatWindow.classList.add('open');
      chatWindow.setAttribute('aria-hidden', 'false');
      chatToggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('chat-is-open');
      if (!welcomeSent) { welcomeSent = true; addBotMsg('👋 Hi! I\'m Nischal\'s virtual assistant.\nI can answer questions about his skills, projects, experience, and how to reach him.\nTry one of the quick questions below, or type your own!'); }
      if (window.innerWidth > 768) setTimeout(() => chatInput.focus(), 400);
    }
    function closeChatWindow() {
      chatOpen = false;
      chatWindow.classList.remove('open');
      chatWindow.setAttribute('aria-hidden', 'true');
      chatToggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('chat-is-open');
    }
    chatToggle.addEventListener('click', () => { chatOpen ? closeChatWindow() : openChat(); });
    chatClose.addEventListener('click', closeChatWindow);

    function timeStr() { const d = new Date(); return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0'); }

    function addBotMsg(text) {
      const wrap = document.createElement('div'); wrap.className = 'msg bot';
      const avatar = document.createElement('div'); avatar.className = 'msg-avatar'; avatar.setAttribute('aria-hidden', 'true'); avatar.textContent = 'N';
      const bubble = document.createElement('div'); bubble.className = 'msg-bubble';
      bubble.innerHTML = text.replace(/\n/g, '<br>');
      const time = document.createElement('span'); time.className = 'msg-time'; time.textContent = timeStr();
      bubble.appendChild(time);
      wrap.appendChild(avatar); wrap.appendChild(bubble);
      chatMessages.appendChild(wrap);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addUserMsg(text) {
      const wrap = document.createElement('div'); wrap.className = 'msg user';
      const bubble = document.createElement('div'); bubble.className = 'msg-bubble';
      bubble.textContent = text;
      const time = document.createElement('span'); time.className = 'msg-time'; time.textContent = timeStr();
      bubble.appendChild(time);
      wrap.appendChild(bubble);
      chatMessages.appendChild(wrap);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showTyping() {
      const wrap = document.createElement('div'); wrap.className = 'msg bot'; wrap.id = 'typingIndicator';
      const avatar = document.createElement('div'); avatar.className = 'msg-avatar'; avatar.setAttribute('aria-hidden', 'true'); avatar.textContent = 'N';
      const bubble = document.createElement('div'); bubble.className = 'msg-bubble';
      bubble.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
      wrap.appendChild(avatar); wrap.appendChild(bubble);
      chatMessages.appendChild(wrap);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    function hideTyping() { const el = document.getElementById('typingIndicator'); if (el) el.remove(); }

    function sendMsg() {
      const txt = chatInput.value.trim();
      if (!txt) return;
      chatInput.value = '';
      addUserMsg(txt);
      showTyping();
      setTimeout(() => { hideTyping(); addBotMsg(getBotResponse(txt)); }, 600);
    }

    chatSend.addEventListener('click', sendMsg);
    chatInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); sendMsg(); } });

    document.querySelectorAll('.quick-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        if (!chatOpen) openChat();
        chatInput.value = chip.textContent.replace(/^[^\w]*/, '').replace(/\?$/, '');
        sendMsg();
      });
    });

    // talkAI button removed in minimalist redesign (was "Hire Me Now")

    /* ============ GSAP SCROLL ANIMATIONS — REMOVED (minimalist redesign) ============ */

    /* ============ LIVE DATA LOADER ============ */
    const API_URL = 'https://nischal-portfolio-api.onrender.com';

    function calculateCurrentSemester() {
      const startYear = 2022;
      const startMonth = 8;
      const now = new Date();
      const monthsDiff = (now.getFullYear() - startYear) * 12 + (now.getMonth() + 1 - startMonth);
      return Math.max(1, Math.min(8, Math.floor(monthsDiff / 6) + 1));
    }

    function updateAboutStats({ projects = [], skills = [] }) {
      const projectsCountEl = document.getElementById('projectsCount');
      const semesterCountEl = document.getElementById('semesterCount');
      const technologiesCountEl = document.getElementById('technologiesCount');
      const technicalSkills = skills.filter(skill => skill.type === 'technical');
      const projectCount = projects.length || 6;
      const technologyCount = technicalSkills.length || 14;
      const semesterCount = calculateCurrentSemester();

      if (projectsCountEl) {
        projectsCountEl.dataset.count = String(projectCount);
        projectsCountEl.textContent = String(projectCount);
      }
      if (semesterCountEl) {
        semesterCountEl.dataset.count = String(semesterCount);
        semesterCountEl.textContent = String(semesterCount);
      }
      if (technologiesCountEl) {
        technologiesCountEl.dataset.count = String(technologyCount);
        technologiesCountEl.textContent = String(technologyCount);
      }
    }

    updateAboutStats({});

    async function loadLiveData() {
      const refreshToast = document.getElementById('refresh-toast');
      if (refreshToast) refreshToast.classList.add('show');
      let data;
      // Try up to 3 times with 15s timeout to handle Render cold starts
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const res = await fetch(API_URL + '/api/portfolio', { signal: AbortSignal.timeout(15000), cache: 'no-store' });
          if (!res.ok) throw new Error('API response not OK');
          data = await res.json();
          break; // success
        } catch (err) {
          console.warn('[Portfolio] API attempt ' + attempt + ' failed:', err.message);
          if (attempt === 3) {
            console.warn('[Portfolio] All attempts failed, using static content.');
            if (refreshToast) refreshToast.classList.remove('show');
            return;
          }
          await new Promise(r => setTimeout(r, 2000)); // wait 2s before retry
        }
      }
      if (refreshToast) refreshToast.classList.remove('show');

      const { projects, skills, content, certifications } = data;
      updateAboutStats({ projects, skills });

      /* ---- HERO DESCRIPTION ---- */
      if (content?.hero?.description) {
        const heroDesc = document.querySelector('.hero-desc');
        if (heroDesc) heroDesc.textContent = content.hero.description;
      }

      /* ---- ABOUT BIO PARAGRAPHS ---- */
      if (content?.about) {
        const aboutParas = document.querySelectorAll('.about-text p');
        const { bio1, bio2, bio3 } = content.about;
        if (aboutParas[0] && bio1) aboutParas[0].textContent = bio1;
        if (aboutParas[1] && bio2) aboutParas[1].textContent = bio2;
        if (aboutParas[2] && bio3) aboutParas[2].textContent = bio3;
      }

      /* ---- CONTACT INFO ---- */
      if (content?.contact) {
        const c = content.contact;
        // Email links
        if (c.email) {
          document.querySelectorAll('a[href^="mailto"]').forEach(el => {
            el.href = 'mailto:' + c.email;
          });
          const emailCard = document.querySelector('.contact-card p a[href^="mailto"]');
          if (emailCard) emailCard.textContent = c.email;
        }
        // Social links
        const socialMap = {
          github: '[aria-label="GitHub"]',
          linkedin: '[aria-label="LinkedIn"]',
          twitter: '[aria-label="Twitter"]',
          instagram: '[aria-label="Instagram"]',
          facebook: '[aria-label="Facebook"]'
        };
        Object.entries(socialMap).forEach(([key, sel]) => {
          if (c[key]) {
            document.querySelectorAll(sel).forEach(el => { el.href = c[key]; });
          }
        });
        // Location
        if (c.location) {
          document.querySelectorAll('.contact-card').forEach(card => {
            if (card.querySelector('.fa-map-marker-alt')) {
              const p = card.querySelector('p');
              if (p) p.textContent = c.location + ' 🇳🇵';
            }
          });
        }
      }

      /* ---- SECTION VISIBILITY TOGGLES ---- */
      if (content?.sections) {
        const s = content.sections;
        if (s.showGithubActivity === false) {
          const el = document.getElementById('github');
          if (el) el.style.display = 'none';
        }
      }

      /* ---- CERTIFICATIONS ---- */
      if (certifications?.length > 0) {
        const certGrid = document.getElementById('certificationsGrid');
        if (certGrid) {
          certGrid.innerHTML = certifications.map(cert => `
        <div class="service-card">
          <div class="service-icon-wrap"><i class="fas fa-certificate"></i></div>
          <h3>${cert.name}</h3>
          <p>${cert.issuer}</p>
          <div style="margin-top:12px;font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--text-muted);">${cert.date}</div>
          ${cert.credentialUrl ? `<a href="${cert.credentialUrl}" data-cert-image="${cert.credentialUrl}" data-cert-title="${cert.name}" class="read-more-btn" style="margin-top:12px;">Verify Credential</a>` : ''}
        </div>
      `).join('');
          bindCertificationPreviewButtons();
        }
      }

      /* ---- PROFESSIONAL SKILLS (STRENGTH CARDS) ---- */
      const proSkills = skills?.filter(s => s.type === 'professional') || [];
      if (proSkills.length > 0) {
        const grid = document.querySelector('.strength-grid');
        if (grid) {
          grid.innerHTML = '';
          const iconMap = {
            'Problem Solving': 'fa-lightbulb',
            'Communication': 'fa-comments',
            'Team Work': 'fa-users',
            'Creativity': 'fa-palette'
          };
          proSkills.forEach(skill => {
            const icon = iconMap[skill.name] || 'fa-star';
            const card = document.createElement('div');
            card.className = 'strength-card';
            card.innerHTML = `
              <div class="strength-icon"><i class="fas ${icon}"></i></div>
              <h4>${skill.name}</h4>
              ${skill.details ? `<p>${skill.details}</p>` : ''}
            `;
            grid.appendChild(card);
          });
        }
      }

      /* ---- TECHNICAL SKILLS (TECH CLOUD) ---- */
      const techSkills = skills?.filter(s => s.type === 'technical') || [];
      if (techSkills.length > 0) {
        const techStackGrid = document.querySelector('.tech-stack-grid');
        if (techStackGrid) {
          techStackGrid.innerHTML = '';
          // Group by category
          const groups = {};
          techSkills.forEach(s => {
            const cat = s.category || 'other';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(s);
          });

          const catNames = {
            'frontend': 'Frontend',
            'backend': 'Backend',
            'ai': 'AI & Data',
            'tools': 'Tools',
            'other': 'Other'
          };

          const iconMap = {
            'html5': 'devicon-html5-plain colored',
            'css3': 'devicon-css3-plain colored',
            'javascript': 'devicon-javascript-plain colored',
            'react': 'devicon-react-original colored',
            'python': 'devicon-python-plain colored',
            'mongodb': 'devicon-mongodb-plain colored',
            'express': 'devicon-express-original',
            'opencv': 'devicon-opencv-plain colored',
            'tensorflow': 'devicon-tensorflow-original colored',
            'git': 'devicon-git-plain colored',
            'docker': 'devicon-docker-plain colored',
            'node.js': 'devicon-nodejs-plain colored',
            'vercel': 'fas fa-rocket',
            'render': 'fas fa-server',
            'figma': 'devicon-figma-plain colored'
          };

          Object.keys(groups).sort().forEach(cat => {
            const group = document.createElement('article');
            group.className = 'tech-group';
            const itemsHtml = groups[cat].map(s => {
              const iconClass = iconMap[s.name.toLowerCase()] || 'fas fa-code';
              const isFA = iconClass.startsWith('fas') || iconClass.startsWith('fab');
              return `<span class="tech-tag">${isFA ? `<i class="${iconClass}"></i>` : `<i class="${iconClass}"></i>`} ${s.name}</span>`;
            }).join('');

            group.innerHTML = `
              <h4>${catNames[cat] || cat}</h4>
              <div class="tech-tags">${itemsHtml}</div>
            `;
            techStackGrid.appendChild(group);
          });
        }
      }

      /* ---- PORTFOLIO GRID ---- */
      if (projects?.length > 0) {
        const grid = document.getElementById('portfolioGrid');
        if (grid) {
          grid.innerHTML = '';
          projects.forEach(project => {
            const techHtml = (project.tech || []).map(t => `<span>${t}</span>`).join('');
            const catLabel = (project.category || 'web').charAt(0).toUpperCase() + (project.category || 'web').slice(1);

            projectData[project._id] = {
              title: project.title,
              content: project.details && project.details.trim()
                ? project.details
                : `
              <p>${project.overview || project.description}</p>

              <div class="modal-details-grid">
                <div class="modal-section">
                  <h3><i class="fas fa-rocket"></i> Key Features</h3>
                  <ul class="modal-list">
                    ${(project.features || []).length ? project.features.map(f => `<li>${f}</li>`).join('') : '<li>Custom developed functionality</li>'}
                  </ul>
                </div>
                <div class="modal-section">
                  <h3><i class="fas fa-star"></i> Highlights</h3>
                  <ul class="modal-list">
                    ${(project.highlights || []).length ? project.highlights.map(h => `<li>${h}</li>`).join('') : '<li>Optimized performance and UI</li>'}
                  </ul>
                </div>
              </div>

              <div class="modal-section" style="margin-top:20px;">
                <h3><i class="fas fa-code"></i> Tech Stack</h3>
                <div class="modal-tech">${(project.tech || []).map(t => `<span>${t}</span>`).join('')}</div>
              </div>

              <div class="modal-footer-actions">
                ${project.demo ? `<a href="${project.demo}" target="_blank" rel="noopener noreferrer" class="modal-btn modal-btn-primary"><i class="fas fa-external-link-alt"></i> Live Demo</a>` : ''}
                ${project.github ? `<a href="${project.github}" target="_blank" rel="noopener noreferrer" class="modal-btn modal-btn-outline"><i class="fab fa-github"></i> View Code</a>` : ''}
              </div>
            `
            };

            const item = document.createElement('div');
            item.className = 'port-item';
            item.dataset.category = project.category || 'web';
            item.dataset.title = project.title;
            item.innerHTML = `
          <div class="port-flipper">
            <div class="port-front">
              <img src="${project.image}" alt="${project.title}" loading="lazy" width="400" height="220">
              <div class="port-front-overlay">
                <h3>${project.title}</h3>
                <span class="port-cat-badge">${catLabel}</span>
              </div>
            </div>
            <div class="port-back">
              <div>
                <h3>${project.title}</h3>
                <p>${project.description}</p>
                <div class="port-tech">${techHtml}</div>
              </div>
              <div class="port-actions">
                <button class="port-btn details-btn" data-project="${project._id}"><i class="fas fa-info-circle"></i> Details</button>
                <a href="${project.github || 'https://github.com/nis6hal'}" target="_blank" rel="noopener noreferrer" class="port-btn"><i class="fab fa-github"></i> GitHub</a>
                <a href="${project.demo && project.demo.trim() !== '' ? project.demo : '#contact'}" ${project.demo && project.demo.trim() !== '' ? 'target="_blank" rel="noopener noreferrer"' : ''} class="port-btn"><i class="fas fa-external-link-alt"></i> Demo</a>
              </div>
            </div>
          </div>
        `;
            grid.appendChild(item);
          });

          grid.querySelectorAll('.details-btn').forEach(btn => {
            btn.addEventListener('click', () => openModal('projectModal', btn.dataset.project, 'project'));
          });

          const filterBtns = document.querySelectorAll('.filter-btn');
          const searchInput = document.getElementById('portfolioSearch');
          let activeFilter = 'all';
          function applyPortfolioFilters() {
            const q = searchInput ? searchInput.value.toLowerCase().trim() : '';
            document.querySelectorAll('.port-item').forEach(item => {
              const matchFilter = activeFilter === 'all' || item.dataset.category === activeFilter;
              const matchSearch = !q || item.dataset.title.toLowerCase().includes(q);
              item.classList.toggle('hidden', !(matchFilter && matchSearch));
            });
          }
          filterBtns.forEach(btn => {
            btn.replaceWith(btn.cloneNode(true));
          });
          document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
              document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
              btn.classList.add('active');
              activeFilter = btn.dataset.filter;
              applyPortfolioFilters();
            });
          });
          if (searchInput) {
            searchInput.oninput = applyPortfolioFilters;
          }

          const piObs = new IntersectionObserver((entries) => {
            entries.forEach((e, idx) => {
              if (e.isIntersecting) {
                setTimeout(() => e.target.classList.add('visible'), idx * 80);
                piObs.unobserve(e.target);
              }
            });
          }, { threshold: 0.1 });
          document.querySelectorAll('.port-item').forEach(p => piObs.observe(p));

          // Initialize touch flip for mobile
          initPortfolioFlip();
        }
      }

    } // end loadLiveData

    // Run on DOM ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadLiveData);
    } else {
      loadLiveData();
    }

    function setVH() {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    }
    setVH();
    window.addEventListener('resize', setVH);

    /* ===================== THEME TOGGLE LOGIC ===================== */
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      const themeIcon = themeToggle.querySelector('i');

      const updateThemeIcon = (theme) => {
        if (theme === 'light') {
          themeIcon.className = 'fas fa-sun';
        } else {
          themeIcon.className = 'fas fa-moon';
        }
      };

      const savedTheme = localStorage.getItem('theme') || 'dark';
      document.documentElement.setAttribute('data-theme', savedTheme);
      updateThemeIcon(savedTheme);

      themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
      });
    }
