#!/usr/bin/env python3
"""Turn normalized customer data into one folder per customer plus index sheets.

Usage:
    python3 build_customer_files.py <work_dir> [--today YYYY-MM-DD]

Reads   <work_dir>/customers.json            (required, see references/data-format.md)
        <work_dir>/messages/<customer_id>.json   (optional, one per customer)
        <work_dir>/leads.json                (optional, non-buyers)
Writes  <work_dir>/out/<Customer folder>/Profile.md
        <work_dir>/out/<Customer folder>/Messages.md
        <work_dir>/out/Customer Index.csv
        <work_dir>/out/Leads (no purchase yet).csv
        <work_dir>/out/manifest.json         (folder name per customer id, for the upload step)

out/ is rebuilt from scratch on every run. All arithmetic lives here so the
numbers are computed, never estimated. The script cross-checks the entered
orders against Shopify's own totals; if they disagree it removes out/ and
exits non-zero so nothing unverified can be published.
"""
import csv
import json
import re
import shutil
import sys
from collections import defaultdict
from datetime import date, datetime, timezone
from decimal import Decimal
from pathlib import Path

SOURCES = {
    "web": "Online store",
    "tiktok": "TikTok Shop",
    "shopify_draft_order": "Manual order (draft)",
    "pos": "Point of sale",
    "279941": "Etsy",
    "3890849": "Shop app",
}


def d(value):
    return Decimal(str(value if value not in (None, "") else "0"))


def money(value):
    return f"${value:,.2f}"


def parse_dt(text):
    dt = datetime.fromisoformat(str(text).replace("Z", "+00:00"))
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


