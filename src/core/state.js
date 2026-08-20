import { detectTheme } from './dom-utils.js';

export function createFeedbackState(config) {
  const activeStorageKey = `${config.storageKey}:active`;

  function loadComments() {
    try {
      const parsed = JSON.parse(localStorage.getItem(config.storageKey) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function loadActive() {
    if (!config.persistActive) return false;
    try { return sessionStorage.getItem(activeStorageKey) === '1'; } catch { return false; }
  }

  const state = {
    active: loadActive(),
    picking: false,
    pickingLocked: false,
    mode: 'comment',
    panelOpen: false,
    modalOpen: false,
    target: null,
    highlight: null,
    comments: loadComments(),
    undoStack: [],
    filterPriority: 'all',
    filterCategory: 'all',
    searchQuery: '',
    theme: detectTheme(config.theme),
    _modeBeforePickingStop: null,
    _resumeTimer: null,
    modalSnapshot: null,
    modalCommitted: false,
    modalImageSource: '',
    cssTab: 'advanced',
    drawerTab: 'all',
    collapsed: false,
    expandedComments: {},
    coachmarkVisible: false,
    cssPosition: { x: 0, y: 0 },
    cssTransformBase: '',
    modalImageZoom: 100,
    modalImagePosition: { x: 50, y: 50 },
    modalPosition: { x: 0, y: 0 },
    panelPosition: { x: 0, y: 0 },
    updateBusy: false,
  };

  function persist() {
    try { localStorage.setItem(config.storageKey, JSON.stringify(state.comments)); } catch { /* blocked storage */ }
  }

  function persistActive() {
    if (!config.persistActive) return;
    try { sessionStorage.setItem(activeStorageKey, state.active ? '1' : '0'); } catch { /* blocked storage */ }
  }

  function hasSeenCoachmark() {
    try { return localStorage.getItem(`${config.storageKey}:coachmark`) === '1'; } catch { return false; }
  }

  function dismissCoachmark() {
    state.coachmarkVisible = false;
    try { localStorage.setItem(`${config.storageKey}:coachmark`, '1'); } catch { /* blocked storage */ }
  }

  return {
    state,
    persist,
    persistActive,
    hasSeenCoachmark,
    dismissCoachmark,
    activeStorageKey,
  };
}
