import { cssPath, escapeHtml, targetLabel } from '../core/dom-utils.js';

const TOOL_SELECTOR = '#ui-feedback-host';
const MAX_BREADCRUMB_SEGMENTS = 5;

function isInspectable(element) {
  return element instanceof Element && element !== document.documentElement && element !== document.body && !element.closest(TOOL_SELECTOR);
}

function segmentFor(element, index) {
  const label = targetLabel(element) || element.tagName.toLowerCase();
  return {
    index,
    element,
    label,
    tag: element.tagName.toLowerCase(),
    selector: cssPath(element),
  };
}

export function buildBreadcrumb(element) {
  if (!isInspectable(element)) return [];
  const chain = [];
  let current = element;
  while (isInspectable(current)) {
    chain.unshift(segmentFor(current, chain.length));
    current = current.parentElement;
  }
  return chain.map((item, index) => ({ ...item, index }));
}

function renderBreadcrumb(items) {
  if (!items.length) return '';
  const button = (item) => `<button type="button" class="ui-feedback-inspector__crumb" data-breadcrumb-index="${item.index}" title="${escapeHtml(item.selector)}" aria-label="Chọn ${escapeHtml(item.label)}">${escapeHtml(item.label)}</button>`;
  if (items.length <= MAX_BREADCRUMB_SEGMENTS) return items.map(button).join('<span class="ui-feedback-inspector__crumb-separator" aria-hidden="true">›</span>');
  const middle = items.slice(1, -3);
  return `${button(items[0])}<span class="ui-feedback-inspector__crumb-separator" aria-hidden="true">›</span><details class="ui-feedback-inspector__overflow"><summary aria-label="Hiện các phần tử cha ở giữa">…</summary><div class="ui-feedback-inspector__overflow-menu">${middle.map(button).join('')}</div></details><span class="ui-feedback-inspector__crumb-separator" aria-hidden="true">›</span>${items.slice(-3).map(button).join('<span class="ui-feedback-inspector__crumb-separator" aria-hidden="true">›</span>')}`;
}

function formatSides(sides) {
  if (!sides) return '—';
  return `${Math.round(sides.top)} / ${Math.round(sides.right)} / ${Math.round(sides.bottom)} / ${Math.round(sides.left)}px`;
}

