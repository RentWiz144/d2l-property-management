# ChoZen UGC Content System — Plan v3 (DRAFT, awaiting owner approval)

Seat: ORCHESTRATOR · Date: 2026-11-26 · Branch: `claude/gallant-clarke-dsysfj`
History: v1 red team → FIX THEN LAUNCH (5C/4M). v2 red team → FIX THEN LAUNCH (7C/15M). v3 adds the owner's decisions and live store data; the disposition table is in §10.

## 0. Owner decisions

| # | Decision | Answer | Applied as |
|---|---|---|---|
| D1 | Offer | Every package sells a **product** with a **destination URL** | Required `offer` block (§5.4). Destination can be Online Store, Etsy, or TikTok Shop (see §1) |
| D2 | AI-rendered Amoz | Allowed | Allowed in all founder formats |
| D2b | AI faith/testimony (red-team Critical) | **OWNER OVERRIDE, 2026-11-26.** Proceed despite the Critical rating | Override conditions are mandatory and cannot be removed (§6 HS4). The override is logged in §11 |
| D3 | Sequencing | Build in parallel, smaller | Track B is time-boxed and scoped (§4) |
| D4 | Real testimony | Yes | Collection sprint in Track A week 1 (§3) |
| D5 | Spend / approvals | **Paid generation stays in Amoz's hands** | No automated renderer. Amoz presses every render and every ad button himself (§6 HS2) |
| D6 | Repo | Private | Renders are never committed. Media path is in §5.5 |
| D7 | Scripture posts | Soft CTA allowed; hard product CTAs ≤ 60%/week | `cta_mode` field plus a weekly batch check |
| D8 | Consent store | Google Drive folder **"ChoZen Ecosystem"** | Releases go in a subfolder (proposed: `Testimony Releases`, not created yet; §11) |

## 1. Revenue research (live Shopify data, pulled 2026-11-26)

**Store:** ChoZen Unlimited, chozenunlimited.com, Shopify Basic, USD.

| Metric (last 12 months) | Value | Source |
|---|---|---|
| Total sales / orders | **$6,612.47 / 45 orders** | ShopifyQL `sales` |
| AOV | $147 overall; $159–$206 over Sep–Nov 2026 | `sales` by month |
| Best month | Aug 2026: $1,727 / 11 orders | `sales` by month |
| Recent | Sep $869 (5 orders) · Oct $570 (3) · Nov 1–26 $686 (3) | `sales` by month |
| Sales by channel | Etsy $2,584 (16) · Online Store $2,113 (16) · **TikTok Shop $796 (7)** · Draft Orders $770 (6) · Shop app $350 (2) | `sales` by `sales_channel` |
| Attribution | **42 of 45 orders have no referrer source.** In 90 days social sent 350 sessions to the store and **0** completed checkouts | `sales` by referrer; `sessions` by referrer |
| Store funnel, 90 days | 2,962 sessions · 98 sessions with an add-to-cart (3.3%) · Shopify-reported conversion 0.07% | `sessions` |

**Top products by revenue (12 months).** The top three are **53%** of revenue, and all three are **women's modest wear**:

| Product | Price | Orders | Revenue | URL |
|---|---|---|---|---|
| ChoZen Deuteronomy 22:5 Maxi Jersey Dress | $109.99–$119.99 | 14 | $1,576 | chozenunlimited.com/products/chozen-deuteronomy-22-5-maxi-jersey-dress |
| ChoZen Skyline Track Maxi Dress | $129.99 | 9 | $1,267 | …/products/chozen-skyline-track-maxi-dress |
| ChoZen Signature Modest Set | $129.99 | 5 | $683 | …/products/chozen-signature-modest-set |
| The Tribal Sherpa Jacket (winter) | $389.99 | 2 | $741 | …/products/the-tribal-shearling-jacket |

Inventory: the top product has `tracksInventory: false` and `inventoryPolicy: CONTINUE`. Fulfillment median is 0 days (30 orders, 180 days). **Inferred:** made-to-order or print-on-demand. **Unknown:** production plus shipping time, so the Christmas ship-by date can't be computed.

