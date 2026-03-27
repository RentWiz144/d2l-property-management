/**
 * LAYER 8 — TEXT IMPERFECTION SYSTEM (OPTIONAL — HIGH IMPACT)
 *
 * Use when doing quote visuals.
 * Rule: text must feel photographed, not designed.
 */

const BASE_RULES = [
  "color: off-white — NOT pure white, slightly warm or cool shift",
  "one word slightly faded — less ink saturation than surrounding words",
  "one letter micro-blurred — single character softer than rest",
  "slight spacing inconsistency — word or letter spacing not perfectly uniform",
  "subtle perspective mismatch — text plane slightly off from image plane",
];

/**
 * @param {object} options
 * @param {string} [options.quote] - The quote text to include
 * @param {string} [options.attribution] - Who said it (optional)
 * @param {string[]} [options.extras] - Additional text imperfection rules
 * @returns {string} Text imperfection prompt block, or empty string if disabled
 */
function buildTextImperfection({ quote, attribution, extras = [] } = {}) {
  const rules = [...BASE_RULES, ...extras];

  let quoteBlock = "";
  if (quote) {
    quoteBlock = `\nQuote: "${quote}"${attribution ? `\nAttribution: — ${attribution}` : ""}\n`;
  }

  return `TEXT IMPERFECTION (QUOTE VISUAL):${quoteBlock}
Rules:
${rules.map(r => `– ${r}`).join("\n")}

This text must feel printed, worn, and photographed — not set in a design tool.`;
}

module.exports = { buildTextImperfection };
