/**
 * LAYER 5 — ENVIRONMENT IMPERFECTION
 *
 * Pick 1–2 per scene.
 * Rule: if everything looks clean → it's fake.
 */

const OPTIONS = {
  DESK_STAIN: "stain on desk — non-uniform, irregular shape",
  DISCOLORATION: "discoloration streak on wall or surface",
  WORN_PATCH: "worn patch inconsistent with surrounding area",
  MISPLACED_OBJECT: "object slightly misplaced — not where it would be intentionally",
  DUST_GRIME: "subtle dust or grime variation — uneven accumulation",
  SCUFF_MARK: "scuff mark on floor or baseboard",
  PAPER_CLUTTER: "papers or items slightly disordered, not staged",
  PEELING_EDGE: "peeling or lifting edge on material (label, tape, surface)",
};

const OPTION_KEYS = Object.keys(OPTIONS);

/**
 * @param {string[]} picks - 1–2 option keys from OPTIONS
 *   If omitted, a random valid set is chosen.
 * @returns {string} Environment imperfection prompt block
 */
function buildEnvironmentImperfection(picks) {
  let chosen;

  if (picks && picks.length) {
    if (picks.length < 1 || picks.length > 2) {
      throw new Error("EnvironmentImperfection: pick 1–2 options.");
    }
    chosen = picks.map(k => {
      const key = k.toUpperCase();
      if (!OPTIONS[key]) throw new Error(`Unknown environment option: "${k}"`);
      return OPTIONS[key];
    });
  } else {
    const shuffled = [...OPTION_KEYS].sort(() => Math.random() - 0.5);
    const count = Math.random() < 0.5 ? 1 : 2;
    chosen = shuffled.slice(0, count).map(k => OPTIONS[k]);
  }

  return `ENVIRONMENT IMPERFECTION:
${chosen.map(c => `– ${c}`).join("\n")}

Rule: if everything looks clean → it is fake.`;
}

module.exports = { buildEnvironmentImperfection, ENVIRONMENT_OPTIONS: OPTIONS };
