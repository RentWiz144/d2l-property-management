---
name: chozen-customer-database
description: Builds and refreshes the ChoZen Unlimited customer database - one private Google Drive folder per buyer holding their purchases, messages, lifetime value, time as a customer and favorite item, plus a master Customer Index sheet and a leads sheet for people who have not bought yet. Use whenever Amoz asks to build, update, refresh or look something up in the customer database, customer folders or customer files, or asks things like "who are my best customers", "what has this customer bought", "what's her lifetime value", "how long has he been a customer", "what's their favorite item", "pull up everything on this customer", or "add the new orders to the customer folders" - even if the word "database" is never used.
---

# ChoZen Customer Database

One folder per buyer in Google Drive, built from the systems that already hold the truth. The numbers are computed by a script, never estimated, and every profile says where each fact came from.

## Why it works this way

- **Customer data never goes in the git repo.** Names, emails and order history are personal data, and git history is permanent. All working files live in the session scratch directory; the finished database lives only in Drive.
- **Shopify is the system of record** for who bought what. Etsy and TikTok Shop orders already sync into it, so one pull covers every channel. Klaviyo and Gmail add the "messages" layer.
- **The script does the arithmetic** and cross-checks every customer against Shopify's own totals. Because order data is transcribed from a tool response into a file, that check is what makes the numbers trustworthy. Do not skip it or hand-compute around it.
- **Flags instead of silent fixes.** Duplicates, masked emails and insiders are flagged for Amoz to decide on. Never merge, delete or exclude a customer on your own judgment.

## Definitions (keep these stable so refreshes are comparable)

| Field | Definition |
|---|---|
| Customer | A Shopify customer record with at least one order. Everyone else is a lead. |
| Lifetime value | Shopify `amountSpent`: order totals including tax and shipping, minus refunds. |
| Customer since | The earlier of the Shopify profile creation date and the first order's `processedAt` (any order, cancelled or not). |
| Favorite item | Product title with the most units on non-cancelled orders (refunded units are not subtracted); ties go to higher spend, then most recent, and the label says which rule decided. With a single unit bought it is labelled "only purchase so far" rather than dressed up as a preference. |
| Messages | Gmail threads to or from the customer's address, Klaviyo email/SMS activity, and Shopify customer and order notes. |

## Workflow

Work in `<scratchpad>/customers-work/` (create it; never inside the repo).

### 1. Pull buyers and orders from Shopify

Load the Shopify `admin-graphql` skill first, then run the two queries in `references/data-format.md`. Confirm `customersCount` and `ordersCount` so you know what "all" means, and page until `hasNextPage` is false. Write the result to `customers.json` in the format that file describes. Use each order's `processedAt` as its date.

### 2. Build the files

```bash
python3 <skill>/scripts/build_customer_files.py <scratchpad>/customers-work --today YYYY-MM-DD
```

It rebuilds `out/` from scratch and prints customers, orders entered (completed and cancelled) and total lifetime value.

- **Orders entered vs Shopify `ordersCount`:** these should match. If Shopify has more, the difference is orders with no customer record attached (query `orders` and look for a null `customer`); report how many and their total rather than ignoring them.
- **"CHECKS FAILED":** nothing is written. First compare `customers.json` with the Shopify response and fix any transcription slip. If the file already matches Shopify and the check still fails, stop and report it to Amoz with the two figures. Pending, voided or partly refunded orders can make Shopify's amount spent differ from the simple sum, and that needs a human decision. Never adjust a figure to make the check pass.

### 3. Gather messages (per customer)

Write `messages/<customer_id>.json` (format in `references/data-format.md`), then rerun the script.

- **Gmail**: search `from:<email> OR to:<email>`. Search results only preview a thread, so call `get_thread` before summarizing anything you will quote as what the customer said. Log date, direction, subject, a one-line summary and the thread link. Do not paste full email bodies into the folder.
- **Klaviyo**: find the profile by email (`equals(email,"...")`), then pull that profile's events. Report counts and the most recent few for Received Email, Opened Email, Clicked Email and the text-message equivalents, plus subscription status. This is engagement history, so label it that way. Keep these calls lean: look up many profiles in one call with `any(email,[...])`, and for events request only `fields_event: ["datetime", "event_properties.Subject"]` with a small `page_size`, filtered to one message metric at a time (`equals(metric_id,"...")` from `get_metrics`). Unfiltered event pulls are mostly site-browsing noise and are very large. If you stop before the last page, say how many events were reviewed.
- **Shopify**: customer and order notes are already in `customers.json`; the script adds them to the Messages doc itself.

