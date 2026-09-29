/* Green Plastwood — shared behaviour for content components */
(function () {
  // Tabs: <div data-gp-tabs> ... <button class="gp-tab" data-tab="x"> ... <div class="gp-tab-panel" data-panel="x">
  document.querySelectorAll('[data-gp-tabs]').forEach(function (group) {
    var tabs = group.querySelectorAll('.gp-tab');
    var panels = group.querySelectorAll('.gp-tab-panel');
    function activate(key) {
      tabs.forEach(function (t) { t.classList.toggle('is-active', t.dataset.tab === key); t.setAttribute('aria-selected', t.dataset.tab === key); });
      panels.forEach(function (p) { p.classList.toggle('is-active', p.dataset.panel === key); });
    }
    tabs.forEach(function (t) { t.addEventListener('click', function () { activate(t.dataset.tab); }); });
    var hash = (location.hash || '').replace('#', '');
    var match = Array.prototype.find.call(tabs, function (t) { return t.dataset.tab === hash; });
    if (match) activate(hash);
  });

  // Chip filters: <div data-gp-filter="targetSelector"> <button class="gp-chip" data-f="all|key">
  document.querySelectorAll('[data-gp-filter]').forEach(function (row) {
    var items = document.querySelectorAll(row.dataset.gpFilter);
    row.querySelectorAll('.gp-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        row.querySelectorAll('.gp-chip').forEach(function (c) { c.classList.remove('is-active'); });
        chip.classList.add('is-active');
        var f = chip.dataset.f;
        items.forEach(function (it) {
          var show = f === 'all' || (' ' + (it.dataset.cat || '') + ' ').indexOf(' ' + f + ' ') > -1;
          it.classList.toggle('is-hidden', !show);
          it.style.display = show ? '' : 'none';
        });
      });
    });
  });

  // Reveal on scroll
  var els = document.querySelectorAll('.gp-reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  } else { els.forEach(function (el) { el.classList.add('is-in'); }); }

  // Pre-fill contact form from ?product=
  var params = new URLSearchParams(location.search);
  var prod = params.get('product');
  if (prod) {
    var sel = document.querySelector('select[name="productService"]');
    if (sel) {
      var opt = Array.prototype.find.call(sel.options, function (o) { return o.value.toLowerCase() === prod.toLowerCase(); });
      if (opt) sel.value = opt.value;
    }
    var msg = document.querySelector('textarea[name="message"]');
    if (msg && !msg.value) msg.value = 'Enquiry about: ' + prod + '\n';
  }
  var type = params.get('type');
  if (type) {
    var who = document.querySelector('select[name="customerType"]');
    if (who) who.value = type;
  }
})();

// Generic document request (catalogue / test report / certificate) → contact form with context
function gpRequestDoc(name) {
  window.location.href = 'contact.html?product=' + encodeURIComponent(name) + '#contactInquiryForm';
}
