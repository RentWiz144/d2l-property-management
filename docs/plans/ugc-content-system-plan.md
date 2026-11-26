# ChoZen UGC Content System — Plan v2 (DRAFT, awaiting owner approval)

Seat: ORCHESTRATOR · Date: 2026-11-26 · Branch: `claude/gallant-clarke-dsysfj`
v1 → red team (3 adversaries) → **FIX THEN LAUNCH** (5 Critical, 4 Major). v2 addresses each finding; disposition in §8.

## 0. Owner decisions (2026-11-26)

| # | Decision | Owner's answer | How v2 applies it |
|---|---|---|---|
| D1 | Offer | Every piece of content sells a **product** with a **destination URL** | `brief.offer.product` and `brief.offer.destination_url` are required. The validator rejects any package without them |
| D2 | Synthetic founder | **AI-rendered Amoz is allowed**, including faith/testimony formats | Allowed, with a mandatory burned-in AI label (§5 HS4). The owner can override the burn-in; see §9 |
| D3 | Sequencing | **Build in parallel** with producing content | Track A (content now) and Track B (code) run together (§3) |
| D4 | Real customer testimony | **Yes**, with consent | Adds a `testimony` format that requires a consent record |
| D5 | Spend control | **Owner approves per ad** (I read "Porter ad" as "per ad"; confirm in §9) | Mechanical per-ad approval gate (§5 HS2) |
| D6 | Repo visibility | **Private** | `raw.githubusercontent` URLs won't work. Renders are never committed; media is hosted per §4.4 |

## 1. Goal

One brief in, one validated **UGC package** out. The package uses a defined schema that `chozen-social-command` reads, so it can schedule the post and log it to the ledger against a real product and URL.

```
brief.json (offer + subject + format)
  → script + hooks (Claude in session, checked by code)
  → shot list + image/video prompts (scene engine, UGC mode)
  → [optional, per-ad owner approval] paid render
  → burned-in AI label · captions · UTM link
  → ugc-package v1 → chozen-social-command → ledger
```

## 2. Grounding (corrected from v1)

| Claim | Status | Source |
|---|---|---|
| Opener hard-codes "Capture a real, unguarded moment of **a man** living within …" | VERIFIED | `src/engine/SceneEngine.js:68-74` (v1 cited 62-68, which was wrong) |
| `HARD_CONSTRAINTS` include "No posing" | VERIFIED | `src/engine/SceneEngine.js:27-35` (v1 was off by one) |
| Identity Lock uses "exact facial identity from reference images" and is always applied | VERIFIED | `src/modules/IdentityLock.js:40`, `SceneEngine.js:79` |
| Camera Degradation's purpose is "feel captured, not generated" | VERIFIED | `src/modules/CameraDegradation.js:35` |
| FAITH state requires "head slightly lowered", "eyes not fully visible", which conflicts with direct address | VERIFIED | `src/modules/EmotionalState.js:25-26` |
| The 4 existing presets are deterministic. CompositionBreak and EnvironmentImperfection call `Math.random` when picks are omitted | VERIFIED | `CompositionBreak.js:38-39`, `EnvironmentImperfection.js:39-40`. The red team ran md5 on two runs of each preset |
| The kie.ai price on file covers **text-to-video, no audio** only | VERIFIED | `brand/textures/generate.js:11-12`, `prompts.json` |
| The ledger, Shabbat gate and A/B process exist **only as written instructions**. No ledger file exists, and nothing in code enforces them | VERIFIED | `chozen-social-command/SKILL.md:43,57`, `references/campaign-playbook.md:17` |
| social-command has **no input schema**; intake is conversational | VERIFIED | `SKILL.md:57` |
| A Postiz publishing engine is set up in the repo | VERIFIED | `postiz-setup/` |
| Captions show only the first 125 characters before "…more" on IG. Scripture must be verified before scheduling | VERIFIED | `references/platform-specs.md:6,38` |
| kie.ai can do 9:16 image-to-video of a talking person with speech/lip-sync, and at what price | **UNKNOWN**. Blocks P4 | kie.ai docs |

## 3. Two parallel tracks (D3)

**Track A: content now (starts this week, no code needed)**
- Target: **10 UGC packages/week**, drafted by Claude in session using the §4.1 format library as a written reference doc. Amoz films some on his phone and AI-renders others by hand under the §5 rules.
- Each is logged in the ledger with an `ai-render` vs `self-shot` tag. Early on, one social-command A/B test compares **AI-render vs. self-shot Amoz on the same script**, judged on 3-second retention and follows. The result decides how much P4 is worth.
- Track A is what moves revenue in the 5 weeks before the Jan 2027 target. Track B must never block it.

