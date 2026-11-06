/* Update 110: justify body text across the site.
   Only paragraphs, list items and similar text that are already left aligned get justified,
   so centred headings, buttons, chips and menus keep their alignment. The last line stays left. */
(function () {
  var SEL = 'main p, main li, main dd, main blockquote, main figcaption, section p, section li, section dd, section blockquote, section figcaption, article p, article li, .site-footer p';
  function run(root) {
    var els = (root || document).querySelectorAll(SEL);
    for (var i = 0; i < els.length; i++) {
      var e = els[i];
      if (e.classList.contains('gp-just') || e.closest('nav, button, a, label, .gp-btns, .rd-btnrow, form')) continue;
      var cs = getComputedStyle(e), a = cs.textAlign;
      if (parseFloat(cs.fontSize) >= 20) continue;
      if (e.textContent.trim().length < 70) continue; /* short labels stay as they are */ /* large taglines and quotes keep their normal look */
      if (a === 'left' || a === 'start') e.classList.add('gp-just');
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { run(); });
  else run();
  window.addEventListener('load', function () { run(); });
})();
