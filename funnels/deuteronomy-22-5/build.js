#!/usr/bin/env node
// Generates one funnel page per Deuteronomy 22:5 colorway, plus a hub (index.html),
// from data/products.json. No dependencies: `node funnels/deuteronomy-22-5/build.js`.
const fs = require('fs');
const path = require('path');

const dir = __dirname;
const data = JSON.parse(fs.readFileSync(path.join(dir, 'data/products.json'), 'utf8'));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const money = (c) => '$' + (c / 100).toFixed(2);
const img = (url, w) => `${url}&width=${w}`;

// Copy below is taken from the live product descriptions. Do not add claims here
// that the product pages do not make.
const STYLES = {
  original: {
    label: 'Original',
    title: 'Deuteronomy 22:5 Maxi Jersey Dress',
    lead: 'A floor-length, modest athletic dress made for women who want full coverage without giving up movement, function, or presence.',
    points: [
      'Floor-length, relaxed A-line fit',
      'Lightweight, breathable performance mesh — opaque',
      'In-seam pockets and side splits for movement',
      'Embroidered graphics — stitched in, nothing to crack or peel',
      'Sizes XS–4XL, every size the same price',
    ],
  },
  patent: {
    label: 'Patent',
    title: 'Deuteronomy 22:5 Maxi Dress — Patent',
    lead: 'The Deuteronomy 22:5 dress in the tone-on-tone patent style. Floor-length, full coverage, made to move in.',
    points: [
      'Floor-length, relaxed A-line fit',
      'In-seam pockets and side splits for movement',
      '“DEUTERONOMY 22” back graphic and the ChoZen checkmark on the front',
      'Sizes XS–4XL, every size the same price',
    ],
  },
  satin: {
    label: 'Satin',
    title: 'Deuteronomy 22:5 Satin Maxi Dress',
    lead: 'A liquid, high-gloss sheen that catches every light in the room.',
    points: [
      'Floor-length and relaxed through the body',
      'In-seam pockets and side splits, so you’re covered and can still move',
      'V-neck with contrast rib trim',
      'Sizes XS–4XL, every size the same price',
    ],
  },
};
const LIMITED = new Set(['Black', 'Athletic Red']); // per the jersey product description

function timing(c) {
  if (c.style === 'satin') {
    return `
      <div class="note"><b>Made to order — approximately 4 weeks.</b><br>This piece is cut and sewn after your order is placed. It is not pulled from a shelf.</div>
      <div class="note"><b>We keep the Sabbath.</b><br>Nothing is cut, shipped, or answered from Friday sundown to Saturday sundown.</div>
      <div class="note"><b>Order with confidence.</b><br>Orders may be cancelled within 24 hours, before production begins.</div>`;
  }
  return `
      <div class="note"><b>In stock ships in 3–5 business days.</b><br>Sizes not currently held in stock are made after purchase and ship in approximately 3–4 weeks.</div>
      ${LIMITED.has(c.color) ? `<div class="note"><b>Limited color.</b><br>${esc(c.color)} is a limited run of approximately 30 pieces. Once a size closes, it may not return.</div>` : ''}
      <div class="note"><b>Order with confidence.</b><br>Orders may be canceled within 24 hours, before production begins. Damaged, defective, or incorrect items are covered by our <a href="${data.store}/policies/refund-policy">refund policy</a>.</div>`;
}

