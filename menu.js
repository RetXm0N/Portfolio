(() => {
  const menu = document.getElementById('site-menu');
  if (!menu) return;

  const opener = menu.querySelector('.site-menu-toggle');
  const work = menu.querySelector('.site-menu-work');
  const connect = menu.querySelector('.site-menu-connect');
  const items = menu.querySelector('.site-menu-items');
  const workList = menu.querySelector('.site-menu-work-list');
  const links = [...menu.querySelectorAll('.site-menu-line')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let state = 'closed';

  const setState = next => {
    if (next === state) return;
    state = next;
    menu.classList.toggle('is-open', state !== 'closed');
    menu.classList.toggle('is-work', state === 'work');
    opener.setAttribute('aria-expanded', String(state !== 'closed'));
    opener.tabIndex = state === 'closed' ? 0 : -1;
    work.tabIndex = state === 'closed' ? -1 : 0;
    work.setAttribute('aria-expanded', String(state === 'work'));
    connect.tabIndex = state === 'menu' ? 0 : -1;
    links.forEach(link => { link.tabIndex = state === 'work' ? 0 : -1; });
    items.setAttribute('aria-hidden', String(state === 'closed'));
    workList.setAttribute('aria-hidden', String(state !== 'work'));
    if (state === 'closed' && document.activeElement === work) {
      opener.focus({ preventScroll: true });
    }
  };

  const navigateTo = id => {
    const target = document.getElementById(id);
    if (!target) return;
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    setState('closed');

    const image = target.querySelector('img');
    if (image) image.loading = 'eager';

    const destination = Math.floor(target.getBoundingClientRect().top + window.scrollY);
    window.scrollTo({
      top: destination,
      behavior: reducedMotion.matches ? 'auto' : 'smooth'
    });
  };

  opener.addEventListener('click', () => setState('menu'));
  work.addEventListener('click', () => setState(state === 'work' ? 'menu' : 'work'));
  connect.addEventListener('click', () => navigateTo('page-1'));
  ['page-2', 'page-11', 'page-17'].forEach((id, index) => {
    links[index].addEventListener('click', () => navigateTo(id));
  });
  document.addEventListener('pointerdown', event => {
    if (state !== 'closed' && !menu.contains(event.target)) {
      setState(state === 'work' ? 'menu' : 'closed');
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || state === 'closed') return;
    const next = state === 'work' ? 'menu' : 'closed';
    setState(next);
    (next === 'closed' ? opener : work).focus({ preventScroll: true });
  });
})();
