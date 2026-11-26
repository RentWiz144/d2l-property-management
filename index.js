#!/usr/bin/env node
/**
 * CHOZEN SCENE GENERATOR — CLI
 *
 * Usage:
 *   node index.js                         # Interactive mode (random preset)
 *   node index.js --preset authority      # Run named preset
 *   node index.js --preset faith          # Run named preset
 *   node index.js --preset pressure
 *   node index.js --preset discipline
 *   node index.js --list                  # List all presets
 *
 * Shot Director (video):
 *   node index.js --preset authority --move orbit           # one video clip prompt
 *   node index.js --preset discipline --moves tracking,whip-pan,pull-back
 *                                                           # multi-shot list for a Reel
 *   node index.js --moves-list                              # list camera moves
 *
 * Shoot Day (the seven shots):
 *   node index.js --shoot-day "Unshaken tee:standard,Satin maxi:womens,Windbreaker:athletic"
 *   node index.js --shoot-day "Unshaken tee" --shots hero,detail,phone
 *
 * Output: the full assembled scene prompt, ready to paste into any AI image generator.
 */

"use strict";

const {
  generateFromPreset,
  generateShotList,
  listPresets,
  listMoves,
  movesFor,
} = require("./src/generator");
const { MOVES } = require("./src/modules/CameraMove");
const { buildShootDay, toMarkdown } = require("./src/shoots/SevenShots");

function flagValue(args, flag) {
  const i = args.indexOf(flag);
  if (i === -1) return undefined;
  const v = args[i + 1];
  if (!v || v.startsWith("--")) {
    console.error(`Error: ${flag} requires a value.`);
    process.exit(1);
  }
  return v;
}

const DIVIDER = "═".repeat(70);
const SECTION  = "─".repeat(70);

function header() {
  console.log("\n" + DIVIDER);
  console.log("  CHOZEN SCENE GENERATOR");
  console.log("  Authority / Faith / Pressure / Discipline Engine");
  console.log(DIVIDER + "\n");
}

function run() {
  const args = process.argv.slice(2);

  if (args.includes("--list")) {
    header();
    console.log("Available presets:\n");
    listPresets().forEach(p => console.log(`  → ${p}`));
    console.log();
    return;
  }

  if (args.includes("--moves-list")) {
    header();
    console.log("Camera moves (Shot Director):\n");
    listMoves().forEach(k => {
      const m = MOVES[k];
      console.log(`  → ${k.toLowerCase().replace(/_/g, "-")}  ${m.label} — ${m.useAs}`);
      console.log(`      best for: ${m.bestFor.join(", ")}`);
    });
    console.log();
    return;
  }

  const shootDay = flagValue(args, "--shoot-day");
  if (shootDay) {
    try {
      const garments = shootDay.split(",").map(x => x.trim()).filter(Boolean).map(x => {
        const [name, line] = x.split(":").map(y => y.trim());
        return { name, line: line || "standard" };
      });
      const shots = flagValue(args, "--shots");
      const only = shots ? shots.split(",").map(x => x.trim()).filter(Boolean) : undefined;
      console.log(toMarkdown(buildShootDay(garments, { only })));
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
    return;
  }

  let preset = null;

  const presetIdx = args.indexOf("--preset");
  if (presetIdx !== -1) {
    preset = args[presetIdx + 1];
    if (!preset) {
      console.error("Error: --preset requires a name. Use --list to see options.");
      process.exit(1);
    }
  } else {
    // Pick random preset when none specified
    const all = listPresets();
    preset = all[Math.floor(Math.random() * all.length)];
    console.log(`[No preset specified — running random: ${preset.toUpperCase()}]\n`);
  }

  header();

  const move = flagValue(args, "--move");
  const moves = flagValue(args, "--moves");
  if (move && moves) {
    console.error("Error: use --move (one clip) or --moves (shot list), not both.");
    process.exit(1);
  }

  try {
    if (moves) {
      const list = generateShotList(preset, moves.split(",").map(m => m.trim()).filter(Boolean));
      list.forEach(s => {
        console.log(`\n${SECTION}\n  SHOT ${s.shot} of ${list.length} — ${s.move}\n${SECTION}\n`);
        console.log(s.prompt);
      });
      console.log("\n" + DIVIDER);
      console.log(`  SHOT LIST: ${preset.toUpperCase()} — ${list.length} shots. Same identity lock in every shot.`);
      console.log(DIVIDER + "\n");
      return;
    }

    if (!move) {
      const fit = movesFor(require("./src/generator").PRESETS[preset.toLowerCase()]?.emotionalState);
      if (fit.length) console.error(`[Video tip: --move ${fit[0].toLowerCase().replace(/_/g, "-")} fits this preset]`);
    }

    const prompt = generateFromPreset(preset, move ? { cameraMove: move } : {});
    console.log(prompt);
    console.log("\n" + DIVIDER);
    console.log(`  SCENE: ${preset.toUpperCase()} — generation complete.`);
    console.log(DIVIDER + "\n");
  } catch (err) {
    console.error(`\nError: ${err.message}`);
    process.exit(1);
  }
}

run();