**Target math (verified arithmetic, inferred conclusion):**
- $10K/month at ~$150 AOV is about **67 orders/month (~15/week)**. The current pace is ~3/month, so that's roughly 20×.
- At a 3.3% add-to-cart rate and the Online Store's observed ~1 checkout per ~1,500 sessions, organic UGC to the web store alone won't close that gap in 5 weeks.
- **Inferred:** January's $10K is out of reach from this system alone. What the system can do is produce a measurable weekly lift in orders on the channels that already sell (TikTok Shop, Etsy, Online Store).
- **Track A's primary metric is therefore orders per week by channel**, not views.

**What this changes in the plan:**
1. The best sellers are **women's dresses**. AI Amoz cannot model them. The money format is **`fit` with real women wearers plus `testimony`**, not founder talking-heads.
2. **TikTok Shop already converts** (7 orders), while social → web store converts nothing. TikTok packages link the **TikTok Shop product**.
3. Most sales can't be attributed today. We need a **per-package discount code** in addition to UTM, so Etsy, TikTok Shop and DM/draft orders can be tied back to a package.

## 2. Goal

One brief produces one validated `ugc-package/v1`, which `chozen-social-command` schedules. Every package is tied to a named product, a channel-correct destination, and an attribution code, so the weekly ledger reports **orders by package**.

## 3. Track A: content now (starts this week; no code needed)

**Week 1 (Nov 27 – Dec 3)**
1. **Testimony and wearer sprint.** Message the buyers of the top 3 dresses (Etsy, TikTok Shop and Online Store orders; up to ~28 customers). Ask for a 15–30 s phone clip wearing the piece, plus a signed release. Use a one-page release template (Claude drafts it; Amoz approves). Signed releases go in Drive under `ChoZen Ecosystem`.
2. **10 packages**, all formats real or self-shot except `founder-direct`. Floor: **≥ 3 `fit`/`testimony` packages on the top 3 dresses** and **≥ 2 `precept` packages**, with Deuteronomy 22:5 as the natural first. Hard product CTA on ≤ 60% of packages.
3. **First test: offer/hook, not production.** One variable, for example a scripture-first hook vs. a fit-first hook on the Deut 22:5 dress. Primary metric is **orders** (attribution code + UTM), with link clicks secondary. Settle windows and the ≥ 25% rule follow `campaign-playbook.md:47-52`. Arms are compared to each other until 30 days of baseline exist (`campaign-playbook.md:49`).

**Weeks 2–5 (Dec 4 – Jan 1)**
- **Christmas push** on the top dresses and the Sherpa jacket, ending at Amoz's **ship-by date**. He supplies that date from the supplier lead time (§11).
- **New Year "Set Apart / Discipline" drop** content goes out from Dec 26.
- **AI-render vs. self-shot test runs last** (week 4+). It uses separate days, `founder-direct` format only, and is judged on orders, link clicks and a **negative-signal count** (AI call-out comments, hides, unfollows).

## 4. Track B: code (time-boxed, smaller)

| Phase | Deliverable | Box |
|---|---|---|
| **B1** | `src/ugc/schema.js` (`ugc-package/v1`), `src/ugc/validate.js` (per package + `--week` batch), `src/ugc/shabbat.js` (NOAA sunset, no dependencies), `src/ugc/formats.js` (format beat templates), tests | **by Dec 7** |
| **B2** | `ugc.js` CLI: `--brief` → `ugc/out/<id>/`; `--ledger-entry` → `ugc/out/<id>/ledger-entry.json`; `--week <dir>`; `.gitignore`; update `chozen-social-command` SKILL.md (package intake, media playbook for a private repo, Shabbat rule) | **by Dec 7** |
| B3 | Scene engine `captureMode: "ugc"` + subject-aware layers + `ugc-*` presets | **frozen** until Track A has a sales winner |
| ~~P4 render~~ | **Cut** (D5). Claude writes prompts; Amoz renders in kie.ai or Higgsfield himself | — |
| B4 | `chozen-ugc` skill | after B2. Until then Track A uses this plan plus `formats.js` as a reference |

