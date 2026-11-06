(() => {
  "use strict";
  const stage = document.getElementById("intro");
  const video = stage?.querySelector(".opening-video");
  if (!video) return;
  video.muted = true;
  video.defaultMuted = true;
  video.loop = true;
  video.playsInline = true;
  let visible = stage.getBoundingClientRect().bottom > 0 &&
    stage.getBoundingClientRect().top < window.innerHeight;
  const syncPlayback = () => {
    if (visible && !document.hidden) {
      const playing = video.play();
      if (playing) playing.catch(() => {
        // The lightweight poster remains visible if autoplay is blocked.
      });
    } else {
      video.pause();
    }
  };
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncPlayback();
    }, { threshold: 0 }).observe(stage);
  } else {
    window.addEventListener("scroll", () => {
      const box = stage.getBoundingClientRect();
      visible = box.bottom > 0 && box.top < window.innerHeight;
      syncPlayback();
    }, { passive: true });
  }
  document.addEventListener("visibilitychange", syncPlayback);
  syncPlayback();
})();