**Track B: code (P1 → P5)**, which turns Track A's manual steps into tooling.

## 4. Design (forks settled in v1, revised)

### 4.1 Format library (`src/ugc/formats.js`): the ChoZen moat, not stock UGC
| Format | Required brief fields | Rule |
|---|---|---|
| `testimony` | `consent.id`, `consent.signed_at`, `quote_source` (release/transcript path) | Real customer, **real footage only**, quote verbatim from the source. AI never renders a customer's likeness |
| `precept` | `scripture[]` (book, chapter, verse(s)), `cross_refs[]` | IUIC-style precept-upon-precept. The validator checks that citations are present and well-formed. **Verse accuracy is a human/Claude check against a Bible text before scheduling**, because code cannot verify it |
| `fit` | `sizes_shown[]`, `subject.kind` must be `real_wearer` | Size-inclusive. Real wearers only, never AI bodies |
| `founder-direct` | (none extra) | Amoz direct address: talking-head, "day in the discipline", objection-flip |
| `faith-moment` | `scripture[]` | Founder faith testimony. An AI render is allowed (D2) but carries the burned-in label |
| `pov` / `reaction` | (none extra) | Generic formats, allowed but capped at ≤30% of a week's packages |

Hook archetypes live here too. All formats require `offer.product`, `offer.destination_url`, and a CTA that names the product.

### 4.2 Script validator (`src/ugc/validateScript.js`)
Rejects a package if: hook > 3 s; word count > duration × 2.5; the CTA count isn't exactly 1 or the CTA doesn't name `offer.product`; `offer.destination_url` is missing or not https; a required format field is missing (§4.1); a synthetic render lacks `ai_label.burned_in: true`; a schedule timestamp falls Fri 18:00 – Sat 20:00 America/Detroit; `subject.kind = "founder"` with `render: "ai"` but no `likeness_approved_by`; or a `fit` or `testimony` format has `render: "ai"`.

### 4.3 Scene engine: `captureMode: "ugc"`
- `"observed"` stays the default and is byte-identical (snapshot test).
- UGC mode has a new **UGC expression set** (`src/ugc/ugcStates.js`) built for direct address. It doesn't reuse the four STATES, which fixes the FAITH eye-contact conflict. Examples: `UGC_AUTHORITY` (steady eye contact, unhurried), `UGC_FAITH` (eyes up to the lens after a lowered beat), `UGC_PRESSURE`, `UGC_DISCIPLINE`.
- The opener is parameterized by `subject` (`founder` / `real_wearer` / `labeled_ai_person`) instead of hard-coding "a man". Identity Lock applies **only** when `subject.kind = "founder"`.
- UGC mode **requires** `compositionPicks` and `environmentPicks` (no `Math.random`), so output is deterministic and snapshot-testable.
- Camera Degradation is kept, because realism is the aesthetic. Honesty comes from the burned-in label, not from looking worse.

### 4.4 Package schema `ugc-package/v1` (`src/ugc/schema.js`): the hand-off contract
```
{ schema: "ugc-package/v1", id, created_at, format, subject{kind, consent_id?},
  offer{product, destination_url, utm_url}, campaign_tag,          // cz-YYYYMM-name[-a|-b]
  script{hook, body, cta, duration_s}, hooks[], shotlist[],
  prompts{image, video}, render{mode: "self-shot"|"ai"|"none", approved_ad_id?, cost_usd?},
  ai_label{burned_in, caption_label, platform_toggle_checklist[]},
  likeness_approved_by?, scripture[]?, media{local_path?, public_url?}, platforms[], schedule[]? }
```
- `utm_url` is built by code from `destination_url` + `campaign_tag` (`utm_campaign` = tag).
- `chozen-social-command/SKILL.md` gains a section: "If given a `ugc-package/v1` file, read it instead of running conversational intake." The ledger entry gains `ai_label`, `offer_url`, `likeness_approved_by`, `consent_id`, and `ugc-package` creates it (`node ugc.js --ledger-entry <pkg>`), covered by a round-trip test.
- **Media hosting (private repo, D6):** `ugc/out/` and all renders are **gitignored and never committed**. To publish, Amoz either uploads natively by hand (no host needed), or shares the file on Google Drive as "anyone with the link". In that case the package records `public_url`, and the skill checks that the URL serves video/image content rather than HTML before scheduling (social-command media playbook, option 2).

