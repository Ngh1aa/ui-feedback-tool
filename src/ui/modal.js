export function createModalController(ctx) {
  const { state, root } = ctx;

  function applyModalPosition() {
    const modal = root.querySelector('.ui-feedback-modal');
    if (!modal) return;
    const position = state.modalPosition || { x: 0, y: 0 };
    modal.style.setProperty('--ui-feedback-modal-x', `${position.x}px`);
    modal.style.setProperty('--ui-feedback-modal-y', `${position.y}px`);
  }

  function resetPosition() {
    state.modalPosition = { x: 0, y: 0 };
    applyModalPosition();
    ctx.showToast('Đã đặt lại vị trí cửa sổ');
  }

  function handlePointerDown(event) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const path = typeof event.composedPath === 'function' ? event.composedPath() : [];
    const elements = path.filter((node) => node && node.nodeType === 1);
    const target = elements[0] || event.target;
    const interactive = elements.find((node) => node.matches?.('button, a, input, textarea, select, option, [contenteditable="true"], [data-no-drag]'));
    if (interactive) return;
    const handle = elements.find((node) => node.matches?.('[data-modal-drag-handle]')) || target?.closest?.('[data-modal-drag-handle]');
    if (!handle) return;
    event.preventDefault();
    event.stopPropagation();
    const modal = root.querySelector('.ui-feedback-modal');
    const position = state.modalPosition || { x: 0, y: 0 };
    const drag = { clientX: event.clientX, clientY: event.clientY, x: position.x, y: position.y, pointerId: event.pointerId };
    handle.classList.add('is-dragging');
    modal?.classList.add('is-dragging');
    try { handle.setPointerCapture?.(event.pointerId); } catch { /* unsupported capture */ }
    const onMove = (moveEvent) => {
      if (moveEvent.pointerId !== drag.pointerId) return;
      const maxX = Math.max(0, window.innerWidth - 100);
      const maxY = Math.max(0, window.innerHeight - 100);
      state.modalPosition = {
        x: Math.max(-maxX, Math.min(maxX, drag.x + moveEvent.clientX - drag.clientX)),
        y: Math.max(-maxY, Math.min(maxY, drag.y + moveEvent.clientY - drag.clientY)),
      };
      applyModalPosition();
    };
    const onEnd = (endEvent) => {
      if (endEvent?.pointerId != null && endEvent.pointerId !== drag.pointerId) return;
      handle.classList.remove('is-dragging');
      modal?.classList.remove('is-dragging');
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

  return { applyModalPosition, resetPosition, handlePointerDown };
}
