# Engine Setup — corrected against reality, 2026-08-27

**Replaces the version that says "Postiz is the engine."** Everything below was read from the
machine and the live APIs on 2026-08-27, not inferred.

> **The four laws, `platform-specs.md` and `brand-law-preflight.md` are engine-agnostic and
> did not change.** They ran today and caught four real defects on a single post. **Only this
> file was wrong.** That was the design — see "If Postiz turns out to be wrong" at the bottom
> of the previous version. It was right about itself.

---

## Part 0 — What is actually true right now

| Claim in the old file | Reality, verified 2026-08-27 |
|---|---|
| "The engine is **Postiz**" | **Not installed.** Not on PATH, no npm package, no `POSTIZ_API_KEY`, no Docker container, no skill dir on the Mac |
| Five networks reconnected | **Never happened.** Part 4 of the old file is still the blank template with underscores |
| "Rescue the Metricool queue first" | **Moot.** `getScheduledPosts` returns an empty queue. There was nothing in it to lose |
| Metricool is gone | **Still authenticating.** Cancelled, but brand `5346526` answers and all five networks are listed. Grace period of unknown length |

⚠ **The 30-day campaign calendar was authored in Metricool's schedule format** — for the tool
that had already been cancelled. **That is the mechanical reason it never shipped.** Not nerve,
not planning. The format pointed at a dead engine.

---

## Part 1 — The interim engine: Metricool over MCP

**Until Postiz exists, posts go out through the Metricool MCP connector.** This works today and
scheduled two Instagram posts on 2026-08-27.

**Brand:** `5346526` · `chozen_unlimited` · timezone `America/Detroit`

| Network | Handle / ID | Connected in Metricool |
|---|---|---|
| Instagram | `theechozencollection` | ✅ |
| Facebook | page `806456225892762` | ✅ |
| TikTok | `theechozencollection` | ✅ |
| Threads | `chozen_unlimited` | ✅ |
| YouTube | `UCaeeKNjKXVfHay29EJasrNw` | ✅ |
| **Pinterest** | — | ⛔ **NOT connected.** `networksData` has no `pinterestData` |

⚠ **THE RISK, STATED PLAINLY.** A cancelled account can accept a scheduled post over the API
and then never publish it. **You would believe you shipped and you did not.** So: **one post at
a time, and confirm each on the live feed before queueing more.** Do not migrate 29 posts into
an engine whose publish behaviour is unproven.

⛔ **Pinterest cannot be posted to from here at all** — and Pinterest is the channel that
outperformed Instagram and TikTok on zero effort. **That alone justifies standing up Postiz.**

---

## Part 2 — Standing up Postiz, corrected

**Do it from the Mac, not from a chat sandbox.** Verified 2026-08-27:

- Mac → `api.postiz.com` → **401** (server reachable, needs auth)
- Cloud sandbox → `api.postiz.com` → **blocked by egress**

```bash
npm install -g postiz
echo 'export POSTIZ_API_KEY=your_key_here' >> ~/.zshrc && source ~/.zshrc
postiz integrations:list      # must return JSON before anything else happens
```

Then reconnect in the Postiz web UI, in this order — OAuth cannot be scripted:

1. **Facebook** — the Page, not the personal profile
2. **Instagram** — Business or Creator, linked to that Page
3. **TikTok** — Business account for API posting
4. **Threads** — links through Instagram
5. **YouTube** — channel `UCaeeKNjKXVfHay29EJasrNw`
6. **Pinterest** — ⭐ **new, and the reason this migration is worth doing**

Capture the IDs and paste them into Part 5 below:

```bash
postiz integrations:list | jq -r '.[] | "\(.identifier): \(.id)"'
```

---

## Part 3 — The five things that will bite

**1. Media must be a public URL, uploaded to the engine first.** Instagram, TikTok and YouTube
reject external URLs at publish time. Metricool re-hosts on its own CDN when given a public
link — confirmed, the returned `media[]` came back as `static.metricool.com` paths. Postiz needs
an explicit `postiz upload` first.

**2. ⚠ Aspect ratio — this silently destroys posts.** **Instagram's feed caps at 4:5 (0.8).**
Most ChoZen source images are **9:16 (0.5625)**, so Instagram centre-crops them and **cuts the
fringed hem off the bottom** — the exact detail most ChoZen captions are built on. **Pad to
1024×1280 before upload.** A blurred, scaled copy of the image itself as the fill reads as
intentional. **Every slide of a carousel must share one ratio.**

**3. Timezone.** Decide in Detroit local → run `sundown_guard.py check` → must exit 0 → convert
to UTC → schedule → convert back and re-verify. An off-by-four-hours error in November lands a
post inside Shabbat.

**4. Never trust a filename for its contents.** The Buttercup slide list named two scenes
wrongly, and the "back view on stone steps" was actually a marble elevator lobby. **Match
images to slides by eye, every time.**

**5. ⛔ Claims baked into artwork bypass every text check.** The Buttercup hero graphic carried
**"ChoZen Fringe Lock System"** set into the image — a feature that does not exist. No caption
audit would ever have caught it. **Brand Law pre-flight must include reading the words inside
the picture.**

---

## Part 4 — Standing defects to check before reusing any old asset

- ⛔ **`chosenunlimited.com` appears 34 times** across every 30-day calendar and schedule file.
  The domain is **`chozenunlimited.com`**. The S-spelling does not resolve. **Zero correct
  spellings exist in those files.**
- ⛔ **"Fringes and a ribband of blue" are a paid add-on, not standard.** Any copy claiming
  every ChoZen piece carries them is false.
- ⛔ **"ChoZen Fringe Lock System" is not a real feature.** Cut from copy; still baked into the
  Buttercup gold hero graphic, which is therefore blocked until re-rendered.
- ⚠ **"VS" instead of "V5"** on the white-on-white Deuteronomy renders. Demoted off the hero,
  not yet re-rendered.

---

## Part 5 — Account reference

```
POSTIZ_API_KEY   : NOT SET — nothing installed as of 2026-08-27

instagram        : ____________________
tiktok           : ____________________
facebook         : ____________________
threads          : ____________________
youtube          : ____________________
pinterest        : ____________________

Last verified    : ____________
```

**Interim, working today:** Metricool MCP · brand `5346526` · no Pinterest.

---

## Part 6 — Migration checklist, corrected

- [x] Metricool queue exported — **moot, the queue is empty**
- [ ] Postiz account created, API key in `~/.zshrc`
- [ ] `postiz integrations:list` returns JSON **from the Mac**
- [ ] Six networks connected — **including Pinterest this time**
- [ ] Integration IDs captured into Part 5
- [ ] One test post per network, verified **on the live feed**, not in a planner
- [ ] `scan-recurring` run on every recurring slot for the next 12 months
- [ ] **Domain corrected in all 30 captions before any of them are queued**
- [ ] Queue rewritten platform-native — do not re-import identical-caption posts
- [ ] Threads, YouTube and Pinterest included. All three were idle

---

## If the engine changes again

Rewrite this file and nothing else. **The four laws, the platform specs and the Brand Law
pre-flight do not know what an engine is, and that is why they survived a dead subscription.**

Any replacement needs: a real API or CLI, scheduled posting, all six networks, and media upload.
**If it needs browser automation with a logged-in session, reject it** — account-ban risk, and
the same trap that made Agent Reach a bad fit.
