"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { buildCameraMove, resolveMove, listMoves, movesFor } = require("../src/modules/CameraMove");
const { generateFromPreset, generateShotList } = require("../src/generator");

test("all four moves exist", () => {
  assert.deepEqual(listMoves(), ["TRACKING", "ORBIT", "WHIP_PAN", "PULL_BACK"]);
});

test("aliases resolve", () => {
  for (const [input, key] of [["whip-pan", "WHIP_PAN"], ["pull back", "PULL_BACK"], ["Orbit", "ORBIT"],
    ["track", "TRACKING"], ["reveal", "PULL_BACK"], ["whip", "WHIP_PAN"], ["dolly-out", "PULL_BACK"]]) {
    assert.equal(resolveMove(input), key, input);
  }
});

test("unknown and empty moves throw", () => {
  assert.throws(() => resolveMove("dolly zoom"), /Unknown camera move/);
  assert.throws(() => resolveMove(""), /required/);
  assert.throws(() => buildCameraMove({ move: "orbit", durationSec: -2 }), /positive/);
});

test("move block always carries operator realism", () => {
  for (const k of listMoves()) {
    const out = buildCameraMove(k);
    assert.match(out, /OPERATOR REALISM/);
    assert.match(out, /CAMERA MOVE/);
  }
});

test("out-of-range duration is flagged, not silently accepted", () => {
  assert.match(buildCameraMove({ move: "whip-pan", durationSec: 9 }), /outside the 1–3 s sweet spot/);
});

test("still image prompt is unchanged when no move given", () => {
  const still = generateFromPreset("authority");
  assert.ok(still.startsWith("Capture a real"));
  assert.doesNotMatch(still, /CAMERA MOVE/);
});

test("video prompt puts move before hard constraints", () => {
  const vid = generateFromPreset("authority", { cameraMove: "orbit" });
  assert.ok(vid.startsWith("Film a real"));
  assert.ok(vid.indexOf("CAMERA MOVE") < vid.indexOf("CONSTRAINTS (NON-NEGOTIABLE)"));
});

test("shot list keeps identity lock in every shot", () => {
  const list = generateShotList("discipline", ["tracking", "whip-pan", "pull-back"]);
  assert.equal(list.length, 3);
  list.forEach(s => assert.match(s.prompt, /IDENTITY/i));
  assert.deepEqual(list.map(s => s.move), ["TRACKING", "WHIP_PAN", "PULL_BACK"]);
  assert.throws(() => generateShotList("discipline", []), /at least one/);
});

test("movesFor maps emotional states", () => {
  assert.deepEqual(movesFor("FAITH"), ["ORBIT", "PULL_BACK"]);
  assert.deepEqual(movesFor("nope"), []);
});
