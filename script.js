const highlight = document.querySelector("#highlight video");

if (highlight) {
  highlight.muted = true;
  highlight.loop = true;
  let inView = false;

  const syncPlayback = () => {
    if (inView && !document.hidden) {
      const playback = highlight.play();
      if (playback) playback.catch(() => {
        // Native controls remain available if automatic playback is blocked.
      });
    } else {
      highlight.pause();
    }
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncPlayback();
    }, { threshold: 0 });
    observer.observe(highlight);
  } else {
    const checkVisibility = () => {
      const rect = highlight.getBoundingClientRect();
      inView = rect.bottom > 0 && rect.top < window.innerHeight;
      syncPlayback();
    };
    window.addEventListener("scroll", checkVisibility, { passive: true });
    window.addEventListener("resize", checkVisibility);
    checkVisibility();
  }

  document.addEventListener("visibilitychange", syncPlayback);
}

const opening = document.getElementById("intro");
const firstContent = document.getElementById("page-1");

if (opening && firstContent) {
  const animatedPages = [1, 2, 11, 17, 23]
    .map(n => document.getElementById("page-" + n)).filter(Boolean);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const decodedImages = new WeakMap();
  let transitioning = false;
  let animating = false;
  let wheelQuietUntil = 0;
  let releaseTimer = 0;
  let touchStartY = null;
  let touchConsumed = false;
  let snappedKey = null;
  let scaleFrame = 0;
  let metrics = [];
  let openingHeight = 1;

  const pageTop = page => page.getBoundingClientRect().top + window.scrollY;
  const alignedTop = page => Math.floor(pageTop(page));

  const prepareImage = image => {
    if (!image) return Promise.resolve();
    if (!decodedImages.has(image)) {
      image.loading = "eager";
      const ready = image.decode ? image.decode().catch(() => {}) : Promise.resolve();
      decodedImages.set(image, ready);
    }
    return decodedImages.get(image);
  };
  const preparePage = page => prepareImage(page.querySelector("img"));

  // Prepare nearby covers before they enter the viewport, without hiding them.
  if ("IntersectionObserver" in window) {
    const preload = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          preparePage(entry.target);
          preload.unobserve(entry.target);
        }
      }
    }, { rootMargin: "100% 0px" });
    animatedPages.forEach(page => preload.observe(page));
  }
  preparePage(firstContent);

  const renderScales = (y = window.scrollY) => {
    const progress = Math.min(Math.max(y / openingHeight, 0), 1);
    opening.style.setProperty("--opening-scale",
      reducedMotion.matches ? "1.25" : String(1.25 - 0.5625 * progress));
    for (const { page, top } of metrics) {
      // Treat subpixel alignment as fully entered.
      const remaining = top - y;
      const entry = remaining <= 1 ? 0 : Math.min(remaining / Math.max(window.innerHeight, 1), 1);
      page.style.setProperty("--page-scale",
        reducedMotion.matches ? "1" : String(1 - .45 * entry));
    }
  };
  const refreshMetrics = () => {
    openingHeight = Math.max(opening.offsetHeight, 1);
    metrics = animatedPages.map(page => ({ page, top: pageTop(page) }));
    renderScales();
  };
  const scheduleScales = () => {
    if (animating || scaleFrame) return;
    scaleFrame = requestAnimationFrame(() => {
      scaleFrame = 0;
      if (!animating) renderScales();
    });
  };

  const forwardTarget = () => {
    const y = window.scrollY;
    return animatedPages.find(page => {
      const previous = page.previousElementSibling;
      return previous && y >= alignedTop(previous) - 1 && y < alignedTop(page) - 1;
    }) || null;
  };
  const backwardTarget = () => {
    const y = window.scrollY;
    const chapter = animatedPages.find(page => {
      const previous = page.previousElementSibling;
      return previous && y > alignedTop(previous) + 1 && y <= alignedTop(page) + 1;
    });
    return chapter ? chapter.previousElementSibling : null;
  };
  const releaseTransition = () => {
    clearTimeout(releaseTimer);
    const remaining = wheelQuietUntil - performance.now();
    if (remaining > 0) releaseTimer = window.setTimeout(releaseTransition, remaining);
    else transitioning = false;
  };

  const transitionTo = async target => {
    if (transitioning || !target) return;
    transitioning = true;
    // Keep the current frame until the destination image is ready to paint.
    await preparePage(target);
    refreshMetrics();
    const startY = window.scrollY;
    const targetY = alignedTop(target);
    const duration = reducedMotion.matches ? 0 : 500;
    const startedAt = performance.now();
    animating = true;
    if (scaleFrame) {
      cancelAnimationFrame(scaleFrame);
      scaleFrame = 0;
    }
    const step = now => {
      const progress = duration ? Math.min((now - startedAt) / duration, 1) : 1;
      const eased = 1 - Math.pow(1 - progress, 3);
      window.scrollTo(0, startY + (targetY - startY) * eased);
      // Position and zoom are committed together, rather than a scroll-event frame later.
      renderScales(window.scrollY);
      if (progress < 1) requestAnimationFrame(step);
      else {
        animating = false;
        releaseTransition();
      }
    };
    requestAnimationFrame(step);
  };

  window.addEventListener("scroll", scheduleScales, { passive: true });
  window.addEventListener("resize", refreshMetrics, { passive: true });
  window.addEventListener("load", refreshMetrics, { once: true });
  if ("ResizeObserver" in window) new ResizeObserver(refreshMetrics).observe(document.body);
  refreshMetrics();

  window.addEventListener("wheel", event => {
    if (event.ctrlKey || event.metaKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    if (transitioning) {
      wheelQuietUntil = performance.now() + 180;
      event.preventDefault();
      return;
    }
    const target = event.deltaY > 0 ? forwardTarget()
      : event.deltaY < 0 ? backwardTarget() : null;
    if (target) {
      wheelQuietUntil = performance.now() + 180;
      event.preventDefault();
      transitionTo(target);
      return;
    }
  }, { passive: false });

  window.addEventListener("touchstart", event => {
    touchStartY = event.touches.length === 1 ? event.touches[0].clientY : null;
    touchConsumed = false;
  }, { passive: true });
  window.addEventListener("touchmove", event => {
    if (touchStartY === null || event.touches.length !== 1) return;
    if (touchConsumed || transitioning) {
      event.preventDefault();
      return;
    }
    const delta = touchStartY - event.touches[0].clientY;
    const target = delta > 12 ? forwardTarget() : delta < -12 ? backwardTarget() : null;
    if (target) {
      touchConsumed = true;
      event.preventDefault();
      transitionTo(target);
    }
  }, { passive: false });
  const endTouch = () => { touchStartY = null; touchConsumed = false; };
  window.addEventListener("touchend", endTouch, { passive: true });
  window.addEventListener("touchcancel", endTouch, { passive: true });

  window.addEventListener("keydown", event => {
    if (event.target.closest("input, textarea, select, button, a, video, [contenteditable]")) return;
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const down = ["ArrowDown", "PageDown", " "].includes(event.key);
    const up = ["ArrowUp", "PageUp"].includes(event.key);
    if (!down && !up) return;
    if (transitioning || (event.repeat && snappedKey === event.key)) {
      event.preventDefault();
      return;
    }
    const target = down ? forwardTarget() : backwardTarget();
    if (target) {
      event.preventDefault();
      snappedKey = event.key;
      transitionTo(target);
    }
  });
  window.addEventListener("keyup", event => {
    if (event.key === snappedKey) snappedKey = null;
  });
}

