/* GREEN PLASTWOOD — catalogue behaviour: design filters, code search, load-more, lightbox */
(function () {
  'use strict';

  /* ---------- Design library: filter chips + code search + load more ---------- */
  document.querySelectorAll('[data-gpc-lib]').forEach(function (lib) {
    var items = Array.prototype.slice.call(lib.querySelectorAll('.gpc-design'));
    var chips = lib.querySelectorAll('[data-gpc-f]');
    var input = lib.querySelector('.gpc-search input');
    var count = lib.querySelector('.gpc-count');
    var moreBtn = lib.querySelector('[data-gpc-more]');
    var page = parseInt(lib.getAttribute('data-gpc-page') || '0', 10);
    var shown = page || items.length;
    var filter = 'all';

    function apply() {
      var q = input ? input.value.trim().toLowerCase().replace(/\s+/g, '') : '';
      var matches = items.filter(function (it) {
        var okF = filter === 'all' || it.getAttribute('data-cat') === filter;
        var okQ = !q || (it.getAttribute('data-code') || '').toLowerCase().replace(/[\s-]/g, '').indexOf(q.replace(/-/g, '')) > -1;
        return okF && okQ;
      });
      var limit = (q || !page) ? matches.length : shown;
      items.forEach(function (it) { it.classList.add('is-hidden'); });
      matches.forEach(function (it, i) { if (i < limit) it.classList.remove('is-hidden'); });
      if (count) count.textContent = matches.length ? ('Showing ' + Math.min(limit, matches.length) + ' of ' + matches.length + ' designs') : 'No design found for that code — try e.g. SGD-104 or SG-003';
      if (moreBtn) moreBtn.style.display = (!q && page && matches.length > limit) ? '' : 'none';
    }
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        chips.forEach(function (x) { x.classList.remove('is-active'); });
        c.classList.add('is-active');
        filter = c.getAttribute('data-gpc-f');
        shown = page || items.length;
        apply();
      });
    });
    if (input) input.addEventListener('input', apply);
    if (moreBtn) moreBtn.addEventListener('click', function () { shown += page; apply(); });
    apply();
  });

  /* ---------- Logo grid expand ---------- */
  document.querySelectorAll('[data-gpc-logos-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var grid = document.querySelector(btn.getAttribute('data-gpc-logos-toggle'));
      if (!grid) return;
      var collapsed = grid.classList.toggle('is-collapsed');
      btn.innerHTML = collapsed ? 'View All Customers <span>→</span>' : 'Show Less <span>↑</span>';
    });
  });

  /* ---------- Lightbox ---------- */
  var lb = document.createElement('div');
  lb.className = 'gpc-lb';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.innerHTML = '<button class="gpc-lb-btn gpc-lb-close" aria-label="Close">×</button>' +
    '<button class="gpc-lb-btn gpc-lb-prev" aria-label="Previous">‹</button>' +
    '<figure class="gpc-lb-fig"><img alt="" /><figcaption class="gpc-lb-cap"></figcaption></figure>' +
    '<button class="gpc-lb-btn gpc-lb-next" aria-label="Next">›</button>';
  document.body.appendChild(lb);
  var lbImg = lb.querySelector('img'), lbCap = lb.querySelector('.gpc-lb-cap');
  var group = [], idx = 0;

  function visible(el) { return !el.classList.contains('is-hidden') && el.offsetParent !== null; }
  function show(i) {
    idx = (i + group.length) % group.length;
    var el = group[idx];
    lbImg.src = el.getAttribute('data-lb');
    lbImg.alt = el.getAttribute('data-lb-title') || '';
    var t = el.getAttribute('data-lb-title') || '', s = el.getAttribute('data-lb-sub') || '', p = el.getAttribute('data-lb-enquire');
    lbCap.innerHTML = (t ? '<b>' + t + '</b>' : '') + (s ? '<span>' + s + '</span>' : '') +
      (p ? '<a href="#" class="gp-btn" data-gpc-enquire="' + p.replace(/"/g, '&quot;') + '">Enquire for this design <span>→</span></a>' : '');
  }
  function open(el) {
    var root = el.closest('[data-lb-group]') || document;
    group = Array.prototype.filter.call(root.querySelectorAll('[data-lb]'), visible);
    if (!group.length) group = [el];
    show(Math.max(0, group.indexOf(el)));
    lb.classList.add('is-open');
    document.documentElement.style.overflow = 'hidden';
  }
  function close() { lb.classList.remove('is-open'); document.documentElement.style.overflow = ''; lbImg.src = ''; }

  document.addEventListener('click', function (e) {
    var enq = e.target.closest('[data-gpc-enquire]');
    if (enq) {
      e.preventDefault();
      var what = enq.getAttribute('data-gpc-enquire');
      close();
      if (typeof window.gpOpenQuote === 'function') window.gpOpenQuote('quote', what);
      else window.location.href = 'contact.html?product=' + encodeURIComponent(what) + '#contactInquiryForm';
      return;
    }
    var el = e.target.closest('[data-lb]');
    if (el && !lb.contains(el)) { e.preventDefault(); open(el); }
  });
  document.addEventListener('keydown', function (e) {
    var el = document.activeElement;
    if ((e.key === 'Enter' || e.key === ' ') && el && el.hasAttribute && el.hasAttribute('data-lb') && !lb.classList.contains('is-open')) { e.preventDefault(); open(el); return; }
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') show(idx + 1);
    if (e.key === 'ArrowLeft') show(idx - 1);
  });
  lb.querySelector('.gpc-lb-close').addEventListener('click', close);
  lb.querySelector('.gpc-lb-prev').addEventListener('click', function () { show(idx - 1); });
  lb.querySelector('.gpc-lb-next').addEventListener('click', function () { show(idx + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  var sx = null;
  lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) { if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1)); sx = null; });
})();


