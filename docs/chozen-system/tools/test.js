// node test.js — zero-dependency checks for the ChoZen System tools.
const assert = require('assert');
const s = require('./shabbat'), { allocate, preorderRun } = require('./size-split'), { build } = require('./drop-calendar');
const mins = d => { const p = s.detroitParts(d); return p.hh * 60 + p.mm; };
// Published Detroit sunsets (timeanddate.com): Jun 21 ~9:13 PM, Dec 21 ~5:03 PM. Allow 3 min.
assert(Math.abs(mins(s.sunsetUTC(2026, 6, 21)) - (21 * 60 + 13)) <= 3, 'June sunset');
assert(Math.abs(mins(s.sunsetUTC(2026, 12, 21)) - (17 * 60 + 3)) <= 3, 'Dec sunset');
assert.strictEqual(s.isShabbat(s.detroitToUTC(2027, 1, 15, 20, 0)), true, 'Fri night is Shabbat');
assert.strictEqual(s.isShabbat(s.detroitToUTC(2027, 1, 15, 15, 0)), false, 'Fri afternoon is not');
assert.strictEqual(s.isShabbat(s.detroitToUTC(2027, 1, 16, 15, 0)), true, 'Sat afternoon is Shabbat');
assert.strictEqual(s.isShabbat(s.detroitToUTC(2027, 1, 16, 18, 0)), false, 'Sat after sundown is not');
// Kit example reproduces exactly: 50 pieces, 25/21/54 -> 12/11/27.
const k = allocate({ S: 25, M: 21, L: 54 }, 50);
assert.deepStrictEqual([k.S.pieces, k.M.pieces, k.L.pieces], [12, 11, 27]);
assert.strictEqual(Object.values(allocate({ S: 1, M: 1, L: 2, XL: 3, '2XL': 2, '3XL': 1 }, 61)).reduce((a, r) => a + r.pieces, 0), 61, 'sums exactly');
const pr = preorderRun({ S: 4, M: 9, L: 14, XL: 11, '2XL': 6, '3XL': 3 }, 10);
assert(Object.entries({ S: 4, M: 9, L: 14 }).every(([k, v]) => pr[k].make >= v), 'pre-orders always made');
assert.strictEqual(pr.S.buffer + pr['3XL'].buffer, 0, 'no buffer on S/3XL (CPO)');
assert.throws(() => preorderRun({ S: 1, M: 0 }, 50), /cap/, 'buffer over 10% rejected');
assert.strictEqual(preorderRun({ S: 1, M: 0 }, 0).S.make, 1, 'buffer 0 ok');
// Calendar: nothing lands on Saturday; Shabbat drop is rejected; Sat-closing window flagged.
// Nothing (runway sends, content, or drop-week timeline) may land inside Shabbat, across seasons + DST.
const { detroitParts } = s;
for (const drop of ['2027-01-10T19:00', '2027-03-14T19:00', '2027-06-20T19:00', '2027-11-07T19:00', '2027-01-12T19:00', '2026-12-29T19:00']) {
  const r = build(drop, 7);
  r.rows.filter(x => x.type !== 'send' && x.type !== 'drop').forEach(x => assert(!x.date.startsWith('Sat'), drop + ' content on Sat: ' + x.task));
  assert.strictEqual(r.errors.length, 0, drop + ' should be clean: ' + r.errors.join('; '));
}
// The reviewer's case: Sunday 3/14 drop -> -24h reminder must not be Sat 7 PM (inside Shabbat).
const mar = build('2027-03-14T19:00', 7).timeline.find(t => t.what.startsWith('Window close -24h'));
assert(/Sat, 3\/20, 8:13 PM/.test(mar.when), 'reminder moved after sundown: ' + mar.when);
// A send moved off Shabbat must stay before the drop (copy stays true).
const jun = build('2027-06-20T19:00', 7).rows.find(r => r.day === 29);
assert(/Sat, 6\/19, 9:4\d PM/.test(jun.date), '24h text Saturday night: ' + jun.date);
assert.throws(() => build('2027-01-12T19:00', NaN), /whole number/, 'NaN window rejected');
assert(build('2027-01-16T12:00').errors.some(e => e.includes('inside Shabbat')), 'Shabbat drop rejected');
assert(build('2027-01-15T12:00').errors.some(e => e.includes('Friday drop')), 'Friday drop rejected');
assert.strictEqual(build('2027-01-14T19:00', 10).errors.length, 0, 'Thursday is a note, not a stop');
assert(build('2027-01-14T19:00', 9).errors.some(e => e.includes('closes Sat')), 'Sat close flagged');
assert.strictEqual(build('2027-01-12T19:00', 7).errors.length, 0, 'Tue drop + 7-day window is clean');
console.log('all tests passed');
