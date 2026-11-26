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
const pr = preorderRun({ S: 4, M: 9 }, 10);
assert(pr.S.make >= 4 && pr.M.make >= 9, 'pre-orders always made');
// Calendar: nothing lands on Saturday; Shabbat drop is rejected; Sat-closing window flagged.
const cal = build('2027-01-14T19:00', 7);
assert(!cal.rows.some(r => r.date.startsWith('Sat')), 'no Saturday tasks');
assert(build('2027-01-16T12:00').errors.some(e => e.includes('inside Shabbat')), 'Shabbat drop rejected');
assert(build('2027-01-14T19:00', 9).errors.some(e => e.includes('closes Sat')), 'Sat close flagged');
assert.strictEqual(build('2027-01-12T19:00', 7).errors.length, 0, 'Tue drop + 7-day window is clean');
console.log('all tests passed');
