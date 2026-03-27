/**
 * PRESET — AUTHORITY
 *
 * Emotion: Controlled dominance
 * Energy: "I already decided."
 * Location: desk, decision moment
 */

module.exports = {
  emotionalState: "AUTHORITY",
  location: "desk — decision moment, papers or device nearby, not arranged",

  compositionPicks: ["SLIGHT_TILT", "OFF_CENTER", "IMBALANCE"],

  lightingOptions: {
    dominantSource: "COOL",
    extraForce: [
      "heavy shadow falls across one side of face — jaw line barely visible",
    ],
  },

  environmentPicks: ["MISPLACED_OBJECT", "DESK_STAIN"],

  faceDetailExtras: [
    "misaligned hands — fingers not evenly spaced or symmetrical",
    "slight jaw set — not clenching, just settled",
  ],

  cameraOptions: {
    addChromatic: false,
    addMotionTrace: false,
  },

  // No quote by default — override as needed
  textImperfection: null,
};
