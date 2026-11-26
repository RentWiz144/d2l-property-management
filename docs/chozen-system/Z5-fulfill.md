# Z5 · MAKE & FULFILL — Close the window, make the run, ship it right

**Owner:** Son (fulfillment sessions) · Wife (Etsy + customer care) · Amoz (production QC) · **Skills:** `chozen-coo`, `chozen-etsy-ops`

> What breaks first in a successful drop: inventory accuracy → founder capacity → the inbox → uneven size sell-through. Plan for all four before launch hour.

## A. Lock the run (window close day)
1. Export pre-orders by size/color from Shopify (Etsy orders sync tagged `Etsy`; count them once).
2. Size the run from **real orders plus a buffer of 10% or less**:
   ```bash
   node docs/chozen-system/tools/size-split.js --preorders S=4,M=9,L=14,XL=11,2XL=6,3XL=3 --buffer 10
   ```
   The buffer covers defects and exchanges only (no restock on drop items). The tool caps it at 10% and never puts buffer on S or 3XL+ (CPO: never stock those speculatively); those are made to order only.
3. Assign numbers: order sequence → numbered tag (e.g., 001/N, N = final run). Log them in the notes sheet and email each buyer their number (template: "your number", messages.md).
4. Place production. Get a written completion date. **If it's later than the promised ship window → same-day delay notice (messages.md) with a cancel option** (learned during Shabbat → first thing after Saturday sundown). Hard stop.

## B. Make it (hand-finished in Detroit)
- QC every piece against the brand-law gate: fringes, **blue** ribband/ribbon, hem placement, modest cut, tag number.
- Photograph 5–10 pieces being finished. That's your Sunday update content.
- Keep sending the **Sunday update email** until every order ships.

## C. Ship it: 3 batch sessions a week (Mon · Wed · Thu), 60–90 min, seated station
1. Shopify → Orders → filter unfulfilled → bulk-buy labels with Shopify Shipping.
2. Pack per the **packing checklist** (Worksheet 4): piece + numbered tag · "Why the Fringes" card/QR · "Why are you ChoZen?" testimony insert (photo + story ask) · next-drop list QR · care card.
3. Schedule a free USPS pickup. Nobody drives to the post office.
4. Etsy orders: tracking uploads through Etsy (it protects against "not received" cases). See `chozen-etsy-ops`.
5. POD / extended sizes: confirm they were routed to the POD provider; tracking flows back to Shopify.
6. **No sessions and no marketing sends from Friday sundown to Saturday sundown.** Automatic carrier/transactional notices follow Amoz's store-open vs. fully-closed decision (README Law 1).

## D. Customer care (Wife, off macros)
Gorgias Starter (or the Shopify inbox) + 10 macros: order status · pre-order ship date · exchange · return · restock/waitlist · shipping delay · damaged item · wrong address · event question · wholesale. Answer within 24h (Etsy Star Seller counts this). Every macro is humanized.

## E. Inventory truth
- One ledger: Shopify (online + Etsy sync + POS at events).
- Count OUT/IN around every drop and event. Monthly full count.
- 90-day deadstock flag → move it through live events as a "market special," never a public markdown.

## When to upgrade
3PL only at a sustained 300+ orders/month. Until then, self-fulfill the hero and POD the long tail.

**Exit gate:** every order shipped with tracking inside the promised window, zero open "where's my order" tickets older than 24h.
