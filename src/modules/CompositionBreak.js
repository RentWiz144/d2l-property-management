/**
 * LAYER 3 — COMPOSITION BREAK SYSTEM
 *
 * Pick 2–3 per scene.
 * Breaks destroy false perfection. They anchor the image in reality.
 */

const OPTIONS = {
  OFF_CENTER: "subject off-center (left/right bias)",
  NEGATIVE_SPACE: "excessive negative space on one side",
  SLIGHT_TILT: "slight tilt (1–2 degrees)",
  UNCOMFORTABLE_CROP: "uncomfortable crop — head not perfectly framed",
  IMBALANCE: "visual imbalance — one side heavier than the other",
};

const OPTION_KEYS = Object.keys(OPTIONS);

/**
 * @param {string[]} picks - Array of 2–3 option keys from OPTIONS
 *   e.g. ["OFF_CENTER", "SLIGHT_TILT", "IMBALANCE"]
 *   If omitted, a random valid set is chosen.
 * @returns {string} Composition break prompt block
 */
function buildCompositionBreak(picks) {
  let chosen;

  if (picks && picks.length) {
    if (picks.length < 2 || picks.length > 3) {
      throw new Error("CompositionBreak: pick 2–3 options.");
    }
    chosen = picks.map(k => {
      const key = k.toUpperCase();
      if (!OPTIONS[key]) throw new Error(`Unknown composition option: "${k}"`);
      return OPTIONS[key];
    });
  } else {
    // random 2–3 from full set
    const shuffled = [...OPTION_KEYS].sort(() => Math.random() - 0.5);
    const count = Math.random() < 0.5 ? 2 : 3;
    chosen = shuffled.slice(0, count).map(k => OPTIONS[k]);
  }

  return `COMPOSITION BREAK:
${chosen.map(c => `– ${c}`).join("\n")}`;
}

module.exports = { buildCompositionBreak, COMPOSITION_OPTIONS: OPTIONS };
