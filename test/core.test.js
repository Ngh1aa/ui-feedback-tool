import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { FONT_WEIGHT_OPTIONS, TEXT_ALIGN_OPTIONS, CSS_SPACING_SIDES } from '../src/core/config.js';
import { DEFAULTS, categoryLabel, mergeConfig } from '../src/core/config.js';
import { cssEscape, escapeHtml, escapeMarkdown, formatDate, relativeTime, safeText } from '../src/core/dom-utils.js';
import { createImageEditor } from '../src/features/image-editor.js';

test('config keeps white accent and merges shortcut safely', () => {
  const config = mergeConfig({ shortcut: ['Q', 'W', 'E'], storageKey: 'test' });
  assert.equal(config.accent, '#ffffff');
  assert.deepEqual(config.shortcut, ['q', 'w', 'e']);
  assert.equal(config.storageKey, 'test');
  assert.equal(DEFAULTS.version, '0.12.0');
  assert.equal(DEFAULTS.githubRepo, '');
  assert.ok(DEFAULTS.updateMirrors.every((url) => url.includes('ui-feedback-tool')));
  assert.deepEqual(mergeConfig({ shortcut: [] }).shortcut, ['q', 'w', 'e']);
  assert.deepEqual(mergeConfig({ shortcut: ['Q', 'Q', 'W'] }).shortcut, ['q', 'w']);
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
  assert.ok(source.includes("['advanced', '✦ Nâng cao']"));
  assert.ok(source.includes('data-css-shadow="${key}"'));
  assert.ok(source.includes('data-css-number-prop="zIndex"'));
  assert.ok(source.includes("renderCssRange('Alpha màu chữ', 'colorAlpha'"));
  assert.ok(source.includes('borderTopLeftRadius'));
  assert.ok(source.includes("['borderLeft', 'Trái']"));
});

test('text helpers escape HTML and Markdown safely', () => {
  assert.equal(escapeHtml('<script>"x"</script>'), '&lt;script&gt;&quot;x&quot;&lt;/script&gt;');
  assert.equal(escapeMarkdown('[feedback] *important*'), '\\[feedback\\] \\*important\\*');
  assert.equal(safeText('  one   two  '), 'one two');
  assert.equal(cssEscape('1 bad:id'), '\\31 \\ bad\\:id');
  assert.equal(formatDate(new Date('invalid')), 'N/A');
  assert.equal(relativeTime('invalid'), '');
});

test('image editor exposes reliable position and zoom controls', () => {
  const editor = createImageEditor();
  assert.deepEqual(editor.parseImagePosition('right bottom'), { x: 100, y: 100 });
  assert.deepEqual(editor.parseImagePosition('top center'), { x: 50, y: 0 });
  assert.deepEqual(editor.parseImagePosition('left'), { x: 0, y: 50 });
  assert.equal(editor.parseImageZoom('rotate(2deg) scale(1.75)'), 175);
  assert.equal(editor.parseImageZoom('none'), 100);
  const index = fs.readFileSync(new URL('../src/index.js', import.meta.url), 'utf8');
  assert.ok(index.includes('data-image-position-step="left"'));
  assert.ok(index.includes('data-image-position-step="right"'));
  assert.ok(index.includes('data-image-position-step="up"'));
  assert.ok(index.includes('data-image-position-step="down"'));
  assert.ok(index.includes('applyImageZoom(state.target'));
});

test('Picker Inspector contracts keep selection, lock, breadcrumb and measurement isolated', () => {
  const state = fs.readFileSync(new URL('../src/core/state.js', import.meta.url), 'utf8');
  const inspector = fs.readFileSync(new URL('../src/features/picker-inspector.js', import.meta.url), 'utf8');
  const measurement = fs.readFileSync(new URL('../src/features/measurement.js', import.meta.url), 'utf8');
  const index = fs.readFileSync(new URL('../src/index.js', import.meta.url), 'utf8');
  assert.ok(state.includes("phase: 'idle'"));
  assert.ok(state.includes('candidate: null'));
  assert.ok(state.includes('locked: false'));
  assert.ok(state.includes("measurement: { enabled: false, mode: 'box', compareTarget: null }"));
  assert.ok(inspector.includes('buildBreadcrumb'));
  assert.ok(inspector.includes('data-breadcrumb-index'));
  assert.ok(inspector.includes('lockTarget'));
  assert.ok(inspector.includes('positionInspector'));
  assert.ok(measurement.includes('getBoundingClientRect'));
  assert.ok(measurement.includes('ResizeObserver'));
  assert.ok(measurement.includes('requestAnimationFrame'));
  assert.ok(measurement.includes('measureGap'));
  assert.ok(index.includes('pickerInspector?.selectTarget(element)'));
  assert.ok(index.includes("event.key.toLowerCase() === 'l'"));
  assert.ok(index.includes("event.key.toLowerCase() === 'm'"));
  assert.ok(index.includes('ArrowUp'));
  assert.ok(index.includes('pickerInspector?.closeInspector?.();'));
  assert.ok(index.includes('measurementController?.destroy?.();'));
});

test('feedback cards support progressive disclosure without losing core actions', () => {
  const comments = fs.readFileSync(new URL('../src/features/comments.js', import.meta.url), 'utf8');
  const index = fs.readFileSync(new URL('../src/index.js', import.meta.url), 'utf8');
  assert.ok(comments.includes('data-toggle-comment'));
  assert.ok(comments.includes('ui-feedback-item__details'));
  assert.ok(comments.includes('ui-feedback-item__action-spacer'));
  assert.ok(index.includes('expandedComments[target.dataset.toggleComment]'));
});
