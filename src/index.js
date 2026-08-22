/**
 * UI Feedback Tool v0.14.0
 * ---------------------
 * Công cụ ghi nhận feedback UI/UX trực tiếp trên trang web.
 * Bật / tắt bằng cách nhấn đồng thời Q + W + E.
 *
 * Changelog v0.14.0:
 *   - UX: rút gọn cho quy trình cá nhân, bỏ UI cộng tác và GitHub Issue
 *   - Export: Markdown AI-ready, có current/desired state và CSS diff
 *   - Safety: xuất file không tự xóa danh sách thay đổi
 *   - CSS: live preview cho mọi control và pad kéo vị trí 2D
 *
 * Changelog v0.11.0:
 *   - New: Picker Inspector với breadcrumb, lock selection và measurement overlay
 *   - New: đo box/gap, keyboard navigation, focus và responsive bottom sheet
 *
 * Changelog v0.10.0:
 *   - New: tab Nâng cao cho CSS editor với Box-shadow trực quan
 *   - New: radius từng góc, border từng cạnh, z-index và alpha màu chữ
 *   - UX: control compact, responsive và giữ nguyên preset/reset/undo
 *
 * Changelog v0.9.0:
 *   - New: visual refresh modern minimalism cho panel Feedback
 *   - New: feedback card compact mặc định với progressive disclosure cho source/context
 *   - New: nhóm page/category gọn hơn, filter responsive và action hierarchy rõ hơn
 *   - Fix: rút gọn drag hint nhưng vẫn giữ tooltip và vùng kéo title bar
 *
 * Changelog v0.8.1:
 *   - New: Bộ CSS có tab Màu sắc, Chữ, Khoảng cách và Vị trí
 *   - New: Typography controls và spacing/layout controls chỉnh tay
 *   - Refactor: tách source thành core, features và UI controllers; bundle deploy vẫn giữ một file ESM
 *   - Test: thêm check và unit tests cho config, category labels và text escaping
 *
 * Changelog v0.6.0:
*   - Fix: Update dùng mirror GitHub Pages public vì source canonical private không thể fetch trực tiếp từ browser
 *   - New: nút Update trên toolbar để kiểm tra và nạp bản tool mới an toàn
 *   - New: updateUrl/version config cho phép project dùng source canonical
 *   - Fix: cập nhật runtime bằng Blob module mà không mất feedback đã lưu
 *
 * Changelog v0.5.1:
 *   - Fix: drag handle nhận diện ổn định qua composedPath trong Shadow DOM
 *   - Fix: không bắt kéo khi pointer bắt đầu trên button, link, input hoặc vùng chọn text
 *   - Fix: lọc pointerId và cleanup khi pointerup, pointercancel hoặc mất focus
 *
 * Changelog v0.5:
 *   - New: panel/modal có title bar kéo thả bằng Pointer Events và pointer capture
 *   - New: grip + drag hint + nút đặt lại vị trí cho các cửa sổ công cụ
 *   - New: white accent tokens cho focus, primary action và dark/light theme
 *   - Fix: cleanup pointer drag state khi pointerup hoặc pointercancel
 *
 * Changelog v0.4:
 *   - New: marker trên trang cho edit / css (xanh lá / tím) — biết ngay
 *         chỗ nào đã cập nhật
 *   - New: nút Undo trên toolbar (kèm counter) — hoàn tác delete / edit / css
 *   - New: button toolbar toggleable (click lại để tắt picking)
 *   - Fix: resume picking an toàn qua clearable timer, không còn race 80ms
 *   - Fix: đóng panel / Escape trong picking vẫn nhớ mode và phục hồi
 *   - Fix: export Markdown / GitHub Issue có section riêng cho edit / css
 *         (trước đây ghi `undefined` trong feedback)
 *   - New: phân phối qua jsDelivr CDN + semver tag — project khác import
 *         `https://cdn.jsdelivr.net/gh/Ngh1aa/StudioOS@v0.4.0/ui-feedback.js`
 *         và nhận update chỉ bằng cách bump tag.
 *
 * Changelog v0.3:
 *   - New: Bắt ngữ cảnh màn hình (viewport, scrollY)
 *   - New: CSS Tinkering mode (sửa inline CSS trực tiếp)
 *   - New: Phím tắt Quick Tagging (T, C, S) khi picking
 *   - New: Tạo GitHub Issue 1-click
 *
 * Changelog v0.2:
 *   - Fix: đổi `const CSS` → `STYLESHEET` để không shadow `window.CSS`
 *   - Fix: thống nhất event flow qua host delegation, loại bỏ double-fire
 *   - New: dark mode (auto-detect hoặc config `theme`)
 *   - New: animations (modal fade, panel slide, toast slide, toolbar pulse)
 *   - New: drag & drop toolbar
 *   - New: filter & search trong panel
 *   - New: resolve / unresolve status trên mỗi comment
 *   - New: timestamp hiển thị trên comment items
 *   - New: undo delete (toast + hoàn tác)
 *   - New: improved markdown export (status, summary)
 *   - New: Escape đóng modal/panel
 */


import { CSS_COLOR_FIELDS, EXTRA_COLOR_FIELDS, FONT_OPTIONS, FONT_WEIGHT_OPTIONS, TEXT_ALIGN_OPTIONS, CSS_SPACING_SIDES, mergeConfig } from './core/config.js';
import { copyText, cssPath, escapeAttribute, escapeHtml, firstCodeLine, generateId, isEditable, resolveSelector, safeText, targetLabel } from './core/dom-utils.js';
import { createFeedbackState } from './core/state.js';
import { STYLESHEET } from './stylesheet.js';
import { createCommentsController } from './features/comments.js';
import { createMarkdownExporter } from './features/export-markdown.js';
import { createCssEditor } from './features/css-editor.js';
import { createImageEditor } from './features/image-editor.js';
import { createPickerController } from './features/picker.js';
import { createPanelController } from './ui/panel.js';
import { createModalController } from './ui/modal.js';
import { renderToolbar as renderToolbarView } from './ui/toolbar.js';
import { createToastController } from './ui/toast.js';
import { ICONS } from './ui/icons.js';
/* ── main factory ────────────────────────────────────────────────────── */

