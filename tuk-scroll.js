(() => {
  const secondScreen = document.getElementById('overview');
  if (!secondScreen) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const overview = secondScreen.querySelector('.project-overview');
  const thirdDescriptionLine = secondScreen.querySelector('.tuk-overview-lines span:nth-child(3)');
  const skills = secondScreen.querySelector('.tuk-overview-skills');
  const backdrop = document.querySelector('.tuk-fixed-backdrop');
  let moving = false;

  const positionSkills = () => {
    if (!overview || !thirdDescriptionLine || !skills) return;

    if (window.matchMedia('(max-width: 760px)').matches) {
      skills.style.removeProperty('left');
      skills.style.removeProperty('right');
      return;
    }

    const textRange = document.createRange();
    textRange.selectNodeContents(thirdDescriptionLine);
    const thirdLineRight = textRange.getBoundingClientRect().right;
    const screenRight = window.innerWidth - 3;
    const targetCenter = thirdLineRight + ((screenRight - thirdLineRight) / 2);
    const overviewLeft = overview.getBoundingClientRect().left;

    skills.style.left = `${targetCenter - overviewLeft}px`;
    skills.style.right = 'auto';
  };

  const updateBackdrop = () => {
    if (!backdrop) return;

    const secondScreenTop = secondScreen.offsetTop;
    const secondScreenHeight = secondScreen.offsetHeight;
    const blurProgress = Math.min(Math.max(window.scrollY / Math.max(secondScreenTop, 1), 0), 1);
    const fadeStart = secondScreenTop + (secondScreenHeight * 0.72);
    const fadeLength = Math.max(secondScreenHeight * 0.28, 1);
    const fadeProgress = Math.min(Math.max((window.scrollY - fadeStart) / fadeLength, 0), 1);

    backdrop.style.setProperty('--tuk-backdrop-blur', `${(blurProgress * 4).toFixed(2)}px`);
    backdrop.style.setProperty('--tuk-backdrop-opacity', `${(1 - fadeProgress).toFixed(3)}`);
  };

  positionSkills();
  updateBackdrop();
  window.addEventListener('resize', positionSkills, { passive: true });
  window.addEventListener('resize', updateBackdrop, { passive: true });
  window.addEventListener('scroll', updateBackdrop, { passive: true });
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
