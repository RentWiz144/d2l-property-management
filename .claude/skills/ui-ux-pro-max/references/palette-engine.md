# Palette Engine

**There is no default palette. Black-and-gold is not the house style, and neither
is anything else.** Every palette is derived per project and defended in one
sentence. If the user has ruled a palette out, it does not come back — not as an
accent, not as a "nod," not in the dark variant.

## Deriving a palette

### 1. From code that already exists (highest authority)

```bash
grep -rn --include=*.css --include=*.scss -e '--color' -e ':root' . | head -40
find . -name 'tailwind.config.*' -o -name 'theme.*' -o -name 'tokens.*' | head
```

Live tokens beat any brand document. If the codebase already has a system, extend
it; don't relitigate it.

### 2. From an artifact the user gives you

A screenshot, logo, product photo, or URL. Pull the dominant hue, the neutral it
sits on, and one accent. Sample from the *subject*, not the background gradient.
State which pixels you pulled from so the user can correct you.

### 3. From the domain and emotional job

Match the color logic to what the product asks of the user:

| Product does this | Color logic | Why |
|---|---|---|
| Holds money, records, or legal state | Low-chroma neutral surface, one saturated accent reserved for actions | Trust reads as restraint; a loud UI reads as a startup that might vanish |
| Is used all day (dashboards, portals, admin) | Near-neutral background, color used *only* to encode meaning | Saturation everywhere means saturation signals nothing by hour six |
| Sells an identity (apparel, music, events) | High contrast, one confident hue, generous negative space | The product is the color; the UI gets out of the way |
| Handles stress (health, disputes, arrears) | Warm neutrals, desaturated accent, no red except for true danger | Red on a rent-overdue screen reads as a threat |
| Serves kids or education | Higher chroma, multiple accents, but hold text contrast at AAA | Playful surfaces still need readable text |

### 4. Ask

If nothing above applies, offer two or three distinct directions with a one-line
rationale each. Never invent brand hex and present it as settled.

## Role structure

Name colors by **role**, never by hue. `--accent`, not `--gold`. Roles survive a
rebrand; hue names become lies the moment the palette changes.

The minimum set:

```
surface            page background
surface-raised     cards, modals, sheets
surface-sunken     wells, code blocks, table stripes
border             hairlines, dividers, input outlines
text               primary body and headings
text-muted         secondary, captions, timestamps
text-inverse       text on accent fills
accent             primary action, active nav, focus ring
accent-hover       accent one step darker (light mode) or lighter (dark)
accent-subtle      accent at ~10% for tinted backgrounds
success / warning / danger   status only, never decoration
```

Two rules that prevent most palette failures:

- **Status colors are not brand colors.** If `danger` is also the CTA color, users
  cannot tell "buy" from "delete."
- **The accent is a budget.** One accent, spent on the single primary action per
  screen. A second accent needs a written justification.

## Verified starting points

Four directions that are *not* black-and-gold, each measured with
`scripts/contrast.py`. Use them as departure points, not presets — retune the hue
to the project.

### Slate & Teal — software, portals, anything used daily

```
light:  surface #ffffff  text #0f172a (17.85:1)  text-muted #475569 (7.58:1)
        accent #0e7490 (5.36:1)  text-inverse #ffffff on accent (5.36:1)
dark:   surface #0f172a  text #e2e8f0 (14.48:1)  text-muted #94a3b8 (6.96:1)
        accent #22d3ee (9.88:1)
```
Cool neutral that disappears behind data. Teal reads as active without the
"unread notification" urgency of blue.

### Sand & Clay — property, hospitality, anything with a human on the other end

```
light:  surface #faf7f2  text #292524 (14.19:1)  text-muted #57534e (7.14:1)
        accent #9a3412 (6.84:1)  text-inverse #ffffff on accent (7.31:1)
dark:   surface #1c1917  text #f5f5f4 (16.03:1)  text-muted #a8a29e (6.93:1)
        accent #fb923c (7.73:1)
```
Warm paper instead of clinical white. Terracotta is warm without being an alert.

### Indigo & Rose — consumer, launches, editorial

```
light:  surface #ffffff  text #1e1b4b (15.99:1)  heading #4c1d95 (10.95:1)
        accent #be123c (6.29:1)  text-inverse #ffffff on accent (6.29:1)
dark:   surface #1e1b4b  text #e0e7ff (12.98:1)  accent #fda4af (8.45:1)
```
Deep indigo carries the weight black usually carries, with more life in it.

### Forest & Bone — grounded, premium, non-metallic

```
light:  surface #f8f7f4  text #1c2b24 (13.80:1)  accent #15803d (4.68:1)
        text-inverse #ffffff on accent (5.02:1)
dark:   surface #14201a  text #e7e5e4 (13.37:1)  accent #4ade80 (9.63:1)
```
Note the light accent at 4.68:1 — passes AA for normal text but has little
headroom. Darken toward `#166534` if it carries small text.

## Dark mode

Specify it up front; retrofitting produces mud.

- Do not invert. Dark surfaces need *lighter, less saturated* accents — a hue that
  sings on white will vibrate on near-black.
- Elevation is lightness, not shadow. `surface` → `surface-raised` gets lighter as
  it rises. Shadows barely read on dark.
- Never pure `#000` as the app surface. `#0f172a`–`#1c1917` range holds depth;
  pure black flattens every shadow and makes OLED smearing obvious on scroll.
- Recheck every pair. A palette that passes light does not automatically pass dark
  — that is the whole reason the checker exists.

## Running the checker

```bash
python3 scripts/contrast.py "#0e7490" "#ffffff"          # one pair
python3 scripts/contrast.py --pairs pairs.txt            # a whole palette
python3 scripts/contrast.py --best "#ffffff" "#2563eb" "#60a5fa" "#1e3a8a"
```

In `--pairs`, one `fg bg [label]` per line; `# ` at line start or `//` opens a
comment. Exit code is 1 if any pair fails AA normal text, so it gates CI.

Paste the real output into the spec. Never write "WCAG AA compliant" without the
numbers next to it.
