import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createCommentsController } from '../src/features/comments.js';
import { createMarkdownExporter } from '../src/features/export-markdown.js';
import { createGithubIssueController } from '../src/features/github-issue.js';
import { createImageEditor } from '../src/features/image-editor.js';
import { createCssEditor } from '../src/features/css-editor.js';

test('CSS controls apply live styles and position changes to the selected element', () => {
  const inputs = [{ value: '' }, { value: '' }];
  const pad = {
    style: { setProperty() {} },
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 200, height: 100 }),
  };
  const target = { style: { transform: 'rotate(3deg)' } };
  const state = { target, cssPosition: { x: 0, y: 0 }, cssTransformBase: 'rotate(3deg)' };
  const root = {
    querySelector: (selector) => selector === '[data-css-position-pad]' ? pad : null,
    querySelectorAll: () => inputs,
  };
  const editor = createCssEditor({ state, root });

  editor.applyCssProperty('opacity', '0.65');
  assert.equal(target.style.opacity, '0.65');

  editor.updatePositionFromPointer(150, 75);
  assert.deepEqual(state.cssPosition, { x: 100, y: 100 });
  assert.equal(target.style.transform, 'translate(100px, 100px) rotate(3deg)');
  assert.deepEqual(inputs.map((input) => input.value), ['100', '100']);

  const source = fs.readFileSync(new URL('../src/index.js', import.meta.url), 'utf8');
  assert.ok(source.includes('handleCssPositionPointerDown'));
  assert.ok(source.includes('updateCssPositionFromPointer(moveEvent.clientX, moveEvent.clientY)'));
  assert.ok(source.includes('if (applyCssSelectControl(target))'));
});

test('image zoom preserves non-scale transforms and enforces a true 1 MiB data limit', () => {
  const PreviousElement = globalThis.Element;
  const PreviousImage = globalThis.HTMLImageElement;
  class FakeElement {}
  class FakeImage extends FakeElement {
    constructor() {
      super();
      this.tagName = 'IMG';
      this.style = {};
    }
  }
  globalThis.Element = FakeElement;
  globalThis.HTMLImageElement = FakeImage;
  try {
    const editor = createImageEditor();
    const image = new FakeImage();
    editor.applyImageZoom(image, 150, 'rotate(8deg) scale(2) translateX(4px)');
    assert.equal(image.style.transform, 'rotate(8deg) translateX(4px) scale(1.5)');
    const oneMiB = Buffer.alloc(1024 * 1024).toString('base64');
    const overOneMiB = Buffer.alloc(1024 * 1024 + 1).toString('base64');
    assert.equal(editor.validateImageSource(`data:image/png;base64,${oneMiB}`), true);
    assert.equal(editor.validateImageSource(`data:image/png;base64,${overOneMiB}`), false);
    assert.equal(editor.validateImageSource('data:image/svg+xml,%ZZ'), false);
  } finally {
    globalThis.Element = PreviousElement;
    globalThis.HTMLImageElement = PreviousImage;
  }
});

test('export cleanup can be undone without losing feedback', () => {
  const state = {
    comments: [],
    undoStack: [{ type: 'export-clear', items: [{ id: 'one', type: 'comment', comment: 'Keep me' }] }],
    panelOpen: false,
  };
  let persisted = 0;
  let markers = 0;
  const controller = createCommentsController({
    state,
    persist: () => { persisted += 1; },
    renderToolbar() {},
    renderPanel() {},
    placeMarkers: () => { markers += 1; },
    showToast() {},
  });
  controller.undoAction();
  assert.equal(state.comments.length, 1);
  assert.equal(state.comments[0].comment, 'Keep me');
  assert.equal(state.panelOpen, true);
  assert.equal(persisted, 1);
  assert.equal(markers, 1);
});

