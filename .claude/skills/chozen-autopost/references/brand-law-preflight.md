# Brand Law Pre-Flight

Run before scheduling. Any **BLOCK** stops the post. No exceptions, no
"we'll fix it in the next one."

This catches the violations that are cheapest to fix *before* anything is
queued. For the full SHIP / DON'T SHIP verdict on a finished visual asset,
hand off to `chozen-design-audit`.

---

## 1. Garment law — male models

**Numbers 15:38ff.** Any ChoZen shirt or jacket on a male model carries:

- [ ] Brush fringes sewn around the **entire lower hem** — not partial, not decorative on one side
- [ ] A **ribbon of blue** on top of the fringes
- [ ] Fringes visible and unobstructed in the shot

**EXCEPTION — the athletic / windbreaker line carries no fringes and no
ribband.** Verify which line the garment belongs to *before* generating or
approving. Adding fringes to a windbreaker is as much a violation as omitting
them from a tee.

→ **BLOCK** if fringes are missing from a non-athletic top.
→ **BLOCK** if fringes appear on the athletic/windbreaker line.
→ **BLOCK** if the ribbon is any color other than a hue of blue.

## 2. Garment law — female models

**1 Timothy 2:9.** Modesty is structural, not stylistic.

- [ ] Maxi skirt or maxi dress **only**
- [ ] Hem sits at the **top of the foot / lowest part of the ankle** — fringes flow, never drag
- [ ] Fringes and blue ribbon at the bottom hem
- [ ] Not tight-fitting

→ **BLOCK** on pants, short skirts, or tight/body-con silhouettes.
→ **BLOCK** if the hem drags the ground or rides above the ankle.

## 3. Fringe and ribbon color

- [ ] Fringes may coordinate with the outfit — any color that works
- [ ] **The ribbon is always a hue of blue.** Always. No exceptions for
      colorways, seasons, or aesthetics.

→ **BLOCK** on a non-blue ribband.

## 4. Pronunciation — any audio

**"ChoZen" is pronounced exactly like the ordinary word "chosen."**
Never "cho-ZEN." Never with a Zen emphasis.

- [ ] Listened to the actual audio file. Did not assume.
- [ ] Every occurrence checked, not just the first
- [ ] Applies to voiceover, AI-generated speech, music beds with vocals, and
      any spoken CTA

→ **BLOCK** on any mispronunciation. This is unrecoverable after posting and
it is the most common failure in generated video.

## 5. Copy integrity

- [ ] Every factual claim is checkable. No unverifiable superlatives.
- [ ] No hype. No "revolutionary," "game-changing," "the best."
- [ ] Scripture quoted accurately, KJV, with correct reference
- [ ] Cross-references verified — if the post says Exodus 19 echoes 1 Peter 2,
      confirm it actually does
- [ ] Sizing claims match real inventory. "S through 5X" only if S through 5X
      is genuinely available in that item.

→ **BLOCK** on any claim that can't be substantiated.

## 6. Inclusivity

- [ ] Where models appear across a set, the full size range is represented —
      not one token larger body
- [ ] Copy reflects "built for every body" without making size the punchline
- [ ] A 6'5" / 275 frame is shown fitting as beautifully as a small size

→ **FLAG** (not block) if a set skews entirely to one body type. Fix in the
next generation.

## 7. Shabbat

- [ ] Scheduled time cleared through `scripts/sundown_guard.py` — exit code 0
- [ ] For a recurring slot: `scan-recurring` run across the next 12 months
- [ ] Timezone conversion to UTC verified *after* the guard, then re-checked

→ **BLOCK** on any guard exit code of 1.

## 8. Voice

- [ ] Passed through `chozen-humanizer` **after** platform adaptation
- [ ] Reads like a person who lived it, not a brand that researched it
- [ ] Faith-aligned, confident, testimony-driven — not preachy, not salesy

→ **BLOCK** if it hasn't been humanized.

---

## Sign-off

```
POST: ______________________  PLATFORM: __________  TIME: __________

[ ] 1. Male garment law       [ ] 5. Copy integrity
[ ] 2. Female garment law     [ ] 6. Inclusivity
[ ] 3. Fringe/ribbon color    [ ] 7. Shabbat guard (exit 0)
[ ] 4. Pronunciation          [ ] 8. Humanizer

VERDICT:  [ ] CLEAR TO SCHEDULE   [ ] BLOCKED — reason: ______________
```

When something is blocked, **say so plainly in the session** with the reason
and the fix. A silently corrected violation teaches nobody anything and hides
a pattern that will repeat.
