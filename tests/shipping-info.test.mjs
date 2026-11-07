import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { normalizeShipping } from '../scripts/shipping-data.mjs';
globalThis.HTMLElement = class {};
globalThis.customElements = { get: () => true };
const source = await readFile(new URL('../assets/ossomosso-shipping.js', import.meta.url), 'utf8');
const { shippingForCountry } = await import('data:text/javascript,' + encodeURIComponent(source));
const snapshot = {
  version: 1, supported: true, updatedAt: '2026-11-07T12:00:00Z', products: ['1'],
  zones: [
    { countries: [{ code: 'ES' }], rates: [{ amount: 5.99, currency: 'EUR', minimum: 0 }, { amount: 0, currency: 'EUR', minimum: 69 }] },
    { countries: [{ code: 'FR' }], rates: [{ amount: 8.99, currency: 'EUR', minimum: 0 }] },
    { countries: [{ code: 'US' }], rates: [{ amount: 19.99, currency: 'EUR', minimum: 0 }] }
  ]
};
const now = Date.parse(snapshot.updatedAt);
const product = snapshot.products[0];
test('Shopify Spain rates and free threshold are selected without converting market currencies', () => {
  assert.deepEqual(shippingForCountry(snapshot, 'ES', 'EUR', product, now), { paid: 5.99, free: 69 });
  assert.equal(shippingForCountry(snapshot, 'ES', 'USD', product, now), null);
});
test('European and US zones do not inherit Spain free shipping', () => {
  assert.deepEqual(shippingForCountry(snapshot, 'FR', 'EUR', product, now), { paid: 8.99, free: undefined });
  assert.deepEqual(shippingForCountry(snapshot, 'US', 'EUR', product, now), { paid: 19.99, free: undefined });
  assert.equal(shippingForCountry(snapshot, 'GB', 'GBP', product, now), null);
});
test('stale, incomplete or ambiguous data shows checkout fallback', () => {
  assert.equal(shippingForCountry(snapshot, 'ES', 'EUR', product, now + 37 * 3600000), null);
  assert.equal(shippingForCountry(snapshot, 'ES', 'EUR', 'missing-product', now), null);
  assert.equal(shippingForCountry({ ...snapshot, zones: [...snapshot.zones, snapshot.zones[0]] }, 'ES', 'EUR', product, now), null);
});
function fixture(conditions = []) {
  return { deliveryProfiles: { pageInfo: { hasNextPage: false }, nodes: [{ default: true,
    profileItems: { pageInfo: { hasNextPage: false }, nodes: [{ product: { id: 'gid://shopify/Product/1' } }] },
    profileLocationGroups: [{ locationGroupZones: { pageInfo: { hasNextPage: false }, nodes: [{
      zone: { countries: [{ code: { countryCode: 'ES', restOfWorld: false }, provinces: [] }] },
      methodDefinitions: { pageInfo: { hasNextPage: false }, nodes: [{ active: true,
        rateProvider: { price: { amount: '0', currencyCode: 'EUR' } }, methodConditions: conditions }] }
    }] } }]
  }] } };
}
test('unsupported weight/maximum conditions never create false free shipping', () => {
  const unsupported = normalizeShipping(fixture([{ field: 'TOTAL_WEIGHT', operator: 'LESS_THAN_OR_EQUAL_TO', conditionCriteria: { __typename: 'Weight' } }]));
  assert.deepEqual(unsupported.zones[0].rates, []);
  const capped = normalizeShipping(fixture([{ field: 'TOTAL_PRICE', operator: 'LESS_THAN_OR_EQUAL_TO', conditionCriteria: { __typename: 'MoneyV2', amount: '70', currencyCode: 'EUR' } }]));
  assert.deepEqual(capped.zones[0].rates, []);
});
test('profile changes and pagination fail closed instead of using an incorrect global rate', () => {
  const extraProfile = fixture();
  extraProfile.deliveryProfiles.nodes.push({ default: false });
  assert.equal(normalizeShipping(extraProfile).supported, false);
  const incomplete = fixture();
  incomplete.deliveryProfiles.nodes[0].profileItems.pageInfo.hasNextPage = true;
  assert.equal(normalizeShipping(incomplete).supported, false);
});
