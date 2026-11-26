---
name: chozen-autopost
description: |
  The ChoZen automated posting system. Plans, writes, Shabbat-checks, brand-checks, and schedules social content across Instagram, TikTok, Facebook, Threads, and YouTube — replacing Metricool with Postiz as the posting engine. Use for: scheduling a post or a week of posts, building a content calendar, turning one idea into platform-native versions, checking whether a time violates Shabbat, auditing an existing queue, or reading last week's performance. Trigger on: "schedule this", "post this", "queue it up", "build my week", "content calendar", "is this Shabbat safe", "check my queue", "how did last week do", "autopost", "cross-post", "post to IG and TikTok", "what should I post". Also triggers on any request that would put content on a ChoZen social account.
compatibility: |
  - REQUIRES chozen-humanizer — every caption passes through it before scheduling. Non-negotiable.
  - Pairs with chozen-social-optimizer (hooks, CTAs, profile strategy)
  - Pairs with chozen-generate / chozen-design-audit (the media being posted)
  - Pairs with chozen-cmo (what to post and why), chozen-cold-conversion (mediator content)
  - Defers to chozen-design-audit for final SHIP / DON'T SHIP on any visual asset
---

# ChoZen Autopost

## Purpose

One idea in. Five genuinely different, platform-native posts out. Every one of
them Shabbat-checked against real computed sundown, Brand-Law-checked, and
humanized before a single thing is scheduled.

This skill replaces Metricool. It is the posting layer of the ChoZen AI staff.

## The four laws

These are gates, not preferences. Each one blocks the pipeline when it fails.

**LAW 1 — Shabbat is computed, never remembered.**
Nothing schedules between Friday sundown and Saturday sundown. Sundown is
calculated for Detroit on the actual date, because it moves from 9:10 PM in
July to 4:59 PM in December. Run the guard. Never eyeball it.

**LAW 2 — No caption is posted to two platforms unchanged.**
If the same words go to Instagram and TikTok, the work isn't finished. See
`references/platform-specs.md`.

**LAW 3 — Brand Law clears before scheduling, not after.**
Fringes, ribband of blue, modesty, pronunciation. See
`references/brand-law-preflight.md`. A failed check stops the post.

**LAW 4 — Everything passes chozen-humanizer.**
No AI-clean prose reaches a ChoZen account. Humanize last, after the platform
adaptation, so the rhythm survives.

---

## LAW 1: The Shabbat guard

### Run it every time

```bash
# One timestamp
python3 scripts/sundown_guard.py check "2026-11-27T18:00:00"

# A whole batch — one ISO timestamp per line
python3 scripts/sundown_guard.py audit schedule.txt

# Does a recurring weekly slot break Shabbat at any point in the year?
python3 scripts/sundown_guard.py scan-recurring 18:00 --from 2026-08-01 --to 2027-08-01

# Where does a blocked post go instead?
python3 scripts/sundown_guard.py next-safe "2026-11-27T18:00:00"
```

Exit code `1` means blocked. Wire it into anything that schedules; a violation
must stop the run rather than publish.

Pure standard library — no pip install, no network. Accurate to within 20
seconds of reference astronomical libraries across a two-year span.

### The trap this exists to catch

A fixed Friday clock time is safe for most of the year and then quietly isn't.
A recurring **Friday 6:00 PM** slot in Detroit violates Shabbat on **16
consecutive Fridays, from November 6 through February 19**. Nothing changes on
the calendar. Sundown just walks backward past the slot.

This is exactly the kind of thing that a human running a business with three
product lines will not catch in week nine. That's why it's code.

### Buffers

Defaults at the top of the script:

- `CANDLE_LIGHTING_BUFFER_MIN = 18` — Shabbat begins 18 min *before* Friday sundown
- `HAVDALAH_BUFFER_MIN = 42` — Shabbat ends 42 min *after* Saturday sundown

Change them to match your practice. They're deliberately conservative on both
ends.

### Motzei Shabbat is a posting window

When the guard moves a post, it lands it just after havdalah rather than
punting to Sunday. Saturday night is live audience time and giving it away
costs reach. Scheduling *in advance* for a post that fires after sundown
Saturday is fine — the work happens before Shabbat, the machine publishes
after it ends.

---

## LAW 2: Platform-native, always

### The workflow

**Step 1 — Take the idea, not the caption.** One core message. One Scripture
if it's a Word post. One product tie-in at most.

**Step 2 — Write each platform separately.** Not "adapt." Write. Open
`references/platform-specs.md` and follow the spec for each network. The hook
changes, the length changes, the hashtag strategy changes, the CTA changes.

**Step 3 — Time each platform separately.** Different networks peak at
different hours. Don't fire all five at once.

**Step 4 — Run the Shabbat guard on every timestamp.**

**Step 5 — Brand Law pre-flight on every asset.**

**Step 6 — chozen-humanizer on every caption.**

**Step 7 — Schedule.** Draft mode first when the media is new.

### What "not native" looks like

The failure mode to avoid, taken from a real ChoZen queue:

> The same 800-character caption with the same 12 hashtags, published to
> Facebook at 10 AM, Instagram at 2 PM, and TikTok at 6 PM. Three platforms,
> one piece of writing, three times the fatigue and none of the fit.

TikTok caption real estate is a hook and a line. Facebook barely indexes
hashtags. Instagram rewards the first 125 characters before the fold. Threads
punishes anything that reads like a press release. A caption that serves all
four serves none.

---

## LAW 3: Brand Law pre-flight

Before anything schedules, run `references/brand-law-preflight.md`. Short
version — these block a post:

- **Male tops** — fringes with a ribband of blue on the full lower hem
  (Numbers 15:38ff). **Exception:** athletic / windbreaker line carries none.