Some customers cannot have messages gathered. Say so in the file rather than leaving it blank:
- No email on file (manual/draft orders): `"gmail_status": "No email address on file."`
- TikTok Shop masked addresses (`@scs.tiktokw.us`): messages live in TikTok Seller Center, which is not connected.
- Etsy buyers: Etsy conversations live in Etsy, which is not connected. Gmail and Klaviyo may still have something.

If a "customer's" Gmail results are internal business mail (cc'd on vendor, legal or supplier threads), they are probably a team member or family. Add `"insider_possible"` to that customer's `flags` in `customers.json`, do not log the business threads as customer messages, and tell Amoz.

### 4. Leads sheet (non-buyers)

Pull customers with `orders_count:0` into `leads.json` and rerun the script. One sheet, no folders.

### 5. Publish to Google Drive

1. Search Drive for a folder titled `ChoZen Customers` owned by the user. Reuse it if it exists; otherwise create it. Never create a second one.
2. Inside it, create one folder per customer using the names in `out/manifest.json`, and set each folder's description to `Shopify customer <id>` so later runs can find it by ID even if the name changes. Upload `Profile.md` and `Messages.md`, titled `Profile - <folder name>` and `Messages - <folder name>`, with `contentMimeType: text/markdown` (converts to Google Docs). Upload the files the script wrote rather than retyping them: where the Drive tool accepts a file reference, pass `base64Content` as `sha256:<hash>:<absolute path>` (get the hash with `sha256sum`).
3. Upload `Customer Index.csv` and `Leads (no purchase yet).csv` to the root with `contentMimeType: text/csv` (converts to Sheets).
4. Leave sharing alone. The folder stays private to the owner; never share it or change link visibility.

**First build or a format change: pilot first.** Publish three varied customers (a repeat buyer, a marketplace buyer, a simple one), give Amoz the Drive link, and wait for a yes before publishing the rest. A wrong format caught at three folders is a two-minute fix; at forty it is a cleanup job.

**Refresh:** rebuild from a fresh Shopify pull. Match existing folders by the `Shopify customer <id>` description, not by name. In a matched folder, upload the new docs first, then trash only the older files titled exactly `Profile - ...` or `Messages - ...` (and the older `Customer Index` / `Leads (no purchase yet)` sheets in the root). Check `canTrash` first and skip anything Drive refuses. Everything else in a customer folder was put there by Amoz: leave it alone. Never trash a customer folder, even if that customer no longer appears in Shopify; list it in the report instead.

### 6. Report

Tell Amoz, in this order: the Drive link; how many customers, orders and total lifetime value; the top five by lifetime value; every flag raised and what decision it needs; what could not be gathered and why. Separate what was verified in the source systems from what was inferred.

## Flags

| Flag | Meaning | Decision for Amoz |
|---|---|---|
| `possible_duplicate_name` | Two customer records share a name | Same person? Merge in Shopify. |
| `tiktok_masked_email` | TikTok hides the real address | None; cannot be emailed directly. |
| `no_email_on_file` | Manual order with no contact info | Add contact details in Shopify if known. |
| `no_completed_orders` | Every order on the record was cancelled | Keep as a customer, or treat as a lead? |
| `etsy_sync_date` | Etsy orders from different customers landed within 15 minutes of each other, so the true purchase date is earlier than shown | Tenure is understated; check Etsy for real dates. |
| `insider_possible` | Address appears on internal business email | Keep, or exclude from customer stats? |
| `ltv_check_failed` / `order_count_check_failed` | Entered orders disagree with Shopify | The script refuses to write files; see step 2. |

## Answering lookups

For "what has X bought" or "who are my best customers", read the Customer Index sheet or the customer's Profile doc in Drive if the database was built recently; say the build date. If it is stale or the question is about a recent order, query Shopify directly and offer a refresh.
