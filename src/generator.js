/**
 * CHOZEN MASTER GENERATOR
 *
 * High-level API. Load a preset or pass a custom config.
 * Returns a complete, ready-to-use scene prompt.
 */

const { buildScene, validateScene } = require("./engine/SceneEngine");

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
 * List all available presets.
 * @returns {string[]}
 */
function listPresets() {
  return Object.keys(PRESETS);
}

module.exports = { generateFromPreset, generateCustom, listPresets, PRESETS };
