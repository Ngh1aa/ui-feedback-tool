import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULTS, categoryLabel, mergeConfig } from '../src/core/config.js';
import { escapeHtml, escapeMarkdown, safeText } from '../src/core/dom-utils.js';

test('config keeps white accent and merges shortcut safely', () => {
  const config = mergeConfig({ shortcut: ['Q', 'W', 'E'], storageKey: 'test' });
  assert.equal(config.accent, '#ffffff');
  assert.deepEqual(config.shortcut, ['q', 'w', 'e']);
  assert.equal(config.storageKey, 'test');
  assert.equal(DEFAULTS.version, '0.8.0');
});

test('category labels remain stable for feature types', () => {
  assert.equal(categoryLabel('image', 'image'), 'Hình ảnh');
  assert.equal(categoryLabel(undefined, 'css'), 'Màu sắc');
  assert.equal(categoryLabel('unknown', 'comment'), 'Khác');
});

test('text helpers escape HTML and Markdown safely', () => {
  assert.equal(escapeHtml('<script>"x"</script>'), '&lt;script&gt;&quot;x&quot;&lt;/script&gt;');
  assert.equal(escapeMarkdown('[feedback] *important*'), '\\[feedback\\] \\*important\\*');
  assert.equal(safeText('  one   two  '), 'one two');
});
