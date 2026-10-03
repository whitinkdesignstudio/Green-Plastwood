/* GREEN PLASTWOOD — v2: hero slider */
(function () {
  var root = document.querySelector('[data-v2-slider]');
  if (!root) return;
  var hero = root.closest('.v2-hero');
  var slides = root.querySelectorAll('.v2-slide'), dots = hero.querySelectorAll('.v2-dot'), i = 0, timer;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function go(n) {
    i = (n + slides.length) % slides.length;
    slides.forEach(function (s, k) { s.classList.toggle('is-active', k === i); s.setAttribute('aria-hidden', k === i ? 'false' : 'true'); });
    dots.forEach(function (d, k) { d.classList.toggle('is-active', k === i); });
  }
  function start() { if (reduce || slides.length < 2) return; stop(); timer = setInterval(function () { go(i + 1); }, 6000); }
  function stop() { if (timer) clearInterval(timer); }
  hero.querySelector('.v2-arrow--prev').addEventListener('click', function () { go(i - 1); start(); });
  hero.querySelector('.v2-arrow--next').addEventListener('click', function () { go(i + 1); start(); });
  dots.forEach(function (d) { d.addEventListener('click', function () { go(+d.getAttribute('data-go')); start(); }); });
  hero.addEventListener('mouseenter', stop); hero.addEventListener('mouseleave', start);
  var sx = null;
  hero.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  hero.addEventListener('touchend', function (e) { if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) { go(i + (dx < 0 ? 1 : -1)); start(); } sx = null; });
  go(0); start();
})();
