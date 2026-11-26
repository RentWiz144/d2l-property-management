/**
 * CHOZEN SHOOT DAY — THE SEVEN SHOTS
 *
 * One shoot day, seven shots per garment, every layer of the funnel covered.
 * Concept prompted by MNTO Studios' "Shoot Day" playbook ("the seven shots that
 * sell everything we make"). Their seven are in a paid PDF and are NOT copied
 * here — this list is ChoZen's own, written around Brand Law. If Amoz buys the
 * playbook, replace SHOTS below with his notes and keep the builder.
 *
 * Every shot names: funnel layer, deliverables (aspect ratios), the Shot
 * Director camera move for its video take, the Scene Generator preset whose
 * look it borrows, and the Brand Law checks that must pass on set.
 */

"use strict";

const { resolveMove } = require("../modules/CameraMove");

const LINES = {
  standard: "standard (fringes + blue ribband on the lower hem)",
  athletic: "athletic / windbreaker (NO fringes, NO ribband)",
  womens: "women's maxi (modest, hem at top of foot, fringes + blue ribbon at hem)",
};

const SHOTS = [
  {
    id: "hero",
    name: "The Hero",
    what: "Full body, garment worn, a real Detroit place behind the model. The image the drop is remembered by.",
    framing: "full length, off-center, eye level or slightly low; leave headroom for a 4:5 crop",
    funnel: "TOF",
    deliverables: ["4:5 feed", "9:16 reel/story", "16:9 site banner"],
    move: "orbit",
    preset: "authority",
  },
  {
    id: "detail",
    name: "The Detail",
    what: "Macro of what makes it ChoZen: the fringes and the ribbon of blue at the hem.",
    framing: "macro, 30–50 cm, shallow depth, hands allowed in frame",
    funnel: "MOF",
    deliverables: ["1:1 PDP", "4:5 carousel slide", "9:16 3-second insert"],
    move: "pull-back",
    preset: "discipline",
  },
  {
    id: "movement",
    name: "The Movement",
    what: "Walking, turning, stepping off a curb — the fabric and fringes move. Proves it lives, not just hangs.",
    framing: "full or 3/4 length, subject crossing frame",
    funnel: "TOF",
    deliverables: ["9:16 reel (6–10 s)", "4:5 still pulled from the burst"],
    move: "tracking",
    preset: "discipline",
  },
  {
    id: "every-body",
    name: "Every Body",
    what: "The same garment on two or three real body types, side by side or back to back. Only sizes that are actually in stock.",
    framing: "matched full-length frames, same light, same distance",
    funnel: "MOF",
    deliverables: ["4:5 carousel (one slide per body)", "9:16 whip-pan sequence"],
    move: "whip-pan",
    preset: "authority",
  },
  {
    id: "flat",
    name: "The Product Alone",
    what: "Garment with no model: flat lay or ghost mannequin on void black or gunmetal. Fringes laid straight, ribband visible.",
    framing: "top-down or straight-on, centered (the one shot allowed to be clean)",
    funnel: "BOF",
    deliverables: ["1:1 Shopify/Etsy PDP", "4:5 feed", "white-ground copy for marketplaces"],
    move: null,
    preset: null,
  },
  {
    id: "phone",
    name: "The Phone Shot",
    what: "Creator-style, shot on a phone: mirror fit check, try-on, 'just got it' unboxing. Reads like a customer, not an ad.",
    framing: "vertical, handheld, arm's length or mirror",
    funnel: "BOF",
    deliverables: ["9:16 UGC-style ad (15–30 s)", "9:16 story"],
    move: "tracking",
    preset: "pressure",
  },
  {
    id: "testimony",
    name: "The Testimony",
    what: "The why. A quiet faith moment in the garment — prayer, scripture open, looking out a window. Leaves room for a 1 Peter 2:9 line.",
    framing: "medium or close, negative space on one side for text",
    funnel: "TOF",
    deliverables: ["4:5 quote card base (Visual Studio Photo overlay)", "9:16 reel cover"],
    move: "pull-back",
    preset: "faith",
  },
];

