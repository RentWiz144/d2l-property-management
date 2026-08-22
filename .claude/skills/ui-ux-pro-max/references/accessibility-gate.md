# Accessibility Gate

Run before delivering. This is a gate, not a checklist to reference later —
anything that fails gets fixed before handoff.

## Contrast: prove it

```bash
python3 scripts/contrast.py --pairs palette-pairs.txt
```

Thresholds (WCAG 2.2):

| Content | AA | AAA |
|---|---|---|
| Normal text (<18.66px bold / <24px) | 4.5:1 | 7:1 |
| Large text (≥18.66px bold / ≥24px) | 3:1 | 4.5:1 |
| UI components, icons, focus rings, chart marks | 3:1 | — |

Every pair you specify gets measured and the number goes in the spec. "Meets AA"
without a ratio is an unverified claim.

Pairs people forget: placeholder on input, disabled label on disabled fill, focus
ring on *both* surfaces, text over image or gradient at its lightest point, muted
text on `surface-raised` (not just `surface`), chart series against gridlines.

## Focus

- Visible focus on every interactive element. Never `outline: none` without a
  replacement.
- The ring needs 3:1 against the adjacent surface. A dark ring on a dark card is
  no ring.
- Use `:focus-visible` so mouse users don't get rings on click but keyboard users
  always do.
- Tab order follows visual order. If CSS reorders content, the DOM must match.
- Modals trap focus, return it on close, and close on `Esc`.

## Targets and motion

- ≥24×24px CSS minimum (WCAG 2.2 Target Size Minimum); ≥44×44px for touch-primary.
- Spacing counts: adjacent small targets need padding between them, not just size.
- Every animation respects `prefers-reduced-motion: reduce`.
- Nothing flashes more than 3×/second.

## Semantics

- One `h1` per page; heading levels never skip.
- Every input has a `<label>`. Placeholder is not a label — it vanishes on type.
- Buttons that navigate are links; links that act are buttons.
- Icon-only controls carry `aria-label`.
- Errors: `aria-live="polite"`, tied to the field with `aria-describedby`, and
  written as what to do — "Enter a date after today," not "Invalid input."
- Decorative images get `alt=""`; meaningful ones get the sentence a sighted user
  infers.

## Content

- Color alone never carries meaning. Add an icon, a label, or a pattern.
- Line length ~70 characters; body line-height ≥1.5.
- Layout survives 200% zoom and 320px width without horizontal scroll.
- No text baked into images — it can't be zoomed, translated, or read aloud.

## Final sweep

- [ ] Every pair measured, numbers in the spec
- [ ] Keyboard-only path through the primary flow, start to finish
- [ ] Focus visible at every stop, contrast-checked on both surfaces
- [ ] Light and dark both pass
- [ ] Empty, loading, and error states announced to screen readers
- [ ] 200% zoom and 320px width hold up
- [ ] Nothing meaningful conveyed by hue alone
