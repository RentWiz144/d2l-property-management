# Handoff schema — `chozen-content-system/plan@1`

Exported by Content Globe as `chozen-plan.json`. Drafts only.

```json
{
  "schema": "chozen-content-system/plan@1",
  "generated_at": "ISO-8601",
  "timezone": "America/Detroit",
  "engine": "chozen-publisher",
  "brief": { "brand", "goal", "platforms": [], "start": "YYYY-MM-DD", "end": "YYYY-MM-DD" },
  "content_mix": [{ "name", "definition", "pct" }],
  "ideas": [{ "id", "date", "content_type", "title", "angle", "scripture_ref", "scripture_verified": false, "source_url" }],
  "posts": [{
    "id", "idea_id", "campaign_tag": "cz-YYYYMM-<type>", "content_type", "platform",
    "local_time": "2026-12-01T19:00:00-05:00", "utc_time": "ISO-8601",
    "sabbath_guard": "PASS | MOVED | BLOCKED", "time_assumed": false,
    "hook", "caption", "hashtags": [], "cta", "visual_brief", "camera_moves": [],
    "media_required": true, "media": null, "humanized": true, "status": "draft"
  }]
}
```

Publisher must, per post: attach media when `media_required`; verify `scripture_ref`;
run Brand Law pre-flight; re-run the Sabbath guard on the final time; refuse any
`BLOCKED`. Only posts whose writing succeeded are exported; the sample plan never exports.
`humanized: true` means the humanizer rules were in the writing prompt — there is no
separate rewrite pass. `brief.end` is the last day actually planned (the 40-post cap can
end a run early).
