import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { test } from 'node:test';

const directory = new URL('../templates/', import.meta.url);
const readTemplate = (name) => JSON.parse(readFileSync(new URL(name, directory), 'utf8').replace(/\/\*[\s\S]*?\*\//g, ''));
const names = readdirSync(directory).filter((name) => /^product(?:\..+)?\.json$/.test(name));
const standaloneTypes = new Set(['marquee', 'ossomosso-marquee', 'ossomosso-product-marquee']);

for (const filename of names) {
  const template = readTemplate(filename);
  const stories = Object.values(template.sections).filter((s) => s.type === 'ossomosso-product-story');
  if (!stories.length) continue;
  test(filename + ': one standalone shared marquee', () => {
    const active = template.order.map((id) => template.sections[id]).filter((s) => !s.disabled);
    assert.equal(active.filter((s) => standaloneTypes.has(s.type)).length, 1);
    const marquee = active.find((s) => standaloneTypes.has(s.type));
    assert.equal(marquee.type, 'ossomosso-marquee');
    assert.ok(marquee.settings.marquee_items.includes('Made in Madrid'));
    assert.equal(marquee.settings.speed, 26);
    assert.equal(stories.length, 1);
    assert.equal('language' in stories[0].settings, false);
    assert.equal(Object.values(stories[0].blocks).some((b) => b.type === 'marquee'), false);
    assert.equal(template.order.includes('ossomosso_product_story_es'), false);
  });
  test(filename + ': eight editable FAQ rows at the end', () => {
    const id = template.order.at(-1);
    const faq = template.sections[id];
    assert.equal(faq.type, 'ossomosso-product-faq');
    assert.ok(!faq.disabled);
    assert.equal(faq.block_order.length, 8);
    for (const id of faq.block_order) {
      assert.equal(faq.blocks[id].type, 'question');
      assert.ok(faq.blocks[id].settings.question);
      assert.match(faq.blocks[id].settings.answer, /^<p>.+<\/p>$/s);
    }
    const name = filename.split('.')[1];
    const lamp = ['brisa', 'champi', 'grasshopper', 'tulipa'].includes(name);
    const firstAnswer = faq.blocks.question_1.settings.answer;
    if (lamp) assert.match(firstAnswer, /E14.*included/s);
    else {
      assert.match(firstAnswer, /watertight inner vessel/);
      assert.match(firstAnswer, /Do not pour water directly/);
      assert.equal(JSON.stringify(faq).includes('E14'), false);
    }
  });
  test(filename + ': icons and useful facts close to purchase', () => {
    const details = template.sections.main.blocks['product-details'];
    const facts = details.blocks.ossomosso_facts;
    assert.equal(facts.type, 'ossomosso-product-facts');
    assert.ok(!facts.disabled);
    assert.ok(details.block_order.indexOf('ossomosso_facts') > details.block_order.indexOf('buy_buttons_eYQEYi'));
    assert.equal(facts.settings.title_4, '90-day returns');
    for (let i = 1; i <= 4; i++) {
      assert.ok(facts.settings['icon_' + i]);
      assert.ok(facts.settings['title_' + i]);
      assert.ok(facts.settings['text_' + i]);
    }
  });
  test(filename + ': reuses alternating image/text blocks', () => {
    const story = stories[0];
    assert.equal(story.settings.image_radius, 20);
    assert.equal(story.blocks.details_mzHy3T.settings.media_position, 'left');
    assert.equal(story.blocks.details_mzHy3T.settings.show_accordion, false);
    assert.equal(story.blocks.highlight_daily.type, 'highlight');
    assert.ok(!story.blocks.highlight_daily.disabled);
    assert.equal(story.blocks.highlight_daily.settings.media_position, 'right');
    assert.match(story.blocks.highlight_daily.settings.media, /\.webp$/);
    assert.equal(story.block_order[1], 'highlight_daily');
  });
  test(filename + ': visible practical advice without fictional reviews', () => {
    const notes = stories[0].blocks.reviews_DTTrtr;
    assert.equal(notes.type, 'reviews');
    assert.equal(notes.disabled, false);
    assert.equal(notes.settings.rating_text, '');
    for (let i = 1; i <= 3; i++) {
      assert.ok(notes.settings['review_' + i + '_author']);
      assert.ok(notes.settings['review_' + i + '_text']);
    }
  });
  test(filename + ': purchase details are native editable text', () => {
    const accordion = template.sections.main.blocks['product-details'].blocks.accordion_g8EVVp;
    const body = accordion.blocks.accordion_row_VyFryh.blocks.text_McjMWz;
    assert.equal(body.type, 'text');
    assert.ok(body.settings.text);
    assert.equal('custom_liquid' in body.settings, false);
  });
}

test('Brisa preserves the image and colour edited in Shopify', () => {
  const template = readTemplate('product.brisa.json');
  assert.equal(template.sections.ossomosso_marquee.settings.background_color, '#2A241F');
  assert.equal(template.sections.ossomosso_marquee.settings.text_color, '#FFFFFF');
  assert.equal(template.sections.ossomosso_product_story_en.blocks.details_mzHy3T.settings.image, 'shopify://shop_images/Brisa_Ossomosso_Base-Roja_Cuadrada.webp');
});

test('related product images use their own product for accessible labels', () => {
  const gallery = readFileSync(new URL('../snippets/card-gallery.liquid', import.meta.url), 'utf8');
  assert.match(gallery, /render 'product-media', media: media, selected_product: product/);
});

test('story cannot reintroduce the nested marquee', () => {
  const story = readFileSync(new URL('../sections/ossomosso-product-story.liquid', import.meta.url), 'utf8');
  assert.equal(story.includes('marquee'), false);
  assert.equal(story.includes('section.settings.language'), false);
  const schema = JSON.parse(story.match(/{% schema %}([\s\S]*?){% endschema %}/)[1]);
  assert.equal(schema.blocks.some((b) => b.type === 'marquee'), false);
  assert.ok(story.includes('block.settings.media | default:'));
  assert.ok(story.includes('@media (min-width: 750px)'));
  assert.ok(story.includes('grid-column: 2; grid-row: 1;'));
  assert.ok(story.indexOf('highlight-media') < story.indexOf('highlight-copy'));
  assert.ok(story.includes('<dl class="osso-product-story__tech-grid">'));
  assert.ok(story.includes('<dt class="osso-product-story__tech-label">'));
  assert.ok(story.includes('<dd class="osso-product-story__tech-value">'));
  assert.ok(story.includes("'7,8,1,2,3,4,5,6' | split: ','"));
  assert.equal(story.includes('review-text::before'), false);
  assert.equal(story.includes('review-stars'), false);
});

test('marquee, icons and FAQ remain editable and natively translatable', () => {
  for (const file of ['sections/ossomosso-marquee.liquid', 'sections/ossomosso-product-faq.liquid', 'blocks/ossomosso-product-facts.liquid']) {
    const source = readFileSync(new URL('../' + file, import.meta.url), 'utf8');
    assert.equal(source.includes('request.locale'), false);
    assert.equal(source.includes('settings.language'), false);
    assert.doesNotMatch(source, /settings(?:\[[^\]]+\]|\.[a-z_]+)\s*\|\s*t\b/);
    JSON.parse(source.match(/{% schema %}([\s\S]*?){% endschema %}/)[1]);
  }
  const faq = readFileSync(new URL('../sections/ossomosso-product-faq.liquid', import.meta.url), 'utf8');
  assert.ok(faq.includes('<details'));
  assert.ok(faq.includes('<summary>'));
  assert.ok(faq.includes('focus-visible'));
  assert.ok(faq.includes('block.shopify_attributes'));
  const marquee = readFileSync(new URL('../sections/ossomosso-marquee.liquid', import.meta.url), 'utf8');
  assert.ok(marquee.includes('prefers-reduced-motion'));
  assert.ok(marquee.includes('visually-hidden'));
  assert.ok(marquee.includes('osso-marquee__group'));
});
