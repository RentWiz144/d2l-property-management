# YouTube Growth System — Design

Date: 2026-11-27 · Status: awaiting owner approval · Channel: The ChoZen Collection (`UCaeeKNjKXVfHay29EJasrNw`)

## Intent and why

Recent Shorts get 0–5 views. The owner wants a repeatable system that earns
real views and subscribers. Owner's stated goal: **build an audience** (not
sell jackets right now). Data source chosen by owner: **public data only**.

## What the evidence says

Verified from the public upload feed on 2026-11-27 (15 newest uploads, Nov 17–27):

- All 15 are Shorts advertising the Tribal Sherpa jacket.
- 4 distinct titles across 15 uploads (6× / 5× / 3× / 1×), up to 4 uploads a day.
- Views 0–5 each, 0 likes.
- Channel totals: 31 subscribers, 236 videos, ~252K lifetime views.

Inferred (not verified): repeated re-uploads plus ad-only content are why
YouTube is not testing these Shorts with viewers.

Unknown: which older videos earned the lifetime views; retention; traffic
sources. No analytics access (vidIQ credits exhausted; owner chose public data).
A full-channel listing was not possible in this session — the feed exposes only
the 15 newest uploads.

## Goals

1. Stop duplicate uploads before they happen.
2. Shift the mix to content a stranger would watch and subscribe for.
3. Give every Short a title, hook and subscribe reason before it is posted.
4. Measure weekly from public data and say plainly what to repeat and what to stop.

## Non-goals

- Paid ads or boosts.
- Auto-publishing to YouTube. The owner posts; the system prepares.
- Long-form video strategy (Shorts first; revisit once Shorts get traction).
- Other platforms (already covered by `chozen-social-command`).

## Anti-goals (failure even if it "works")

- Bots, bought views or subscribers, sub-for-sub, engagement pods.
- Invented or estimated metrics presented as real.
- Anything publishing between Friday sundown and Saturday sundown.

## Constraints

- Public feed only: 15 newest uploads, view and like counts only. No
  impressions, retention or subscriber-per-video data.
- Repo is plain Node with no dependencies; keep it that way.
- The assistant makes no changes on the YouTube channel. Unlisting, posting
  and editing are done by the owner.

## Approaches

| | Approach | Trade-off | Verdict |
|---|---|---|---|
| A | Extend `chozen-social-command` with a YouTube growth workflow plus three small Node scripts | Reuses the ledger habit, Shabbat gate and campaign tags already in place; scripts are simple | **Chosen** (owner agreed in conversation) |
| B | New standalone skill for YouTube | Clean separation, but duplicates scheduling, tagging and gate rules that then drift apart | Rejected |
| C | Web dashboard pulling analytics | Looks good, but public data is too thin to justify it and it adds hosting | Rejected |
| D | Keep posting, just fix titles and tags | Cheapest, but does not address duplicates or ad-only content, which is the likely cause | Rejected |

## The design

### 1. Scripts (`youtube/`, Node, no dependencies)

- `snapshot.js` — fetches the public feed and appends one row per video
  (date, video id, title, published time, views, likes) to
  `youtube/ledger/snapshots.jsonl`. Run at each weekly review; because the
  feed holds 15 uploads and the cadence below is at most 6 a week, a weekly
  run loses nothing.
- `dedupe.js` — two modes:
  - `--report`: lists uploads sharing a normalized title, keeps the one with
    the most views (oldest on a tie), and marks the rest "unlist". Output is a
    Markdown list for the owner to act on.
  - `--check "<title>"`: exits non-zero if the title matches one already in
    the ledger. This is the pre-publish gate.
- `scorecard.js` — reads snapshots and the post plan, writes
  `youtube/reports/YYYY-MM-DD.md`: views per Short, median, view change since
  last snapshot, results grouped by pillar, and a verdict per pillar. Gaps in
  data are printed as gaps.

