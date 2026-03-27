/**
 * PRESET — DISCIPLINE
 *
 * Emotion: Controlled repetition / endurance
 * Energy: "Do it anyway."
 * Location: gym or early morning desk
 */

module.exports = {
  emotionalState: "DISCIPLINE",
  location: "gym or early morning desk — before the world is awake",

  compositionPicks: ["OFF_CENTER", "SLIGHT_TILT"],

  lightingOptions: {
    dominantSource: "COOL",
    extraForce: [
      "early morning light — flat, grey, unromantic",
      "no fill light — shadows stay dark",
    ],
  },

  environmentPicks: ["SCUFF_MARK", "DUST_GRIME"],

  faceDetailExtras: [
    "fatigue in skin texture — not dramatic, just there",
    "slight sweat or dryness inconsistency across forehead",
    "eyes forward, no engagement with camera",
  ],

  cameraOptions: {
    addChromatic: false,
    addMotionTrace: false,
    extras: ["grain heavier than usual — pulled from shadow regions"],
  },

  textImperfection: null,
};
