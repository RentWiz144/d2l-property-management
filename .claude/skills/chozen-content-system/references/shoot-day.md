# Shoot Day — the seven shots

Source concept: MNTO Studios, "Shoot Day: This Is What Creative Direction Looks Like"
(Joshua Montaño; $7 PDF, ch. 05 "The Seven Shots That Sell Everything We Make"). Their
seven are behind the purchase and are **not** copied. `src/shoots/SevenShots.js` is
ChoZen's own seven — replace `SHOTS` with the playbook's list if Amoz buys it.

| # | Shot | Funnel | Video move | Preset |
|---|---|---|---|---|
| 1 | The Hero — full body, real Detroit place | TOF | orbit | authority |
| 2 | The Detail — fringes + ribbon of blue (athletic: construction) | MOF | pull-back | discipline |
| 3 | The Movement — walking, fringes in motion | TOF | tracking | discipline |
| 4 | Every Body — same garment, 2–3 real body types | MOF | whip-pan | authority |
| 5 | The Product Alone — flat lay / ghost, PDP | BOF | stills | — |
| 6 | The Phone Shot — creator-style UGC | BOF | tracking | pressure |
| 7 | The Testimony — faith moment, room for 1 Peter 2:9 | TOF | pull-back | faith |

```bash
node index.js --shoot-day "Unshaken tee:standard,Satin maxi:womens,Windbreaker:athletic"
node index.js --shoot-day "Unshaken tee" --shots hero,detail,phone
```

Output is a printable shot list with deliverables per shot and an on-set Brand Law
checklist per garment line (standard / athletic / womens). Shoot a separate 4:5 for the
IG feed — 9:16 gets cropped and loses the hem.

Feeds: Visual Studio (Photo overlay uses shot 7 and shot 1), Content Globe `visual_brief`,
Shot Director video takes, Shopify/Etsy PDP (shot 5).
