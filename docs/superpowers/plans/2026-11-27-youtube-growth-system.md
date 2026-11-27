# YouTube Growth System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give The ChoZen Collection a repeatable Shorts system: no duplicate uploads, a 4:1 value-to-product mix, a packaging check before anything is queued, and a weekly scorecard from public data.

**Architecture:** Small dependency-free Node CLIs under `youtube/` share one library for feed parsing, title normalization, CSV and the Shabbat window. Data lives in flat files under `youtube/ledger/`. The existing Seedance generator gains a `--config` option so it can make 9:16 Shorts clips. Rules are written into the `chozen-social-command` skill.

**Tech Stack:** Node 22, built-ins only (`node:test`, `node:assert`, `fetch`, `Intl`). No npm dependencies.

**Spec:** `docs/superpowers/specs/2026-11-27-youtube-growth-system-design.md`

## Global Constraints

- No npm dependencies. CommonJS (`require`), matching the repo.
- Channel id `UCaeeKNjKXVfHay29EJasrNw`; feed URL `https://www.youtube.com/feeds/videos.xml?channel_id=UCaeeKNjKXVfHay29EJasrNw`.
- Only network call allowed: GET on that feed URL. No other scraping.
- Never run `generate.js --confirm`. Never call ChoZen Publisher. Never change anything on YouTube.
- Never write a metric that was not read from the feed or a ledger file. Missing data prints as `n/a`.
- Shabbat window: Friday 16:00 to Saturday 22:00, `America/Detroit`, all year.
- Title limit 60 characters. Cadence: at most one Short per Detroit calendar day. Mix: at least 4 value rows per product row.
- Pillars: `authority`, `faith`, `pressure`, `discipline`, `tribe`, plus `product`.
- Verdicts: 72-hour minimum age, 3 or more counted Shorts per pillar, baseline above zero, SCALE at 25% or more above baseline.
- Tests run with `node --test youtube/test/`.
- Commit after each task; push to `claude/zen-darwin-g3nali`.

## Review Focus

1. Feed fetch fails or returns zero entries: `snapshot.js` exits 1 and appends nothing.
2. Titles containing XML entities (`&amp;`, `&#39;`, `&quot;`): decoded before storing and comparing.
3. CSV fields containing commas, quotes or newlines: round-trip unchanged.
4. Snapshot run twice in one day: the second run replaces that day's rows, it does not double them.
5. Daylight-saving changes: the Shabbat check uses `Intl` with `America/Detroit`, not a fixed UTC offset.

## File Structure

| File | Responsibility |
|---|---|
| `youtube/lib/feed.js` | `parseFeed`, `normalizeTitle`, `decodeEntities` |
| `youtube/lib/csv.js` | `parseCsv`, `toCsv` |
| `youtube/lib/shabbat.js` | `inShabbatWindow`, `detroitParts` |
| `youtube/lib/ledger.js` | read and write `snapshots.jsonl`, `plan.csv`, `status.csv` |
| `youtube/snapshot.js` | CLI: fetch feed, append snapshot |
| `youtube/dedupe.js` | CLI: `--report`, `--check` |
| `youtube/plan-check.js` | CLI: validate `plan.csv` |
| `youtube/scorecard.js` | CLI: write weekly report |
| `youtube/shorts/prompts.json` | Seedance prompts for value Shorts |
| `brand/textures/generate.js` | gains `--config`, `--out` |
| `.claude/skills/chozen-social-command/references/youtube-growth.md` | the rules |

---

### Task 1: Feed parsing and title normalization

**Files:** Create `youtube/lib/feed.js`; Test `youtube/test/feed.test.js`; Fixture `youtube/test/fixtures/feed-2026-11-27.xml` (exists).

