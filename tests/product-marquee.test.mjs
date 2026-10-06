import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { test } from 'node:test';

const templatesDirectory = new URL('../templates/', import.meta.url);
const productTemplates = readdirSync(templatesDirectory).filter((name) => /^product(?:\..+)?\.json$/.test(name));
const standaloneMarquees = new Set(['marquee', 'ossomosso-marquee', 'ossomosso-product-marquee']);

for (const filename of productTemplates) {
  const template = JSON.parse(readFileSync(new URL(filename, templatesDirectory), 'utf8').replace(/\/\*[\s\S]*?\*\//g, ''));
  const hasStory = Object.values(template.sections).some((section) => section.type === 'ossomosso-product-story');

  for (const language of ['es', 'en']) {
    test(`${filename}: one product marquee in ${language}`, () => {
      const marquees = [];
      for (const id of template.order) {
        const section = template.sections[id];
        assert.ok(section, `Section ${id} must exist`);
        if (section.disabled) continue;
        if (standaloneMarquees.has(section.type)) marquees.push(section);
        if (section.type !== 'ossomosso-product-story') continue;
        if (section.settings.language && section.settings.language !== language) continue;
        for (const blockId of section.block_order) {
          const block = section.blocks[blockId];
          if (block.type === 'marquee' && !block.disabled) {
            marquees.push(block);
            for (let i = 1; i <= 5; i++) assert.ok(block.settings[`item_${i}`]?.trim());
          }
        }
      }
      assert.equal(marquees.length, hasStory ? 1 : 0);
    });
  }

  if (hasStory) {
    test(`${filename}: product story is the only marquee source`, () => {
      assert.equal(Object.values(template.sections).some((section) => standaloneMarquees.has(section.type)), false);
    });
  }
}

test('Brisa keeps matching editable brown marquees in both languages', () => {
  const template = JSON.parse(readFileSync(new URL('product.brisa.json', templatesDirectory), 'utf8').replace(/\/\*[\s\S]*?\*\//g, ''));
  const settings = ['en', 'es'].map((language) => template.sections[`ossomosso_product_story_${language}`].blocks.marquee_hea9YP.settings);
  for (const marquee of settings) {
    assert.equal(marquee.background_color, '#8b5e3c');
    assert.equal(marquee.text_color, '#fff8ef');
    assert.equal(marquee.speed, 26);
  }
  assert.equal(settings[0].item_1, 'Made in Madrid');
  assert.equal(settings[1].item_1, 'Hecha en Madrid');
  const story = readFileSync(new URL('../sections/ossomosso-product-story.liquid', import.meta.url), 'utf8');
  for (const id of ['background_color', 'text_color', 'speed', 'item_1', 'item_5']) {
    assert.ok(story.includes(`"id": "${id}"`));
  }
});
