/* ==========================================================================
   GREENPLASTWOOD — LANGUAGE SWITCHER (same idea as celvionglobal.com)
   · Globe button in the header (desktop) + "Select language" in the mobile menu
   · Uses Google Website Translator: every language Google supports (100+),
     the choice is kept while the visitor moves between pages (googtrans cookie)
   · Brand name, phone numbers, e-mail and product codes are never translated
   ========================================================================== */
(function () {
  'use strict';
  if (window.__gpLang) return; window.__gpLang = true;

  var POPULAR = [
    ['en', 'English', 'EN', 'English'], ['hi', 'हिन्दी', 'HI', 'Hindi'], ['gu', 'ગુજરાતી', 'GU', 'Gujarati'], ['mr', 'मराठी', 'MR', 'Marathi'],
    ['ta', 'தமிழ்', 'TA', 'Tamil'], ['te', 'తెలుగు', 'TE', 'Telugu'], ['kn', 'ಕನ್ನಡ', 'KN', 'Kannada'], ['bn', 'বাংলা', 'BN', 'Bengali Bangla'],
    ['pa', 'ਪੰਜਾਬੀ', 'PA', 'Punjabi'], ['ar', 'العربية', 'AR', 'Arabic'], ['es', 'Español', 'ES', 'Spanish'], ['fr', 'Français', 'FR', 'French'], ['de', 'Deutsch', 'DE', 'German']
  ];
  var GLOBE = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
  var CHEV = '<svg class="gpl-chev" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';

  /* ---------- styles ---------- */
  var css = '' +
    '.gpl{position:relative;display:inline-flex;align-items:center;font-family:var(--gp-font-body,"Questrial",sans-serif)}' +
    '.gpl-btn{display:inline-flex;align-items:center;gap:6px;height:38px;padding:0 13px;border-radius:30px;border:1.5px solid #05838E;background:#fff;color:#05838E;font:inherit;font-size:12.5px;font-weight:700;letter-spacing:.04em;cursor:pointer;transition:background .2s,color .2s;white-space:nowrap}' +
    '.gpl-btn:hover,.gpl.is-open .gpl-btn{background:#05838E;color:#fff}' +
    '.gpl-chev{transition:transform .2s}.gpl.is-open .gpl-chev{transform:rotate(180deg)}' +
    '.gpl-menu{position:absolute;top:calc(100% + 8px);right:0;width:260px;max-height:min(70vh,460px);display:flex;flex-direction:column;background:#fff;border:1px solid rgba(10,57,61,.16);border-radius:14px;box-shadow:0 14px 34px rgba(10,57,61,.18);padding:8px;opacity:0;visibility:hidden;transform:translateY(-6px);transition:all .2s ease;z-index:100000;text-align:left}' +
    '.gpl.is-open .gpl-menu{opacity:1;visibility:visible;transform:none}' +
    '.gpl .gpl-search{width:100%!important;height:40px!important;min-height:40px!important;border:1px solid #D9D2C8!important;border-radius:8px!important;padding:0 12px!important;font:inherit;font-size:14px!important;line-height:40px!important;color:#2B2422;background:#fff!important;margin:0 0 6px!important;box-sizing:border-box;flex:none;-webkit-appearance:none;appearance:none}' +
    '.gpl-search:focus{outline:none;border-color:#05838E;box-shadow:0 0 0 3px rgba(5,131,142,.12)}' +
    '.gpl-list{overflow-y:auto;overscroll-behavior:contain;margin:0;padding:0;list-style:none}' +
    '.gpl-h{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#7A7270;padding:8px 10px 4px}' +
    '.gpl-opt{display:flex;justify-content:space-between;align-items:center;gap:10px;width:100%;padding:8px 10px;border:0;background:none;border-radius:8px;font:inherit;font-size:14px;color:#2B2422;cursor:pointer;text-align:left}' +
    '.gpl-opt small{font-size:11px;color:#7A7270;letter-spacing:.04em}' +
    '.gpl-opt:hover,.gpl-opt:focus-visible,.gpl-opt.is-on{background:#E9F2F3;color:#0A393D;outline:none}' +
    '.gpl-empty{padding:10px;font-size:13px;color:#7A7270}' +
    '.gpl-mob{list-style:none;padding:14px 4px 4px}' +
    '.gpl-mob label{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:700;color:#05838E;margin-bottom:6px;text-transform:uppercase;letter-spacing:.05em}' +
    '.gpl-mob select{width:100%;height:44px;padding:0 12px;border-radius:10px;border:1.5px solid rgba(5,131,142,.3);background:#fff;font:inherit;font-size:14px;color:#0A393D}' +
    '.gpl-mob{display:none}.gpl-mob.is-on{display:block}' +
    '@media (min-width:1024px) and (max-width:1300px){.gpl-btn{padding:0 9px;gap:4px}.gpl-btn .gpl-chev{display:none}}' +
    '@media (min-width:1024px) and (max-width:1180px){.gpl-btn{width:38px;padding:0;justify-content:center}.gpl-btn .gpl-cur{display:none}.gpl{margin-left:-4px}}' +
    '@media (max-width:600px){.gpl-btn{padding:0 10px;height:34px}.gpl-btn .gpl-chev{display:none}.gpl-menu{position:fixed;top:70px;left:12px;right:12px;width:auto}}' +
    /* hide Google's own bar, tooltip and highlight */
    'iframe.skiptranslate,.goog-te-banner-frame,#goog-gt-tt,.goog-te-balloon-frame,.goog-tooltip,.VIpgJd-ZVi9od-ORHb-OEVmcd,.VIpgJd-ZVi9od-aZ2wEe-wOHMyf,.VIpgJd-yAWNEb-L7lbkb{display:none!important}' +
    'body{top:0!important}' +
    '.goog-text-highlight,font[style]{background:none!important;box-shadow:none!important}' +
    '#gpl-google{position:absolute!important;left:-9999px!important;top:0;width:1px;height:1px;overflow:hidden}';
  var st = document.createElement('style'); st.id = 'gpl-css'; st.textContent = css; document.head.appendChild(st);

  /* ---------- current language (googtrans cookie) ---------- */
  function current() {
    var m = document.cookie.match(/(?:^|;\s*)googtrans=\/[^/]*\/([^;]+)/);
    return m ? decodeURIComponent(m[1]) : 'en';
  }
  function setCookie(v) {
    var host = location.hostname, parts = host.split('.'), base = parts.length > 1 ? '.' + parts.slice(-2).join('.') : '';
    var exp = v ? '' : '; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    var val = v ? '/en/' + v : '';
    document.cookie = 'googtrans=' + val + '; path=/' + exp;
    if (base && base !== '.' + host) document.cookie = 'googtrans=' + val + '; path=/; domain=' + base + exp;
    if (host.indexOf('.') > -1) document.cookie = 'googtrans=' + val + '; path=/; domain=' + host + exp;
  }
  function label(code) {
    for (var i = 0; i < POPULAR.length; i++) if (POPULAR[i][0] === code) return POPULAR[i][2];
    return (code.split('-')[0] || 'EN').toUpperCase();
  }

  /* ---------- switch ---------- */
  function choose(code) {
    closeAll();
    try { if (window.gtag) window.gtag('event', 'language_change', { language: code }); } catch (e) { }
    if (code === 'en') { setCookie(''); location.reload(); return; }
    setCookie(code);
    var combo = document.querySelector('#gpl-google select.goog-te-combo');
    if (combo) {
      combo.value = code;
      combo.dispatchEvent(new Event('change'));
      syncUI(code);
    } else {
      location.reload();
    }
  }
  window.gpSetLanguage = choose;

  /* ---------- never translate these ---------- */
  function protect() {
    var sel = '.nav-logo, .logo, a[href="index.html"] img, a[href^="tel:"], a[href^="mailto:"], .lp-call, .contact-line, address, ' +
      '.gpc-design-code, [data-design], .footer-brand, .gpl, .gpl-mob';
    document.querySelectorAll(sel).forEach(function (el) { el.classList.add('notranslate'); el.setAttribute('translate', 'no'); });
  }

  /* ---------- UI ---------- */
  var built = [];
  function optHTML(code, name, short, en) {
    return '<li><button type="button" class="gpl-opt" data-code="' + code + '" data-k="' + (en || '').toLowerCase() + '" lang="' + code + '"><span>' + name + '</span><small>' + short + '</small></button></li>';
  }
  function buildDesktop(host, before) {
    var w = document.createElement('div');
    w.className = 'gpl notranslate'; w.setAttribute('translate', 'no');
    w.innerHTML = '<button type="button" class="gpl-btn" aria-haspopup="listbox" aria-expanded="false" aria-label="Select language">' + GLOBE +
      '<span class="gpl-cur">' + label(current()) + '</span>' + CHEV + '</button>' +
      '<div class="gpl-menu" role="dialog" aria-label="Select language"><input class="gpl-search" type="search" placeholder="Search language…" aria-label="Search language" />' +
      '<ul class="gpl-list"><li class="gpl-h">Popular</li>' + POPULAR.map(function (p) { return optHTML(p[0], p[1], p[2], p[3]); }).join('') +
      '<li class="gpl-h gpl-all-h" hidden>All languages</li></ul><div class="gpl-empty" hidden>No language found</div></div>';
    host.insertBefore(w, before || null);
    var btn = w.querySelector('.gpl-btn'), search = w.querySelector('.gpl-search');
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = !w.classList.contains('is-open'); closeAll();
      if (open) { w.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); if (matchMedia('(hover:hover)').matches) setTimeout(function () { search.focus(); }, 50); }
    });
    w.querySelector('.gpl-menu').addEventListener('click', function (e) {
      e.stopPropagation();
      var o = e.target.closest('.gpl-opt'); if (o) choose(o.getAttribute('data-code'));
    });
    search.addEventListener('input', function () { filter(w, search.value); });
    search.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { var f = w.querySelector('.gpl-opt:not([hidden])'); var li = f && f.closest('li'); if (f && !(li && li.hidden)) choose(f.getAttribute('data-code')); }
      if (e.key === 'Escape') closeAll();
    });
    built.push(w);
    return w;
  }
  function filter(w, q) {
    q = (q || '').trim().toLowerCase(); var n = 0;
    w.querySelectorAll('.gpl-opt').forEach(function (o) {
      var hit = !q || o.textContent.toLowerCase().indexOf(q) > -1 || (o.getAttribute('data-k') || '').indexOf(q) > -1 || o.getAttribute('data-code').toLowerCase().indexOf(q) === 0;
      o.parentNode.hidden = !hit; if (hit) n++;
    });
    w.querySelectorAll('.gpl-h').forEach(function (h) { h.hidden = !!q || (h.classList.contains('gpl-all-h') && !w.querySelector('.gpl-all')); });
    w.querySelector('.gpl-empty').hidden = n > 0;
  }
  function closeAll() {
    built.forEach(function (w) { w.classList.remove('is-open'); var b = w.querySelector('.gpl-btn'); if (b) b.setAttribute('aria-expanded', 'false'); });
  }
  document.addEventListener('click', closeAll);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(); });

  var mobileSelects = [];
  function buildMobile(ul) {
    var li = document.createElement('li');
    li.className = 'gpl-mob notranslate'; li.setAttribute('translate', 'no');
    li.innerHTML = '<label for="gplMobSel">' + GLOBE + ' Select language</label><select id="gplMobSel" aria-label="Select language"><optgroup label="Popular">' +
      POPULAR.map(function (p) { return '<option value="' + p[0] + '">' + p[1] + ' (' + p[2] + ')</option>'; }).join('') + '</optgroup></select>';
    ul.appendChild(li);
    var s = li.querySelector('select'); s.value = current();
    s.addEventListener('change', function () { choose(s.value); });
    mobileSelects.push(s);
  }

  function syncUI(code) {
    document.querySelectorAll('.gpl-cur').forEach(function (el) { el.textContent = label(code); });
    document.querySelectorAll('.gpl-opt').forEach(function (o) { o.classList.toggle('is-on', o.getAttribute('data-code') === code); });
    mobileSelects.forEach(function (s) { s.value = code; });
  }

  /* add the full Google list once the translator is ready */
  function addAllLanguages() {
    var combo = document.querySelector('#gpl-google select.goog-te-combo');
    if (!combo || !combo.options.length) return false;
    var seen = {}; POPULAR.forEach(function (p) { seen[p[0]] = 1; });
    var list = [];
    for (var i = 0; i < combo.options.length; i++) {
      var o = combo.options[i]; if (!o.value || seen[o.value]) continue;
      seen[o.value] = 1; list.push([o.value, o.text]);
    }
    list.sort(function (a, b) { return a[1].localeCompare(b[1]); });
    built.forEach(function (w) {
      var ul = w.querySelector('.gpl-list'); if (w.querySelector('.gpl-all')) return;
      ul.insertAdjacentHTML('beforeend', list.map(function (l) { return optHTML(l[0], l[1], l[0].toUpperCase()).replace('<li>', '<li class="gpl-all">'); }).join(''));
      var h = w.querySelector('.gpl-all-h'); if (h) h.hidden = false;
    });
    mobileSelects.forEach(function (s) {
      if (s.querySelector('optgroup[label="All languages"]')) return;
      var g = document.createElement('optgroup'); g.label = 'All languages';
      list.forEach(function (l) { var o = document.createElement('option'); o.value = l[0]; o.textContent = l[1]; g.appendChild(o); });
      s.appendChild(g); s.value = current();
    });
    syncUI(current());
    return true;
  }

  function loadGoogle() {
    var holder = document.createElement('div'); holder.id = 'gpl-google'; holder.className = 'notranslate'; document.body.appendChild(holder);
    window.gpGoogleTranslateInit = function () {
      try {
        new window.google.translate.TranslateElement({ pageLanguage: 'en', autoDisplay: false }, 'gpl-google');
      } catch (e) { return; }
      var tries = 0, t = setInterval(function () { if (addAllLanguages() || ++tries > 40) clearInterval(t); }, 250);
    };
    var s = document.createElement('script');
    s.src = 'https://translate.google.com/translate_a/element.js?cb=gpGoogleTranslateInit';
    s.async = true; document.body.appendChild(s);
  }

  function init() {
    protect();
    // desktop header: before the hamburger button (main site) or before the call link (landing pages)
    var ham = document.getElementById('hamburgerBtn');
    if (ham && ham.parentNode) buildDesktop(ham.parentNode, ham);
    else {
      var lp = document.querySelector('.lp-head-cta');
      if (lp) buildDesktop(lp, lp.firstChild);
    }
    var nav = document.getElementById('navMenu');
    if (nav) {
      buildMobile(nav);
      // the "Select language" box shows only when the menu is the mobile drawer (hamburger visible)
      var mob = nav.querySelector('.gpl-mob');
      var upd = function () { if (mob) mob.classList.toggle('is-on', !!(ham && ham.offsetParent !== null && getComputedStyle(ham).display !== 'none')); };
      upd(); window.addEventListener('resize', upd);
    }
    syncUI(current());
    // load Google only when needed now (a language is already chosen) or soon after the page is ready
    if (current() !== 'en') loadGoogle();
    else if ('requestIdleCallback' in window) requestIdleCallback(loadGoogle, { timeout: 3000 });
    else setTimeout(loadGoogle, 1500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