export function createUIFeedback(options = {}) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return null;
  if (window.__uiFeedbackInstance) return window.__uiFeedbackInstance;

  const config = mergeConfig(options);
  const pressed = new Set();
  const recentShortcutKeys = [];
  let shortcutTimer;
  const stateStore = createFeedbackState(config);
  const { state, persist, persistActive, hasSeenCoachmark, dismissCoachmark: persistCoachmark } = stateStore;

  // Marker tracking
  const markers = []; // { element, markerEl, commentId }
  let commentsController;
  let toastController;
  let markdownExporter;
  let panelController;
  let modalController;
  let cssEditor;
  const imageEditor = createImageEditor();
  let pickerController;
  let themeMedia = null;
  let themeChangeHandler = null;
  let domObserver = null;
  let reapplyTimer = null;
  let focusBeforeModal = null;

  /* ── shadow DOM setup ── */
  const host = document.createElement('div');
  host.id = 'ui-feedback-host';
  host.dataset.uiFeedbackIgnore = 'true';
  const shadow = host.attachShadow({ mode: 'open' });
  shadow.innerHTML = `<style>${STYLESHEET}</style><div class="ui-feedback-root${state.theme === 'dark' ? ' is-dark' : ''}"></div><div class="ui-feedback-marker-layer${state.theme === 'dark' ? ' is-dark' : ''}" aria-label="Các vị trí feedback"></div>`;
  const root = shadow.querySelector('.ui-feedback-root');
  const markerLayer = shadow.querySelector('.ui-feedback-marker-layer');
  root.style.setProperty('--ui-feedback-accent', config.accent);
  markerLayer.style.setProperty('--ui-feedback-accent', config.accent);
  document.documentElement.appendChild(host);

  // Listen for system theme changes
  if (config.theme === 'auto') {
    themeMedia = window.matchMedia('(prefers-color-scheme: dark)');
    themeChangeHandler = (e) => {
      state.theme = e.matches ? 'dark' : 'light';
      root.classList.toggle('is-dark', state.theme === 'dark');
      markerLayer.classList.toggle('is-dark', state.theme === 'dark');
    };
    if (themeMedia.addEventListener) themeMedia.addEventListener('change', themeChangeHandler);
    else themeMedia.addListener?.(themeChangeHandler);
  }

  /* ── toolbar drag state ── */
  let dragState = null;
  let toolbarPos = { side: config.position === 'left' ? 'left' : 'right', inset: 20, top: null }; // null = bottom dock

  function getToolbarStyle() {
    const horizontal = `${toolbarPos.side}:${toolbarPos.inset}px;`;
    if (toolbarPos.top !== null) {
      return `${horizontal}top:${toolbarPos.top}px;transform:none;`;
    }
    return `${horizontal}bottom:20px;`;
  }

  /* ── persistence ── */
  function dismissCoachmark() {
    state.coachmarkVisible = false;
    persistCoachmark();
    renderToolbar();
  }

  function applyPersistedChanges() {
    if (!state.active) return;
    const page = location.pathname || '/';
    state.comments
      .filter((item) => (item.page || '/') === page && ['edit', 'css', 'image'].includes(item.type))
      .sort((a, b) => String(a.createdAt || '').localeCompare(String(b.createdAt || '')))
      .forEach((item) => {
        const element = resolveSelector(item.selector);
        if (!element) return;
        if (item.type === 'edit' && element.textContent !== (item.value || '')) element.textContent = item.value || '';
        else if (item.type === 'css' && element.style.cssText !== (item.value || '')) element.style.cssText = item.value || '';
        else if (item.type === 'image') {
          const snapshot = { ...(item.newImageState || { kind: 'src' }), src: item.value || item.newImageState?.src || '' };
          applyImageState(element, snapshot);
        }
      });
  }
  /* ── rendering ── */
  function renderToolbar() {
    renderToolbarView({
      state,
      root,
      getToolbarStyle,
      renderPanel,
      renderModal,
    });
  }

  /* ── toolbar actions ── */
  function dispatchToolbarAction(action) {
    if (action === 'activate') toggle();
    if (action === 'list') togglePanel();
    if (action === 'undo') undoAction();
    if (action === 'comment') toggleMode('comment');
    if (action === 'edit') toggleMode('edit');
    if (action === 'css') toggleMode('css');
    if (action === 'image') toggleMode('image');
    if (action === 'collapse') { state.collapsed = !state.collapsed; renderToolbar(); }
  }

  // Toggling behavior: clicking the same picking mode again turns it off.
  // Clicking a different mode swaps to that mode without an intermediate
  // "off" state.
  function toggleMode(mode) {
    if (state.picking && state.mode === mode) {
      stopPicking({ rerender: true });
      return;
    }
    beginPicking(mode);
  }

  function triggerToolbarAction(event, button) {
    const action = button?.dataset?.action;
    if (!action) return;
    event.preventDefault();
    event.stopPropagation();
    dispatchToolbarAction(action);
  }

  /* ── panel ── */
  function togglePanel(force) {
    state.panelOpen = typeof force === 'boolean' ? force : !state.panelOpen;
    if (!state.panelOpen) {
      renderToolbar();
      // If picking was active before the panel opened, resume it now.
      resumePickingIfNeeded();
      return;
    }
    stopPicking();
    renderToolbar();
    renderPanel();
  }

  function renderGroupedComments(items) { return commentsController.renderGroupedComments(items); }

  function renderPanel() {
    const mount = root.querySelector('[data-ui-feedback-panel]');
    if (!mount || !state.panelOpen) return;
    const content = renderGroupedComments(state.comments);
    mount.innerHTML = `<aside class="ui-feedback-panel" aria-label="Danh sách thay đổi">
      <header class="ui-feedback-panel__header" data-panel-drag-handle title="Kéo vùng tiêu đề để di chuyển cửa sổ"><div class="ui-feedback-window-heading"><span class="ui-feedback-window-grip" aria-hidden="true">${ICONS.grip}</span><div><strong>Danh sách thay đổi</strong><small>${state.comments.length} mục đã ghi nhận <span class="ui-feedback-drag-hint" title="Kéo để di chuyển">Kéo</span></small></div></div><span class="ui-feedback-panel__actions"><button class="ui-feedback-export-button" data-panel-action="export" aria-label="Xuất file Markdown" title="Xuất file Markdown">${ICONS.download}<span>Xuất .md</span></button><button class="ui-feedback-icon-button" data-panel-action="reset-position" aria-label="Đưa cửa sổ về vị trí mặc định" title="Đặt lại vị trí">${ICONS.undo}</button><button class="ui-feedback-icon-button" data-panel-action="close" aria-label="Đóng cửa sổ">${ICONS.close}</button></span></header>
      <div class="ui-feedback-panel__intro">File Markdown sẽ mô tả rõ phần tử, trạng thái hiện tại và thay đổi mong muốn để AI có thể thực hiện ngay.</div>
      <div class="ui-feedback-panel__body">${content || '<div class="ui-feedback-empty">Chưa có thay đổi. Chọn một công cụ trên thanh dưới rồi bấm vào phần tử cần chỉnh.</div>'}</div>
    </aside>`;
    applyPanelPosition();
    mount.onclick = handlePanelClick;
    mount.onpointerdown = handlePanelPointerDown;
    mount.onkeydown = handlePanelKeydown;
  }

  function applyPanelPosition() { return panelController.applyPanelPosition(); }

  function handlePanelPointerDown(event) { return panelController.handlePointerDown(event); }

  function handlePanelClick(event) {
    const target = event.target.closest('[data-panel-action], [data-edit-comment], [data-delete-comment], [data-copy-selector], [data-toggle-comment], [data-comment-id]');
    if (!target) return;
    event.stopPropagation();
    if (target.dataset.toggleComment) {
      state.expandedComments[target.dataset.toggleComment] = !state.expandedComments[target.dataset.toggleComment];
      renderPanel();
      return;
    }
    if (target.dataset.panelAction === 'reset-position') { state.panelPosition = { x: 0, y: 0 }; applyPanelPosition(); showToast('Đã đặt lại vị trí cửa sổ'); return; }
    if (target.dataset.copySelector) { copyText(target.dataset.copySelector).then((copied) => showToast(copied ? 'Đã copy selector' : 'Không thể copy selector')); return; }
    if (target.dataset.panelAction === 'close') togglePanel(false);
    else if (target.dataset.panelAction === 'export') exportMarkdown();
    else if (target.dataset.editComment) editComment(target.dataset.editComment);
    else if (target.dataset.deleteComment) deleteComment(target.dataset.deleteComment);
    else {
      const card = event.target.closest('[data-comment-id]');
      if (card) focusComment(card.dataset.commentId);
    }
  }

  function handlePanelKeydown(event) {
    const card = event.target.closest?.('[data-comment-id]');
    if (card === event.target && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      focusComment(card.dataset.commentId);
    }
  }

  function getItemCodeLine(item) { return commentsController.getItemCodeLine(item); }

  /* ── picking ── */
  function clearResumeTimer() { return pickerController.clearResumeTimer(); }

  function beginPicking(mode, opts = {}) { return pickerController.beginPicking(mode, opts); }

  function stopPicking(opts = {}) { return pickerController.stopPicking(opts); }

  function resumePickingIfNeeded() { return pickerController.resumePickingIfNeeded(); }

  function clearHighlight() { return pickerController.clearHighlight(); }

  function highlight(element) { return pickerController.highlight(element); }

  /* ── comment markers on page ── */
  function focusComment(id) {
    const item = state.comments.find((comment) => comment.id === id);
    if (!item) return;
    if ((item.page || '/') !== (location.pathname || '/')) {
      showToast(`Feedback nằm ở trang ${item.page || '/'}`);
      return;
    }
    const element = resolveSelector(item.selector);
    if (!element) { showToast('Không tìm thấy phần tử trên trang hiện tại'); return; }
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    highlight(element);
    setTimeout(clearHighlight, 1200);
    showToast('Đã focus đến phần tử feedback');
  }

  function placeMarkers() {
    // remove old markers
    markers.forEach((m) => m.markerEl?.remove());
    markers.length = 0;
    if (!state.active) return;
    let commentNumber = 0;
    const currentPage = location.pathname || '/';
    state.comments.filter((comment) => (comment.page || '/') === currentPage).forEach((comment) => {
      let el;
      try { el = document.querySelector(comment.selector); } catch { el = null; }
      if (!el) return;
      const marker = document.createElement('button');
      marker.type = 'button';
      const typeClass = comment.type === 'edit'
        ? ' is-edit'
        : comment.type === 'css'
          ? ' is-css'
          : comment.type === 'image'
            ? ' is-image'
            : '';
      marker.className = `ui-feedback-marker${typeClass}`;
      // Use a glyph for edit/css so they read as "touched", comment items
      // keep their numeric index for ordering.
      if (comment.type === 'edit') marker.textContent = '✎';
      else if (comment.type === 'css') marker.textContent = '✦';
      else if (comment.type === 'image') marker.textContent = '▧';
      else {
        commentNumber += 1;
        marker.textContent = commentNumber;
      }
      marker.title = comment.type === 'edit'
        ? `Đã sửa text: ${safeText(comment.value, 80)}`
        : comment.type === 'css'
          ? `Đã sửa CSS: ${safeText(comment.value, 80)}`
          : comment.type === 'image'
            ? `Đã thay ảnh: ${safeText(comment.value, 80)}`
            : `Feedback #${commentNumber}`;
      marker.dataset.commentId = comment.id;
      marker.setAttribute('aria-label', marker.title);
      marker.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); focusComment(comment.id); });
      // position relative to the element
      positionMarker(el, marker);
      markerLayer.appendChild(marker);
      markers.push({ element: el, markerEl: marker, commentId: comment.id });
    });
  }

  function positionMarker(el, marker) {
    const rect = el.getBoundingClientRect();
    marker.style.top = `${rect.top - 8}px`;
    marker.style.left = `${rect.left - 8}px`;
  }

  function refreshMarkerPositions() {
    markers.forEach((m) => {
      if (m.element?.isConnected && m.markerEl) positionMarker(m.element, m.markerEl);
    });
  }

  function clearMarkers() {
    markers.forEach((m) => m.markerEl?.remove());
    markers.length = 0;
  }

  /* ── modal ── */
  function openModal(element, mode, existing = null) {
    // stopPicking() records state._modeBeforePickingStop so closeModal()
    // can resume the same mode after save/cancel.
    stopPicking();
    state.target = element;
    state.mode = mode;
    state.modalSnapshot = mode === 'css' ? { styleCssText: element?.style?.cssText || '' } : mode === 'image' ? captureImageState(element) : null;
    focusBeforeModal = shadow.activeElement || document.activeElement;
    state.modalImageSource = mode === 'image' ? (state.modalSnapshot?.src || state.modalSnapshot?.effectiveSrc || '') : '';
    const initialPosition = mode === 'image' ? (state.modalSnapshot?.objectPosition || state.modalSnapshot?.effectiveObjectPosition || state.modalSnapshot?.backgroundPosition || state.modalSnapshot?.effectiveBackgroundPosition || '50% 50%') : '50% 50%';
    state.modalImagePosition = mode === 'image' ? parseImagePosition(initialPosition) : { x: 50, y: 50 };
    state.modalImageBaseTransform = mode === 'image' ? (state.modalSnapshot?.transform || state.modalSnapshot?.effectiveTransform || '') : '';
    state.modalImageZoom = mode === 'image' ? imageEditor.parseImageZoom(state.modalSnapshot?.transform || state.modalSnapshot?.effectiveTransform || '') : 100;
    state.modalCommitted = false;
    state.cssTab = mode === 'css' ? 'colors' : 'advanced';
    state.cssTransformBase = mode === 'css'
      ? String(element?.style?.transform || '').replace(/\btranslate(?:3d|x|y)?\([^)]*\)/gi, '').replace(/\s+/g, ' ').trim()
      : '';
    state.cssPosition = mode === 'css' ? parseTranslatePosition(element?.style?.translate || element?.style?.transform || (element ? getComputedStyle(element).translate : '') || (element ? getComputedStyle(element).transform : '') || '') : { x: 0, y: 0 };
    state.modalPosition = { x: 0, y: 0 };
    state.modalOpen = true;
    renderToolbar();
    renderModal(existing);
    setTimeout(() => root.querySelector('[data-feedback-input]')?.focus(), 0);
  }


  function ensureGoogleFont(fontName) { return cssEditor.ensureGoogleFont(fontName); }

  function normalizeColor(value, fallback = '#ffffff') { return cssEditor.normalizeColor(value, fallback); }

  function readCssValue(prop, fallback = '') { return cssEditor.readCssValue(prop, fallback); }

  function applyCssProperty(prop, value) { return cssEditor.applyCssProperty(prop, value); }

  function parseTranslatePosition(value) { return cssEditor.parseTranslatePosition(value); }

  function applyCssPosition(position = state.cssPosition) { return cssEditor.applyCssPosition(position); }

  function applyModalPosition() { return modalController.applyModalPosition(); }

  function updateCssPositionFromPointer(clientX, clientY) { return cssEditor.updatePositionFromPointer(clientX, clientY); }

  function parseImagePosition(value) { return imageEditor.parseImagePosition(value); }

  function captureImageState(element) { return imageEditor.captureImageState(element); }

  function applyImageSource(element, source) { return imageEditor.applyImageSource(element, source); }

  function applyImagePosition(element, position = { x: 50, y: 50 }) { return imageEditor.applyImagePosition(element, position); }

  function applyImageZoom(element, zoom = 100, baseTransform = '') { return imageEditor.applyImageZoom(element, zoom, baseTransform); }

  function applyImageState(element, snapshot) { return imageEditor.applyImageState(element, snapshot); }

  function restoreImageState(element, snapshot) { return imageEditor.restoreImageState(element, snapshot); }

  function validateImageSource(source) { return imageEditor.validateImageSource(source); }

  function renderCssColorCard(field) {
    const current = normalizeColor(readCssValue(field.prop), field.fallback);
    return `<div class="ui-feedback-theme-card" data-css-card="${field.key}"><span class="ui-feedback-theme-card__swatch" style="background:${current}"></span><div class="ui-feedback-theme-card__copy"><span class="ui-feedback-theme-card__label">${field.label}</span><span class="ui-feedback-theme-card__hint">${field.hint}</span></div><input type="color" data-css-color="${field.prop}" data-css-key="${field.key}" value="${current}" aria-label="${field.label}" /><input type="text" data-css-hex="${field.prop}" data-css-key="${field.key}" value="${current}" maxlength="7" aria-label="Mã màu ${field.label}" /></div>`;
  }

  function renderFontRow(label, prop) {
    const current = String(readCssValue(prop, '') || '').replace(/^['"]|['"]$/g, '');
    const selected = FONT_OPTIONS.find((font) => current.toLowerCase().includes(font.value.toLowerCase()) && font.value);
    const value = selected?.value || '';
    return `<div class="ui-feedback-font-row"><div class="ui-feedback-font-row__copy"><span class="ui-feedback-font-row__label">${label}</span><span class="ui-feedback-font-row__value">${escapeHtml(value || 'Mặc định của website')}</span></div><select data-css-font="${prop}" aria-label="Font ${label}">${FONT_OPTIONS.map((font) => `<option value="${escapeAttribute(font.value)}" ${font.value === value ? 'selected' : ''}>${font.label}</option>`).join('')}</select></div>`;
  }

  function cssNumberValue(prop, fallback = 0) {
    const parsed = parseFloat(readCssValue(prop, ''));
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function cssRangeValue(prop, fallback = 0) {
    const raw = String(readCssValue(prop, '') || '');
    const parsed = parseFloat(raw);
    if (!Number.isFinite(parsed)) return fallback;
    if (prop === 'opacity') return parsed * 100;
    if (prop === 'lineHeight' && /px$/i.test(raw)) {
      const fontSize = parseFloat(readCssValue('fontSize', '16px')) || 16;
      return parsed / fontSize;
    }
    return parsed;
  }

  function renderCssRange(label, prop, min, max, step, unit, fallback, formatter = (value) => `${value}${unit}`) {
    const value = Math.max(min, Math.min(max, cssRangeValue(prop, fallback)));
    const output = formatter(value);
    return `<div class="ui-feedback-range-row"><div class="ui-feedback-range-row__head"><span>${label}</span><output data-css-output="${prop}">${output}</output></div><input type="range" min="${min}" max="${max}" step="${step}" data-css-range-prop="${prop}" data-css-range-unit="${unit}" data-css-range-output="${prop}" value="${value}" aria-label="${label}" /></div>`;
  }

  function renderCssSelect(label, prop, options, fallback) {
    const current = String(readCssValue(prop, fallback) || fallback);
    return `<label class="ui-feedback-css-select-row"><span>${label}</span><select data-css-select-prop="${prop}" aria-label="${label}">${options.map((option) => `<option value="${escapeAttribute(option.value)}" ${option.value === current ? 'selected' : ''}>${escapeHtml(option.label)}</option>`).join('')}</select></label>`;
  }

  function renderSpacingGroup(label, prop) {
    const min = prop === 'margin' ? -160 : 0;
    return `<div class="ui-feedback-css-subsection"><div class="ui-feedback-css-subtitle">${label}</div><div class="ui-feedback-spacing-grid">${CSS_SPACING_SIDES.map((side) => { const cssProp = `${prop}${side.prop}`; const value = Math.max(min, Math.min(160, cssNumberValue(cssProp, 0))); return `<label><span>${side.label}</span><input type="number" min="${min}" max="160" step="1" data-css-spacing="${cssProp}" value="${Math.round(value)}" inputmode="numeric" aria-label="${label} ${side.label}" /><output>${Math.round(value)}px</output></label>`; }).join('')}</div></div>`;
  }

  function renderTextAlign() {
    const current = String(readCssValue('textAlign', 'left') || 'left');
    return `<div class="ui-feedback-css-subsection"><div class="ui-feedback-css-subtitle">Căn chữ</div><div class="ui-feedback-align-grid" role="group" aria-label="Căn chữ">${TEXT_ALIGN_OPTIONS.map((option) => `<button type="button" class="ui-feedback-align-button ${current === option.value ? 'is-active' : ''}" data-css-align="${option.value}" aria-label="${option.label}" aria-pressed="${current === option.value}"><span aria-hidden="true">${option.icon}</span><small>${option.label}</small></button>`).join('')}</div></div>`;
  }

  function colorToHex(value, fallback = '#000000') {
    const raw = String(value || '').trim();
    if (/^#[0-9a-f]{6}$/i.test(raw)) return raw.toLowerCase();
    if (/^#[0-9a-f]{3}$/i.test(raw)) return raw.replace(/^#(.)(.)(.)$/, '#$1$1$2$2$3$3').toLowerCase();
    const match = raw.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (match) return `#${[match[1], match[2], match[3]].map((part) => Number(part).toString(16).padStart(2, '0')).join('')}`;
    return fallback;
  }

  function parseShadow(value) {
    const raw = String(value || '').trim();
    const match = raw.match(/^(inset\s+)?(-?\d+(?:\.\d+)?)px\s+(-?\d+(?:\.\d+)?)px\s+(\d+(?:\.\d+)?)px(?:\s+(-?\d+(?:\.\d+)?)px)?\s+(rgba?\([^)]*\)|#[0-9a-f]{3,8}|[a-z]+)$/i);
    if (!match) return { inset: false, x: 0, y: 10, blur: 30, spread: 0, color: '#000000' };
    return { inset: Boolean(match[1]), x: Number(match[2]), y: Number(match[3]), blur: Number(match[4]), spread: Number(match[5] || 0), color: colorToHex(match[6]) };
  }

  function shadowCss(shadow) {
    return `${shadow.inset ? 'inset ' : ''}${Math.round(shadow.x)}px ${Math.round(shadow.y)}px ${Math.round(shadow.blur)}px ${Math.round(shadow.spread)}px ${shadow.color}`;
  }

  function renderShadowEditor() {
    const shadow = parseShadow(readCssValue('boxShadow', 'none'));
    const range = (label, key, min, max, value) => `<label class="ui-feedback-css-mini-range"><span>${label}</span><input type="range" min="${min}" max="${max}" step="1" data-css-shadow="${key}" value="${value}" aria-label="${label}" /><output data-css-shadow-output="${key}">${value}px</output></label>`;
    return `<div class="ui-feedback-css-subsection"><div class="ui-feedback-css-subtitle">Box-shadow trực quan</div>${range('X', 'x', -40, 40, Math.round(shadow.x))}${range('Y', 'y', -40, 40, Math.round(shadow.y))}${range('Blur', 'blur', 0, 80, Math.round(shadow.blur))}${range('Spread', 'spread', -20, 40, Math.round(shadow.spread))}<label class="ui-feedback-css-color-inline"><span>Màu shadow</span><input type="color" data-css-shadow="color" value="${shadow.color}" aria-label="Màu shadow" /></label><label class="ui-feedback-checkbox"><input type="checkbox" data-css-shadow="inset" ${shadow.inset ? 'checked' : ''} /> <span>Inset</span></label><button type="button" class="ui-feedback-button ui-feedback-css-reset" data-css-shadow-reset>Đặt lại shadow</button></div>`;
  }

  function renderRadiusEditor() {
    const sides = [['borderTopLeftRadius', 'Trên trái'], ['borderTopRightRadius', 'Trên phải'], ['borderBottomRightRadius', 'Dưới phải'], ['borderBottomLeftRadius', 'Dưới trái']];
    return `<div class="ui-feedback-css-subsection"><div class="ui-feedback-css-subtitle">Bo góc từng cạnh</div>${sides.map(([prop, label]) => renderCssRange(label, prop, 0, 48, 1, 'px', 0)).join('')}</div>`;
  }

  function renderBorderSides() {
    const sides = [['borderTop', 'Trên'], ['borderRight', 'Phải'], ['borderBottom', 'Dưới'], ['borderLeft', 'Trái']];
    const styles = [{ value: 'none', label: 'None' }, { value: 'solid', label: 'Solid' }, { value: 'dashed', label: 'Dashed' }, { value: 'dotted', label: 'Dotted' }];
    return `<div class="ui-feedback-css-subsection"><div class="ui-feedback-css-subtitle">Viền từng cạnh</div>${sides.map(([prefix, label]) => `<div class="ui-feedback-css-side-row"><strong>${label}</strong>${renderCssRange('Độ dày', `${prefix}Width`, 0, 12, 1, 'px', 0)}${renderCssSelect('Kiểu', `${prefix}Style`, styles, 'solid')}</div>`).join('')}</div>`;
  }

  function colorWithAlpha(value, alpha) {
    const hex = colorToHex(value);
    const rgb = hex.slice(1).match(/../g).map((part) => parseInt(part, 16));
    return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${Math.max(0, Math.min(1, Number(alpha))).toFixed(2)})`;
  }

  function colorAlpha(value) {
    const match = String(value || '').match(/rgba?\([^,]+,[^,]+,[^,]+(?:,\s*([0-9.]+))?\)/i);
    return match?.[1] === undefined ? 1 : Number(match[1]);
  }

  function renderAdvancedCss() {
    const currentColor = readCssValue('color', '#ffffff');
    const alpha = Math.round(colorAlpha(currentColor) * 100);
    return `<div class="ui-feedback-css-section"><div class="ui-feedback-css-section__title">Nâng cao</div><p class="ui-feedback-css-help">Tinh chỉnh các thuộc tính thường dùng khi debug component và lớp chồng.</p>${renderShadowEditor()}${renderRadiusEditor()}${renderBorderSides()}<div class="ui-feedback-css-subsection"><div class="ui-feedback-css-subtitle">Lớp & độ trong suốt chữ</div><label class="ui-feedback-css-text-row"><span>Z-index</span><input type="number" min="-1000" max="1000" step="1" data-css-number-prop="zIndex" value="${Number(readCssValue('zIndex', 0)) || 0}" inputmode="numeric" /></label>${renderCssRange('Alpha màu chữ', 'colorAlpha', 0, 100, 1, '%', alpha, (value) => `${Math.round(value)}%`)}</div></div>`;
  }

  function cssShadowState() {
    return parseShadow(readCssValue('boxShadow', 'none'));
  }

  function renderCssContent() {
    const tab = state.cssTab || 'colors';
    const tabs = [
      ['preset', '✦ Bộ có sẵn'],
      ['colors', '● Màu sắc'],
      ['typography', 'T Chữ'],
      ['spacing', '↔ Khoảng cách'],
      ['position', '⌖ Vị trí'],
      ['advanced', '✦ Nâng cao'],
    ];
    const presets = `<div class="ui-feedback-css-section"><div class="ui-feedback-css-section__title">Bộ có sẵn</div><p class="ui-feedback-css-help">Chọn nhanh một phong cách, sau đó tinh chỉnh từng giá trị ở các tab bên cạnh.</p><div class="ui-feedback-css-presets"><button class="ui-feedback-css-preset" data-css-preset="clean" type="button"><span>Gọn gàng</span><small>Không bóng, bo 4px</small></button><button class="ui-feedback-css-preset" data-css-preset="soft" type="button"><span>Soft UI</span><small>Bo 14px, đổ bóng nhẹ</small></button><button class="ui-feedback-css-preset" data-css-preset="focus" type="button"><span>Focus accent</span><small>Viền accent nổi bật</small></button></div></div>`;
    const colors = `<div class="ui-feedback-css-section"><div class="ui-feedback-css-section__title">Màu sắc</div>${CSS_COLOR_FIELDS.map(renderCssColorCard).join('')}<details class="ui-feedback-more-colors"><summary>⌄ Thêm ${EXTRA_COLOR_FIELDS.length} màu khác</summary><div style="margin-top:6px">${EXTRA_COLOR_FIELDS.map(renderCssColorCard).join('')}</div></details></div><div class="ui-feedback-css-section"><div class="ui-feedback-css-section__title">Bề mặt & viền</div>${renderCssRange('Border radius', 'borderRadius', 0, 32, 1, 'px', 0)}${renderCssRange('Border width', 'borderWidth', 0, 12, 1, 'px', 0)}${renderCssSelect('Border style', 'borderStyle', [{ value: 'none', label: 'None' }, { value: 'solid', label: 'Solid' }, { value: 'dashed', label: 'Dashed' }, { value: 'dotted', label: 'Dotted' }], 'solid')}${renderCssRange('Opacity', 'opacity', 0, 100, 1, '%', 100, (value) => `${Math.round(value)}%`)}</div>`;
    const typography = `<div class="ui-feedback-css-section"><div class="ui-feedback-css-section__title">Typography</div>${renderFontRow('Font chữ (Google Fonts)', 'fontFamily')}${renderCssRange('Cỡ chữ', 'fontSize', 10, 72, 1, 'px', 16)}${renderCssSelect('Độ đậm', 'fontWeight', FONT_WEIGHT_OPTIONS, '400')}${renderCssRange('Line height', 'lineHeight', 1, 2, 0.05, '', 1.5, (value) => Number(value).toFixed(2))}${renderCssRange('Letter spacing', 'letterSpacing', -2, 4, 0.1, 'px', 0, (value) => `${Number(value).toFixed(1)}px`)}${renderTextAlign()}${renderCssSelect('Biến đổi chữ', 'textTransform', [{ value: 'none', label: 'Giữ nguyên' }, { value: 'uppercase', label: 'UPPERCASE' }, { value: 'capitalize', label: 'Capitalize' }, { value: 'lowercase', label: 'lowercase' }], 'none')}</div>`;
    const spacing = `<div class="ui-feedback-css-section"><div class="ui-feedback-css-section__title">Khoảng cách & kích thước</div><p class="ui-feedback-css-help">Đổi từng cạnh trực tiếp. Giá trị được áp dụng theo px để dễ kiểm soát khi review.</p>${renderSpacingGroup('Padding', 'padding')}${renderSpacingGroup('Margin', 'margin')}<div class="ui-feedback-css-subsection"><div class="ui-feedback-css-subtitle">Chiều rộng</div><label class="ui-feedback-css-text-row"><span>Width</span><input type="text" data-css-text-prop="width" value="${escapeAttribute(readCssValue('width', 'auto'))}" placeholder="auto · 320px · 80%" /></label><label class="ui-feedback-css-text-row"><span>Max-width</span><input type="text" data-css-text-prop="maxWidth" value="${escapeAttribute(readCssValue('maxWidth', 'none'))}" placeholder="none · 720px · 100%" /></label></div><div class="ui-feedback-css-subsection"><div class="ui-feedback-css-subtitle">Bóng nâng cao</div><label class="ui-feedback-css-text-row"><span>Box shadow</span><input type="text" data-css-text-prop="boxShadow" value="${escapeAttribute(readCssValue('boxShadow', 'none'))}" placeholder="0 10px 30px rgba(0,0,0,.12)" /></label></div></div>`;
    const position = `<div class="ui-feedback-css-section"><div class="ui-feedback-css-section__title">Vị trí 2D</div><div class="ui-feedback-position-pad" data-css-position-pad tabindex="0" aria-label="Điều chỉnh vị trí X Y"></div><div class="ui-feedback-position-sliders"><label><span>X</span><input type="range" min="-200" max="200" step="1" data-css-x value="${Math.round(state.cssPosition.x)}" /><output data-css-x-output>${Math.round(state.cssPosition.x)}px</output></label><label><span>Y</span><input type="range" min="-200" max="200" step="1" data-css-y value="${Math.round(state.cssPosition.y)}" /><output data-css-y-output>${Math.round(state.cssPosition.y)}px</output></label></div><div class="ui-feedback-position-inputs"><label><span>X (px)</span><input type="number" min="-200" max="200" step="1" data-css-x-number value="${Math.round(state.cssPosition.x)}" inputmode="numeric" /></label><label><span>Y (px)</span><input type="number" min="-200" max="200" step="1" data-css-y-number value="${Math.round(state.cssPosition.y)}" inputmode="numeric" /></label></div><button class="ui-feedback-button ui-feedback-css-reset" data-css-position-reset type="button">Đặt lại (0,0)</button></div><button class="ui-feedback-button ui-feedback-css-reset" data-css-reset type="button">↶ Khôi phục mặc định</button>`;
    const advanced = renderAdvancedCss();
    const content = { preset: presets, colors, typography, spacing, position, advanced }[tab] || colors;
    return `<div class="ui-feedback-css-tabs" role="tablist" aria-label="Nhóm thuộc tính CSS">${tabs.map(([value, label]) => `<button class="ui-feedback-css-tab ${tab === value ? 'is-active' : ''}" data-css-tab="${value}" type="button" role="tab" aria-selected="${tab === value}">${label}</button>`).join('')}</div>${content}`;
  }

  function renderImageContent() {
    const snapshot = state.modalSnapshot || captureImageState(state.target);
    const source = state.modalImageSource || snapshot.src || snapshot.effectiveSrc || '';
    const position = state.modalImagePosition || { x: 50, y: 50 };
    const zoom = state.modalImageZoom || 100;
    const positionStyle = `object-position:${position.x}% ${position.y}%;transform:scale(${zoom / 100});transform-origin:50% 50%;`;
    const preview = source ? `<img data-image-preview src="${escapeAttribute(source)}" alt="Ảnh preview" style="${positionStyle}" />` : '<span data-image-preview>Phần tử này chưa có ảnh URL trực tiếp. Hãy nhập URL hoặc chọn file.</span>';
    return `<div class="ui-feedback-image-block"><div class="ui-feedback-image-heading"><div><strong>Block: ${escapeHtml(targetLabel(state.target))}</strong><small>Đường dẫn ảnh · ${escapeHtml(safeText(cssPath(state.target), 90))}</small></div><span class="ui-feedback-image-state">${source && source !== snapshot.src ? 'đã đổi' : 'chưa đổi'}</span></div><div class="ui-feedback-image-preview" data-image-canvas aria-label="Kéo ảnh để căn chỉnh">${preview}<span class="ui-feedback-image-canvas-hint">Kéo ảnh để căn chỉnh</span></div><div class="ui-feedback-image-zoom"><button type="button" data-image-zoom-step="-" aria-label="Thu nhỏ ảnh">−</button><input type="range" min="30" max="300" step="5" data-image-zoom value="${zoom}" aria-label="Zoom ảnh" /><button type="button" data-image-zoom-step="+" aria-label="Phóng to ảnh">+</button><output data-image-zoom-output>${zoom}%</output></div><div class="ui-feedback-image-position"><span>Vị trí ảnh</span><output data-image-position>${Math.round(position.x)}% · ${Math.round(position.y)}%</output></div><div class="ui-feedback-image-position-controls" role="group" aria-label="Căn chỉnh vị trí ảnh"><button type="button" data-image-position-step="left" aria-label="Căn trái">← Trái</button><button type="button" data-image-position-step="right" aria-label="Căn phải">Phải →</button><button type="button" data-image-position-step="up" aria-label="Căn lên">↑ Lên</button><button type="button" data-image-position-step="down" aria-label="Căn xuống">Xuống ↓</button><button type="button" data-image-position-reset aria-label="Đặt ảnh về giữa">Đặt giữa</button></div><label class="ui-feedback-label" for="ui-feedback-image-url">URL ảnh</label><input id="ui-feedback-image-url" class="ui-feedback-image-url" data-feedback-input data-image-url value="${escapeAttribute(source)}" placeholder="https://example.com/image.jpg" type="url" /><button type="button" class="ui-feedback-image-paste" data-image-paste>Dán ảnh từ clipboard (Ctrl/Cmd + V)</button><label class="ui-feedback-label" for="ui-feedback-image-file">Hoặc upload từ máy</label><input id="ui-feedback-image-file" class="ui-feedback-image-upload" data-image-file type="file" accept="image/*" /><small class="ui-feedback-image-original">URL gốc: ${escapeHtml(safeText(snapshot.src || snapshot.backgroundImage || 'Không có', 150))}</small><small class="ui-feedback-image-original">Upload local được giữ tối đa 1 MB để tránh làm đầy localStorage.</small></div>`;
  }

  function renderModal(existing = null) {
    const mount = root.querySelector('[data-ui-feedback-modal]');
    if (!mount || !state.modalOpen) return;
    const isEdit = state.mode === 'edit';
    const isCss = state.mode === 'css';
    const isImage = state.mode === 'image';
    const currentText = existing?.comment || (isEdit ? String(state.target?.textContent || '') : '');
    const title = isEdit ? 'Sửa nội dung UI' : isCss ? 'Bộ giao diện' : isImage ? 'Thay ảnh' : 'Ghi chú feedback';
    const commentContent = isEdit
      ? `<label class="ui-feedback-label" for="ui-feedback-input">Nội dung hiển thị</label><textarea id="ui-feedback-input" class="ui-feedback-textarea ui-feedback-textarea--edit" data-feedback-input>${escapeHtml(currentText)}</textarea>`
      : isCss
        ? renderCssContent()
        : isImage
          ? renderImageContent()
          : `<label class="ui-feedback-label" for="ui-feedback-input">Bạn muốn thay đổi gì ở phần tử này?</label><textarea id="ui-feedback-input" class="ui-feedback-textarea" data-feedback-input placeholder="Mô tả ngắn gọn kết quả mong muốn. Ví dụ: Tăng khoảng cách phía trên để tiêu đề thoáng hơn…">${escapeHtml(currentText)}</textarea><small class="ui-feedback-input-hint">Viết theo kết quả mong muốn; file Markdown sẽ tự bổ sung trang, selector và thông tin phần tử.</small>`;
    const footer = isImage ? `<button class="ui-feedback-button" data-modal-action="cancel">Đóng</button><button class="ui-feedback-button" data-modal-action="reset-position" title="Đưa cửa sổ về vị trí mặc định">Đặt lại vị trí</button><button class="ui-feedback-button" data-image-restore type="button">Khôi phục</button><button class="ui-feedback-button ui-feedback-button--primary" data-modal-action="save">Lưu ảnh</button>` : `<button class="ui-feedback-button" data-modal-action="cancel">Hủy</button><button class="ui-feedback-button" data-modal-action="reset-position" title="Đưa cửa sổ về vị trí mặc định">Đặt lại vị trí</button><button class="ui-feedback-button ui-feedback-button--primary" data-modal-action="save">Lưu</button>`;
    const modalClass = isCss || isImage ? 'ui-feedback-modal is-editor' : 'ui-feedback-modal is-mini';
    mount.innerHTML = `<div class="ui-feedback-scrim" data-modal-action="cancel"></div><section class="${modalClass}" role="dialog" aria-modal="true" aria-labelledby="ui-feedback-title"><div class="ui-feedback-modal__top" data-modal-drag-handle title="Kéo vùng tiêu đề để di chuyển cửa sổ"><div class="ui-feedback-window-heading"><span class="ui-feedback-window-grip" aria-hidden="true">${ICONS.grip}</span><div><span class="ui-feedback-drag-hint">Kéo để di chuyển</span><h2 id="ui-feedback-title">${title}</h2><p>${escapeHtml(targetLabel(state.target))} · ${escapeHtml(safeText(cssPath(state.target), 90))}</p></div></div><button type="button" class="ui-feedback-icon-button ui-feedback-modal__close" data-modal-action="cancel" aria-label="Đóng cửa sổ" title="Đóng">${ICONS.close}</button></div><div class="ui-feedback-modal__content">${commentContent}</div><footer class="ui-feedback-modal__footer">${footer}</footer></section>`;
    applyModalPosition();
    mount.onclick = handleModalClick;
    mount.onpointerdown = handleModalPointerDown;
    mount.oninput = handleModalInput;
    mount.onchange = handleModalChange;
    mount.onkeydown = handleModalKeydown;
    mount.onwheel = handleModalWheel;
  }

  function applyPreviewImagePosition() {
    const preview = root.querySelector('[data-image-preview]');
    const position = state.modalImagePosition || { x: 50, y: 50 };
    if (preview?.tagName?.toLowerCase() === 'img') preview.style.objectPosition = `${position.x}% ${position.y}%`;
    applyPreviewImageZoom();
    const output = root.querySelector('[data-image-position]');
    if (output) output.textContent = `${Math.round(position.x)}% · ${Math.round(position.y)}%`;
  }

  function previewImageSource(source) {
    const preview = root.querySelector('[data-image-preview]');
    if (!preview) return;
    if (!source) { preview.outerHTML = '<span data-image-preview>Hãy nhập URL hoặc chọn file để xem preview.</span>'; return; }
    if (preview.tagName?.toLowerCase() === 'img') preview.src = source;
    else preview.outerHTML = `<img data-image-preview src="${escapeAttribute(source)}" alt="Ảnh preview" style="object-position:${state.modalImagePosition?.x || 50}% ${state.modalImagePosition?.y || 50}%;transform-origin:50% 50%;" />`;
    applyPreviewImagePosition();
    applyPreviewImageZoom();
  }

  function applyCssPreset(name) {
    if (!state.target) return;
    if (name === 'clean') {
      applyCssProperty('borderRadius', '4px');
      applyCssProperty('boxShadow', 'none');
      applyCssProperty('borderWidth', '1px');
      applyCssProperty('borderStyle', 'solid');
    } else if (name === 'soft') {
      applyCssProperty('borderRadius', '14px');
      applyCssProperty('boxShadow', '0 10px 30px rgba(0,0,0,.12)');
    } else if (name === 'focus') {
      applyCssProperty('borderColor', config.accent);
      applyCssProperty('outlineColor', config.accent);
      applyCssProperty('outlineStyle', 'solid');
      applyCssProperty('outlineWidth', '2px');
      applyCssProperty('outlineOffset', '2px');
    }
    renderModal();
  }

  let imageDragState = null;

  function updateImagePositionFromPointer(clientX, clientY) {
    if (!imageDragState || !state.modalOpen || state.mode !== 'image') return;
    const rect = imageDragState.canvas.getBoundingClientRect();
    const position = {
      x: Math.max(0, Math.min(100, imageDragState.x + ((clientX - imageDragState.clientX) / rect.width) * 100)),
      y: Math.max(0, Math.min(100, imageDragState.y + ((clientY - imageDragState.clientY) / rect.height) * 100)),
    };
    state.modalImagePosition = position;
    applyPreviewImagePosition();
    applyImagePosition(state.target, position);
  }

  function handleImagePointerDown(event) {
    if (state.mode !== 'image' || !state.modalOpen || event.button !== 0) return;
    const canvas = event.target.closest?.('[data-image-canvas]');
    if (!canvas) return;
    event.preventDefault();
    event.stopPropagation();
    const position = state.modalImagePosition || { x: 50, y: 50 };
    imageDragState = { canvas, clientX: event.clientX, clientY: event.clientY, x: position.x, y: position.y, pointerId: event.pointerId };
    canvas.classList.add('is-dragging');
    try { canvas.setPointerCapture?.(event.pointerId); } catch { /* unsupported capture */ }
    const onMove = (moveEvent) => {
      if (!imageDragState || moveEvent.pointerId !== imageDragState.pointerId) return;
      updateImagePositionFromPointer(moveEvent.clientX, moveEvent.clientY);
    };
    const onEnd = (endEvent) => {
      if (endEvent?.pointerId != null && endEvent.pointerId !== imageDragState?.pointerId) return;
      canvas.classList.remove('is-dragging');
      try { canvas.releasePointerCapture?.(imageDragState?.pointerId); } catch { /* unsupported capture */ }
      imageDragState = null;
      document.removeEventListener('pointermove', onMove, true);
      document.removeEventListener('pointerup', onEnd, true);
      document.removeEventListener('pointercancel', onEnd, true);
    };
    document.addEventListener('pointermove', onMove, true);
    document.addEventListener('pointerup', onEnd, true);
    document.addEventListener('pointercancel', onEnd, true);
  }

  let cssPositionDragState = null;

  function handleCssPositionPointerDown(event) {
    if (state.mode !== 'css' || !state.modalOpen || event.button !== 0) return false;
    const pad = event.target.closest?.('[data-css-position-pad]');
    if (!pad) return false;
    event.preventDefault();
    event.stopPropagation();
    cssPositionDragState = { pad, pointerId: event.pointerId };
    pad.classList.add('is-dragging');
    updateCssPositionFromPointer(event.clientX, event.clientY);
    try { pad.setPointerCapture?.(event.pointerId); } catch { /* unsupported capture */ }
    const onMove = (moveEvent) => {
      if (!cssPositionDragState || moveEvent.pointerId !== cssPositionDragState.pointerId) return;
      moveEvent.preventDefault();
      updateCssPositionFromPointer(moveEvent.clientX, moveEvent.clientY);
    };
    const onEnd = (endEvent) => {
      if (endEvent?.pointerId != null && endEvent.pointerId !== cssPositionDragState?.pointerId) return;
      pad.classList.remove('is-dragging');
      try { pad.releasePointerCapture?.(cssPositionDragState?.pointerId); } catch { /* unsupported capture */ }
      cssPositionDragState = null;
      document.removeEventListener('pointermove', onMove, true);
      document.removeEventListener('pointerup', onEnd, true);
      document.removeEventListener('pointercancel', onEnd, true);
    };
    document.addEventListener('pointermove', onMove, true);
    document.addEventListener('pointerup', onEnd, true);
    document.addEventListener('pointercancel', onEnd, true);
    return true;
  }

  function handleModalPointerDown(event) {
    if (handleCssPositionPointerDown(event)) return;
    handleImagePointerDown(event);
    return modalController.handlePointerDown(event);
  }

  function applyPreviewImageZoom() {
    const preview = root.querySelector('[data-image-preview]');
    const zoom = state.modalImageZoom || 100;
    if (preview?.tagName?.toLowerCase() === 'img') preview.style.transform = `scale(${zoom / 100})`;
    if (state.target && state.mode === 'image') applyImageZoom(state.target, zoom, state.modalImageBaseTransform);
    const output = root.querySelector('[data-image-zoom-output]');
    if (output) output.textContent = `${zoom}%`;
  }

  function handleModalWheel(event) {
    if (state.mode !== 'image' || !event.target.closest('[data-image-canvas]')) return;
    event.preventDefault();
    state.modalImageZoom = Math.max(30, Math.min(300, (state.modalImageZoom || 100) + (event.deltaY < 0 ? 10 : -10)));
    const input = root.querySelector('[data-image-zoom]');
    if (input) input.value = state.modalImageZoom;
    applyPreviewImageZoom();
  }

  async function pasteImageFromClipboard() {
    if (!navigator.clipboard?.read) { showToast('Trình duyệt chưa cho phép đọc clipboard'); return; }
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const type = item.types.find((value) => value.startsWith('image/'));
        if (type) {
          const blob = await item.getType(type);
          loadImageFile(blob);
          return;
        }
      }
      showToast('Clipboard chưa có dữ liệu ảnh');
    } catch { showToast('Không thể đọc ảnh từ clipboard'); }
  }

  function loadImageFile(file) {
    if (!file?.type?.startsWith('image/')) { showToast('Vui lòng chọn file ảnh'); return; }
    if (Number(file.size) > 1024 * 1024) { showToast('Ảnh upload vượt giới hạn 1 MB'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const source = String(reader.result || '');
      if (!validateImageSource(source)) { showToast('Ảnh upload vượt giới hạn 1 MB'); return; }
      state.modalImageSource = source;
      const urlInput = root.querySelector('[data-image-url]');
      if (urlInput) urlInput.value = source;
      previewImageSource(source);
    };
    reader.readAsDataURL(file);
  }

  function handleModalClick(event) {
    const positionStep = event.target.closest('[data-image-position-step]');
    if (positionStep) {
      event.stopPropagation();
      const position = { ...(state.modalImagePosition || { x: 50, y: 50 }) };
      const step = 5;
      if (positionStep.dataset.imagePositionStep === 'left') position.x -= step;
      if (positionStep.dataset.imagePositionStep === 'right') position.x += step;
      if (positionStep.dataset.imagePositionStep === 'up') position.y -= step;
      if (positionStep.dataset.imagePositionStep === 'down') position.y += step;
      state.modalImagePosition = { x: Math.max(0, Math.min(100, position.x)), y: Math.max(0, Math.min(100, position.y)) };
      applyPreviewImagePosition();
      applyImagePosition(state.target, state.modalImagePosition);
      return;
    }
    const imagePositionReset = event.target.closest('[data-image-position-reset]');
    if (imagePositionReset) {
      event.stopPropagation();
      state.modalImagePosition = { x: 50, y: 50 };
      applyPreviewImagePosition();
      applyImagePosition(state.target, state.modalImagePosition);
      return;
    }
    const zoomStep = event.target.closest('[data-image-zoom-step]');
    if (zoomStep) { event.stopPropagation(); state.modalImageZoom = Math.max(30, Math.min(300, (state.modalImageZoom || 100) + (zoomStep.dataset.imageZoomStep === '+' ? 15 : -15))); const input = root.querySelector('[data-image-zoom]'); if (input) input.value = state.modalImageZoom; applyPreviewImageZoom(); return; }
    const paste = event.target.closest('[data-image-paste]');
    if (paste) { event.stopPropagation(); pasteImageFromClipboard(); return; }
    const positionReset = event.target.closest('[data-css-position-reset]');
    if (positionReset) { event.stopPropagation(); applyCssPosition({ x: 0, y: 0 }); return; }
    const align = event.target.closest('[data-css-align]');
    if (align) { event.stopPropagation(); applyCssProperty('textAlign', align.dataset.cssAlign); renderModal(); return; }
    const tab = event.target.closest('[data-css-tab]');
    if (tab) { event.stopPropagation(); state.cssTab = tab.dataset.cssTab; renderModal(); return; }
    const preset = event.target.closest('[data-css-preset]');
    if (preset) { event.stopPropagation(); applyCssPreset(preset.dataset.cssPreset); return; }
    const shadowReset = event.target.closest('[data-css-shadow-reset]');
    if (shadowReset) { event.stopPropagation(); applyCssProperty('boxShadow', 'none'); renderModal(); return; }
    const reset = event.target.closest('[data-css-reset]');
    if (reset && state.target && state.modalSnapshot) {
      event.stopPropagation();
      state.target.style.cssText = state.modalSnapshot.styleCssText || '';
      state.cssPosition = parseTranslatePosition(state.target.style.translate || state.target.style.transform || '');
      renderModal();
      return;
    }
    const restore = event.target.closest('[data-image-restore]');
    if (restore && state.target && state.modalSnapshot) { event.stopPropagation(); restoreImageState(state.target, state.modalSnapshot); state.modalImageSource = state.modalSnapshot.src || state.modalSnapshot.effectiveSrc || ''; state.modalImagePosition = parseImagePosition(state.modalSnapshot.objectPosition || state.modalSnapshot.effectiveObjectPosition || state.modalSnapshot.backgroundPosition || state.modalSnapshot.effectiveBackgroundPosition || '50% 50%'); state.modalImageBaseTransform = state.modalSnapshot.transform || state.modalSnapshot.effectiveTransform || ''; state.modalImageZoom = imageEditor.parseImageZoom(state.modalSnapshot.transform || state.modalSnapshot.effectiveTransform || ''); renderModal(); return; }
    const target = event.target.closest('[data-modal-action]');
    if (!target) return;
    event.stopPropagation();
    if (target.dataset.modalAction === 'cancel') closeModal(true);
    else if (target.dataset.modalAction === 'reset-position') { state.modalPosition = { x: 0, y: 0 }; applyModalPosition(); showToast('Đã đặt lại vị trí cửa sổ'); }
    else if (target.dataset.modalAction === 'save') saveModal();
  }

  function handleModalInput(event) {
    const target = event.target;
    if (applyCssSelectControl(target)) {
      return;
    } else if (target.matches('[data-css-color]')) {
      applyCssProperty(target.dataset.cssColor, target.value);
      const card = target.closest('[data-css-card]');
      const hex = card?.querySelector('[data-css-hex]');
      const swatch = card?.querySelector('.ui-feedback-theme-card__swatch');
      if (hex) hex.value = target.value;
      if (swatch) swatch.style.background = target.value;
    } else if (target.matches('[data-css-hex]')) {
      const value = target.value.trim();
      if (/^#[0-9a-f]{6}$/i.test(value)) {
        applyCssProperty(target.dataset.cssHex, value);
        const card = target.closest('[data-css-card]');
        const color = card?.querySelector('[data-css-color]');
        const swatch = card?.querySelector('.ui-feedback-theme-card__swatch');
        if (color) color.value = value;
        if (swatch) swatch.style.background = value;
      }
    } else if (target.matches('[data-css-opacity]')) {
      applyCssProperty('opacity', String(Number(target.value) / 100));
      const output = root.querySelector('[data-css-opacity-output]');
      if (output) output.textContent = `${target.value}%`;
    } else if (target.matches('[data-css-shadow]')) {
      const shadow = cssShadowState();
      const key = target.dataset.cssShadow;
      if (key === 'color') shadow.color = target.value;
      else if (key === 'inset') shadow.inset = target.checked;
      else shadow[key] = Number(target.value) || 0;
      applyCssProperty('boxShadow', shadowCss(shadow));
      const output = root.querySelector(`[data-css-shadow-output="${key}"]`);
      if (output) output.textContent = `${Math.round(Number(target.value) || 0)}px`;
    } else if (target.matches('[data-css-range-prop]')) {
      const prop = target.dataset.cssRangeProp;
      const raw = Number(target.value);
      const unit = target.dataset.cssRangeUnit || '';
      if (prop === 'colorAlpha') {
        applyCssProperty('color', colorWithAlpha(readCssValue('color', '#ffffff'), raw / 100));
      } else if (prop === 'opacity') {
        applyCssProperty('opacity', String(raw / 100));
      } else {
        applyCssProperty(prop, `${raw}${unit}`);
      }
      const output = root.querySelector(`[data-css-output="${prop}"]`);
      if (output) output.textContent = prop === 'lineHeight' ? raw.toFixed(2) : prop === 'opacity' ? `${Math.round(raw)}%` : `${raw}${unit}`;
    } else if (target.matches('[data-css-number-prop]')) {
      const prop = target.dataset.cssNumberProp;
      const value = Math.max(-1000, Math.min(1000, Number(target.value) || 0));
      target.value = String(value);
      applyCssProperty(prop, String(value));
    } else if (target.matches('[data-css-spacing]')) {
      const min = target.dataset.cssSpacing.startsWith('margin') ? -160 : 0;
      const value = Math.max(min, Math.min(160, Number(target.value) || 0));
      target.value = String(value);
      applyCssProperty(target.dataset.cssSpacing, `${value}px`);
      const output = target.parentElement?.querySelector('output');
      if (output) output.textContent = `${Math.round(value)}px`;
    } else if (target.matches('[data-css-text-prop]')) {
      applyCssProperty(target.dataset.cssTextProp, target.value.trim() || (target.dataset.cssTextProp === 'boxShadow' ? 'none' : 'auto'));
    } else if (target.matches('[data-css-x], [data-css-y], [data-css-x-number], [data-css-y-number]')) {
      const isX = target.matches('[data-css-x], [data-css-x-number]');
      state.cssPosition[isX ? 'x' : 'y'] = Number(target.value);
      applyCssPosition();
    } else     if (target.matches('[data-image-zoom]')) {
      state.modalImageZoom = Math.max(30, Math.min(300, Number(target.value) || 100));
      target.value = state.modalImageZoom;
      applyPreviewImageZoom();
    } else if (target.matches('[data-css-radius]')) {
      applyCssProperty('borderRadius', `${target.value}px`);
      const output = root.querySelector('[data-css-radius-output]');
      if (output) output.value = `${target.value}px`;
      if (output) output.textContent = `${target.value}px`;
    } else if (target.matches('[data-image-url]')) {
      state.modalImageSource = target.value.trim();
    }
  }

  function applyCssSelectControl(target) {
    if (target.matches('[data-css-select-prop]')) {
      applyCssProperty(target.dataset.cssSelectProp, target.value);
      return true;
    }
    if (target.matches('[data-css-font]')) {
      const value = target.value;
      if (value) { ensureGoogleFont(value); applyCssProperty(target.dataset.cssFont, `'${value}', sans-serif`); }
      else applyCssProperty(target.dataset.cssFont, '');
      const label = target.closest('.ui-feedback-font-row')?.querySelector('.ui-feedback-font-row__value');
      if (label) label.textContent = value || 'Mặc định của website';
      return true;
    }
    return false;
  }

  function handleModalChange(event) {
    const target = event.target;
    if (applyCssSelectControl(target)) return;
    if (target.matches('[data-image-url]')) {
      previewImageSource(state.modalImageSource);
      return;
    }
    if (target.matches('[data-image-file]') && target.files?.[0]) loadImageFile(target.files[0]);
  }

  function handleModalKeydown(event) {
    const cssPositionPad = event.target.closest?.('[data-css-position-pad]');
    if (cssPositionPad && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
      event.preventDefault();
      const step = event.shiftKey ? 10 : 1;
      const next = { ...state.cssPosition };
      if (event.key === 'ArrowLeft') next.x -= step;
      if (event.key === 'ArrowRight') next.x += step;
      if (event.key === 'ArrowUp') next.y -= step;
      if (event.key === 'ArrowDown') next.y += step;
      applyCssPosition(next);
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      closeModal(true); // resume picking on Escape
    }
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      saveModal();
    }
    if (event.key === 'Tab') {
      const modal = event.currentTarget?.querySelector?.('.ui-feedback-modal');
      const focusable = [...(modal?.querySelectorAll('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])') || [])]
        .filter((element) => !element.hidden && element.getClientRects().length);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && shadow.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && shadow.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  }

  // Track existing item being edited
  let editingExisting = null;

  function openModalWithExisting(element, mode, existing) {
    editingExisting = existing || null;
    openModal(element, mode, existing);
  }

  function saveModal() {
    const input = root.querySelector('[data-feedback-input]');
    const existing = editingExisting;
    const modeUsed = state.mode;
    const rawValue = input?.value || '';
    const value = modeUsed === 'edit' ? rawValue : rawValue.trim();
    if (modeUsed === 'image') {
      const source = state.modalImageSource || value;
      if (!validateImageSource(source)) {
        input?.focus();
        showToast('URL ảnh không hợp lệ hoặc ảnh upload vượt giới hạn 1 MB');
        return;
      }
      const oldImageState = state.modalSnapshot || captureImageState(state.target);
      applyImageSource(state.target, source);
      applyImagePosition(state.target, state.modalImagePosition || { x: 50, y: 50 });
      applyImageZoom(state.target, state.modalImageZoom || 100, state.modalImageBaseTransform || '');
      const newImageState = captureImageState(state.target);
      // `value` is the canonical image source. Do not duplicate a potentially
      // large data URL inside newImageState as well.
      delete newImageState.src;
      delete newImageState.effectiveSrc;
      delete newImageState.backgroundImage;
      const oldImageReference = oldImageState.src || oldImageState.backgroundImage || '';
      const item = {
        id: generateId(), type: 'image', category: 'image', selector: cssPath(state.target), tag: targetLabel(state.target),
        codeLine: firstCodeLine(state.target),
        targetText: String(oldImageReference).startsWith('data:image/') ? '[Ảnh upload local trước đó]' : oldImageReference, value: source,
        imageSourceType: source.startsWith('data:image/') ? 'upload' : 'url',
        oldImageState, newImageState, page: location.pathname || '/',
        viewport: `${window.innerWidth}x${window.innerHeight}`, scrollY: Math.round(window.scrollY),
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      };
      state.comments.push(item);
      state.undoStack.push({ type: 'image', id: item.id, selector: item.selector, oldImageState });
      const persisted = persist();
      state.modalCommitted = true;
      showToast(persisted ? 'Đã thay ảnh trên trang' : 'Đã thay ảnh trong phiên này nhưng không thể lưu vào trình duyệt', { undo: true });
      editingExisting = null;
      closeModal(true);
      return;
    }
    if (modeUsed !== 'css' && !value.trim()) {
      input?.focus();
      showToast('Vui lòng nhập nội dung trước khi lưu');
      return;
    }
    if (modeUsed === 'edit' || modeUsed === 'css') {
      if (state.target) {
        const oldValue = modeUsed === 'edit' ? state.target.textContent : (state.modalSnapshot?.styleCssText || state.target.style.cssText);
        if (modeUsed === 'edit') state.target.textContent = value;
        const newValue = modeUsed === 'edit' ? value : state.target.style.cssText;
        
        const item = {
          id: generateId(),
          type: modeUsed,
          selector: cssPath(state.target),
          tag: targetLabel(state.target),
          category: modeUsed === 'edit' ? 'content' : ({ colors: 'color', typography: 'typography', spacing: 'spacing', position: 'layout' }[state.cssTab] || 'other'),
          codeLine: firstCodeLine(state.target),
          targetText: safeText(oldValue, 120),
          oldValue,
          value: newValue,
          page: location.pathname || '/',
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          scrollY: Math.round(window.scrollY),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        state.comments.push(item);
        
        state.undoStack.push({
          type: modeUsed,
          id: item.id,
          selector: item.selector,
          oldValue: oldValue
        });
      }
      const persisted = persist();
      state.modalCommitted = true;
      const successMessage = modeUsed === 'edit' ? 'Đã cập nhật nội dung trên trang' : 'Đã apply Bộ giao diện';
      showToast(persisted ? successMessage : `${successMessage} trong phiên này nhưng không thể lưu vào trình duyệt`, { undo: true });
    } else {
      const item = existing || { id: generateId(), createdAt: new Date().toISOString(), type: 'comment' };
      item.comment = value;
      item.priority = item.priority || 'medium';
      item.category = item.category || 'other';
      item.selector = cssPath(state.target);
      item.tag = targetLabel(state.target);
      item.codeLine = firstCodeLine(state.target);
      item.targetText = safeText(state.target?.textContent, 120);
      item.page = location.pathname || '/';
      item.viewport = `${window.innerWidth}x${window.innerHeight}`;
      item.scrollY = Math.round(window.scrollY);
      item.updatedAt = new Date().toISOString();
      if (!existing) state.comments.push(item);
      const persisted = persist();
      state.modalCommitted = true;
      const successMessage = existing ? 'Đã cập nhật feedback' : 'Đã lưu feedback';
      showToast(persisted ? successMessage : `${successMessage} trong phiên này nhưng không thể lưu vào trình duyệt`);
      // Pulse the badge
      setTimeout(() => {
        const badge = root.querySelector('.ui-feedback-badge');
        if (badge) {
          badge.classList.remove('is-pulse');
          void badge.offsetWidth;
          badge.classList.add('is-pulse');
        }
      }, 50);
    }
    editingExisting = null;
    closeModal(true); // true = came from save, should resume picking
  }

  function closeModal(resumePicking = false) {
    if (!state.modalCommitted && state.mode === 'css' && state.target && state.modalSnapshot) {
      state.target.style.cssText = state.modalSnapshot.styleCssText || '';
    }
    if (!state.modalCommitted && state.mode === 'image' && state.target && state.modalSnapshot) {
      restoreImageState(state.target, state.modalSnapshot);
    }
    state.modalOpen = false;
    state.target = null;
    state.modalSnapshot = null;
    state.modalImageSource = '';
    state.modalImagePosition = { x: 50, y: 50 };
    state.modalImageZoom = 100;
    state.modalImageBaseTransform = '';
    state.modalCommitted = false;
    editingExisting = null;
    const returnFocus = focusBeforeModal;
    focusBeforeModal = null;
    renderToolbar();
    // Place markers after comment save
    placeMarkers();
    // Resume picking mode if came from a save
    if (resumePicking) {
      resumePickingIfNeeded();
    }
    if (returnFocus?.isConnected) setTimeout(() => returnFocus.focus?.({ preventScroll: true }), 0);
  }

  /* ── comment CRUD ── */
  function editComment(id) { return commentsController.editComment(id); }

  function deleteComment(id) { return commentsController.deleteComment(id); }

  function undoAction() { return commentsController.undoAction(); }

  /* ── export ── */
  function exportMarkdown() { return markdownExporter.exportMarkdown(); }

  /* ── toast ── */
  function showToast(message, opts = {}) {
    return toastController?.showToast(message, opts);
  }

  /* ── toggle ── */
  function toggle() {
    const nextActive = !state.active;
    // CSS/image editors preview changes directly on the page. Turning the
    // tool off must behave like Cancel and restore an uncommitted preview.
    if (!nextActive && state.modalOpen) closeModal(false);
    state.active = nextActive;
    if (state.active) state.coachmarkVisible = config.coachmark !== false && !hasSeenCoachmark();
    persistActive();
    state.panelOpen = false;
    state.modalOpen = false;
    // Don't carry over picking context across a hard toggle on/off.
    state._modeBeforePickingStop = null;
    clearResumeTimer();
    stopPicking();
    renderToolbar();
    if (state.active) {
      placeMarkers();
    } else {
      clearMarkers();
    }
    showToast(state.active ? 'UI Feedback đã bật' : 'UI Feedback đã tắt');
  }

  /* ── keyboard shortcut ── */
  function normalizeShortcutKey(event) {
    const fromCode = typeof event.code === 'string' && event.code.startsWith('Key') ? event.code.slice(3) : '';
    return (fromCode || event.key || '').toLowerCase();
  }

  function keydown(event) {
    const editableTarget = (event.composedPath?.() || [event.target]).some((node) => node instanceof Element && isEditable(node));

    // Escape closes modal or panel when active
    if (event.key === 'Escape' && state.active) {
      if (state.modalOpen) { closeModal(true); event.preventDefault(); return; }
      if (state.panelOpen) { togglePanel(false); event.preventDefault(); return; }
      if (state.picking) {
        // Stop cleanly but keep the mode so the next toolbar click
        // resumes (or the user can hit the same button to re-enter).
        stopPicking({ rerender: true });
        event.preventDefault();
        return;
      }
    }

    // Never hijack typing in website fields, contenteditable regions or tool forms.
    if (editableTarget) return;

    const key = normalizeShortcutKey(event);

    // Quick Tagging during picking
    if (state.picking && state.highlight?.element && !state.pickingLocked) {
      const char = key.toUpperCase();
      if (['T', 'C', 'S'].includes(char)) {
        event.preventDefault();
        const tags = { 'T': '[Typography]', 'C': '[Color]', 'S': '[Spacing]' };
        const item = {
          id: generateId(),
          createdAt: new Date().toISOString(),
          comment: tags[char],
          priority: 'high',
          selector: cssPath(state.highlight.element),
          tag: targetLabel(state.highlight.element),
          category: char === 'T' ? 'typography' : char === 'C' ? 'color' : 'spacing',
          codeLine: firstCodeLine(state.highlight.element),
          targetText: safeText(state.highlight.element.textContent, 120),
          page: location.pathname || '/',
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          scrollY: Math.round(window.scrollY),
          updatedAt: new Date().toISOString()
        };
        state.comments.push(item);
        persist();
        stopPicking();
        renderToolbar();
        showToast(`Đã note ${tags[char]}`);
        setTimeout(() => {
          const badge = root.querySelector('.ui-feedback-badge');
          if (badge) {
            badge.classList.remove('is-pulse');
            void badge.offsetWidth;
            badge.classList.add('is-pulse');
          }
        }, 50);
        return;
      }
    }

    if (!config.shortcut.includes(key)) {
      if (!['shift', 'control', 'alt', 'meta'].includes(key)) {
        recentShortcutKeys.length = 0;
        clearTimeout(shortcutTimer);
      }
      return;
    }
    pressed.add(key);
    if (!event.repeat) {
      recentShortcutKeys.push(key);
      while (recentShortcutKeys.length > config.shortcut.length) recentShortcutKeys.shift();
      const simultaneous = config.shortcut.every((r) => pressed.has(r));
      const quickSequence = recentShortcutKeys.length === config.shortcut.length
        && config.shortcut.every((required, index) => recentShortcutKeys[index] === required);
      if (simultaneous || quickSequence) {
        event.preventDefault();
        recentShortcutKeys.length = 0;
        clearTimeout(shortcutTimer);
        toggle();
      } else {
        clearTimeout(shortcutTimer);
        shortcutTimer = setTimeout(() => {
          recentShortcutKeys.length = 0;
        }, 1500);
      }
    }
  }

  function keyup(event) {
    pressed.delete(normalizeShortcutKey(event));
  }

  /* ── element picking ── */
  function imageTargetFor(element) {
    if (!(element instanceof Element)) return null;
    if (element instanceof HTMLImageElement || element.tagName.toLowerCase() === 'img') return element;
    const directPictureImage = element.closest('picture')?.querySelector('img');
    if (directPictureImage) return directPictureImage;
    const nestedImages = element.querySelectorAll?.('img');
    if (nestedImages?.length === 1) return nestedImages[0];
    return element;
  }

  function targetForMode(element, mode = state.mode) {
    return mode === 'image' ? imageTargetFor(element) : element;
  }

  function elementAtPoint(clientX, clientY) {
    const picker = root.querySelector('[data-picker-layer]');
    if (picker) picker.style.display = 'none';
    const stack = typeof document.elementsFromPoint === 'function' ? document.elementsFromPoint(clientX, clientY) : [];
    const element = stack.find((candidate) => candidate instanceof Element && candidate !== document.documentElement && candidate !== document.body && !candidate.closest('#ui-feedback-host')) || document.elementFromPoint(clientX, clientY);
    if (picker) picker.style.display = '';
    if (
      !(element instanceof Element) ||
      element === document.documentElement ||
      element === document.body ||
      element.closest('#ui-feedback-host')
    )
      return null;
    return element;
  }

  function pointerMove(event) {
    if (!state.picking || event.composedPath?.().includes(host)) return;
    const element = targetForMode(elementAtPoint(event.clientX, event.clientY));
    if (!element) return;
    highlight(element);
  }

  /* ── unified host-level event delegation ── */
  // All click/pointerdown events are handled here to prevent double-fire issues.
  function handleHostEvent(event) {
    const path = event.composedPath();

    // 1) coachmark
    const coachmarkDismiss = path.find((node) => node instanceof Element && node.matches?.('[data-coachmark-dismiss]'));
    if (coachmarkDismiss) {
      if (event.type !== 'click') return;
      event.preventDefault();
      event.stopPropagation();
      dismissCoachmark();
      return;
    }

    // 2) toolbar buttons
    const button = path.find(
      (node) => node instanceof HTMLButtonElement && node.dataset?.action,
    );
    if (button) {
      if (event.type !== 'click') return;
      triggerToolbarAction(event, button);
      return;
    }

    // 3) picker layer interactions
    if (!state.picking || state.pickingLocked) return;
    const picker = path.find(
      (node) => node instanceof Element && node.matches?.('[data-picker-layer]'),
    );
    if (!picker) return;
    // Wait for click before opening the editor. Opening it on pointerdown can
    // make the companion click land on the newly mounted modal scrim and
    // immediately close the editor.
    if (event.type !== 'click') return;

    const element = targetForMode(elementAtPoint(event.clientX, event.clientY));
    if (!element) return;

    event.preventDefault();
    event.stopPropagation();

    // Lock to prevent the companion click from also firing
    state.pickingLocked = true;
    setTimeout(() => { state.pickingLocked = false; }, 600);

    openModal(element, state.mode);
  }

  /* ── document-level picking fallback ── */
  // Only fires for elements NOT inside the shadow host, in case the picker
  // layer fails to intercept (e.g. on elements with pointer-events:none above it).
  function documentPickHandler(event) {
    if (!state.picking || state.pickingLocked) return;
    if (event.composedPath().includes(host)) return;
    if (event.type !== 'click') return;
    const rawElement = event.target instanceof Element ? event.target : null;
    const element = targetForMode(rawElement);
    if (!element || element === document.documentElement || element === document.body) return;
    event.preventDefault();
    event.stopPropagation();
    state.pickingLocked = true;
    setTimeout(() => { state.pickingLocked = false; }, 600);
    openModal(element, state.mode);
  }

  /* ── drag & drop toolbar ── */
  function handleDragStart(event) {
    const path = event.composedPath();
    const grip = path.find(
      (node) => node instanceof Element && node.matches?.('[data-drag-handle]'),
    );
    if (!grip) return;

    event.preventDefault();
    event.stopPropagation();

    const toolbar = root.querySelector('.ui-feedback-toolbar');
    if (!toolbar) return;

    const rect = toolbar.getBoundingClientRect();
    dragState = {
      startX: event.clientX,
      startY: event.clientY,
      startInset: toolbarPos.side === 'left' ? rect.left : window.innerWidth - rect.right,
      startTop: rect.top,
    };

    function onMove(e) {
      if (!dragState) return;
      const dx = e.clientX - dragState.startX;
      const dy = e.clientY - dragState.startY;
      const nextInset = toolbarPos.side === 'left' ? dragState.startInset + dx : dragState.startInset - dx;
      toolbarPos.inset = Math.max(8, Math.min(window.innerWidth - 70, nextInset));
      toolbarPos.top = Math.max(40, Math.min(window.innerHeight - 100, dragState.startTop + dy));
      toolbar.style.cssText = getToolbarStyle();
    }

    function onEnd() {
      dragState = null;
      document.removeEventListener('pointermove', onMove, true);
      document.removeEventListener('pointerup', onEnd, true);
      document.removeEventListener('pointercancel', onEnd, true);
    }

    document.addEventListener('pointermove', onMove, true);
    document.addEventListener('pointerup', onEnd, true);
    document.addEventListener('pointercancel', onEnd, true);
  }

  /* ── dispose ── */
  function dispose() {
    if (state.modalOpen) closeModal(false);
    stopPicking();
    clearMarkers();
    window.removeEventListener('scroll', handleViewportChange);
    window.removeEventListener('resize', handleViewportChange);
    window.removeEventListener('pageshow', reapplyPageChanges);
    window.removeEventListener('popstate', reapplyPageChanges);
    document.removeEventListener('visibilitychange', reapplyPageChanges);
    document.removeEventListener('keydown', keydown, true);
    document.removeEventListener('keyup', keyup, true);
    window.removeEventListener('blur', blurHandler);
    document.removeEventListener('pointermove', pointerMove, true);
    document.removeEventListener('pointerdown', documentPickHandler, true);
    document.removeEventListener('click', documentPickHandler, true);
    host.removeEventListener('pointerdown', handleHostEvent, true);
    host.removeEventListener('click', handleHostEvent, true);
    host.removeEventListener('pointerdown', handleDragStart, true);
    clearTimeout(shortcutTimer);
    clearTimeout(reapplyTimer);
    domObserver?.disconnect();
    toastController?.dispose?.();
    if (themeMedia && themeChangeHandler) {
      if (themeMedia.removeEventListener) themeMedia.removeEventListener('change', themeChangeHandler);
      else themeMedia.removeListener?.(themeChangeHandler);
    }
    host.remove();
    delete window.__uiFeedbackInstance;
  }

  /* ── bind global listeners ── */
  const blurHandler = () => {
    pressed.clear();
    recentShortcutKeys.length = 0;
    clearTimeout(shortcutTimer);
  };
  const handleViewportChange = () => {
    refreshMarkerPositions();
  };
  const reapplyPageChanges = () => {
    if (!state.active) return;
    if (reapplyTimer) return;
    reapplyTimer = setTimeout(() => {
      reapplyTimer = null;
      applyPersistedChanges();
      placeMarkers();
    }, 40);
  };

  panelController = createPanelController({ state, root, showToast });
  modalController = createModalController({ state, root, showToast });
  cssEditor = createCssEditor({ state, root });
  pickerController = createPickerController({ state, root, config, renderToolbar, showToast });

  const featureContext = {
    state,
    root,
    config,
    persist,
    renderToolbar,
    renderPanel,
    renderModal,
    placeMarkers,
    clearMarkers,
    getItemCodeLine,
    openModalWithExisting,
    restoreImageState,
    showToast: (...args) => toastController?.showToast(...args),
  };
  toastController = createToastController({ root, undoAction: (...args) => commentsController?.undoAction(...args) });
  commentsController = createCommentsController(featureContext);
  markdownExporter = createMarkdownExporter(featureContext);

  if (typeof MutationObserver === 'function') {
    domObserver = new MutationObserver((mutations) => {
      if (!state.active || !mutations.some((mutation) => !host.contains(mutation.target))) return;
      reapplyPageChanges();
    });
    domObserver.observe(document.body || document.documentElement, { childList: true, subtree: true });
  }

  document.addEventListener('keydown', keydown, true);
  document.addEventListener('keyup', keyup, true);
  window.addEventListener('blur', blurHandler);
  // Keep markers positioned on scroll/resize
  window.addEventListener('scroll', handleViewportChange, { passive: true });
  window.addEventListener('resize', handleViewportChange, { passive: true });
  window.addEventListener('pageshow', reapplyPageChanges);
  window.addEventListener('popstate', reapplyPageChanges);
  document.addEventListener('visibilitychange', reapplyPageChanges);
  document.addEventListener('pointermove', pointerMove, true);
  // Document-level pick fallback (capture)
  document.addEventListener('pointerdown', documentPickHandler, true);
  document.addEventListener('click', documentPickHandler, true);
  // Host-level delegation — handles toolbar buttons + picker layer
  host.addEventListener('pointerdown', handleHostEvent, true);
  host.addEventListener('click', handleHostEvent, true);
  // Drag
  host.addEventListener('pointerdown', handleDragStart, true);

  window.__uiFeedbackInstance = {
    toggle,
    exportMarkdown,
    getComments: () => [...state.comments],
    notify: showToast,
    dispose,
  };
  if (state.active) applyPersistedChanges();
  renderToolbar();
  if (state.active) placeMarkers();
  return window.__uiFeedbackInstance;
}

if (typeof window !== 'undefined') {
  window.UIFeedback = { createUIFeedback };
}
