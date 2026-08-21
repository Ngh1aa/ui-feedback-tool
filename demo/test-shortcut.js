import { createUIFeedback } from '../src/ui-feedback.js';

const instance = createUIFeedback({ storageKey: 'ui-feedback-shortcut-test' });
setTimeout(() => {
  for (const key of ['q', 'w', 'e']) {
    window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    window.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true }));
  }
  document.title = `active:${Boolean(document.querySelector('#ui-feedback-host'))}:${Boolean(instance)}`;
}, 100);
