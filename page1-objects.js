(() => {
  'use strict';

  const page = document.getElementById('page-1');
  const background = page?.querySelector('.chapter-visual .portfolio-image');
  if (!page || !background) return;

  const SOURCE_W = 5834;
  const SOURCE_H = 3750;
  const objects = [
    { name: 'shell', x: 4724, y: 852, w: 244, h: 264 },
    { name: 'leaf', x: 4496, y: 1164, w: 232, h: 216 },
    { name: 'ring', x: 5072, y: 1140, w: 240, h: 240 },
    { name: 'bird', x: 4352, y: 1740, w: 232, h: 264 },
  ];
  const layer = document.createElement('div');
  layer.className = 'page-one-objects';
  layer.setAttribute('aria-hidden', 'true');
  page.append(layer);
  const states = objects.map(object => {
    const image = document.createElement('img');
    image.src = `Objects/page1-${object.name}.webp`;
    image.alt = '';
    image.draggable = false;
    image.decoding = 'async';
    layer.append(image);
    const state = { ...object, image, pixels: null, cx: 0, cy: 0,
      width: 0, height: 0, halfX: 0, halfY: 0,
      dx: 0, dy: 0, vx: 0, vy: 0,
      angle: 0, spin: 0, lastHit: -Infinity };
    const loadMask = () => {
      try {
        const mask = document.createElement('canvas');
        mask.width = object.w;
        mask.height = object.h;
        const context = mask.getContext('2d', { willReadFrequently: true });
        context.drawImage(image, 0, 0);
        state.pixels = context.getImageData(0, 0, object.w, object.h).data;
      } catch (_) {
        // The shape's bounds remain usable if pixel inspection is unavailable.
      }
    };
    if (image.complete && image.naturalWidth) loadMask();
    else image.addEventListener('load', loadMask, { once: true });
    return state;
  });

  let frame = 0;
  let lastFrame = 0;
  let pointer = null;
  let moving = false;
  let seenPage = false;
  let awaySince = null;
  let resetTimer = 0;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  function inView() {
    const rect = page.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < window.innerHeight;
  }

  function collide(pageWidth, pageHeight) {
    // Four objects give six pairs; resolve against their visible-size collision circles.
    for (let pass = 0; pass < 2; pass++) {
      for (let i = 0; i < states.length; i++) {
        for (let j = i + 1; j < states.length; j++) {
          const a = states[i], b = states[j];
          const minimum = .47 * (Math.min(a.width, a.height) + Math.min(b.width, b.height));
          const dx = b.cx - a.cx, dy = b.cy - a.cy;
          const distance = Math.hypot(dx, dy);
          if (distance >= minimum) continue;
          const nx = distance > .001 ? dx / distance : 1;
          const ny = distance > .001 ? dy / distance : 0;
          const massA = a.width * a.height, massB = b.width * b.height;
          const shareA = massB / (massA + massB);
          const shareB = 1 - shareA;
          const overlap = minimum - distance;
          const shiftA = -overlap * shareA, shiftB = overlap * shareB;
          a.cx += nx * shiftA; a.cy += ny * shiftA;
          b.cx += nx * shiftB; b.cy += ny * shiftB;
          a.dx += nx * shiftA; a.dy += ny * shiftA;
          b.dx += nx * shiftB; b.dy += ny * shiftB;

          const closing = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
          if (closing > 0) {
            const impulse = (1 + .72) * closing;
            a.vx = clamp(a.vx - impulse * shareA * nx, -1425, 1425);
            a.vy = clamp(a.vy - impulse * shareA * ny, -1425, 1425);
            b.vx = clamp(b.vx + impulse * shareB * nx, -1425, 1425);
            b.vy = clamp(b.vy + impulse * shareB * ny, -1425, 1425);
            if (Math.hypot(a.vx, a.vy, b.vx, b.vy) > 3) moving = true;
          }
        }
      }
      for (const object of states) {
        const x = clamp(object.cx, object.halfX, pageWidth - object.halfX);
        const y = clamp(object.cy, object.halfY, pageHeight - object.halfY);
        if (x !== object.cx) {
          object.dx += x - object.cx;
          object.cx = x;
          object.vx = -object.vx * .58;
        }
        if (y !== object.cy) {
          object.dy += y - object.cy;
          object.cy = y;
          object.vy = -object.vy * .58;
        }
      }
    }
  }

  function resetObjects() {
    for (const object of states) {
      object.dx = object.dy = object.vx = object.vy = 0;
      object.angle = object.spin = 0;
      object.lastHit = -Infinity;
    }
    moving = false;
    lastFrame = 0;
  }

  function syncPageVisibility() {
    if (!inView()) {
      if (seenPage && awaySince === null) {
        awaySince = performance.now();
        resetTimer = setTimeout(() => {
          resetTimer = 0;
          if (!inView()) resetObjects();
        }, 10000);
      }
      return;
    }
    seenPage = true;
    if (awaySince !== null) {
      clearTimeout(resetTimer);
      if (performance.now() - awaySince >= 10000) resetObjects();
      awaySince = null;
      resetTimer = 0;
    }
    requestFrame();
  }

  function draw() {
    const pageRect = page.getBoundingClientRect();
    const imageRect = background.getBoundingClientRect();
    if (!imageRect.width || !imageRect.height) return;

    // object-fit:contain positions the real artwork inside the image element.
    const artworkW = Math.min(imageRect.width, imageRect.height * SOURCE_W / SOURCE_H);
    const artworkH = artworkW * SOURCE_H / SOURCE_W;
    const left = imageRect.left + (imageRect.width - artworkW) / 2 - pageRect.left;
    const top = imageRect.top + (imageRect.height - artworkH) / 2 - pageRect.top;
    const scale = artworkW / SOURCE_W;

    for (const object of states) {
      object.width = object.w * scale;
      object.height = object.h * scale;
      const baseX = left + (object.x + object.w / 2) * scale;
      const baseY = top + (object.y + object.h / 2) * scale;
      const halfX = (Math.abs(Math.cos(object.angle)) * object.width +
        Math.abs(Math.sin(object.angle)) * object.height) / 2;
      const halfY = (Math.abs(Math.sin(object.angle)) * object.width +
        Math.abs(Math.cos(object.angle)) * object.height) / 2;
      const x = clamp(baseX + object.dx, halfX, pageRect.width - halfX);
      const y = clamp(baseY + object.dy, halfY, pageRect.height - halfY);
      if (x !== baseX + object.dx) {
        object.vx = -object.vx * .58;
        object.dx = x - baseX;
      }
      if (y !== baseY + object.dy) {
        object.vy = -object.vy * .58;
        object.dy = y - baseY;
      }
      object.cx = x;
      object.cy = y;
      object.halfX = halfX;
      object.halfY = halfY;
    }
    collide(pageRect.width, pageRect.height);
    for (const object of states) {
      object.image.style.width = `${object.width}px`;
      object.image.style.height = `${object.height}px`;
      object.image.style.transform =
        `translate3d(${object.cx - object.width/2}px,${object.cy - object.height/2}px,0) rotate(${object.angle}rad)`;
    }
  }

  function tick(now) {
    frame = 0;
    if (!inView() || document.hidden) { lastFrame = 0; return; }
    const dt = lastFrame ? Math.min((now - lastFrame) / 1000, .04) : 0;
    lastFrame = now;
    if (moving && dt) {
      moving = false;
      for (const object of states) {
        object.dx += object.vx * dt;
        object.dy += object.vy * dt;
        object.angle = clamp(object.angle + object.spin * dt, -.55, .55);
        object.vx *= Math.exp(-2.6 * dt);
        object.vy *= Math.exp(-2.6 * dt);
        object.spin *= Math.exp(-3.8 * dt);
        if (Math.abs(object.angle) >= .55) object.spin *= .3;
        if (Math.hypot(object.vx, object.vy) > 3 || Math.abs(object.spin) > .02)
          moving = true;
        else object.vx = object.vy = object.spin = 0;
      }
    }
    draw();
    if (moving) requestFrame();
    else lastFrame = 0;
  }

  function requestFrame() {
    if (!frame && inView() && !document.hidden) frame = requestAnimationFrame(tick);
  }

  function hitsPixel(object, px, py) {
    const cos = Math.cos(object.angle), sin = Math.sin(object.angle);
    const rx = px - object.cx, ry = py - object.cy;
    const x = (rx * cos + ry * sin) / object.width + .5;
    const y = (-rx * sin + ry * cos) / object.height + .5;
    if (x < 0 || x >= 1 || y < 0 || y >= 1) return false;
    if (!object.pixels) return true;
    const ix = Math.floor(x * object.w), iy = Math.floor(y * object.h);
    return object.pixels[(iy * object.w + ix) * 4 + 3] > 45;
  }

  window.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || !inView() || document.hidden) return;
    const previous = pointer;
    pointer = { x: event.clientX, y: event.clientY, time: event.timeStamp };
    if (!previous || !inView()) return;
    const rect = page.getBoundingClientRect();
    const ax = previous.x - rect.left, ay = previous.y - rect.top;
    const bx = pointer.x - rect.left, by = pointer.y - rect.top;
    if (bx < 0 || bx > rect.width || by < 0 || by > rect.height) return;
    const distance = Math.hypot(bx - ax, by - ay);
    if (distance < 2) return;
    const elapsed = Math.max(.008, (pointer.time - previous.time) / 1000);
    const nx = (bx - ax) / distance, ny = (by - ay) / distance;
    const speed = clamp(distance / elapsed, 160, 1150);
    let hit = false;
    for (const object of states) {
      if (event.timeStamp - object.lastHit < 160) continue;
      const radius = Math.hypot(object.width, object.height) / 2 + 5;
      const segmentX = clamp(object.cx, Math.min(ax, bx), Math.max(ax, bx));
      const segmentY = clamp(object.cy, Math.min(ay, by), Math.max(ay, by));
      if (Math.hypot(segmentX - object.cx, segmentY - object.cy) > radius) continue;
      const count = Math.ceil(distance / 4);
      for (let i = 0; i <= count; i++) {
        const x = ax + (bx - ax) * i / count;
        const y = ay + (by - ay) * i / count;
        if (!hitsPixel(object, x, y)) continue;
        object.vx = clamp(object.vx + nx * speed * 1.2, -1425, 1425);
        object.vy = clamp(object.vy + ny * speed * 1.2, -1425, 1425);
        const lever = ((x - object.cx) * ny - (y - object.cy) * nx) /
          Math.max(18, radius);
        object.spin = clamp(object.spin + lever * speed / 210, -2.8, 2.8);
        object.lastHit = event.timeStamp;
        moving = hit = true;
        break;
      }
    }
    if (hit) requestFrame();
  }, { passive: true });

  window.addEventListener('scroll', () => { pointer = null; syncPageVisibility(); }, { passive: true });
  window.addEventListener('resize', syncPageVisibility, { passive: true });
  document.addEventListener('visibilitychange', () => {
    pointer = null;
    if (!document.hidden) syncPageVisibility();
  });
  syncPageVisibility();
  background.addEventListener('load', requestFrame, { once: true });
})();