## 5. Hard stops (mechanism, not just policy)

| # | Stop | Mechanism |
|---|---|---|
| HS1 | Existing preset output never changes | Snapshot test of the 4 presets (md5 of output) in `node --test` |
| HS2 | **No spend without per-ad owner approval (D5)** | (a) `.claude/settings.json` **deny** rule on `node src/ugc/render.js*--confirm*`, so Claude cannot run a paid render; Amoz runs it himself. (b) `render.js --confirm` also requires `--approve <package-id>:<max-usd>`; it refuses if the estimate exceeds `max-usd` or the id doesn't match. (c) Prices are keyed by model + mode (t2v/i2v) + audio + resolution; any unknown combination is refused |
| HS3 | P4 doesn't start until kie.ai talking-head capability and price are verified from kie.ai's docs | Orchestrator check, reported to the owner with the source URL |
| HS4 | Every AI render is labeled where the viewer sees it first | Validator requires `ai_label.burned_in`; caption label in the first 125 characters; platform AI-label toggle checklist |
| HS5 | No AI render of a customer's likeness or of fit/size content; testimony is verbatim with consent | Validator rules in §4.2 |
| HS6 | Founder likeness is used only with sign-off per package | Validator requires `likeness_approved_by` for `founder` + `ai`; the field is set only by Amoz |
| HS7 | This system never publishes. Postiz and other schedulers are called only by `chozen-social-command` | No network code in `src/ugc/` except `render.js`; a test greps for this |
| HS8 | Shabbat | Validator rejects any schedule timestamp from Fri 18:00 to Sat 20:00 America/Detroit |
| HS9 | No new npm dependencies; renders never committed | `package.json` diff check; `.gitignore` entry |

## 6. Phases (Track B)

| Phase | Deliverable | Spend |
|---|---|---|
| P1 | `formats.js`, `ugcStates.js`, `schema.js`, `validateScript.js` and tests | none |
| P2 | `captureMode: "ugc"` + subject-parameterized opener + 4 `ugc-*` presets with pinned picks + snapshot test (HS1) | none |
| P3 | `ugc.js` CLI: `--brief` → `ugc/out/<id>/` (package.json, script.md, hooks.md, shotlist.md, prompts, captions.md), `--ledger-entry`, `.gitignore`, social-command SKILL.md hand-off section | none |
| P4 | `render.js` (kie.ai) with HS2 gates. **Starts only after HS3** | paid, owner-run |
| P5 | `.claude/skills/chozen-ugc/SKILL.md` (Track A's written process, now pointing at the CLI) | none |

## 7. Verification

- `node --test` passes, covering the validator rules in §4.2, snapshot HS1, package → ledger round trip, and the HS7 grep.
- Real surface (Gate 5): Amoz runs `node ugc.js --brief briefs/example-precept.json` with a real product and URL, opens the package, and (a) pastes the image prompt into his generator and judges it as ChoZen UGC, and (b) hands the package to social-command and sees a correct schedule plan and ledger entry. Tests passing is not "done".

## 8. Disposition of v1 red-team findings

| Finding | v2 response |
|---|---|
| C1 label hidden / counterfeit witness | HS4 burned-in label; D2 keeps AI faith content, with labeling as the safeguard. Track A's A/B test measures the audience's reaction |
| C2 no moat formats | §4.1 testimony / precept / fit; scripture fields; real-testimony route (D4) |
| C3 runway | §3 Track A ships content this week, weekly quota, never blocked by code |
| C4 pipeline breaks after the CLI | §4.4 schema, social-command reads it, ledger round-trip, private-repo media path |
| C5 hard stops were policy | §5 settings deny rule, `--approve` id:cap, mode-keyed prices, `likeness_approved_by`, Shabbat check |
| M1 no offer | D1 required fields, CTA must name the product, UTM built by code |
| M2 one man only | Subject parameter; real wearers for fit |
| M3 faith/eye-contact conflict, sameness | `ugcStates.js`; ≤30% generic formats; A/B test |
| M4 randomness | Picks required in UGC mode |
| Accepted / not fixed | Ledger results are still pasted in by hand from native analytics. Each script still needs a live Claude session (F2). Both are acceptable at 10 packages/week and get revisited at 10× |

## 9. Still open

1. D5 reading: confirm that "Porter ad" means "**per ad**" approval.
2. D2: burned-in AI label on every synthetic render is the default (HS4). Override only if you explicitly choose caption-only.
3. Who holds the signed consent forms for testimony (Drive folder?), so `consent.id` can point somewhere real.