function brandLawChecks(line, shot) {
  const checks = [];
  if (shot.id === "flat") checks.push("garment steamed; no creases across the hem");
  if (line === "standard") {
    checks.push("fringes around the ENTIRE lower hem, visible and unobstructed");
    checks.push("ribband is a hue of blue");
  } else if (line === "athletic") {
    checks.push("NO fringes and NO ribband on this line");
  } else if (line === "womens") {
    checks.push("maxi skirt or dress only — not tight-fitting");
    checks.push("hem at top of foot / lowest ankle; fringes flow, never drag");
    checks.push("ribbon at the hem is a hue of blue");
  }
  if (shot.deliverables.some(d => d.startsWith("9:16")) && line !== "athletic") {
    checks.push("9:16 is for reels/stories only — IG feed crops to 4:5 and cuts the hem; shoot a separate 4:5");
  }
  if (shot.id === "every-body") checks.push("only sizes genuinely in stock for this garment");
  if (["phone", "testimony"].includes(shot.id)) checks.push("any spoken 'ChoZen' is pronounced exactly like 'chosen'");
  return checks;
}

/**
 * Build a shoot-day shot list.
 * @param {{name:string, line?:"standard"|"athletic"|"womens"}[]} garments
 * @param {{only?:string[]}} [opts] - restrict to certain shot ids
 * @returns {{garment:string, line:string, shots:object[]}[]}
 */
function buildShootDay(garments, opts = {}) {
  if (!Array.isArray(garments) || garments.length === 0) {
    throw new Error("buildShootDay: list at least one garment.");
  }
  const only = opts.only && opts.only.length ? opts.only : null;
  if (only) {
    const bad = only.filter(id => !SHOTS.some(s => s.id === id));
    if (bad.length) throw new Error(`Unknown shot: ${bad.join(", ")}. Available: ${listShots().join(", ")}`);
  }
  return garments.map(g => {
    const name = String((g && g.name) || "").trim();
    if (!name) throw new Error("buildShootDay: every garment needs a name.");
    const line = (g.line || "standard").toLowerCase();
    if (!LINES[line]) throw new Error(`Unknown line "${g.line}". Use: ${Object.keys(LINES).join(", ")}`);
    const shots = SHOTS.filter(s => !only || only.includes(s.id)).map((s, i) => ({
      n: i + 1,
      id: s.id,
      name: s.name,
      what: line === "athletic" && s.id === "detail"
        ? "Macro of construction: seams, zip, fabric texture. (Athletic line — no fringes.)"
        : s.what,
      framing: s.framing,
      funnel: s.funnel,
      deliverables: s.deliverables,
      video_move: s.move ? resolveMove(s.move) : null,
      scene_preset: s.preset,
      brand_law: brandLawChecks(line, s),
    }));
    return { garment: name, line: LINES[line], shots };
  });
}

function countAssets(day) {
  return day.reduce((n, g) => n + g.shots.reduce((m, s) => m + s.deliverables.length, 0), 0);
}

function listShots() {
  return SHOTS.map(s => s.id);
}

/** Markdown call-sheet-style shot list, ready to print or paste. */
function toMarkdown(day) {
  const out = [`# ChoZen Shoot Day — ${day.length} garment(s), ${countAssets(day)} deliverables`, ""];
  for (const g of day) {
    out.push(`## ${g.garment}`, `Line: ${g.line}`, "");
    for (const s of g.shots) {
      out.push(`### ${s.n}. ${s.name} (${s.funnel})`, s.what, "",
        `- Framing: ${s.framing}`,
        `- Deliverables: ${s.deliverables.join(" · ")}`,
        `- Video take: ${s.video_move ? `${s.video_move} — \`node index.js --preset ${s.scene_preset} --move ${s.video_move.toLowerCase().replace(/_/g, "-")}\`` : "stills only"}`,
        `- On-set Brand Law: ${s.brand_law.length ? "" : "none"}`,
        ...s.brand_law.map(c => `  - [ ] ${c}`), "");
    }
  }
  return out.join("\n");
}

module.exports = { SHOTS, LINES, buildShootDay, countAssets, listShots, toMarkdown };