**Interfaces — Produces:**
- `decodeEntities(s: string): string`
- `normalizeTitle(title: string): string` — lowercase, remove `#word` tokens, replace every character that is not a letter or digit with a space, collapse spaces, trim.
- `parseFeed(xml: string): Array<{videoId, title, published, views, likes}>` — `published` ISO string; `views`, `likes` numbers, `null` when the attribute is absent. Regex parsing on `<entry>` blocks: `<yt:videoId>`, `<title>`, `<published>`, `<media:statistics views="">`, `<media:starRating count="">`.

- [ ] **Step 1: Write failing tests**
  - `parseFeed(fixture)` returns 15 entries; first has `videoId === '1-DZtMzLwo8'`, `views === 0`.
  - Entry `womtwBjKzyk` has `views === 5`.
  - `normalizeTitle('Judah Sets the Pace | ChoZen Friday Tribal Sherpa #Shorts') === 'judah sets the pace chozen friday tribal sherpa'`.
  - `normalizeTitle("You Don&#39;t Need")` after `decodeEntities` equals `'you don t need'`.
  - `decodeEntities('A &amp; B &quot;C&quot;') === 'A & B "C"'`.
  - `parseFeed('<feed></feed>')` returns `[]`.
  - An entry with no `media:statistics` gives `views === null`.
- [ ] **Step 2:** Run `node --test youtube/test/feed.test.js`; expect FAIL (module missing).
- [ ] **Step 3:** Implement `youtube/lib/feed.js`. `parseFeed` applies `decodeEntities` to titles.
- [ ] **Step 4:** Run tests; expect PASS.
- [ ] **Step 5:** Commit `feat(youtube): feed parser and title normalization`.

### Task 2: CSV, Shabbat window and ledger helpers

**Files:** Create `youtube/lib/csv.js`, `youtube/lib/shabbat.js`, `youtube/lib/ledger.js`; Test `youtube/test/lib.test.js`.

**Interfaces — Produces:**
- `parseCsv(text: string): Array<Record<string,string>>` (first row is the header; RFC 4180 quoting); `toCsv(rows, headers: string[]): string`.
- `detroitParts(date: Date): {weekday: 0-6, hour: number, minute: number, ymd: 'YYYY-MM-DD'}` via `Intl.DateTimeFormat('en-US', {timeZone: 'America/Detroit', ...})`.
- `inShabbatWindow(date: Date): boolean` — true from Friday 16:00 up to but not including Saturday 22:00 Detroit time.
- `readSnapshots(dir): Array<{date, videoId, title, published, views, likes}>`; `writeSnapshot(dir, date: 'YYYY-MM-DD', entries)` — drops existing rows with the same `date`, then appends.
- `readPlan(dir)`, `readStatus(dir)` — return `[]` when the file is absent.
- Ledger dir default `youtube/ledger`. `plan.csv` headers: `date,time,pillar,title,hook,subscribe_reason,campaign_tag,video_id`. `status.csv` headers: `video_id,status,date`.

- [ ] **Step 1: Write failing tests**
  - `parseCsv(toCsv([{a:'x, "y"\nz', b:'1'}], ['a','b']))` deep-equals the input row.
  - `inShabbatWindow(new Date('2026-11-27T21:00:00Z'))` is `true` (Fri 16:00 EST).
  - `inShabbatWindow(new Date('2026-11-27T20:59:00Z'))` is `false`.
  - `inShabbatWindow(new Date('2026-11-29T02:59:00Z'))` is `true` (Sat 21:59 EST); `...T03:00:00Z` is `false`.
  - `inShabbatWindow(new Date('2026-07-03T20:00:00Z'))` is `true` (Fri 16:00 EDT); `...T19:59:00Z` is `false`.
  - `writeSnapshot` twice with the same date into a temp dir leaves one set of rows for that date.
  - `readPlan` on an empty temp dir returns `[]`.
- [ ] **Step 2:** Run `node --test youtube/test/lib.test.js`; expect FAIL.
- [ ] **Step 3:** Implement the three files.
- [ ] **Step 4:** Run tests; expect PASS.
- [ ] **Step 5:** Commit `feat(youtube): csv, shabbat window and ledger helpers`.