Video status (`youtube/ledger/status.csv`): video id, status (`unlisted` or
`removed`), date. The assistant fills it in when the owner says what they
unlisted. A video missing from the feed with no status row is reported as
"left the feed (aged out or unknown)" and its last known views are kept, not
counted as a drop.

Title normalization: lowercase, strip `#hashtags`, punctuation and repeated
spaces. Exact match after normalization counts as a duplicate.

### 2. Post plan (`youtube/ledger/plan.csv`)

One row per planned Short: date, slot, pillar, title, hook line, subscribe
reason, campaign tag, video id (filled after posting). The scorecard joins on
video id, falling back to normalized title.

### 3. Rules (new `references/youtube-growth.md`, linked from `SKILL.md`)

- **Cadence:** one Short a day at most, never the same file twice, nothing in
  the Shabbat window. Assistant's call: block Fri 16:00 – Sat 22:00
  America/Detroit all year. That is wider than the skill's 18:00–20:00 buffer
  because Detroit sunset runs from about 17:00 in winter to after 21:00 in
  summer, and the rule is sundown.
- **Mix:** four value Shorts for every product Short.
- **Pillars** (assistant's proposal, taken from the brand engine's four
  states plus the tribe theme in current titles): Authority, Faith, Pressure,
  Discipline, Tribe identity. Product is its own tag.
- **Packaging checklist per Short:** title ≤ 60 characters that states the
  payoff in plain search words; spoken or on-screen hook in the first 2
  seconds; one subscribe reason ("new tribe teaching every day"); loop-friendly
  ending; no price or sale language in value Shorts.
- **Verdicts** (assistant's call):
  - Baseline is the median of new-mix Shorts only (rows in `plan.csv`), not
    the old duplicates.
  - Only Shorts at least 72 hours old at snapshot time are counted.
  - A pillar gets a verdict only once it has 3 or more counted Shorts and the
    baseline is above zero. Before that the scorecard prints "not enough data"
    and just ranks the Shorts by views.
  - SCALE: pillar median 25% or more above baseline. KILL: below baseline in
    two consecutive scorecards. Otherwise ITERATE.

### 4. First run deliverables

- Duplicate list from today's feed for the owner to unlist.
- A two-week Shorts calendar at the 4:1 mix with titles, hooks and subscribe
  reasons, checked through `dedupe.js --check`.
- Baseline scorecard from today's snapshot.

## Tests and verification

- Unit tests with `node:test` for title normalization, duplicate grouping
  (keeps highest views), the `--check` exit code, feed parsing against a saved
  sample feed, and scorecard medians and verdict thresholds.
- Fixture check: the feed as fetched on 2026-11-27 is saved at
  `youtube/test/fixtures/feed-2026-11-27.xml`; `dedupe.js --report` on it must
  give the 6× / 5× / 3× / 1× grouping above.
- Live check: `snapshot.js` against the live feed must parse and append rows
  without error. The live grouping is not asserted, since the feed moves.
- Done means the owner has unlisted the duplicates in YouTube Studio, posted
  from the calendar, and seen the next weekly scorecard. Passing tests is not done.

## Success measure (a target, not a promise)

After two weeks on the new mix: no duplicate uploads, and the median value
Short above the current median (0 views). The first real threshold worth
setting comes from that scorecard.

## Hard stops

- No action on the YouTube channel by the assistant.
- No publishing, no paid spend, no purchased engagement.
- No scraping beyond the public feed without the owner's say-so.
- No Shabbat-window slots.
- No metric written that was not read from a source.

## Open with the owner

1. What is producing the repeat uploads: hand posting, or a scheduler queue
   (Postiz or another)? If a queue, it has to be paused or gated at the queue,
   because a planning-time check never touches it.
2. Who makes the value Shorts and from what (owner on camera, generated
   scenes with voiceover, recut older videos), and are the five pillars right?

## Left to the builder

File layout inside `youtube/`, CLI flag parsing, report formatting, and the
wording of the skill additions, within the rules above.