/* ---- read more v2 ---- */
(function () {
  document.querySelectorAll('.gpc-rm').forEach(function (box) {
    if (!box.querySelector('.gpc-extra') || box.nextElementSibling && box.nextElementSibling.classList.contains('gpc-rm-btn')) return;
    var wrap = document.createElement('div'); wrap.className = 'gpc-rm-btn';
    var b = document.createElement('button'); b.type = 'button';
    var more = box.getAttribute('data-more') || 'Read more', less = box.getAttribute('data-less') || 'Show less';
    b.textContent = more + ' ↓'; b.setAttribute('aria-expanded', 'false');
    b.addEventListener('click', function () {
      var open = box.classList.toggle('is-open');
      b.textContent = open ? less + ' ↑' : more + ' ↓'; b.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (!open) box.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    wrap.appendChild(b); box.parentNode.insertBefore(wrap, box.nextSibling);
  });
})();

/* ---- video cards ---- */
(function () {
  var C = window.GP_CONFIG || {}, V = C.videos || {}, CH = C.youtubeChannel || 'https://www.youtube.com/@greenplastwoodindia';
  function vid(v) {
    if (!v) return '';
    var m = String(v).match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
    return m ? m[1] : (/^[\w-]{11}$/.test(v) ? v : '');
  }
  var modal;
  function open(id) {
    if (!modal) {
      modal = document.createElement('div'); modal.className = 'gpv-modal';
      modal.innerHTML = '<button class="gpv-close" aria-label="Close video">×</button><div class="gpv-modal-box"></div>';
      document.body.appendChild(modal);
      modal.addEventListener('click', function (e) { if (e.target === modal || e.target.classList.contains('gpv-close')) close(); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    }
    modal.querySelector('.gpv-modal-box').innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0" title="Green Plastwood video" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
    modal.classList.add('is-open'); document.documentElement.style.overflow = 'hidden';
    if (window.gpTrack) window.gpTrack('video_play', { video_id: id });
  }
  function close() { if (modal) { modal.classList.remove('is-open'); modal.querySelector('.gpv-modal-box').innerHTML = ''; document.documentElement.style.overflow = ''; } }
  document.querySelectorAll('[data-gpv]').forEach(function (el) {
    var id = vid(V[el.getAttribute('data-gpv')]);
    if (id) {
      el.setAttribute('href', 'https://www.youtube.com/watch?v=' + id);
      el.addEventListener('click', function (e) { e.preventDefault(); open(id); });
    } else {
      el.setAttribute('href', CH); el.setAttribute('target', '_blank'); el.setAttribute('rel', 'noopener');
      var s = el.querySelector('.gpv-cap span'); if (s && !s.dataset.keep) s.textContent = 'Watch on our YouTube channel';
    }
  });
})();
