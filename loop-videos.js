(() => {
  const videos = [...document.querySelectorAll(".portfolio-loop-video")];
  if (!videos.length) return;

  const nearby = new Set();
  const sync = video => {
    if (nearby.has(video) && !document.hidden) {
      const playback = video.play();
      if (playback) playback.catch(() => {});
    } else {
      video.pause();
    }
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) nearby.add(entry.target);
        else nearby.delete(entry.target);
        sync(entry.target);
      }
    }, { rootMargin: "800px 0px" });
    videos.forEach(video => observer.observe(video));
  } else {
    videos.forEach(video => nearby.add(video));
  }

  document.addEventListener("visibilitychange", () => videos.forEach(sync));
})();