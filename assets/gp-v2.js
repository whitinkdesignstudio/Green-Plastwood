/* GREENPLASTWOOD — v2: hero slider */
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

/* GREENPLASTWOOD — v2: journey timeline mobile slider */
(function () {
  var scroller = document.querySelector('.v2-journey .v2-tl-scroll');
  if (!scroller) return;
  var items = scroller.querySelectorAll('.v2-tl-item');
  var prevBtn = document.querySelector('.v2-tl-arrow--prev');
  var nextBtn = document.querySelector('.v2-tl-arrow--next');
  var dots = document.querySelectorAll('.v2-tl-dots .v2-tl-pdot');
  if (!items.length) return;

  function getActiveIndex() {
    var sl = scroller.scrollLeft;
    var idx = 0, minD = Infinity;
    items.forEach(function (el, i) {
      var d = Math.abs(el.offsetLeft - sl - 20);
      if (d < minD) { minD = d; idx = i; }
    });
    return idx;
  }

  function updateControls(idx) {
    if (idx === undefined) idx = getActiveIndex();
    dots.forEach(function (d, i) {
      d.classList.toggle('is-active', i === idx);
    });
    if (prevBtn) prevBtn.disabled = (idx === 0);
    if (nextBtn) nextBtn.disabled = (idx >= items.length - 1);
  }

  function scrollToIndex(idx) {
    if (idx < 0) idx = 0;
    if (idx >= items.length) idx = items.length - 1;
    var target = items[idx];
    if (target) {
      scroller.scrollTo({
        left: target.offsetLeft - 20,
        behavior: 'smooth'
      });
      updateControls(idx);
    }
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      var cur = getActiveIndex();
      scrollToIndex(cur - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      var cur = getActiveIndex();
      scrollToIndex(cur + 1);
    });
  }

  dots.forEach(function (d, i) {
    d.addEventListener('click', function () {
      scrollToIndex(i);
    });
  });

  var ticking = false;
  scroller.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        updateControls();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  updateControls(0);
})();
