/* ==========================================================================
   GREEN PLASTWOOD — LEAD ENGINE
   · Sticky Call / WhatsApp / Quote (mobile bar + desktop WhatsApp bubble)
   · Quick Quote & Request-a-Sample modal (Name, Mobile, City, Product)
   · UTM / click-ID capture (first + last touch) → hidden fields on every form
   · All forms → optional endpoint (Formspree / Apps Script) → thank-you page
   · GTM / GA4 / Google Ads / Meta Pixel loader (IDs in gp-config.js)
   ========================================================================== */
(function () {
  'use strict';
  var C = window.GP_CONFIG || {};
  var PRODUCTS = ["WPC Door Frames", "WPC Window Frames", "WPC Solid Doors", "WPC 3 Layer Doors", "WPC / PVC Boards & Sheets", "WPC 3 Layer Boards"];
  var ATTR_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'gbraid', 'wbraid', 'fbclid', 'msclkid'];

  /* ---------- safe storage ---------- */
  var mem = {};
  function sget(k, session) { try { return JSON.parse((session ? sessionStorage : localStorage).getItem(k)); } catch (e) { return mem[k] || null; } }
  function sset(k, v, session) { mem[k] = v; try { (session ? sessionStorage : localStorage).setItem(k, JSON.stringify(v)); } catch (e) { } }

  /* ---------- tracking loaders ---------- */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;
  function loadScript(src) { var s = document.createElement('script'); s.async = true; s.src = src; document.head.appendChild(s); }
  if (C.gtmId) {
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    loadScript('https://www.googletagmanager.com/gtm.js?id=' + C.gtmId);
  }
  if (C.ga4Id || C.googleAdsId) {
    loadScript('https://www.googletagmanager.com/gtag/js?id=' + (C.ga4Id || C.googleAdsId));
    window.gtag('js', new Date());
    if (C.ga4Id) window.gtag('config', C.ga4Id);
    if (C.googleAdsId) window.gtag('config', C.googleAdsId);
  }
  if (C.metaPixelId) {
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s) }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', C.metaPixelId); window.fbq('track', 'PageView');
  }
  function track(event, params) {
    params = params || {};
    window.dataLayer.push(Object.assign({ event: event }, params));
    if (C.ga4Id && window.gtag) window.gtag('event', event, params);
    if (window.fbq) {
      if (event === 'whatsapp_click' || event === 'call_click') window.fbq('track', 'Contact', params);
    }
  }
  window.gpTrack = track;

  /* ---------- UTM / click-ID attribution ---------- */
  (function captureAttribution() {
    var q = new URLSearchParams(location.search), found = {}, has = false;
    ATTR_KEYS.forEach(function (k) { var v = q.get(k); if (v) { found[k] = v.slice(0, 200); has = true; } });
    var touch = Object.assign({}, found, { landing_page: location.pathname + location.search, referrer: document.referrer || '(direct)', ts: new Date().toISOString() });
    if (!sget('gp_attr_first')) sset('gp_attr_first', touch);
    if (has || !sget('gp_attr_last')) sset('gp_attr_last', touch);
  })();
  function attribution() {
    var first = sget('gp_attr_first') || {}, last = sget('gp_attr_last') || {}, out = {};
    ATTR_KEYS.forEach(function (k) { out[k] = last[k] || ''; out['first_' + k] = first[k] || ''; });
    out.landing_page = last.landing_page || ''; out.first_landing_page = first.landing_page || '';
    out.referrer = last.referrer || ''; out.first_referrer = first.referrer || '';
    out.page_url = location.href; out.page_title = document.title;
    return out;
  }
  function stampForm(form, formName) {
    var a = attribution(); a.form_name = formName;
    Object.keys(a).forEach(function (k) {
      var el = form.querySelector('input[type=hidden][name="' + k + '"]');
      if (!el) { el = document.createElement('input'); el.type = 'hidden'; el.name = k; form.appendChild(el); }
      el.value = a[k];
    });
  }
  window.gpAttribution = attribution;

  /* ---------- lead submit (every form) ---------- */
  function val(form, names) { for (var i = 0; i < names.length; i++) { var el = form.querySelector('[name="' + names[i] + '"]'); if (el && el.value) return el.value; } return ''; }
  window.gpSubmitLead = function (e, formName) {
    if (e && e.preventDefault) e.preventDefault();
    var form = e.target && e.target.tagName === 'FORM' ? e.target : (e.target && e.target.closest ? e.target.closest('form') : null);
    if (!form) return false;
    if (form.reportValidity && !form.reportValidity()) return false;
    stampForm(form, formName);
    var lead = {
      form: formName,
      name: val(form, ['fullName', 'name']),
      phone: val(form, ['phone', 'mobile']),
      city: val(form, ['cityState', 'city']),
      product: val(form, ['productService', 'interestCategory', 'product']),
      type: val(form, ['requestType']) || formName,
      design: val(form, ['designCode'])
    };
    sset('gp_last_lead', lead, true);
    track('lead_submit', { form_name: formName, product: lead.product, request_type: lead.type });
    var btn = form.querySelector('[type=submit]');
    if (btn) { btn.disabled = true; btn.dataset.label = btn.innerHTML; btn.innerHTML = '<span>SENDING…</span>'; }
    var q = new URLSearchParams({ form: formName });
    if (lead.product) q.set('product', lead.product);
    if (lead.type) q.set('type', lead.type);
    if (lead.design) q.set('design', lead.design);
    var go = function () { location.href = (C.thankYouPage || 'thank-you.html') + '?' + q.toString(); };
    if (C.formEndpoint) {
      var done = false, timer = setTimeout(function () { if (!done) { done = true; go(); } }, 7000);
      fetch(C.formEndpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .catch(function () { })
        .then(function () { if (!done) { done = true; clearTimeout(timer); go(); } });
    } else { go(); }
    return false;
  };
  window.gpNewsletter = function (e) {
    e.preventDefault();
    var form = e.target; stampForm(form, 'newsletter');
    track('newsletter_signup', {});
    if (C.formEndpoint) fetch(C.formEndpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } }).catch(function () { });
    var inp = form.querySelector('input[type=email]');
    if (inp) { inp.value = ''; inp.placeholder = 'Thank you — subscribed!'; }
    return false;
  };

  /* ---------- WhatsApp / Call helpers ---------- */
  function waLink(text) { return 'https://wa.me/' + (C.whatsapp || '') + '?text=' + encodeURIComponent(text); }
  function pageTopic() {
    var h1 = document.querySelector('h1');
    return h1 ? h1.innerText.replace(/\s+/g, ' ').trim() : document.title;
  }
  window.gpWhatsApp = function (topic) {
    var t = 'Hi GREEN PLASTWOOD, I would like details about ' + (topic || pageTopic()) + '.';
    track('whatsapp_click', { topic: topic || pageTopic() });
    window.open(waLink(t), '_blank', 'noopener');
  };

  /* ---------- UI: sticky bar + WhatsApp bubble + quick quote modal ---------- */
  var ICON = {
    phone: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>',
    wa: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M.06 24l1.69-6.16A11.87 11.87 0 0 1 .16 11.9C.16 5.33 5.5 0 12.05 0a11.82 11.82 0 0 1 8.41 3.49 11.82 11.82 0 0 1 3.48 8.41c0 6.56-5.34 11.9-11.9 11.9a11.9 11.9 0 0 1-5.69-1.45L.06 24zm6.6-3.8c1.67.99 3.28 1.59 5.39 1.59 5.45 0 9.89-4.43 9.89-9.88A9.89 9.89 0 0 0 12.06 2C6.6 2 2.17 6.44 2.17 11.89c0 2.22.65 3.89 1.75 5.63l-1 3.65 3.74-.97zm11.39-5.47c-.07-.12-.27-.2-.57-.35-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37s-1.04 1.02-1.04 2.48 1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.23 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41z"/></svg>',
    quote: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg>'
  };
  var TITLES = {
    Quote: ['Get a Quick Quote', 'Share 4 details — our team will call you back with pricing & specifications.', 'GET MY QUOTE'],
    Sample: ['Request a Free Sample', 'See the finish, weight and quality in hand before you specify or order.', 'REQUEST SAMPLE'],
    Dealership: ['Become a Channel Partner', 'Tell us your city — our dealer team will share the partnership details.', 'SEND DEALER ENQUIRY'],
    Catalogue: ['Get the Product Catalogue', 'We will share the latest catalogue & technical details on WhatsApp / email.', 'SEND ME THE CATALOGUE'],
    Brochure: ['Get the Company Brochure', 'We will share the latest brochure on WhatsApp / email.', 'SEND ME THE BROCHURE']
  };

  function trustPanel() {
    return '<div class="gpq-trust">' +
      '<div class="gpq-amb"><img src="images/hero_spokesperson_clean.png" alt="GREEN PLASTWOOD brand ambassador Dayanand Shetty" loading="lazy" /></div>' +
      '<div class="gpq-trust-body"><span class="gpq-tag">Brand Ambassador · Dayanand Shetty</span>' +
      '<ul class="gpq-trust-list">' +
      '<li><b>Since 2012</b><span>13 years of WPC manufacturing</span></li>' +
      '<li><b>3 Plants</b><span>manufacturing in Gujarat</span></li>' +
      '<li><b>300+ Projects</b><span>50+ stock points · 4+ export countries</span></li>' +
      '<li><b>ISO 9001:2015</b><span>certified · lab-tested products</span></li>' +
      '</ul></div></div>';
  }
  window.gpTrustPanel = trustPanel;

  function productOptions(selected) {
    var list = PRODUCTS.concat(['Dealership / Distribution', 'Customised WPC Solution', 'Other']);
    return '<option value="" disabled' + (selected ? '' : ' selected') + '>Product Interested In *</option>' +
      list.map(function (p) { return '<option value="' + p + '"' + (p === selected ? ' selected' : '') + '>' + p + '</option>'; }).join('');
  }
  window.gpProductOptions = productOptions;

  function buildModal() {
    var m = document.createElement('div');
    m.className = 'gpq-backdrop'; m.id = 'gpQuoteModal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-labelledby', 'gpqTitle');
    m.innerHTML = '<div class="gpq-card">' +
      '<button type="button" class="gpq-close" aria-label="Close">×</button>' + trustPanel() +
      '<form class="gpq-form" novalidate data-form="quick_quote">' +
      '<h3 id="gpqTitle">Get a Quick Quote</h3><p class="gpq-sub"></p>' +
      '<input type="hidden" name="requestType" value="Quote" />' +
      '<label class="gpq-field"><span>Full Name *</span><input name="fullName" type="text" autocomplete="name" required /></label>' +
      '<label class="gpq-field"><span>Mobile Number *</span><input name="phone" type="tel" inputmode="tel" autocomplete="tel" pattern="[0-9+ ]{10,15}" title="10-digit mobile number" required /></label>' +
      '<label class="gpq-field"><span>City *</span><input name="cityState" type="text" autocomplete="address-level2" required /></label>' +
      '<label class="gpq-field"><span>Product *</span><select name="productService" required>' + productOptions('') + '</select></label>' +
      '<button type="submit" class="gpq-submit">GET MY QUOTE →</button>' +
      '<p class="gpq-note">We respect your privacy. Our team will contact you on this number.</p>' +
      '</form></div>';
    document.body.appendChild(m);
    m.addEventListener('click', function (e) { if (e.target === m || e.target.classList.contains('gpq-close')) closeModal(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
    m.querySelector('form').addEventListener('submit', function (e) {
      var f = e.target; window.gpSubmitLead(e, f.dataset.form || 'quick_quote');
    });
    return m;
  }
  var modal;
  function closeModal() { if (modal) { modal.classList.remove('is-open'); document.documentElement.classList.remove('gpq-lock'); } }
  function splitDesign(product) {
    var m = (product || '').match(/\b(MSD|SG)-\d{3}\b/i);
    if (!m) return [product, ''];
    var base = product.replace(/\s*[–-]\s*(MSD|SG)-\d{3}.*$/i, '').trim();
    if (PRODUCTS.indexOf(base) < 0) base = 'WPC Solid Doors';
    return [base, m[0].toUpperCase()];
  }
  window.gpOpenQuote = function (type, product) {
    type = type ? type.charAt(0).toUpperCase() + type.slice(1).toLowerCase() : 'Quote';
    type = TITLES[type] ? type : 'Quote';
    var sd = splitDesign(product); product = sd[0]; var design = sd[1];
    modal = modal || buildModal();
    // never stack with the first-visit brochure popup
    var bp = document.getElementById('brochurePopupModal'); if (bp) bp.classList.remove('active');
    try { sessionStorage.setItem('gp_brochure_viewed', 'true'); } catch (e) { }
    var t = TITLES[type], f = modal.querySelector('form');
    modal.querySelector('#gpqTitle').textContent = design ? ('Enquire for Design ' + design) : t[0];
    var dc = f.querySelector('[name=designCode]');
    if (!dc) { dc = document.createElement('input'); dc.type = 'hidden'; dc.name = 'designCode'; f.appendChild(dc); }
    dc.value = design;
    modal.querySelector('.gpq-sub').textContent = t[1];
    f.querySelector('.gpq-submit').textContent = t[2] + ' →';
    f.querySelector('[name=requestType]').value = type;
    f.dataset.form = type === 'Sample' ? 'sample_request' : type === 'Dealership' ? 'dealer_enquiry' : type === 'Catalogue' || type === 'Brochure' ? 'catalogue_request' : 'quick_quote';
    var sel = f.querySelector('[name=productService]');
    var p = product && PRODUCTS.indexOf(product) > -1 ? product : (type === 'Dealership' ? 'Dealership / Distribution' : (product && /custom/i.test(product) ? 'Customised WPC Solution' : ''));
    sel.innerHTML = productOptions(p);
    modal.classList.add('is-open'); document.documentElement.classList.add('gpq-lock');
    track('quote_open', { request_type: type, product: p || '' });
    setTimeout(function () { var i = f.querySelector('[name=fullName]'); if (i) i.focus(); }, 60);
  };

  function buildSticky() {
    var tel = 'tel:' + (C.phone || '');
    var bar = document.createElement('div');
    bar.className = 'gp-sticky-bar';
    bar.innerHTML = '<a href="' + tel + '" class="gp-sb-call" data-gp-track="call">' + ICON.phone + '<span>Call</span></a>' +
      '<a href="#" class="gp-sb-wa" data-gp-wa>' + ICON.wa + '<span>WhatsApp</span></a>' +
      '<a href="#" class="gp-sb-quote" data-gp-quote="Quote">' + ICON.quote + '<span>Get Quote</span></a>';
    document.body.appendChild(bar);
    var bub = document.createElement('div');
    bub.className = 'gp-float';
    bub.innerHTML = '<a href="' + tel + '" class="gp-float-call" data-gp-track="call" aria-label="Call GREEN PLASTWOOD">' + ICON.phone + '</a>' +
      '<a href="#" class="gp-float-wa" data-gp-wa aria-label="Chat on WhatsApp">' + ICON.wa + '<span class="gp-float-tip">Chat on WhatsApp</span></a>';
    document.body.appendChild(bub);
    document.body.classList.add('gp-has-sticky');
  }

  /* ---------- wiring ---------- */
  document.addEventListener('click', function (e) {
    var q = e.target.closest && e.target.closest('[data-gp-quote]');
    if (q) { e.preventDefault(); e.stopPropagation(); window.gpOpenQuote(q.getAttribute('data-gp-quote'), q.getAttribute('data-gp-product') || ''); return; }
    var w = e.target.closest && e.target.closest('[data-gp-wa]');
    if (w) { e.preventDefault(); window.gpWhatsApp(w.getAttribute('data-gp-wa') || ''); return; }
    var c = e.target.closest && e.target.closest('a[href^="tel:"]');
    if (c) track('call_click', { location: c.className || 'link' });
    var wl = e.target.closest && e.target.closest('a[href*="wa.me"]');
    if (wl) track('whatsapp_click', { location: 'link' });
  }, true);

  function init() {
    if (!document.body.hasAttribute('data-no-sticky')) buildSticky();
    // stamp attribution on every form now as well (in case a page script submits it natively)
    document.querySelectorAll('form').forEach(function (f) { stampForm(f, f.getAttribute('data-form') || f.id || 'form'); });
    // inline quick forms
    document.querySelectorAll('form.gp-quick-form').forEach(function (f) {
      f.addEventListener('submit', function (e) { window.gpSubmitLead(e, f.getAttribute('data-form') || 'quick_quote'); });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  // after page scripts: route legacy "Get a Quote" / "Send Inquiry" to the quick modal
  window.addEventListener('load', function () {
    var isContact = /contact\.html/.test(location.pathname);
    var hq = document.getElementById('headerQuoteBtn');
    if (hq) { var clone = hq.cloneNode(true); clone.setAttribute('data-gp-quote', 'Quote'); hq.parentNode.replaceChild(clone, hq); }
    if (!isContact) {
      window.openQuoteModal = function (ctx) { window.gpOpenQuote('Quote', typeof ctx === 'string' ? ctx : ''); };
      window.openInquiryModal = function (ctx) { window.gpOpenQuote('Quote', typeof ctx === 'string' ? ctx : ''); };
    }
    window.handleDirectBrochureDownload = window.handleDirectBrochureDownloadProd = function () { window.gpOpenQuote('Brochure'); };
    window.openBrochureModal = function () { window.gpOpenQuote('Catalogue', (document.querySelector('h1') || {}).innerText ? pageProduct() : ''); };
  });
  function pageProduct() {
    var t = (document.querySelector('h1') || { innerText: '' }).innerText.toLowerCase();
    for (var i = 0; i < PRODUCTS.length; i++) if (t.indexOf(PRODUCTS[i].toLowerCase()) > -1) return PRODUCTS[i];
    return '';
  }
})();
