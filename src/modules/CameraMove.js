/**
 * LAYER 9 (VIDEO ONLY) — CAMERA MOVE
 *
 * Shot Director. Four operator moves that make AI video read as filmed by a
 * real camera operator on a real street: TRACKING, ORBIT, WHIP PAN, PULL BACK.
 *
 * Rule: the move must feel operated, not rendered. Every move carries human
 * error (overshoot, settle, focus breathing, micro-shake) so it stays inside
 * the engine's hard constraints ("no cinematic look", "no AI sharpness").
 *
 * The four moves come from a public tip (red.voss, Nov 2026). The prompt
 * wording below is ChoZen's own, written for Seedance / Kling / Veo-class
 * image-to-video models.
 */

"use strict";

const OPERATOR_REALISM = [
  "handheld or shoulder rig — micro-shake present, never gimbal-perfect",
  "speed is uneven: the operator accelerates late and eases out slightly past the mark",
  "focus breathes once during the move, then re-settles on the eyes",
  "framing is corrected by hand mid-move — a small drift, then a fix",
];

const MOVES = {
  TRACKING: {
    label: "Tracking shot",
    intent: "Walk with him. The viewer is beside him, not watching him.",
    prompt: [
      "camera tracks alongside the subject at walking pace, roughly parallel, 1.5–2 m away",
      "subject stays near the same frame size; the background slides past with real parallax",
      "foreground objects (poles, people, parked cars) briefly cross the lens and partially block the frame",
      "the operator's footsteps read as a faint vertical bob in the frame",
    ],
    durationSec: [4, 8],
    bestFor: ["DISCIPLINE", "AUTHORITY"],
    useAs: "opener or body shot — momentum, routine, 'doing it anyway'",
  },
  ORBIT: {
    label: "Orbit",
    intent: "Circle him while he stays still. The world turns; he doesn't.",
    prompt: [
      "camera arcs around the subject 90–150°, holding a near-constant distance",
      "subject stays roughly still and centered-left; background rotates behind with strong parallax",
      "light changes across the arc — cool side to warm side — the face passes through the lighting conflict",
      "the arc is not a perfect circle: distance drifts by a step, then corrects",
    ],
    durationSec: [5, 8],
    bestFor: ["AUTHORITY", "FAITH"],
    useAs: "hero moment — product reveal on the body, a decision already made",
  },
  WHIP_PAN: {
    label: "Whip pan",
    intent: "Snap the attention. A cut disguised as a camera move.",
    prompt: [
      "fast horizontal pan, 0.2–0.4 s, with heavy directional motion blur streaking the frame",
      "starts on one framed subject, ends on a new framing; the blur hides the join",
      "the operator slightly overshoots the landing and settles back about 3–5° within half a second",
      "no smooth easing — the whip starts abruptly",
    ],
    durationSec: [1, 3],
    bestFor: ["PRESSURE", "DISCIPLINE"],
    useAs: "transition between two shots or two outfits — pattern break for the 1.5 s hook",
  },
  PULL_BACK: {
    label: "Pull back",
    intent: "Start close, then reveal where he actually is.",
    prompt: [
      "camera starts tight on the face or hands and moves steadily backward away from the subject",
      "the environment is revealed progressively — the reveal changes the meaning of the first frame",
      "exposure drifts as more of the environment (windows, street light) enters the frame",
      "the move ends slightly early and the operator holds, with small breathing movement",
    ],
    durationSec: [5, 10],
    bestFor: ["FAITH", "PRESSURE"],
    useAs: "closer — context, scale, 'set apart' in a big world",
  },
};

const ALIASES = {
  TRACK: "TRACKING",
  TRACKING_SHOT: "TRACKING",
  ORBIT: "ORBIT",
  ARC: "ORBIT",
  WHIP: "WHIP_PAN",
  WHIPPAN: "WHIP_PAN",
  WHIP_PAN: "WHIP_PAN",
  PULLBACK: "PULL_BACK",
  PULL_BACK: "PULL_BACK",
  DOLLY_OUT: "PULL_BACK",
  REVEAL: "PULL_BACK",
};

/**
 * Resolve a user-facing move name ("whip-pan", "pull back", "orbit") to a key.
 * @param {string} name
 * @returns {string} canonical key
 */
function resolveMove(name) {
  if (typeof name !== "string" || !name.trim()) {
    throw new Error("CameraMove: move name is required.");
  }
  const norm = name.trim().toUpperCase().replace(/[\s-]+/g, "_");
  const key = MOVES[norm] ? norm : ALIASES[norm] || ALIASES[norm.replace(/_/g, "")];
  if (!key) {
    throw new Error(
      `Unknown camera move: "${name}". Available: ${listMoves().join(", ")}`
    );
  }
  return key;
}

/**
 * @param {string|{move:string, durationSec?:number, direction?:string}} spec
 * @returns {string} Camera move prompt block
 */
function buildCameraMove(spec) {
  const opts = typeof spec === "string" ? { move: spec } : { ...(spec || {}) };
  const key = resolveMove(opts.move);
  const m = MOVES[key];

  const [min, max] = m.durationSec;
  let duration = opts.durationSec == null ? max : Number(opts.durationSec);
  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error(`CameraMove: durationSec must be a positive number (got ${opts.durationSec}).`);
  }
  const lines = [...m.prompt];
  if (opts.direction) lines.push(`direction: ${String(opts.direction)}`);

  const note =
    duration < min || duration > max
      ? ` (outside the ${min}–${max} s sweet spot for this move)`
      : "";

  return `CAMERA MOVE — ${m.label.toUpperCase()} (${duration} s${note}):
Intent: ${m.intent}
${lines.map(l => `– ${l}`).join("\n")}

OPERATOR REALISM (always applied with a move):
${OPERATOR_REALISM.map(l => `– ${l}`).join("\n")}

Purpose: this footage was filmed by a person on a real street, not generated by a virtual camera.`;
}

function listMoves() {
  return Object.keys(MOVES);
}

/**
 * Suggest the moves that best fit an emotional state.
 * @param {string} emotionalState
 * @returns {string[]}
 */
function movesFor(emotionalState) {
  const s = String(emotionalState || "").toUpperCase();
  return listMoves().filter(k => MOVES[k].bestFor.includes(s));
}

module.exports = { buildCameraMove, resolveMove, listMoves, movesFor, MOVES, OPERATOR_REALISM };
