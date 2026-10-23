/* Greenplastwood — redesign behaviour (products page + product pages) */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* reveal on scroll */
  var els = document.querySelectorAll('.rd-in');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { io.observe(el); });
  } else { els.forEach(function (el) { el.classList.add('is-in'); }); }

  /* hero slider */
  document.querySelectorAll('[data-rd-slider]').forEach(function (sl) {
    var slides = sl.querySelectorAll('.rd-slide'), dots = sl.querySelectorAll('.rd-sl-dots i'), i = 0, timer = null;
    if (slides.length < 2) { var nv = sl.querySelector('.rd-sl-nav'); if (nv) nv.hidden = true; }
    function show(n) {
      i = (n + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle('is-on', k === i); s.setAttribute('aria-hidden', k === i ? 'false' : 'true'); });
      dots.forEach(function (d, k) { d.classList.toggle('is-on', k === i); });
    }
    function auto() { if (reduce || slides.length < 2) return; clearInterval(timer); timer = setInterval(function () { show(i + 1); }, 5000); }
    var p = sl.querySelector('[data-rd-prev]'), n = sl.querySelector('[data-rd-next]');
    if (p) p.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); show(i - 1); auto(); });
    if (n) n.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); show(i + 1); auto(); });
    var x0 = null;
    sl.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    sl.addEventListener('touchend', function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) > 40) { show(i + (dx < 0 ? 1 : -1)); auto(); } });
    sl.addEventListener('mouseenter', function () { clearInterval(timer); });
    sl.addEventListener('mouseleave', auto);
    show(0); auto();
  });

  /* gallery track arrows */
  document.querySelectorAll('[data-rd-track]').forEach(function (w) {
    var tr = w.querySelector('.rd-gal-track'), p = w.querySelector('.rd-gal-btn--prev'), n = w.querySelector('.rd-gal-btn--next');
    function upd() { if (!p || !n) return; p.disabled = tr.scrollLeft < 8; n.disabled = tr.scrollLeft + tr.clientWidth > tr.scrollWidth - 8; }
    function step() { var a = tr.querySelector('a'); return a ? a.getBoundingClientRect().width + 16 : tr.clientWidth; }
    if (p) p.addEventListener('click', function () { tr.scrollBy({ left: -step(), behavior: 'smooth' }); });
    if (n) n.addEventListener('click', function () { tr.scrollBy({ left: step(), behavior: 'smooth' }); });
    tr.addEventListener('scroll', function () { window.requestAnimationFrame(upd); }, { passive: true });
    window.addEventListener('resize', upd); upd();
  });

  /* "View all shades / designs" panel */
  document.querySelectorAll('[data-rd-toggle]').forEach(function (b) {
    var t = document.getElementById(b.getAttribute('data-rd-toggle'));
    if (!t) return;
    var lbl = b.querySelector('span'), open0 = lbl ? lbl.textContent : '';
    b.addEventListener('click', function (e) {
      e.preventDefault();
      var open = t.hasAttribute('hidden');
      if (open) t.removeAttribute('hidden'); else t.setAttribute('hidden', '');
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (lbl) lbl.textContent = open ? (b.getAttribute('data-rd-close') || 'Close') : open0;
      if (open) t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    });
  });

  /* open closed panels / accordions / tabs when the URL points inside them */
  function reveal(h) {
    if (!h) return;
    var el = document.getElementById(h);
    var tab = document.querySelector('.rd-page .gp-tab[data-tab="' + h + '"]');
    if (tab) { tab.click(); el = el || tab; }
    if (!el) { var t2 = document.querySelector('.gp-tab[data-tab="' + h + '"]'); if (t2) el = t2; }
    if (!el) return;
    var d = el.closest('details'); if (d && !d.open) d.open = true;
    var hid = el.closest('[hidden]'); if (hid && hid.id) { hid.removeAttribute('hidden'); var b = document.querySelector('[data-rd-toggle="' + hid.id + '"]'); if (b) b.setAttribute('aria-expanded', 'true'); }
  }
  function fromHash() { reveal(decodeURIComponent((location.hash || '').slice(1))); }
  fromHash();
  window.addEventListener('hashchange', function () {
    fromHash();
    var el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (el) setTimeout(function () { el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }, 40);
  });

  /* products page search */
  var input = document.getElementById('productSearchInput');
  var box = document.querySelector('[data-rd-search]');
  if (input && box) {
    var cards = Array.prototype.slice.call(box.querySelectorAll('.rd-pcard'));
    var none = box.querySelector('.rd-noresult');
    var norm = function (s) { return (s || '').toLowerCase().replace(/×/g, 'x').replace(/(\d)\s*x\s*(\d)/g, '$1x$2').replace(/[^a-z0-9x\s-]/g, ' ').replace(/\s+/g, ' ').trim(); };
    var run = function (scroll) {
      var raw = input.value.trim(), q = norm(raw);
      if (/^(sgd|sg)[\s-]?\d{1,3}$/i.test(raw)) q = 'doors';
      var words = q ? q.split(' ').filter(function (w) { return w.length > 1 || /\d/.test(w); }) : [];
      box.classList.toggle('is-searching', words.length > 0);
      var shown = 0;
      cards.forEach(function (c) {
        var hay = norm(c.innerText + ' ' + (c.getAttribute('data-kw') || ''));
        var ok = !words.length || words.every(function (w) { return hay.indexOf(w) > -1 || (w.length > 3 && /s$/.test(w) && hay.indexOf(w.slice(0, -1)) > -1); });
        c.style.display = ok ? '' : 'none'; if (ok) shown++;
      });
      if (none) { none.hidden = !(words.length && !shown); var sp = none.querySelector('b'); if (sp) sp.textContent = raw; }
      if (scroll && raw) box.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    };
    input.addEventListener('input', function () { run(false); });
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); run(true); } });
    var btn = document.getElementById('productSearchBtn');
    if (btn) btn.addEventListener('click', function (e) { e.preventDefault(); run(true); });
  }
})();
