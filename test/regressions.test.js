import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createCommentsController } from '../src/features/comments.js';
import { createImageEditor } from '../src/features/image-editor.js';

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
  const stylesheet = fs.readFileSync(new URL('../src/stylesheet.js', import.meta.url), 'utf8');
  const workflow = fs.readFileSync(new URL('../.github/workflows/sync-ui-feedback.yml', import.meta.url), 'utf8');
  const build = fs.readFileSync(new URL('../scripts/build.js', import.meta.url), 'utf8');
  assert.ok(index.includes('if (editableTarget) return;'));
  assert.ok(index.includes('markerLayer.appendChild(marker)'));
  assert.ok(index.includes('domObserver = new MutationObserver'));
  assert.ok(picker.includes("getPropertyValue('outline')"));
  assert.ok(!stylesheet.includes('--ui-feedback-accent: #fff !important'));
  assert.ok(workflow.includes('listForAuthenticatedUser'));
  assert.ok(!workflow.includes('listForOrg'));
  assert.ok(build.includes('UI Feedback Tool v${packageJson.version}'));
});
