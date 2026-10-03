/* Green Plastwood — product detail pages: gallery, sticky section nav, type tabs from links */
(function () {
  'use strict';
  var root = document.documentElement;

  /* ---------- sticky nav sits under the site header ---------- */
  var header = document.getElementById('navbar');
  function setTop() {
    var h = 0;
    if (header) { var cs = getComputedStyle(header); if (cs.position === 'fixed' || cs.position === 'sticky') h = Math.round(header.getBoundingClientRect().height); }
    root.style.setProperty('--pd-top', h + 'px');
  }
  setTop(); window.addEventListener('resize', setTop); window.addEventListener('load', setTop);
  window.addEventListener('scroll', function () { window.requestAnimationFrame(setTop); }, { passive: true });

  /* ---------- gallery ---------- */
  document.querySelectorAll('[data-pd-gal]').forEach(function (gal) {
    var main = gal.querySelector('.pd-gal-main'), img = main.querySelector('img'), cap = gal.querySelector('.pd-gal-cap'), count = gal.querySelector('.pd-gal-count');
    var thumbs = Array.prototype.slice.call(gal.querySelectorAll('.pd-gal-thumb')), i = 0;
    function show(n) {
      i = (n + thumbs.length) % thumbs.length; var t = thumbs[i];
      img.style.opacity = '0';
      setTimeout(function () {
        img.src = t.getAttribute('data-src'); img.alt = t.getAttribute('data-alt') || '';
        img.setAttribute('data-lb', t.getAttribute('data-src')); img.setAttribute('data-lb-title', t.getAttribute('data-cap') || '');
        main.classList.toggle('is-contain', t.classList.contains('is-contain'));
        img.style.opacity = '1';
      }, 120);
      if (cap) cap.textContent = t.getAttribute('data-cap') || '';
      if (count) count.textContent = (i + 1) + ' / ' + thumbs.length;
      thumbs.forEach(function (x, k) { x.classList.toggle('is-active', k === i); x.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
    }
    thumbs.forEach(function (t, k) { t.addEventListener('click', function () { show(k); }); });
    var p = gal.querySelector('.pd-gal-prev'), n = gal.querySelector('.pd-gal-next');
    if (p) p.addEventListener('click', function (e) { e.stopPropagation(); show(i - 1); });
    if (n) n.addEventListener('click', function (e) { e.stopPropagation(); show(i + 1); });
    var x0 = null;
    main.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    main.addEventListener('touchend', function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) > 40) show(i + (dx < 0 ? 1 : -1)); });
  });

  /* ---------- tabs opened from a link: <a data-pd-tab="key" href="#types"> or page.html#type-key ---------- */
  function openTab(key) {
    var tab = document.querySelector('.gp-tab[data-tab="' + key + '"]');
    if (!tab) return null;
    tab.click();
    return tab.closest('.pd-sec') || tab;
  }
  function goTo(el) {
    if (!el) return;
    function y() { var top = parseInt(getComputedStyle(root).getPropertyValue('--pd-top'), 10) || 0; return el.getBoundingClientRect().top + window.pageYOffset - top - 54; }
    window.scrollTo({ top: y(), behavior: 'smooth' });
    /* images that load on the way can move the target: settle on it once the scroll has finished */
    var tries = 0, last = -1;
    var t = setInterval(function () {
      var now = window.pageYOffset; tries++;
      if (now === last || tries > 12) { clearInterval(t); if (Math.abs(y() - now) > 6) window.scrollTo(0, y()); }
      last = now;
    }, 180);
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-pd-tab]');
    if (!a) return;
    var sec = openTab(a.getAttribute('data-pd-tab'));
    if (sec) { e.preventDefault(); goTo(sec); }
  });
  function fromHash() {
    var h = (location.hash || '').slice(1);
    if (!h) return;
    var sec = openTab(h);
    if (sec) setTimeout(function () { goTo(sec); }, 60);
  }
  window.addEventListener('load', fromHash); window.addEventListener('hashchange', fromHash);

  /* ---------- section nav: smooth scroll + current section ---------- */
  var nav = document.querySelector('.pd-nav');
  if (nav) {
    var links = Array.prototype.slice.call(nav.querySelectorAll('.pd-nav-links a'));
    var secs = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
    links.forEach(function (a, k) {
      a.addEventListener('click', function (e) { if (!secs[k]) return; e.preventDefault(); goTo(secs[k]); history.replaceState(null, '', a.getAttribute('href')); });
    });
    var box = nav.querySelector('.pd-nav-links'), cur = -1, tick = false;
    function spy() {
      tick = false;
      var top = (parseInt(getComputedStyle(root).getPropertyValue('--pd-top'), 10) || 0) + 70, on = -1;
      secs.forEach(function (s, k) { if (s && s.getBoundingClientRect().top - top <= 0) on = k; });
      if (on === cur) return; cur = on;
      links.forEach(function (a, k) { a.classList.toggle('is-on', k === on); });
      if (on > -1 && box.scrollWidth > box.clientWidth) {
        var a = links[on]; box.scrollTo({ left: a.offsetLeft - box.offsetLeft - (box.clientWidth - a.offsetWidth) / 2, behavior: 'smooth' });
      }
    }
    window.addEventListener('scroll', function () { if (!tick) { tick = true; window.requestAnimationFrame(spy); } }, { passive: true });
    spy();
  }
})();
