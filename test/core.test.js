import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { FONT_WEIGHT_OPTIONS, TEXT_ALIGN_OPTIONS, CSS_SPACING_SIDES } from '../src/core/config.js';
import { DEFAULTS, categoryLabel, mergeConfig } from '../src/core/config.js';
import { escapeHtml, escapeMarkdown, safeText } from '../src/core/dom-utils.js';

test('config keeps white accent and merges shortcut safely', () => {
  const config = mergeConfig({ shortcut: ['Q', 'W', 'E'], storageKey: 'test' });
  assert.equal(config.accent, '#ffffff');
  assert.deepEqual(config.shortcut, ['q', 'w', 'e']);
  assert.equal(config.storageKey, 'test');
  assert.equal(DEFAULTS.version, '0.8.1');
});

test('category labels remain stable for feature types', () => {
  assert.equal(categoryLabel('image', 'image'), 'Hình ảnh');
  assert.equal(categoryLabel(undefined, 'css'), 'Màu sắc');
  assert.equal(categoryLabel('unknown', 'comment'), 'Khác');
});

test('CSS editor schema exposes typography and spacing controls', () => {
  assert.deepEqual(FONT_WEIGHT_OPTIONS.map((item) => item.value), ['400', '500', '600', '700', '800']);
  assert.deepEqual(TEXT_ALIGN_OPTIONS.map((item) => item.value), ['left', 'center', 'right', 'justify']);
  assert.deepEqual(CSS_SPACING_SIDES.map((item) => item.prop), ['Top', 'Right', 'Bottom', 'Left']);
  const source = fs.readFileSync(new URL('../src/index.js', import.meta.url), 'utf8');
  assert.ok(source.includes("['typography',"));
  assert.ok(source.includes("renderCssRange('Cỡ chữ', 'fontSize'"));
  assert.ok(source.includes('data-css-range-prop="${prop}"'));
  assert.ok(source.includes('data-css-spacing="${cssProp}"'));
  assert.ok(source.includes('data-css-align="${option.value}"'));
});

test('text helpers escape HTML and Markdown safely', () => {
  assert.equal(escapeHtml('<script>"x"</script>'), '&lt;script&gt;&quot;x&quot;&lt;/script&gt;');
  assert.equal(escapeMarkdown('[feedback] *important*'), '\\[feedback\\] \\*important\\*');
  assert.equal(safeText('  one   two  '), 'one two');
});