function shell({ title, description, body, config, step }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="stylesheet" href="assets/funnel.css">
</head>
<body${step ? ` data-step="${step}"` : ''}>
<header class="top">
  <a class="brand" href="${data.store}">ChoZen Unlimited</a>
  ${config ? '<a class="all" href="index.html">All colorways</a>' : ''}
</header>
${body}
<footer>Walk in purpose. Wear the standard. · <a href="mailto:${data.supportEmail}">${data.supportEmail}</a></footer>
${config ? `<script type="application/json" id="cfg">${JSON.stringify(config).replace(/</g, '\\u003c')}</script>\n<script src="assets/funnel.js"></script>` : ''}
</body>
</html>
`;
}

function page(c) {
  const s = STYLES[c.style];
  const live = c.productStatus === 'ACTIVE';
  const satin = c.style === 'satin';
  const fringeAdd = satin ? c.fringePrice - c.price : data.fringeService.price;
  const siblings = data.colorways.filter((o) => o.style === c.style);
  const productUrl = `${data.store}/products/${c.productHandle}`;

  const config = {
    slug: c.slug, color: c.color, store: data.store, supportEmail: data.supportEmail, live,
    price: c.price, fringeAdd, sizes: c.sizes,
    ...(satin ? { fringeSizes: c.fringeSizes } : { fringeColors: data.fringeService.colors }),
  };

  const body = `<main class="shell funnel">
  <div class="hero"><img src="${img(c.image, 900)}" alt="ChoZen ${esc(s.title)} in ${esc(c.color)}" width="600" height="900"></div>
  <div class="flow">
    <div class="progress" aria-hidden="true"><i></i></div>
    <div class="nav"><button class="back" type="button" hidden>← Back</button><span class="count" aria-live="polite"></span></div>

    <section class="step" data-step="intro">
      <p class="eyebrow">${esc(s.label)} · Deuteronomy 22:5</p>
      <h1>${esc(c.color)}</h1>
      <p class="price">${money(c.price)} <small>· every size, XS–4XL</small></p>
      <p class="sub">${esc(s.lead)}</p>
      <ul class="points">${s.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
      <button class="cta" type="button" data-next>Choose my size →</button>
      <p class="fine">Three quick questions, then ${live ? 'straight to checkout' : 'we’ll note your pick'}.</p>
      <div class="others">
        <p>Other ${esc(s.label.toLowerCase())} colorways</p>
        <div class="swatches">${siblings.map((o) => `<a href="${o.slug}.html" title="${esc(o.color)}"${o === c ? ' aria-current="page"' : ''}><img src="${img(o.image, 160)}" alt="${esc(o.color)}" loading="lazy" width="56" height="76"></a>`).join('')}</div>
      </div>
    </section>

    <section class="step" data-step="size">
      <p class="eyebrow">${esc(c.color)}</p>
      <h2>What size do you wear?</h2>
      <p class="sub">Relaxed, non-form-fitting fit. Every size is the same price.</p>
      <div class="tiles sizes">${data.sizes.map((z) => `<button class="tile" type="button" data-pick="size" data-value="${z}" aria-pressed="false">${z}</button>`).join('')}</div>
      <p class="fine">Not sure about length, sleeve fit or room through the hips? Email <a href="mailto:${data.supportEmail}">${data.supportEmail}</a> with the size you normally wear before you order.</p>
    </section>

    <section class="step" data-step="fringe">
      <p class="eyebrow">Numbers 15:38</p>
      <h2>Fringes and a ribband of blue?</h2>
      <p class="sub">Brush fringes sewn by hand around the entire lower hem, with a ribband of blue set on top.</p>
      <div class="tiles">
        <button class="tile" type="button" data-pick="fringe" data-value="yes" aria-pressed="false"><em>+${money(fringeAdd)}</em><b>Yes, sew them on</b><span>Arrives already done. Adds 2–3 days.</span></button>
        <button class="tile" type="button" data-pick="fringe" data-value="no" aria-pressed="false"><b>Without fringes</b><span>The dress as it comes.</span></button>
      </div>
      ${satin ? '' : `<div class="subpick" hidden>
        <p>Fringe color</p>
        <div class="tiles">${Object.keys(data.fringeService.colors).map((k) => `<button class="tile" type="button" data-pick="fringeColor" data-value="${esc(k)}" aria-pressed="false">${esc(k)}</button>`).join('')}</div>
      </div>`}
    </section>

    <section class="step" data-step="timing">
      <p class="eyebrow">Before you order</p>
      <h2>When it arrives</h2>
      ${timing(c)}
      <button class="cta" type="button" data-next>That works for me →</button>
    </section>

    <section class="step" data-step="review">
      <p class="eyebrow">Your dress</p>
      <h2>${esc(c.color)} — ${esc(s.label)}</h2>
      <dl class="summary">
        <div><dt>Size</dt><dd id="r-size"></dd></div>
        <div><dt>Hem</dt><dd id="r-fringe"></dd></div>
        <div><dt>Total</dt><dd id="r-total"></dd></div>
      </dl>
      ${live
        ? `<a class="cta" id="go" href="${productUrl}">Checkout securely →</a>
      <p class="fine">Shipping and taxes are shown before payment is submitted.</p>`
        : `<div class="note"><b>Satin is not open for orders yet.</b><br>Send us your pick and we’ll email you when it opens.</div>
      <a class="cta" id="go" href="mailto:${data.supportEmail}">Email me when satin opens →</a>`}
    </section>
    <noscript><p class="note">This page needs JavaScript. You can order on the <a href="${live ? productUrl : data.store}">ChoZen store</a> instead.</p></noscript>
  </div>
</main>`;

  return shell({
    title: `${c.color} — ChoZen ${s.title}`,
    description: `${s.title} in ${c.color}. ${money(c.price)}, sizes XS–4XL. ${s.lead}`,
    body, config, step: 'intro',
  });
}

function hub() {
  const order = Object.keys(STYLES);
  const from = (k) => money(Math.min(...data.colorways.filter((c) => c.style === k).map((c) => c.price)));
  const body = `<main class="shell">
  <div class="hub-head">
    <p class="eyebrow">Deuteronomy 22:5 Maxi Dress</p>
    <h1>Pick your colorway.</h1>
    <p class="sub">Three styles, ${data.colorways.length} colorways, sizes XS–4XL. Choose one and we’ll walk you to checkout in three questions.</p>
  </div>
  <div class="tabs" role="group" aria-label="Style">
    <button class="tab" type="button" data-style="all" aria-pressed="true">All</button>
    ${order.map((k) => `<button class="tab" type="button" data-style="${k}" aria-pressed="false">${STYLES[k].label} · ${from(k)}</button>`).join('\n    ')}
  </div>
  <div class="grid">
    ${data.colorways.map((c) => `<a class="card" href="${c.slug}.html" data-style="${c.style}"><div class="ph"><img src="${img(c.image, 480)}" alt="${esc(c.color)} ${esc(STYLES[c.style].label.toLowerCase())} dress" loading="lazy" width="320" height="480"></div><div class="tx"><small>${STYLES[c.style].label}</small><b>${esc(c.color)}</b><span>${money(c.price)}${c.productStatus === 'ACTIVE' ? '' : ' · opening soon'}</span></div></a>`).join('\n    ')}
  </div>
</main>
<script>
document.querySelector('.tabs').addEventListener('click', function (e) {
  var t = e.target.closest('.tab'); if (!t) return;
  document.querySelectorAll('.tab').forEach(function (b) { b.setAttribute('aria-pressed', b === t); });
  document.querySelectorAll('.card').forEach(function (c) { c.hidden = t.dataset.style !== 'all' && c.dataset.style !== t.dataset.style; });
});
</script>`;
  return shell({
    title: 'ChoZen Deuteronomy 22:5 Maxi Dress — every colorway',
    description: `The Deuteronomy 22:5 Maxi Dress in ${data.colorways.length} colorways across Original, Patent and Satin. Sizes XS–4XL.`,
    body,
  });
}

for (const c of data.colorways) fs.writeFileSync(path.join(dir, `${c.slug}.html`), page(c));
fs.writeFileSync(path.join(dir, 'index.html'), hub());
console.log(`Built ${data.colorways.length} colorway funnels + index.html`);
