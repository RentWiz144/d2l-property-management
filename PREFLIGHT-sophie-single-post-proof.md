# Sophie Single-Post Pipeline Proof — Pre-flight Record

**Status: RUN NOT STARTED. Blocked at pre-flight (off the clock).**

This document records zero campaign stages. No `campaign:new`, no `queue:add`,
no Sophie state file, and no sidecar were created. Under the run spec's
durability rule (`SOPHIE_STATE` pinned to the Mac repo path) and its
"never backfill stages" rule, creating stage-entry evidence in this
ephemeral cloud container — at a path that is not the Mac repo and that is
reclaimed when the session ends — would corrupt the proof it is meant to
produce. It was therefore not created.

## Seat

The spec directs the run to the Mac where `/mnt/skills/user/sophie/` and
`/mnt/skills/user/chozen-autopost/` are available. This is not that seat.

| Fact | Value |
|---|---|
| Host | ephemeral Linux container (Claude Code remote), not the Mac |
| `/mnt/skills/user/` | does not exist |
| Sophie found at | `/root/.claude/skills/synced/<id>/sophie/scripts/sophie.py` (synced copy) |
| chozen-autopost found at | `/root/.claude/skills/synced/<id>/chozen-autopost/` |
| Outbound network | restricted by org egress policy; storefront hosts return `connect_rejected` |
| Clock at check | 2026-09-01T05:42Z / 2026-09-01T01:42-04:00 (America/Detroit) |

`sophie.py` was not modified. It was invoked once, read-only:
`sophie.py selftest` → **PASS** (writes only to a temp dir). The instrument
is healthy; the environment around it is not.

## Pre-flight results

| # | Item | Result |
|---|---|---|
| 1 | Facebook channel connected and publishable in Postiz | **FAIL — hard blocker** |
| 2 | Buttercup PDP publicly reachable | **PASS** (via Admin API; see caveat) |
| 3 | Unique UTM survives FB mobile in-app browser → Shopify Sessions | **NOT RUN** — cannot be run from this seat |
| 4 | State/sidecar path not gitignored | **PASS** for this clone; re-verify on the Mac |

### 1. Postiz — hard blocker

There is no posting engine reachable from this seat:

- `postiz` CLI: not installed
- `POSTIZ_API_KEY`: not set
- `postiz.chozenunlimited.com`: no DNS record
- `postiz-setup/` in this repo is an **uninstalled installer**. Its README
  opens with "What you need first: a server (Hetzner CX22 / DigitalOcean,
  Ubuntu 24.04)" and a DNS A record. That server is not evidenced anywhere
  in this repo or environment.

Without Postiz there is no Facebook channel, so stages `queued` (manual
Postiz release) and `shipped` (owner-verified live post) are unreachable,
and the campaign scope — one real Facebook link-only post — cannot be met.

### 2. Buttercup PDP — verified

| Field | Value |
|---|---|
| Product | ChoZen Deuteronomy 22:5 Satin Maxi Dress — Buttercup |
| Product GID | `gid://shopify/Product/9909472723179` |
| Handle | `deuteronomy-22-5-satin-maxi-dress-buttercup` |
| Status | ACTIVE |
| Online Store URL | `https://chozenunlimited.com/products/deuteronomy-22-5-satin-maxi-dress-buttercup` |
| Buyable | yes — `availableForSale: true`, `inventoryPolicy: CONTINUE` (made to order) despite `inventoryQuantity: 0` |
| Shop | ChoZen Unlimited / `nkdqq2-1r.myshopify.com` / primary domain `chozenunlimited.com` |

Caveat: `onlineStoreUrl` being non-null is authoritative for *published to
Online Store*, but this seat could not perform an anonymous public HTTP
fetch (egress blocked). An unauthenticated fetch should still be done from
the Mac before the run.

Note: the Shopify shop timezone is `America/New_York`. Same UTC offset as
`America/Detroit`, so Sessions timestamps and the spec's Detroit local
times align — but the spec's dual local/UTC recording still applies.

### 3. Attribution test — cannot be run here

The spec requires a fresh Facebook **mobile app** session travelling
Facebook app → in-app browser → Shopify, with no Shopify Admin or prior
storefront cookies. This seat has no mobile device and no storefront
egress. This is owner-executed on the Mac/phone, off the clock.

### 4. Gitignore — clear in this clone

This repository contains no `.gitignore` at any level. `git check-ignore`
confirms `state/sophie.json`, `sophie-state/sophie.json`, and
`run-sidecar.jsonl` are all **not ignored**. Re-verify on the Mac repo,
which is a different working copy.

## Verified inputs the Mac seat can carry forward

- Destination base URL (confirmed live and buyable):
  `https://chozenunlimited.com/products/deuteronomy-22-5-satin-maxi-dress-buttercup`
- Sophie's state default is `<skill>/state/sophie.json`, overridden by the
  `SOPHIE_STATE` environment variable
  (`sophie.py:38`). The spec's durability rule requires pinning it
  explicitly to the Mac repo path — export it in the same shell as every
  `sophie.py` invocation, or the stages land in the skill directory instead
  of the repo.
- `sophie.py selftest` passes, so the Brand Law lint gate is live: a copy
  failure will surface at `queue:add`, not at approval.

## What unblocks this

Standing up Postiz with a connected, publishable Facebook channel is the
only item on the critical path; items 2 and 4 are already satisfied, and
item 3 is owner-executed once a tracked URL exists. Per the spec's stop
rule, the run was not reinterpreted or partially declared while blocked.
