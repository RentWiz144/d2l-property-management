# ChoZen UGC Content System — Plan (DRAFT, awaiting owner approval)

Seat: ORCHESTRATOR · Date: 2026-11-26 · Branch: `claude/gallant-clarke-dsysfj`
Scope confirmed by owner: UGC scripts + hooks, image/video prompts, full pipeline · Subject: ChoZen brand · Synthetic people are **labeled as AI**.

---

## 1. Goal

One brief in, one **UGC package** out, ready for `chozen-social-command` to schedule and track:

```
brief.json ──► script + hook variants ──► shot list ──► image/video prompts ──► (optional) paid render ──► captions + AI label + campaign tag ──► hand-off to chozen-social-command
```

"UGC" here means founder/creator-style, phone-shot, direct-to-camera content in the ChoZen voice. It does **not** mean fake customer reviews.

## 2. Grounding (what I checked in the repo)

| Claim | Status | Source |
|---|---|---|
| Scene engine assembles 8 layers. Opener is hard-coded to "unguarded moment … not a posed image" | VERIFIED | `src/engine/SceneEngine.js:62-68` |
| Hard constraints include "No posing", which conflicts with talking to camera | VERIFIED | `src/engine/SceneEngine.js:26-34` |
| Identity Lock uses "exact facial identity from reference images" (Amoz's face) | VERIFIED | `src/modules/IdentityLock.js:39-41` |
| Paid generation pattern: dry run by default, `--confirm` to spend, cost printed, `KIE_API_KEY` env | VERIFIED | `brand/textures/generate.js:2-5,24-36` |
| Distribution, ledger, campaign tags (`cz-YYYYMM-name[-a/-b]`), Shabbat gate and A/B testing already exist | VERIFIED | `.claude/skills/chozen-social-command/SKILL.md`, `references/campaign-playbook.md` |
| No test runner and no dependencies. Node v22 has the built-in `node --test` | VERIFIED | `package.json`, `node --version` |
| kie.ai Seedance 2.0 can do 9:16 image-to-video of a talking person with speech/lip-sync, at a known price | **UNKNOWN** | Not checked. Must be verified on kie.ai before Phase 4 |

## 3. Forks: recommendation and rejected alternatives

**F1. Where the system lives**
- ✅ **Recommended: Node module in the repo (`src/ugc/`) plus a thin Claude skill.** It follows the existing layered-engine pattern, is deterministic and testable, and the skill drives it.
- ❌ Skill only (Claude improvises every package): not reproducible, no tests, and quality drifts session to session.
- ❌ External SaaS (Higgsfield Ads Studio, Melius): vendor lock-in and per-use cost, which is the same trap Metricool was. These stay available for manual one-off use.

**F2. Who writes the scripts**
- ✅ **Recommended: Claude in the session writes the scripts, guided by a format library and checked by a code validator.** No API key, no extra spend. The code enforces structure: hook ≤ 3 s, word budget per duration (~2.5 words/s), one CTA, disclosure present.
- ❌ Code calls the Claude API: needs an `ANTHROPIC_API_KEY` and adds cost. It can be added later behind the same validator.
- ❌ Pure fill-in-the-blank templates: they read robotic, which defeats the point of UGC.

**F3. How UGC visuals reach the scene engine**
- ✅ **Recommended: add a `captureMode` option to `SceneEngine` (`"observed"` stays the default and is byte-identical; `"ugc"` is new).** UGC mode swaps the opener for front-camera, handheld, 9:16, direct address. It replaces "No posing" with "No performative posing, natural direct address". Identity Lock, Face Detail and Camera Degradation are kept.
- ❌ A separate UGC engine: duplicates the 8 layers, and the two copies would drift.
- ❌ Editing the existing presets: breaks current output.

**F4. Video rendering**
- ✅ **Recommended: `src/ugc/render.js` following the `brand/textures/generate.js` pattern (kie.ai, dry run by default, `--confirm`, cost printed). It is built only after the F4 capability check passes.**
- ❌ Higgsfield MCP as the engine: it can only be driven from a Claude session, so it can't run as a script. It stays a manual alternative.

**F5. Distribution and tracking**
- ✅ **Recommended: hand off to `chozen-social-command`; don't rebuild it.** The UGC package carries the campaign tag, per-platform captions and an AI-label checklist in the format that skill already takes.

## 4. Phases

| Phase | Deliverable | Network / spend |
|---|---|---|
| P1 | `src/ugc/formats.js` (UGC format library: talking-head, POV, "day in the discipline", reaction/stitch, faith-moment, objection-flip; hook archetypes), `src/ugc/validateScript.js` and tests | none |
| P2 | `captureMode: "ugc"` in `SceneEngine`, UGC presets (`ugc-authority`, `ugc-faith`, `ugc-pressure`, `ugc-discipline`), and a snapshot test proving the 4 existing presets are byte-identical | none |
| P3 | `ugc.js` CLI: `node ugc.js --brief briefs/x.json` → `ugc/out/<id>/` containing `script.md`, `hooks.md`, `shotlist.md`, `image-prompt.txt`, `video-prompt.txt`, `captions.md`, `package.json` (tag, disclosure, platforms) | none |
| P4 | `src/ugc/render.js` (kie.ai), dry run by default | **paid, gated** |
| P5 | `.claude/skills/chozen-ugc/SKILL.md`: intake → Claude drafts scripts → validator → CLI → hand-off to social-command | none |

## 5. Hard stops (work halts and comes back to the owner)

1. **No change to existing preset output.** If the P2 snapshot test shows any diff in `authority/faith/pressure/discipline`, stop.
2. **No spend without `--confirm` and a printed cost estimate.** No price on file means refuse (same rule as the textures script).
3. **P4 does not start until kie.ai's 9:16 talking-head capability and price are verified from kie.ai's own docs.** If they don't support it, re-plan F4.
4. **The validator rejects any package without the AI disclosure** (caption label plus the platform AI-label toggle checklist), and any script that frames ChoZen content as a third-party customer testimonial.
5. **No posting from this system.** Publishing goes only through `chozen-social-command`, with its Shabbat gate.
6. No new npm dependencies.

## 6. Verification (Gate 5)

- Tests: `node --test` passes, including the snapshot regression.
- Real surface: owner runs `node ugc.js --brief briefs/example-discipline.json`, opens `ugc/out/…`, pastes `image-prompt.txt` into the generator they actually use, and judges whether the result reads as ChoZen UGC. That judgment, not green tests, is "done".

## 7. Loop

Owner approves or edits this plan → orchestrator writes the P1–P3 worker contract (one fenced block) → worker builds → **a different seat** pressure-tests the return → owner verifies on the real surface → P4 capability check → P4/P5.
