"use strict";
// The planner's Sabbath guard is a JS port of chozen-autopost's sundown_guard.py.
// This test extracts the guard block from the artifact and checks it against known values.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const html = fs.readFileSync(path.join(__dirname, "..", "content-system", "content-globe.html"), "utf8");
const block = html.split("/* @@SABBATH-START */")[1].split("/* @@SABBATH-END */")[0];
const guard = new Function(`${block}; return { sunsetUTC, inSabbath, nextSafe, wallToUTC, local, sabbathWindow };`)();

// Reference values: Python sundown_guard.py (same NOAA algorithm), see test/fixtures/python-reference.json
const ref = JSON.parse(fs.readFileSync(path.join(__dirname, "fixtures", "python-reference.json"), "utf8"));

test("sunset matches the Python guard within 60 seconds", () => {
  for (const r of ref.sunsets) {
    const [y, m, d] = r.date.split("-").map(Number);
    const diff = Math.abs(guard.sunsetUTC(y, m, d) - Date.parse(r.sunset_utc)) / 1000;
    assert.ok(diff < 60, `${r.date}: off by ${diff}s`);
  }
});

test("blocked/allowed verdicts match the Python guard", () => {
  for (const c of ref.checks) {
    const [date, time] = c.local.split("T"); const [y, m, d] = date.split("-").map(Number); const [h, mi] = time.split(":").map(Number);
    assert.equal(guard.inSabbath(guard.wallToUTC(y, m, d, h, mi)), c.blocked, c.local);
  }
});

test("wall time round-trips across DST", () => {
  for (const [y, m, d, h, mi] of [[2026, 3, 8, 10, 0], [2026, 11, 1, 10, 0], [2026, 7, 4, 19, 30], [2026, 12, 25, 12, 0]]) {
    const l = guard.local(guard.wallToUTC(y, m, d, h, mi));
    assert.deepEqual([l.y, l.m, l.d, l.h, l.mi], [y, m, d, h, mi]);
  }
});

test("nextSafe lands after the window and outside it", () => {
  const t = guard.wallToUTC(2026, 11, 27, 18, 0);
  const s = guard.nextSafe(t);
  assert.ok(!guard.inSabbath(s));
  assert.ok(s > guard.sabbathWindow(t)[1]);
  const free = guard.wallToUTC(2026, 11, 25, 10, 0);
  assert.equal(guard.nextSafe(free), free);
});
