document.addEventListener('variant:update', (event) => {
  const data = event.detail?.data;
  if (!data?.html) return;
  const incoming = data.html.querySelector('product-form-component [ref="addToCartButton"]');
  if (!incoming) return;
  const productId = String(data.newProduct?.id ?? data.productId);
  for (const form of document.querySelectorAll('product-form-component')) {
    if (form.dataset.productId !== productId) continue;
    const button = form.querySelector('[ref="addToCartButton"]');
    if (!button) continue;
    for (const property of ['--osso-button-face', '--osso-button-ink', '--osso-button-type-shadow']) {
      const value = incoming.style.getPropertyValue(property);
      if (value) button.style.setProperty(property, value);
      else button.style.removeProperty(property);
    }
  }
});
