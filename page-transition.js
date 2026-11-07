(() => {
  const card = document.querySelector('.project-card[href="tuk-tak-tok.html"]');
  if (!card) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let transitioning = false;

  card.addEventListener('click', event => {
    if (
      transitioning ||
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) return;

    const destination = card.href;
    if (reducedMotion.matches) return;

    const media = card.querySelector('.project-card__media');
    const sourceImage = media?.querySelector('img');
    if (!media || !sourceImage) return;

    event.preventDefault();
    transitioning = true;

    const bounds = media.getBoundingClientRect();
    const overlay = document.createElement('div');
    const image = sourceImage.cloneNode();
    const radius = getComputedStyle(card).borderRadius;

    overlay.className = 'project-transition-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    Object.assign(overlay.style, {
      top: `${bounds.top}px`,
      left: `${bounds.left}px`,
      width: `${bounds.width}px`,
      height: `${bounds.height}px`,
      borderRadius: radius
    });
    image.removeAttribute('loading');
    overlay.append(image);
    document.body.append(overlay);
    document.body.classList.add('project-transitioning');

    try {
      sessionStorage.setItem('portfolio:tuk-entry', '1');
    } catch (error) {}

    const animation = overlay.animate([
      {
        top: `${bounds.top}px`,
        left: `${bounds.left}px`,
        width: `${bounds.width}px`,
        height: `${bounds.height}px`,
        borderRadius: radius
      },
      {
        top: '0px',
        left: '0px',
        width: '100vw',
        height: '100vh',
        borderRadius: '0px'
      }
    ], {
      duration: 900,
      easing: 'cubic-bezier(.22, 1, .36, 1)',
      fill: 'forwards'
    });

    animation.finished
      .catch(() => {})
      .finally(() => window.location.assign(destination));
  });
})();
