# WORKSHEETS: fill these in before Day 1, keep them open all month

## Worksheet 0 · Design brief + margin (Z0)
| Field | Answer |
|---|---|
| The piece | |
| Different because (1) / (2) / (3) | |
| Scripture behind it | |
| Who it's for | |
| Colorway(s), max 2 | |
| Brand-law gate passed? (Y/N + who checked) | |
| Unit cost (fabric + make + fringes/ribband + tag + packaging) | $ |
| Price | $ |
| Gross margin = (price − unit cost) ÷ price | % (target 60–70, floor 50) |
| Supporting pieces (dress the customer) | |
| Digital companion (free) / add-on (paid $9–19) | |
| Sample ordered / arrives | |

## Worksheet 1 · Drop details (everything the texts, emails, and page ask for)
| Field | Answer | Field | Answer |
|---|---|---|---|
| Brand | ChoZen | Sample arrives | |
| The piece | | Drop date (Sun–Thu) | |
| Different because (1) | | Drop time + time zone | ET |
| Different because (2) | | Pre-order window (7–10 days) closes | |
| Different because (3) | | Early-access link | |
| Price | | Size chart link | |
| Sizes | S → 6XL | Numbered run cap (N) | |
| Colors | | Ship date range (promised) | |
| Greeting (Peace / Shalom) | | Pre-order? | **YES (hero rule)** |

Run `node docs/chozen-system/tools/drop-calendar.js --drop YYYY-MM-DDTHH:MM --window N`. No "!!" lines allowed.

## Worksheet 2 · Size split
**The math:** pieces for a size = (votes for that size ÷ total votes) × total pieces. Round smalls down.
- From votes: `node tools/size-split.js --pieces 60 --votes S=6,M=9,L=14,XL=12,2XL=8,3XL=4`
- No votes yet: `node tools/size-split.js --pieces 60` (CPO curve 1:1:2:3:2:1)
- After the window closes: `node tools/size-split.js --preorders S=..,M=.. --buffer 10`

| Size | Votes | % | Pre-orders | Buffer | MAKE |
|---|---|---|---|---|---|
| S | | | | | |
| M | | | | | |
| L | | | | | |
| XL | | | | | |
| 2XL | | | | | |
| 3XL | | | | | |
| 4XL+ (on demand) | | | | | |
| **Total** | | 100% | | ≤10% | |

## Worksheet 3 · Drop-day checklist
**Day before:** ☐ run caps in inventory match the plan ☐ real test order placed + refunded ☐ every link tested on a phone ☐ texts + emails scheduled, ET checked, none in Shabbat ☐ ship window in bold in all 5 places
**1 hour before:** ☐ countdown on story ☐ phone charged, packing area clear ☐ DMs open ☐ inbox macros loaded
**Drop time:** ☐ unlock for the list ☐ Text 4 + Email 5 out ☐ story: "Live for the list"
**+15 min:** ☐ open to everybody ☐ Text 5 out ☐ story: "Open to everybody"
**A few hours later:** ☐ Text 6 + Email 6 only if true ☐ screenshot sales for content ☐ answer every DM
**Next morning:** ☐ Text 7 thank-you ☐ thank-you story ☐ in-stock/POD orders into Monday's batch
**Window close:** ☐ −24h reminder (if open) ☐ window closed on time ☐ orders exported → Worksheet 2

## Worksheet 4 · Packing checklist (every box)
☐ Piece checked against the brand-law gate ☐ numbered tag matches the order ☐ "Why the Fringes" card/QR ☐ "Why are you ChoZen?" testimony card ☐ next-drop list QR ☐ care card ☐ label matches the order ☐ tracking uploaded (Etsy orders: through Etsy)

## Worksheet 5 · Debrief scorecard → see [Z7](Z7-debrief.md#2-fill-the-scorecard-worksheet-5)

## Notes sheet (one row per person)
| Name | @handle | Size | Color | Fit | Signed up? | Source | Number # | Notes |
|---|---|---|---|---|---|---|---|---|
