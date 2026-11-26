"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { buildShootDay, countAssets, listShots, toMarkdown, SHOTS } = require("../src/shoots/SevenShots");
const { PRESETS } = require("../src/generator");

test("exactly seven shots, unique ids, valid presets", () => {
  assert.equal(SHOTS.length, 7);
  assert.equal(new Set(listShots()).size, 7);
  SHOTS.forEach(s => s.preset && assert.ok(PRESETS[s.preset], s.preset));
});

test("every funnel layer is covered", () => {
  assert.deepEqual([...new Set(SHOTS.map(s => s.funnel))].sort(), ["BOF", "MOF", "TOF"]);
});

test("athletic line never asks for fringes", () => {
  const [g] = buildShootDay([{ name: "Windbreaker", line: "athletic" }]);
  const text = JSON.stringify(g.shots);
  assert.match(text, /NO fringes/);
  assert.doesNotMatch(text.replace(/NO fringes|no fringes/gi, ""), /fringes around/i);
  assert.match(g.shots.find(s => s.id === "detail").what, /construction/i);
});

test("standard and women's lines carry their garment law", () => {
  const day = buildShootDay([{ name: "Tee" }, { name: "Maxi", line: "womens" }]);
  assert.match(JSON.stringify(day[0].shots), /ENTIRE lower hem/);
  assert.match(JSON.stringify(day[1].shots), /maxi skirt or dress only/);
  assert.match(JSON.stringify(day[0].shots.find(s => s.id === "hero")), /IG feed crops to 4:5/);
});

test("--shots filter and bad input", () => {
  const [g] = buildShootDay([{ name: "Tee" }], { only: ["hero", "phone"] });
  assert.deepEqual(g.shots.map(s => s.id), ["hero", "phone"]);
  assert.throws(() => buildShootDay([]), /at least one garment/);
  assert.throws(() => buildShootDay([{ name: "Tee", line: "denim" }]), /Unknown line/);
  assert.throws(() => buildShootDay([{ name: "Tee" }], { only: ["selfie"] }), /Unknown shot/);
  assert.throws(() => buildShootDay([{ name: " " }]), /needs a name/);
});

test("markdown lists every shot and a deliverable count", () => {
  const day = buildShootDay([{ name: "Tee" }, { name: "Maxi", line: "womens" }]);
  const md = toMarkdown(day);
  assert.equal((md.match(/^### /gm) || []).length, 14);
  assert.match(md, new RegExp(`${countAssets(day)} deliverables`));
});
