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

All arithmetic lives here so the numbers are computed, never estimated. The
script also cross-checks the hand-entered orders against Shopify's own totals
and exits non-zero if they disagree, which catches transcription slips.
"""
import csv
import json
import re
import sys
from collections import defaultdict
from datetime import date, datetime
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
    return datetime.fromisoformat(text.replace("Z", "+00:00"))


def tenure_text(days):
    if days < 31:
        return f"{days} day{'s' if days != 1 else ''}"
    years, rem = divmod(days, 365)
    months = rem // 30
    if months == 12:
        years, months = years + 1, 0
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
    """Most units bought; ties broken by money spent, then most recent purchase."""
    stats = defaultdict(lambda: {"qty": 0, "spent": Decimal(0), "last": "", "variants": []})
    for o in orders:
        for item in o["items"]:
            s = stats[item["title"]]
            s["qty"] += int(item["qty"])
            s["spent"] += d(item["amount"])
            s["last"] = max(s["last"], o["date"])
            if item.get("variant"):
                s["variants"].append(item["variant"])
    if not stats:
        return None, stats
    title = max(stats, key=lambda t: (stats[t]["qty"], stats[t]["spent"], stats[t]["last"]))
    return title, stats


def safe_name(text):
    return re.sub(r'[\\/:*?"<>|]+', " ", text).strip() or "Unnamed customer"


def main():
    args = sys.argv[1:]
    if not args:
        sys.exit(__doc__)
    work = Path(args[0])
    today = date.fromisoformat(args[args.index("--today") + 1]) if "--today" in args else date.today()
    data = json.loads((work / "customers.json").read_text())
    out = work / "out"
    out.mkdir(exist_ok=True)

    customers = data["customers"]
    # Etsy orders synced in one batch all carry the sync time, not the purchase time.
    etsy_times = sorted(
        (parse_dt(o["date"]), c["id"]) for c in customers for o in c["orders"] if channel(o) == "Etsy"
    )
    batch_times = set()
    for i, (t, _) in enumerate(etsy_times):
        near = [u for u, _ in etsy_times if abs((u - t).total_seconds()) <= 900]
        if len(near) >= 3:
            batch_times.add(t)

    name_counts = defaultdict(int)
    for c in customers:
        name_counts[c["name"].strip().lower()] += 1

    rows, manifest, problems = [], {}, []
    for c in customers:
        orders = sorted(c["orders"], key=lambda o: o["date"])
        live = [o for o in orders if not o.get("cancelled")]
        flags = list(c.get("flags", []))
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
        elif email.endswith("@scs.tiktokw.us"):
            flags.append("tiktok_masked_email")
        if name_counts[c["name"].strip().lower()] > 1:
            flags.append("possible_duplicate_name")

        first_order = parse_dt(live[0]["date"]) if live else None
        since = min([parse_dt(c["created_at"])] + ([first_order] if first_order else []))
        if any(parse_dt(o["date"]) in batch_times for o in orders if channel(o) == "Etsy"):
            flags.append("etsy_sync_date")
        days = (today - since.date()).days

        fav, stats = favorite(live)
        units = sum(s["qty"] for s in stats.values())
        if fav is None:
            fav_text = "None yet"
        elif units == 1:
            fav_text = f"{fav} (only purchase so far)"
        elif len(stats) > 1 and len({s["qty"] for s in stats.values()}) == 1:
            fav_text = f"{fav} (tie on units; highest spend)"
        else:
            fav_text = f"{fav} ({stats[fav]['qty']} bought)"

        display = c["name"]
        if "@" in display:
            display = f"{channel(orders[0]) if orders else 'Unknown'} buyer {orders[0]['name'] if orders else c['id']}"
        folder = safe_name(display)
        if name_counts[c["name"].strip().lower()] > 1 or folder in manifest.values():
            folder = f"{folder} ({str(c['id'])[-4:]})"
        manifest[str(c["id"])] = folder
        cdir = out / folder
        cdir.mkdir(exist_ok=True)

        channels = sorted({channel(o) for o in orders})
        aov = (ltv / len(live)) if live else Decimal(0)
        lines = [
            f"# {display}",
            "",
            f"_Built {today.isoformat()} from Shopify (ChoZen Unlimited). Shopify customer ID {c['id']}._",
            "",
            "## Summary",
            "",
            "| Field | Value |",
            "|---|---|",
            f"| Email | {email or 'none on file'} |",
            f"| Customer since | {since.date().isoformat()} |",
            f"| Time as a customer | {tenure_text(days)} ({days} days) |",
            f"| Lifetime value | {money(ltv)} |",
            f"| Orders | {len(live)} |",
            f"| Average order | {money(aov)} |",
            f"| Favorite item | {fav_text} |",
            f"| Last order | {live[-1]['date'][:10] if live else 'n/a'} |",
            f"| Bought through | {', '.join(channels) or 'n/a'} |",
            f"| Shopify tags | {', '.join(c.get('tags') or []) or 'none'} |",
            f"| Flags | {', '.join(flags) or 'none'} |",
            "",
            "Lifetime value is Shopify's amount spent (order totals including tax and shipping, minus refunds).",
            "",
        ]
        if c.get("note"):
            lines += ["## Shopify customer note", "", c["note"], ""]
        lines += ["## Purchases", "", "| Date | Order | Channel | Item | Variant | Qty | Item amount | Order total |", "|---|---|---|---|---|---|---|---|"]
        for o in orders:
            tag = " (cancelled)" if o.get("cancelled") else ""
            for i, item in enumerate(o["items"]):
                lines.append(
                    f"| {o['date'][:10]} | {o['name']}{tag} | {channel(o)} | {item['title']} | {item.get('variant') or ''} "
                    f"| {item['qty']} | {money(d(item['amount']))} | {money(d(o['total'])) if i == 0 else ''} |"
                )
        notes = [(o["name"], o["note"]) for o in orders if o.get("note")]
        if notes:
            lines += ["", "## Order notes", ""] + [f"- {n}: {t}" for n, t in notes]
        if stats:
            lines += ["", "## Items by units bought", ""]
            for t in sorted(stats, key=lambda t: (-stats[t]["qty"], -stats[t]["spent"])):
                v = ", ".join(stats[t]["variants"])
                lines.append(f"- {t}: {stats[t]['qty']} ({money(stats[t]['spent'])}){' in ' + v if v else ''}")
        (cdir / "Profile.md").write_text("\n".join(lines) + "\n")

        mfile = work / "messages" / f"{c['id']}.json"
        mlines = [f"# Messages: {display}", "", f"_Built {today.isoformat()}._", ""]
        mcount = 0
        if mfile.exists():
            m = json.loads(mfile.read_text())
            for section, key in (("Email conversations (Gmail)", "gmail"), ("Marketing activity (Klaviyo)", "klaviyo"), ("Shopify notes", "shopify")):
                mlines += [f"## {section}", ""]
                entries = m.get(key) or []
                if isinstance(entries, str):
                    mlines += [entries, ""]
                    continue
                if not entries:
                    mlines += [m.get(f"{key}_status") or "Nothing found.", ""]
                    continue
                mcount += len(entries)
                for e in sorted(entries, key=lambda e: e.get("date", ""), reverse=True):
                    link = f" [open]({e['link']})" if e.get("link") else ""
                    mlines.append(f"- **{e.get('date', '')[:10]}** {e.get('direction', '')} {e.get('subject', '')}{link}".rstrip())
                    if e.get("summary"):
                        mlines.append(f"  {e['summary']}")
                mlines.append("")
        else:
            mlines += ["Messages have not been gathered for this customer yet.", ""]
        (cdir / "Messages.md").write_text("\n".join(mlines))

        rows.append({
            "Customer": display, "Email": email or "", "Customer since": since.date().isoformat(),
            "Days as customer": days, "Time as customer": tenure_text(days), "Orders": len(live),
            "Lifetime value": f"{ltv:.2f}", "Average order": f"{aov:.2f}", "Favorite item": fav_text,
            "Last order": live[-1]["date"][:10] if live else "", "Channels": ", ".join(channels),
            "Messages logged": mcount if mfile.exists() else "not gathered", "Flags": ", ".join(flags), "Folder": folder,
        })

    rows.sort(key=lambda r: -Decimal(r["Lifetime value"]))
    with (out / "Customer Index.csv").open("w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)

    leads_file = work / "leads.json"
    if leads_file.exists():
        leads = json.loads(leads_file.read_text())["leads"]
        with (out / "Leads (no purchase yet).csv").open("w", newline="") as f:
            w = csv.writer(f)
            w.writerow(["Name", "Email", "Added", "Email marketing", "Tags"])
            for l in sorted(leads, key=lambda l: l.get("created_at", ""), reverse=True):
                w.writerow([l.get("name", ""), l.get("email", ""), l.get("created_at", "")[:10], l.get("marketing", ""), ", ".join(l.get("tags") or [])])

    (out / "manifest.json").write_text(json.dumps(manifest, indent=1))
    total = sum(Decimal(r["Lifetime value"]) for r in rows)
    print(f"{len(rows)} customers, {sum(r['Orders'] for r in rows)} orders, {money(total)} total lifetime value")
    if problems:
        print("\nCHECKS FAILED (fix customers.json against the Shopify response, then rerun):")
        for p in problems:
            print(" -", p)
        sys.exit(1)
    print("All totals and order counts match Shopify.")


if __name__ == "__main__":
    main()
