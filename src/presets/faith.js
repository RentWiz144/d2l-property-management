/**
 * PRESET — FAITH
 *
 * Emotion: Quiet submission / reflection
 * Energy: "I'm seeking direction."
 * Location: dim room, scripture present
 */

module.exports = {
  emotionalState: "FAITH",
  location: "dim room — scripture or worn book nearby, minimal objects",

  compositionPicks: ["OFF_CENTER", "NEGATIVE_SPACE"],

  lightingOptions: {
    dominantSource: "COOL",
    extraForce: [
      "soft warm spill from a low practical light — not matched to key source",
      "page wear visible where light catches the edge",
    ],
  },

  environmentPicks: ["WORN_PATCH", "DUST_GRIME"],

  faceDetailExtras: [
    "head lowered — crown more visible than brow",
    "lip slightly parted — mid-breath, mid-thought",
  ],

  cameraOptions: {
    addChromatic: false,
    addMotionTrace: false,
  },

  textImperfection: null,
};
