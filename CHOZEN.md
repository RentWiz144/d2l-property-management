# CHOZEN SCENE GENERATOR

**Authority / Faith / Pressure / Discipline Engine**

A modular prompt assembly system. Every scene = 6–8 locked layers. Miss one → quality drops.

---

## Quick Start

```bash
# Run a specific preset
node index.js --preset authority
node index.js --preset faith
node index.js --preset pressure
node index.js --preset discipline

# Random preset
node index.js

# List presets
node index.js --list
```

---

## Architecture

```
src/
├── engine/
│   └── SceneEngine.js          ← Assembles all layers into the final prompt
├── modules/
│   ├── IdentityLock.js         ← Layer 1: Non-negotiable identity preservation
│   ├── EmotionalState.js       ← Layer 2: Authority / Faith / Pressure / Discipline
│   ├── CompositionBreak.js     ← Layer 3: Off-center, tilt, negative space, crop
│   ├── LightingConflict.js     ← Layer 4: Cool vs warm, mandatory conflict
│   ├── EnvironmentImperfection.js ← Layer 5: Stains, wear, misplacement
│   ├── FaceDetail.js           ← Layer 6: Pores, fatigue, tone breaks
│   ├── CameraDegradation.js    ← Layer 7: Grain, drift, edge softness
│   └── TextImperfection.js     ← Layer 8 (optional): Quote visuals
├── presets/
│   ├── authority.js
│   ├── faith.js
│   ├── pressure.js
│   └── discipline.js
└── generator.js                ← Master generator API
index.js                        ← CLI entry point
```

---

## The 8 Layers

| # | Layer | Rule |
|---|-------|------|
| 1 | Identity Lock | Never change bone structure, skin variation, beard, asymmetry |
| 2 | Emotional State | One of: AUTHORITY / FAITH / PRESSURE / DISCIPLINE |
| 3 | Composition Break | 2–3 picks: off-center, tilt, negative space, crop, imbalance |
| 4 | Lighting Conflict | Cool (window) vs warm (lamp) — always in conflict |
| 5 | Environment Imperfection | 1–2 picks: stain, discoloration, worn patch, misplaced object |
| 6 | Face & Micro Detail | Always applied: uneven tone, nose break, fatigue, beard randomness |
| 7 | Camera Degradation | Always applied: grain clusters, exposure drift, edge softness |
| 8 | Text Imperfection | Optional: off-white, faded word, micro-blur, spacing inconsistency |

---

## Programmatic Use

```js
const { generateFromPreset, generateCustom } = require('./src/generator');

// Preset with override
const prompt = generateFromPreset('authority', {
  location: 'boardroom — empty chairs, late night',
  textImperfection: {
    quote: 'The decision was already made.',
    attribution: null,
  }
});

console.log(prompt);
```

```js
// Fully custom scene
const { generateCustom } = require('./src/generator');

const prompt = generateCustom({
  emotionalState: 'PRESSURE',
  location: 'bathroom mirror — 3am',
  compositionPicks: ['UNCOMFORTABLE_CROP', 'NEGATIVE_SPACE'],
  lightingOptions: { dominantSource: 'WARM' },
  environmentPicks: ['DISCOLORATION'],
  cameraOptions: { addMotionTrace: true },
});
```

---

## Emotional States

### AUTHORITY
> "I already decided."
- Controlled dominance — not loud, not aggressive
- Expression restrained, eyes steady, posture composed

### FAITH
> "I'm seeking direction."
- Quiet submission, reflection
- Head lowered, eyes softened, hands relaxed

### PRESSURE
> "I know the answer. I don't like it."
- Internal weight
- Uneven brow tension, compressed lips, off-focus gaze

### DISCIPLINE
> "Do it anyway."
- Controlled repetition, endurance
- Neutral face, slight fatigue, stable posture

---

## Hard Constraints (Always Applied)

- No symmetry
- No posing
- No clean gradients
- No polished surfaces
- No "cinematic" look
- No AI sharpness
- No smoothed skin
- No perfect lighting
