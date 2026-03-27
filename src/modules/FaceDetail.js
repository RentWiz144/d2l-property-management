/**
 * LAYER 6 — FACE & MICRO DETAIL BREAK
 *
 * Always apply. No exceptions.
 * Breaks the AI sharpness signature.
 */

const ALWAYS_APPLY = [
  "uneven skin tone — forehead does not match cheeks",
  "broken transition across nose bridge",
  "under-eye fatigue — subtle, not exaggerated",
  "beard randomness — strand separation, density shifts, no uniform texture",
];

/**
 * @param {string[]} extras - Additional micro detail rules to append
 * @returns {string} Face detail prompt block
 */
function buildFaceDetail(extras = []) {
  const all = [...ALWAYS_APPLY, ...extras];

  return `FACE & MICRO DETAIL BREAK (ALWAYS APPLIED):
${all.map(d => `– ${d}`).join("\n")}`;
}

module.exports = { buildFaceDetail };
