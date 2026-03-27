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
 * Output: the full assembled scene prompt, ready to paste into any AI image generator.
 */

"use strict";

const { generateFromPreset, listPresets } = require("./src/generator");

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

  try {
    const prompt = generateFromPreset(preset);
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
