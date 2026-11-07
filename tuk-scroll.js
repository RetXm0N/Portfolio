(() => {
  const secondScreen = document.getElementById('overview');
  if (!secondScreen) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let moving = false;

  window.addEventListener('wheel', event => {
    const secondScreenTop = secondScreen.offsetTop;
    const isOnFirstScreen = window.scrollY < secondScreenTop - 2;

    if (event.deltaY <= 0 || !isOnFirstScreen) return;

    event.preventDefault();
    if (moving) return;

    moving = true;
    window.scrollTo({
      top: secondScreenTop,
      behavior: reducedMotion.matches ? 'auto' : 'smooth'
    });

    window.setTimeout(() => {
      moving = false;
    }, reducedMotion.matches ? 50 : 900);
  }, { passive: false });
})();
