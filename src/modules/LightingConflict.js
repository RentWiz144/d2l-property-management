/**
 * LAYER 4 — LIGHTING CONFLICT ENGINE
 *
 * MANDATORY — always applied.
 * Two conflicting sources. No clean gradients. No cinematic glow.
 */

const SOURCES = {
  COOL: {
    label: "cool",
    origin: "window light (natural, bluish)",
  },
  WARM: {
    label: "warm",
    origin: "practical lamp (amber, localized)",
  },
};

const FORCE_RULES = [
  "uneven face lighting — one side dirtier/darker than the other",
  "color contamination — cool light bleeding into warm-lit zones",
  "imperfect falloff — no smooth gradient between zones",
  "minor overexposure near the dominant source",
];

const AVOID = [
  "cinematic glow",
  "perfect gradients",
  "balanced fill light",
  "symmetrical exposure",
];

/**
 * @param {object} options
 * @param {string} [options.dominantSource="COOL"] - Which source is dominant: "COOL" or "WARM"
 * @param {string[]} [options.extraForce] - Additional force rules to append
 * @returns {string} Lighting conflict prompt block
 */
function buildLightingConflict({ dominantSource = "COOL", extraForce = [] } = {}) {
  const dom = SOURCES[dominantSource.toUpperCase()] || SOURCES.COOL;
  const sub = dominantSource.toUpperCase() === "COOL" ? SOURCES.WARM : SOURCES.COOL;

  const allForce = [...FORCE_RULES, ...extraForce];

  return `LIGHTING CONFLICT (MANDATORY):
Source 1 — ${SOURCES.COOL.label}: ${SOURCES.COOL.origin}
Source 2 — ${SOURCES.WARM.label}: ${SOURCES.WARM.origin}
Dominant: ${dom.label}

FORCE:
${allForce.map(r => `– ${r}`).join("\n")}

AVOID:
${AVOID.map(a => `– ${a}`).join("\n")}`;
}

module.exports = { buildLightingConflict, LIGHT_SOURCES: SOURCES };
