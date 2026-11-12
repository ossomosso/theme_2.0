# Black Friday 2026

Active from 12 November 2026. No scheduled end: the owner will request deactivation.

- 30% on the four green/white corded-lamp variants.
- 20% on the nine remaining corded-lamp variants, including beige.
- 15% on the three vase variants.
- Battery lamps, RGB upgrades, draft/test products excluded.

The exact variant IDs, base prices and native Shopify discount IDs are saved in `black-friday-2026.json`. Shopify prices and compare-at prices were not changed. Three automatic product discounts apply at cart and checkout. They can combine across different eligible products, but not with order or shipping discounts. WELCOMEHOME10 is an existing order discount with combinations disabled, and the mixed-cart test confirmed it does not stack.

Theme setting **Black Friday → Show Black Friday campaign** controls the announcement, seasonal copy in the existing homepage hero, advertised variant prices, percentage badges and newsletter messaging. Strings are in the English and Spanish locale files and can be translated through the theme language editor / Translate & Adapt. No customer-facing text was baked into an image, and no new image upload was needed.

## Ending the campaign

1. In Shopify **Discounts**, deactivate the three `Black Friday · 30%`, `Black Friday · 20%`, `Black Friday · 15%` automatic discounts. Use the IDs saved in the JSON to avoid changing unrelated discounts.
2. Set `black_friday_enabled` to `false` in the live theme settings (or commit the single settings change through GitHub).
3. Verify that the original announcement, homepage copy and newsletter offer return, and that prices in cards/PDP/cart show the original amounts. There is no need to revert or switch Git branches. Keep the campaign code dormant for reuse.

Changing only the theme switch does not deactivate checkout discounts; changing only the discounts does not update advertised prices. Perform both steps together.

## Validation

- Shopify theme validation passed; only existing unused-variable/style warnings.
- Admin GraphQL discount-create mutation validated against 2026-10.
- Isolated cart (separate cookie jar; no order placed and no customer cart altered): Tulipa green 38.50 + Grasshopper blue 39.20 + Organic 38.25 + Brisa Portable green 79 + RGB upgrade 10 = **204.95 EUR**. All three percentages applied together and both excluded items stayed unchanged. Adding WELCOMEHOME10 left the total at 204.95 EUR. Test cart cleared afterwards.
- Browser verified dynamic Brisa green 45.50 → blue 52, and RGB upgrade blue total 62. English and Spanish seasonal text verified.
