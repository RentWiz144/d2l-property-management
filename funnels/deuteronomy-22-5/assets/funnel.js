// Step-by-step funnel for one colorway. Reads its config from <script id="cfg">.
(function () {
  var cfg = JSON.parse(document.getElementById('cfg').textContent);
  var ORDER = ['intro', 'size', 'fringe', 'timing', 'review'];
  var state = { step: 0, size: null, fringe: null, fringeColor: null };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var money = function (c) { return '$' + (c / 100).toFixed(2); };

  function total() {
    return cfg.price + (state.fringe === 'yes' ? cfg.fringeAdd : 0);
  }

  // Shopify cart permalink: /cart/<variant>:<qty>[,<variant>:<qty>] goes straight to checkout.
  function checkoutUrl() {
    var items;
    if (cfg.fringeSizes) {
      // Satin: fringes are their own variant of the dress.
      items = [(state.fringe === 'yes' ? cfg.fringeSizes : cfg.sizes)[state.size] + ':1'];
    } else {
      // Jersey: fringes are the separate Fringing Service product, added alongside.
      items = [cfg.sizes[state.size] + ':1'];
      if (state.fringe === 'yes') items.push(cfg.fringeColors[state.fringeColor] + ':1');
    }
    return cfg.store + '/cart/' + items.join(',') + '?attributes[funnel]=' + encodeURIComponent(cfg.slug);
  }

  function fringeLabel() {
    if (state.fringe !== 'yes') return 'Without fringes';
    return 'Fringes and ribband of blue' + (state.fringeColor ? ' — ' + state.fringeColor.toLowerCase() : '');
  }

  function waitlistUrl() {
    var body = 'Please let me know when the Deuteronomy 22:5 Satin Maxi Dress opens.\n\n' +
      'Colorway: ' + cfg.color + '\nSize: ' + state.size + '\nFringes: ' + fringeLabel() + '\n';
    return 'mailto:' + cfg.supportEmail +
      '?subject=' + encodeURIComponent('Satin Deuteronomy 22:5 — ' + cfg.color + ' — notify me') +
      '&body=' + encodeURIComponent(body);
  }

  function show(i) {
    state.step = i;
    var name = ORDER[i];
    document.body.setAttribute('data-step', name);
    $$('.step').forEach(function (el) { el.classList.toggle('on', el.dataset.step === name); });
    $('.progress i').style.width = (i / (ORDER.length - 1)) * 100 + '%';
    $('.back').hidden = i === 0;
    $('.count').textContent = i === 0 ? '' : 'Step ' + i + ' of ' + (ORDER.length - 1);
    if (name === 'review') renderReview();
    var h = $('.step.on h1, .step.on h2');
    if (h && i > 0) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    window.scrollTo(0, 0);
  }

  function renderReview() {
    $('#r-size').textContent = state.size;
    $('#r-fringe').textContent = fringeLabel();
    $('#r-total').textContent = money(total());
    var go = $('#go');
    go.href = cfg.live ? checkoutUrl() : waitlistUrl();
  }

  function press(group, btn) {
    $$('[data-pick="' + group + '"]').forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-next],[data-pick],.back');
    if (!t) return;
    if (t.classList.contains('back')) return show(Math.max(0, state.step - 1));
    if (t.hasAttribute('data-next')) return show(state.step + 1);

    var group = t.dataset.pick, val = t.dataset.value;
    press(group, t);
    if (group === 'size') {
      state.size = val;
      show(state.step + 1);
    } else if (group === 'fringe') {
      state.fringe = val;
      var needsColor = val === 'yes' && cfg.fringeColors;
      var sub = $('.subpick');
      if (sub) sub.hidden = !needsColor;
      if (!needsColor) { state.fringeColor = null; show(state.step + 1); }
      else if (state.fringeColor) show(state.step + 1);
    } else if (group === 'fringeColor') {
      state.fringeColor = val;
      show(state.step + 1);
    }
  });

  show(0);
})();