**Gate 5 for Track B is lightweight:** Amoz runs one real brief (the Deut 22:5 `fit` package) through social-command once. No other owner time is needed in December.

## 5. Design

### 5.1 Format library (`formats.js`): beat templates, not just names
Each format defines viewer-facing beats (0–1.5 s hook / middle / close), on-screen text rules and required fields:

| Format | Render allowed | Required fields | Beats (summary) |
|---|---|---|---|
| `fit` | **real wearer only** | `sizes_shown[]`, `wearer.consent_id`, `product` | 0–1.5 s full-length reveal → movement (coverage in motion) → size/fit on-screen text → CTA overlay |
| `testimony` | **real customer only** | `consent_id`, `quote_source`, `material_connection{type, disclosed}` | Customer's verbatim words, no brand hook, no CTA spoken by the customer. The CTA is a caption or overlay only |
| `precept` | founder (real or AI*) | `scripture[]`, `cross_refs[]`, `scripture_verified{by, against, at}` | Verse on screen → precept-upon-precept chain → application → soft CTA by default |
| `faith-moment` | founder (real or AI*) | `scripture[]`, `scripture_verified{…}` | Lowered beat → eyes to lens → one line of witness → soft CTA |
| `founder-direct` | founder (real or AI*) | — | Hook → objection or story → product → hard CTA |
| `pov` / `reaction` | real only | — | ≤ 30% of a week |

\*AI renders carry the HS4 conditions. **There is no synthetic non-founder person**: v2's `labeled_ai_person` is removed. Testimony is exempt from the hook, word-budget and spoken-CTA rules.

### 5.2 Per-package validator rules
- **Offer:** `offer.product` and `offer.channel ∈ {online_store, etsy, tiktok_shop}` are required. `destination_url` must be https, and an `online_store` destination must be on `chozenunlimited.com`. `attribution_code` is required and unique per package.
- **Hook:** `script.hook_s` ≤ 1.5 for TikTok, ≤ 3 for other platforms (`platform-specs.md:12`). Word count ≤ `duration_s` × 2.5 (testimony is exempt).
- **CTA:** `cta_mode ∈ {hard, soft, none}`. `hard` must name `offer.product`. `precept` and `faith-moment` default to `soft`.
- **Captions:** per-platform `captions{platform: text}` are required. When `render.mode = "ai"`, the AI disclosure must appear within the first 125 characters of every caption (`platform-specs.md:6`).
- **Claims:** `claims[]` entries each need a `source`. The validator flags superlatives ("best", "changed my life", "everyone") that have no source.
- **Material connection:** `testimony` with `material_connection.type ≠ "none"` requires `#ad` or a partnership label in the captions.
- **Subjects:** `subject.kind ∈ {founder, real_wearer, real_customer}`. `fit` and `testimony` with `render.mode = "ai"` are rejected.
- **Shabbat:** if `schedule[]` is present, every timestamp is checked (§5.6).

### 5.3 Weekly batch rules (`validate --week`)
Checks a week's packages together: hard CTA ≤ 60%; `pov`/`reaction` ≤ 30%; founder-face share ≤ 50%; ≥ 3 `fit`/`testimony`; ≥ 2 `precept`; no two consecutive founder packages may share the same location.

### 5.4 `ugc-package/v1` schema
```
{ schema:"ugc-package/v1", package_id, created_at, format, product,
  subject{kind, consent_id?}, wearer?{consent_id, sizes_shown[]},
  offer{product, channel, destination_url, attribution_code},
  campaign{tag, hypothesis, variable, arm},                     // ledger needs these before results (playbook:24-25)
  script{hook, hook_s, body, cta, cta_mode, duration_s}, hooks[], shotlist[],
  prompts{image, video},
  render{mode:"self-shot"|"ai"|"none"},                          // no cost or approval fields: Amoz renders outside the system
  ai_label?{text:"AI-generated likeness of Amoz — his words", position:"safe-zone top-left", min_height_pct:4, from_frame:0, to_end:true},
  captions{instagram?, tiktok?, facebook?, threads?, youtube?},  // ≤125-char hook + disclosure
  utm{per_platform:{<platform>: url}},                           // utm_source=<platform>, utm_campaign=<tag>
  scripture?[], scripture_verified?{by, against, at}, claims?[], material_connection?,
  media{local_path?, drive_file_id?, public_url?}, platforms[], schedule?[] }
```
- **Instagram link-in-bio:** IG captions say "link in bio". The package records `bio_link_required: <url>` so social-command can remind Amoz to set the bio link for that post's window.
- **Ledger entry:** `--ledger-entry` writes JSON in the `campaign-playbook.md:19-39` shape, plus `package_id`, `product`, `channel`, `render_mode`, `attribution_code`, and `results.orders`/`results.revenue`. The canonical ledger stays where the playbook says (one copy). social-command appends the entry; the CLI never writes the live ledger.