test('critical browser regressions remain guarded in source', () => {
  const index = fs.readFileSync(new URL('../src/index.js', import.meta.url), 'utf8');
  const picker = fs.readFileSync(new URL('../src/features/picker.js', import.meta.url), 'utf8');
  const domUtils = fs.readFileSync(new URL('../src/core/dom-utils.js', import.meta.url), 'utf8');
  const stylesheet = fs.readFileSync(new URL('../src/stylesheet.js', import.meta.url), 'utf8');
  const workflow = fs.readFileSync(new URL('../.github/workflows/sync-ui-feedback.yml', import.meta.url), 'utf8');
  const build = fs.readFileSync(new URL('../scripts/build.js', import.meta.url), 'utf8');
  assert.ok(index.includes('if (editableTarget) return;'));
  assert.ok(index.includes('recentShortcutKeys.length = 0;'));
  assert.ok(domUtils.includes('[contenteditable]:not([contenteditable="false"])'));
  assert.ok(index.includes('markerLayer.appendChild(marker)'));
  assert.ok(index.includes('domObserver = new MutationObserver'));
  assert.ok(index.includes('if (!nextActive && state.modalOpen) closeModal(false);'));
  assert.ok(index.includes('ui-feedback-textarea--edit'));
  assert.ok(!index.includes('updateTool'));
  assert.ok(!index.includes('lastToolbarActionAt'));
  assert.ok(picker.includes("getPropertyValue('outline')"));
  assert.ok(!stylesheet.includes('--ui-feedback-accent: #fff !important'));
  assert.ok(workflow.includes('listForAuthenticatedUser'));
  assert.ok(!workflow.includes('listForOrg'));
  assert.ok(build.includes('UI Feedback Tool v${packageJson.version}'));
});

test('Markdown handoff never dumps uploaded image base64', () => {
  const dataUrl = `data:image/png;base64,${Buffer.alloc(2048).toString('base64')}`;
  const state = { comments: [] };
  const exporter = createMarkdownExporter({ state, getItemCodeLine: () => '' });
  const lines = exporter.renderItemMarkdown({
    type: 'image',
    tag: 'img.hero',
    selector: 'img.hero',
    imageSourceType: 'upload',
    value: dataUrl,
    createdAt: '2026-08-22T00:00:00.000Z',
    updatedAt: '2026-08-22T00:00:00.000Z',
  }, 0).join('\n');
  assert.ok(lines.includes('Ảnh upload local'));
  assert.ok(!lines.includes(dataUrl));
});

test('empty export keeps the existing undo history', () => {
  const state = { comments: [], undoStack: [{ type: 'delete', item: { id: 'one' }, index: 0 }] };
  let toast = '';
  const exporter = createMarkdownExporter({ state, showToast: (message) => { toast = message; } });
  exporter.exportMarkdown();
  assert.equal(state.undoStack.length, 1);
  assert.equal(toast, 'Chưa có feedback để xuất');
});

test('GitHub Issue handoff includes location data without uploaded base64', () => {
  const previousWindow = globalThis.window;
  const previousLocation = globalThis.location;
  let openedUrl = '';
  globalThis.window = { innerWidth: 1280, innerHeight: 800, open: (url) => { openedUrl = url; return {}; } };
  globalThis.location = { href: 'https://example.com/site/home' };
  try {
    const dataUrl = `data:image/png;base64,${Buffer.alloc(2048).toString('base64')}`;
    const controller = createGithubIssueController({
      config: { githubRepo: 'Ngh1aa/Example' },
      state: { theme: 'light', comments: [{ id: 'one', type: 'image', tag: 'img.hero', selector: 'main > img.hero', page: '/site/home', value: dataUrl, imageSourceType: 'upload' }] },
      getItemCodeLine: () => '<img class="hero">',
      showToast() {},
    });
    controller.createGithubIssue();
    const body = decodeURIComponent(new URL(openedUrl).searchParams.get('body'));
    assert.ok(body.includes('/site/home'));
    assert.ok(body.includes('main \\> img\\.hero'));
    assert.ok(body.includes('Ảnh upload local'));
    assert.ok(!body.includes(dataUrl));
  } finally {
    globalThis.window = previousWindow;
    globalThis.location = previousLocation;
  }
});