export function createPickerInspector(ctx) {
  const { state, root, renderToolbar, measurement } = ctx;

  function selectedElement() { return state.pickerInspector?.selected?.element || null; }

  function selectTarget(element) {
    if (!isInspectable(element) || state.pickerInspector.locked) return false;
    const breadcrumb = buildBreadcrumb(element);
    state.pickerInspector.phase = 'selected';
    state.pickerInspector.candidate = null;
    state.pickerInspector.selected = { element, selector: cssPath(element), label: targetLabel(element), breadcrumb };
    state.pickerInspector.breadcrumb = breadcrumb;
    state.pickerInspector.measurement.compareTarget = null;
    state.picking = false;
    state.pickingLocked = false;
    root.classList.remove('ui-feedback-picking');
    ctx.clearHighlight?.();
    renderToolbar();
    requestAnimationFrame(() => {
      positionInspector(element);
      root.querySelector('[data-picker-inspector]')?.focus({ preventScroll: true });
    });
    return true;
  }

  function setCandidate(element) {
    if (!isInspectable(element)) return false;
    state.pickerInspector.candidate = { element, selector: cssPath(element), label: targetLabel(element) };
    return true;
  }

  function lockTarget() {
    if (!selectedElement()) return false;
    state.pickerInspector.phase = 'locked';
    state.pickerInspector.locked = true;
    renderToolbar();
    positionInspector(selectedElement());
    return true;
  }

  function unlockTarget() {
    if (!selectedElement()) return false;
    state.pickerInspector.phase = 'selected';
    state.pickerInspector.locked = false;
    renderToolbar();
    positionInspector(selectedElement());
    return true;
  }

  function selectBreadcrumb(index) {
    const item = state.pickerInspector.breadcrumb?.[Number(index)];
    if (!item?.element || !item.element.isConnected) return false;
    state.pickerInspector.locked = false;
    return selectTarget(item.element);
  }

  function closeInspector() {
    measurement?.disable();
    state.pickerInspector.phase = 'idle';
    state.pickerInspector.candidate = null;
    state.pickerInspector.selected = null;
    state.pickerInspector.locked = false;
    state.pickerInspector.breadcrumb = [];
    state.pickerInspector.measurement = { enabled: false, mode: 'box', compareTarget: null };
    ctx.clearHighlight?.();
    renderToolbar();
  }

  function openAction(action) {
    const element = selectedElement();
    if (!element || !element.isConnected) {
      closeInspector();
      ctx.showToast?.('Phần tử đã thay đổi hoặc không còn trên trang');
      return false;
    }
    if (['comment', 'edit', 'css', 'image'].includes(action)) lockTarget();
    ctx.onAction?.(action, element);
    return true;
  }

  function measurementMarkup() {
    const inspector = state.pickerInspector;
    if (!inspector.measurement.enabled) return '';
    const snapshot = measurement?.getSnapshot?.() || {};
    if (inspector.measurement.mode === 'gap') {
      const gap = snapshot.gap;
      return `<section class="ui-feedback-inspector__measurement" aria-label="Đo khoảng cách"><div class="ui-feedback-inspector__section-head"><strong>Đo khoảng cách</strong><button type="button" data-inspector-action="measure-box" aria-label="Đo box" title="Đo box">Box</button></div><p class="ui-feedback-inspector__hint">${gap ? `Khoảng cách ngắn nhất theo trục <b>${gap.axis}</b>: <b>${Math.round(gap.distance)}px</b>` : 'Đang chờ phần tử thứ hai…'}</p></section>`;
    }
    const box = snapshot.box;
    if (!box) return '';
    return `<section class="ui-feedback-inspector__measurement" aria-label="Đo kích thước"><div class="ui-feedback-inspector__section-head"><strong>Đo box</strong><button type="button" data-inspector-action="measure-gap" aria-label="Đo khoảng cách" title="Đo khoảng cách">Gap</button></div><div class="ui-feedback-inspector__metrics"><span><b>W</b>${Math.round(box.rect.width)}px</span><span><b>H</b>${Math.round(box.rect.height)}px</span><span><b>X</b>${Math.round(box.rect.x)}px</span><span><b>Y</b>${Math.round(box.rect.y)}px</span></div><p class="ui-feedback-inspector__hint">Padding ${formatSides(box.padding)} · Margin ${formatSides(box.margin)}</p></section>`;
  }

  function renderInspector() {
    const inspector = state.pickerInspector;
    if (!inspector || !inspector.selected || inspector.phase === 'idle') return '';
    const selected = inspector.selected;
    const lockLabel = inspector.locked ? 'Mở khóa selection' : 'Khóa selection';
    return `<aside class="ui-feedback-inspector ${inspector.locked ? 'is-locked' : ''}" data-picker-inspector role="dialog" aria-label="Picker Inspector" tabindex="-1"><header class="ui-feedback-inspector__header"><div class="ui-feedback-window-heading"><span class="ui-feedback-window-grip" aria-hidden="true">⋮⋮</span><div><strong>Inspector</strong><small>${inspector.locked ? 'Selection đã khóa' : 'Selection đang mở'}</small></div></div><div class="ui-feedback-inspector__actions"><button type="button" class="ui-feedback-icon-button" data-inspector-action="lock" aria-label="${lockLabel}" title="${lockLabel}">${inspector.locked ? '🔒' : '⌑'}</button><button type="button" class="ui-feedback-icon-button" data-inspector-action="close" aria-label="Đóng Inspector" title="Đóng">×</button></div></header><div class="ui-feedback-inspector__body"><div class="ui-feedback-inspector__crumbs" aria-label="Breadcrumb DOM">${renderBreadcrumb(selected.breadcrumb)}</div><div class="ui-feedback-inspector__target"><div><strong>${escapeHtml(selected.label || selected.tag)}</strong><small>${escapeHtml(selected.selector)}</small></div><button type="button" class="ui-feedback-inspector__copy" data-inspector-action="copy" aria-label="Copy selector" title="Copy selector">Copy</button></div><div class="ui-feedback-inspector__actions-grid"><button type="button" data-inspector-action="comment">Comment</button><button type="button" data-inspector-action="edit">Sửa text</button><button type="button" data-inspector-action="css">Bộ CSS</button><button type="button" data-inspector-action="image">Thay ảnh</button></div><div class="ui-feedback-inspector__measure-actions"><button type="button" data-inspector-action="measure-box" class="${inspector.measurement.enabled && inspector.measurement.mode === 'box' ? 'is-active' : ''}">Đo box</button><button type="button" data-inspector-action="measure-gap" class="${inspector.measurement.enabled && inspector.measurement.mode === 'gap' ? 'is-active' : ''}">Đo gap</button></div>${measurementMarkup()}<p class="ui-feedback-inspector__shortcut"><kbd>Enter</kbd> chọn · <kbd>L</kbd> khóa · <kbd>M</kbd> đo · <kbd>Esc</kbd> đóng</p></div></aside>`;
  }

  function positionInspector(target = selectedElement()) {
    const inspector = root.querySelector('[data-picker-inspector]');
    if (!inspector || !(target instanceof Element)) return;
    if (window.innerWidth <= 640) {
      inspector.style.left = '12px';
      inspector.style.right = '12px';
      inspector.style.top = 'auto';
      inspector.style.bottom = '12px';
      return;
    }
    const rect = target.getBoundingClientRect();
    const width = Math.min(340, Math.max(300, window.innerWidth - 24));
    const height = Math.min(inspector.offsetHeight || 380, window.innerHeight - 24);
    const gap = 12;
    let left = rect.right + gap;
    let top = rect.top;
    if (left + width > window.innerWidth - 12) left = rect.left - width - gap;
    if (left < 12) left = Math.max(12, Math.min(window.innerWidth - width - 12, rect.left));
    if (top + height > window.innerHeight - 12) top = window.innerHeight - height - 12;
    top = Math.max(12, top);
    inspector.style.left = `${Math.round(left)}px`;
    inspector.style.top = `${Math.round(top)}px`;
    inspector.style.width = `${Math.round(width)}px`;
    inspector.style.right = 'auto';
    inspector.style.bottom = 'auto';
  }

  function refresh() {
    renderToolbar();
    requestAnimationFrame(() => positionInspector());
  }

  return { selectTarget, setCandidate, lockTarget, unlockTarget, selectBreadcrumb, closeInspector, openAction, renderInspector, positionInspector, refresh, selectedElement };
}
