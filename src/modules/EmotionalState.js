/**
 * LAYER 2 — EMOTIONAL STATE MODULES
 *
 * Choose ONE per scene.
 * Each state has a specific energy, expression, and core emotion.
 */

const STATES = {
  AUTHORITY: {
    id: "AUTHORITY",
    energy: "Controlled dominance — NOT loud, NOT aggressive",
    markers: [
      "expression restrained",
      "eyes steady but not wide",
      "posture composed, not posed",
      "minimal movement",
    ],
    coreEmotion: "I already decided.",
  },

  FAITH: {
    id: "FAITH",
    energy: "Quiet submission / reflection",
    markers: [
      "head slightly lowered",
      "eyes not fully visible or softened",
      "hands relaxed or holding scripture",
    ],
    coreEmotion: "I'm seeking direction.",
  },

  PRESSURE: {
    id: "PRESSURE",
    energy: "Internal weight",
    markers: [
      "brow tension uneven",
      "lips compressed imperfectly",
      "gaze slightly off-focus",
    ],
    coreEmotion: "I know the answer. I don't like it.",
  },

  DISCIPLINE: {
    id: "DISCIPLINE",
    energy: "Controlled repetition / endurance",
    markers: [
      "neutral face (almost emotionless)",
      "slight fatigue visible",
      "posture stable, not expressive",
    ],
    coreEmotion: "Do it anyway.",
  },
};

/**
 * @param {"AUTHORITY"|"FAITH"|"PRESSURE"|"DISCIPLINE"} stateKey
 * @returns {string} Emotional state prompt block
 */
function buildEmotionalState(stateKey) {
  const key = stateKey.toUpperCase();
  const state = STATES[key];
  if (!state) {
    throw new Error(
      `Unknown emotional state: "${stateKey}". Choose from: ${Object.keys(STATES).join(", ")}`
    );
  }

  return `EMOTIONAL STATE — ${state.id}:
Energy: ${state.energy}

Expression markers:
${state.markers.map(m => `– ${m}`).join("\n")}

Core emotion:
"${state.coreEmotion}"`;
}

module.exports = { buildEmotionalState, STATES };