### Task 3: snapshot and dedupe CLIs

**Files:** Create `youtube/snapshot.js`, `youtube/dedupe.js`; Test `youtube/test/dedupe.test.js`, `youtube/test/snapshot.test.js`.

**Interfaces — Consumes:** Task 1 and 2 exports. **Produces:**
- `runSnapshot({xml, date, dir}): number` (rows written; throws `Error('feed returned no entries')` on zero). CLI: `node youtube/snapshot.js [--file <xml>] [--dir <ledger>]`; without `--file` it fetches the feed URL; non-200 or zero entries prints the reason and exits 1 without writing.
- `findDuplicates(entries): Array<{normTitle, keep, unlist: entry[]}>` — groups of 2 or more by `normalizeTitle`; `keep` is the highest `views`, oldest `published` on a tie (null views count as 0). Latest snapshot row per `videoId` is used.
- `checkTitle(title, entries, planRows): {ok: boolean, match?: string}`.
- CLI: `node youtube/dedupe.js --report [--dir]` prints Markdown, one section per group with keep and unlist video ids and links (`https://youtube.com/shorts/<id>`); `node youtube/dedupe.js --check "<title>" [--dir]` exits 0 if unused, 2 if it matches, and prints the match.

- [ ] **Step 1: Write failing tests**
  - `findDuplicates(parseFeed(fixture))` returns 3 groups with `unlist.length` 5, 4 and 2 (sorted descending); keeps are `ruHWMG4ebgA`, `womtwBjKzyk`, `wtVLkMRajSk`.
  - `checkTitle('THE PLUM FORMULA | ChoZen Tribal Sherpa #shorts', entries, []).ok === false`.
  - `checkTitle('Why Judah Leads', entries, []).ok === true`.
  - `checkTitle('Why Judah Leads', [], [{title: 'why judah leads!'}]).ok === false`.
  - `runSnapshot({xml: '<feed></feed>', ...})` throws and the temp dir stays empty.
  - `runSnapshot` with the fixture writes 15 rows.
  - Spawned `node youtube/dedupe.js --check "The Plum Formula | ChoZen Tribal Sherpa" --dir <tmp with snapshot>` exits with status 2.
- [ ] **Step 2:** Run both test files; expect FAIL.
- [ ] **Step 3:** Implement both CLIs. Export the functions; run the CLI only under `require.main === module`.
- [ ] **Step 4:** Run tests; expect PASS.
- [ ] **Step 5:** Commit `feat(youtube): snapshot and duplicate gate`.

### Task 4: plan-check CLI

**Files:** Create `youtube/plan-check.js`; Test `youtube/test/plan-check.test.js`.

