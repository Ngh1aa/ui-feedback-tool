import { createUIFeedback } from '../src/ui-feedback.js';

const feedback = createUIFeedback({
  storageKey: 'ui-feedback-demo',
  githubRepo: 'Ngh1aa/ui-feedback-tool',
  accent: '#f5a623',
  persistActive: false,
});

feedback?.toggle();
