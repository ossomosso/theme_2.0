export function shippingForCountry(data, country, currency, product, now = Date.now()) {
  const age = now - Date.parse(data.updatedAt);
  if (data.version !== 1 || !data.supported || !Number.isFinite(age) || age < -300000 || age > 36 * 3600000 ||
      !data.products?.includes(String(product))) return null;
  const explicit = data.zones.filter(z => z.countries.some(c => c.code === country));
  const matches = explicit.length ? explicit : data.zones.filter(z => z.countries.some(c => c.restOfWorld));
  if (matches.length !== 1) return null;
  const rates = matches[0].rates;
  if (!rates.length || rates.some(r => r.currency !== currency)) return null;
  const paid = rates.filter(r => r.amount > 0 && r.minimum === 0).sort((a, b) => a.amount - b.amount)[0];
  const free = rates.filter(r => r.amount === 0).sort((a, b) => a.minimum - b.minimum)[0];
  return paid || free ? { paid: paid?.amount, free: free?.minimum } : null;
}

let snapshot;
class OssomossoShipping extends HTMLElement {
  connectedCallback() {
    const config = this.querySelector('[data-shipping-config]');
    if (!config) return;
    this.config = JSON.parse(config.textContent);
    snapshot ||= fetch(this.dataset.source, { credentials: 'omit' }).then(r => {
      if (!r.ok) throw new Error('Shipping data unavailable');
      return r.json();
    });
    snapshot.then(data => this.renderRates(data)).catch(() => {});
  }
  renderRates(data) {
    const rate = shippingForCountry(data, this.dataset.country, this.dataset.currency, this.dataset.product);
    if (!rate) return;
    const currency = new Intl.NumberFormat(this.dataset.locale || 'en', { style: 'currency', currency: this.dataset.currency });
    const output = [];
    if (rate.paid !== undefined && rate.free !== 0) output.push(this.config.shipping_from.replace('[amount]', currency.format(rate.paid)));
    if (rate.free !== undefined) output.push(rate.free === 0 ? this.config.free_shipping : this.config.free_from.replace('[amount]', currency.format(rate.free)));
    const target = this.querySelector('[data-shipping-rates]');
    target.replaceChildren(...output.map(text => {
      const line = document.createElement('span');
      line.textContent = text;
      return line;
    }));
    target.hidden = output.length === 0;
  }
}
if (!customElements.get('ossomosso-shipping')) customElements.define('ossomosso-shipping', OssomossoShipping);
