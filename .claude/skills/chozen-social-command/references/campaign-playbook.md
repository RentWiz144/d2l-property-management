# Campaign Tracking Playbook

The point of tracking is a compounding memory of what works, so each dollar of eventual ad spend lands on proven content. No post ships untagged.

## Campaign tags

Format: `cz-<yyyymm>-<campaign>-<variant>`

- `cz-202608-dropteaser-a` — August drop-teaser experiment, arm A
- `cz-202608-dropteaser-b` — same experiment, arm B
- `cz-202609-evergreen` — non-experiment content still gets a tag

The tag goes in: the ledger entry, the UTM `utm_campaign` value, and (where a scheduler supports labels/notes) the post's internal label. Never in the public caption.

## The ledger

Keep one ledger file per brand at `chozen-social/campaign-ledger.json` in Amoz's workspace (create it on first use; if a Drive/file connector is the norm for his files, keep it there instead — one canonical copy, not both).

```json
{
  "campaigns": [
    {
      "tag": "cz-202608-dropteaser-a",
      "hypothesis": "Scarcity hook beats scripture-first hook for drop teasers",
      "variable": "hook",
      "posts": [
        {
          "platform": "instagram",
          "scheduled_for": "2026-08-18T19:30:00-04:00",
          "caption_first_line": "Only 44 of these exist.",
          "status": "scheduled",
          "results": { "pulled_at": null, "reach": null, "engagements": null, "clicks": null, "follows": null }
        }
      ],
      "verdict": null,
      "learnings": null
    }
  ]
}
```

Rules:
- Write the `hypothesis` BEFORE results exist. A hypothesis written after the fact is a story, not a test.
- When results are pulled, fill `results` with real numbers and stamp `pulled_at`. Never leave estimated numbers in the ledger.
- `verdict` is one of `SCALE` / `ITERATE` / `KILL` / `TIE`. `learnings` is one plain sentence a future session can act on.

## Judging rules

- **Baseline**: the account's median engagement rate over the trailing 30 days on that platform. Compute it from pulled analytics; if unavailable, say so and compare arms only to each other.
- **Primary metric** by goal: awareness → reach; community → engagement rate; sales → link clicks (then actual revenue via Shopify if askable).
- **Settle windows**: IG/FB/Threads 48h; TikTok/YouTube 72h+. Don't judge early; early TikTok numbers routinely invert.
- **Winner threshold**: ≥25% gap on the primary metric between arms. Below that, record `TIE` and either rerun with a sharper variant or move on.
- **KILL discipline**: two consecutive below-baseline rounds for a content angle → stop making it, note why in `learnings`.

## From organic winner → paid campaign

1. Only boost content that already won organically (SCALE verdict).
2. Recommend a small first budget and a single audience per test; one variable discipline applies to paid too.
3. Frame paid recommendations as options with expected cost — the spend decision is Amoz's (loop in chozen-cfo for material amounts).

## Weekly review format

```
# ChoZen Social — Week of <date>
## Scoreboard  (per platform: posts, reach, eng rate vs 30-day baseline, follows, clicks)
## Best post of the week  (what it was + WHY it likely won)
## Experiments  (each: hypothesis → numbers → verdict)
## Next week  (top 2 changes to make, drawn from the data)
```
