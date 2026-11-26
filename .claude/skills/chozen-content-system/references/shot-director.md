# Shot Director — camera moves for AI video

Source concept: `red.voss` reel (Nov 2026) — "tracking shot, orbit, whip pan, pull back.
Four moves that make your AI video look like it was filmed by a real camera operator on a
real street." Their prompts are DM-gated; the wording in `src/modules/CameraMove.js` is
ChoZen's own.

| Move | Intent | Length | Best for | Use as |
|---|---|---|---|---|
| tracking | Walk with him | 4–8 s | DISCIPLINE, AUTHORITY | opener / body |
| orbit | Circle him; he stays still | 5–8 s | AUTHORITY, FAITH | hero / product on body |
| whip-pan | Fast blur transition | 1–3 s | PRESSURE, DISCIPLINE | hook pattern-break, outfit change |
| pull-back | Start tight, reveal the place | 5–10 s | FAITH, PRESSURE | closer |

Every move adds OPERATOR REALISM (handheld micro-shake, uneven speed, focus breathing,
hand-corrected framing) so it stays inside the engine's "no cinematic look" constraint.

```bash
node index.js --moves-list
node index.js --preset authority --move orbit
node index.js --preset discipline --moves tracking,whip-pan,pull-back   # 3-clip Reel
```

A typical 15-second Reel: tracking (6 s) → whip-pan (1 s) → pull-back (8 s).
Generate each clip separately with the same preset, then cut in order.
