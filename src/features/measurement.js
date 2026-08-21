import { escapeHtml } from '../core/dom-utils.js';

function numeric(value) {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function sideValues(style, prefix) {
  return {
    top: numeric(style.getPropertyValue(`${prefix}-top`)),
    right: numeric(style.getPropertyValue(`${prefix}-right`)),
    bottom: numeric(style.getPropertyValue(`${prefix}-bottom`)),
    left: numeric(style.getPropertyValue(`${prefix}-left`)),
  };
}

export function measureBox(element) {
  if (!(element instanceof Element)) return null;
  const rect = element.getBoundingClientRect();
  const style = getComputedStyle(element);
  return {
    rect: {
      x: rect.x,
      y: rect.y,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    },
    padding: sideValues(style, 'padding'),
    margin: sideValues(style, 'margin'),
    border: {
      top: numeric(style.borderTopWidth),
      right: numeric(style.borderRightWidth),
      bottom: numeric(style.borderBottomWidth),
      left: numeric(style.borderLeftWidth),
    },
    display: style.display,
  };
}

export function measureGap(elementA, elementB) {
  const first = measureBox(elementA)?.rect;
  const second = measureBox(elementB)?.rect;
  if (!first || !second || elementA === elementB) return null;

  const horizontal = second.left >= first.right
    ? second.left - first.right
    : first.left >= second.right ? first.left - second.right : 0;
  const vertical = second.top >= first.bottom
    ? second.top - first.bottom
    : first.top >= second.bottom ? first.top - second.bottom : 0;
  let axis = 'x';
  let distance = horizontal;
  if (!horizontal || (vertical > 0 && vertical < horizontal)) {
    axis = 'y';
    distance = vertical;
  }
  if (!horizontal && !vertical) {
    axis = 'overlap';
    distance = 0;
  }
  const horizontalPoint = second.left >= first.right
    ? { x1: first.right, x2: second.left, y: Math.max(first.top, Math.min(first.bottom, second.top)) }
    : { x1: second.right, x2: first.left, y: Math.max(second.top, Math.min(second.bottom, first.top)) };
  const verticalPoint = second.top >= first.bottom
    ? { y1: first.bottom, y2: second.top, x: Math.max(first.left, Math.min(first.right, second.left)) }
    : { y1: second.bottom, y2: first.top, x: Math.max(second.left, Math.min(second.right, first.left)) };
  return { axis, distance, first, second, horizontalPoint, verticalPoint };
}

function px(value) { return `${Math.round(value * 10) / 10}px`; }

export function createMeasurementController(ctx) {
  const { state, root } = ctx;
  let observer = null;
  let raf = 0;
  let scrollBound = false;

  function mount() { return root.querySelector('[data-picker-measurement-layer]'); }

  function clearOverlay() {
    cancelAnimationFrame(raf);
    raf = 0;
    const layer = mount();
    if (layer) layer.innerHTML = '';
  }

  function renderBoxOverlay(element, data = measureBox(element)) {
    const layer = mount();
    if (!layer || !data) return;
    const { rect, padding, margin, border } = data;
    layer.innerHTML = `<div class="ui-feedback-measurement-box" style="left:${px(rect.left)};top:${px(rect.top)};width:${px(rect.width)};height:${px(rect.height)}"><span class="ui-feedback-measurement-label">${Math.round(rect.width)} × ${Math.round(rect.height)}</span><i class="ui-feedback-measurement-edge ui-feedback-measurement-edge--padding" style="inset:${px(border.top + padding.top)} ${px(border.right + padding.right)} ${px(border.bottom + padding.bottom)} ${px(border.left + padding.left)}"></i><i class="ui-feedback-measurement-edge ui-feedback-measurement-edge--border" style="inset:${px(border.top / 2)} ${px(border.right / 2)} ${px(border.bottom / 2)} ${px(border.left / 2)}"></i></div><div class="ui-feedback-measurement-margin" style="left:${px(rect.left - margin.left)};top:${px(rect.top - margin.top)};width:${px(rect.width + margin.left + margin.right)};height:${px(rect.height + margin.top + margin.bottom)}"></div>`;
  }

  function renderGapOverlay(data) {
    const layer = mount();
    if (!layer || !data || data.axis === 'overlap') return;
    if (data.axis === 'x') {
      const y = data.horizontalPoint.y;
      const left = Math.min(data.horizontalPoint.x1, data.horizontalPoint.x2);
      layer.innerHTML = `<div class="ui-feedback-measurement-guide ui-feedback-measurement-guide--x" style="left:${px(left)};top:${px(y)};width:${px(data.distance)}"><span>${Math.round(data.distance)}px</span></div>`;
    } else {
      const x = data.verticalPoint.x;
      const top = Math.min(data.verticalPoint.y1, data.verticalPoint.y2);
      layer.innerHTML = `<div class="ui-feedback-measurement-guide ui-feedback-measurement-guide--y" style="left:${px(x)};top:${px(top)};height:${px(data.distance)}"><span>${Math.round(data.distance)}px</span></div>`;
    }
  }

  function recalibrate() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      raf = 0;
      const inspector = state.pickerInspector;
      const selected = inspector?.selected?.element;
      if (!inspector?.measurement?.enabled || !selected?.isConnected) {
        clearOverlay();
        return;
      }
      if (inspector.measurement.mode === 'gap') {
        renderGapOverlay(measureGap(selected, inspector.measurement.compareTarget));
      } else {
        renderBoxOverlay(selected);
      }
    });
  }

  function observe(...elements) {
    observer?.disconnect();
    observer = typeof ResizeObserver === 'function' && elements.some(Boolean) ? new ResizeObserver(recalibrate) : null;
    elements.filter((element) => element instanceof Element).forEach((element) => observer?.observe(element));
    if (!scrollBound) {
      window.addEventListener('scroll', recalibrate, { passive: true });
      window.addEventListener('resize', recalibrate, { passive: true });
      scrollBound = true;
    }
  }

  function enable(element, mode = 'box') {
    state.pickerInspector.measurement.enabled = true;
    state.pickerInspector.measurement.mode = mode;
    state.pickerInspector.measurement.compareTarget = null;
    observe(element);
    recalibrate();
  }

  function disable() {
    state.pickerInspector.measurement.enabled = false;
    state.pickerInspector.measurement.compareTarget = null;
    observer?.disconnect();
    observer = null;
    clearOverlay();
  }

  function setMode(mode) {
    state.pickerInspector.measurement.mode = mode;
    state.pickerInspector.measurement.enabled = true;
    observe(state.pickerInspector.selected?.element, state.pickerInspector.measurement.compareTarget);
    recalibrate();
  }

  function setCompareTarget(element) {
    if (!(element instanceof Element) || element.closest('#ui-feedback-host')) return false;
    state.pickerInspector.measurement.compareTarget = element;
    state.pickerInspector.measurement.enabled = true;
    observe(state.pickerInspector.selected?.element, element);
    recalibrate();
    return true;
  }

  function getSnapshot() {
    const inspector = state.pickerInspector;
    const box = inspector?.selected?.element ? measureBox(inspector.selected.element) : null;
    const gap = inspector?.measurement?.mode === 'gap' ? measureGap(inspector.selected?.element, inspector.measurement.compareTarget) : null;
    return { box, gap };
  }

  function destroy() {
    disable();
    if (scrollBound) {
      window.removeEventListener('scroll', recalibrate);
      window.removeEventListener('resize', recalibrate);
      scrollBound = false;
    }
  }

  return { measureBox, measureGap, renderBoxOverlay, renderGapOverlay, clearOverlay, recalibrate, enable, disable, setMode, setCompareTarget, getSnapshot, destroy };
}
