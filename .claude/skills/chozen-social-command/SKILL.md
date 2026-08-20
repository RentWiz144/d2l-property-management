---
name: chozen-social-command
description: The ChoZen social media command center — a full Metricool replacement built as a skill, owned by ChoZen with no paid scheduler subscription required. Schedules posts to multiple platforms at once and in advance, tracks the outcomes of every post, and runs structured ad-campaign experiments so winning content is identified by data, not vibes. Use whenever Amoz wants to cross-post, schedule, or queue content ("post this everywhere", "schedule this for next week", "line up my posts", "post to IG, TikTok and Facebook at once"), check how posts performed ("how did that post do", "which post won", "show me the numbers"), or test campaigns ("A/B test these", "try two versions", "run a campaign", "which hook works better", "test this ad"). Also trigger on "Metricool", "content calendar with tracking", "best time to post", or any request to plan posts AND measure their results.
---

# ChoZen Social Command

A Metricool-class suite that ChoZen **owns** — no subscription. Multi-platform scheduling in advance, per-post outcome tracking, and disciplined campaign experiments — all in service of $5K/mo (Oct 2026) and $10K/mo (Jan 2027).

Three jobs, one loop:

1. **PLAN & SCHEDULE** — one idea → platform-native versions → scheduled across networks at the best times.
2. **TRACK** — every post gets a campaign tag; results are logged to the ledger ChoZen controls.
3. **EXPERIMENT** — variants are compared head-to-head so effort (and ad dollars) go to what actually worked.

## The engine: discover, don't assume

This skill is **engine-agnostic**. Metricool is cancelled — never rely on it. At the start of a scheduling session, discover what's actually available, in this order:

1. **Postiz** (the designated ChoZen posting engine per `chozen-autopost`) — if a Postiz MCP/API connector is present, use it.
2. **Any other posting connector** the session has (search tools for "schedule", "post", "publish" + platform names). Use only connectors backed by a service Amoz actually subscribes to — confirm before pushing a queue through a connector that may be lapsed.
3. **No engine connected (the default assumption)** — the skill still delivers everything except the final button-press:
   - Full per-platform schedule with exact date/times (see timing defaults below)
   - Platform-native captions, ready to paste
   - Publicly-hosted media URLs (see media playbook)
   - The campaign ledger entry, pre-filled
   - A checklist Amoz can execute in each platform's own free native scheduler: **Meta Business Suite** (Facebook + Instagram, free, schedules in advance), **TikTok web upload scheduler** (free, up to 10 days ahead), **Threads' built-in schedule** (via IG app). Native schedulers are free and remove the middleman entirely — recommend them as the permanent path.

Never schedule through a paid third-party account without confirming the subscription is active. Never claim a post is scheduled unless the call succeeded; report per-platform.

## Timing defaults (ChoZen audience)

Learned from ChoZen's own historical engagement data (America/Detroit). Use these when no analytics source is available; refine them from the ledger as results accumulate:

| Day | Facebook | TikTok | Instagram | Threads |
|---|---|---|---|---|
| Mon | 10:00a | 10:30a | 7:00p | 7:45p |
| Tue | 10:00a | 10:30a | 6:00p | 6:45p |
| Wed | 12:00p | 10:00a | 4:00p | 5:00p |
| Thu | 10:45a | 10:00a | 5:00p | 6:00p |
| Fri | 10:45a | 10:00a | 12:00p | 1:00p |

Stagger platforms 15–60 min; never fire all at the identical minute. **Shabbat gate — non-negotiable:** nothing publishes Friday sundown → Saturday sundown (use 18:00 Fri–20:00 Sat as the safe buffer). Move violating slots to Saturday 21:00+ or Sunday morning.

## Media playbook (no scheduler = no media host, so bring your own)

Schedulers and platform APIs need a **public URL** for media. Reliable options, in order:

1. **Public GitHub repo** — commit assets to a `social-media/` folder; `raw.githubusercontent.com/...` URLs are public, stable, and free. This is the proven ChoZen path.
2. **Google Drive** — works only if the file is shared "anyone with the link"; private Drive links serve an HTML login page and silently break posts. Verify by fetching the URL and checking the content-type is an image, not HTML.
3. If posting natively by hand, no hosting is needed — the checklist just references the files.

Chat-pasted images never reach the filesystem in remote sessions — get real files via Drive, the repo, or an upload before promising a schedule.

## Workflow: scheduling a post (or a batch)

1. **Intake.** Core idea/asset, target platforms (default: Instagram, TikTok, Facebook, Threads, YouTube), window.
2. **Verify media files exist** somewhere real (disk, Drive, repo) — see media playbook.
3. **Shabbat gate** on every slot.
4. **Adapt per platform.** One idea, native versions — never one caption pasted five times. Follow `references/platform-specs.md`. ChoZen voice: bold, faith-rooted, direct; 1 Peter 2:9 identity; no desperate salesy tone.
5. **Time it** from the defaults table (or the engine's own best-time data if one is connected).
6. **Tag it.** Campaign tag per `references/campaign-playbook.md`; UTMs on any link.
7. **Schedule or hand off.** Engine connected → schedule and confirm each call. No engine → deliver the ready-to-execute plan + native-scheduler checklist.
8. **Confirm** with a table: platform · date/time · first caption line · campaign tag · status. Log everything to the ledger.

## Workflow: tracking outcomes (no analytics API required)

Without a paid dashboard, the data comes from the platforms themselves — each gives free native analytics (IG/FB: Professional Dashboard & Meta Business Suite; TikTok: Creator tools → Analytics; Threads: Insights).

1. At review time, ask Amoz for screenshots or numbers from native analytics for the tracked posts (or read them via any connected platform tool).
2. Join results to the ledger by campaign tag. Record per post: reach/views, engagement rate (engagements ÷ reach), link clicks, follows.
3. Verdict per campaign: **SCALE** (>20% over the trailing-30-day baseline in the ledger), **ITERATE** (mixed — say what to change), or **KILL** (below baseline twice). Name the single best post and *why* it likely won.
4. End every report with the top 2 concrete changes for next week. Never fabricate metrics — a gap in data is logged as a gap.

## Workflow: campaign experiments (A/B and beyond)

Test organically first; put money only behind proven winners.

1. ONE variable per experiment (hook, format, offer, time, platform).
2. 2–3 variants identical except that variable; same campaign family tag with `-a`/`-b` suffixes.
3. Write the hypothesis in the ledger BEFORE results exist.
4. Judge after the settle window (48h IG/FB/Threads; 72h+ TikTok/YouTube). Winner needs a ≥25% gap on the primary metric; closer is a TIE — say so.
5. Winner becomes the next control and the paid-boost candidate. Record one plain-sentence learning so it compounds.

## Division of labor with other ChoZen skills

- **chozen-autopost** owns Postiz queue operations when Postiz is connected; this skill owns planning, timing, tracking, and experiments, and is the fallback when no engine exists.
- Caption craft at depth → `chozen-platform-captions`; headline variants → `chozen-headline-ab`; asset generation → `chozen-generate`; pre-ship visual check → `chozen-design-audit`; paid-spend verdicts → `chozen-cmo`/`chozen-cfo`.

## Guardrails

- Never publish immediately without an explicit "post it now" — default is scheduled/planned and shown to Amoz first.
- Never push content through a connector whose underlying subscription may be cancelled without confirming it first.
- Never fabricate metrics.
- Ad-spend decisions are recommendations only — budget commitments go through Amoz.
