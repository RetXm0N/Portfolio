(() => {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('primary-nav');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const setMenu = open => {
    document.body.classList.toggle('nav-open', open);
    toggle?.setAttribute('aria-expanded', String(open));
    const label = toggle?.querySelector('.sr-only');
    if (label) label.textContent = open ? '메뉴 닫기' : '메뉴 열기';
  };

  toggle?.addEventListener('click', () => setMenu(!document.body.classList.contains('nav-open')));
  nav?.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') setMenu(false); });

  const syncHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 24);
  window.addEventListener('scroll', syncHeader, { passive: true });
  syncHeader();

  const reveals = [...document.querySelectorAll('[data-reveal]')];
  if (reducedMotion.matches || !('IntersectionObserver' in window)) {
    reveals.forEach(element => element.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    reveals.forEach(element => observer.observe(element));
  }

  const ambientVideos = [...document.querySelectorAll('video[data-autoplay]')];
  if ('IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const video = entry.target;
        if (entry.isIntersecting && !document.hidden) {
          const playback = video.play();
          if (playback) playback.catch(() => {});
        } else video.pause();
      });
    }, { threshold: 0.15 });
    ambientVideos.forEach(video => videoObserver.observe(video));
  }
})();
