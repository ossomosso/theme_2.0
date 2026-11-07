import { writeFile } from 'node:fs/promises';
import { shippingQuery, normalizeShipping } from './shipping-data.mjs';

const shop = process.env.SHOPIFY_SHOP;
const clientId = process.env.SHOPIFY_CLIENT_ID;
const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
if (!/^[a-z0-9-]+\.myshopify\.com$/.test(shop || '') || !clientId || !clientSecret) {
  throw new Error('Configure SHOPIFY_SHOP, SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET in GitHub Actions secrets.');
}
const auth = await fetch(`https://${shop}/admin/oauth/access_token`, {
  method: 'POST', signal: AbortSignal.timeout(20000),
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ grant_type: 'client_credentials', client_id: clientId, client_secret: clientSecret })
});
if (!auth.ok) throw new Error(`Shopify authentication failed (${auth.status}).`);
const { access_token: token } = await auth.json();
if (!token) throw new Error('Shopify did not return an access token.');
const response = await fetch(`https://${shop}/admin/api/2026-10/graphql.json`, {
  method: 'POST', signal: AbortSignal.timeout(30000),
  headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
  body: JSON.stringify({ query: shippingQuery })
});
if (!response.ok) throw new Error(`Shipping query failed (${response.status}).`);
const result = await response.json();
if (result.errors || !result.data?.deliveryProfiles) throw new Error('Shopify could not return complete shipping data. Check app scopes read_shipping and read_products.');
const snapshot = normalizeShipping(result.data);
await writeFile(new URL('../assets/ossomosso-shipping-data.json', import.meta.url), JSON.stringify(snapshot, null, 2) + '\n');
console.log(snapshot.supported ? `Synced ${snapshot.zones.length} shipping zones.` : 'Complex shipping configuration detected. Showing checkout fallback.');
