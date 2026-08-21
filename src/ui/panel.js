export function createPanelController(ctx) {
  const { state, root } = ctx;

  function clampDelta(panel, nextX, nextY, current) {
    if (!panel) return { x: nextX, y: nextY };
    const rect = panel.getBoundingClientRect();
    const margin = 8;
    const dx = Math.max(margin - rect.left, Math.min(window.innerWidth - margin - rect.right, nextX - current.x));
    const dy = Math.max(margin - rect.top, Math.min(window.innerHeight - margin - rect.bottom, nextY - current.y));
    return { x: current.x + dx, y: current.y + dy };
  }

  function getWindowDragHandle(event, selector) {
    if (event.pointerType === 'mouse' && event.button !== 0) return null;
    const path = typeof event.composedPath === 'function' ? event.composedPath() : [];
    const elements = path.filter((node) => node && node.nodeType === 1);
    const target = elements[0] || event.target;
    const interactive = elements.find((node) => node.matches?.('button, a, input, textarea, select, option, [contenteditable="true"], [data-no-drag]'));
    if (interactive) return null;
    return elements.find((node) => node.matches?.(selector)) || target?.closest?.(selector) || null;
  }

  function applyPanelPosition() {
    const panel = root.querySelector('.ui-feedback-panel');
    if (!panel) return;
    const position = state.panelPosition || { x: 0, y: 0 };
    panel.style.setProperty('--ui-feedback-panel-x', `${position.x}px`);
    panel.style.setProperty('--ui-feedback-panel-y', `${position.y}px`);
  }

  function resetPosition() {
    state.panelPosition = { x: 0, y: 0 };
    applyPanelPosition();
    ctx.showToast('Đã đặt lại vị trí cửa sổ');
  }

  function handlePointerDown(event) {
    const handle = getWindowDragHandle(event, '[data-panel-drag-handle]');
    if (!handle) return;
    event.preventDefault();
    event.stopPropagation();
    const panel = root.querySelector('.ui-feedback-panel');
    const position = state.panelPosition || { x: 0, y: 0 };
    const drag = { clientX: event.clientX, clientY: event.clientY, x: position.x, y: position.y, pointerId: event.pointerId };
    handle.classList.add('is-dragging');
    panel?.classList.add('is-dragging');
    try { handle.setPointerCapture?.(event.pointerId); } catch { /* unsupported capture */ }
    const onMove = (moveEvent) => {
      if (moveEvent.pointerId !== drag.pointerId) return;
      state.panelPosition = clampDelta(
        panel,
        drag.x + moveEvent.clientX - drag.clientX,
        drag.y + moveEvent.clientY - drag.clientY,
        state.panelPosition || { x: 0, y: 0 },
      );
      applyPanelPosition();
    };
    const onEnd = (endEvent) => {
      if (endEvent?.pointerId != null && endEvent.pointerId !== drag.pointerId) return;
      handle.classList.remove('is-dragging');
      panel?.classList.remove('is-dragging');
      try { handle.releasePointerCapture?.(drag.pointerId); } catch { /* unsupported capture */ }
      document.removeEventListener('pointermove', onMove, true);
      document.removeEventListener('pointerup', onEnd, true);
      document.removeEventListener('pointercancel', onEnd, true);
      window.removeEventListener('blur', onBlur);
    };
    const onBlur = () => onEnd();
    document.addEventListener('pointermove', onMove, true);
    document.addEventListener('pointerup', onEnd, true);
    document.addEventListener('pointercancel', onEnd, true);
    window.addEventListener('blur', onBlur);
  }

  return { applyPanelPosition, resetPosition, handlePointerDown };
}
