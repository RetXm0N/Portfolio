(() => {
  'use strict';

  const line = document.createElement('div');
  line.id = 'scroll-progress';
  line.setAttribute('aria-hidden', 'true');
  document.body.append(line);

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let target = 0;
  let frame = 0;
  let lastTime = 0;

  function paint(value) {
    line.style.transform = `scaleY(${value})`;
  }

  function animate(now) {
    const elapsed = lastTime ? now - lastTime : 16;
    lastTime = now;
    current += (target - current) * (1 - Math.exp(-elapsed / 250));

    if (Math.abs(target - current) < 0.0001) {
      current = target;
      frame = 0;
      lastTime = 0;
    } else {
      frame = requestAnimationFrame(animate);
    }
    paint(current);
  }

  function update() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    target = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;

    if (reducedMotion.matches) {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
      current = target;
      paint(current);
    } else if (!frame && Math.abs(target - current) >= 0.0001) {
      frame = requestAnimationFrame(animate);
    }
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  window.addEventListener('load', update, { once: true });
  reducedMotion.addEventListener('change', update);
  if ('ResizeObserver' in window) new ResizeObserver(update).observe(document.body);
  update();
})();