- **Female models** — maxi skirt or dress only. Hem at the top of the foot.
  Fringes and blue ribbon at the hem. Never pants, never short, never tight
  (1 Timothy 2:9).
- **Fringes** may coordinate with the outfit. **The ribbon is always a hue of blue.**
- **Audio** — "ChoZen" is pronounced exactly like the ordinary word "chosen."
  Never "cho-ZEN." Listen to the file. Do not assume.
- **Claims** — every factual claim in the copy is checkable. No hype.

For a finished visual asset, hand off to `chozen-design-audit` for the actual
SHIP / DON'T SHIP verdict. This pre-flight catches the Brand Law violations
that are cheapest to fix before scheduling.

---

## LAW 4: Humanizer, last

Run `chozen-humanizer` on the final caption for each platform, *after*
platform adaptation. Adapting after humanizing sands the voice back off.

---

## The posting engine

Metricool is cancelled. The engine is **Postiz** — open source, 28+ platforms,
self-hostable or cloud, and it has a real CLI, which matters because a CLI
means this skill can drive it without a browser.

Setup, network reconnection, and the Metricool migration are in
`references/engine-setup.md`. Read it before the first run.

### Core commands

```bash
export POSTIZ_API_KEY=...          # required, once per shell

postiz integrations:list           # get integration IDs — do this first, always
postiz upload media.jpg            # ALWAYS upload before posting; IG/TikTok/YT reject external URLs
postiz posts:create -c "text" -m "<uploaded-url>" -s "2026-08-10T14:00:00Z" -i "<id>"
postiz posts:list                  # what's queued
postiz analytics:platform <id> -d 30
```

### Two things that will bite

1. **Media must be uploaded to Postiz first.** Instagram, TikTok, and YouTube
   reject external URLs outright. Upload, capture the returned path, then use
   that path in `-m`.
2. **Postiz schedule times are UTC (`Z`).** The Shabbat guard works in
   America/Detroit. Convert deliberately — an off-by-four-hours error in
   November puts a post inside Shabbat. Guard in local time, convert to UTC as
   the last step, then re-verify.

```bash
# Convert Detroit local -> UTC for Postiz, safely
python3 -c "
from datetime import datetime
from zoneinfo import ZoneInfo
local = datetime.fromisoformat('2026-11-27T20:30:00').replace(tzinfo=ZoneInfo('America/Detroit'))
print(local.astimezone(ZoneInfo('UTC')).strftime('%Y-%m-%dT%H:%M:%SZ'))
"
```

### Engine independence

Only `references/engine-setup.md` knows about Postiz. The four laws, the
platform specs, and the Brand Law pre-flight are engine-agnostic on purpose —
if the engine changes again, one reference file changes and the rest stands.

---

## Weekly performance read

Run this once a week, outside Shabbat. Plain English, tied to the number.

```bash
for id in $(postiz integrations:list | jq -r '.[].id'); do
  echo "=== $id ==="
  postiz analytics:platform "$id" -d 7
done
```

Report in this shape — five lines, no dashboard:

1. **What moved.** The single best-performing post and the honest reason.
2. **What died.** The worst, and whether it was the hook, the timing, or the offer.
3. **Channel read.** Which network is actually earning its slot.
4. **The number.** Where the week landed against $5,000/month by October 2026.
5. **One change.** Exactly one thing to do differently next week. Not five.

**Say when you don't know.** Social analytics do not show which post produced a
sale unless the link is tracked. If attribution isn't there, say so plainly and
propose tracking it rather than implying a post drove revenue.

---

## Standing decisions for ChoZen

**Networks:** Instagram (`theechozencollection`), TikTok
(`theechozencollection`), Facebook, Threads (`chozen_unlimited`), YouTube
(`UCaeeKNjKXVfHay29EJasrNw`).

**Threads and YouTube were connected and receiving zero posts.** Two paid-for
channels sitting idle. Threads costs almost nothing to feed — it takes the
conversational cut of an Instagram caption. Fix this before adding any new
channel.

**Cadence:** three posts a day across five networks is not the same as three
pieces of content. One piece of content, adapted five ways, spread across the
day beats three identical posts.

**Timing** — from Metricool's own historical read on this account, Detroit
time. Re-derive from live analytics once Postiz has 30 days of history; treat
these as the starting position, not gospel:

| Day | Strong window |
|---|---|
| Sunday | 12–1 PM (peak), 7–8 PM |
| Monday | 8 PM (peak), 11 AM, 4 PM |
| Tuesday | 12 PM (peak), 7 PM, 3–4 PM |
| Wednesday | 5 PM, 4 PM |
| Thursday | 5 PM, 9 PM |
| Friday | 8 PM — **verify against sundown every single week** |
| Saturday | Blocked until havdalah, then 9 PM+ in summer |

The 10 AM slot that was in heavy rotation is one of the *weaker* windows on
most days. Move it.

---

## Working rules

- **Draft first.** New media schedules as a draft until it's been seen once.
- **Never schedule past 30 days.** Long queues rot; a drop changes and 40
  queued posts now contradict it.
- **Every session ships something.** A plan that isn't queued didn't ship.
- **Say what got blocked.** If the Shabbat guard or Brand Law killed a post,
  report it plainly with the replacement time. Don't silently reschedule.

## Files

| Path | What it holds |
|---|---|
| `scripts/sundown_guard.py` | The Shabbat gate. Runnable, tested, no dependencies. |
| `references/platform-specs.md` | Per-network native rules — length, hooks, hashtags, CTA, format |
| `references/brand-law-preflight.md` | The blocking checklist |
| `references/engine-setup.md` | Postiz setup + Metricool migration + queue rescue |
| `templates/post-plan.json` | The one-idea-to-five-platforms working file |
