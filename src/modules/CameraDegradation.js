/**
 * LAYER 7 — CAMERA DEGRADATION
 *
 * Always apply. Removes AI sharpness signature.
 * The image must feel captured, not rendered.
 */

const ALWAYS_APPLY = [
  "uneven grain — clustered, not uniform across the frame",
  "slight exposure drift — left side does not match right",
  "edge softness — 3–5% across frame edges",
  "slight focus falloff — subject edges marginally softer than center",
];

/**
 * @param {object} options
 * @param {string[]} [options.extras] - Additional degradation rules
 * @param {boolean} [options.addChromatic=false] - Add subtle chromatic aberration
 * @param {boolean} [options.addMotionTrace=false] - Add micro motion blur on edges
 * @returns {string} Camera degradation prompt block
 */
function buildCameraDegradation({ extras = [], addChromatic = false, addMotionTrace = false } = {}) {
  const all = [...ALWAYS_APPLY, ...extras];

  if (addChromatic) {
    all.push("subtle chromatic aberration on high-contrast edges");
  }
  if (addMotionTrace) {
    all.push("micro motion trace on periphery — as if caught mid-gesture");
  }

  return `CAMERA DEGRADATION:
${all.map(d => `– ${d}`).join("\n")}

Purpose: remove the AI sharpness signature — this image must feel captured, not generated.`;
}

module.exports = { buildCameraDegradation };
