/**
 * PRESET — PRESSURE
 *
 * Emotion: Internal weight
 * Energy: "I know the answer. I don't like it."
 * Location: workspace — confined, not staged
 */

module.exports = {
  emotionalState: "PRESSURE",
  location: "workspace — cluttered but functional, not staged",

  compositionPicks: ["UNCOMFORTABLE_CROP", "NEGATIVE_SPACE", "IMBALANCE"],

  lightingOptions: {
    dominantSource: "WARM",
    extraForce: [
      "lighting imbalance severe — one side nearly dark",
      "slight overexposure where lamp catches the brow",
    ],
  },

  environmentPicks: ["DESK_STAIN", "PAPER_CLUTTER"],

  faceDetailExtras: [
    "tighter crop — shoulders barely in frame",
    "slight gloss on skin from heat or stress — uneven",
  ],

  cameraOptions: {
    addChromatic: false,
    addMotionTrace: true,
  },

  textImperfection: null,
};
