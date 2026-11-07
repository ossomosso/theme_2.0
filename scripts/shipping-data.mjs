export const shippingQuery = `query ShippingSnapshot {
  deliveryProfiles(first: 50) {
    pageInfo { hasNextPage }
    nodes {
      id default
      profileItems(first: 50) {
        pageInfo { hasNextPage }
        nodes { product { id } }
      }
      profileLocationGroups {
        locationGroupZones(first: 50) {
          pageInfo { hasNextPage }
          nodes {
            zone { countries { code { countryCode restOfWorld } provinces { code } } }
            methodDefinitions(first: 50) {
              pageInfo { hasNextPage }
              nodes {
                active
                rateProvider { __typename ... on DeliveryRateDefinition { price { amount currencyCode } } }
                methodConditions {
                  field operator
                  conditionCriteria { __typename ... on MoneyV2 { amount currencyCode } }
                }
              }
            }
          }
        }
      }
    }
  }
}`;

export function normalizeShipping(data, now = new Date()) {
  const connection = data.deliveryProfiles;
  const profiles = connection.nodes;
  const base = { version: 1, updatedAt: now.toISOString(), supported: false, products: [], zones: [] };
  if (connection.pageInfo?.hasNextPage || profiles.length !== 1 || !profiles[0].default) return base;
  const profile = profiles[0];
  if (profile.profileItems.pageInfo.hasNextPage || profile.profileLocationGroups.length !== 1) return base;
  const zoneConnection = profile.profileLocationGroups[0].locationGroupZones;
  if (zoneConnection.pageInfo.hasNextPage) return base;
  const zones = [];
  for (const entry of zoneConnection.nodes) {
    if (entry.methodDefinitions.pageInfo.hasNextPage) return base;
    const rates = [];
    let unsupported = false;
    for (const method of entry.methodDefinitions.nodes.filter(m => m.active)) {
      const price = method.rateProvider?.price;
      if (!price || !Number.isFinite(Number(price.amount)) || Number(price.amount) < 0) { unsupported = true; continue; }
      let minimum = 0;
      for (const condition of method.methodConditions) {
        const criteria = condition.conditionCriteria;
        if (condition.field !== 'TOTAL_PRICE' || condition.operator !== 'GREATER_THAN_OR_EQUAL_TO' ||
            criteria.__typename !== 'MoneyV2' || criteria.currencyCode !== price.currencyCode ||
            !Number.isFinite(Number(criteria.amount)) || Number(criteria.amount) < 0) {
          unsupported = true;
          break;
        }
        minimum = Math.max(minimum, Number(criteria.amount));
      }
      rates.push({ amount: Number(price.amount), currency: price.currencyCode, minimum });
    }
    zones.push({ countries: entry.zone.countries.map(c => ({ code: c.code.countryCode, restOfWorld: c.code.restOfWorld,
      provinces: c.provinces.map(p => p.code) })), rates: unsupported ? [] : rates });
  }
  return { ...base, supported: true, products: profile.profileItems.nodes.map(i => i.product.id.split('/').pop()), zones };
}