### 5.5 Media path (private repo, cloud container)
- Renders are produced by Amoz outside the container (kie.ai or Higgsfield UI, or his phone). They go straight from his phone or desktop into his Drive, so nothing has to leave the container.
- Prompts, scripts and captions leave the container through git (text only) or are pasted from chat.
- If a package needs a URL, social-command records the Drive file and checks that the link serves `video/*` or `image/*`. The `/view` URL serves HTML, so use the direct-download form. For large files Drive serves a virus-scan HTML page, so native upload is preferred for video.
- B2 updates `SKILL.md:47-50`: the public GitHub path no longer applies to this private repo.

### 5.6 Shabbat (fixes the winter hole)
`shabbat.js` computes Detroit sunset per date with the NOAA solar formula. The block runs from **Friday sunset − 18 min** to **Saturday sunset + 50 min**, and any timestamp inside it is rejected. Tests use fixed dates: Fri 2026-12-18 17:30 → reject; Fri 2026-12-18 16:00 → accept; Sat 2027-06-19 21:00 → reject. social-command re-runs `validate` on final timestamps before scheduling (B2 SKILL.md update), which closes the gap where `schedule[]` was optional.

### 5.7 Scene engine (B3, frozen; spec kept so it's ready)
- `captureMode: "ugc"`. The opener comes from `subject.kind`, and when `render.mode = "ai"` the "not a posed image / observed too late" lines are **dropped**.
- `FaceDetail`'s beard line (`FaceDetail.js:12`) and IdentityLock (`IdentityLock.js:11`) apply only to `founder`. "No posing" is replaced in UGC mode.
- Picks are mandatory. The `observed` mode is unchanged and covered by a snapshot test with **pinned preset names** (`index.js:69-72` otherwise picks a random preset).

## 6. Hard stops

| # | Stop | Mechanism, honestly classified |
|---|---|---|
| HS1 | Existing preset output never changes | **Mechanism:** snapshot test (B3) |
| HS2 | **No paid generation or ad spend by Claude** | **Mechanism:** no render code exists, and `KIE_API_KEY` is **not** placed in any cloud environment. Paid tools are pressed by Amoz in their own UIs. **Policy:** Claude does not call Higgsfield, Meta Ads, Windsor write or any other paid MCP tool for this work. Turning that policy into a mechanism needs a project permission deny list, which is offered in §11 and not applied without Amoz's say-so |
| HS3 | (retired: P4 cut) | — |
| HS4 | **Override conditions for AI faith/testimony (D2b)** | Validator: `render.mode = "ai"` requires the `ai_label` block with the fixed text, from frame 0 to the end, inside the safe zone. The label is non-removable: the validator has no off-switch. The B3 prompt for AI drops the "pass-as-real" opener lines. **Limit:** code can't see pixels. The burn-in itself is done by Amoz at render or edit time, and Gate 5 includes a visual check |
| HS5 | No AI of customers, wearers or fit content; testimony stays verbatim; material connection disclosed | **Mechanism:** validator rules |
| HS6 | Founder likeness is used with Amoz's sign-off | **Mechanism:** Amoz is the only person who can render (HS2), so every AI likeness is his own action. The v2 `likeness_approved_by` string is removed as theatre |
| HS7 | This system never publishes | **Mechanism:** `src/ugc/` has no network code, and a test asserts that no `http`, `https`, `net` or `child_process` module is required. **Policy:** publishing only through social-command |
| HS8 | Shabbat | **Mechanism:** §5.6 |
| HS9 | No new npm dependencies; renders never committed | **Mechanism:** test on `package.json` dependencies; `.gitignore` |

