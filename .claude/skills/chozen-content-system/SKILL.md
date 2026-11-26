---
name: chozen-content-system
description: >-
  The ChoZen Content System: plans a researched month of platform-native ChoZen posts
  on a fixed three-type content mix, turns them into on-brand cards and camera-move
  shot lists, and hands a Sabbath-checked draft file to ChoZen Publisher. Use when Amoz
  wants a content plan or calendar for a period ("plan my month", "build next two weeks
  of content", "what should I post in December"), wants Reddit-researched post ideas,
  wants quote cards / reel covers from a plan, or wants video prompts with real camera
  moves (tracking, orbit, whip pan, pull back). Also trigger on "Content Globe",
  "Visual Studio", "Shot Director", "3 types of content", "content mix".
---

# ChoZen Content System

Plan → write → design → shoot → hand off. This skill never posts or schedules;
ChoZen Publisher does.

## The pieces (all in this repo)

| Piece | Path | Use |
|---|---|---|
| Content Globe (planner artifact) | `content-system/content-globe.html` — live at https://claude.ai/artifact/GtCTLC4TqDh4FjZZTfEgUR | Brief → research → ideas → calendar → captions → export |
| Visual Studio (cards artifact) | `content-system/visual-studio.html` — live at https://claude.ai/artifact/TK9TXCCfmsNQMAh7vbjtvh | Handoff JSON → 4:5 / 1:1 / 9:16 PNG cards |
| Shot Director | `src/modules/CameraMove.js` | `node index.js --preset <p> --moves tracking,whip-pan,pull-back` |
| Content mix | `content-system/content-mix.json` | The three content types and their % |

## Workflow

1. **Mix check.** Read `content-system/content-mix.json`. If `_status` still says
   PLACEHOLDER, tell Amoz the plan uses the placeholder Story/Product/Proof mix and ask
   once for Dee's breakdown. Do not invent Dee's three types.
2. **Plan.** Point Amoz to the Content Globe (brief is pre-filled for ChoZen), or — in a
   session without the artifact — produce the same output by hand: one idea per posting
   day, native versions per platform, types assigned to hold the mix.
3. **Time it.** Use the timing table in `chozen-social-command`. Every slot passes the
   computed Sabbath guard (`.claude/skills/chozen-autopost/scripts/sundown_guard.py`, or the
   planner's JS port — same window to the millisecond; its next-safe slot is window end
   +15 min rounded to 5, vs the Python's +5). User-facing copy says "Sabbath", not "Shabbat".
4. **Design.** Static posts → Visual Studio. Brand look comes from the ChoZen design system
   (black/void, chrome, silver, navy, blue/glow; Orbitron + Exo 2). Worn product in any
   image must pass the garment law (see `chozen-autopost/references/brand-law-preflight.md`).
5. **Shoot.** Video posts carry `camera_moves`. Run the Shot Director with the same preset
   for every clip of one Reel so the identity lock holds; see `references/shot-director.md`.
6. **Hand off.** Export `chozen-plan.json` (`references/handoff-schema.md`) to ChoZen
   Publisher. Publisher attaches media, verifies scripture, runs Brand Law pre-flight,
   re-checks the Sabbath, humanizes if needed, and schedules.
7. **Track.** Ledger entries export from the planner in `chozen-social-command`'s ledger
   format; results and verdicts follow that skill.

## Hard stops

- No posting, no scheduling, no paid connector from this skill.
- Scripture always leaves as `scripture_verified: false`.
- No fabricated testimonials, numbers or customer quotes in "Proof" posts — use real
  material Amoz supplies or leave the slot as a request for it.
- Pronunciation: "ChoZen" = "chosen" in any voiceover or generated speech.

## Open items

- Dee's three content types (DM-gated) — replace the placeholder mix.
- ChoZen Publisher (`chozen-publisher-pi.vercel.app`, Next.js + Postgres, `x-api-key` auth,
  hourly cron) — its source is only on Amoz's Mac. Once it is pushed to GitHub, map
  `plan@1` onto its `POST /api/posts` body. Known limits: no Instagram carousels; IG feed
  crops to 4:5, so 9:16 cards are for Reels/Stories only.
- One run is capped at 40 posts; a full month on 4 platforms needs two runs.
- YouTube and X best times are assumed until the ledger has data.