**Interfaces — Consumes:** `readPlan`, `readSnapshots`, `inShabbatWindow`, `detroitParts`, `checkTitle`. **Produces:**
- `checkPlan(planRows, entries): Array<{row: number, rule: string, message: string}>`. Rules: `shabbat` (row's `date`+`time` read as Detroit local time falls in the window), `cadence` (two rows on one date), `mix` (value rows < 4 × product rows), `title-length` (> 60), `duplicate` (matches a ledger title or another plan row), `pillar` (not in the pillar list), `missing` (empty `title`, `hook` or `subscribe_reason`).
- CLI: `node youtube/plan-check.js [--dir]` prints each problem; exits 0 when none, 2 otherwise.
- Detroit local time to `Date`: build the UTC guess from the wall time, read it back with `detroitParts`, and correct by the difference.

- [ ] **Step 1: Write failing tests** — one per rule, each with a minimal plan that triggers only that rule, plus:
  - A clean 5-row plan (4 value, 1 product, distinct dates Mon–Thu and Sun, 10:00) returns `[]`.
  - A row at `2026-12-04` `16:30` triggers `shabbat`; `2026-12-04` `15:30` does not.
  - A row at `2026-12-05` `21:30` triggers `shabbat`; `22:00` does not.
- [ ] **Step 2:** Run; expect FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run; expect PASS.
- [ ] **Step 5:** Commit `feat(youtube): plan-check gate`.

### Task 5: scorecard CLI

**Files:** Create `youtube/scorecard.js`; Test `youtube/test/scorecard.test.js`.

**Interfaces — Consumes:** ledger readers, `normalizeTitle`. **Produces:**
- `buildScorecard({snapshots, plan, status, today: 'YYYY-MM-DD', previous?: Record<pillar, verdict>}): {videos, pillars, baseline, notes}`
  - `videos`: latest row per video with `pillar` (joined on `video_id`, else normalized title, else `unplanned`), `ageHours`, `views`, `delta` (vs the prior snapshot date, `null` if none), `state` (`live`, `unlisted`, `removed`, or `left-feed` when absent from the newest snapshot with no status row; last known views kept).
  - `baseline`: median views of planned videos with `ageHours >= 72`; `null` if none.
  - `pillars[p]`: `{count, median, verdict}`; verdict is `not enough data` when `count < 3`, baseline is `null` or baseline is `0`; `SCALE` when `median >= 1.25 * baseline`; `KILL` when `median < baseline` and `previous[p]` was `KILL` or `BELOW`; `BELOW` when below for the first time; else `ITERATE`.
- `median(nums: number[]): number|null`.
- CLI: `node youtube/scorecard.js [--dir] [--out youtube/reports]` writes `<out>/<today>.md`: totals line, video table sorted by views, pillar table, and a "Gaps" list. Reads the previous report's verdicts from `<out>/verdicts.json` and rewrites it.

- [ ] **Step 1: Write failing tests**
  - `median([])` is `null`; `median([1,3])` is `2`; `median([5,1,3])` is `3`.
  - Two planned videos aged 80h: every pillar verdict is `not enough data`.
  - Three `faith` videos at 100, 120, 140 views and three `tribe` at 10, 20, 30, all aged 80h: baseline `65`, `faith` is `SCALE`, `tribe` is `BELOW`; with `previous.tribe === 'BELOW'` it is `KILL`.
  - A planned video aged 48h is excluded from baseline and counts.
  - All counted views `0`: verdicts are `not enough data`.
  - A video in the first snapshot but not the second, with no status row, has `state === 'left-feed'` and keeps its views; with a status row `unlisted` it has `state === 'unlisted'`.
  - `delta` is `null` with a single snapshot date.
- [ ] **Step 2:** Run; expect FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run; expect PASS.
- [ ] **Step 5:** Commit `feat(youtube): weekly scorecard`.

### Task 6: Shorts clips from the Seedance generator

**Files:** Modify `brand/textures/generate.js` (argument parsing at lines 14–20, output dir in the main function); Create `youtube/shorts/prompts.json`, `youtube/shorts/.gitignore` (`out/`); Modify `brand/textures/README.md`; Test `youtube/test/generate.test.js`.

**Interfaces — Produces:**
- `--config <path>` (default `brand/textures/prompts.json` next to the script) and `--out <dir>` (default `out/` beside the config file). Existing behavior without flags is unchanged.
- `youtube/shorts/prompts.json`: `model: "bytedance/seedance-2"`, defaults `{resolution: "720p", aspect_ratio: "9:16", duration: 8, generate_audio: false}`, and one clip per value Short in the first calendar, `id` equal to the row's `campaign_tag`. Prompts follow the scene engine's rules in `CHOZEN.md` and the brand law: no text or logos in frame, men's tops with fringes and a ribband of blue at the hem, women in maxi length only, no hype imagery.

- [ ] **Step 1: Write failing tests** (spawn the script; no key set, no `--confirm`)
  - `node brand/textures/generate.js` exits 0 and prints `liquid-chrome: 6s @ 720p 16:9 ~ $1.23`.
  - `node brand/textures/generate.js --config youtube/shorts/prompts.json` exits 0, prints one line per clip containing `9:16`, and `Dry run only`.
  - `--config /nonexistent.json` exits 1.
  - `--confirm` with `KIE_API_KEY` unset exits 1 with `KIE_API_KEY is not set` (no network call happens before this check).
- [ ] **Step 2:** Run; expect FAIL on the `--config` cases.
- [ ] **Step 3:** Implement the flags; write `prompts.json` after Task 8 Step 3 fixes the calendar (use two placeholder-free sample clips until then: `tribe-judah-leads`, `faith-set-apart`).
- [ ] **Step 4:** Run; expect PASS. Confirm that 8 seconds and 9:16 are accepted values on kie.ai's Seedance 2.0 page before relying on them; if the page cannot be read, say so in the README and leave the values for the owner's first dry run.
- [ ] **Step 5:** Commit `feat(shorts): 9:16 Seedance config for value Shorts`.

### Task 7: Skill rules

**Files:** Create `.claude/skills/chozen-social-command/references/youtube-growth.md`; Modify `.claude/skills/chozen-social-command/SKILL.md` (add a "YouTube growth loop" section after "Workflow: campaign experiments", and correct the Shabbat buffer line for YouTube slots to point at the new reference).

Content of the reference, in this order: what the Nov 2026 evidence showed; the cadence, mix, pillar and packaging rules from the spec; the gate ("before any YouTube payload is proposed for ChoZen Publisher, `node youtube/plan-check.js` and `node youtube/dedupe.js --check` must pass; never propose a file or title that has been uploaded before"); the weekly loop (snapshot → scorecard → two changes for next week → next calendar → plan-check → dry-run cost → owner runs `--confirm` and queues); the altered-content label; the hard stops from the spec.

- [ ] **Step 1:** Write the reference and the SKILL.md section.
- [ ] **Step 2:** Verify every command named in the docs runs: `node youtube/plan-check.js; node youtube/dedupe.js --report; node youtube/scorecard.js`.
- [ ] **Step 3:** Commit `docs(skill): YouTube growth loop`.

### Task 8: First run

**Files:** Create `youtube/ledger/snapshots.jsonl`, `youtube/ledger/plan.csv`, `youtube/reports/2026-11-27.md` (or the run date), `youtube/reports/duplicates-<date>.md`.

- [ ] **Step 1:** `node youtube/snapshot.js`. If the fetch fails, fall back to `--file youtube/test/fixtures/feed-2026-11-27.xml` and say so in the report.
- [ ] **Step 2:** `node youtube/dedupe.js --report > youtube/reports/duplicates-<date>.md`.
- [ ] **Step 3:** Write `plan.csv`: 12 rows over two weeks from the next Sunday, one per day Sunday–Thursday plus Friday before 15:00, none Saturday; at least 10 value rows across the five pillars and at most 2 product rows; each with title, hook line, subscribe reason and campaign tag. Scripture references checked for book, chapter and verse. Brand law wording: "fringes", "ribband of blue", "Sabbath", English only.
- [ ] **Step 4:** `node youtube/plan-check.js` must exit 0.
- [ ] **Step 5:** Fill `youtube/shorts/prompts.json` with one clip per value row; run the dry run and record the printed cost in the report. Do not pass `--confirm`.
- [ ] **Step 6:** `node youtube/scorecard.js`; confirm the report shows `not enough data` verdicts and the gaps list.
- [ ] **Step 7:** `node --test youtube/test/` all pass. Commit `feat(youtube): first snapshot, duplicate list and two-week calendar`; push.

## Owner steps after the build (not done by the assistant)

1. Unlist the duplicates in YouTube Studio and remove repeated YouTube entries from the ChoZen Publisher queue.
2. Run the Shorts generation with `--confirm`, add the hook text, and queue from the calendar.
3. Come back in a week for the first real scorecard.
