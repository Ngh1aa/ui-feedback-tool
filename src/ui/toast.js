import { escapeHtml } from '../core/dom-utils.js';

export function createToastController(ctx) {
  let toastTimer;

  function showToast(message, opts = {}) {
    const mount = ctx.root.querySelector('[data-ui-feedback-toast]');
    if (!mount) return;
    clearTimeout(toastTimer);
    const undoButton = opts.undo ? '<button class="ui-feedback-toast__undo" data-toast-undo>Hoàn tác</button>' : '';
    mount.innerHTML = `<div class="ui-feedback-toast" role="status">${escapeHtml(message)}${undoButton}</div>`;
    if (opts.undo) {
      mount.querySelector('[data-toast-undo]')?.addEventListener('click', (event) => {
        event.stopPropagation();
        ctx.undoAction();
        mount.innerHTML = '';
      });
    }
    toastTimer = setTimeout(() => {
      const toast = mount.querySelector('.ui-feedback-toast');
      if (!toast) return;
      toast.classList.add('is-leaving');
      setTimeout(() => { mount.innerHTML = ''; }, 220);
    }, opts.undo ? 5000 : 2400);
  }

  function dispose() {
    clearTimeout(toastTimer);
    const mount = ctx.root.querySelector('[data-ui-feedback-toast]');
    if (mount) mount.innerHTML = '';
  }

  return { showToast, dispose };
}
