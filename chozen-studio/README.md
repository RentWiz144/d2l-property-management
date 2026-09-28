# ChoZen Studio

The `studio.sh` terminal menu, rebuilt as a real app with a frontend.

Same job as before — make an image, make a video, open your files — running on the
same kie.ai account and the same credits. The menu is now a UI, generations run in
parallel instead of one at a time, finished work downloads itself, and the credit
balance is live instead of printed once at launch.

It runs entirely on your Mac. Nothing is hosted, and your API key never leaves the
machine.

## Setup (once)

1. **Node 18 or newer.** Check with `node -v`; install from [nodejs.org](https://nodejs.org) if missing.
2. **Add your key.**
   ```bash
   cp .env.example .env
   ```
   Open `.env` and paste your key from [kie.ai/api-key](https://kie.ai/api-key) into `KIE_API_KEY=`.
3. **Run it.** Double-click `studio.command`, or:
   ```bash
   npm start
   ```

The app opens at <http://localhost:4173>. There is nothing to install — no
`npm install` step, no dependencies.

## Pointing your desktop icon at it

Your existing ChoZen Studio icon currently launches the old `studio.sh`. To keep
the same icon and have it open the new app:

1. Right-click the desktop icon → **Show Original** (if it is an alias), or find
   the `.command` file it points at.
2. Either replace that file with this folder's `studio.command`, or make a new
   alias of `studio.command` and give it the same name and icon:
   - Select the old icon → **⌘I** → click the icon thumbnail top-left → **⌘C**
   - Select the new alias → **⌘I** → click its thumbnail → **⌘V**

The icon and its position stay exactly as they are; only what it launches changes.

## What it does

| | |
|---|---|
| **Image** | Pick a model, write a prompt, set the aspect ratio, generate. |
| **Video** | Same, plus resolution, duration, and audio where the model supports it. |
| **Library** | Everything generated, newest first, with **Open folder** to reveal in Finder. |
| **HUD** | Live credit balance, its dollar value, and what you've spent this calendar month. |

Generations are asynchronous. Submit several and they run at once; the Activity
feed polls each one and shows `waiting → queuing → generating → done`. Finished
files download to `~/ChoZenStudio/output` automatically — change that with
`OUTPUT_DIR` in `.env`.

`⌘↵` in the prompt box generates without reaching for the mouse.

## Model slugs

`models.json` is plain data. Every entry marked `"verified": true` was read from
the live docs at [docs.kie.ai](https://docs.kie.ai). Two are **not** verified and
are flagged in the UI with *slug unconfirmed*:

- `nano-banana-pro/text-to-image`
- `google/veo3`

Those two names appear on the old `studio.sh` menu, but their exact slugs are not
in the public docs. Check what your old script sends, correct the `id` in
`models.json`, and restart. Adding or removing any model is an edit to that file —
never a code change.

## How it talks to kie.ai

Three endpoints, all bearer-authenticated:

| Call | Endpoint |
|---|---|
| Submit | `POST /api/v1/jobs/createTask` → `data.taskId` |
| Poll | `GET /api/v1/jobs/recordInfo?taskId=` → `data.state`, `data.resultJson` |
| Balance | `GET /api/v1/chat/credit` → `data` (integer credits) |

`resultJson` arrives as a JSON *string*, not an object — `server/kie.js` unwraps
it and tolerates a malformed one rather than losing a finished generation.

Credits convert at **$0.005 each**, derived from your own account: 8,130 credits
displaying as $40.65. Change `USD_PER_CREDIT` in `server/config.js` if kie.ai
repricing makes that drift.

The documented rate limit is 20 new tasks per 10 seconds. The poller runs one
shared 3-second loop over in-flight jobs, which stays well under it.

## Layout

```
studio.command      double-click launcher
models.json         model catalog (edit this, not the code)
server/
  index.js          local HTTP server + background poller
  kie.js            kie.ai adapter
  store.js          job history, spend ledger, downloads
  config.js         .env loading
web/                the frontend
```

## Notes

- The server binds to `127.0.0.1` only. It holds an API key and must not be
  reachable from your network.
- `.env`, `state.json`, and `output/` are gitignored. Your key is never committed.
- `state.json` is job history. Deleting it clears the Activity feed and the
  month-to-date spend figure; it does not touch generated files.
- Dark by default. `data-theme="light"` on `<html>` switches it.
