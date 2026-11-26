#!/usr/bin/env node
// ChoZen size-split calculator.
// Votes mode:   node size-split.js --pieces 50 --votes S=12,M=10,L=26,XL=8
// No-votes mode (CPO curve 1:1:2:3:2:1 for S-3XL): node size-split.js --pieces 60
// Pre-order mode adds a buffer on top of real orders: --preorders S=4,M=9,L=14 --buffer 10
const CPO_CURVE = { S: 1, M: 1, L: 2, XL: 3, '2XL': 2, '3XL': 1 };

function parseMap(s) {
  return Object.fromEntries(s.split(',').map(kv => { const [k, v] = kv.split('='); return [k.trim(), Number(v)]; }));
}

// Largest-remainder allocation so pieces always sum exactly to total.
// Smallest size is rounded down first when remainders tie (kit: "round smalls down").
function allocate(weights, total) {
  const sizes = Object.keys(weights);
  const sum = sizes.reduce((a, k) => a + weights[k], 0);
  if (sum <= 0) throw new Error('weights must sum to > 0');
  const raw = sizes.map((k, i) => ({ k, i, exact: weights[k] / sum * total }));
  raw.forEach(r => { r.n = Math.floor(r.exact); r.rem = r.exact - r.n; });
  let left = total - raw.reduce((a, r) => a + r.n, 0);
  [...raw].sort((a, b) => b.rem - a.rem || b.i - a.i).slice(0, left).forEach(r => r.n++);
  return Object.fromEntries(raw.map(r => [r.k, { pct: Math.round(weights[r.k] / sum * 1000) / 10, pieces: r.n }]));
}

// Pre-order mode: every real order is made; buffer pieces follow the order curve.
function preorderRun(orders, bufferPct) {
  const total = Object.values(orders).reduce((a, b) => a + b, 0);
  const buffer = Math.round(total * bufferPct / 100);
  const extra = buffer > 0 ? allocate(orders, buffer) : {};
  return Object.fromEntries(Object.keys(orders).map(k => [k, {
    orders: orders[k], buffer: extra[k] ? extra[k].pieces : 0,
    make: orders[k] + (extra[k] ? extra[k].pieces : 0) }]));
}

module.exports = { allocate, preorderRun, CPO_CURVE };

if (require.main === module) {
  const a = process.argv.slice(2), get = f => { const i = a.indexOf(f); return i >= 0 ? a[i + 1] : null; };
  if (get('--preorders')) {
    const r = preorderRun(parseMap(get('--preorders')), Number(get('--buffer') || 0));
    console.table(r);
  } else {
    const pieces = Number(get('--pieces'));
    if (!pieces) { console.error('need --pieces N (and --votes S=..,M=..) or --preorders'); process.exit(1); }
    const votes = get('--votes');
    console.log(votes ? 'From your votes:' : 'No votes yet: using CPO curve 1:1:2:3:2:1 (S-3XL)');
    console.table(allocate(votes ? parseMap(votes) : CPO_CURVE, pieces));
  }
}
