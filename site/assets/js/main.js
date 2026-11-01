(() => {
  const root = document.documentElement;
  const storage = {
    get(key) {
      try { return localStorage.getItem(key); } catch { return null; }
    },
    set(key, value) {
      try { localStorage.setItem(key, value); } catch { /* storage blocked */ }
    },
  };
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Theme toggle
  const themeToggles = document.querySelectorAll('[data-theme-toggle]');
  const themeColor = document.querySelector('meta[name="theme-color"]');
  const syncTheme = () => {
    const dark = root.dataset.theme === 'dark';
    themeToggles.forEach((btn) => btn.setAttribute('aria-pressed', String(dark)));
    if (themeColor) themeColor.content = dark ? '#06070c' : '#f7f7fa';
  };
  themeToggles.forEach((btn) => {
    btn.addEventListener('click', () => {
      root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      storage.set('theme', root.dataset.theme);
      syncTheme();
    });
  });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
    if (storage.get('theme')) return;
    root.dataset.theme = event.matches ? 'dark' : 'light';
    syncTheme();
  });
  syncTheme();

  // Header: glass background once scrolled, mobile menu
  const header = document.querySelector('[data-header]');
  const menuToggle = document.querySelector('[data-menu-toggle]');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
  if (header && menuToggle) {
    const setMenu = (open) => {
      header.classList.toggle('menu-open', open);
      menuToggle.setAttribute('aria-expanded', String(open));
    };
    menuToggle.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
    header.querySelectorAll('.nav a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && header.classList.contains('menu-open')) {
        setMenu(false);
        menuToggle.focus();
      }
    });
    document.addEventListener('click', (event) => {
      if (header.classList.contains('menu-open') && !header.contains(event.target)) setMenu(false);
    });
    window.matchMedia('(min-width: 861px)').addEventListener('change', (event) => {
      if (event.matches) setMenu(false);
    });
  }

  // Reveal on scroll
  const revealables = document.querySelectorAll('[data-reveal], [data-observe]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    revealables.forEach((el) => observer.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add('is-visible'));
  }

  // Cursor spotlight on cards (mouse only)
  document.querySelectorAll('[data-spotlight]').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      if (event.pointerType !== 'mouse') return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      card.style.setProperty('--my', `${event.clientY - rect.top}px`);
    });
  });

  // Copy-to-clipboard buttons
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    const label = btn.querySelector('[data-copy-label]');
    if (!label) return;
    const original = label.textContent;
    let timer;
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        label.textContent = 'Copied';
      } catch {
        label.textContent = 'Copy failed';
      }
      clearTimeout(timer);
      timer = setTimeout(() => { label.textContent = original; }, 2000);
    });
  });

  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
})();
