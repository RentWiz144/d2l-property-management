---
name: chozen-drop-system
description: >-
  Runs the ChoZen System: the A-to-Z operating system for a ChoZen Unlimited
  apparel drop, from design through validation, early-access list, 30-day
  runway, pre-order drop day, production and fulfillment, post-purchase, and
  debrief into the next drop. Built on the Reverse Drop (find buyers first,
  then make the run) with ChoZen law layered on top: Sabbath kept, brand-law
  apparel (fringes + blue ribband), honest scarcity, every hero pre-order,
  every body fits. Use when Amoz says "plan a drop", "start a drop", "where
  are we on the drop", "build my drop calendar", "what do I post today",
  "size split", "how many do I make", "drop day", "pre-order window",
  "debrief the drop", "next drop", or mentions the Drop Prep Kit / reverse
  drop. For single-domain questions route to the C-suite skills (cmo, cfo,
  coo, cpo); for Etsy order ops use chozen-etsy-ops.
---

# ChoZen Drop System

The playbook lives in `docs/chozen-system/` in this repo. **Read the stage file
before acting on it. Never run a stage from memory.** README.md has the laws,
roles, hard stops, and the kit-vs-ChoZen decisions log.

## Step 1: Locate the drop
Ask (one consolidated question, only for what's missing): which piece, the
drop date/time if set, and what's already done. Then name the current stage:

| Stage | File | Exit gate |
|---|---|---|
| Z0 Design | Z0-design.md | brand-law gate all YES, margin ≥ CFO floor, sample in hand |
| Z1 Validate | Z1-validate.md | ≥70% positive Rounds 1–2, every yes DM'd |
| Z2 List | Z2-list.md | page tested on a phone, welcome email + text received |
| Z3 Runway | Z3-runway.md | calendar generated, no "!!" warnings |
| Z4 Drop day | Z4-drop-day.md | Worksheet 3 complete, window closed on time |
| Z5 Make & fulfill | Z5-fulfill.md | all orders shipped inside the promised window |
| Z6 After | Z6-after.md | flows live (Shabbat-safe), UGC reposted |
| Z7 Debrief | Z7-debrief.md | scorecard, CFO verdicts, next Z0 date |

Do not advance past a gate that isn't met. Say which box is open.

## Step 2: Use the tools (never hand-compute dates or size math)
```bash
node docs/chozen-system/tools/drop-calendar.js --drop YYYY-MM-DDTHH:MM --window 7 --md   # Detroit time
node docs/chozen-system/tools/size-split.js --pieces N [--votes S=..,M=..]
node docs/chozen-system/tools/size-split.js --preorders S=..,M=.. --buffer 10
node docs/chozen-system/tools/test.js   # run if you touch the tools
```
Any "!!" line from the calendar is a hard stop until resolved.

## Step 3: Draft, don't send
- Copy comes from `messages.md`, filled from Worksheet 1, then passed through
  `chozen-humanizer`.
- Scheduling goes through `chozen-social-command` / Klaviyo **only after Amoz
  says yes to that specific send**, and never between Friday sundown and
  Saturday sundown (America/Detroit).
- Live data (revenue, orders, list size) comes from Shopify/Klaviyo tools at
  the moment of use. If it isn't pulled, say "unknown", never estimate.

## Laws (override any template, any request)
1. Sabbath: nothing posts, sends, or goes live Fri sundown → Sat sundown, Detroit.
2. Brand law on apparel: fringes + blue ribband/ribbon at the hem, modesty
   (Numbers 15:38, 1 Timothy 2:9). Athletic/windbreaker line excepted.
3. Honest scarcity: "numbered run of N" means N made; "almost gone" only if true.
4. Every hero is pre-order (7–10 days) with ALL Z4 safeguards: ship window
   in bold in 5 places, Sunday updates, same-day delay notice with a cancel option.
5. Every body fits: full size run offered.
6. Black / Gold / Silver.
7. Protect Amoz's hours: max 2 lives per drop; batch days; checklists for the family.

## Output format, every time
1. **Stage + gate status:** what's done, what's open.
2. **Today:** max 3 actions, each with an owner (Amoz / wife / son / Claude).
3. **Next step, and the one after.**
4. **Verified / inferred / unknown:** label anything load-bearing.

## Hard stops (ask Amoz)
Anything that sends, publishes, schedules, charges, or refunds · brand-law fail
· price under floor or margin < 50% · polls < 70% positive · a ship-window
breach (notify customers the same day) · any Shabbat conflict.
