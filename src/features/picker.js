export function createPickerController(ctx) {
  const { state, root, config } = ctx;

  function clearResumeTimer() {
    if (state._resumeTimer) {
      clearTimeout(state._resumeTimer);
      state._resumeTimer = null;
    }
  }

  function clearHighlight() {
    if (!state.highlight) return;
    const { element, outline, outlinePriority, outlineOffset, outlineOffsetPriority } = state.highlight;
    if (element?.style) {
      if (outline) element.style.setProperty('outline', outline, outlinePriority); else element.style.removeProperty('outline');
      if (outlineOffset) element.style.setProperty('outline-offset', outlineOffset, outlineOffsetPriority); else element.style.removeProperty('outline-offset');
    }
    state.highlight = null;
  }

  function highlight(element) {
    if (!(element instanceof Element) || element.closest('#ui-feedback-host')) return;
    if (state.highlight?.element === element) return;
    clearHighlight();
    state.highlight = {
      element,
      outline: element.style.getPropertyValue('outline'),
      outlinePriority: element.style.getPropertyPriority('outline'),
      outlineOffset: element.style.getPropertyValue('outline-offset'),
      outlineOffsetPriority: element.style.getPropertyPriority('outline-offset'),
    };
    element.style.setProperty('outline', `2px solid ${config.accent}`, 'important');
    element.style.setProperty('outline-offset', '3px', 'important');
  }

  function beginPicking(mode, opts = {}) {
    clearResumeTimer();
    state.panelOpen = false;
    state.mode = mode;
    state.picking = true;
    state.pickingLocked = false;
    state._modeBeforePickingStop = null;
    root.classList.add('ui-feedback-picking');
    ctx.renderToolbar();
    if (!opts.silent) ctx.showToast(mode === 'comment' ? 'Chọn phần tử để ghi comment' : mode === 'edit' ? 'Chọn phần tử để sửa nội dung' : mode === 'image' ? 'Chọn phần tử ảnh để thay ảnh' : 'Chọn phần tử để mở Bộ giao diện');
  }

  function stopPicking(opts = {}) {
    clearResumeTimer();
    if (state.picking) state._modeBeforePickingStop = state.mode;
    state.picking = false;
    state.pickingLocked = false;
    root.classList.remove('ui-feedback-picking');
    clearHighlight();
    if (opts.rerender) ctx.renderToolbar();
  }

  function resumePickingIfNeeded() {
    if (!state.active || state.modalOpen) return;
    const mode = state._modeBeforePickingStop;
    state._modeBeforePickingStop = null;
    if (!mode) return;
    clearResumeTimer();
    state._resumeTimer = setTimeout(() => {
      state._resumeTimer = null;
      if (!state.active || state.modalOpen || state.picking) return;
      beginPicking(mode, { silent: true });
    }, 80);
  }

  return { clearResumeTimer, clearHighlight, highlight, beginPicking, stopPicking, resumePickingIfNeeded };
}
