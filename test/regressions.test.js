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
  assert.ok(!index.includes('createGithubIssueController'));
  assert.ok(!index.includes('data-panel-action="github"'));
  assert.ok(!index.includes('lastToolbarActionAt'));
  assert.ok(picker.includes("getPropertyValue('outline')"));
  assert.ok(!stylesheet.includes('--ui-feedback-accent: #fff !important'));
  assert.ok(index.includes('function selectionCandidates(element)'));
  assert.ok(index.includes('function openSelectionChooser(source, mode)'));
  assert.ok(index.includes('data-selection-index'));
  assert.ok(index.includes('openPickedElement(element)'));
  assert.ok(stylesheet.includes('.ui-feedback-selection-chooser'));
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
  assert.equal(toast, 'Chưa có thay đổi để xuất');
});

test('AI-ready Markdown explains intent and exports only changed CSS properties', () => {
  const state = {
    comments: [
      {
        id: 'css-one', type: 'css', page: '/home', tag: 'h1.hero-title', selector: 'main > h1.hero-title',
        codeLine: '<h1 class="hero-title">', viewport: '1440x900', scrollY: 120,
        oldValue: 'font-size: 32px; color: rgb(20, 20, 20); margin-bottom: 16px;',
        value: 'font-size: 44px; color: rgb(20, 20, 20); margin-bottom: 24px;',
        category: 'typography', updatedAt: '2026-08-23T00:00:00.000Z',
      },
      {
        id: 'note-one', type: 'comment', page: '/home', tag: 'section.hero', selector: 'main > section.hero',
        comment: 'Cho block này thoáng hơn và giữ nguyên hình nền.', category: 'layout', updatedAt: '2026-08-23T00:00:00.000Z',
      },
    ],
  };
  const exporter = createMarkdownExporter({ state, getItemCodeLine: () => '', showToast() {} });
  const markdown = exporter.buildMarkdown({ href: 'https://example.com/home', now: new Date('2026-08-23T01:00:00.000Z') });
  assert.ok(markdown.includes('# Yêu cầu cập nhật UI/UX'));
  assert.ok(markdown.includes('giữ nguyên những phần không được đề cập'));
  assert.ok(markdown.includes('## Trang: /home'));
  assert.ok(markdown.includes('`main > h1.hero-title`'));
  assert.ok(markdown.includes('| `font-size` | `32px` | `44px` |'));
  assert.ok(markdown.includes('| `margin-bottom` | `16px` | `24px` |'));
  assert.ok(!markdown.includes('| `color` |'));
  assert.ok(markdown.includes('Cho block này thoáng hơn và giữ nguyên hình nền.'));
  assert.equal(state.comments.length, 2);
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


test('image crop state persists position and zoom for feedback and Markdown', () => {
  const PreviousElement = globalThis.Element;
  const PreviousImage = globalThis.HTMLImageElement;
  class FakeElement {}
  class FakeImage extends FakeElement {
    constructor() {
      super();
      this.tagName = 'IMG';
      this.attributes = { src: '/images/hero.jpg' };
      this.currentSrc = '/images/hero.jpg';
      this.style = {};
    }
    getAttribute(name) { return this.attributes[name] || ''; }
    setAttribute(name, value) { this.attributes[name] = String(value); }
    hasAttribute(name) { return Object.hasOwn(this.attributes, name); }
    removeAttribute(name) { delete this.attributes[name]; }
  }
  globalThis.Element = FakeElement;
  globalThis.HTMLImageElement = FakeImage;
  try {
    const editor = createImageEditor();
    const image = new FakeImage();
    editor.applyImagePosition(image, { x: 25, y: 75 });
    editor.applyImageZoom(image, 160);
    const saved = editor.captureImageState(image);
    assert.deepEqual(saved.position, { x: 25, y: 75 });
    assert.equal(saved.zoom, 160);
    assert.equal(saved.objectPosition, '25% 75%');
    assert.equal(saved.transform, 'scale(1.6)');

    const state = {
      comments: [{
        type: 'image', tag: 'img.hero', selector: 'img.hero', page: '/', targetText: '/images/old.jpg', value: '/images/new.jpg',
        newImageState: { ...saved, position: { x: 25, y: 75 }, zoom: 160, crop: { frame: 'image-preview', x: 25, y: 75, zoom: 160 } },
        imageSourceType: 'url', updatedAt: '2026-08-23T00:00:00.000Z',
      }],
    };
    const exporter = createMarkdownExporter({ state, getItemCodeLine: () => '' });
    const markdown = exporter.buildMarkdown({ href: 'https://example.com', now: new Date('2026-08-23T01:00:00.000Z') });
    assert.ok(markdown.includes('**Vị trí crop:** `25% 75%`'));
    assert.ok(markdown.includes('**Mức thu phóng crop:** `160%`'));
    assert.ok(markdown.includes('**Khung crop:** `image-preview`'));
    const comments = createCommentsController({ state });
    assert.ok(comments.renderItem(state.comments[0]).includes('Crop: X 25% · Y 75% · zoom 160%'));
  } finally {
    globalThis.Element = PreviousElement;
    globalThis.HTMLImageElement = PreviousImage;
  }
});

test('image preview zoom is scoped to the media and not the crop frame', () => {
  const source = fs.readFileSync(new URL('../src/index.js', import.meta.url), 'utf8');
  const stylesheet = fs.readFileSync(new URL('../src/stylesheet.js', import.meta.url), 'utf8');
  assert.ok(source.includes('class="ui-feedback-image-preview__media"'));
  assert.ok(source.includes('const preview = root.querySelector(\'[data-image-preview]\');'));
  assert.ok(!source.includes('if (state.target && state.mode === \'image\') applyImageZoom(state.target, zoom, state.modalImageBaseTransform);'));
  assert.ok(stylesheet.includes('height: 180px; min-height: 180px; overflow: hidden'));
  assert.ok(stylesheet.includes('.ui-feedback-image-preview img.ui-feedback-image-preview__media'));
});
