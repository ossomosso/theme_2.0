# Shopify shipping information

The editable `Ossomosso - Shipping` block is enabled after the buy buttons in all product templates. English and Spanish strings live in the theme language files. Country, currency, policy links and enabled payment methods come from Liquid.

Rates are a public, timestamped snapshot of Admin API delivery profiles. No credentials, customer data or addresses are shipped to browsers. The renderer does not modify the cart. Rates are country-level guidance; final options depend on the delivery address and order contents at checkout. No delivery dates are invented from rates.

## Activate automatic sync

1. Create a dedicated app in the same Shopify organization as `e730p1-1f.myshopify.com`. Give it only `read_shipping` and `read_products`, then install it on Ossomosso. No access to orders or customers is required.
2. In this repository's GitHub Actions secrets, save its client ID as `SHOPIFY_SHIPPING_CLIENT_ID` and client secret as `SHOPIFY_SHIPPING_CLIENT_SECRET`. Do not commit credentials or put them in theme settings.
3. Allow the workflow to write repository contents. If branch protection requires pull requests, configure an approved integration path before enabling the scheduled sync.
4. Merge to `main`, then run **Sync Shopify shipping information** manually and check success and theme synchronization. GitHub schedules are best-effort and may be delayed.

The workflow obtains a fresh 24-hour token each run, reads Shopify settings and commits only `assets/ossomosso-shipping-data.json`. It runs hourly. The connected GitHub theme publishes the new data. API/network failures leave the previous snapshot in place; data older than 36 hours stops displaying prices.

The initial snapshot was read directly from Shopify on 7 November 2026. Its presence does not mean the scheduled integration has been activated.

## Conservative handling

The current shop has one general profile, one location group, and ten products. Multiple profiles/location groups, truncated query results, carrier-calculated rates, weight conditions or unsupported price conditions produce a checkout fallback. A new product is included on the next sync. Non-EUR markets do not receive invented currency conversions. Multiple zones for a country also use the fallback because a province/address is required.

The sync is read-only in Shopify and never changes shipping charges. To extend support for more complex profiles, update the normalizer and add fixtures before exposing rates.

Run `node --test tests/shipping-info.test.mjs` for country, currency, stale-data and unsupported-condition coverage.
