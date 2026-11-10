# Deuteronomy 22:5 Maxi Dress — colorway funnels

One step-by-step landing funnel per colorway (23), plus a hub (`index.html`).
Each funnel: intro → size → fringes → delivery timing → review → Shopify checkout.

| Style | Colorways | Price | Last step |
|---|---|---|---|
| Original | 11 | $109.99 | Shopify cart permalink |
| Patent | 7 | $119.99 | Shopify cart permalink |
| Satin | 5 | $129.99 | Product is a Shopify **draft**, so it emails support instead |

## Rebuild

```bash
node funnels/deuteronomy-22-5/build.js
```

Pages are generated from `data/products.json`, a snapshot of the store taken
2026-11-10 (variant IDs, prices, images). Edit the data or the copy in
`build.js`, then rebuild — do not hand-edit the `.html` files.

- **Fringes:** jersey styles add the separate Fringing Service product ($10) to
  the cart; satin uses its own "with fringes" variant ($139.99).
- **Satin goes live:** set `productStatus` to `ACTIVE` on the five satin entries
  in `data/products.json` and rebuild. The final step becomes a checkout button.
- **Attribution:** each checkout carries the cart attribute `funnel=<page slug>`.
- **Hosting:** static files; serve this folder from any static host. Images load
  from the Shopify CDN.
- Brand hex values in `assets/funnel.css` are working assumptions.