def tenure_text(days):
    if days < 31:
        return f"{days} day{'s' if days != 1 else ''}"
    years, rem = divmod(days, 365)
    months = min(rem // 30, 11)
    parts = []
    if years:
        parts.append(f"{years} year{'s' if years != 1 else ''}")
    if months:
        parts.append(f"{months} month{'s' if months != 1 else ''}")
    return ", ".join(parts)


def channel(order):
    if order["name"].startswith("ETSY_COM"):
        return "Etsy"
    src = str(order.get("source") or "")
    return SOURCES.get(src, f"Other ({src})" if src else "Unknown")


def favorite(orders):
    """Most units ordered; ties broken by money spent, then most recent purchase."""
    stats = defaultdict(lambda: {"qty": 0, "spent": Decimal(0), "last": "", "variants": []})
    for o in orders:
        for item in o.get("items") or []:
            s = stats[item["title"]]
            s["qty"] += int(item.get("qty", 1))
            s["spent"] += d(item.get("amount"))
            s["last"] = max(s["last"], o["date"])
            if item.get("variant"):
                s["variants"].append(item["variant"])
    if not stats:
        return "None yet", stats
    key = lambda t: (stats[t]["qty"], stats[t]["spent"], stats[t]["last"])
    title = max(stats, key=key)
    top = stats[title]
    if sum(s["qty"] for s in stats.values()) == 1:
        return f"{title} (only purchase so far)", stats
    tied = [t for t in stats if t != title and stats[t]["qty"] == top["qty"]]
    if not tied:
        return f"{title} ({top['qty']} bought)", stats
    if all(stats[t]["spent"] < top["spent"] for t in tied):
        why = "tie on units; highest spend"
    elif all((stats[t]["spent"], stats[t]["last"]) < (top["spent"], top["last"]) for t in tied):
        why = "tie on units and spend; most recent"
    else:
        why = "exact tie with " + ", ".join(sorted(tied))
    return f"{title} ({why})", stats


def safe_name(text):
    name = re.sub(r'[\\/:*?"<>|]+', " ", str(text or "")).strip(" .")
    return name or "Unnamed customer"


def cell(text):
    """Markdown table cell: a pipe would split the column."""
    return str(text if text is not None else "").replace("|", "/").replace("\n", " ")


def csv_safe(value):
    """Sheets treats a leading = + - @ as a formula; neutralize it."""
    text = str(value if value is not None else "")
    return "'" + text if text[:1] in ("=", "+", "-", "@") else text


def fail(message):
    sys.exit(f"ERROR: {message}")


def main():
    args = sys.argv[1:]
    if not args or args[0].startswith("-"):
        sys.exit(__doc__)
    work = Path(args[0])
    today = date.today()
    if "--today" in args:
        i = args.index("--today")
        if i + 1 >= len(args):
            fail("--today needs a date, e.g. --today 2026-01-15")
        today = date.fromisoformat(args[i + 1])
    src = work / "customers.json"
    if not src.exists():
        fail(f"{src} not found")
    data = json.loads(src.read_text())
    customers = data.get("customers") or []
    if not customers:
        fail("customers.json has no customers")
    for c in customers:
        for field in ("id", "name", "created_at", "shopify_amount_spent", "shopify_order_count"):
            if c.get(field) in (None, ""):
                fail(f"customer {c.get('id') or c.get('name') or '?'} is missing '{field}'")
        c.setdefault("orders", [])
        for o in c["orders"]:
            for field in ("name", "date", "total"):
                if o.get(field) in (None, ""):
                    fail(f"an order for {c['name']} is missing '{field}'")
    store = data.get("store") or "Shopify"
    pulled = data.get("pulled_on") or today.isoformat()

    out = work / "out"
    if out.exists():
        shutil.rmtree(out)
    out.mkdir()

    # Etsy orders synced in one batch carry the sync time, not the purchase time.
    # A batch is two or more different customers' Etsy orders within 15 minutes.
    etsy = [(parse_dt(o["date"]), c["id"]) for c in customers for o in c["orders"] if channel(o) == "Etsy"]
    batch_times = {
        t for t, cid in etsy
        if any(other != cid and abs((u - t).total_seconds()) <= 900 for u, other in etsy)
    }

    name_counts = defaultdict(int)
    for c in customers:
        name_counts[c["name"].strip().lower()] += 1

    rows, manifest, problems = [], {}, []
    entered = cancelled_n = 0
    for c in customers:
        orders = sorted(c["orders"], key=lambda o: parse_dt(o["date"]))
        live = [o for o in orders if not o.get("cancelled")]
        entered += len(orders)
        cancelled_n += len(orders) - len(live)
        flags = list(c.get("flags") or [])
        email = c.get("email")

        computed = sum((d(o["total"]) - d(o.get("refunded")) for o in live), Decimal(0))
        ltv = d(c["shopify_amount_spent"])
        if computed != ltv:
            flags.append("ltv_check_failed")
            problems.append(f"{c['name']}: orders add up to {money(computed)} but Shopify says {money(ltv)}")
        if len(orders) != int(c["shopify_order_count"]):
            flags.append("order_count_check_failed")
            problems.append(f"{c['name']}: {len(orders)} orders entered but Shopify says {c['shopify_order_count']}")

        if not email:
            flags.append("no_email_on_file")
        elif email.lower().endswith("@scs.tiktokw.us"):
            flags.append("tiktok_masked_email")
        if name_counts[c["name"].strip().lower()] > 1:
            flags.append("possible_duplicate_name")
        if not live:
            flags.append("no_completed_orders")
        if any(parse_dt(o["date"]) in batch_times for o in orders if channel(o) == "Etsy"):
            flags.append("etsy_sync_date")

        since = min([parse_dt(c["created_at"])] + [parse_dt(o["date"]) for o in orders])
        days = (today - since.date()).days
        if days < 0:
            fail(f"{c['name']} became a customer after --today ({today}); check the date")

        fav_text, stats = favorite(live)

        display = c["name"]
        if "@" in display:
            display = f"{channel(orders[0]) if orders else 'Unknown'} buyer {orders[0]['name'] if orders else c['id']}"
        folder = safe_name(display)
        if name_counts[c["name"].strip().lower()] > 1:
            folder = f"{folder} ({str(c['id'])[-4:]})"
        if folder in manifest.values():
            folder = f"{safe_name(display)} ({c['id']})"
        if folder in manifest.values():
            fail(f"two customers map to the folder '{folder}'; customer ids must be unique")
        manifest[str(c["id"])] = folder
        cdir = out / folder
        cdir.mkdir()

        channels = sorted({channel(o) for o in live})
        aov = (ltv / len(live)) if live else Decimal(0)
        lines = [
            f"# {display}",
            "",
            f"_Built {today.isoformat()} from {store} Shopify data pulled {pulled}. Shopify customer ID {c['id']}._",
            "",
            "## Summary",
            "",
            "| Field | Value |",
            "|---|---|",
            f"| Email | {cell(email) or 'none on file'} |",
            f"| Customer since | {since.date().isoformat()} |",
            f"| Time as a customer | {tenure_text(days)} ({days} days) |",
            f"| Lifetime value | {money(ltv)} |",
            f"| Orders | {len(live)}{f' (plus {len(orders) - len(live)} cancelled)' if len(orders) != len(live) else ''} |",
            f"| Average order | {money(aov)} |",
            f"| Favorite item | {cell(fav_text)} |",
            f"| Last order | {live[-1]['date'][:10] if live else 'n/a'} |",
            f"| Bought through | {', '.join(channels) or 'n/a'} |",
            f"| Shopify tags | {cell(', '.join(c.get('tags') or [])) or 'none'} |",
            f"| Flags | {', '.join(flags) or 'none'} |",
            "",
            "Lifetime value is Shopify's amount spent (order totals including tax and shipping, minus refunds). "
            "Favorite item counts units on non-cancelled orders; refunded units are not subtracted.",
            "",
        ]
        if c.get("note"):
            lines += ["## Shopify customer note", "", c["note"], ""]
        lines += ["## Purchases", "", "| Date | Order | Channel | Item | Variant | Qty | Item amount | Order total |", "|---|---|---|---|---|---|---|---|"]
        for o in orders:
            tag = " (cancelled)" if o.get("cancelled") else ""
            items = o.get("items") or [{"title": "(no line items entered)", "qty": "", "amount": None}]
            for i, item in enumerate(items):
                amount = money(d(item["amount"])) if item.get("amount") is not None else ""
                lines.append(
                    f"| {o['date'][:10]} | {cell(o['name'])}{tag} | {channel(o)} | {cell(item['title'])} | {cell(item.get('variant'))} "
                    f"| {item.get('qty', 1)} | {amount} | {money(d(o['total'])) if i == 0 else ''} |"
                )
        notes = [(o["name"], o["note"]) for o in orders if o.get("note")]
        if notes:
            lines += ["", "## Order notes", ""] + [f"- {n}: {t}" for n, t in notes]
        if stats:
            lines += ["", "## Items by units bought", ""]
            for t in sorted(stats, key=lambda t: (-stats[t]["qty"], -stats[t]["spent"], t)):
                v = ", ".join(stats[t]["variants"])
                lines.append(f"- {t}: {stats[t]['qty']} ({money(stats[t]['spent'])}){' in ' + v if v else ''}")
        (cdir / "Profile.md").write_text("\n".join(lines) + "\n")

        # Shopify notes come from customers.json so they can never be reported as missing.
        shopify_notes = [{"date": "", "direction": "customer note:", "subject": c["note"]}] if c.get("note") else []
        shopify_notes += [{"date": o["date"], "direction": f"note on {o['name']}:", "subject": o["note"]} for o in orders if o.get("note")]
        mfile = work / "messages" / f"{c['id']}.json"
        gathered = mfile.exists()
        m = json.loads(mfile.read_text()) if gathered else {}
        m["shopify"] = shopify_notes
        m.setdefault("shopify_status", "No customer note or order notes in Shopify.")
        mlines = [f"# Messages: {display}", "", f"_Built {today.isoformat()}._", ""]
        mcount = 0
        for section, key in (("Email conversations (Gmail)", "gmail"), ("Marketing activity (Klaviyo)", "klaviyo"), ("Shopify notes", "shopify")):
            mlines += [f"## {section}", ""]
            if key != "shopify" and not gathered:
                mlines += ["Not gathered yet.", ""]
                continue
            entries = m.get(key) or []
            if isinstance(entries, str):
                mlines += [entries, ""]
                continue
            if not entries:
                mlines += [m.get(f"{key}_status") or "Nothing found.", ""]
                continue
            mcount += len(entries)
            for e in sorted(entries, key=lambda e: str(e.get("date") or ""), reverse=True):
                link = f" [open]({e['link']})" if e.get("link") else ""
                when = f"**{str(e.get('date') or '')[:10]}** " if e.get("date") else ""
                mlines.append(f"- {when}{e.get('direction', '')} {e.get('subject', '')}{link}".rstrip())
                if e.get("summary"):
                    mlines.append(f"  {e['summary']}")
            mlines.append("")
        (cdir / "Messages.md").write_text("\n".join(mlines))

        rows.append({
            "Customer": display, "Email": email or "", "Customer since": since.date().isoformat(),
            "Days as customer": days, "Time as customer": tenure_text(days), "Orders": len(live),
            "Lifetime value": f"{ltv:.2f}", "Average order": f"{aov:.2f}", "Favorite item": fav_text,
            "Last order": live[-1]["date"][:10] if live else "", "Channels": ", ".join(channels),
            "Messages logged": mcount if gathered else "not gathered", "Flags": ", ".join(flags),
            "Folder": folder, "Shopify customer ID": str(c["id"]),
        })

    print(f"{len(rows)} customers; {entered} orders entered ({entered - cancelled_n} completed, {cancelled_n} cancelled); "
          f"{money(sum(Decimal(r['Lifetime value']) for r in rows))} total lifetime value")
    if problems:
        shutil.rmtree(out)
        print("\nCHECKS FAILED, nothing was written. Compare customers.json with the Shopify response:")
        for p in problems:
            print(" -", p)
        print("If the file already matches Shopify, stop and report the mismatch; do not adjust figures to make it pass.")
        sys.exit(1)

    rows.sort(key=lambda r: -Decimal(r["Lifetime value"]))
    with (out / "Customer Index.csv").open("w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows({k: csv_safe(v) for k, v in r.items()} for r in rows)

    leads_file = work / "leads.json"
    if leads_file.exists():
        leads = json.loads(leads_file.read_text()).get("leads") or []
        with (out / "Leads (no purchase yet).csv").open("w", newline="") as f:
            w = csv.writer(f)
            w.writerow(["Name", "Email", "Added", "Email marketing", "Tags"])
            for l in sorted(leads, key=lambda l: str(l.get("created_at") or ""), reverse=True):
                w.writerow([csv_safe(x) for x in (l.get("name"), l.get("email"), str(l.get("created_at") or "")[:10], l.get("marketing"), ", ".join(l.get("tags") or []))])
        print(f"{len(leads)} leads")

    (out / "manifest.json").write_text(json.dumps(manifest, indent=1))
    print("All customer totals and order counts match Shopify.")


if __name__ == "__main__":
    main()