## 7. Tests (B1–B2), one named test per rule
Validator: each §5.2 rule with a pass case and a fail case. Weekly batch: each §5.3 ratio. Shabbat: the 3 fixed dates plus a DST edge. Schema → ledger round trip (shape matches the playbook). UTM builder per platform. HS7 forbidden-module scan. HS9 dependency check. Deterministic only: no clock, no network, no `Math.random`.

## 8. Verification
- `node --test` passes.
- **Real surface (Gate 5):** Amoz produces one real `fit` package for the Deut 22:5 dress, with a consenting wearer, through social-command, and confirms three things: the schedule plan respects his true Shabbat window, the ledger entry has the attribution code, and an order using that code shows up in Shopify against the package. **That order, not green tests, is "done".**

## 9. Grounding (corrections carried from the red team)
`SceneEngine.js:68-74` opener · `:27-35` constraints · `FaceDetail.js:12` and `IdentityLock.js:11` beard (male defaults) · `CameraDegradation.js:4,35` "captured, not rendered" · `CompositionBreak.js:38-39` and `EnvironmentImperfection.js:39-40` random picks · `index.js:69-72` random preset · `platform-specs.md:6,9,12,18,37,38` · `campaign-playbook.md:15-52` ledger and judging · `SKILL.md:43` fixed 18:00/20:00 Shabbat buffer (wrong in winter) · `SKILL.md:47-50` public-repo media path · `SKILL.md:95` ad spend recommendations only · `postiz-setup/` is an **install kit**, not a running engine · no `.claude/settings.json` exists.

## 10. Disposition of v2 red-team findings

| Finding | v3 |
|---|---|
| AI faith testimony reads as counterfeit (Critical ×2) | **Owner override (D2b)** with HS4 conditions. The red-team Critical stands and is logged |
| Precept as ad copy (Critical) | D7 soft CTA + 60% cap |
| Spend gate bypassable / covers wrong spend (Critical) | Render code cut, no key in the cloud, Amoz presses every paid button. The MCP part is policy, with the deny list offered |
| Approvals are typed strings (Critical) | `likeness_approved_by` and `--approve` removed. Approval = Amoz's own action |
| Moat formats are only names (Critical) | Beat templates, testimony/wearer sprint, `scripture_verified` record, weekly floors |
| No sales metric (Critical) | Orders by channel, attribution codes, `results.orders` |
| No revenue math / December offer (Critical) | §1 live data, Christmas push to ship-by date, New Year drop |
| Shabbat winter hole | NOAA sunset + final-timestamp re-check |
| Beard / no-posing for every subject | §5.7 subject-aware layers (B3) |
| `labeled_ai_person` | Removed |
| Testimony forced into ad rules; FTC | Exempt from hook/CTA rules; `material_connection` |
| Label underspecified | Fixed text, position, size, frame range |
| Hand-off gaps, per-platform UTM, IG link, ledger location, media out of container | §5.4–5.5 |
| Uncomputable rules | `hook_s`, `cta_mode`, weekly batch validator |
| Track B un-boxed | B1–B2 by Dec 7, B3 frozen, P4 cut |

## 11. Still open (owner)
1. **Christmas ship-by date.** Supplier production + shipping time per top product (unknown: inventory is untracked).
2. Create the `Testimony Releases` subfolder in Drive `ChoZen Ecosystem`? (I can create it; it's a write to your Drive.)
3. Apply a project permission **deny list** for paid/ad-write MCP tools (Higgsfield generate, Meta Ads write, Windsor `execute_action`, Adspirer)? Without it, HS2's MCP half stays policy only.
4. Accept that **$10K in January is unlikely from this system alone** (§1 math) and track orders/week instead, or keep $10K as the formal target?
5. **Override record (D2b):** "AI-rendered Amoz may appear in faith-moment, precept and founder content despite the red-team Critical, under HS4 conditions." Owner, 2026-11-26.
