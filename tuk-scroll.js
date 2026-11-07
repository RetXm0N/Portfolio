(() => {
  const secondScreen = document.getElementById('overview');
  if (!secondScreen) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const overview = secondScreen.querySelector('.project-overview');
  const finalDescriptionLine = secondScreen.querySelector('.tuk-overview-lines span:last-child');
  const skills = secondScreen.querySelector('.tuk-overview-skills');
  let moving = false;

  const positionSkills = () => {
    if (!overview || !finalDescriptionLine || !skills) return;

    if (window.matchMedia('(max-width: 760px)').matches) {
      skills.style.removeProperty('left');
      skills.style.removeProperty('right');
      return;
    }

    const textRange = document.createRange();
    textRange.selectNodeContents(finalDescriptionLine);
    const finalLineRight = textRange.getBoundingClientRect().right;
    const screenRight = window.innerWidth - 3;
    const targetCenter = finalLineRight + ((screenRight - finalLineRight) / 2);
    const overviewLeft = overview.getBoundingClientRect().left;

    skills.style.left = `${targetCenter - overviewLeft}px`;
    skills.style.right = 'auto';
  };

  positionSkills();
  window.addEventListener('resize', positionSkills, { passive: true });
  document.fonts?.ready.then(positionSkills);

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
