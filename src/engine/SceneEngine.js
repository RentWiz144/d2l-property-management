/**
 * CHOZEN SCENE ENGINE
 *
 * Assembles all 6–8 locked layers into a complete, guaranteed high-output scene prompt.
 * Miss ONE layer → quality drops.
 *
 * Layer order:
 *   1. IDENTITY LOCK
 *   2. EMOTIONAL STATE
 *   3. COMPOSITION BREAK
 *   4. LIGHTING CONFLICT
 *   5. ENVIRONMENT IMPERFECTION
 *   6. FACE & MICRO DETAIL BREAK
 *   7. CAMERA DEGRADATION
 *   8. TEXT IMPERFECTION (optional)
 */

const { buildIdentityLock } = require("../modules/IdentityLock");
const { buildEmotionalState } = require("../modules/EmotionalState");
const { buildCompositionBreak } = require("../modules/CompositionBreak");
const { buildLightingConflict } = require("../modules/LightingConflict");
const { buildEnvironmentImperfection } = require("../modules/EnvironmentImperfection");
const { buildFaceDetail } = require("../modules/FaceDetail");
const { buildCameraDegradation } = require("../modules/CameraDegradation");
const { buildTextImperfection } = require("../modules/TextImperfection");

const HARD_CONSTRAINTS = `CONSTRAINTS (NON-NEGOTIABLE):
– No symmetry
– No posing
– No clean gradients
– No polished surfaces
– No "cinematic" look
– No AI sharpness
– No smoothed skin
– No perfect lighting`;

/**
 * Assembles a complete scene prompt from layer configurations.
 *
 * @param {object} config - Full scene configuration
 * @param {string} config.emotionalState - "AUTHORITY" | "FAITH" | "PRESSURE" | "DISCIPLINE"
 * @param {string} config.location - Scene location description (e.g. "desk, decision moment")
 * @param {object} [config.identityOverrides] - Override identity lock flags
 * @param {string[]} [config.compositionPicks] - 2–3 composition break keys
 * @param {object} [config.lightingOptions] - Options for lighting conflict
 * @param {string[]} [config.environmentPicks] - 1–2 environment imperfection keys
 * @param {string[]} [config.faceDetailExtras] - Additional face detail rules
 * @param {object} [config.cameraOptions] - Options for camera degradation
 * @param {object|null} [config.textImperfection] - Text imperfection config, or null to omit
 * @returns {string} Complete assembled scene prompt
 */
function buildScene(config) {
  const {
    emotionalState,
    location,
    identityOverrides = {},
    compositionPicks,
    lightingOptions = {},
    environmentPicks,
    faceDetailExtras = [],
    cameraOptions = {},
    textImperfection = null,
  } = config;

  if (!emotionalState) throw new Error("SceneEngine: emotionalState is required.");
  if (!location) throw new Error("SceneEngine: location is required.");

  // Assemble opener
  const opener = `Capture a real, unguarded moment of a man living within ${emotionalState.toLowerCase()}.

This is not a posed image.
This is a moment observed too late to fix.

Location: ${location}`;

  // Assemble all layers
  const layers = [
    opener,
    buildIdentityLock(identityOverrides),
    buildEmotionalState(emotionalState),
    buildCompositionBreak(compositionPicks),
    buildLightingConflict(lightingOptions),
    buildEnvironmentImperfection(environmentPicks),
    buildFaceDetail(faceDetailExtras),
    buildCameraDegradation(cameraOptions),
  ];

  // Optional text layer
  if (textImperfection) {
    layers.push(buildTextImperfection(textImperfection));
  }

  // Hard constraints always last
  layers.push(HARD_CONSTRAINTS);

  // Divide by the separator
  return layers.join("\n\n" + "─".repeat(60) + "\n\n");
}

/**
 * Validates a scene config and returns any missing/invalid layer warnings.
 * @param {object} config
 * @returns {string[]} Array of warning messages (empty = valid)
 */
function validateScene(config) {
  const warnings = [];
  if (!config.emotionalState) warnings.push("MISSING: emotionalState");
  if (!config.location) warnings.push("MISSING: location");
  return warnings;
}

module.exports = { buildScene, validateScene, HARD_CONSTRAINTS };
