/**
 * LAYER 1 — IDENTITY LOCK
 *
 * Non-negotiable. Preserves exact facial identity across all scenes.
 * No enhancement. No smoothing. No "correction".
 */

const defaults = {
  boneStructure: true,
  skinToneVariation: true,
  beardDensityRandomness: true,
  asymmetry: true,
  pores: true,
  underEyeFatigue: true,
  tonalInconsistencies: true,
  microFacialTension: true,
};

/**
 * @param {object} overrides - Override specific identity flags (all true by default)
 * @returns {string} Identity lock prompt block
 */
function buildIdentityLock(overrides = {}) {
  const config = { ...defaults, ...overrides };

  const preserveList = [];
  const doNotChangeList = [];

  if (config.boneStructure) doNotChangeList.push("bone structure");
  if (config.skinToneVariation) doNotChangeList.push("skin tone variation");
  if (config.beardDensityRandomness) doNotChangeList.push("beard density and randomness");
  if (config.asymmetry) doNotChangeList.push("facial asymmetry");

  if (config.pores) preserveList.push("pores");
  if (config.underEyeFatigue) preserveList.push("under-eye fatigue");
  if (config.tonalInconsistencies) preserveList.push("tonal inconsistencies");
  if (config.microFacialTension) preserveList.push("micro facial tension");

  return `IDENTITY LOCK:
Use exact facial identity from reference images.

DO NOT CHANGE:
${doNotChangeList.map(i => `– ${i}`).join("\n")}

PRESERVE:
${preserveList.map(i => `– ${i}`).join("\n")}

No smoothing. No sharpening. No enhancement.
This is your continuity system across ALL content.`;
}

module.exports = { buildIdentityLock };
