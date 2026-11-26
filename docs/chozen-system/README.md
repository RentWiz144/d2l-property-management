# THE CHOZEN SYSTEM
### Point A to Point Z: design → drop → fulfillment → the next drop

ChoZen Unlimited (Detroit): scripture-rooted, size-inclusive athleisure, digital products, and POD art.
This is how a ChoZen piece goes from an idea to someone's front door, and how that buyer becomes first in line for the next one.

It's built on the *Reverse Drop* method from "The Drop Prep Kit" (Elloheim / Drop and Scale): **find the buyers first, then make the run.** It's rebuilt around who we are: Sabbath kept, brand law obeyed, every claim checkable, every body fits, and a 3-person team that runs on checklists, not heroics.

> *"But ye are a chosen generation, a royal priesthood, an holy nation, a peculiar people."* (1 Peter 2:9)

---

## The map

| Stage | Name | One job | Exit gate (you can't move on until…) |
|---|---|---|---|
| **Z0** | [Design](Z0-design.md) | Make one piece worth wanting | Brand-law gate passed, sample on a body, price clears CFO margin |
| **Z1** | [Validate](Z1-validate.md) | Find out if it sells before you pay for it | ≥70% positive on Round 1–2 polls, every "yes" DM'd, notes sheet live |
| **Z2** | [The List](Z2-list.md) | Turn every "yes" into a name, email, and number | Page tested on your phone, welcome email + text received |
| **Z3** | [30-Day Runway](Z3-runway.md) | Get it seen, build the list, count it down | Calendar generated with real dates, zero Shabbat conflicts |
| **Z4** | [Drop Day](Z4-drop-day.md) | List first, public 15 minutes later, pre-order window open | Worksheet 3 fully checked |
| **Z5** | [Make & Fulfill](Z5-fulfill.md) | Close the window, make the run, ship it right | Every order shipped with tracking, inside the promised window |
| **Z6** | [After the Order](Z6-after.md) | Turn buyers into repeat buyers and witnesses | Post-purchase + abandoned-cart flows on, UGC reposted |
| **Z7** | [Debrief → Next](Z7-debrief.md) | Learn, keep the winners, cut the rest, start the next drop | Scorecard filled, CFO verdicts issued, next Z0 date set |

Supporting files: [Worksheets](worksheets.md) · [Message Library](messages.md) · [`tools/`](tools/) (calendar + size math) · Skill: `.claude/skills/chozen-drop-system` · Branded PDF: [`pdf/ChoZen-System.pdf`](pdf/ChoZen-System.pdf)

---

## The Laws (these beat every template in this system)

1. **Sabbath.** Nothing posts, sends, goes live, or runs on a schedule from Friday sundown to Saturday sundown, Detroit time. Drops happen Sunday–Thursday. Pre-order windows close Sunday–Thursday. `tools/drop-calendar.js` enforces this; don't override it.
2. **Brand law (apparel).** Men's shirts and jackets carry fringes plus a blue ribband on the lower hem (Numbers 15:38), except the athletic/windbreaker line. Women's maxi skirts and dresses carry fringes plus a blue ribbon at the hem, modest per 1 Timothy 2:9. The ribbon is always a hue of blue.
3. **Never promise what you can't prove.** If you say "numbered run of 75," make 75. "Almost gone" only when it's true. Faith audiences punish dishonesty hardest, and the list remembers.
4. **Every hero is pre-order.** Fringed hero pieces sell in a 7–10 day numbered pre-order window. Customers fund the run, extended sizes carry no inventory risk, and we never mark down. *(Owner decision, Nov 2026. The kit's warning still applies: pre-orders cost its author chargebacks. The Pre-Order Safeguards in Z4 and Z5 are mandatory, not optional.)*
5. **Every body fits.** The full size run is offered from smallest to 6'5"/275. Extended sizes are never an afterthought.
6. **Black / Gold / Silver.** Chrome wordmark and C-checkmark, undistorted. One seasonal accent at most. *(The orange #FF6B35 token in `chozen-design-system` conflicts with brand law and should be removed there.)*
7. **Humanize.** Every customer-facing word passes through `chozen-humanizer` before it goes out. No AI-clean prose.
8. **Protect Amoz's hours.** 4–6 good hours a day. Max 2 lives per drop, batch days built in, and anything done twice gets a checklist so the family can run it.

## Who does what

| Person | Owns | Never hands off |
|---|---|---|
| **Amoz** | Design approval, pricing, brand voice, the lives, key relationships | Final say on every gate |
| **Wife** | Etsy store ops, customer care (Gorgias macros), event table | — |
| **Son** | Batch fulfillment sessions, labels, USPS pickup, content filming | — |
| **Claude (skills)** | Drafts, schedules, math, checklists, reports | Never sends, schedules, or publishes without Amoz's yes |

Skill routing inside the system: `chozen-brandkit` (Z0 look) · `chozen-cpo` (Z0 product/size) · `chozen-cfo` (Z0 price, Z7 verdicts) · `chozen-cmo` (Z1–Z3 list) · `chozen-social-command` (scheduling + tracking) · `chozen-coo` (Z4–Z5 ops) · `chozen-etsy-ops` (Etsy orders) · `chozen-humanizer` (all copy) · `chozen-ceo` (Z7 scoreboard).

## Hard stops (stop and ask Amoz)

- Anything that would go live, send, schedule, charge, or refund.
- A design that fails the brand-law gate.
- A price under the CFO floor ($30 tee, $40–55 fringed/numbered) or under 50% gross margin.
- Round 1–2 polls under ~70% positive. Fix the sample, don't push the drop.
- A production delay that will break the promised ship window. Customers get notified the same day (see Z5).
- Any calendar item that lands inside Shabbat.

## What changed from the Drop Prep Kit, and why

| Kit says | ChoZen System says | Why |
|---|---|---|
| Post a poll every day, same time | Same, but Saturdays are dark; the tool moves Saturday tasks | Sabbath law |
| 5 lives in 30 days | 2 lives, plus 2 batch days | Amoz's capacity |
| "Order 50 after the votes" | Votes size the **pre-order window**; the run is sized from real orders plus a buffer of 10% or less | Owner decision: every hero is pre-order |
| "I don't recommend pre-orders as your default" | Pre-order is the default for heroes, **with mandatory safeguards** (ship window in bold in 5 places, Sunday updates, a delay notice with a cancel option) | Keep the kit's lesson and the CPO's model |
| No votes yet? 10 of each size | No votes yet? Use the CPO curve 1:1:2:3:2:1 (S–3XL), extended sizes on demand | 2XL/3XL are always underestimated |
| Influencers under 100K | Faith / fitness / plus-size **nano** creators (1K–50K), free product, they pick their piece | CMO playbook, testimony converts |
| Generic retention emails | Plus a free "Why the Fringes" digital guide with every hero, and a $9–19 digital add-on on the thank-you page | Margin plus conviction |
| Shopify only | Shopify + Etsy (synced, tagged `Etsy`) + Shopify POS at events, one inventory ledger | How we actually sell |

## Verified vs. inferred vs. unknown

- **Verified (from sources):** kit method and copy (Drop Prep Kit pp. 1–40); ChoZen laws, team, targets, and channel facts (ChoZen CEO/COO/CPO/CMO/CFO, brandkit, and Etsy-ops skills); Detroit sunset math (tested against published times, within 3 minutes).
- **Inferred:** exact send times, the window lengths that work best for our list, and creator counts. These get tuned in Z7 from real data.
- **Unknown until pulled:** current monthly revenue, list size, and repeat rate. Z7 pulls them live from Shopify/Klaviyo; nothing in this system assumes them.
