import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

const source = (file) => readFileSync(new URL(`../assets/${file}`, import.meta.url), 'utf8');
const utilities = source('utilities.js');
const helpers = utilities.slice(
  utilities.indexOf('export function shouldDisableCrossDocumentViewTransitions'),
  utilities.indexOf('/**', utilities.indexOf('export function isHistoryRestore'))
).replaceAll('export ', '');

function environment(type = 'navigate') {
  class Component extends EventTarget {
    dataset = { sectionId: 'cart' };
    refs = {};
    connectedCallback() {}
    disconnectedCallback() {}
  }
  const elements = new Map();
  const calls = [];
  const warnings = [];
  const context = vm.createContext({
    Component, Event, EventTarget,
    window: new EventTarget(),
    document: Object.assign(new EventTarget(), { querySelectorAll: () => [] }),
    performance: { getEntriesByType: () => [{ type }] },
    navigator: { userAgent: 'Safari', hardwareConcurrency: 8, deviceMemory: 8 },
    customElements: { get: (name) => elements.get(name), define: (name, value) => elements.set(name, value) },
    ThemeEvents: { cartUpdate: 'cart:update', discountUpdate: 'discount:update', quantitySelectorUpdate: 'quantity:update', cartSectionRestored: 'cart:section-restored' },
    debounce: (fn) => fn,
    sectionRenderer: { renderSection: async (...args) => { calls.push(args); } },
    console: { warn: (...args) => warnings.push(args) },
    Theme: { routes: { cart_url: '/es/cart' } },
    fetch: async (...args) => { calls.push(args); return { ok: true, json: async () => ({ item_count: 7 }) }; },
  });
  vm.runInContext(helpers, context);
  return { context, elements, calls, warnings };
}

function load(file, env) {
  vm.runInContext(source(file).replace(/import\s+[\s\S]*?\sfrom\s+['"][^'"]+['"];\n/g, ''), env.context);
}

const settle = () => new Promise((resolve) => setImmediate(resolve));

for (const ua of ['Instagram 320', 'FBAN/FBIOS;FBAV/450', 'Android 14; wv)', 'TikTok 33', 'BytedanceWebview/1']) {
  test(`disables transitions for ${ua}`, () => {
    const env = environment();
    assert.equal(env.context.shouldDisableCrossDocumentViewTransitions(ua), true);
  });
}

test('keeps transitions available in regular browsers', () => {
  const env = environment();
  for (const ua of ['Mozilla/5.0 Safari/605.1.15', 'Mozilla/5.0 Android 14 Chrome/128.0', 'Firefox/130', '']) {
    assert.equal(env.context.shouldDisableCrossDocumentViewTransitions(ua), false);
  }
});

for (const [type, persisted, expected] of [['navigate', false, 0], ['reload', false, 0], ['navigate', true, 1], ['back_forward', false, 1]]) {
  test(`cart restore: ${type}, persisted=${persisted}`, async () => {
    const env = environment(type);
    load('component-cart-items.js', env);
    const cart = new (env.elements.get('cart-items-component'))();
    let restored = 0;
    let buttonsUpdated = 0;
    env.context.document.querySelectorAll = () => [{ updateButtonStates: () => buttonsUpdated++ }];
    cart.addEventListener('cart:section-restored', () => restored++);
    cart.connectedCallback();
    env.context.window.dispatchEvent(Object.assign(new Event('pageshow'), { persisted }));
    await settle();
    assert.equal(env.calls.length, expected);
    assert.equal(restored, expected);
    assert.equal(buttonsUpdated, expected);
    if (expected) assert.equal(env.calls[0][1].cache, false);
    cart.disconnectedCallback();
    env.context.window.dispatchEvent(Object.assign(new Event('pageshow'), { persisted: true }));
    await settle();
    assert.equal(env.calls.length, expected);
  });
}

test('cart without section ID does not fetch or throw', async () => {
  const env = environment();
  load('component-cart-items.js', env);
  const cart = new (env.elements.get('cart-items-component'))();
  cart.dataset = {};
  cart.connectedCallback();
  env.context.window.dispatchEvent(Object.assign(new Event('pageshow'), { persisted: true }));
  await settle();
  assert.equal(env.calls.length, 0);
});

test('cart restore errors are caught; aborts are silent', async () => {
  const env = environment();
  load('component-cart-items.js', env);
  const cart = new (env.elements.get('cart-items-component'))();
  cart.connectedCallback();
  for (const name of ['AbortError', 'Error']) {
    env.context.sectionRenderer.renderSection = async () => { throw Object.assign(new Error('failed'), { name }); };
    env.context.window.dispatchEvent(Object.assign(new Event('pageshow'), { persisted: true }));
    await settle();
  }
  assert.equal(env.warnings.length, 1);
});