/* Scroll the three installation strips along their original slopes. */
(() => {
  const page9 = document.getElementById("page-9");
  const page10 = document.getElementById("page-10");
  const pair = page9?.querySelector(".interaction-photo-pair");
  const upper = page10?.querySelector(".interaction-photo-upper");
  const lower = page10?.querySelector(".interaction-photo-lower");
  if (!pair && !upper && !lower) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let frame = 0;
  const clamp = value => Math.max(0, Math.min(1, value));

  const render = () => {
    frame = 0;
    if (reducedMotion.matches) {
      for (const photo of [pair, upper, lower]) {
        if (photo) photo.style.transform = "none";
      }
      return;
    }

    const viewport = Math.max(window.innerHeight, 1);
    if (pair) {
      const top = page9.getBoundingClientRect().top;
      // Begin just after page 9 approaches the viewport.
      const remaining = 1 - clamp((viewport * .8 - top) / (viewport * .72));
      pair.style.transform = `translate3d(${(-105 * remaining).toFixed(3)}%, ${(-26 * remaining).toFixed(3)}%, 0)`;
    }
    if (upper && lower) {
      const rect = page10.getBoundingClientRect();
      const width = rect.width;
      const upperStart = viewport * .88 - rect.height * .123;
      const settleTop = viewport * .14;
      const remainingUpper = 1 - clamp((upperStart - rect.top) / Math.max(upperStart - settleTop, 1));
      // Settle the last strip before page 10 becomes the active page.
      const remainingLower = 1 - clamp((viewport * .48 - rect.top) / (viewport * .34));
      upper.style.transform = `translate3d(${(width * 1.05 * remainingUpper).toFixed(2)}px, ${(width * .10 * remainingUpper).toFixed(2)}px, 0)`;
      lower.style.transform = `translate3d(${(-width * 1.05 * remainingLower).toFixed(2)}px, ${(width * .06 * remainingLower).toFixed(2)}px, 0)`;
    }
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(render);
  };

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  reducedMotion.addEventListener?.("change", schedule);
  render();
})();
