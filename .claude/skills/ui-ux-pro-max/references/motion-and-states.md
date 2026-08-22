# Motion & States

## State matrix (fill this in — every component × every state)

| Component | Default | Hover | Focus-visible | Active | Disabled | Loading | Error |
|---|---|---|---|---|---|---|---|
| Button (primary) | | | | | | spinner + label, width locked | |
| Button (secondary) | | | | | | | |
| Input | | | | filled | | | message + `aria-describedby` |
| Select / combobox | | | | open | | | |
| Checkbox / radio | | | | indeterminate | | | |
| Card (clickable) | | | | pressed | | skeleton | |
| Table row | | | | selected | | skeleton rows | |
| Nav item | | | | current | | | |
| Toast | | | | | | | |

Rules that catch most bugs:

- **Disabled must still be readable.** Aim for 3:1 minimum. Invisible disabled
  text looks like a rendering failure.
- **Loading buttons keep their width.** Swapping label for spinner reflows the
  layout and users click the wrong thing.
- **Hover is not a state on touch.** Every hover affordance needs a non-hover
  equivalent.
- **Active ≠ selected.** Pressed-right-now and currently-chosen are different and
  need different treatments.
- **Error is a pairing**: the field styling *and* the message. Styling alone is
  invisible to a screen reader.

## Duration and easing

| Motion | Duration | Easing |
|---|---|---|
| Hover, focus, color change | 100–150ms | `ease-out` |
| Dropdown, tooltip, small reveal | 150–200ms | `ease-out` |
| Modal, drawer, sheet in | 200–300ms | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Anything out | 0.7× its in-duration | `ease-in` |
| Page or route transition | 200–300ms | `ease-in-out` |
| Skeleton shimmer | 1200–1600ms loop | `linear` |

- Exits run faster than entrances. A slow dismissal feels like lag.
- Animate `transform` and `opacity`. Animating `width`, `height`, `top`, or
  `margin` forces layout every frame.
- Motion has a job: show where something came from, where it went, or that the
  system heard you. Decorative motion is latency you chose.
- Nothing over 400ms in a flow the user repeats.

## Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Reduced motion means *fewer transforms*, not *no feedback*. Keep opacity fades and
instant state changes; drop slides, parallax, scale, and auto-playing loops.

## Feedback timing

| Wait | Response |
|---|---|
| <100ms | Nothing. It feels instant. |
| 100ms–1s | Local indicator on the control (button spinner) |
| 1s–5s | Skeleton or progress in the content area |
| >5s | Progress with an estimate, and a way to cancel or leave |
| Any destructive action | Confirm first, or complete with a working undo |

Prefer optimistic updates with rollback for actions that almost always succeed —
but only where a rollback is genuinely possible. Never fake success on payments,
submissions, or anything with a legal or financial record.