test('counter fetches locale-aware current cart on history restore', async () => {
  const env = environment('back_forward');
  load('cart-icon.js', env);
  const icon = new (env.elements.get('cart-icon'))();
  const rendered = [];
  icon.renderCartBubble = (...args) => rendered.push(args);
  await icon.onPageShow({ persisted: false });
  assert.equal(env.calls[0][0], '/es/cart.js');
  assert.equal(env.calls[0][1].cache, 'no-store');
  assert.deepEqual(rendered, [[7, false, false]]);
});

test('counter avoids fetching on ordinary navigation and falls back on failure', async () => {
  const env = environment();
  load('cart-icon.js', env);
  const icon = new (env.elements.get('cart-icon'))();
  let fallback = 0;
  icon.ensureCartBubbleIsCorrect = () => fallback++;
  await icon.onPageShow({ persisted: false });
  assert.equal(env.calls.length, 0);
  env.context.fetch = async () => ({ ok: false, status: 503 });
  await icon.onPageShow({ persisted: true });
  assert.equal(fallback, 1);
  assert.equal(env.warnings.length, 1);
});

for (const [ua, reduced, activation, disabled, removed] of [
  ['Instagram', false, undefined, true, true],
  ['Safari', false, undefined, false, false],
  ['Safari', true, undefined, false, true],
  ['Safari', false, { from: null, navigationType: 'push' }, false, true],
  ['Safari', false, { from: {}, navigationType: 'reload' }, false, true],
]) {
  test(`cross-document guard ${ua}, reduced=${reduced}, activation=${activation?.navigationType}`, async () => {
    const env = environment();
    let removes = 0;
    const styles = [];
    env.context.navigator.userAgent = ua;
    env.context.window.matchMedia = () => ({ matches: reduced });
    env.context.window.navigation = activation ? { activation } : undefined;
    env.context.document.getElementById = () => ({ remove: () => removes++ });
    env.context.document.createElement = () => ({});
    env.context.document.head = { appendChild: (style) => styles.push(style) };
    env.context.performance.now = () => 100;
    env.context.setTimeout = () => {};
    vm.runInContext(source('view-transitions.js'), env.context);
    assert.equal(styles.length > 0, disabled);
    assert.equal(removes > 0, removed);
    env.context.window.dispatchEvent(Object.assign(new Event('pagereveal'), { viewTransition: null }));
    await settle();
  });
}

test('in-document transitions run callbacks without using API in in-app browsers', async () => {
  const env = environment();
  env.context.navigator.userAgent = 'Instagram';
  env.context.supportsViewTransitions = () => true;
  env.context.isLowPowerDevice = () => false;
  env.context.prefersReducedMotion = () => false;
  let calls = 0;
  env.context.document.startViewTransition = () => { throw new Error('must not call transition API'); };
  const start = utilities.slice(utilities.indexOf('export function startViewTransition'), utilities.indexOf('/**', utilities.indexOf('export function startViewTransition'))).replace('export ', '');
  vm.runInContext(start, env.context);
  await env.context.startViewTransition(() => calls++);
  assert.equal(calls, 1);
});

test('drawer remeasures sticky summary after restore and removes listener on disconnect', () => {
  const env = environment();
  env.context.DialogComponent = env.context.Component;
  env.context.DialogOpenEvent = { eventName: 'dialog:open' };
  env.context.DialogCloseEvent = { eventName: 'dialog:close' };
  env.context.CartAddEvent = { eventName: 'cart:add' };
  env.context.history = { state: null };
  load('cart-drawer.js', env);
  const drawer = new (env.elements.get('cart-drawer-component'))();
  let summaryHeight = 20;
  const values = [];
  drawer.refs.dialog = {
    querySelector: (selector) => selector === '.cart-drawer__content' ? {} : { getBoundingClientRect: () => ({ height: summaryHeight }) },
    getBoundingClientRect: () => ({ height: 100 }),
    setAttribute: (...args) => values.push(args),
  };
  drawer.connectedCallback();
  drawer.dispatchEvent(new Event('cart:section-restored'));
  summaryHeight = 70;
  drawer.dispatchEvent(new Event('cart:section-restored'));
  drawer.disconnectedCallback();
  drawer.dispatchEvent(new Event('cart:section-restored'));
  assert.deepEqual(values, [['cart-summary-sticky', 'true'], ['cart-summary-sticky', 'false']]);
});
