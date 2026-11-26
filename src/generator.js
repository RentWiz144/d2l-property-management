/**
 * CHOZEN MASTER GENERATOR
 *
 * High-level API. Load a preset or pass a custom config.
 * Returns a complete, ready-to-use scene prompt.
 */

const { buildScene, validateScene } = require("./engine/SceneEngine");
const { resolveMove, listMoves, movesFor } = require("./modules/CameraMove");

const PRESETS = {
  authority: require("./presets/authority"),
  faith: require("./presets/faith"),
  pressure: require("./presets/pressure"),
  discipline: require("./presets/discipline"),
};

/**
 * Generate a scene from a named preset.
 *
 * @param {"authority"|"faith"|"pressure"|"discipline"} presetName
 * @param {object} [overrides] - Any config keys to override on the preset
 * @returns {string} Complete scene prompt
 */
function generateFromPreset(presetName, overrides = {}) {
  const key = presetName.toLowerCase();
  const preset = PRESETS[key];
  if (!preset) {
    throw new Error(
      `Unknown preset: "${presetName}". Available: ${Object.keys(PRESETS).join(", ")}`
    );
  }

  const config = { ...preset, ...overrides };

  const warnings = validateScene(config);
  if (warnings.length) {
    console.warn("[CHOZEN ENGINE] Validation warnings:\n" + warnings.join("\n"));
  }

  return buildScene(config);
}

/**
 * Generate a scene from a fully custom config.
 *
 * @param {object} config - Full scene config (see SceneEngine.buildScene for schema)
 * @returns {string} Complete scene prompt
 */
function generateCustom(config) {
  const warnings = validateScene(config);
  if (warnings.length) {
    throw new Error("[CHOZEN ENGINE] Invalid config:\n" + warnings.join("\n"));
  }
  return buildScene(config);
}

/**
 * Build a multi-shot list for a Reel/TikTok: same preset (same man, same
 * identity lock), one camera move per shot. Paste each prompt into the
 * image-to-video model as its own clip, then cut them together in order.
 *
 * @param {string} presetName
 * @param {string[]} moves - e.g. ["tracking", "whip-pan", "pull-back"]
 * @param {object} [overrides]
 * @returns {{shot:number, move:string, prompt:string}[]}
 */
function generateShotList(presetName, moves, overrides = {}) {
  if (!Array.isArray(moves) || moves.length === 0) {
    throw new Error("generateShotList: provide at least one camera move.");
  }
  return moves.map((m, i) => {
    const move = resolveMove(m);
    return {
      shot: i + 1,
      move,
      prompt: generateFromPreset(presetName, { ...overrides, cameraMove: move }),
    };
  });
}

/**
 * List all available presets.
 * @returns {string[]}
 */
function listPresets() {
  return Object.keys(PRESETS);
}

module.exports = {
  generateFromPreset,
  generateCustom,
  generateShotList,
  listPresets,
  listMoves,
  movesFor,
  PRESETS,
};
