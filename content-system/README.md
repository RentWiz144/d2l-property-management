# ChoZen Content System

One brief in → up to 40 researched, mixed, Sabbath-safe platform-native posts (≤31 days per run) → on-brand cards and shot lists → a handoff file for ChoZen Publisher.

Built from three concepts:

| Concept | Source | What ChoZen took from it |
|---|---|---|
| Content Globe planner | AI Savvy Founders (v1.0, 24 Nov 2026) | Brief → Reddit research → idea globe → calendar → writers → humanizer → export. Rebuilt for ChoZen; their code was not copied. |
| 3 types of content | `deebuildsbiz` reel | A fixed three-type mix enforced across the calendar. **The breakdown is DM-gated — the current mix is a placeholder** (`content-mix.json`). |
| 4 camera moves | `red.voss` reel | Tracking, orbit, whip pan, pull back as the Scene Generator's Shot Director layer. |
| Shoot Day / seven shots | MNTO Studios playbook ($7 PDF, not purchased) | A seven-shot list per garment covering the whole funnel. **ChoZen's own seven** — MNTO's are behind the purchase. |

## Pieces

| Piece | Where | Runs in |
|---|---|---|
| **Content Globe** (planner) | `content-globe.html` · published: https://claude.ai/artifact/GtCTLC4TqDh4FjZZTfEgUR | claude.ai (asks Claude; optional Parallel Search connector) |
| **Visual Studio** (cards) | `visual-studio.html` · published: https://claude.ai/artifact/TK9TXCCfmsNQMAh7vbjtvh | claude.ai or any browser |
| **Shot Director** (video prompts) | `src/modules/CameraMove.js` | `node index.js --preset authority --moves tracking,whip-pan,pull-back` |
| **Shoot Day** (seven shots) | `src/shoots/SevenShots.js` | `node index.js --shoot-day "Unshaken tee:standard,Satin maxi:womens"` |
| **Skill** | `.claude/skills/chozen-content-system/` | Claude Code / Cowork |

## Flow

1. Content Globe: fill/confirm the brief (pre-filled for ChoZen) → Generate. Research uses the **Parallel Search** connector if it is added in claude.ai Settings → Connectors; otherwise ideas come from the brief alone and the page says so.
2. Review and edit captions in the calendar. Export **Publisher handoff .json** (also .csv, .md, ledger entries).
3. Visual Studio: load the handoff → pick format (4:5, 1:1, 9:16) and style → download PNGs.
4. Video posts: each post carries `camera_moves`; run the Shot Director with them to get one prompt per clip for Seedance/Kling.
5. Hand `chozen-plan.json` to ChoZen Publisher, which owns media attach, Brand Law pre-flight, the final Sabbath re-check and scheduling. Nothing in this system posts or schedules.

## Guarantees and limits

- Sabbath guard is a JS port of `chozen-autopost/scripts/sundown_guard.py` (NOAA sunset, Detroit, −18 min / +42 min). `test/sabbath-guard.test.js` checks it against the Python output.
- Best times: Mon–Fri FB/TikTok/IG/Threads from ChoZen's history; Sunday reuses Monday; **YouTube and X times are assumed** and flagged "time assumed" per post.
- Scripture references are always exported `scripture_verified: false`.
- Caps: 40 posts and 31 days per run, as in the original planner.
- The handoff schema is `chozen-content-system/plan@1` (see the skill's `references/handoff-schema.md`). **ChoZen Publisher's source is only on Amoz's Mac; its `POST /api/posts` body is unconfirmed until that code is on GitHub.**
- Instagram feed crops to 4:5 — use 9:16 cards for Reels/Stories only. Publisher has no carousel support yet.
- Installed alongside (from fable-brain): `chozen-autopost` (with fable-brain's corrected `engine-setup.md`), `chozen-creator-os`, `humanized-writing`.
