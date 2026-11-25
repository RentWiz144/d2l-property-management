# Data format and Shopify queries

All sample values below are invented.

## Shopify queries

Counts (to know what "all" means):

```graphql
query { customersCount { count precision } ordersCount(limit: null) { count precision } }
```

Buyers with their orders (page with `first`/`after` until `hasNextPage` is false):

```graphql
query Buyers($first: Int!, $after: String) {
  customers(first: $first, after: $after, query: "orders_count:>0", sortKey: CREATED_AT) {
    pageInfo { hasNextPage endCursor }
    nodes {
      id displayName defaultEmailAddress { emailAddress } createdAt numberOfOrders
      amountSpent { amount currencyCode } note tags
      orders(first: 20) { nodes {
        name processedAt cancelledAt sourceName displayFinancialStatus note
        totalPriceSet { shopMoney { amount } } totalRefundedSet { shopMoney { amount } }
        lineItems(first: 20) { nodes { title variantTitle quantity discountedTotalSet { shopMoney { amount } } } }
      } }
    }
  }
}
```

A customer with 20 orders or 20 line items on one order has hit the page limit: fetch the rest for that customer before building. The script's order-count check will catch a missed order, but not a missed line item.

Leads: same `customers` query with `query: "orders_count:0"`, selecting `displayName`, `defaultEmailAddress { emailAddress marketingState }`, `createdAt`, `tags`.

## customers.json

```json
{
  "store": "ChoZen Unlimited",
  "currency": "USD",
  "pulled_on": "2026-01-15",
  "customers": [
    {
      "id": "1234567890123",
      "name": "Jane Example",
      "email": "jane@example.com",
      "created_at": "2025-06-01T14:00:00Z",
      "shopify_amount_spent": "208.98",
      "shopify_order_count": 2,
      "tags": ["Login with Shop"],
      "note": null,
      "flags": [],
      "orders": [
        {
          "name": "#2001",
          "date": "2025-06-01T14:02:00Z",
          "source": "web",
          "total": "108.98",
          "refunded": "0.0",
          "cancelled": false,
          "note": null,
          "items": [
            {"title": "Example Maxi Dress", "variant": "Pink / XL", "qty": 1, "amount": "99.99"}
          ]
        }
      ]
    }
  ]
}
```

- `id`: digits after `gid://shopify/Customer/`.
- `email`: `null` when Shopify has none.
- `shopify_amount_spent`, `shopify_order_count`: copied from Shopify as-is; the script checks the orders against them.
- `date`: the order's `processedAt`. `source`: the order's `sourceName`. `cancelled`: true when `cancelledAt` is set.
- `items[].amount`: `discountedTotalSet` for the line. Item amounts exclude tax and shipping, so they will not add up to the order total; that is expected.
- `store` and `pulled_on` are printed in each profile's header. `currency` is informational: amounts are shown with `$`.
- A date without a time is read as midnight UTC.
- `excluded`: optional. Set to a short reason string (for example `"insider: owner decision 2026-01-15"`) only when Amoz has said to leave this record out. Excluded records get no folder and are left out of the index and totals; the script prints them separately so the order count still reconciles with Shopify.
- `flags`: only flags you add by judgment (such as `insider_possible`). The script adds the rest.

Channel names come from `source`: `web` Online store, `tiktok` TikTok Shop, `shopify_draft_order` Manual order (draft), `pos` Point of sale, and `279941` or an order name starting `ETSY_COM` Etsy. `3890849` is mapped to Shop app by inference from the "Login with Shop" tags on those customers, not from Shopify documentation. An unknown source shows as `Other (<value>)`; add it to `SOURCES` in the script once identified.

## messages/<customer_id>.json

```json
{
  "gmail": [
    {"date": "2025-06-03", "direction": "from customer", "subject": "Sizing question",
     "summary": "Asked whether the dress runs large; we replied the same day.", "link": "https://mail.google.com/..."}
  ],
  "gmail_status": "Searched 2026-01-15, nothing found.",
  "klaviyo": [
    {"date": "2025-06-10", "direction": "opened", "subject": "New arrivals"}
  ],
  "klaviyo_status": "No Klaviyo profile for this address."
}
```

Each section is a list of entries; when the list is empty the matching `_status` line is printed instead, so always say why a section is empty. A section may also be a plain string for a short summary. The Shopify notes section is filled in by the script from the customer and order notes in `customers.json`, so do not enter it here.

## leads.json

```json
{"leads": [{"name": "Sam Example", "email": "sam@example.com", "created_at": "2025-07-01T10:00:00Z", "marketing": "SUBSCRIBED", "tags": []}]}
```
