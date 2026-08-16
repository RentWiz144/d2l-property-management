---
name: chozen-social-command
description: The ChoZen social media command center — a full Metricool-style suite made for ChoZen. Schedules posts to multiple platforms at once and in advance, tracks the outcomes of every post, and runs structured ad-campaign experiments so winning content is identified by data, not vibes. Use whenever Amoz wants to cross-post, schedule, or queue content ("post this everywhere", "schedule this for next week", "line up my posts", "post to IG, TikTok and Facebook at once"), check how posts performed ("how did that post do", "which post won", "show me the numbers"), or test campaigns ("A/B test these", "try two versions", "run a campaign", "which hook works better", "test this ad"). Also trigger on "Metricool", "content calendar with tracking", "best time to post", or any request to plan posts AND measure their results. Drives the connected Metricool MCP tools when available; falls back to a manual posting plan when not.
---

# ChoZen Social Command

A Metricool-class suite, rebuilt for ChoZen Unlimited: multi-platform scheduling in advance, per-post outcome tracking, and disciplined campaign experiments — all in service of $5K/mo (Oct 2026) and $10K/mo (Jan 2027).

Three jobs, one loop:

1. **PLAN & SCHEDULE** — one idea → platform-native versions → scheduled across networks at the best times.
2. **TRACK** — every scheduled post gets a campaign tag; results are pulled back from analytics and logged.
3. **EXPERIMENT** — variants are compared head-to-head so the next round of content spends effort (and ad dollars) on what actually worked.

## The engine

Check for the **Metricool MCP connector** first (tools are named like `mcp__<server>__createScheduledPost`; find them with ToolSearch using keywords like "ScheduledPost", "Analytics", "BestTimeToPost"). When connected, it is the posting and analytics engine:

| Need | Tool |
|---|---|
| Schedule/cross-post | `createScheduledPost` (or `createScheduledPostForReview` when Amoz should approve first) |
| Edit or reschedule | `updateScheduledPost` |
| See the queue | `getScheduledPosts` |
| Optimal times | `getBestTimeToPostByNetwork` |
| Pull results | `getAnalyticsAvailableMetrics` → `getAnalyticsDataByMetrics` |
| Brand config | `getBrandSettings` |

Call `getBrandSettings` once per session before scheduling — it tells you which networks are actually connected and any account limits. Never claim a post is scheduled unless the tool call succeeded; report failures per-platform.

**If the connector is not available**, don't stall: produce the full plan anyway (per-platform copy, exact date/times, campaign tags, tracking sheet) as a deliverable Amoz can load into any scheduler, and tell him the Metricool connector needs to be authorized in claude.ai connector settings to make scheduling live.

Read `references/campaign-playbook.md` before running any experiment or performance review — it defines the campaign tag format, the ledger, and the judging rules.

## Workflow: scheduling a post (or a batch)

1. **Intake.** Get the core idea/asset, target platforms (default: Instagram, TikTok, Facebook, Threads, YouTube — whatever `getBrandSettings` shows connected), and the window ("this week", "before the drop").
2. **Shabbat gate — non-negotiable.** Nothing publishes from Friday sundown to Saturday sundown (America/New_York; use ~18:00 Friday–20:00 Saturday as the safe buffer when exact sundown is unknown). Move violating slots to Saturday 21:00 or Sunday morning. This applies to auto-publish times, not to when the scheduling work is done.
3. **Adapt per platform.** One idea, native versions — never one caption pasted five times. Follow `references/platform-specs.md` for lengths, hashtag counts, and format rules. Keep the ChoZen voice: bold, faith-rooted, direct; 1 Peter 2:9 identity; no desperate salesy tone.
4. **Time it.** Use `getBestTimeToPostByNetwork` per network; stagger platforms by 15–60 min rather than firing all at the identical minute. Apply the Shabbat gate to the suggested times too.
5. **Tag it.** Every post gets a campaign tag (see playbook) embedded in the tracking ledger, and UTM parameters on any link (`utm_source=<platform>&utm_medium=social&utm_campaign=<tag>`).
6. **Schedule.** One `createScheduledPost` call per platform/time. For anything risky (new campaign angle, pricing, big claims) use `createScheduledPostForReview` and tell Amoz it's waiting on his approval.
7. **Confirm.** Show a table: platform · date/time · first line of caption · campaign tag · status (scheduled / needs review / failed). Log every scheduled post to the ledger.

## Workflow: tracking outcomes

When asked "how did it do" or on a weekly review:

1. Pull the relevant window with `getAnalyticsDataByMetrics` (discover metric names via `getAnalyticsAvailableMetrics` — don't guess them).
2. Join results to the campaign ledger by post/tag.
3. Report per post: reach/views, engagement rate (engagements ÷ reach), link clicks if available, follows gained. Then roll up per campaign.
4. Verdict line for each campaign: **SCALE** (beat account baseline by >20%), **ITERATE** (mixed — say what to change), or **KILL** (below baseline twice). Always name the single best post of the period and *why* it likely won (hook, format, time, platform).
5. Feed forward: end every report with the top 2 concrete changes for next week's content.

## Workflow: campaign experiments (A/B and beyond)

This is what makes ad spend safe: test organically first, put money only behind proven winners.

1. Define ONE variable per experiment (hook, format, offer, posting time, platform). Two variables = uninterpretable results.
2. Create 2–3 variants that are identical except for that variable. Same platform mix, comparable time slots (or mirrored days), same campaign family tag with variant suffix (`-a`, `-b`).
3. Schedule both arms, log them in the ledger with the hypothesis written down BEFORE results come in.
4. Judge after the platform's settle window (48h for IG/FB/Threads, 72h+ for TikTok/YouTube where distribution is slower). Minimum bar to call a winner: a ≥25% gap on the primary metric; anything closer is a tie — say so rather than forcing a winner.
5. Winner → becomes the control for the next test, and the candidate for paid boosting. Record the learning in the ledger's `learnings` section so it compounds.

## Division of labor with other ChoZen skills

- **chozen-autopost** owns Postiz-based queue operations; this skill owns the Metricool engine plus all analytics/experiments. If both could apply, prefer this skill when tracking or testing is part of the ask.
- Caption craft at depth → `chozen-platform-captions`; headline variants for tests → `chozen-headline-ab`; asset generation → `chozen-generate`; pre-ship visual check → `chozen-design-audit`; paid-spend strategy verdicts → `chozen-cmo`/`chozen-cfo`.

## Guardrails

- Never publish immediately without an explicit "post it now" — default is scheduled and shown to Amoz first in the confirmation table.
- Never fabricate metrics. If analytics can't be pulled, say exactly that and log the gap.
- Ad-spend decisions are recommendations only — actual budget commitments go through Amoz (with the CFO skill's read if the amount is material).
