# Layout Patterns

Mobile-first section stacks. Keep the structure and the single-action discipline;
adapt everything else.

## Breakpoint table (the default — override per project)

| Name | Width | Columns | Max content | Gutter | What changes |
|---|---|---|---|---|---|
| `sm` | <640px | 4 | 100% − 32px | 16px | Everything stacks. Nav → drawer. Tables → cards. One CTA visible. |
| `md` | 640–1023px | 8 | 720px | 24px | Two-up cards. Sidebar still hidden. Filters → collapsible row. |
| `lg` | 1024–1439px | 12 | 1080px | 32px | Persistent sidebar. Tables become real tables. Three-up grids. |
| `xl` | ≥1440px | 12 | 1280px | 32px | Content stops growing; margins absorb the rest. Never full-bleed text. |

Spacing runs on a 4px rhythm: `4 8 12 16 24 32 48 64 96`. Line length caps at
~70 characters regardless of viewport.

## Landing / sales page

1. Hero — one-line promise, one visual, one CTA. No carousel.
2. Who it's for — the line that makes the right person self-identify.
3. Proof — 3 testimonials or logos, faces where possible.
4. How it works — 3 steps, numbered, verbs first.
5. Detail — specs, fit, pricing, whatever the objection is.
6. Offer — the grid or the plan table. Price legible without a click.
7. Close — repeat the CTA and answer the last hesitation next to it.

## Dashboard / admin

Top bar (context + account) → left nav (collapsed to icons under `lg`) → content:
summary tiles → primary table or chart → secondary detail.

- Tiles answer "is anything wrong," not "here is everything."
- The table is the product. Sticky header, sortable columns, a filter row, a
  persistent empty state, and pagination that survives a refresh.
- Every number links to the rows behind it. A stat you can't drill into is decor.
- Row density is a user setting on any table over ~20 rows.

## Portal (tenant, client, customer)

Status first, actions second, history third.

1. Status band — the one thing they logged in to check (balance, request state,
   next date). Plain language, no jargon.
2. Actions — 2–4 buttons, ranked. Pay, request, upload, message.
3. Activity — reverse-chronological, each entry showing what happened and what
   happens next.
4. Documents / details — collapsed by default.

Money and dates need a stated timezone and currency. "Due Friday" is ambiguous;
"Due Fri 5 Sep, 11:59pm AEST" is not.

## Multi-step flow (checkout, onboarding, application)

- Show progress: step N of M, with the steps named.
- One decision per step. Validate on blur, not on submit.
- Never lose input on error or back-navigation.
- Final step summarizes everything and allows edit-in-place.
- The confirmation screen states what happens next and when.

## Email (≤600px)

Preheader → logo → one message → one CTA button → one proof → footer with
unsubscribe. Never two competing CTAs. Bulletproof button built from a table cell,
not an image. Assume images are blocked: the email must still make sense.

## Link-in-bio

Avatar + one-line identity → 3–5 stacked buttons ranked by priority → tiny footer.
Highest-intent link on top. No more than five.

## Empty / error / loading (specify for every data surface)

| State | Must contain |
|---|---|
| Empty (first run) | What this will show, and the one action that fills it |
| Empty (filtered) | "No results for X" plus a clear-filters action — different from first-run |
| Loading | Skeleton matching final layout. No spinner over 400ms of already-drawn content |
| Error | What failed, in plain words; whether data was lost; a retry that actually retries |
| Offline | What still works, what's queued |

An empty state is the most-seen screen of any new product. Design it first, not
last.

## Chart picker

- Trend over time → line. Comparison across items → bar, horizontal when labels
  are long. Part-to-whole → stacked bar, or one donut. Never many pies.
- Label directly; kill the legend where you can.
- Never encode meaning in hue alone — pair with shape, position, or a label, so it
  survives colorblindness and greyscale printing.
- Test in light and dark. Axis and gridlines are `border`, not `text`.
