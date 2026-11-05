# ChoZen motion texture pack (kie.ai Seedance 2.0)

Three 6-second, silent, 16:9 background loops in the ChoZen design system look (black, silver, chrome, blues):
`liquid-chrome`, `blue-light-sweep`, `brushed-silver-grain`. Prompts live in `prompts.json`.

Design system: https://claude.ai/artifact/Y3rGRnZuoNtzV9LoLGtpGy

## Run
1. Add `KIE_API_KEY` to the cloud environment (title bar > environment > Edit > Network secrets / env vars). Start a new session.
2. Dry run (no spend): `node brand/textures/generate.js`
3. Generate: `node brand/textures/generate.js --only liquid-chrome --confirm` to test one, then `--confirm` for all.

Output goes to `brand/textures/out/` (git-ignored). Estimated cost at 720p: about $1.23 per clip, $3.69 for all three
(kie.ai/seedance-2-0, checked 2026-11-05: $0.205/s text-to-video at 720p).
