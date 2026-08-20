// src/core/config.js
var TOOL_VERSION = "0.11.0";
var DEFAULTS = {
  version: TOOL_VERSION,
  updateUrl: "https://ngh1aa.github.io/Atelier/ui-feedback.js",
  updateMirrors: [
    "https://ngh1aa.github.io/Atelier/ui-feedback.js",
    "https://ngh1aa.github.io/LuxRoom/ui-feedback.js",
    "https://ngh1aa.github.io/StudioOS/ui-feedback.js",
    "https://raw.githubusercontent.com/Ngh1aa/ui-feedback-tool/main/src/ui-feedback.js"
  ],
  shortcut: ["q", "w", "e"],
  storageKey: "ui-feedback-session",
  accent: "#ffffff",
  position: "right",
  theme: "auto",
  githubRepo: "Ngh1aa/StudioOS",
  persistActive: true,
  coachmark: true
};
function mergeConfig(options = {}) {
  return {
    ...DEFAULTS,
    ...options,
    shortcut: (options.shortcut || DEFAULTS.shortcut).map((key) => String(key).toLowerCase())
  };
}
var FEEDBACK_CATEGORIES = [
  { value: "layout", label: "B\u1ED1 c\u1EE5c" },
  { value: "image", label: "H\xECnh \u1EA3nh" },
  { value: "content", label: "N\u1ED9i dung" },
  { value: "typography", label: "Ki\u1EC3u ch\u1EEF" },
  { value: "color", label: "M\xE0u s\u1EAFc" },
  { value: "spacing", label: "Kho\u1EA3ng c\xE1ch" },
  { value: "interaction", label: "T\u01B0\u01A1ng t\xE1c" },
  { value: "other", label: "Kh\xE1c" }
];
var CATEGORY_LABELS = Object.fromEntries(
  FEEDBACK_CATEGORIES.map((item) => [item.value, item.label])
);
var CSS_COLOR_FIELDS = [
  { key: "primary", label: "M\xE0u ch\xEDnh", prop: "backgroundColor", fallback: "#cb0236", hint: "background-color" },
  { key: "primaryText", label: "Ch\u1EEF tr\xEAn m\xE0u ch\xEDnh", prop: "color", fallback: "#ffffff", hint: "color" },
  { key: "pageBackground", label: "N\u1EC1n trang", prop: "backgroundColor", fallback: "#f4f8f8", hint: "background-color" },
  { key: "text", label: "M\xE0u ch\u1EEF", prop: "color", fallback: "#1b212b", hint: "color" }
];
var EXTRA_COLOR_FIELDS = [
  { key: "border", label: "Vi\u1EC1n", prop: "borderColor", fallback: "#d1d5db", hint: "border-color" },
  { key: "outline", label: "Outline", prop: "outlineColor", fallback: "#f5a623", hint: "outline-color" },
  { key: "decoration", label: "G\u1EA1ch ch\xE2n", prop: "textDecorationColor", fallback: "#f5a623", hint: "text-decoration-color" },
  { key: "caret", label: "Caret", prop: "caretColor", fallback: "#f5a623", hint: "caret-color" },
  { key: "accent", label: "Accent", prop: "accentColor", fallback: "#f5a623", hint: "accent-color" },
  { key: "columnRule", label: "Column rule", prop: "columnRuleColor", fallback: "#d1d5db", hint: "column-rule-color" },
  { key: "marker", label: "Marker", prop: "markerColor", fallback: "#f5a623", hint: "marker-color" },
  { key: "fill", label: "SVG fill", prop: "fill", fallback: "#f5a623", hint: "fill" }
];
var FONT_OPTIONS = [
  { value: "", label: "M\u1EB7c \u0111\u1ECBnh website" },
  { value: "Inter", label: "Inter" },
  { value: "DM Sans", label: "DM Sans" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Roboto", label: "Roboto" },
  { value: "Playfair Display", label: "Playfair Display" },
  { value: "Lora", label: "Lora" }
];
var FONT_WEIGHT_OPTIONS = [
  { value: "400", label: "400 \xB7 Regular" },
  { value: "500", label: "500 \xB7 Medium" },
  { value: "600", label: "600 \xB7 Semibold" },
  { value: "700", label: "700 \xB7 Bold" },
  { value: "800", label: "800 \xB7 Extra bold" }
];
var TEXT_ALIGN_OPTIONS = [
  { value: "left", label: "Tr\xE1i", icon: "\u21E4" },
  { value: "center", label: "Gi\u1EEFa", icon: "\u2261" },
  { value: "right", label: "Ph\u1EA3i", icon: "\u21E5" },
  { value: "justify", label: "\u0110\u1EC1u", icon: "\u2630" }
];
var CSS_SPACING_SIDES = [
  { key: "top", label: "Tr\xEAn", prop: "Top" },
  { key: "right", label: "Ph\u1EA3i", prop: "Right" },
  { key: "bottom", label: "D\u01B0\u1EDBi", prop: "Bottom" },
  { key: "left", label: "Tr\xE1i", prop: "Left" }
];
function defaultCategoryForType(type) {
  if (type === "image") return "image";
  if (type === "edit") return "content";
  if (type === "css") return "color";
  return "other";
}
function categoryLabel(value, type = "comment") {
  return CATEGORY_LABELS[value] || CATEGORY_LABELS[defaultCategoryForType(type)] || "Kh\xE1c";
}

// src/core/dom-utils.js
function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
}
function escapeMarkdown(value) {
  return String(value || "").replace(/[\\`*_{}\[\]()#+.!|>-]/g, "\\$&");
}
function formatDate(date) {
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}
function relativeTime(isoString) {
  if (!isoString) return "";
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 6e4);
  if (mins < 1) return "V\u1EEBa xong";
  if (mins < 60) return `${mins} ph\xFAt tr\u01B0\u1EDBc`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} gi\u1EDD tr\u01B0\u1EDBc`;
  return `${Math.floor(hours / 24)} ng\xE0y tr\u01B0\u1EDBc`;
}
function safeText(value, max = 180) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max - 1)}\u2026` : text;
}
function cssPath(element) {
  if (typeof Element === "undefined" || !(element instanceof Element)) return "";
  const parts = [];
  let node = element;
  while (node && node.nodeType === 1 && node !== document.body && parts.length < 6) {
    let part = node.tagName.toLowerCase();
    if (node.id) {
      part += `#${window.CSS.escape(node.id)}`;
      parts.unshift(part);
      break;
    }
    const classes = [...node.classList].filter(Boolean).slice(0, 2);
    if (classes.length) part += `.${classes.map(window.CSS.escape).join(".")}`;
    const siblings = node.parentElement ? [...node.parentElement.children].filter((sibling) => sibling.tagName === node.tagName) : [];
    if (siblings.length > 1) part += `:nth-of-type(${siblings.indexOf(node) + 1})`;
    parts.unshift(part);
    node = node.parentElement;
  }
  return parts.join(" > ");
}
function targetLabel(element) {
  if (typeof Element === "undefined" || !(element instanceof Element)) return "Element ch\u01B0a x\xE1c \u0111\u1ECBnh";
  const tag = element.tagName.toLowerCase();
  const id = element.id ? `#${element.id}` : "";
  const classes = [...element.classList].filter(Boolean).slice(0, 2).map((name) => `.${name}`).join("");
  return `${tag}${id}${classes}`;
}
function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}
function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, "&#096;");
}
function firstCodeLine(element) {
  if (typeof Element === "undefined" || !(element instanceof Element)) return "";
  const markup = String(element.outerHTML || "").trim();
  return safeText(markup.split(/\r?\n/)[0] || markup, 180);
}
function detectTheme(preference) {
  if (preference === "dark") return "dark";
  if (preference === "light") return "light";
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function resolveSelector(selector) {
  if (!selector) return null;
  try {
    return document.querySelector(selector);
  } catch {
    return null;
  }
}

// src/core/state.js
function createFeedbackState(config) {
  const activeStorageKey = `${config.storageKey}:active`;
  function loadComments() {
    try {
      const parsed = JSON.parse(localStorage.getItem(config.storageKey) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  function loadActive() {
    if (!config.persistActive) return false;
    try {
      return sessionStorage.getItem(activeStorageKey) === "1";
    } catch {
      return false;
    }
  }
  const state = {
    active: loadActive(),
    picking: false,
    pickingLocked: false,
    mode: "comment",
    panelOpen: false,
    modalOpen: false,
    target: null,
    highlight: null,
    comments: loadComments(),
    undoStack: [],
    filterPriority: "all",
    filterCategory: "all",
    searchQuery: "",
    theme: detectTheme(config.theme),
    _modeBeforePickingStop: null,
    _resumeTimer: null,
    modalSnapshot: null,
    modalCommitted: false,
    modalImageSource: "",
    cssTab: "advanced",
    drawerTab: "all",
    collapsed: false,
    expandedComments: {},
    coachmarkVisible: false,
    cssPosition: { x: 0, y: 0 },
    cssTransformBase: "",
    modalImageZoom: 100,
    modalImagePosition: { x: 50, y: 50 },
    modalPosition: { x: 0, y: 0 },
    panelPosition: { x: 0, y: 0 },
    pickerInspector: {
      phase: "idle",
      candidate: null,
      selected: null,
      locked: false,
      breadcrumb: [],
      measurement: { enabled: false, mode: "box", compareTarget: null }
    },
    updateBusy: false
  };
  function persist() {
    try {
      localStorage.setItem(config.storageKey, JSON.stringify(state.comments));
    } catch {
    }
  }
  function persistActive() {
    if (!config.persistActive) return;
    try {
      sessionStorage.setItem(activeStorageKey, state.active ? "1" : "0");
    } catch {
    }
  }
  function hasSeenCoachmark() {
    try {
      return localStorage.getItem(`${config.storageKey}:coachmark`) === "1";
    } catch {
      return false;
    }
  }
  function dismissCoachmark() {
    state.coachmarkVisible = false;
    try {
      localStorage.setItem(`${config.storageKey}:coachmark`, "1");
    } catch {
    }
  }
  return {
    state,
    persist,
    persistActive,
    hasSeenCoachmark,
    dismissCoachmark,
    activeStorageKey
  };
}

// src/stylesheet.js
var STYLESHEET = `
:host { all: initial; }
* { box-sizing: border-box; }
button, input, textarea, select { font: inherit; }
button { cursor: pointer; }

/* \u2500\u2500 theme tokens \u2500\u2500 */
.ui-feedback-root {
  --_bg: #ffffff;
  --_bg-alt: #fafafa;
  --_bg-hover: #f6f6f6;
  --_bg-panel: #fff;
  --_bg-item: #fff;
  --_bg-input: transparent;
  --_bg-badge: #d11b51;
  --_bg-toolbar: #121212;
  --_bg-toolbar-hover: #282828;
  --_text: #171717;
  --_text-secondary: #777;
  --_text-muted: #888;
  --_text-toolbar: #fff;
  --_border: #e5e5e5;
  --_border-panel: #dedede;
  --_border-modal: #e1e1e1;
  --_border-group: #ededed;
  --_shadow: rgba(0,0,0,.18);
  --_shadow-heavy: rgba(0,0,0,.27);
  --_scrim: rgba(0,0,0,.18);
  --_accent-ink: #111;
  --_focus-ring: rgba(17,17,17,.18);
  color: var(--_text);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 14px;
  line-height: 1.4;
}

.ui-feedback-root.is-dark {
  --_bg: #1a1a1a;
  --_bg-alt: #222;
  --_bg-hover: #2a2a2a;
  --_bg-panel: #1e1e1e;
  --_bg-item: #252525;
  --_bg-input: #2a2a2a;
  --_bg-toolbar: #0a0a0a;
  --_bg-toolbar-hover: #1e1e1e;
  --_text: #e8e8e8;
  --_text-secondary: #999;
  --_text-muted: #777;
  --_text-toolbar: #e8e8e8;
  --_border: #333;
  --_border-panel: #333;
  --_border-modal: #383838;
  --_border-group: #333;
  --_shadow: rgba(0,0,0,.4);
  --_shadow-heavy: rgba(0,0,0,.55);
  --_scrim: rgba(0,0,0,.45);
  --_accent-ink: #111;
  --_focus-ring: rgba(255,255,255,.28);
}

.ui-feedback-root [hidden] { display: none !important; }

/* \u2500\u2500 animations \u2500\u2500 */
@keyframes uiFeedbackFadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes uiFeedbackSlideIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes uiFeedbackToastIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes uiFeedbackToastOut {
  from { opacity: 1; transform: translateY(0); }
  to   { opacity: 0; transform: translateY(12px); }
}
@keyframes uiFeedbackPulse {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.12); }
}
@keyframes uiFeedbackToolbarIn {
  from { opacity: 0; transform: translateY(12px) scale(.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* \u2500\u2500 floating action dock \u2500\u2500 */
.ui-feedback-toolbar {
  position: fixed;
  z-index: 2147483000;
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 6px;
  border: 1px solid rgba(255,255,255,.14);
  border-radius: 16px;
  color: var(--_text-toolbar);
  background: rgba(18,18,18,.88);
  box-shadow: 0 18px 46px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.08);
  backdrop-filter: blur(16px) saturate(1.25);
  animation: uiFeedbackToolbarIn .28s cubic-bezier(.4,0,.2,1) both;
  touch-action: none;
  user-select: none;
}
.ui-feedback-toolbar-grip {
  width: 26px;
  height: 38px;
  display: grid;
  place-items: center;
  cursor: grab;
  color: rgba(255,255,255,.52);
  border: 0;
  background: transparent;
  padding: 0;
}
.ui-feedback-toolbar-grip:hover { color: #fff; }
.ui-feedback-toolbar-grip:active { cursor: grabbing; }
.ui-feedback-toolbar-grip svg { width: 15px; height: 15px; stroke: currentColor; fill: currentColor; stroke-width: 0; }
.ui-feedback-tool {
  min-width: 72px;
  height: 38px;
  border: 1px solid transparent;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 0 10px;
  color: var(--_text-toolbar);
  background: transparent;
  transition: color .18s ease, background .18s ease, box-shadow .18s ease, transform .18s ease;
  position: relative;
}
.ui-feedback-tool:hover,
.ui-feedback-tool:focus-visible {
  transform: translateY(-1px);
  color: #fff;
  background: rgba(255,255,255,.10);
  outline: 2px solid color-mix(in srgb, var(--ui-feedback-accent), transparent 60%);
  outline-offset: 2px;
}
.ui-feedback-tool.is-active {
  color: #fff;
  background: rgba(255,255,255,.06);
  box-shadow: inset 0 -2px 0 var(--ui-feedback-accent);
}
.ui-feedback-tool--update {
  min-width: 78px;
  color: var(--ui-feedback-accent);
  border-color: rgba(255,255,255,.22);
  background: rgba(255,255,255,.07);
}
.ui-feedback-tool--update:hover,
.ui-feedback-tool--update:focus-visible {
  color: #111;
  background: var(--ui-feedback-accent);
  outline-color: var(--ui-feedback-accent);
}
.ui-feedback-tool--update.is-busy { pointer-events: none; opacity: .72; }
.ui-feedback-tool--update.is-busy svg { animation: uiFeedbackSpin .8s linear infinite; }
@keyframes uiFeedbackSpin { to { transform: rotate(360deg); } }
.ui-feedback-tool svg {
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
  stroke: currentColor;
  fill: none;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.ui-feedback-tool__label { font-size: 11px; font-weight: 700; white-space: nowrap; }
.ui-feedback-toolbar-bubble {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 2147483000;
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255,255,255,.18);
  border-radius: 50%;
  color: #fff;
  background: rgba(18,18,18,.88);
  box-shadow: 0 14px 36px rgba(0,0,0,.3);
  backdrop-filter: blur(16px);
  animation: uiFeedbackToolbarIn .24s ease both;
}
.ui-feedback-toolbar-bubble:hover,
.ui-feedback-toolbar-bubble:focus-visible { outline: 2px solid var(--ui-feedback-accent); outline-offset: 3px; }
.ui-feedback-toolbar-bubble svg { width: 19px; height: 19px; stroke: currentColor; fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.ui-feedback-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  min-width: 21px;
  height: 21px;
  padding: 0 5px;
  display: grid;
  place-items: center;
  border-radius: 99px;
  color: #fff;
  background: var(--_bg-badge);
  font-size: 11px;
  font-weight: 800;
  border: 2px solid var(--_bg-panel);
}
.ui-feedback-badge.is-pulse { animation: uiFeedbackPulse .4s ease; }
.ui-feedback-badge--undo { background: #0ea5e9; border-color: #151515; }

/* \u2500\u2500 first-use coachmark \u2500\u2500 */
.ui-feedback-coachmark {
  position: fixed;
  right: 22px;
  bottom: 82px;
  z-index: 2147483001;
  width: min(290px, calc(100vw - 32px));
  padding: 14px;
  border: 1px solid var(--_border-panel);
  border-radius: 12px;
  color: var(--_text);
  background: var(--_bg-panel);
  box-shadow: 0 18px 45px var(--_shadow-heavy);
  animation: uiFeedbackFadeIn .25s ease both;
}
.ui-feedback-coachmark strong { display: block; margin-bottom: 5px; font-size: 13px; }
.ui-feedback-coachmark p { margin: 0 0 10px; color: var(--_text-secondary); font-size: 11px; line-height: 1.55; }
.ui-feedback-coachmark__steps { display: grid; gap: 5px; margin: 0 0 11px; padding: 0; color: var(--_text-secondary); font-size: 10px; list-style: none; }
.ui-feedback-coachmark__steps li::before { content: '\u2022'; margin-right: 6px; color: var(--ui-feedback-accent); }
.ui-feedback-coachmark button { width: 100%; border: 1px solid var(--ui-feedback-accent); border-radius: 7px; padding: 7px 9px; color: #141414; background: var(--ui-feedback-accent); font-size: 11px; font-weight: 800; }

/* \u2500\u2500 panel \u2500\u2500 */
.ui-feedback-panel {
  --ui-feedback-panel-x: 0px;
  --ui-feedback-panel-y: 0px;
  position: fixed;
  right: 88px;
  top: 50%;
  transform: translate(var(--ui-feedback-panel-x), calc(-50% + var(--ui-feedback-panel-y)));
  width: min(420px, calc(100vw - 112px));
  max-height: min(680px, calc(100vh - 32px));
  overflow: hidden;
  z-index: 2147482999;
  border: 1px solid var(--_border-panel);
  border-radius: 14px;
  background: var(--_bg-panel);
  box-shadow: 0 22px 60px var(--_shadow-heavy);
  animation: uiFeedbackSlideIn .28s cubic-bezier(.4,0,.2,1) both;
}
.ui-feedback-panel__header {
  padding: 15px 16px 12px;
  color: var(--_text);
  background: var(--_bg-panel);
  border-bottom: 1px solid var(--_border);
  cursor: grab;
  user-select: none;
  touch-action: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.ui-feedback-panel__header strong { display: block; font-size: 15px; letter-spacing: -.01em; }
.ui-feedback-panel__header small { display: block; margin-top: 3px; color: var(--_text-muted); font-size: 10px; font-weight: 600; }
.ui-feedback-panel__header:active, .ui-feedback-panel__header.is-dragging { cursor: grabbing; }
.ui-feedback-panel__header, .ui-feedback-modal__top { -webkit-user-select: none; }
.ui-feedback-panel__header.is-dragging, .ui-feedback-modal__top.is-dragging { user-select: none; }
.ui-feedback-window-heading { min-width: 0; display: flex; align-items: center; gap: 9px; }
.ui-feedback-window-grip { display: grid; place-items: center; width: 28px; height: 28px; flex: 0 0 28px; border: 1px solid var(--_border); border-radius: 8px; color: var(--_text-muted); background: var(--_bg-alt); }
.ui-feedback-window-grip svg { width: 15px; height: 15px; stroke: currentColor; fill: currentColor; stroke-width: 0; }
.ui-feedback-window-heading:hover .ui-feedback-window-grip, .ui-feedback-modal__top:hover .ui-feedback-window-grip { color: var(--_text); border-color: var(--ui-feedback-accent); }
.ui-feedback-drag-hint { margin-left: 6px; color: var(--_text-muted); font-size: 9px; font-weight: 600; opacity: .8; }
.ui-feedback-panel__actions { display: flex; gap: 5px; }
.ui-feedback-panel__tabs { display: flex; gap: 4px; overflow-x: auto; padding: 8px 12px 0; background: var(--_bg-panel); }
.ui-feedback-panel__tab { flex: 0 0 auto; border: 0; border-bottom: 2px solid transparent; padding: 7px 8px 8px; color: var(--_text-muted); background: transparent; font-size: 10px; font-weight: 800; white-space: nowrap; }
.ui-feedback-panel__tab:hover, .ui-feedback-panel__tab.is-active { color: var(--_text); border-bottom-color: color-mix(in srgb, var(--ui-feedback-accent), var(--_text) 28%); }

.ui-feedback-icon-button {
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 7px;
  display: grid;
  place-items: center;
  color: inherit;
  background: transparent;
}
.ui-feedback-icon-button:hover,
.ui-feedback-icon-button:focus-visible {
  background: rgba(0,0,0,.11);
  outline: none;
}
.ui-feedback-icon-button svg {
  width: 17px;
  height: 17px;
  stroke: currentColor;
  fill: none;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* \u2500\u2500 panel search & filter bar \u2500\u2500 */
.ui-feedback-panel__filter {
  display: flex;
  gap: 6px;
  padding: 10px 12px 4px;
  background: var(--_bg-alt);
  border-bottom: 1px solid var(--_border);
}
.ui-feedback-search-input {
  flex: 1;
  border: 1px solid var(--_border);
  border-radius: 7px;
  padding: 6px 10px 6px 30px;
  color: var(--_text);
  background: var(--_bg-panel);
  font-size: 12px;
  outline: none;
  transition: border-color .15s;
}
.ui-feedback-search-input:focus { border-color: var(--ui-feedback-accent); }
.ui-feedback-search-wrap {
  flex: 1;
  position: relative;
}
.ui-feedback-search-wrap svg {
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 14px;
  height: 14px;
  stroke: var(--_text-muted);
  fill: none;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
  pointer-events: none;
}
.ui-feedback-filter-select {
  border: 1px solid var(--_border);
  border-radius: 7px;
  padding: 5px 8px;
  color: var(--_text);
  background: var(--_bg-panel);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  outline: none;
}
.ui-feedback-filter-select:focus { border-color: var(--ui-feedback-accent); }
.ui-feedback-filter-select--category { max-width: 112px; }

.ui-feedback-panel__body {
  max-height: calc(min(680px, 100vh - 32px) - 145px);
  overflow: auto;
  padding: 10px;
  background: var(--_bg-alt);
}
.ui-feedback-empty {
  padding: 35px 18px;
  color: var(--_text-secondary);
  text-align: center;
}

.ui-feedback-group { margin-bottom: 10px; }
.ui-feedback-group__name {
  display: block;
  padding: 7px 9px;
  color: var(--_text-secondary);
  background: var(--_border-group);
  border-radius: 7px 7px 0 0;
  font-size: 12px;
  font-weight: 700;
}
.ui-feedback-category-group + .ui-feedback-category-group { margin-top: 8px; }
.ui-feedback-category-label {
  display: block;
  padding: 5px 9px;
  color: var(--_text-muted);
  background: var(--_bg-alt);
  border-left: 3px solid var(--ui-feedback-accent);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .06em;
  text-transform: uppercase;
}

.ui-feedback-item {
  position: relative;
  padding: 12px;
  border-left: 3px solid transparent;
  background: var(--_bg-item);
  border: 1px solid var(--_border);
  border-top: 0;
  transition: background .15s ease;
}
.ui-feedback-item:hover { background: var(--_bg-hover); }
.ui-feedback-item:last-child { border-radius: 0 0 7px 7px; }
.ui-feedback-item + .ui-feedback-item { border-top: 1px solid var(--_border); }

.ui-feedback-item[data-priority="high"] { border-left-color: #ef4444; }
.ui-feedback-item[data-priority="medium"] { border-left-color: #f59e0b; }
.ui-feedback-item[data-priority="low"] { border-left-color: #22c55e; }
.ui-feedback-item.is-resolved {
  opacity: .55;
}
.ui-feedback-item.is-resolved .ui-feedback-item__comment {
  text-decoration: line-through;
  text-decoration-color: var(--_text-muted);
}

.ui-feedback-item__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 5px;
  color: var(--_text-secondary);
  font-size: 11px;
}
.ui-feedback-item__context {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 6px;
}
.ui-feedback-context-tag {
  background: var(--_bg-alt);
  border: 1px solid var(--_border);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  color: var(--_text-secondary);
}
.ui-feedback-item__selector {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ui-feedback-item__time {
  color: var(--_text-muted);
  font-size: 10px;
  margin-bottom: 5px;
}
.ui-feedback-priority {
  padding: 2px 6px;
  border-radius: 99px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  flex-shrink: 0;
}
.ui-feedback-priority--high   { color: #991b1b; background: #fee2e2; }
.ui-feedback-priority--medium { color: #92400e; background: #fef3c7; }
.ui-feedback-priority--low    { color: #166534; background: #dcfce7; }

.ui-feedback-resolve-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 7px;
  border-radius: 99px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  flex-shrink: 0;
}
.ui-feedback-resolve-badge.is-resolved { color: #166534; background: #dcfce7; }
.ui-feedback-resolve-badge.is-open     { color: #92400e; background: #fef3c7; }
.ui-feedback-resolve-badge svg { width: 10px; height: 10px; stroke: currentColor; fill: none; stroke-width: 2; }

.ui-feedback-item__comment {
  margin: 0;
  white-space: pre-wrap;
  color: var(--_text);
  font-size: 13px;
}
.ui-feedback-item__target {
  margin: 8px 0 0;
  color: var(--_text-muted);
  font-size: 11px;
}
.ui-feedback-item__code {
  overflow: hidden;
  margin-top: 7px;
  border: 1px solid var(--_border);
  border-radius: 5px;
  padding: 6px 8px;
  color: var(--_text-secondary);
  background: var(--_bg-alt);
  font-size: 10px;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ui-feedback-item__code code { color: var(--_text); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.ui-feedback-copy-selector { border: 0; padding: 0 4px; color: var(--_text-muted); background: transparent; font-size: 10px; cursor: copy; }
.ui-feedback-copy-selector:hover { color: var(--ui-feedback-accent); }
.ui-feedback-category-chip {
  flex-shrink: 0;
  border-radius: 99px;
  padding: 2px 6px;
  color: var(--_text-secondary);
  background: var(--_bg-alt);
  font-size: 9px;
  font-weight: 700;
}
.ui-feedback-item__actions {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 7px;
}
.ui-feedback-mini {
  border: 0;
  padding: 4px 8px;
  border-radius: 5px;
  color: var(--_text-secondary);
  background: var(--_bg-alt);
  font-size: 11px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  transition: color .12s, background .12s;
}
.ui-feedback-mini:hover { color: var(--_text); background: var(--_border); }
.ui-feedback-mini svg { width: 12px; height: 12px; }
.ui-feedback-mini--resolve { color: #166534; }
.ui-feedback-mini--resolve:hover { background: #dcfce7; }

/* \u2500\u2500 modal \u2500\u2500 */
.ui-feedback-scrim {
  position: fixed;
  inset: 0;
  z-index: 2147482990;
  background: var(--_scrim);
  backdrop-filter: blur(2px);
  animation: uiFeedbackScrimIn .2s ease both;
}
@keyframes uiFeedbackScrimIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.ui-feedback-modal {
  --ui-feedback-modal-x: 0px;
  --ui-feedback-modal-y: 0px;
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(calc(-50% + var(--ui-feedback-modal-x)), calc(-50% + var(--ui-feedback-modal-y)));
  width: min(430px, calc(100vw - 32px));
  z-index: 2147483010;
  border: 1px solid var(--_border-modal);
  border-radius: 14px;
  background: var(--_bg-panel);
  box-shadow: 0 30px 80px var(--_shadow-heavy);
  overflow: hidden;
  animation: uiFeedbackFadeIn .24s cubic-bezier(.4,0,.2,1) both;
}
.ui-feedback-modal__top {
  padding: 18px 20px 12px;
  border-bottom: 1px solid var(--_border);
  cursor: grab;
  user-select: none;
  touch-action: none;
}
.ui-feedback-modal__top:active, .ui-feedback-modal__top.is-dragging { cursor: grabbing; }
.ui-feedback-modal__top h2 { margin: 8px 0 7px; font-size: 16px; color: var(--_text); }
.ui-feedback-modal__top .ui-feedback-drag-hint { display: inline-flex; margin: 0; }
.ui-feedback-modal__top p { overflow: hidden; margin: 0; color: var(--_text-secondary); font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.ui-feedback-modal__content { padding: 17px 20px; }
.ui-feedback-modal.is-inspector { left: auto; right: 22px; top: 22px; transform: translate(var(--ui-feedback-modal-x), var(--ui-feedback-modal-y)); width: min(520px, calc(100vw - 32px)); height: calc(100vh - 44px); display: flex; flex-direction: column; animation: uiFeedbackSlideIn .25s cubic-bezier(.4,0,.2,1) both; }
.ui-feedback-modal.is-inspector .ui-feedback-modal__content { flex: 1; overflow: auto; }
.ui-feedback-modal.is-mini { width: min(380px, calc(100vw - 32px)); }
.ui-feedback-label { display: block; margin: 0 0 7px; color: var(--_text-secondary); font-size: 12px; font-weight: 700; }
.ui-feedback-field,
.ui-feedback-textarea,
.ui-feedback-select {
  width: 100%;
  border: 0;
  border-bottom: 2px solid var(--ui-feedback-accent);
  border-radius: 0;
  padding: 8px 0;
  color: var(--_text);
  background: var(--_bg-input);
  outline: none;
}
.ui-feedback-textarea { min-height: 94px; resize: vertical; }
.ui-feedback-field:focus,
.ui-feedback-textarea:focus,
.ui-feedback-select:focus {
  box-shadow: 0 2px 0 var(--_focus-ring);
}
.ui-feedback-form-row { display: grid; grid-template-columns: 1fr 120px; gap: 18px; margin-top: 17px; }
.ui-feedback-modal__footer { display: flex; justify-content: flex-end; align-items: center; flex-wrap: wrap; gap: 8px; padding: 0 18px 16px; }
.ui-feedback-button { min-width: 76px; border: 1px solid var(--_border); padding: 9px 16px; border-radius: 8px; color: var(--_text); background: var(--_bg-panel); transition: background .12s; }
.ui-feedback-button:hover { background: var(--_bg-hover); }
.ui-feedback-button--primary { border-color: var(--ui-feedback-accent); background: var(--ui-feedback-accent); color: var(--_accent-ink); font-weight: 800; }
.ui-feedback-button--primary:hover { filter: brightness(.95); }

/* \u2500\u2500 toast \u2500\u2500 */
.ui-feedback-toast {
  position: fixed;
  right: 22px;
  bottom: 20px;
  z-index: 2147483020;
  padding: 11px 15px;
  border-radius: 10px;
  color: #fff;
  background: #151515;
  box-shadow: 0 10px 25px rgba(0,0,0,.2);
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  animation: uiFeedbackToastIn .22s cubic-bezier(.4,0,.2,1) both;
}
.ui-feedback-toast.is-leaving {
  animation: uiFeedbackToastOut .22s ease forwards;
}
.ui-feedback-toast__undo {
  border: 0;
  padding: 4px 10px;
  border-radius: 5px;
  color: var(--ui-feedback-accent);
  background: rgba(255,255,255,.12);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: background .12s;
}
.ui-feedback-toast__undo:hover { background: rgba(255,255,255,.22); }

/* \u2500\u2500 comment markers \u2500\u2500 */
.ui-feedback-marker {
  position: absolute;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--ui-feedback-accent);
  color: #141414;
  font-size: 10px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,.25);
  z-index: 2147482980;
  pointer-events: auto;
  cursor: pointer;
  animation: uiFeedbackMarkerIn .25s cubic-bezier(.4,0,.2,1) both;
  border: 2px solid #fff;
}
@keyframes uiFeedbackMarkerIn {
  from { opacity: 0; transform: scale(0); }
  to   { opacity: 1; transform: scale(1); }
}
.ui-feedback-marker.is-resolved {
  background: #86efac;
  border-color: #166534;
}
.ui-feedback-marker.is-edit {
  background: #86efac;
  border-color: #166534;
  color: #14532d;
  font-size: 12px;
  line-height: 1;
}
.ui-feedback-marker.is-css {
  background: #c4b5fd;
  border-color: #5b21b6;
  color: #2e1065;
  font-size: 12px;
  line-height: 1;
}
.ui-feedback-root.is-dark .ui-feedback-marker.is-edit {
  background: #166534;
  border-color: #86efac;
  color: #dcfce7;
}
.ui-feedback-root.is-dark .ui-feedback-marker.is-css {
  background: #5b21b6;
  border-color: #c4b5fd;
  color: #ede9fe;
}

/* \u2500\u2500 advanced CSS editor \u2500\u2500 */
.ui-feedback-css-tabs {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 4px;
  padding: 4px;
  margin: -4px -4px 14px;
  border-radius: 8px;
  background: var(--_bg-alt);
}
.ui-feedback-css-tab {
  min-width: 0;
  border: 0;
  border-radius: 6px;
  padding: 8px 4px;
  color: var(--_text-secondary);
  background: transparent;
  font-size: 11px;
  font-weight: 700;
}
.ui-feedback-css-tab.is-active {
  color: var(--_text);
  background: var(--_bg-panel);
  box-shadow: 0 1px 4px var(--_shadow);
}
.ui-feedback-css-section { margin-top: 15px; }
.ui-feedback-css-section:first-child { margin-top: 0; }
.ui-feedback-css-section__title {
  margin-bottom: 7px;
  color: var(--_text-secondary);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .08em;
  text-transform: uppercase;
}
.ui-feedback-theme-card {
  display: flex;
  align-items: center;
  gap: 9px;
  min-height: 47px;
  margin-bottom: 6px;
  padding: 8px 9px;
  border: 1px solid var(--_border);
  border-radius: 8px;
  background: var(--_bg-item);
}
.ui-feedback-theme-card__swatch {
  width: 26px;
  height: 26px;
  flex: 0 0 26px;
  border: 1px solid var(--_border);
  border-radius: 5px;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,.06);
}
.ui-feedback-theme-card__copy { min-width: 0; flex: 1; }
.ui-feedback-theme-card__label { display: block; color: var(--_text); font-size: 11px; font-weight: 700; }
.ui-feedback-theme-card__hint { display: block; margin-top: 2px; color: var(--_text-muted); font-size: 10px; }
.ui-feedback-theme-card input[type=color] {
  width: 31px;
  height: 29px;
  padding: 1px;
  border: 1px solid var(--_border);
  border-radius: 5px;
  background: transparent;
  cursor: pointer;
}
.ui-feedback-theme-card input[type=text] {
  width: 71px;
  border: 0;
  border-bottom: 1px solid var(--_border);
  padding: 4px 2px;
  color: var(--_text-secondary);
  background: transparent;
  font: 10px ui-monospace, SFMono-Regular, Menlo, monospace;
  outline: none;
}
.ui-feedback-theme-card input[type=text]:focus { border-bottom-color: var(--ui-feedback-accent); color: var(--_text); }
.ui-feedback-more-colors { margin-top: 6px; }
.ui-feedback-more-colors > summary {
  padding: 8px;
  border: 1px solid var(--_border);
  border-radius: 7px;
  color: var(--_text-secondary);
  font-size: 11px;
  text-align: center;
  cursor: pointer;
  list-style: none;
}
.ui-feedback-more-colors > summary::-webkit-details-marker { display: none; }
.ui-feedback-font-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 45px;
  padding: 7px 9px;
  border: 1px solid var(--_border);
  border-radius: 8px;
  background: var(--_bg-item);
}
.ui-feedback-font-row + .ui-feedback-font-row { margin-top: 6px; }
.ui-feedback-font-row__copy { flex: 1; min-width: 0; }
.ui-feedback-font-row__label { display: block; color: var(--_text-muted); font-size: 9px; font-weight: 800; letter-spacing: .08em; }
.ui-feedback-font-row__value { display: block; overflow: hidden; margin-top: 2px; color: var(--_text); font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
.ui-feedback-font-row select {
  max-width: 124px;
  border: 1px solid var(--_border);
  border-radius: 5px;
  padding: 5px 4px;
  color: var(--_text);
  background: var(--_bg-panel);
  font-size: 10px;
}
.ui-feedback-range-row { padding: 10px 9px 5px; border: 1px solid var(--_border); border-radius: 8px; background: var(--_bg-item); }
.ui-feedback-range-row__head { display: flex; justify-content: space-between; margin-bottom: 5px; color: var(--_text-secondary); font-size: 10px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; }
.ui-feedback-range-row input[type=range] { width: 100%; accent-color: var(--ui-feedback-accent); }
.ui-feedback-css-help { margin: -2px 0 10px; color: var(--_text-muted); font-size: 10px; line-height: 1.45; }
.ui-feedback-css-subsection { margin-top: 12px; }
.ui-feedback-css-subtitle { margin-bottom: 6px; color: var(--_text-secondary); font-size: 10px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; }
.ui-feedback-css-select-row,
.ui-feedback-css-text-row { display: flex; align-items: center; justify-content: space-between; gap: 9px; min-height: 40px; margin-top: 6px; padding: 7px 9px; border: 1px solid var(--_border); border-radius: 8px; color: var(--_text-secondary); background: var(--_bg-item); font-size: 10px; font-weight: 700; }
.ui-feedback-css-select-row select,
.ui-feedback-css-text-row input { min-width: 0; max-width: 190px; border: 1px solid var(--_border); border-radius: 6px; padding: 6px 7px; color: var(--_text); background: var(--_bg-panel); font: inherit; font-weight: 500; outline: none; }
.ui-feedback-css-text-row input { flex: 1; text-align: right; }
.ui-feedback-css-select-row select:focus,
.ui-feedback-css-text-row input:focus { border-color: var(--ui-feedback-accent); outline: 2px solid color-mix(in srgb, var(--ui-feedback-accent), transparent 78%); }
.ui-feedback-spacing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.ui-feedback-spacing-grid label { display: grid; grid-template-columns: 38px 1fr auto; align-items: center; gap: 5px; min-width: 0; padding: 7px 8px; border: 1px solid var(--_border); border-radius: 7px; color: var(--_text-muted); background: var(--_bg-item); font-size: 10px; }
.ui-feedback-spacing-grid input { min-width: 0; width: 100%; box-sizing: border-box; border: 1px solid var(--_border); border-radius: 5px; padding: 5px; color: var(--_text); background: var(--_bg-input); font: inherit; }
.ui-feedback-spacing-grid input:focus { border-color: var(--ui-feedback-accent); outline: 2px solid color-mix(in srgb, var(--ui-feedback-accent), transparent 78%); }
.ui-feedback-spacing-grid output { color: var(--_text-muted); font-size: 9px; font-variant-numeric: tabular-nums; }
.ui-feedback-align-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px; }
.ui-feedback-align-button { display: grid; gap: 2px; justify-items: center; border: 1px solid var(--_border); border-radius: 7px; padding: 7px 3px; color: var(--_text-secondary); background: var(--_bg-item); }
.ui-feedback-align-button span { font-size: 16px; line-height: 1; }
.ui-feedback-align-button small { font-size: 9px; }
.ui-feedback-align-button:hover,
.ui-feedback-align-button.is-active { border-color: var(--ui-feedback-accent); color: var(--_accent-ink); background: var(--ui-feedback-accent); }
.ui-feedback-css-presets { display: grid; gap: 7px; }
.ui-feedback-css-preset {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  border: 1px solid var(--_border);
  border-radius: 8px;
  padding: 11px;
  color: var(--_text);
  background: var(--_bg-item);
  text-align: left;
}
.ui-feedback-css-preset:hover { border-color: var(--ui-feedback-accent); background: var(--_bg-hover); }
.ui-feedback-css-reset { width: 100%; margin-top: 14px; }
.ui-feedback-position-pad { position: relative; height: 132px; margin: 7px 0; border: 1px solid var(--_border); border-radius: 9px; background: linear-gradient(90deg, transparent 49.5%, var(--_border) 49.5%, var(--_border) 50.5%, transparent 50.5%), linear-gradient(0deg, transparent 49.5%, var(--_border) 49.5%, var(--_border) 50.5%, transparent 50.5%), var(--_bg-alt); cursor: crosshair; touch-action: none; }
.ui-feedback-position-pad::after { content: ""; position: absolute; left: calc(50% + var(--pad-x, 0px)); top: calc(50% + var(--pad-y, 0px)); width: 12px; height: 12px; border: 2px solid var(--ui-feedback-accent); border-radius: 50%; background: var(--_bg-panel); transform: translate(-50%, -50%); box-shadow: 0 1px 4px var(--_shadow); }
.ui-feedback-position-sliders { display: grid; gap: 7px; }
.ui-feedback-position-inputs { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px; }
.ui-feedback-position-inputs label { display: grid; gap: 5px; color: var(--_text-secondary); font-size: 10px; font-weight: 700; }
.ui-feedback-position-inputs input { width: 100%; box-sizing: border-box; border: 1px solid var(--_border); border-radius: 7px; padding: 7px 8px; color: var(--_text); background: var(--_bg-input); font: inherit; }
.ui-feedback-position-inputs input:focus { border-color: var(--ui-feedback-accent); outline: 2px solid color-mix(in srgb, var(--ui-feedback-accent), transparent 75%); }
.ui-feedback-position-sliders label { display: grid; grid-template-columns: 24px 1fr 40px; align-items: center; gap: 7px; color: var(--_text-secondary); font-size: 10px; }
.ui-feedback-position-sliders input { width: 100%; accent-color: var(--ui-feedback-accent); }
.ui-feedback-position-sliders output { text-align: right; font-variant-numeric: tabular-nums; }
.ui-feedback-image-block { display: grid; gap: 10px; }
.ui-feedback-image-heading { display: flex; justify-content: space-between; gap: 8px; align-items: start; }
.ui-feedback-image-heading strong { color: var(--_text); font-size: 12px; }
.ui-feedback-image-heading small { display: block; margin-top: 3px; color: var(--_text-muted); font-size: 10px; }
.ui-feedback-image-state { flex-shrink: 0; border-radius: 99px; padding: 3px 7px; color: #166534; background: #dcfce7; font-size: 9px; font-weight: 800; }
.ui-feedback-image-preview { position: relative; display: flex; align-items: center; justify-content: center; min-height: 180px; overflow: hidden; border: 1px dashed var(--_border); border-radius: 8px; background: repeating-conic-gradient(var(--_bg-alt) 0 25%, var(--_bg-hover) 0 50%) 50% / 16px 16px; cursor: grab; touch-action: none; }
.ui-feedback-image-preview:active { cursor: grabbing; }
.ui-feedback-image-preview img { display: block; width: 100%; height: 180px; object-fit: cover; user-select: none; pointer-events: none; transform-origin: 50% 50%; transition: transform .12s ease; }
.ui-feedback-image-preview span { padding: 20px; color: var(--_text-muted); font-size: 11px; text-align: center; }
.ui-feedback-image-canvas-hint { position: absolute; right: 8px; bottom: 8px; border-radius: 99px; padding: 4px 7px; color: #fff; background: rgba(0,0,0,.58); font-size: 9px; pointer-events: none; }
.ui-feedback-image-zoom { display: grid; grid-template-columns: 28px 1fr 28px auto; align-items: center; gap: 6px; }
.ui-feedback-image-zoom button { width: 28px; height: 28px; border: 1px solid var(--_border); border-radius: 6px; color: var(--_text); background: var(--_bg-panel); }
.ui-feedback-image-zoom input { width: 100%; accent-color: var(--ui-feedback-accent); }
.ui-feedback-image-zoom output { min-width: 42px; color: var(--_text-secondary); font-size: 10px; text-align: right; }
.ui-feedback-image-position { display: flex; justify-content: space-between; color: var(--_text-muted); font-size: 10px; }
.ui-feedback-image-url { width: 100%; border: 1px solid var(--_border); border-radius: 6px; padding: 9px 10px; color: var(--_text); background: var(--_bg-input); outline: none; font-size: 11px; }
.ui-feedback-image-url:focus { border-color: var(--ui-feedback-accent); }
.ui-feedback-image-paste { width: 100%; border: 1px solid var(--_border); border-radius: 6px; padding: 8px; color: var(--_text-secondary); background: var(--_bg-panel); font-size: 11px; }
.ui-feedback-image-paste:hover { border-color: var(--ui-feedback-accent); color: var(--_text); }
.ui-feedback-image-upload { width: 100%; border: 1px dashed var(--_border); border-radius: 6px; padding: 8px; color: var(--_text-secondary); background: var(--_bg-alt); font-size: 11px; }
.ui-feedback-image-original { display: block; overflow: hidden; color: var(--_text-muted); font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
.ui-feedback-marker.is-image { background: #fcd34d; border-color: #b45309; color: #78350f; font-size: 11px; line-height: 1; }
.ui-feedback-root.is-dark .ui-feedback-marker.is-image { background: #92400e; border-color: #fcd34d; color: #fef3c7; }

/* \u2500\u2500 picker \u2500\u2500 */
.ui-feedback-picking,
.ui-feedback-picking * { cursor: crosshair !important; }
.ui-feedback-picker-layer {
  position: fixed;
  inset: 0;
  z-index: 2147482990;
  background: transparent;
  cursor: crosshair;
}
.ui-feedback-measurement-layer {
  position: fixed;
  inset: 0;
  z-index: 2147483015;
  pointer-events: none;
  overflow: visible;
}
.ui-feedback-measurement-box,
.ui-feedback-measurement-margin {
  position: fixed;
  pointer-events: none;
}
.ui-feedback-measurement-box {
  border: 1px solid #fff;
  background: rgba(255,255,255,.035);
  box-shadow: 0 0 0 1px rgba(0,0,0,.55), inset 0 0 0 1px rgba(255,255,255,.12);
}
.ui-feedback-measurement-margin {
  border: 1px dashed rgba(255,255,255,.42);
  background: rgba(255,255,255,.025);
}
.ui-feedback-measurement-edge { position: absolute; display: block; pointer-events: none; border: 1px dashed rgba(255,255,255,.28); }
.ui-feedback-measurement-edge--padding { border-color: rgba(255,255,255,.52); }
.ui-feedback-measurement-edge--border { border-color: rgba(255,255,255,.82); }
.ui-feedback-measurement-label {
  position: absolute;
  top: -25px;
  left: 0;
  padding: 4px 7px;
  border: 1px solid rgba(255,255,255,.2);
  border-radius: 6px;
  color: #111;
  background: #fff;
  font: 700 10px/1 ui-monospace, SFMono-Regular, Menlo, monospace;
  white-space: nowrap;
}
.ui-feedback-measurement-guide { position: fixed; border-top: 1px solid #fff; border-left: 1px solid transparent; }
.ui-feedback-measurement-guide--y { border-top: 0; border-left: 1px solid #fff; }
.ui-feedback-measurement-guide::before,
.ui-feedback-measurement-guide::after { content: ''; position: absolute; width: 7px; height: 7px; border: 1px solid #fff; border-radius: 50%; background: #181818; }
.ui-feedback-measurement-guide::before { left: -4px; top: -4px; }
.ui-feedback-measurement-guide::after { right: -4px; top: -4px; }
.ui-feedback-measurement-guide--y::before { left: -4px; top: -4px; }
.ui-feedback-measurement-guide--y::after { right: auto; left: -4px; bottom: -4px; top: auto; }
.ui-feedback-measurement-guide span { position: absolute; top: -20px; left: 50%; transform: translateX(-50%); padding: 3px 6px; border-radius: 5px; color: #111; background: #fff; font: 700 10px/1 ui-monospace, SFMono-Regular, Menlo, monospace; white-space: nowrap; }
.ui-feedback-measurement-guide--y span { top: 50%; left: 8px; transform: translateY(-50%); }
.ui-feedback-inspector {
  position: fixed;
  z-index: 2147483020;
  width: 340px;
  max-height: min(620px, calc(100vh - 24px));
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.14);
  border-radius: 16px;
  color: #f1f1f1;
  background: #181818;
  box-shadow: 0 26px 80px rgba(0,0,0,.52), 0 0 0 1px rgba(255,255,255,.03);
  pointer-events: auto;
  animation: uiFeedbackFadeIn .16s ease both;
}
.ui-feedback-inspector__header { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 13px 14px 11px; border-bottom: 1px solid rgba(255,255,255,.1); background: linear-gradient(180deg, #202020, #181818); }
.ui-feedback-inspector__header .ui-feedback-window-heading { min-width: 0; }
.ui-feedback-inspector__header strong { display: block; color: #fff; font-size: 14px; letter-spacing: -.01em; }
.ui-feedback-inspector__header small { display: block; margin-top: 2px; color: #888; font-size: 10px; }
.ui-feedback-inspector__header .ui-feedback-window-grip { width: 25px; height: 30px; font-size: 12px; }
.ui-feedback-inspector__actions { display: flex; gap: 4px; }
.ui-feedback-inspector__actions .ui-feedback-icon-button { width: 30px; height: 30px; color: #aaa; }
.ui-feedback-inspector__body { display: grid; gap: 12px; max-height: min(560px, calc(100vh - 88px)); overflow: auto; padding: 13px; }
.ui-feedback-inspector__crumbs { display: flex; align-items: center; gap: 4px; min-width: 0; overflow: visible; color: #999; font-size: 10px; }
.ui-feedback-inspector__crumb { min-width: 0; max-width: 100px; overflow: hidden; border: 0; border-radius: 5px; padding: 4px 5px; color: #aaa; background: transparent; text-overflow: ellipsis; white-space: nowrap; }
.ui-feedback-inspector__crumb:hover, .ui-feedback-inspector__crumb:focus-visible { color: #111; background: #fff; outline: none; }
.ui-feedback-inspector__crumb-separator { color: #555; }
.ui-feedback-inspector__overflow { position: relative; flex: 0 0 auto; }
.ui-feedback-inspector__overflow summary { list-style: none; cursor: pointer; padding: 3px 5px; border-radius: 5px; color: #aaa; background: #252525; }
.ui-feedback-inspector__overflow summary::-webkit-details-marker { display: none; }
.ui-feedback-inspector__overflow-menu { position: absolute; top: 25px; left: 0; z-index: 2; display: grid; gap: 2px; min-width: 180px; padding: 5px; border: 1px solid rgba(255,255,255,.14); border-radius: 8px; background: #222; box-shadow: 0 12px 30px rgba(0,0,0,.4); }
.ui-feedback-inspector__overflow-menu .ui-feedback-inspector__crumb { max-width: none; text-align: left; }
.ui-feedback-inspector__target { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; padding: 10px; border: 1px solid rgba(255,255,255,.1); border-radius: 10px; background: #202020; }
.ui-feedback-inspector__target strong { display: block; overflow: hidden; color: #f1f1f1; font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.ui-feedback-inspector__target small { display: block; max-width: 245px; margin-top: 4px; overflow: hidden; color: #777; font: 10px/1.35 ui-monospace, SFMono-Regular, Menlo, monospace; text-overflow: ellipsis; white-space: nowrap; }
.ui-feedback-inspector__copy { flex: 0 0 auto; border: 1px solid rgba(255,255,255,.14); border-radius: 6px; padding: 5px 7px; color: #aaa; background: #292929; font-size: 10px; }
.ui-feedback-inspector__copy:hover { color: #111; background: #fff; }
.ui-feedback-inspector__actions-grid, .ui-feedback-inspector__measure-actions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
.ui-feedback-inspector__actions-grid button, .ui-feedback-inspector__measure-actions button { min-height: 36px; border: 1px solid rgba(255,255,255,.12); border-radius: 9px; color: #ddd; background: #222; font-size: 11px; }
.ui-feedback-inspector__actions-grid button:hover, .ui-feedback-inspector__measure-actions button:hover, .ui-feedback-inspector__measure-actions button.is-active { border-color: #fff; color: #111; background: #fff; }
.ui-feedback-inspector__measurement { display: grid; gap: 8px; padding: 10px; border: 1px solid rgba(255,255,255,.11); border-radius: 10px; background: #202020; }
.ui-feedback-inspector__section-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.ui-feedback-inspector__section-head strong { color: #eee; font-size: 11px; }
.ui-feedback-inspector__section-head button { border: 0; color: #aaa; background: transparent; font-size: 10px; }
.ui-feedback-inspector__metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 5px; }
.ui-feedback-inspector__metrics span { display: grid; gap: 2px; color: #ddd; font: 10px/1.2 ui-monospace, SFMono-Regular, Menlo, monospace; }
.ui-feedback-inspector__metrics b { color: #777; font: 700 9px/1 sans-serif; }
.ui-feedback-inspector__hint { margin: 0; color: #888; font-size: 10px; line-height: 1.45; }
.ui-feedback-inspector__hint b { color: #fff; }
.ui-feedback-inspector__shortcut { margin: 0; color: #666; font-size: 9px; }
.ui-feedback-inspector__shortcut kbd { padding: 2px 4px; border: 1px solid rgba(255,255,255,.12); border-radius: 4px; color: #aaa; background: #222; font: 9px ui-monospace, monospace; }
.ui-feedback-inspector button:focus-visible, .ui-feedback-inspector [tabindex]:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
.ui-feedback-picking [data-picker-inspector], .ui-feedback-picking [data-picker-inspector] * { cursor: default !important; }
.ui-feedback-picking [data-picker-inspector] button, .ui-feedback-picking [data-picker-inspector] summary { cursor: pointer !important; }
.ui-feedback-inspector.is-locked { border-color: rgba(255,255,255,.3); }

/* \u2500\u2500 responsive \u2500\u2500 */
@media (max-width: 640px) {
  .ui-feedback-css-tabs { grid-template-columns: repeat(5, minmax(72px, 1fr)); overflow-x: auto; scrollbar-width: thin; }
  .ui-feedback-css-select-row select { max-width: 145px; }
  .ui-feedback-spacing-grid { grid-template-columns: 1fr; }
  .ui-feedback-toolbar { right: 10px !important; left: 10px; bottom: 10px; justify-content: space-between; }
  .ui-feedback-toolbar-grip { display: none; }
  .ui-feedback-tool { min-width: 38px; width: 38px; padding: 0; }
  .ui-feedback-tool__label { display: none; }
  .ui-feedback-panel { right: 10px; left: 10px; width: auto; width: min(340px, calc(100vw - 84px)); }
  .ui-feedback-form-row { grid-template-columns: 1fr; gap: 12px; }
  .ui-feedback-modal.is-inspector { right: 10px; top: 10px; width: calc(100vw - 20px); height: calc(100vh - 20px); }
  .ui-feedback-inspector { left: 12px !important; right: 12px !important; bottom: 12px !important; top: auto !important; width: auto !important; max-height: min(78vh, 620px); border-radius: 18px 18px 12px 12px; }
  .ui-feedback-inspector__body { max-height: calc(78vh - 62px); padding-bottom: max(13px, env(safe-area-inset-bottom)); }
  .ui-feedback-coachmark { right: 16px; bottom: 68px; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; scroll-behavior: auto !important; }
}
  /* \u2500\u2500 v0.7 visual refresh: white accent + modern dark surfaces \u2500\u2500 */
  .ui-feedback-root { --ui-feedback-accent: #fff !important; }
  .ui-feedback-root.is-dark { --ui-feedback-accent: #fff !important; }
  .ui-feedback-panel,
  .ui-feedback-modal {
    border-color: rgba(255,255,255,.14);
    border-radius: 18px;
    background: #181818;
    box-shadow: 0 26px 80px rgba(0,0,0,.48), 0 0 0 1px rgba(255,255,255,.03);
  }
  .ui-feedback-panel__header,
  .ui-feedback-modal__top {
    padding: 18px 18px 15px;
    background: linear-gradient(180deg, #1d1d1d 0%, #181818 100%);
    border-bottom-color: rgba(255,255,255,.10);
  }
  .ui-feedback-panel__header strong,
  .ui-feedback-modal__top h2 { color: #fff; font-size: 16px; letter-spacing: -.02em; }
  .ui-feedback-panel__header small,
  .ui-feedback-modal__top p { color: #8f8f8f; }
  .ui-feedback-window-grip {
    border-color: rgba(255,255,255,.13);
    border-radius: 9px;
    color: #8f8f8f;
    background: #222;
  }
  .ui-feedback-window-heading:hover .ui-feedback-window-grip,
  .ui-feedback-modal__top:hover .ui-feedback-window-grip { color: #fff; border-color: rgba(255,255,255,.46); background: #2a2a2a; }
  .ui-feedback-panel__tabs { gap: 2px; padding: 9px 14px 0; background: #181818; }
  .ui-feedback-panel__tab { padding: 8px 9px 10px; color: #858585; }
  .ui-feedback-panel__tab:hover,
  .ui-feedback-panel__tab.is-active { color: #fff; border-bottom-color: #fff; }
  .ui-feedback-panel__filter { gap: 8px; padding: 11px 14px 9px; background: #181818; border-bottom-color: rgba(255,255,255,.08); }
  .ui-feedback-search-input,
  .ui-feedback-filter-select {
    min-height: 36px;
    border: 1px solid rgba(255,255,255,.12);
    border-radius: 10px;
    color: #f4f4f4;
    background: #202020;
  }
  .ui-feedback-search-input:focus,
  .ui-feedback-filter-select:focus { border-color: #fff; box-shadow: 0 0 0 3px rgba(255,255,255,.12); }
  .ui-feedback-panel__body { padding: 10px 14px 14px; background: #121212; }
  .ui-feedback-group__name { color: #b7b7b7; background: #2a2a2a; border-radius: 9px 9px 0 0; }
  .ui-feedback-category-label { color: #d2d2d2; border-left-color: #fff; background: #181818; }
  .ui-feedback-item { border-color: rgba(255,255,255,.10); background: #1b1b1b; }
  .ui-feedback-item:hover { background: #242424; }
  .ui-feedback-context-tag,
  .ui-feedback-item__code,
  .ui-feedback-category-chip { border-color: rgba(255,255,255,.10); background: #222; }
  .ui-feedback-modal__content { padding: 20px; background: #181818; }
  .ui-feedback-label { color: #bcbcbc; font-size: 11px; letter-spacing: .01em; }
  .ui-feedback-field,
  .ui-feedback-textarea,
  .ui-feedback-select {
    min-height: 40px;
    border: 1px solid rgba(255,255,255,.12);
    border-radius: 10px;
    padding: 10px 12px;
    color: #f4f4f4;
    background: #222;
  }
  .ui-feedback-textarea { min-height: 104px; }
  .ui-feedback-field:focus,
  .ui-feedback-textarea:focus,
  .ui-feedback-select:focus { border-color: #fff; box-shadow: 0 0 0 3px rgba(255,255,255,.12); }
  .ui-feedback-modal__footer { padding: 0 20px 20px; background: #181818; }
  .ui-feedback-button { min-height: 40px; border-color: rgba(255,255,255,.14); border-radius: 10px; color: #f4f4f4; background: #202020; }
  .ui-feedback-button:hover { border-color: rgba(255,255,255,.34); background: #2a2a2a; }
  .ui-feedback-button--primary { border-color: #fff; color: #111; background: #fff; }
  .ui-feedback-button--primary:hover { background: #e7e7e7; }
  .ui-feedback-css-tabs { background: #111; }
  .ui-feedback-css-tab.is-active { color: #fff; background: #292929; box-shadow: none; }
  .ui-feedback-theme-card,
  .ui-feedback-font-row,
  .ui-feedback-range-row,
  .ui-feedback-css-preset { border-color: rgba(255,255,255,.11); border-radius: 11px; background: #202020; }
  .ui-feedback-css-preset:hover { border-color: #fff; background: #292929; }
  .ui-feedback-icon-button:hover,
  .ui-feedback-icon-button:focus-visible { color: #fff; background: rgba(255,255,255,.10); }
  @media (max-width: 560px) {
    .ui-feedback-panel { right: 12px; width: min(420px, calc(100vw - 24px)); }
    .ui-feedback-modal.is-inspector { right: 12px; width: calc(100vw - 24px); height: calc(100vh - 24px); }
  }

  /* \u2500\u2500 v0.9 visual refresh: modern minimalism \u2500\u2500 */
  .ui-feedback-panel {
    width: min(432px, calc(100vw - 112px));
    border-radius: 16px;
    background: #151515;
    box-shadow: 0 24px 72px rgba(0,0,0,.42), 0 0 0 1px rgba(255,255,255,.025);
  }
  .ui-feedback-panel__header { padding: 15px 16px 13px; }
  .ui-feedback-panel__header strong { font-size: 15px; }
  .ui-feedback-panel__header small { white-space: nowrap; }
  .ui-feedback-drag-hint { margin-left: 4px; padding: 2px 5px; border: 1px solid rgba(255,255,255,.12); border-radius: 5px; color: #aaa; font-size: 9px; opacity: 1; }
  .ui-feedback-panel__tabs { padding: 7px 14px 0; }
  .ui-feedback-panel__tab { padding: 7px 8px 9px; font-size: 10px; }
  .ui-feedback-panel__filter { display: grid; grid-template-columns: minmax(0, 1fr) auto auto; align-items: center; gap: 7px; padding: 10px 14px 9px; }
  .ui-feedback-panel__body { padding: 10px 14px 16px; background: #111; }
  .ui-feedback-group { margin-bottom: 12px; }
  .ui-feedback-group__name { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 8px 10px; color: #bcbcbc; background: #242424; border-radius: 9px 9px 5px 5px; font-size: 11px; font-weight: 700; }
  .ui-feedback-group__name span:first-child { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ui-feedback-group__name span:last-child { flex: 0 0 auto; min-width: 20px; padding: 2px 6px; border-radius: 99px; color: #cfcfcf; background: #333; text-align: center; font-size: 10px; }
  .ui-feedback-category-group + .ui-feedback-category-group { margin-top: 8px; }
  .ui-feedback-category-label { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin: 0 4px; padding: 7px 5px 6px; border-left: 0; color: #8f8f8f; background: transparent; font-size: 9px; letter-spacing: .08em; }
  .ui-feedback-category-label span:last-child { color: #666; font-size: 10px; letter-spacing: 0; }
  .ui-feedback-item { padding: 11px 12px; border: 1px solid rgba(255,255,255,.09); border-left: 2px solid rgba(255,255,255,.14); border-radius: 10px; background: #1a1a1a; }
  .ui-feedback-item + .ui-feedback-item { margin-top: 6px; border-top: 1px solid rgba(255,255,255,.09); }
  .ui-feedback-item:last-child { border-radius: 10px; }
  .ui-feedback-item:hover { background: #202020; border-color: rgba(255,255,255,.18); }
  .ui-feedback-item[data-priority="high"] { border-left-color: #f87171; }
  .ui-feedback-item[data-priority="medium"] { border-left-color: #facc15; }
  .ui-feedback-item[data-priority="low"] { border-left-color: #4ade80; }
  .ui-feedback-item__meta { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 7px; }
  .ui-feedback-item__identity { min-width: 0; display: flex; align-items: center; gap: 3px; }
  .ui-feedback-item__badges { display: flex; align-items: center; justify-content: flex-end; gap: 4px; flex: 0 0 auto; }
  .ui-feedback-item__selector { color: #a6a6a6; font-size: 10px; }
  .ui-feedback-copy-selector { opacity: .7; }
  .ui-feedback-category-chip { padding: 3px 6px; color: #aaa; background: #252525; font-size: 9px; }
  .ui-feedback-priority, .ui-feedback-resolve-badge { padding: 3px 6px; font-size: 9px; }
  .ui-feedback-item__target { margin: 0; color: #666; font-size: 10px; line-height: 1.4; }
  .ui-feedback-item__comment { margin: 7px 0 0; color: #f1f1f1; font-size: 13px; line-height: 1.45; }
  .ui-feedback-item__comment code { color: #ddd; font-size: .92em; }
  .ui-feedback-item__details { margin-top: 9px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,.08); }
  .ui-feedback-item__context { margin-bottom: 7px; }
  .ui-feedback-item__time { margin-bottom: 7px; color: #666; font-size: 10px; }
  .ui-feedback-item__code { margin-top: 0; padding: 6px 8px; border-color: rgba(255,255,255,.08); border-radius: 7px; background: #141414; color: #777; }
  .ui-feedback-item__actions { align-items: center; gap: 4px; margin-top: 10px; }
  .ui-feedback-item__action-spacer { flex: 1; }
  .ui-feedback-mini { padding: 5px 7px; border-radius: 6px; color: #999; background: #242424; font-size: 10px; }
  .ui-feedback-mini:hover { color: #fff; background: #303030; }
  .ui-feedback-mini--details { color: #bdbdbd; background: transparent; }
  .ui-feedback-mini--details:hover { background: #242424; }
  .ui-feedback-mini--resolve { color: #86efac; }
  .ui-feedback-item.is-resolved { opacity: .48; }
  @media (max-width: 560px) {
    .ui-feedback-panel__filter { grid-template-columns: 1fr 1fr; }
    .ui-feedback-search-wrap { grid-column: 1 / -1; }
    .ui-feedback-panel__header small { white-space: normal; }
    .ui-feedback-drag-hint { display: none; }
    .ui-feedback-item__badges { gap: 3px; }
    .ui-feedback-item__selector { max-width: 148px; }
  }

  /* \u2500\u2500 v0.10 advanced CSS editor \u2500\u2500 */
  .ui-feedback-css-tabs { overflow-x: auto; scrollbar-width: thin; }
  .ui-feedback-css-tab { flex: 0 0 auto; white-space: nowrap; }
  .ui-feedback-css-mini-range { display: grid; grid-template-columns: 48px minmax(0, 1fr) 42px; align-items: center; gap: 8px; margin: 6px 0; color: #aaa; font-size: 10px; }
  .ui-feedback-css-mini-range input[type="range"] { width: 100%; min-width: 0; }
  .ui-feedback-css-mini-range output { color: #ddd; text-align: right; font-variant-numeric: tabular-nums; }
  .ui-feedback-css-color-inline { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 9px; color: #aaa; font-size: 10px; }
  .ui-feedback-css-color-inline input[type="color"] { width: 34px; height: 28px; padding: 2px; border: 1px solid rgba(255,255,255,.18); border-radius: 7px; background: #222; }
  .ui-feedback-checkbox { display: inline-flex; align-items: center; gap: 7px; margin-top: 9px; color: #cfcfcf; font-size: 10px; }
  .ui-feedback-checkbox input { accent-color: #fff; }
  .ui-feedback-css-side-row { margin-top: 9px; padding: 9px; border: 1px solid rgba(255,255,255,.07); border-radius: 9px; background: rgba(255,255,255,.025); }
  .ui-feedback-css-side-row > strong { display: block; margin-bottom: 5px; color: #ddd; font-size: 10px; }
  .ui-feedback-css-side-row .ui-feedback-range-row { margin: 5px 0; padding: 6px 8px; }
  .ui-feedback-css-side-row .ui-feedback-css-select-row { margin-top: 5px; }
  .ui-feedback-css-side-row .ui-feedback-css-select-row span { font-size: 10px; }
  .ui-feedback-css-subsection + .ui-feedback-css-subsection { margin-top: 12px; }
  @media (max-width: 560px) {
    .ui-feedback-css-tab { padding-inline: 8px; font-size: 9px; }
    .ui-feedback-css-mini-range { grid-template-columns: 42px minmax(0, 1fr) 38px; gap: 6px; }
  }
`;

// src/ui/icons.js
var ICONS = {
  clipboard: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4.5V3h6v1.5M9 9h6M9 13h6M9 17h4"/></svg>',
  comment: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5.5h14v10H9l-4 3v-13Z"/><path d="M9 10.5h6M12 8v5"/></svg>',
  pencil: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 16.5-.8 4.3 4.3-.8L19 8.5 15.5 5 4 16.5Z"/><path d="m13.8 6.7 3.5 3.5M4 20.8l3.5-.8"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>',
  download: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M4 20h16"/></svg>',
  trash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M10 11v5M14 11v5M8 7l1 13h6l1-13M9 7l1-3h4l1 3"/></svg>',
  edit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 16.5-.8 4.3 4.3-.8L19 8.5 15.5 5 4 16.5Z"/><path d="m13.8 6.7 3.5 3.5"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5L20 7"/></svg>',
  undo: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10h13a4 4 0 0 1 0 8H9"/><path d="M7 6l-4 4 4 4"/></svg>',
  search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M16 16l5 5"/></svg>',
  filter: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M7 12h10M10 18h4"/></svg>',
  grip: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="6" r="1.2"/><circle cx="15" cy="6" r="1.2"/><circle cx="9" cy="12" r="1.2"/><circle cx="15" cy="12" r="1.2"/><circle cx="9" cy="18" r="1.2"/><circle cx="15" cy="18" r="1.2"/></svg>',
  paintbrush: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/><path d="M9 11l-4 4s-1.5 2 1 4.5 4.5 1 4.5 1l4.5-4"/></svg>',
  image: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><path d="m3 16 5-5 4 4 3-3 6 6"/></svg>',
  collapse: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 10l4 4 4-4"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11a8 8 0 0 0-14.8-4L3 10"/><path d="M3 5v5h5M4 13a8 8 0 0 0 14.8 4L21 14"/><path d="M21 19v-5h-5"/></svg>',
  github: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>'
};

// src/features/comments.js
function createCommentsController(ctx) {
  const { state } = ctx;
  function getFilteredComments() {
    let items = state.comments;
    if (state.drawerTab === "comment") items = items.filter((item) => item.type === "comment");
    if (state.drawerTab === "edit") items = items.filter((item) => ["edit", "css", "image"].includes(item.type));
    if (state.drawerTab === "resolved") items = items.filter((item) => item.resolved);
    if (state.filterPriority !== "all") items = items.filter((item) => item.priority === state.filterPriority);
    if (state.filterCategory !== "all") {
      items = items.filter((item) => (item.category || defaultCategoryForType(item.type)) === state.filterCategory);
    }
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      items = items.filter((item) => [item.comment, item.selector, item.tag, item.targetText, item.value].some((value) => String(value || "").toLowerCase().includes(query)));
    }
    return items;
  }
  function getItemCodeLine(item) {
    return firstCodeLine(resolveSelector(item.selector)) || item.codeLine || "";
  }
  function renderItem(item) {
    const priority = item.priority || "medium";
    const resolved = Boolean(item.resolved);
    const expanded = Boolean(state.expandedComments?.[item.id]);
    const time = relativeTime(item.updatedAt || item.createdAt);
    const contextTags = [];
    if (item.viewport) contextTags.push(`\u{1F4F1} ${item.viewport}`);
    if (item.scrollY !== void 0) contextTags.push(`\u2195\uFE0F ${item.scrollY}px`);
    const category = categoryLabel(item.category, item.type);
    const content = item.type === "edit" ? `<p class="ui-feedback-item__comment">\u270F\uFE0F Thay \u0111\u1ED5i text: <code>${escapeHtml(item.value)}</code></p>` : item.type === "css" ? `<p class="ui-feedback-item__comment">\u2726 B\u1ED9 giao di\u1EC7n: <code>${escapeHtml(item.value)}</code></p>` : item.type === "image" ? `<p class="ui-feedback-item__comment">\u25A7 Thay \u1EA3nh (${item.imageSourceType === "upload" ? "upload" : "URL"}): <code>${escapeHtml(item.value)}</code></p>` : `<p class="ui-feedback-item__comment">${escapeHtml(item.comment)}</p>`;
    const details = expanded ? `<div class="ui-feedback-item__details">
      ${contextTags.length ? `<div class="ui-feedback-item__context">${contextTags.map((tag) => `<span class="ui-feedback-context-tag">${escapeHtml(tag)}</span>`).join("")}</div>` : ""}
      ${time ? `<div class="ui-feedback-item__time">${escapeHtml(time)}</div>` : ""}
      <div class="ui-feedback-item__code" title="D\xF2ng code \u0111\u1EA7u c\u1EE7a component"><code>${escapeHtml(item.codeLine || getItemCodeLine(item) || item.tag || "Kh\xF4ng x\xE1c \u0111\u1ECBnh")}</code></div>
    </div>` : "";
    return `<article class="ui-feedback-item ${resolved ? "is-resolved" : ""} ${expanded ? "is-expanded" : ""}" data-comment-id="${escapeAttribute(item.id)}" data-priority="${escapeAttribute(priority)}">
      <div class="ui-feedback-item__meta">
        <div class="ui-feedback-item__identity"><span class="ui-feedback-item__selector" title="${escapeAttribute(item.selector)}">${escapeHtml(item.selector)}</span><button class="ui-feedback-copy-selector" data-copy-selector="${escapeAttribute(item.selector)}" aria-label="Copy selector" title="Copy selector">\u29C9</button></div>
        <div class="ui-feedback-item__badges"><span class="ui-feedback-category-chip">${escapeHtml(category)}</span><span class="ui-feedback-priority ui-feedback-priority--${priority}">${priority}</span><span class="ui-feedback-resolve-badge ${resolved ? "is-resolved" : "is-open"}">${resolved ? `${ICONS.check} Xong` : "M\u1EDF"}</span></div>
      </div>
      <p class="ui-feedback-item__target">${escapeHtml(item.tag)} <span aria-hidden="true">\xB7</span> ${escapeHtml(item.targetText || "Kh\xF4ng c\xF3 n\u1ED9i dung xem tr\u01B0\u1EDBc")}</p>
      ${content}
      ${details}
      <div class="ui-feedback-item__actions">
        <button class="ui-feedback-mini ui-feedback-mini--details" data-toggle-comment="${escapeAttribute(item.id)}" aria-expanded="${expanded ? "true" : "false"}">${expanded ? "\u1EA8n chi ti\u1EBFt" : "Chi ti\u1EBFt"} <span aria-hidden="true">${expanded ? "\u2303" : "\u2304"}</span></button>
        <span class="ui-feedback-item__action-spacer"></span>
        <button class="ui-feedback-mini ui-feedback-mini--resolve" data-resolve-comment="${escapeAttribute(item.id)}" title="${resolved ? "M\u1EDF l\u1EA1i" : "\u0110\xE1nh d\u1EA5u xong"}">${resolved ? ICONS.undo : ICONS.check} ${resolved ? "M\u1EDF l\u1EA1i" : "Xong"}</button>
        ${!["edit", "css", "image"].includes(item.type) ? `<button class="ui-feedback-mini" data-edit-comment="${escapeAttribute(item.id)}">${ICONS.edit} S\u1EEDa</button>` : ""}
        <button class="ui-feedback-mini" data-delete-comment="${escapeAttribute(item.id)}">${ICONS.trash} X\xF3a</button>
      </div>
    </article>`;
  }
  function renderGroupedComments(items) {
    const grouped = items.reduce((groups, item) => {
      var _a;
      const page = item.page || location.pathname || "/";
      const category = categoryLabel(item.category, item.type);
      groups[page] || (groups[page] = {});
      ((_a = groups[page])[category] || (_a[category] = [])).push(item);
      return groups;
    }, {});
    return Object.entries(grouped).map(([page, categories]) => {
      const total = Object.values(categories).reduce((sum, group) => sum + group.length, 0);
      const categoryContent = Object.entries(categories).map(
        ([category, categoryItems]) => `<div class="ui-feedback-category-group"><div class="ui-feedback-category-label"><span>${escapeHtml(category)}</span><span>${categoryItems.length}</span></div>${categoryItems.map(renderItem).join("")}</div>`
      ).join("");
      return `<section class="ui-feedback-group"><div class="ui-feedback-group__name"><span title="${escapeAttribute(page)}">${escapeHtml(page)}</span><span>${total}</span></div>${categoryContent}</section>`;
    }).join("");
  }
  function renderCategoryOptions(selected = "all") {
    return `<option value="all" ${selected === "all" ? "selected" : ""}>T\u1EA5t c\u1EA3 ph\xE2n lo\u1EA1i</option>${FEEDBACK_CATEGORIES.map((category) => `<option value="${category.value}" ${selected === category.value ? "selected" : ""}>${category.label}</option>`).join("")}`;
  }
  function editComment(id) {
    const item = state.comments.find((comment) => comment.id === id);
    if (!item) return;
    ctx.openModalWithExisting(resolveSelector(item.selector) || document.body, ["css", "image"].includes(item.type) ? item.type : "comment", item);
  }
  function deleteComment(id) {
    const index = state.comments.findIndex((comment) => comment.id === id);
    if (index === -1) return;
    const deleted = state.comments.splice(index, 1)[0];
    state.undoStack.push({ type: "delete", item: deleted, index });
    ctx.persist();
    ctx.renderToolbar();
    state.panelOpen = true;
    ctx.renderPanel();
    ctx.showToast("\u0110\xE3 x\xF3a feedback", { undo: true });
  }
  function undoAction() {
    const entry = state.undoStack.pop();
    if (!entry) return;
    if (entry.type === "delete") {
      state.comments.splice(entry.index, 0, entry.item);
      ctx.persist();
      ctx.renderToolbar();
      state.panelOpen = true;
      ctx.renderPanel();
      ctx.showToast("\u0110\xE3 ho\xE0n t\xE1c x\xF3a");
      return;
    }
    if (["edit", "css", "image"].includes(entry.type)) {
      const element = resolveSelector(entry.selector);
      if (element) {
        if (entry.type === "edit") element.textContent = entry.oldValue;
        if (entry.type === "css") element.style.cssText = entry.oldValue;
        if (entry.type === "image") ctx.restoreImageState(element, entry.oldImageState);
      }
      const index = state.comments.findIndex((comment) => comment.id === entry.id);
      if (index !== -1) state.comments.splice(index, 1);
      ctx.persist();
      ctx.renderToolbar();
      ctx.renderPanel();
      ctx.placeMarkers();
      ctx.showToast("\u0110\xE3 ho\xE0n t\xE1c ch\u1EC9nh s\u1EEDa");
    }
  }
  function resolveComment(id) {
    const item = state.comments.find((comment) => comment.id === id);
    if (!item) return;
    item.resolved = !item.resolved;
    item.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    ctx.persist();
    ctx.renderPanel();
    ctx.showToast(item.resolved ? "\u0110\xE3 \u0111\xE1nh d\u1EA5u xong" : "\u0110\xE3 m\u1EDF l\u1EA1i feedback");
  }
  return {
    getFilteredComments,
    getItemCodeLine,
    renderItem,
    renderGroupedComments,
    renderCategoryOptions,
    editComment,
    deleteComment,
    undoAction,
    resolveComment
  };
}

// src/features/export-markdown.js
function createMarkdownExporter(ctx) {
  const { state } = ctx;
  function renderItemMarkdown(item, index) {
    const status = item.resolved ? "\u0110\xE3 x\u1EED l\xFD" : "\u0110ang m\u1EDF";
    const lines = [`### ${index + 1}. ${escapeMarkdown(item.tag || "Element")} _(${item.type || "comment"})_`];
    if (item.type === "edit") {
      lines.push(`- **Text c\u0169:** ${escapeMarkdown(item.targetText || "")}`);
      lines.push(`- **Text m\u1EDBi:** ${escapeMarkdown(item.value || "")}`);
    } else if (item.type === "css") {
      lines.push(`- **CSS c\u0169:** \`${escapeMarkdown(item.targetText || "")}\``);
      lines.push(`- **CSS m\u1EDBi:** \`${escapeMarkdown(item.value || "")}\``);
    } else if (item.type === "image") {
      lines.push(`- **\u1EA2nh c\u0169:** ${escapeMarkdown(item.targetText || "Kh\xF4ng c\xF3")}`);
      lines.push(`- **\u1EA2nh m\u1EDBi:** ${escapeMarkdown(item.value || "")}`);
      lines.push(`- **Ngu\u1ED3n:** ${item.imageSourceType === "upload" ? "Upload t\u1EEB m\xE1y" : "URL website"}`);
    } else {
      lines.push(`- **\u01AFu ti\xEAn:** ${item.priority || "medium"}`);
      lines.push(`- **Feedback:** ${escapeMarkdown(item.comment || "")}`);
    }
    lines.push(`- **Ph\xE2n lo\u1EA1i:** ${categoryLabel(item.category, item.type)}`);
    lines.push(`- **D\xF2ng code \u0111\u1EA7u:** \`${escapeMarkdown(item.codeLine || ctx.getItemCodeLine(item) || item.tag || "")}\``);
    lines.push(`- **Selector:** \`${escapeMarkdown(item.selector || "")}\``);
    lines.push(`- **Tr\u1EA1ng th\xE1i:** ${status}`);
    if (item.viewport) lines.push(`- **Context:** \`${item.viewport}\` \xB7 \`${item.scrollY}px\``);
    lines.push(`- **T\u1EA1o l\xFAc:** ${item.createdAt ? formatDate(new Date(item.createdAt)) : "N/A"}`);
    lines.push(`- **C\u1EADp nh\u1EADt:** ${item.updatedAt ? formatDate(new Date(item.updatedAt)) : "N/A"}`);
    lines.push("");
    return lines;
  }
  function exportMarkdown() {
    const resolvedCount = state.comments.filter((item) => item.resolved).length;
    const openCount = state.comments.length - resolvedCount;
    const editCount = state.comments.filter((item) => ["edit", "css", "image"].includes(item.type)).length;
    const feedbackCount = state.comments.length - editCount;
    const lines = [
      "# UI/UX Feedback",
      "",
      `- **URL:** ${location.href}`,
      `- **Ng\xE0y xu\u1EA5t:** ${formatDate(/* @__PURE__ */ new Date())}`,
      `- **T\u1ED5ng feedback:** ${state.comments.length} (${feedbackCount} ghi ch\xFA, ${editCount} ch\u1EC9nh s\u1EEDa, ${openCount} m\u1EDF, ${resolvedCount} \u0111\xE3 x\u1EED l\xFD)`,
      ""
    ];
    const grouped = state.comments.reduce((groups, item) => {
      const key = item.page || "/";
      (groups[key] || (groups[key] = [])).push(item);
      return groups;
    }, {});
    Object.entries(grouped).forEach(([page, items]) => {
      lines.push(`## ${page}`, "");
      items.forEach((item, index) => renderItemMarkdown(item, index).forEach((line) => lines.push(line)));
    });
    lines.push("---", "", "## T\xF3m t\u1EAFt", "", "| Lo\u1EA1i | S\u1ED1 l\u01B0\u1EE3ng |", "|------|----------|");
    lines.push(`| Feedback (ghi ch\xFA) | ${feedbackCount} |`);
    lines.push(`| Edit (s\u1EEDa text) | ${state.comments.filter((item) => item.type === "edit").length} |`);
    lines.push(`| CSS (B\u1ED9 giao di\u1EC7n) | ${state.comments.filter((item) => item.type === "css").length} |`);
    lines.push(`| Image (thay \u1EA3nh) | ${state.comments.filter((item) => item.type === "image").length} |`, "");
    lines.push("### Theo m\u1EE9c \u0111\u1ED9 (ch\u1EC9 feedback)", "| M\u1EE9c \u0111\u1ED9 | M\u1EDF | Xong | T\u1ED5ng |", "|--------|-----|------|------|");
    ["high", "medium", "low"].forEach((priority) => {
      const all = state.comments.filter((item) => !["edit", "css", "image"].includes(item.type) && (item.priority || "medium") === priority);
      const resolved = all.filter((item) => item.resolved).length;
      const label = priority === "high" ? "Cao" : priority === "medium" ? "Trung b\xECnh" : "Th\u1EA5p";
      lines.push(`| ${label} | ${all.length - resolved} | ${resolved} | ${all.length} |`);
    });
    lines.push("");
    const blob = new Blob([lines.join("\n").replace(/\n\n\n+/g, "\n\n")], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `ui-feedback-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
    const exportedCount = state.comments.length;
    state.comments = [];
    state.undoStack = [];
    ctx.persist();
    ctx.clearMarkers();
    state.panelOpen = false;
    ctx.renderToolbar();
    ctx.showToast(exportedCount ? `\u0110\xE3 xu\u1EA5t Markdown v\xE0 l\xE0m s\u1EA1ch ${exportedCount} m\u1EE5c` : "\u0110\xE3 xu\u1EA5t file Markdown");
  }
  return { exportMarkdown, renderItemMarkdown };
}

// src/features/github-issue.js
function createGithubIssueController(ctx) {
  const { state, config } = ctx;
  function createGithubIssue() {
    if (!config.githubRepo) return;
    const unresolved = state.comments.filter((item) => !item.resolved);
    if (!unresolved.length) {
      ctx.showToast("Kh\xF4ng c\xF3 feedback n\xE0o \u0111ang m\u1EDF!");
      return;
    }
    const lines = [
      "# UI Feedback Review",
      `
**Context:** \`${window.innerWidth}x${window.innerHeight}\` \xB7 \`${state.theme}\``,
      ""
    ];
    unresolved.forEach((item, index) => {
      const typeLabel = item.type === "edit" ? "\u270F\uFE0F Edit" : item.type === "css" ? "\u2726 B\u1ED9 giao di\u1EC7n" : item.type === "image" ? "\u25A7 Image" : "\u{1F4AC} Feedback";
      lines.push(`### ${index + 1}. ${escapeMarkdown(item.tag)} _(${typeLabel})_`);
      if (item.type === "edit") {
        lines.push(`- **Current text:** ${escapeMarkdown(item.targetText || "")}`);
        lines.push(`- **New text:** ${escapeMarkdown(item.value || "")}`);
      } else if (item.type === "css") {
        lines.push(`- **Old CSS:** \`${escapeMarkdown(item.targetText || "")}\``);
        lines.push(`- **New CSS:** \`${escapeMarkdown(item.value || "")}\``);
      } else if (item.type === "image") {
        lines.push(`- **Old image:** ${escapeMarkdown(item.targetText || "N/A")}`);
        lines.push(`- **New image:** ${escapeMarkdown(item.value || "")}`);
        lines.push(`- **Source:** ${item.imageSourceType === "upload" ? "Local upload" : "Website URL"}`);
      } else {
        lines.push(`- **Priority:** ${item.priority || "medium"}`);
        lines.push(`- **Feedback:** ${escapeMarkdown(item.comment || "")}`);
      }
      lines.push(`- **Category:** ${categoryLabel(item.category, item.type)}`);
      lines.push(`- **Component code:** \`${escapeMarkdown(item.codeLine || ctx.getItemCodeLine(item) || item.tag || "N/A")}\``);
      lines.push(`- **Element:** \`${item.targetText ? escapeMarkdown(item.targetText.substring(0, 60)) : "N/A"}\``, "");
    });
    const body = encodeURIComponent(lines.join("\n"));
    window.open(`https://github.com/${config.githubRepo}/issues/new?title=UI+Feedback+Review&body=${body}`, "_blank");
    ctx.showToast("\u0110ang m\u1EDF trang t\u1EA1o Issue");
  }
  return { createGithubIssue };
}

// src/features/css-editor.js
function createCssEditor(ctx) {
  const { state, root } = ctx;
  function ensureGoogleFont(fontName) {
    if (!fontName || fontName === "inherit") return;
    const id = `ui-feedback-font-${fontName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName).replace(/%20/g, "+")}:wght@400;500;600;700&display=swap`;
    document.head.appendChild(link);
  }
  function normalizeColor(value, fallback = "#ffffff") {
    const raw = String(value || "").trim();
    if (/^#[0-9a-f]{6}$/i.test(raw)) return raw.toLowerCase();
    if (/^#[0-9a-f]{3}$/i.test(raw)) return raw.toLowerCase().replace(/^#(.)(.)(.)$/, "#$1$1$2$2$3$3");
    const match = raw.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (match) return `#${[match[1], match[2], match[3]].map((n) => Number(n).toString(16).padStart(2, "0")).join("")}`;
    return fallback;
  }
  function readCssValue(prop, fallback = "") {
    if (!state.target) return fallback;
    if (state.target.style?.[prop]) return state.target.style[prop];
    try {
      return getComputedStyle(state.target)[prop] || fallback;
    } catch {
      return fallback;
    }
  }
  function applyCssProperty(prop, value) {
    if (state.target && prop) state.target.style[prop] = value;
  }
  function parseTranslatePosition(value) {
    const raw = String(value || "").trim();
    const translate = raw.match(/translate\(\s*(-?\d+(?:\.\d+)?)px(?:\s*,\s*|\s+)(-?\d+(?:\.\d+)?)px\s*\)/i);
    if (translate) return { x: Number(translate[1]), y: Number(translate[2]) };
    const pair = raw.match(/^\s*(-?\d+(?:\.\d+)?)px[\s,]+(-?\d+(?:\.\d+)?)px\s*$/i);
    if (pair) return { x: Number(pair[1]), y: Number(pair[2]) };
    const matrix = raw.match(/matrix(?:3d)?\(([^)]+)\)/i);
    if (matrix) {
      const values = matrix[1].split(",").map(Number);
      if (values.length === 6) return { x: values[4] || 0, y: values[5] || 0 };
      if (values.length === 16) return { x: values[12] || 0, y: values[13] || 0 };
    }
    return { x: 0, y: 0 };
  }
  function applyCssPosition(position = state.cssPosition) {
    if (!state.target) return;
    const x = Math.max(-200, Math.min(200, Number(position.x) || 0));
    const y = Math.max(-200, Math.min(200, Number(position.y) || 0));
    state.cssPosition = { x, y };
    if ("translate" in state.target.style || typeof CSS === "undefined" || CSS.supports?.("translate", "0 0")) state.target.style.setProperty("translate", `${x}px ${y}px`);
    else state.target.style.transform = `translate(${x}px, ${y}px)${state.cssTransformBase ? ` ${state.cssTransformBase}` : ""}`;
    const pad = root.querySelector("[data-css-position-pad]");
    if (pad) {
      pad.style.setProperty("--pad-x", `${x * 0.3}px`);
      pad.style.setProperty("--pad-y", `${y * 0.3}px`);
    }
    root.querySelectorAll("[data-css-x], [data-css-x-number]").forEach((input) => {
      input.value = String(Math.round(x));
    });
    root.querySelectorAll("[data-css-y], [data-css-y-number]").forEach((input) => {
      input.value = String(Math.round(y));
    });
    root.querySelector("[data-css-x-output]")?.replaceChildren(`${Math.round(x)}px`);
    root.querySelector("[data-css-y-output]")?.replaceChildren(`${Math.round(y)}px`);
  }
  function updatePositionFromPointer(clientX, clientY) {
    const pad = root.querySelector("[data-css-position-pad]");
    if (!pad) return;
    const rect = pad.getBoundingClientRect();
    applyCssPosition({ x: ((clientX - rect.left) / rect.width - 0.5) * 400, y: ((clientY - rect.top) / rect.height - 0.5) * 400 });
  }
  return { ensureGoogleFont, normalizeColor, readCssValue, applyCssProperty, parseTranslatePosition, applyCssPosition, updatePositionFromPointer };
}

// src/features/image-editor.js
function createImageEditor() {
  function imageBackgroundSource(value) {
    const match = String(value || "").trim().match(/url\((?:"|')?(.*?)(?:"|')?\)/i);
    return match ? match[1] : "";
  }
  function parseImagePosition(value) {
    const parts = String(value || "").trim().toLowerCase().split(/\s+/).filter(Boolean);
    const convert = (part, fallback) => {
      if (!part) return fallback;
      if (part === "left" || part === "top") return 0;
      if (part === "center") return 50;
      if (part === "right" || part === "bottom") return 100;
      const numeric2 = parseFloat(part);
      return Number.isFinite(numeric2) ? Math.max(0, Math.min(100, numeric2)) : fallback;
    };
    return { x: convert(parts[0], 50), y: convert(parts[1], 50) };
  }
  function isImageElement(element) {
    return element instanceof Element && (element instanceof HTMLImageElement || element.tagName.toLowerCase() === "img");
  }
  function captureImageState(element) {
    if (!(element instanceof Element)) return { kind: "background", src: "", srcset: "", backgroundImage: "", backgroundPosition: "", backgroundSize: "" };
    if (isImageElement(element)) {
      let computed2 = {};
      try {
        computed2 = getComputedStyle(element);
      } catch {
      }
      return { kind: "src", src: element.currentSrc || element.getAttribute("src") || "", srcset: element.getAttribute("srcset") || "", backgroundImage: "", objectPosition: element.style.objectPosition || "", objectFit: element.style.objectFit || "", effectiveObjectPosition: computed2.objectPosition || "50% 50%" };
    }
    const backgroundImage = element.style.backgroundImage || (() => {
      try {
        return getComputedStyle(element).backgroundImage || "";
      } catch {
        return "";
      }
    })();
    let computed = {};
    try {
      computed = getComputedStyle(element);
    } catch {
    }
    return { kind: "background", src: imageBackgroundSource(backgroundImage), srcset: "", backgroundImage: element.style.backgroundImage || "", backgroundPosition: element.style.backgroundPosition || "", backgroundSize: element.style.backgroundSize || "", effectiveBackgroundPosition: computed.backgroundPosition || "50% 50%" };
  }
  function applyImageSource(element, source) {
    if (!(element instanceof Element)) return;
    const safeSource = String(source || "").trim();
    if (isImageElement(element)) {
      element.setAttribute("src", safeSource);
      if (element.hasAttribute("srcset")) element.removeAttribute("srcset");
    } else {
      element.style.backgroundImage = safeSource ? `url("${safeSource.replace(/"/g, '\\"')}")` : "";
    }
  }
  function applyImagePosition(element, position = { x: 50, y: 50 }) {
    if (!(element instanceof Element)) return;
    const x = Math.max(0, Math.min(100, Number(position.x) || 0));
    const y = Math.max(0, Math.min(100, Number(position.y) || 0));
    if (isImageElement(element)) {
      element.style.objectFit = "cover";
      element.style.objectPosition = `${x}% ${y}%`;
    } else element.style.backgroundPosition = `${x}% ${y}%`;
  }
  function applyImageState(element, snapshot) {
    if (!(element instanceof Element) || !snapshot) return;
    if (snapshot.kind === "src") {
      if (snapshot.src) element.setAttribute("src", snapshot.src);
      else element.removeAttribute("src");
      if (snapshot.srcset) element.setAttribute("srcset", snapshot.srcset);
      else element.removeAttribute("srcset");
      if (snapshot.objectPosition) element.style.objectPosition = snapshot.objectPosition;
      else if (snapshot.effectiveObjectPosition) element.style.objectPosition = snapshot.effectiveObjectPosition;
      if (snapshot.objectFit) element.style.objectFit = snapshot.objectFit;
    } else {
      element.style.backgroundImage = snapshot.backgroundImage || (snapshot.src ? `url("${snapshot.src.replace(/"/g, '\\"')}")` : "");
      if (snapshot.backgroundPosition) element.style.backgroundPosition = snapshot.backgroundPosition;
      else if (snapshot.effectiveBackgroundPosition) element.style.backgroundPosition = snapshot.effectiveBackgroundPosition;
      if (snapshot.backgroundSize) element.style.backgroundSize = snapshot.backgroundSize;
    }
  }
  function restoreImageState(element, snapshot) {
    if (!(element instanceof Element) || !snapshot) return;
    if (snapshot.kind === "src") {
      if (snapshot.src) element.setAttribute("src", snapshot.src);
      else element.removeAttribute("src");
      if (snapshot.srcset) element.setAttribute("srcset", snapshot.srcset);
      else element.removeAttribute("srcset");
      if (snapshot.objectPosition) element.style.objectPosition = snapshot.objectPosition;
      else element.style.removeProperty("object-position");
      if (snapshot.objectFit) element.style.objectFit = snapshot.objectFit;
      else element.style.removeProperty("object-fit");
    } else {
      element.style.backgroundImage = snapshot.backgroundImage || "";
      if (snapshot.backgroundPosition) element.style.backgroundPosition = snapshot.backgroundPosition;
      else element.style.removeProperty("background-position");
      if (snapshot.backgroundSize) element.style.backgroundSize = snapshot.backgroundSize;
      else element.style.removeProperty("background-size");
    }
  }
  function validateImageSource(source) {
    const value = String(source || "").trim();
    if (!value) return false;
    if (value.startsWith("data:image/")) return value.length <= 1e6;
    try {
      return ["http:", "https:"].includes(new URL(value, location.href).protocol);
    } catch {
      return false;
    }
  }
  return { imageBackgroundSource, parseImagePosition, captureImageState, applyImageSource, applyImagePosition, applyImageState, restoreImageState, validateImageSource };
}

// src/features/picker.js
function createPickerController(ctx) {
  const { state, root, config } = ctx;
  function clearResumeTimer() {
    if (state._resumeTimer) {
      clearTimeout(state._resumeTimer);
      state._resumeTimer = null;
    }
  }
  function clearHighlight() {
    if (!state.highlight) return;
    state.highlight.element.setAttribute("style", state.highlight.style || "");
    if (!state.highlight.style) state.highlight.element.removeAttribute("style");
    state.highlight = null;
  }
  function highlight(element) {
    if (!(element instanceof Element) || element.closest("#ui-feedback-host")) return;
    if (state.highlight?.element === element) return;
    clearHighlight();
    state.highlight = { element, style: element.getAttribute("style") };
    element.style.setProperty("outline", `2px solid ${config.accent}`, "important");
    element.style.setProperty("outline-offset", "3px", "important");
  }
  function beginPicking(mode, opts = {}) {
    clearResumeTimer();
    if (state.pickerInspector?.phase && state.pickerInspector.phase !== "idle") ctx.closePickerInspector?.();
    state.panelOpen = false;
    state.mode = mode;
    state.picking = true;
    state.pickerInspector.phase = "picking";
    state.pickerInspector.candidate = null;
    state.pickerInspector.selected = null;
    state.pickerInspector.locked = false;
    state.pickerInspector.breadcrumb = [];
    state.pickerInspector.measurement = { enabled: false, mode: "box", compareTarget: null };
    state.pickingLocked = false;
    state._modeBeforePickingStop = null;
    root.classList.add("ui-feedback-picking");
    ctx.renderToolbar();
    if (!opts.silent) ctx.showToast(mode === "comment" ? "Ch\u1ECDn ph\u1EA7n t\u1EED \u0111\u1EC3 ghi comment" : mode === "edit" ? "Ch\u1ECDn ph\u1EA7n t\u1EED \u0111\u1EC3 s\u1EEDa n\u1ED9i dung" : mode === "image" ? "Ch\u1ECDn ph\u1EA7n t\u1EED \u1EA3nh \u0111\u1EC3 thay \u1EA3nh" : "Ch\u1ECDn ph\u1EA7n t\u1EED \u0111\u1EC3 m\u1EDF B\u1ED9 giao di\u1EC7n");
  }
  function stopPicking(opts = {}) {
    clearResumeTimer();
    if (state.picking) state._modeBeforePickingStop = state.mode;
    state.picking = false;
    state.pickingLocked = false;
    if (!state.pickerInspector?.selected) state.pickerInspector.phase = "idle";
    root.classList.remove("ui-feedback-picking");
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

// src/features/measurement.js
function numeric(value) {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}
function sideValues(style, prefix) {
  return {
    top: numeric(style.getPropertyValue(`${prefix}-top`)),
    right: numeric(style.getPropertyValue(`${prefix}-right`)),
    bottom: numeric(style.getPropertyValue(`${prefix}-bottom`)),
    left: numeric(style.getPropertyValue(`${prefix}-left`))
  };
}
function measureBox(element) {
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
      height: rect.height
    },
    padding: sideValues(style, "padding"),
    margin: sideValues(style, "margin"),
    border: {
      top: numeric(style.borderTopWidth),
      right: numeric(style.borderRightWidth),
      bottom: numeric(style.borderBottomWidth),
      left: numeric(style.borderLeftWidth)
    },
    display: style.display
  };
}
function measureGap(elementA, elementB) {
  const first = measureBox(elementA)?.rect;
  const second = measureBox(elementB)?.rect;
  if (!first || !second || elementA === elementB) return null;
  const horizontal = second.left >= first.right ? second.left - first.right : first.left >= second.right ? first.left - second.right : 0;
  const vertical = second.top >= first.bottom ? second.top - first.bottom : first.top >= second.bottom ? first.top - second.bottom : 0;
  let axis = "x";
  let distance = horizontal;
  if (!horizontal || vertical > 0 && vertical < horizontal) {
    axis = "y";
    distance = vertical;
  }
  if (!horizontal && !vertical) {
    axis = "overlap";
    distance = 0;
  }
  const horizontalPoint = second.left >= first.right ? { x1: first.right, x2: second.left, y: Math.max(first.top, Math.min(first.bottom, second.top)) } : { x1: second.right, x2: first.left, y: Math.max(second.top, Math.min(second.bottom, first.top)) };
  const verticalPoint = second.top >= first.bottom ? { y1: first.bottom, y2: second.top, x: Math.max(first.left, Math.min(first.right, second.left)) } : { y1: second.bottom, y2: first.top, x: Math.max(second.left, Math.min(second.right, first.left)) };
  return { axis, distance, first, second, horizontalPoint, verticalPoint };
}
function px(value) {
  return `${Math.round(value * 10) / 10}px`;
}
function createMeasurementController(ctx) {
  const { state, root } = ctx;
  let observer = null;
  let raf = 0;
  let scrollBound = false;
  function mount() {
    return root.querySelector("[data-picker-measurement-layer]");
  }
  function clearOverlay() {
    cancelAnimationFrame(raf);
    raf = 0;
    const layer = mount();
    if (layer) layer.innerHTML = "";
  }
  function renderBoxOverlay(element, data = measureBox(element)) {
    const layer = mount();
    if (!layer || !data) return;
    const { rect, padding, margin, border } = data;
    layer.innerHTML = `<div class="ui-feedback-measurement-box" style="left:${px(rect.left)};top:${px(rect.top)};width:${px(rect.width)};height:${px(rect.height)}"><span class="ui-feedback-measurement-label">${Math.round(rect.width)} \xD7 ${Math.round(rect.height)}</span><i class="ui-feedback-measurement-edge ui-feedback-measurement-edge--padding" style="inset:${px(border.top + padding.top)} ${px(border.right + padding.right)} ${px(border.bottom + padding.bottom)} ${px(border.left + padding.left)}"></i><i class="ui-feedback-measurement-edge ui-feedback-measurement-edge--border" style="inset:${px(border.top / 2)} ${px(border.right / 2)} ${px(border.bottom / 2)} ${px(border.left / 2)}"></i></div><div class="ui-feedback-measurement-margin" style="left:${px(rect.left - margin.left)};top:${px(rect.top - margin.top)};width:${px(rect.width + margin.left + margin.right)};height:${px(rect.height + margin.top + margin.bottom)}"></div>`;
  }
  function renderGapOverlay(data) {
    const layer = mount();
    if (!layer || !data || data.axis === "overlap") return;
    if (data.axis === "x") {
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
      if (inspector.measurement.mode === "gap") {
        renderGapOverlay(measureGap(selected, inspector.measurement.compareTarget));
      } else {
        renderBoxOverlay(selected);
      }
    });
  }
  function observe(element) {
    observer?.disconnect();
    observer = typeof ResizeObserver === "function" && element ? new ResizeObserver(recalibrate) : null;
    observer?.observe(element);
    if (!scrollBound) {
      window.addEventListener("scroll", recalibrate, { passive: true });
      window.addEventListener("resize", recalibrate, { passive: true });
      scrollBound = true;
    }
  }
  function enable(element, mode = "box") {
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
    recalibrate();
  }
  function setCompareTarget(element) {
    if (!(element instanceof Element) || element.closest("#ui-feedback-host")) return false;
    state.pickerInspector.measurement.compareTarget = element;
    state.pickerInspector.measurement.enabled = true;
    recalibrate();
    return true;
  }
  function getSnapshot() {
    const inspector = state.pickerInspector;
    const box = inspector?.selected?.element ? measureBox(inspector.selected.element) : null;
    const gap = inspector?.measurement?.mode === "gap" ? measureGap(inspector.selected?.element, inspector.measurement.compareTarget) : null;
    return { box, gap };
  }
  function destroy() {
    disable();
    if (scrollBound) {
      window.removeEventListener("scroll", recalibrate);
      window.removeEventListener("resize", recalibrate);
      scrollBound = false;
    }
  }
  return { measureBox, measureGap, renderBoxOverlay, renderGapOverlay, clearOverlay, recalibrate, enable, disable, setMode, setCompareTarget, getSnapshot, destroy };
}

// src/features/picker-inspector.js
var TOOL_SELECTOR = "#ui-feedback-host";
var MAX_BREADCRUMB_SEGMENTS = 5;
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
    selector: cssPath(element)
  };
}
function buildBreadcrumb(element) {
  if (!isInspectable(element)) return [];
  const chain = [];
  let current = element;
  while (current instanceof Element && !current.closest(TOOL_SELECTOR)) {
    chain.unshift(segmentFor(current, chain.length));
    if (current === document.body) break;
    current = current.parentElement;
  }
  return chain.map((item, index) => ({ ...item, index }));
}
function renderBreadcrumb(items) {
  if (!items.length) return "";
  const button = (item) => `<button type="button" class="ui-feedback-inspector__crumb" data-breadcrumb-index="${item.index}" title="${escapeHtml(item.selector)}" aria-label="Ch\u1ECDn ${escapeHtml(item.label)}">${escapeHtml(item.label)}</button>`;
  if (items.length <= MAX_BREADCRUMB_SEGMENTS) return items.map(button).join('<span class="ui-feedback-inspector__crumb-separator" aria-hidden="true">\u203A</span>');
  const middle = items.slice(1, -3);
  return `${button(items[0])}<span class="ui-feedback-inspector__crumb-separator" aria-hidden="true">\u203A</span><details class="ui-feedback-inspector__overflow"><summary aria-label="Hi\u1EC7n c\xE1c ph\u1EA7n t\u1EED cha \u1EDF gi\u1EEFa">\u2026</summary><div class="ui-feedback-inspector__overflow-menu">${middle.map(button).join("")}</div></details><span class="ui-feedback-inspector__crumb-separator" aria-hidden="true">\u203A</span>${items.slice(-3).map(button).join('<span class="ui-feedback-inspector__crumb-separator" aria-hidden="true">\u203A</span>')}`;
}
function formatSides(sides) {
  if (!sides) return "\u2014";
  return `${Math.round(sides.top)} / ${Math.round(sides.right)} / ${Math.round(sides.bottom)} / ${Math.round(sides.left)}px`;
}
function createPickerInspector(ctx) {
  const { state, root, renderToolbar: renderToolbar2, measurement } = ctx;
  function selectedElement() {
    return state.pickerInspector?.selected?.element || null;
  }
  function selectTarget(element) {
    if (!isInspectable(element) || state.pickerInspector.locked) return false;
    const breadcrumb = buildBreadcrumb(element);
    state.pickerInspector.phase = "selected";
    state.pickerInspector.candidate = null;
    state.pickerInspector.selected = { element, selector: cssPath(element), label: targetLabel(element), breadcrumb };
    state.pickerInspector.breadcrumb = breadcrumb;
    state.pickerInspector.measurement.compareTarget = null;
    state.picking = false;
    state.pickingLocked = false;
    root.classList.remove("ui-feedback-picking");
    ctx.clearHighlight?.();
    renderToolbar2();
    positionInspector(element);
    return true;
  }
  function setCandidate(element) {
    if (!isInspectable(element)) return false;
    state.pickerInspector.candidate = { element, selector: cssPath(element), label: targetLabel(element) };
    return true;
  }
  function lockTarget() {
    if (!selectedElement()) return false;
    state.pickerInspector.phase = "locked";
    state.pickerInspector.locked = true;
    renderToolbar2();
    positionInspector(selectedElement());
    return true;
  }
  function unlockTarget() {
    if (!selectedElement()) return false;
    state.pickerInspector.phase = "selected";
    state.pickerInspector.locked = false;
    renderToolbar2();
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
    state.pickerInspector.phase = "idle";
    state.pickerInspector.candidate = null;
    state.pickerInspector.selected = null;
    state.pickerInspector.locked = false;
    state.pickerInspector.breadcrumb = [];
    state.pickerInspector.measurement = { enabled: false, mode: "box", compareTarget: null };
    ctx.clearHighlight?.();
    renderToolbar2();
  }
  function openAction(action) {
    const element = selectedElement();
    if (!element || !element.isConnected) {
      closeInspector();
      ctx.showToast?.("Ph\u1EA7n t\u1EED \u0111\xE3 thay \u0111\u1ED5i ho\u1EB7c kh\xF4ng c\xF2n tr\xEAn trang");
      return false;
    }
    if (["comment", "edit", "css", "image"].includes(action)) lockTarget();
    ctx.onAction?.(action, element);
    return true;
  }
  function measurementMarkup() {
    const inspector = state.pickerInspector;
    if (!inspector.measurement.enabled) return "";
    const snapshot = measurement?.getSnapshot?.() || {};
    if (inspector.measurement.mode === "gap") {
      const gap = snapshot.gap;
      return `<section class="ui-feedback-inspector__measurement" aria-label="\u0110o kho\u1EA3ng c\xE1ch"><div class="ui-feedback-inspector__section-head"><strong>\u0110o kho\u1EA3ng c\xE1ch</strong><button type="button" data-inspector-action="measure-box" aria-label="\u0110o box" title="\u0110o box">Box</button></div><p class="ui-feedback-inspector__hint">${gap ? `Kho\u1EA3ng c\xE1ch ng\u1EAFn nh\u1EA5t theo tr\u1EE5c <b>${gap.axis}</b>: <b>${Math.round(gap.distance)}px</b>` : "\u0110ang ch\u1EDD ph\u1EA7n t\u1EED th\u1EE9 hai\u2026"}</p></section>`;
    }
    const box = snapshot.box;
    if (!box) return "";
    return `<section class="ui-feedback-inspector__measurement" aria-label="\u0110o k\xEDch th\u01B0\u1EDBc"><div class="ui-feedback-inspector__section-head"><strong>\u0110o box</strong><button type="button" data-inspector-action="measure-gap" aria-label="\u0110o kho\u1EA3ng c\xE1ch" title="\u0110o kho\u1EA3ng c\xE1ch">Gap</button></div><div class="ui-feedback-inspector__metrics"><span><b>W</b>${Math.round(box.rect.width)}px</span><span><b>H</b>${Math.round(box.rect.height)}px</span><span><b>X</b>${Math.round(box.rect.x)}px</span><span><b>Y</b>${Math.round(box.rect.y)}px</span></div><p class="ui-feedback-inspector__hint">Padding ${formatSides(box.padding)} \xB7 Margin ${formatSides(box.margin)}</p></section>`;
  }
  function renderInspector() {
    const inspector = state.pickerInspector;
    if (!inspector || !inspector.selected || inspector.phase === "idle") return "";
    const selected = inspector.selected;
    const lockLabel = inspector.locked ? "M\u1EDF kh\xF3a selection" : "Kh\xF3a selection";
    return `<aside class="ui-feedback-inspector ${inspector.locked ? "is-locked" : ""}" data-picker-inspector role="dialog" aria-label="Picker Inspector" tabindex="-1"><header class="ui-feedback-inspector__header"><div class="ui-feedback-window-heading"><span class="ui-feedback-window-grip" aria-hidden="true">\u22EE\u22EE</span><div><strong>Inspector</strong><small>${inspector.locked ? "Selection \u0111\xE3 kh\xF3a" : "Selection \u0111ang m\u1EDF"}</small></div></div><div class="ui-feedback-inspector__actions"><button type="button" class="ui-feedback-icon-button" data-inspector-action="lock" aria-label="${lockLabel}" title="${lockLabel}">${inspector.locked ? "\u{1F512}" : "\u2311"}</button><button type="button" class="ui-feedback-icon-button" data-inspector-action="close" aria-label="\u0110\xF3ng Inspector" title="\u0110\xF3ng">\xD7</button></div></header><div class="ui-feedback-inspector__body"><div class="ui-feedback-inspector__crumbs" aria-label="Breadcrumb DOM">${renderBreadcrumb(selected.breadcrumb)}</div><div class="ui-feedback-inspector__target"><div><strong>${escapeHtml(selected.label || selected.tag)}</strong><small>${escapeHtml(selected.selector)}</small></div><button type="button" class="ui-feedback-inspector__copy" data-inspector-action="copy" aria-label="Copy selector" title="Copy selector">Copy</button></div><div class="ui-feedback-inspector__actions-grid"><button type="button" data-inspector-action="comment">Comment</button><button type="button" data-inspector-action="edit">S\u1EEDa text</button><button type="button" data-inspector-action="css">B\u1ED9 CSS</button><button type="button" data-inspector-action="image">Thay \u1EA3nh</button></div><div class="ui-feedback-inspector__measure-actions"><button type="button" data-inspector-action="measure-box" class="${inspector.measurement.enabled && inspector.measurement.mode === "box" ? "is-active" : ""}">\u0110o box</button><button type="button" data-inspector-action="measure-gap" class="${inspector.measurement.enabled && inspector.measurement.mode === "gap" ? "is-active" : ""}">\u0110o gap</button></div>${measurementMarkup()}<p class="ui-feedback-inspector__shortcut"><kbd>Enter</kbd> ch\u1ECDn \xB7 <kbd>L</kbd> kh\xF3a \xB7 <kbd>M</kbd> \u0111o \xB7 <kbd>Esc</kbd> \u0111\xF3ng</p></div></aside>`;
  }
  function positionInspector(target = selectedElement()) {
    const inspector = root.querySelector("[data-picker-inspector]");
    if (!inspector || !(target instanceof Element)) return;
    if (window.innerWidth <= 640) {
      inspector.style.left = "12px";
      inspector.style.right = "12px";
      inspector.style.top = "auto";
      inspector.style.bottom = "12px";
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
    inspector.style.right = "auto";
    inspector.style.bottom = "auto";
  }
  function refresh() {
    renderToolbar2();
    requestAnimationFrame(() => positionInspector());
  }
  return { selectTarget, setCandidate, lockTarget, unlockTarget, selectBreadcrumb, closeInspector, openAction, renderInspector, positionInspector, refresh, selectedElement };
}

// src/ui/panel.js
function createPanelController(ctx) {
  const { state, root } = ctx;
  function getWindowDragHandle(event, selector) {
    if (event.pointerType === "mouse" && event.button !== 0) return null;
    const path = typeof event.composedPath === "function" ? event.composedPath() : [];
    const elements = path.filter((node) => node && node.nodeType === 1);
    const target = elements[0] || event.target;
    const interactive = elements.find((node) => node.matches?.('button, a, input, textarea, select, option, [contenteditable="true"], [data-no-drag]'));
    if (interactive) return null;
    return elements.find((node) => node.matches?.(selector)) || target?.closest?.(selector) || null;
  }
  function applyPanelPosition() {
    const panel = root.querySelector(".ui-feedback-panel");
    if (!panel) return;
    const position = state.panelPosition || { x: 0, y: 0 };
    panel.style.setProperty("--ui-feedback-panel-x", `${position.x}px`);
    panel.style.setProperty("--ui-feedback-panel-y", `${position.y}px`);
  }
  function resetPosition() {
    state.panelPosition = { x: 0, y: 0 };
    applyPanelPosition();
    ctx.showToast("\u0110\xE3 \u0111\u1EB7t l\u1EA1i v\u1ECB tr\xED c\u1EEDa s\u1ED5");
  }
  function handlePointerDown(event) {
    const handle = getWindowDragHandle(event, "[data-panel-drag-handle]");
    if (!handle) return;
    event.preventDefault();
    event.stopPropagation();
    const panel = root.querySelector(".ui-feedback-panel");
    const position = state.panelPosition || { x: 0, y: 0 };
    const drag = { clientX: event.clientX, clientY: event.clientY, x: position.x, y: position.y, pointerId: event.pointerId };
    handle.classList.add("is-dragging");
    panel?.classList.add("is-dragging");
    try {
      handle.setPointerCapture?.(event.pointerId);
    } catch {
    }
    const onMove = (moveEvent) => {
      if (moveEvent.pointerId !== drag.pointerId) return;
      const maxX = Math.max(0, window.innerWidth - 80);
      const maxY = Math.max(0, window.innerHeight - 80);
      state.panelPosition = {
        x: Math.max(-maxX, Math.min(maxX, drag.x + moveEvent.clientX - drag.clientX)),
        y: Math.max(-maxY, Math.min(maxY, drag.y + moveEvent.clientY - drag.clientY))
      };
      applyPanelPosition();
    };
    const onEnd = (endEvent) => {
      if (endEvent?.pointerId != null && endEvent.pointerId !== drag.pointerId) return;
      handle.classList.remove("is-dragging");
      panel?.classList.remove("is-dragging");
      try {
        handle.releasePointerCapture?.(drag.pointerId);
      } catch {
      }
      document.removeEventListener("pointermove", onMove, true);
      document.removeEventListener("pointerup", onEnd, true);
      document.removeEventListener("pointercancel", onEnd, true);
      window.removeEventListener("blur", onBlur);
    };
    const onBlur = () => onEnd();
    document.addEventListener("pointermove", onMove, true);
    document.addEventListener("pointerup", onEnd, true);
    document.addEventListener("pointercancel", onEnd, true);
    window.addEventListener("blur", onBlur);
  }
  return { applyPanelPosition, resetPosition, handlePointerDown, getWindowDragHandle };
}

// src/ui/modal.js
function createModalController(ctx) {
  const { state, root } = ctx;
  function applyModalPosition() {
    const modal = root.querySelector(".ui-feedback-modal");
    if (!modal) return;
    const position = state.modalPosition || { x: 0, y: 0 };
    modal.style.setProperty("--ui-feedback-modal-x", `${position.x}px`);
    modal.style.setProperty("--ui-feedback-modal-y", `${position.y}px`);
  }
  function resetPosition() {
    state.modalPosition = { x: 0, y: 0 };
    applyModalPosition();
    ctx.showToast("\u0110\xE3 \u0111\u1EB7t l\u1EA1i v\u1ECB tr\xED c\u1EEDa s\u1ED5");
  }
  function handlePointerDown(event) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const path = typeof event.composedPath === "function" ? event.composedPath() : [];
    const elements = path.filter((node) => node && node.nodeType === 1);
    const target = elements[0] || event.target;
    const interactive = elements.find((node) => node.matches?.('button, a, input, textarea, select, option, [contenteditable="true"], [data-no-drag]'));
    if (interactive) return;
    const handle = elements.find((node) => node.matches?.("[data-modal-drag-handle]")) || target?.closest?.("[data-modal-drag-handle]");
    if (!handle) return;
    event.preventDefault();
    event.stopPropagation();
    const modal = root.querySelector(".ui-feedback-modal");
    const position = state.modalPosition || { x: 0, y: 0 };
    const drag = { clientX: event.clientX, clientY: event.clientY, x: position.x, y: position.y, pointerId: event.pointerId };
    handle.classList.add("is-dragging");
    modal?.classList.add("is-dragging");
    try {
      handle.setPointerCapture?.(event.pointerId);
    } catch {
    }
    const onMove = (moveEvent) => {
      if (moveEvent.pointerId !== drag.pointerId) return;
      const maxX = Math.max(0, window.innerWidth - 100);
      const maxY = Math.max(0, window.innerHeight - 100);
      state.modalPosition = {
        x: Math.max(-maxX, Math.min(maxX, drag.x + moveEvent.clientX - drag.clientX)),
        y: Math.max(-maxY, Math.min(maxY, drag.y + moveEvent.clientY - drag.clientY))
      };
      applyModalPosition();
    };
    const onEnd = (endEvent) => {
      if (endEvent?.pointerId != null && endEvent.pointerId !== drag.pointerId) return;
      handle.classList.remove("is-dragging");
      modal?.classList.remove("is-dragging");
      try {
        handle.releasePointerCapture?.(drag.pointerId);
      } catch {
      }
      document.removeEventListener("pointermove", onMove, true);
      document.removeEventListener("pointerup", onEnd, true);
      document.removeEventListener("pointercancel", onEnd, true);
      window.removeEventListener("blur", onBlur);
    };
    const onBlur = () => onEnd();
    document.addEventListener("pointermove", onMove, true);
    document.addEventListener("pointerup", onEnd, true);
    document.addEventListener("pointercancel", onEnd, true);
    window.addEventListener("blur", onBlur);
  }
  return { applyModalPosition, resetPosition, handlePointerDown };
}

// src/ui/toolbar.js
function renderToolbar(ctx) {
  const {
    state,
    root,
    getToolbarStyle,
    dismissCoachmark,
    renderPanel,
    renderModal,
    renderInspector
  } = ctx;
  if (!state.active) {
    root.innerHTML = "";
    return;
  }
  const undoCount = state.undoStack.length;
  const undoBadge = undoCount ? `<span class="ui-feedback-badge ui-feedback-badge--undo">${undoCount}</span>` : "";
  const updateLabel = state.updateBusy ? "\u0110ang ki\u1EC3m tra" : "Update";
  const coachmark = state.coachmarkVisible ? '<aside class="ui-feedback-coachmark" role="status"><strong>B\u1EAFt \u0111\u1EA7u v\u1EDBi UI Feedback</strong><p>Ghi nh\u1EADn thay \u0111\u1ED5i ngay tr\xEAn b\u1EA3n preview, kh\xF4ng c\u1EA7n r\u1EDDi kh\u1ECFi trang.</p><ol class="ui-feedback-coachmark__steps"><li>Ch\u1ECDn m\u1ED9t c\xF4ng c\u1EE5 tr\xEAn thanh dock.</li><li>R\xEA chu\u1ED9t v\xE0 b\u1EA5m v\xE0o ph\u1EA7n t\u1EED c\u1EA7n review.</li><li>L\u01B0u feedback ho\u1EB7c ho\xE0n t\xE1c b\u1EB1ng n\xFAt Undo.</li></ol><button type="button" data-coachmark-dismiss>\u0110\xE3 hi\u1EC3u</button></aside>' : "";
  const bubble = `<button class="ui-feedback-toolbar-bubble" data-action="collapse" aria-label="M\u1EDF thanh c\xF4ng c\u1EE5" title="M\u1EDF thanh c\xF4ng c\u1EE5">${ICONS.grip}<span class="ui-feedback-badge" ${state.comments.length ? "" : "hidden"}>${state.comments.length}</span></button>`;
  const dock = `<div class="ui-feedback-toolbar" role="toolbar" aria-label="UI Feedback tools" style="${getToolbarStyle()}">
      <div class="ui-feedback-toolbar-grip" data-drag-handle aria-label="K\xE9o \u0111\u1EC3 di chuy\u1EC3n toolbar">${ICONS.grip}</div>
      <button class="ui-feedback-tool ${state.panelOpen ? "is-active" : ""}" data-action="list" aria-label="M\u1EDF danh s\xE1ch feedback" title="Danh s\xE1ch feedback">${ICONS.clipboard}<span class="ui-feedback-tool__label">Feedback</span><span class="ui-feedback-badge" ${state.comments.length ? "" : "hidden"}>${state.comments.length}</span></button>
      <button class="ui-feedback-tool ${state.picking && state.mode === "comment" ? "is-active" : ""}" data-action="comment" aria-label="Th\xEAm note" title="Th\xEAm note">${ICONS.comment}<span class="ui-feedback-tool__label">Note</span></button>
      <button class="ui-feedback-tool ${state.picking && state.mode === "edit" ? "is-active" : ""}" data-action="edit" aria-label="S\u1EEDa n\u1ED9i dung UI" title="S\u1EEDa text">${ICONS.pencil}<span class="ui-feedback-tool__label">S\u1EEDa text</span></button>
      <button class="ui-feedback-tool ${state.picking && state.mode === "css" ? "is-active" : ""}" data-action="css" aria-label="M\u1EDF B\u1ED9 CSS" title="B\u1ED9 CSS">${ICONS.paintbrush}<span class="ui-feedback-tool__label">B\u1ED9 CSS</span></button>
      <button class="ui-feedback-tool ${state.picking && state.mode === "image" ? "is-active" : ""}" data-action="image" aria-label="Thay \u1EA3nh" title="Thay \u1EA3nh">${ICONS.image}<span class="ui-feedback-tool__label">Thay \u1EA3nh</span></button>
      <button class="ui-feedback-tool ui-feedback-tool--update ${state.updateBusy ? "is-busy" : ""}" data-action="update" aria-label="Ki\u1EC3m tra v\xE0 c\u1EADp nh\u1EADt UI Feedback tool" title="Ki\u1EC3m tra b\u1EA3n c\u1EADp nh\u1EADt" aria-busy="${state.updateBusy ? "true" : "false"}">${ICONS.refresh}<span class="ui-feedback-tool__label">${updateLabel}</span></button>
      ${undoCount ? `<button class="ui-feedback-tool" data-action="undo" aria-label="Ho\xE0n t\xE1c thao t\xE1c g\u1EA7n nh\u1EA5t" title="Ho\xE0n t\xE1c (${undoCount})">${ICONS.undo}<span class="ui-feedback-tool__label">Undo</span>${undoBadge}</button>` : ""}
      <button class="ui-feedback-tool" data-action="collapse" aria-label="Thu g\u1ECDn thanh c\xF4ng c\u1EE5" title="Thu g\u1ECDn">${ICONS.collapse}</button>
    </div>`;
  root.innerHTML = `${state.picking ? '<div class="ui-feedback-picker-layer" data-picker-layer aria-hidden="true"></div>' : ""}<div class="ui-feedback-measurement-layer" data-picker-measurement-layer aria-hidden="true"></div>${state.collapsed ? bubble : dock}${coachmark}<div data-ui-feedback-panel></div><div data-ui-feedback-modal></div>${renderInspector ? renderInspector() : ""}<div data-ui-feedback-toast></div>`;
  if (state.panelOpen) renderPanel();
  if (state.modalOpen) renderModal();
}

// src/ui/toast.js
function createToastController(ctx) {
  let toastTimer;
  function showToast(message, opts = {}) {
    const mount = ctx.root.querySelector("[data-ui-feedback-toast]");
    if (!mount) return;
    clearTimeout(toastTimer);
    const undoButton = opts.undo ? '<button class="ui-feedback-toast__undo" data-toast-undo>Ho\xE0n t\xE1c</button>' : "";
    mount.innerHTML = `<div class="ui-feedback-toast" role="status">${escapeHtml(message)}${undoButton}</div>`;
    if (opts.undo) {
      mount.querySelector("[data-toast-undo]")?.addEventListener("click", (event) => {
        event.stopPropagation();
        ctx.undoAction();
        mount.innerHTML = "";
      });
    }
    toastTimer = setTimeout(() => {
      const toast = mount.querySelector(".ui-feedback-toast");
      if (!toast) return;
      toast.classList.add("is-leaving");
      setTimeout(() => {
        mount.innerHTML = "";
      }, 220);
    }, opts.undo ? 5e3 : 2400);
  }
  function dispose() {
    clearTimeout(toastTimer);
    const mount = ctx.root.querySelector("[data-ui-feedback-toast]");
    if (mount) mount.innerHTML = "";
  }
  return { showToast, dispose };
}

// src/index.js
function createUIFeedback(options = {}) {
  if (typeof window === "undefined" || typeof document === "undefined") return null;
  if (window.__uiFeedbackInstance) return window.__uiFeedbackInstance;
  const config = mergeConfig(options);
  const pressed = /* @__PURE__ */ new Set();
  const recentShortcutKeys = [];
  let shortcutTimer;
  const stateStore = createFeedbackState(config);
  const { state, persist, persistActive, hasSeenCoachmark, dismissCoachmark: persistCoachmark } = stateStore;
  const markers = [];
  let commentsController;
  let toastController;
  let markdownExporter;
  let githubIssueController;
  let panelController;
  let modalController;
  let cssEditor;
  const imageEditor = createImageEditor();
  let pickerController;
  let measurementController;
  let pickerInspector;
  const host = document.createElement("div");
  host.id = "ui-feedback-host";
  host.dataset.uiFeedbackIgnore = "true";
  const shadow = host.attachShadow({ mode: "open" });
  shadow.innerHTML = `<style>${STYLESHEET}</style><div class="ui-feedback-root${state.theme === "dark" ? " is-dark" : ""}" style="--ui-feedback-accent:${config.accent}"></div>`;
  const root = shadow.querySelector(".ui-feedback-root");
  document.documentElement.appendChild(host);
  if (config.theme === "auto") {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
      state.theme = e.matches ? "dark" : "light";
      root.classList.toggle("is-dark", state.theme === "dark");
    });
  }
  let dragState = null;
  let toolbarPos = { right: 20, top: null };
  function getToolbarStyle() {
    const r = toolbarPos.right;
    if (toolbarPos.top !== null) {
      return `right:${r}px;top:${toolbarPos.top}px;transform:none;`;
    }
    return `right:${r}px;bottom:20px;`;
  }
  function dismissCoachmark() {
    state.coachmarkVisible = false;
    persistCoachmark();
    renderToolbar2();
  }
  function applyPersistedChanges() {
    if (!state.active) return;
    const page = location.pathname || "/";
    state.comments.filter((item) => (item.page || "/") === page && ["edit", "css", "image"].includes(item.type)).sort((a, b) => String(a.createdAt || "").localeCompare(String(b.createdAt || ""))).forEach((item) => {
      const element = resolveSelector(item.selector);
      if (!element) return;
      if (item.type === "edit") element.textContent = item.value || "";
      else if (item.type === "css") element.style.cssText = item.value || "";
      else if (item.type === "image") applyImageState(element, item.newImageState || { kind: "src", src: item.value || "" });
    });
  }
  function renderToolbar2() {
    renderToolbar({
      state,
      root,
      getToolbarStyle,
      renderPanel,
      renderModal,
      renderInspector: () => pickerInspector?.renderInspector?.() || ""
    });
  }
  function normalizeVersion(value) {
    const match = String(value || "").match(/\d+(?:\.\d+){0,2}/);
    return match ? match[0].split(".").map(Number) : [0];
  }
  function compareVersions(left, right) {
    const a = normalizeVersion(left);
    const b = normalizeVersion(right);
    for (let i = 0; i < 3; i += 1) {
      const delta = (a[i] || 0) - (b[i] || 0);
      if (delta) return delta;
    }
    return 0;
  }
  function extractToolVersion(source) {
    return String(source || "").match(/UI Feedback Tool v(\d+(?:\.\d+){2})/)?.[1] || "";
  }
  async function updateTool() {
    if (state.updateBusy) return;
    state.updateBusy = true;
    let feedbackMessage = "";
    renderToolbar2();
    try {
      const candidateUrls = [...new Set([
        ...Array.isArray(config.updateMirrors) ? config.updateMirrors : [],
        config.updateUrl
      ].filter(Boolean))];
      const currentVersion = config.version || TOOL_VERSION;
      let newest = null;
      const failures = [];
      for (const candidate of candidateUrls) {
        try {
          const updateUrl = new URL(candidate, document.baseURI);
          updateUrl.searchParams.set("ui_feedback_update", String(Date.now()));
          const response = await fetch(updateUrl.href, { cache: "no-store", credentials: "omit" });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const source2 = await response.text();
          const version = extractToolVersion(source2);
          if (!version) throw new Error("missing version");
          if (!newest || compareVersions(version, newest.version) > 0) {
            newest = { source: source2, version, url: updateUrl.href };
          }
        } catch (error) {
          failures.push(`${candidate}: ${error.message}`);
        }
      }
      if (!newest) {
        throw new Error(`No reachable update mirror. ${failures.join(" | ")}`);
      }
      const { source, version: latestVersion } = newest;
      if (compareVersions(latestVersion, currentVersion) <= 0) {
        feedbackMessage = `UI Feedback \u0111ang \u1EDF b\u1EA3n m\u1EDBi nh\u1EA5t \xB7 v${currentVersion}`;
        return;
      }
      const blobUrl = URL.createObjectURL(new Blob([source], { type: "text/javascript" }));
      try {
        const updatedModule = await import(`${blobUrl}#ui-feedback-${latestVersion}-${Date.now()}`);
        if (typeof updatedModule.createUIFeedback !== "function") throw new Error("Updated module is invalid");
        const preservedOptions = { ...config, version: latestVersion, updateMirrors: config.updateMirrors, updateUrl: config.updateUrl };
        dispose();
        const updatedInstance = updatedModule.createUIFeedback(preservedOptions);
        setTimeout(() => updatedInstance?.notify?.(`\u0110\xE3 c\u1EADp nh\u1EADt UI Feedback l\xEAn v${latestVersion}`), 0);
      } finally {
        URL.revokeObjectURL(blobUrl);
      }
    } catch (error) {
      console.warn("[UI Feedback] Update failed:", error);
      feedbackMessage = "Kh\xF4ng th\u1EC3 c\u1EADp nh\u1EADt tool t\u1EEB c\xE1c mirror. Ki\u1EC3m tra k\u1EBFt n\u1ED1i r\u1ED3i th\u1EED l\u1EA1i.";
    } finally {
      state.updateBusy = false;
      if (root.isConnected) {
        renderToolbar2();
        if (feedbackMessage) showToast(feedbackMessage);
      }
    }
  }
  let lastToolbarAction = "";
  let lastToolbarActionAt = 0;
  function dispatchToolbarAction(action) {
    if (action === "activate") toggle();
    if (action === "list") togglePanel();
    if (action === "undo") undoAction();
    if (action === "comment") toggleMode("comment");
    if (action === "edit") toggleMode("edit");
    if (action === "css") toggleMode("css");
    if (action === "image") toggleMode("image");
    if (action === "update") updateTool();
    if (action === "collapse") {
      state.collapsed = !state.collapsed;
      renderToolbar2();
    }
  }
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
    const now = performance.now();
    if (action === lastToolbarAction && now - lastToolbarActionAt < 500) return;
    lastToolbarAction = action;
    lastToolbarActionAt = now;
    event.preventDefault();
    event.stopPropagation();
    dispatchToolbarAction(action);
  }
  function togglePanel(force) {
    state.panelOpen = typeof force === "boolean" ? force : !state.panelOpen;
    if (!state.panelOpen) {
      renderToolbar2();
      resumePickingIfNeeded();
      return;
    }
    stopPicking();
    renderToolbar2();
    renderPanel();
  }
  function getFilteredComments() {
    return commentsController.getFilteredComments();
  }
  function renderGroupedComments(items) {
    return commentsController.renderGroupedComments(items);
  }
  function renderCategoryOptions(selected = "all") {
    return commentsController.renderCategoryOptions(selected);
  }
  function renderPanel() {
    const mount = root.querySelector("[data-ui-feedback-panel]");
    if (!mount || !state.panelOpen) return;
    const filtered = getFilteredComments();
    const resolvedCount = state.comments.filter((c) => c.resolved).length;
    const openCount = state.comments.filter((c) => !c.resolved && !["edit", "css", "image"].includes(c.type)).length;
    const editCount = state.comments.filter((c) => ["edit", "css", "image"].includes(c.type)).length;
    const content = renderGroupedComments(filtered);
    mount.innerHTML = `<aside class="ui-feedback-panel" aria-label="Danh s\xE1ch feedback">
      <header class="ui-feedback-panel__header" data-panel-drag-handle title="K\xE9o v\xF9ng ti\xEAu \u0111\u1EC1 \u0111\u1EC3 di chuy\u1EC3n c\u1EEDa s\u1ED5"><div class="ui-feedback-window-heading"><span class="ui-feedback-window-grip" aria-hidden="true">${ICONS.grip}</span><div><strong>Feedback</strong><small>${openCount} \u0111ang m\u1EDF \xB7 ${resolvedCount} \u0111\xE3 xong \xB7 ${editCount} ch\u1EC9nh s\u1EEDa <span class="ui-feedback-drag-hint" title="K\xE9o \u0111\u1EC3 di chuy\u1EC3n">K\xE9o</span></small></div></div><span class="ui-feedback-panel__actions">${config.githubRepo ? `<button class="ui-feedback-icon-button" data-panel-action="github" aria-label="T\u1EA1o GitHub Issue" title="T\u1EA1o GitHub Issue">${ICONS.github}</button>` : ""}<button class="ui-feedback-icon-button" data-panel-action="export" aria-label="Xu\u1EA5t Markdown" title="Xu\u1EA5t Markdown">${ICONS.download}</button><button class="ui-feedback-icon-button" data-panel-action="reset-position" aria-label="\u0110\u01B0a c\u1EEDa s\u1ED5 v\u1EC1 v\u1ECB tr\xED m\u1EB7c \u0111\u1ECBnh" title="\u0110\u1EB7t l\u1EA1i v\u1ECB tr\xED">${ICONS.undo}</button><button class="ui-feedback-icon-button" data-panel-action="close" aria-label="\u0110\xF3ng c\u1EEDa s\u1ED5">${ICONS.close}</button></span></header>
      <div class="ui-feedback-panel__tabs" role="tablist"><button class="ui-feedback-panel__tab ${state.drawerTab === "all" ? "is-active" : ""}" data-panel-tab="all" role="tab">T\u1EA5t c\u1EA3 <span>${state.comments.length}</span></button><button class="ui-feedback-panel__tab ${state.drawerTab === "comment" ? "is-active" : ""}" data-panel-tab="comment" role="tab">Ghi ch\xFA <span>${state.comments.filter((c) => c.type === "comment").length}</span></button><button class="ui-feedback-panel__tab ${state.drawerTab === "edit" ? "is-active" : ""}" data-panel-tab="edit" role="tab">Ch\u1EC9nh s\u1EEDa <span>${editCount}</span></button><button class="ui-feedback-panel__tab ${state.drawerTab === "resolved" ? "is-active" : ""}" data-panel-tab="resolved" role="tab">\u0110\xE3 xong <span>${resolvedCount}</span></button></div>
      <div class="ui-feedback-panel__filter">
        <div class="ui-feedback-search-wrap">${ICONS.search}<input class="ui-feedback-search-input" data-panel-search type="text" placeholder="T\xECm feedback\u2026" value="${escapeAttribute(state.searchQuery)}" /></div>
        <select class="ui-feedback-filter-select" data-panel-filter aria-label="L\u1ECDc theo m\u1EE9c \u0111\u1ED9">
          <option value="all" ${state.filterPriority === "all" ? "selected" : ""}>M\u1EE9c \u0111\u1ED9</option>
          <option value="high" ${state.filterPriority === "high" ? "selected" : ""}>Cao</option>
          <option value="medium" ${state.filterPriority === "medium" ? "selected" : ""}>Trung b\xECnh</option>
          <option value="low" ${state.filterPriority === "low" ? "selected" : ""}>Th\u1EA5p</option>
        </select>
        <select class="ui-feedback-filter-select ui-feedback-filter-select--category" data-panel-category aria-label="L\u1ECDc theo ph\xE2n lo\u1EA1i">${renderCategoryOptions(state.filterCategory)}</select>
      </div>
      <div class="ui-feedback-panel__body">${content || `<div class="ui-feedback-empty">${state.searchQuery || state.filterPriority !== "all" || state.filterCategory !== "all" ? "Kh\xF4ng t\xECm th\u1EA5y feedback ph\xF9 h\u1EE3p." : "Ch\u01B0a c\xF3 feedback. Ch\u1ECDn bi\u1EC3u t\u01B0\u1EE3ng comment r\u1ED3i b\u1EA5m v\xE0o m\u1ED9t ph\u1EA7n t\u1EED tr\xEAn trang."}</div>`}</div>
    </aside>`;
    applyPanelPosition();
    mount.onclick = handlePanelClick;
    mount.onpointerdown = handlePanelPointerDown;
    mount.oninput = handlePanelInput;
    mount.onchange = handlePanelChange;
  }
  function applyPanelPosition() {
    return panelController.applyPanelPosition();
  }
  function getWindowDragHandle(event, selector) {
    return panelController.getWindowDragHandle(event, selector);
  }
  function handlePanelPointerDown(event) {
    return panelController.handlePointerDown(event);
  }
  function handlePanelClick(event) {
    const target = event.target.closest("[data-panel-action], [data-panel-tab], [data-edit-comment], [data-delete-comment], [data-resolve-comment], [data-copy-selector], [data-toggle-comment], [data-comment-id]");
    if (!target) return;
    event.stopPropagation();
    if (target.dataset.panelTab) {
      state.drawerTab = target.dataset.panelTab;
      renderPanel();
      return;
    }
    if (target.dataset.toggleComment) {
      state.expandedComments[target.dataset.toggleComment] = !state.expandedComments[target.dataset.toggleComment];
      renderPanel();
      return;
    }
    if (target.dataset.panelAction === "reset-position") {
      state.panelPosition = { x: 0, y: 0 };
      applyPanelPosition();
      showToast("\u0110\xE3 \u0111\u1EB7t l\u1EA1i v\u1ECB tr\xED c\u1EEDa s\u1ED5");
      return;
    }
    if (target.dataset.copySelector) {
      const copyResult = navigator.clipboard?.writeText?.(target.dataset.copySelector);
      Promise.resolve(copyResult).then(() => showToast("\u0110\xE3 copy selector")).catch(() => showToast("Kh\xF4ng th\u1EC3 copy selector"));
      return;
    }
    if (target.dataset.panelAction === "close") togglePanel(false);
    else if (target.dataset.panelAction === "export") exportMarkdown();
    else if (target.dataset.panelAction === "github") createGithubIssue();
    else if (target.dataset.editComment) editComment(target.dataset.editComment);
    else if (target.dataset.deleteComment) deleteComment(target.dataset.deleteComment);
    else if (target.dataset.resolveComment) resolveComment(target.dataset.resolveComment);
    else {
      const card = event.target.closest("[data-comment-id]");
      if (card) focusComment(card.dataset.commentId);
    }
  }
  function handlePanelInput(event) {
    if (event.target.matches("[data-panel-search]")) {
      state.searchQuery = event.target.value;
      const body = root.querySelector(".ui-feedback-panel__body");
      if (body) {
        const filtered = getFilteredComments();
        const content = renderGroupedComments(filtered);
        body.innerHTML = content || `<div class="ui-feedback-empty">${state.searchQuery || state.filterPriority !== "all" ? "Kh\xF4ng t\xECm th\u1EA5y feedback ph\xF9 h\u1EE3p." : "Ch\u01B0a c\xF3 feedback."}</div>`;
      }
    }
  }
  function handlePanelChange(event) {
    if (event.target.matches("[data-panel-filter]")) {
      state.filterPriority = event.target.value;
      renderPanel();
    } else if (event.target.matches("[data-panel-category]")) {
      state.filterCategory = event.target.value;
      renderPanel();
    }
  }
  function getItemCodeLine(item) {
    return commentsController.getItemCodeLine(item);
  }
  function renderItem(item) {
    return commentsController.renderItem(item);
  }
  function clearResumeTimer() {
    return pickerController.clearResumeTimer();
  }
  function beginPicking(mode, opts = {}) {
    return pickerController.beginPicking(mode, opts);
  }
  function stopPicking(opts = {}) {
    return pickerController.stopPicking(opts);
  }
  function resumePickingIfNeeded() {
    return pickerController.resumePickingIfNeeded();
  }
  function clearHighlight() {
    return pickerController.clearHighlight();
  }
  function highlight(element) {
    return pickerController.highlight(element);
  }
  function focusComment(id) {
    const item = state.comments.find((comment) => comment.id === id);
    if (!item) return;
    const element = resolveSelector(item.selector);
    if (!element) {
      showToast("Kh\xF4ng t\xECm th\u1EA5y ph\u1EA7n t\u1EED tr\xEAn trang hi\u1EC7n t\u1EA1i");
      return;
    }
    element.scrollIntoView({ behavior: "smooth", block: "center" });
    highlight(element);
    setTimeout(clearHighlight, 1200);
    showToast("\u0110\xE3 focus \u0111\u1EBFn ph\u1EA7n t\u1EED feedback");
  }
  function placeMarkers() {
    markers.forEach((m) => m.markerEl?.remove());
    markers.length = 0;
    if (!state.active) return;
    state.comments.forEach((comment, index) => {
      let el;
      try {
        el = document.querySelector(comment.selector);
      } catch {
        el = null;
      }
      if (!el) return;
      const marker = document.createElement("div");
      const typeClass = comment.type === "edit" ? " is-edit" : comment.type === "css" ? " is-css" : comment.type === "image" ? " is-image" : "";
      const resolvedClass = comment.resolved ? " is-resolved" : "";
      marker.className = `ui-feedback-marker${typeClass}${resolvedClass}`;
      if (comment.type === "edit") marker.textContent = "\u270E";
      else if (comment.type === "css") marker.textContent = "\u2726";
      else if (comment.type === "image") marker.textContent = "\u25A7";
      else marker.textContent = index + 1;
      marker.title = comment.type === "edit" ? `\u0110\xE3 s\u1EEDa text: ${safeText(comment.value, 80)}` : comment.type === "css" ? `\u0110\xE3 s\u1EEDa CSS: ${safeText(comment.value, 80)}` : comment.type === "image" ? `\u0110\xE3 thay \u1EA3nh: ${safeText(comment.value, 80)}` : `Feedback #${index + 1}`;
      marker.dataset.commentId = comment.id;
      marker.setAttribute("role", "button");
      marker.setAttribute("aria-label", marker.title);
      marker.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        focusComment(comment.id);
      });
      marker.style.position = "absolute";
      positionMarker(el, marker);
      document.body.appendChild(marker);
      markers.push({ element: el, markerEl: marker, commentId: comment.id });
    });
  }
  function positionMarker(el, marker) {
    const rect = el.getBoundingClientRect();
    marker.style.top = `${window.scrollY + rect.top - 8}px`;
    marker.style.left = `${window.scrollX + rect.left - 8}px`;
  }
  function refreshMarkerPositions() {
    markers.forEach((m) => {
      if (m.element && m.markerEl) positionMarker(m.element, m.markerEl);
    });
  }
  function clearMarkers() {
    markers.forEach((m) => m.markerEl?.remove());
    markers.length = 0;
  }
  function openModal(element, mode, existing = null) {
    stopPicking();
    state.target = element;
    state.mode = mode;
    state.modalSnapshot = mode === "css" ? { styleCssText: element?.style?.cssText || "" } : mode === "image" ? captureImageState(element) : null;
    state.modalImageSource = mode === "image" ? state.modalSnapshot?.src || "" : "";
    const initialPosition = mode === "image" ? state.modalSnapshot?.objectPosition || state.modalSnapshot?.effectiveObjectPosition || state.modalSnapshot?.backgroundPosition || state.modalSnapshot?.effectiveBackgroundPosition || "50% 50%" : "50% 50%";
    state.modalImagePosition = mode === "image" ? parseImagePosition(initialPosition) : { x: 50, y: 50 };
    state.modalCommitted = false;
    state.cssTab = mode === "css" ? "colors" : "advanced";
    state.cssTransformBase = mode === "css" ? element?.style?.transform || "" : "";
    state.cssPosition = mode === "css" ? parseTranslatePosition(element?.style?.translate || element?.style?.transform || (element ? getComputedStyle(element).translate : "") || (element ? getComputedStyle(element).transform : "") || "") : { x: 0, y: 0 };
    state.modalImageZoom = 100;
    state.modalPosition = { x: 0, y: 0 };
    state.modalOpen = true;
    renderToolbar2();
    renderModal(existing);
    setTimeout(() => root.querySelector("[data-feedback-input]")?.focus(), 0);
  }
  function ensureGoogleFont(fontName) {
    return cssEditor.ensureGoogleFont(fontName);
  }
  function normalizeColor(value, fallback = "#ffffff") {
    return cssEditor.normalizeColor(value, fallback);
  }
  function readCssValue(prop, fallback = "") {
    return cssEditor.readCssValue(prop, fallback);
  }
  function applyCssProperty(prop, value) {
    return cssEditor.applyCssProperty(prop, value);
  }
  function imageBackgroundSource(value) {
    return imageEditor.imageBackgroundSource(value);
  }
  function parseTranslatePosition(value) {
    return cssEditor.parseTranslatePosition(value);
  }
  function applyCssPosition(position = state.cssPosition) {
    return cssEditor.applyCssPosition(position);
  }
  function applyModalPosition() {
    return modalController.applyModalPosition();
  }
  function updateCssPositionFromPointer(clientX, clientY) {
    return cssEditor.updatePositionFromPointer(clientX, clientY);
  }
  function parseImagePosition(value) {
    return imageEditor.parseImagePosition(value);
  }
  function captureImageState(element) {
    return imageEditor.captureImageState(element);
  }
  function applyImageSource(element, source) {
    return imageEditor.applyImageSource(element, source);
  }
  function applyImagePosition(element, position = { x: 50, y: 50 }) {
    return imageEditor.applyImagePosition(element, position);
  }
  function applyImageState(element, snapshot) {
    return imageEditor.applyImageState(element, snapshot);
  }
  function restoreImageState(element, snapshot) {
    return imageEditor.restoreImageState(element, snapshot);
  }
  function validateImageSource(source) {
    return imageEditor.validateImageSource(source);
  }
  function renderCssColorCard(field) {
    const current = normalizeColor(readCssValue(field.prop), field.fallback);
    return `<div class="ui-feedback-theme-card" data-css-card="${field.key}"><span class="ui-feedback-theme-card__swatch" style="background:${current}"></span><div class="ui-feedback-theme-card__copy"><span class="ui-feedback-theme-card__label">${field.label}</span><span class="ui-feedback-theme-card__hint">${field.hint}</span></div><input type="color" data-css-color="${field.prop}" data-css-key="${field.key}" value="${current}" aria-label="${field.label}" /><input type="text" data-css-hex="${field.prop}" data-css-key="${field.key}" value="${current}" maxlength="7" aria-label="M\xE3 m\xE0u ${field.label}" /></div>`;
  }
  function renderFontRow(label, prop) {
    const current = String(readCssValue(prop, "") || "").replace(/^['"]|['"]$/g, "");
    const selected = FONT_OPTIONS.find((font) => current.toLowerCase().includes(font.value.toLowerCase()) && font.value);
    const value = selected?.value || "";
    return `<div class="ui-feedback-font-row"><div class="ui-feedback-font-row__copy"><span class="ui-feedback-font-row__label">${label}</span><span class="ui-feedback-font-row__value">${escapeHtml(value || "M\u1EB7c \u0111\u1ECBnh c\u1EE7a website")}</span></div><select data-css-font="${prop}" aria-label="Font ${label}">${FONT_OPTIONS.map((font) => `<option value="${escapeAttribute(font.value)}" ${font.value === value ? "selected" : ""}>${font.label}</option>`).join("")}</select></div>`;
  }
  function cssNumberValue(prop, fallback = 0) {
    const parsed = parseFloat(readCssValue(prop, ""));
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  function renderCssRange(label, prop, min, max, step, unit, fallback, formatter = (value) => `${value}${unit}`) {
    const value = Math.max(min, Math.min(max, cssNumberValue(prop, fallback)));
    const output = formatter(value);
    return `<div class="ui-feedback-range-row"><div class="ui-feedback-range-row__head"><span>${label}</span><output data-css-output="${prop}">${output}</output></div><input type="range" min="${min}" max="${max}" step="${step}" data-css-range-prop="${prop}" data-css-range-unit="${unit}" data-css-range-output="${prop}" value="${value}" aria-label="${label}" /></div>`;
  }
  function renderCssSelect(label, prop, options2, fallback) {
    const current = String(readCssValue(prop, fallback) || fallback);
    return `<label class="ui-feedback-css-select-row"><span>${label}</span><select data-css-select-prop="${prop}" aria-label="${label}">${options2.map((option) => `<option value="${escapeAttribute(option.value)}" ${option.value === current ? "selected" : ""}>${escapeHtml(option.label)}</option>`).join("")}</select></label>`;
  }
  function renderSpacingGroup(label, prop) {
    return `<div class="ui-feedback-css-subsection"><div class="ui-feedback-css-subtitle">${label}</div><div class="ui-feedback-spacing-grid">${CSS_SPACING_SIDES.map((side) => {
      const cssProp = `${prop}${side.prop}`;
      const value = Math.max(0, Math.min(160, cssNumberValue(cssProp, 0)));
      return `<label><span>${side.label}</span><input type="number" min="0" max="160" step="1" data-css-spacing="${cssProp}" value="${Math.round(value)}" inputmode="numeric" aria-label="${label} ${side.label}" /><output>${Math.round(value)}px</output></label>`;
    }).join("")}</div></div>`;
  }
  function renderTextAlign() {
    const current = String(readCssValue("textAlign", "left") || "left");
    return `<div class="ui-feedback-css-subsection"><div class="ui-feedback-css-subtitle">C\u0103n ch\u1EEF</div><div class="ui-feedback-align-grid" role="group" aria-label="C\u0103n ch\u1EEF">${TEXT_ALIGN_OPTIONS.map((option) => `<button type="button" class="ui-feedback-align-button ${current === option.value ? "is-active" : ""}" data-css-align="${option.value}" aria-label="${option.label}" aria-pressed="${current === option.value}"><span aria-hidden="true">${option.icon}</span><small>${option.label}</small></button>`).join("")}</div></div>`;
  }
  function colorToHex(value, fallback = "#000000") {
    const raw = String(value || "").trim();
    if (/^#[0-9a-f]{6}$/i.test(raw)) return raw.toLowerCase();
    if (/^#[0-9a-f]{3}$/i.test(raw)) return raw.replace(/^#(.)(.)(.)$/, "#$1$1$2$2$3$3").toLowerCase();
    const match = raw.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (match) return `#${[match[1], match[2], match[3]].map((part) => Number(part).toString(16).padStart(2, "0")).join("")}`;
    return fallback;
  }
  function parseShadow(value) {
    const raw = String(value || "").trim();
    const match = raw.match(/^(inset\s+)?(-?\d+(?:\.\d+)?)px\s+(-?\d+(?:\.\d+)?)px\s+(\d+(?:\.\d+)?)px(?:\s+(-?\d+(?:\.\d+)?)px)?\s+(rgba?\([^)]*\)|#[0-9a-f]{3,8}|[a-z]+)$/i);
    if (!match) return { inset: false, x: 0, y: 10, blur: 30, spread: 0, color: "#000000" };
    return { inset: Boolean(match[1]), x: Number(match[2]), y: Number(match[3]), blur: Number(match[4]), spread: Number(match[5] || 0), color: colorToHex(match[6]) };
  }
  function shadowCss(shadow2) {
    return `${shadow2.inset ? "inset " : ""}${Math.round(shadow2.x)}px ${Math.round(shadow2.y)}px ${Math.round(shadow2.blur)}px ${Math.round(shadow2.spread)}px ${shadow2.color}`;
  }
  function renderShadowEditor() {
    const shadow2 = parseShadow(readCssValue("boxShadow", "none"));
    const range = (label, key, min, max, value) => `<label class="ui-feedback-css-mini-range"><span>${label}</span><input type="range" min="${min}" max="${max}" step="1" data-css-shadow="${key}" value="${value}" aria-label="${label}" /><output data-css-shadow-output="${key}">${value}px</output></label>`;
    return `<div class="ui-feedback-css-subsection"><div class="ui-feedback-css-subtitle">Box-shadow tr\u1EF1c quan</div>${range("X", "x", -40, 40, Math.round(shadow2.x))}${range("Y", "y", -40, 40, Math.round(shadow2.y))}${range("Blur", "blur", 0, 80, Math.round(shadow2.blur))}${range("Spread", "spread", -20, 40, Math.round(shadow2.spread))}<label class="ui-feedback-css-color-inline"><span>M\xE0u shadow</span><input type="color" data-css-shadow="color" value="${shadow2.color}" aria-label="M\xE0u shadow" /></label><label class="ui-feedback-checkbox"><input type="checkbox" data-css-shadow="inset" ${shadow2.inset ? "checked" : ""} /> <span>Inset</span></label><button type="button" class="ui-feedback-button ui-feedback-css-reset" data-css-shadow-reset>\u0110\u1EB7t l\u1EA1i shadow</button></div>`;
  }
  function renderRadiusEditor() {
    const sides = [["borderTopLeftRadius", "Tr\xEAn tr\xE1i"], ["borderTopRightRadius", "Tr\xEAn ph\u1EA3i"], ["borderBottomRightRadius", "D\u01B0\u1EDBi ph\u1EA3i"], ["borderBottomLeftRadius", "D\u01B0\u1EDBi tr\xE1i"]];
    return `<div class="ui-feedback-css-subsection"><div class="ui-feedback-css-subtitle">Bo g\xF3c t\u1EEBng c\u1EA1nh</div>${sides.map(([prop, label]) => renderCssRange(label, prop, 0, 48, 1, "px", 0)).join("")}</div>`;
  }
  function renderBorderSides() {
    const sides = [["borderTop", "Tr\xEAn"], ["borderRight", "Ph\u1EA3i"], ["borderBottom", "D\u01B0\u1EDBi"], ["borderLeft", "Tr\xE1i"]];
    const styles = [{ value: "none", label: "None" }, { value: "solid", label: "Solid" }, { value: "dashed", label: "Dashed" }, { value: "dotted", label: "Dotted" }];
    return `<div class="ui-feedback-css-subsection"><div class="ui-feedback-css-subtitle">Vi\u1EC1n t\u1EEBng c\u1EA1nh</div>${sides.map(([prefix, label]) => `<div class="ui-feedback-css-side-row"><strong>${label}</strong>${renderCssRange("\u0110\u1ED9 d\xE0y", `${prefix}Width`, 0, 12, 1, "px", 0)}${renderCssSelect("Ki\u1EC3u", `${prefix}Style`, styles, "solid")}</div>`).join("")}</div>`;
  }
  function colorWithAlpha(value, alpha) {
    const hex = colorToHex(value);
    const rgb = hex.slice(1).match(/../g).map((part) => parseInt(part, 16));
    return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${Math.max(0, Math.min(1, Number(alpha))).toFixed(2)})`;
  }
  function colorAlpha(value) {
    const match = String(value || "").match(/rgba?\([^,]+,[^,]+,[^,]+(?:,\s*([0-9.]+))?\)/i);
    return match?.[1] === void 0 ? 1 : Number(match[1]);
  }
  function renderAdvancedCss() {
    const currentColor = readCssValue("color", "#ffffff");
    const alpha = Math.round(colorAlpha(currentColor) * 100);
    return `<div class="ui-feedback-css-section"><div class="ui-feedback-css-section__title">N\xE2ng cao</div><p class="ui-feedback-css-help">Tinh ch\u1EC9nh c\xE1c thu\u1ED9c t\xEDnh th\u01B0\u1EDDng d\xF9ng khi debug component v\xE0 l\u1EDBp ch\u1ED3ng.</p>${renderShadowEditor()}${renderRadiusEditor()}${renderBorderSides()}<div class="ui-feedback-css-subsection"><div class="ui-feedback-css-subtitle">L\u1EDBp & \u0111\u1ED9 trong su\u1ED1t ch\u1EEF</div><label class="ui-feedback-css-text-row"><span>Z-index</span><input type="number" min="-1000" max="1000" step="1" data-css-number-prop="zIndex" value="${Number(readCssValue("zIndex", 0)) || 0}" inputmode="numeric" /></label>${renderCssRange("Alpha m\xE0u ch\u1EEF", "colorAlpha", 0, 100, 1, "%", alpha, (value) => `${Math.round(value)}%`)}</div></div>`;
  }
  function cssShadowState() {
    return parseShadow(readCssValue("boxShadow", "none"));
  }
  function renderCssContent() {
    const tab = state.cssTab || "colors";
    const tabs = [
      ["preset", "\u2726 B\u1ED9 c\xF3 s\u1EB5n"],
      ["colors", "\u25CF M\xE0u s\u1EAFc"],
      ["typography", "T Ch\u1EEF"],
      ["spacing", "\u2194 Kho\u1EA3ng c\xE1ch"],
      ["position", "\u2316 V\u1ECB tr\xED"],
      ["advanced", "\u2726 N\xE2ng cao"]
    ];
    const presets = `<div class="ui-feedback-css-section"><div class="ui-feedback-css-section__title">B\u1ED9 c\xF3 s\u1EB5n</div><p class="ui-feedback-css-help">Ch\u1ECDn nhanh m\u1ED9t phong c\xE1ch, sau \u0111\xF3 tinh ch\u1EC9nh t\u1EEBng gi\xE1 tr\u1ECB \u1EDF c\xE1c tab b\xEAn c\u1EA1nh.</p><div class="ui-feedback-css-presets"><button class="ui-feedback-css-preset" data-css-preset="clean" type="button"><span>G\u1ECDn g\xE0ng</span><small>Kh\xF4ng b\xF3ng, bo 4px</small></button><button class="ui-feedback-css-preset" data-css-preset="soft" type="button"><span>Soft UI</span><small>Bo 14px, \u0111\u1ED5 b\xF3ng nh\u1EB9</small></button><button class="ui-feedback-css-preset" data-css-preset="focus" type="button"><span>Focus accent</span><small>Vi\u1EC1n accent n\u1ED5i b\u1EADt</small></button></div></div>`;
    const colors = `<div class="ui-feedback-css-section"><div class="ui-feedback-css-section__title">M\xE0u s\u1EAFc</div>${CSS_COLOR_FIELDS.map(renderCssColorCard).join("")}<details class="ui-feedback-more-colors"><summary>\u2304 Th\xEAm 8 m\xE0u kh\xE1c</summary><div style="margin-top:6px">${EXTRA_COLOR_FIELDS.map(renderCssColorCard).join("")}</div></details></div><div class="ui-feedback-css-section"><div class="ui-feedback-css-section__title">B\u1EC1 m\u1EB7t & vi\u1EC1n</div>${renderCssRange("Border radius", "borderRadius", 0, 32, 1, "px", 0)}${renderCssRange("Border width", "borderWidth", 0, 12, 1, "px", 0)}${renderCssSelect("Border style", "borderStyle", [{ value: "none", label: "None" }, { value: "solid", label: "Solid" }, { value: "dashed", label: "Dashed" }, { value: "dotted", label: "Dotted" }], "solid")}${renderCssRange("Opacity", "opacity", 0, 100, 1, "%", 100, (value) => `${Math.round(value)}%`)}</div>`;
    const typography = `<div class="ui-feedback-css-section"><div class="ui-feedback-css-section__title">Typography</div>${renderFontRow("Font ch\u1EEF (Google Fonts)", "fontFamily")}${renderCssRange("C\u1EE1 ch\u1EEF", "fontSize", 10, 72, 1, "px", 16)}${renderCssSelect("\u0110\u1ED9 \u0111\u1EADm", "fontWeight", FONT_WEIGHT_OPTIONS, "400")}${renderCssRange("Line height", "lineHeight", 1, 2, 0.05, "", 1.5, (value) => Number(value).toFixed(2))}${renderCssRange("Letter spacing", "letterSpacing", -2, 4, 0.1, "px", 0, (value) => `${Number(value).toFixed(1)}px`)}${renderTextAlign()}${renderCssSelect("Bi\u1EBFn \u0111\u1ED5i ch\u1EEF", "textTransform", [{ value: "none", label: "Gi\u1EEF nguy\xEAn" }, { value: "uppercase", label: "UPPERCASE" }, { value: "capitalize", label: "Capitalize" }, { value: "lowercase", label: "lowercase" }], "none")}</div>`;
    const spacing = `<div class="ui-feedback-css-section"><div class="ui-feedback-css-section__title">Kho\u1EA3ng c\xE1ch & k\xEDch th\u01B0\u1EDBc</div><p class="ui-feedback-css-help">\u0110\u1ED5i t\u1EEBng c\u1EA1nh tr\u1EF1c ti\u1EBFp. Gi\xE1 tr\u1ECB \u0111\u01B0\u1EE3c \xE1p d\u1EE5ng theo px \u0111\u1EC3 d\u1EC5 ki\u1EC3m so\xE1t khi review.</p>${renderSpacingGroup("Padding", "padding")}${renderSpacingGroup("Margin", "margin")}<div class="ui-feedback-css-subsection"><div class="ui-feedback-css-subtitle">Chi\u1EC1u r\u1ED9ng</div><label class="ui-feedback-css-text-row"><span>Width</span><input type="text" data-css-text-prop="width" value="${escapeAttribute(readCssValue("width", "auto"))}" placeholder="auto \xB7 320px \xB7 80%" /></label><label class="ui-feedback-css-text-row"><span>Max-width</span><input type="text" data-css-text-prop="maxWidth" value="${escapeAttribute(readCssValue("maxWidth", "none"))}" placeholder="none \xB7 720px \xB7 100%" /></label></div><div class="ui-feedback-css-subsection"><div class="ui-feedback-css-subtitle">B\xF3ng n\xE2ng cao</div><label class="ui-feedback-css-text-row"><span>Box shadow</span><input type="text" data-css-text-prop="boxShadow" value="${escapeAttribute(readCssValue("boxShadow", "none"))}" placeholder="0 10px 30px rgba(0,0,0,.12)" /></label></div></div>`;
    const position = `<div class="ui-feedback-css-section"><div class="ui-feedback-css-section__title">V\u1ECB tr\xED 2D</div><div class="ui-feedback-position-pad" data-css-position-pad tabindex="0" aria-label="\u0110i\u1EC1u ch\u1EC9nh v\u1ECB tr\xED X Y"></div><div class="ui-feedback-position-sliders"><label><span>X</span><input type="range" min="-200" max="200" step="1" data-css-x value="${Math.round(state.cssPosition.x)}" /><output data-css-x-output>${Math.round(state.cssPosition.x)}px</output></label><label><span>Y</span><input type="range" min="-200" max="200" step="1" data-css-y value="${Math.round(state.cssPosition.y)}" /><output data-css-y-output>${Math.round(state.cssPosition.y)}px</output></label></div><div class="ui-feedback-position-inputs"><label><span>X (px)</span><input type="number" min="-200" max="200" step="1" data-css-x-number value="${Math.round(state.cssPosition.x)}" inputmode="numeric" /></label><label><span>Y (px)</span><input type="number" min="-200" max="200" step="1" data-css-y-number value="${Math.round(state.cssPosition.y)}" inputmode="numeric" /></label></div><button class="ui-feedback-button ui-feedback-css-reset" data-css-position-reset type="button">\u0110\u1EB7t l\u1EA1i (0,0)</button></div><button class="ui-feedback-button ui-feedback-css-reset" data-css-reset type="button">\u21B6 Kh\xF4i ph\u1EE5c m\u1EB7c \u0111\u1ECBnh</button>`;
    const advanced = renderAdvancedCss();
    const content = { preset: presets, colors, typography, spacing, position, advanced }[tab] || colors;
    return `<div class="ui-feedback-css-tabs" role="tablist" aria-label="Nh\xF3m thu\u1ED9c t\xEDnh CSS">${tabs.map(([value, label]) => `<button class="ui-feedback-css-tab ${tab === value ? "is-active" : ""}" data-css-tab="${value}" type="button" role="tab" aria-selected="${tab === value}">${label}</button>`).join("")}</div>${content}`;
  }
  function renderImageContent() {
    const snapshot = state.modalSnapshot || captureImageState(state.target);
    const source = state.modalImageSource || snapshot.src || "";
    const position = state.modalImagePosition || { x: 50, y: 50 };
    const zoom = state.modalImageZoom || 100;
    const positionStyle = `object-position:${position.x}% ${position.y}%;transform:scale(${zoom / 100});`;
    const preview = source ? `<img data-image-preview src="${escapeAttribute(source)}" alt="\u1EA2nh preview" style="${positionStyle}" />` : "<span data-image-preview>Ph\u1EA7n t\u1EED n\xE0y ch\u01B0a c\xF3 \u1EA3nh URL tr\u1EF1c ti\u1EBFp. H\xE3y nh\u1EADp URL ho\u1EB7c ch\u1ECDn file.</span>";
    return `<div class="ui-feedback-image-block"><div class="ui-feedback-image-heading"><div><strong>Block: ${escapeHtml(targetLabel(state.target))}</strong><small>\u0110\u01B0\u1EDDng d\u1EABn \u1EA3nh \xB7 ${escapeHtml(safeText(cssPath(state.target), 90))}</small></div><span class="ui-feedback-image-state">${source && source !== snapshot.src ? "\u0111\xE3 \u0111\u1ED5i" : "ch\u01B0a \u0111\u1ED5i"}</span></div><div class="ui-feedback-image-preview" data-image-canvas aria-label="K\xE9o \u1EA3nh \u0111\u1EC3 c\u0103n ch\u1EC9nh">${preview}<span class="ui-feedback-image-canvas-hint">K\xE9o \u0111\u1EC3 c\u0103n ch\u1EC9nh</span></div><div class="ui-feedback-image-zoom"><button type="button" data-image-zoom-step="-" aria-label="Thu nh\u1ECF \u1EA3nh">\u2212</button><input type="range" min="30" max="300" step="5" data-image-zoom value="${zoom}" aria-label="Zoom \u1EA3nh" /><button type="button" data-image-zoom-step="+" aria-label="Ph\xF3ng to \u1EA3nh">+</button><output data-image-zoom-output>${zoom}%</output></div><div class="ui-feedback-image-position"><span>V\u1ECB tr\xED \u1EA3nh</span><output data-image-position>${Math.round(position.x)}% \xB7 ${Math.round(position.y)}%</output></div><label class="ui-feedback-label" for="ui-feedback-image-url">URL \u1EA3nh</label><input id="ui-feedback-image-url" class="ui-feedback-image-url" data-feedback-input data-image-url value="${escapeAttribute(source)}" placeholder="https://example.com/image.jpg" type="url" /><button type="button" class="ui-feedback-image-paste" data-image-paste>D\xE1n \u1EA3nh t\u1EEB clipboard (Ctrl/Cmd + V)</button><label class="ui-feedback-label" for="ui-feedback-image-file">Ho\u1EB7c upload t\u1EEB m\xE1y</label><input id="ui-feedback-image-file" class="ui-feedback-image-upload" data-image-file type="file" accept="image/*" /><small class="ui-feedback-image-original">URL g\u1ED1c: ${escapeHtml(safeText(snapshot.src || snapshot.backgroundImage || "Kh\xF4ng c\xF3", 150))}</small><small class="ui-feedback-image-original">Upload local \u0111\u01B0\u1EE3c gi\u1EEF t\u1ED1i \u0111a 1 MB \u0111\u1EC3 tr\xE1nh l\xE0m \u0111\u1EA7y localStorage.</small></div>`;
  }
  function renderModal(existing = null) {
    const mount = root.querySelector("[data-ui-feedback-modal]");
    if (!mount || !state.modalOpen) return;
    const isEdit = state.mode === "edit";
    const isCss = state.mode === "css";
    const isImage = state.mode === "image";
    const currentText = existing?.comment || (isEdit ? safeText(state.target?.textContent, 500) : "");
    const priorityValue = existing?.priority || "medium";
    const title = isEdit ? "S\u1EEDa n\u1ED9i dung UI" : isCss ? "B\u1ED9 giao di\u1EC7n" : isImage ? "Thay \u1EA3nh" : "Ghi ch\xFA feedback";
    const commentContent = isEdit ? `<label class="ui-feedback-label" for="ui-feedback-input">N\u1ED9i dung hi\u1EC3n th\u1ECB</label><input class="ui-feedback-field" data-feedback-input value="${escapeAttribute(currentText)}" />` : isCss ? renderCssContent() : isImage ? renderImageContent() : `<label class="ui-feedback-label" for="ui-feedback-input">Element n\xE0y c\u1EA7n s\u1EEDa g\xEC?</label><textarea class="ui-feedback-textarea" data-feedback-input placeholder="V\xED d\u1EE5: T\u0103ng kho\u1EA3ng c\xE1ch gi\u1EEFa ti\xEAu \u0111\u1EC1 v\xE0 danh s\xE1ch\u2026">${escapeHtml(currentText)}</textarea><div class="ui-feedback-form-row"><div><label class="ui-feedback-label" for="ui-feedback-priority">M\u1EE9c \u0111\u1ED9 \u01B0u ti\xEAn</label><select id="ui-feedback-priority" class="ui-feedback-select" data-feedback-priority><option value="high" ${priorityValue === "high" ? "selected" : ""}>Cao</option><option value="medium" ${priorityValue === "medium" ? "selected" : ""}>Trung b\xECnh</option><option value="low" ${priorityValue === "low" ? "selected" : ""}>Th\u1EA5p</option></select></div><div><label class="ui-feedback-label" for="ui-feedback-category">Ph\xE2n lo\u1EA1i</label><select id="ui-feedback-category" class="ui-feedback-select" data-feedback-category>${renderCategoryOptions(existing?.category || "other")}</select></div></div>`;
    const footer = isImage ? `<button class="ui-feedback-button" data-modal-action="cancel">\u0110\xF3ng</button><button class="ui-feedback-button" data-modal-action="reset-position" title="\u0110\u01B0a c\u1EEDa s\u1ED5 v\u1EC1 v\u1ECB tr\xED m\u1EB7c \u0111\u1ECBnh">\u0110\u1EB7t l\u1EA1i v\u1ECB tr\xED</button><button class="ui-feedback-button" data-image-restore type="button">Kh\xF4i ph\u1EE5c</button><button class="ui-feedback-button ui-feedback-button--primary" data-modal-action="save">L\u01B0u \u1EA3nh</button>` : `<button class="ui-feedback-button" data-modal-action="cancel">H\u1EE7y</button><button class="ui-feedback-button" data-modal-action="reset-position" title="\u0110\u01B0a c\u1EEDa s\u1ED5 v\u1EC1 v\u1ECB tr\xED m\u1EB7c \u0111\u1ECBnh">\u0110\u1EB7t l\u1EA1i v\u1ECB tr\xED</button><button class="ui-feedback-button ui-feedback-button--primary" data-modal-action="save">L\u01B0u</button>`;
    const modalClass = isCss || isImage ? "ui-feedback-modal is-inspector" : "ui-feedback-modal is-mini";
    mount.innerHTML = `<div class="ui-feedback-scrim" data-modal-action="cancel"></div><section class="${modalClass}" role="dialog" aria-modal="true" aria-labelledby="ui-feedback-title"><div class="ui-feedback-modal__top" data-modal-drag-handle title="K\xE9o v\xF9ng ti\xEAu \u0111\u1EC1 \u0111\u1EC3 di chuy\u1EC3n c\u1EEDa s\u1ED5"><div class="ui-feedback-window-heading"><span class="ui-feedback-window-grip" aria-hidden="true">${ICONS.grip}</span><div><span class="ui-feedback-drag-hint">K\xE9o \u0111\u1EC3 di chuy\u1EC3n</span><h2 id="ui-feedback-title">${title}</h2><p>${escapeHtml(targetLabel(state.target))} \xB7 ${escapeHtml(safeText(cssPath(state.target), 90))}</p></div></div></div><div class="ui-feedback-modal__content">${commentContent}</div><footer class="ui-feedback-modal__footer">${footer}</footer></section>`;
    applyModalPosition();
    mount.onclick = handleModalClick;
    mount.onpointerdown = handleModalPointerDown;
    mount.oninput = handleModalInput;
    mount.onchange = handleModalChange;
    mount.onkeydown = handleModalKeydown;
    mount.onwheel = handleModalWheel;
  }
  function applyPreviewImagePosition() {
    const preview = root.querySelector("[data-image-preview]");
    const position = state.modalImagePosition || { x: 50, y: 50 };
    if (preview?.tagName?.toLowerCase() === "img") preview.style.objectPosition = `${position.x}% ${position.y}%`;
    const output = root.querySelector("[data-image-position]");
    if (output) output.textContent = `${Math.round(position.x)}% \xB7 ${Math.round(position.y)}%`;
  }
  function previewImageSource(source) {
    const preview = root.querySelector("[data-image-preview]");
    if (!preview) return;
    if (!source) {
      preview.outerHTML = "<span data-image-preview>H\xE3y nh\u1EADp URL ho\u1EB7c ch\u1ECDn file \u0111\u1EC3 xem preview.</span>";
      return;
    }
    if (preview.tagName?.toLowerCase() === "img") preview.src = source;
    else preview.outerHTML = `<img data-image-preview src="${escapeAttribute(source)}" alt="\u1EA2nh preview" style="object-position:${state.modalImagePosition?.x || 50}% ${state.modalImagePosition?.y || 50}%;" />`;
    applyPreviewImagePosition();
  }
  function applyCssPreset(name) {
    if (!state.target) return;
    if (name === "clean") {
      applyCssProperty("borderRadius", "4px");
      applyCssProperty("boxShadow", "none");
      applyCssProperty("borderWidth", "1px");
    } else if (name === "soft") {
      applyCssProperty("borderRadius", "14px");
      applyCssProperty("boxShadow", "0 10px 30px rgba(0,0,0,.12)");
    } else if (name === "focus") {
      applyCssProperty("borderColor", config.accent);
      applyCssProperty("outlineColor", config.accent);
      applyCssProperty("outlineStyle", "solid");
      applyCssProperty("outlineWidth", "2px");
      applyCssProperty("outlineOffset", "2px");
    }
    renderModal();
  }
  let imageDragState = null;
  let modalDragState = null;
  function updateModalPositionFromPointer(clientX, clientY) {
    if (!modalDragState || !state.modalOpen) return;
    const maxX = Math.max(0, window.innerWidth - 80);
    const maxY = Math.max(0, window.innerHeight - 80);
    state.modalPosition = {
      x: Math.max(-maxX, Math.min(maxX, modalDragState.x + clientX - modalDragState.clientX)),
      y: Math.max(-maxY, Math.min(maxY, modalDragState.y + clientY - modalDragState.clientY))
    };
    applyModalPosition();
  }
  function updateImagePositionFromPointer(clientX, clientY) {
    if (!imageDragState || !state.modalOpen || state.mode !== "image") return;
    const rect = imageDragState.canvas.getBoundingClientRect();
    const position = {
      x: Math.max(0, Math.min(100, (clientX - rect.left) / rect.width * 100)),
      y: Math.max(0, Math.min(100, (clientY - rect.top) / rect.height * 100))
    };
    state.modalImagePosition = position;
    applyPreviewImagePosition();
    applyImagePosition(state.target, position);
  }
  function handleModalPointerDown(event) {
    return modalController.handlePointerDown(event);
  }
  function applyPreviewImageZoom() {
    const preview = root.querySelector("[data-image-preview]");
    const zoom = state.modalImageZoom || 100;
    if (preview?.tagName?.toLowerCase() === "img") preview.style.transform = `scale(${zoom / 100})`;
    const output = root.querySelector("[data-image-zoom-output]");
    if (output) output.textContent = `${zoom}%`;
  }
  function handleModalWheel(event) {
    if (state.mode !== "image" || !event.target.closest("[data-image-canvas]")) return;
    event.preventDefault();
    state.modalImageZoom = Math.max(30, Math.min(300, (state.modalImageZoom || 100) + (event.deltaY < 0 ? 10 : -10)));
    const input = root.querySelector("[data-image-zoom]");
    if (input) input.value = state.modalImageZoom;
    applyPreviewImageZoom();
  }
  async function pasteImageFromClipboard() {
    if (!navigator.clipboard?.read) {
      showToast("Tr\xECnh duy\u1EC7t ch\u01B0a cho ph\xE9p \u0111\u1ECDc clipboard");
      return;
    }
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const type = item.types.find((value) => value.startsWith("image/"));
        if (type) {
          const blob = await item.getType(type);
          loadImageFile(blob);
          return;
        }
      }
      showToast("Clipboard ch\u01B0a c\xF3 d\u1EEF li\u1EC7u \u1EA3nh");
    } catch {
      showToast("Kh\xF4ng th\u1EC3 \u0111\u1ECDc \u1EA3nh t\u1EEB clipboard");
    }
  }
  function loadImageFile(file) {
    if (!file?.type?.startsWith("image/")) {
      showToast("Vui l\xF2ng ch\u1ECDn file \u1EA3nh");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const source = String(reader.result || "");
      if (!validateImageSource(source)) {
        showToast("\u1EA2nh upload v\u01B0\u1EE3t gi\u1EDBi h\u1EA1n 1 MB");
        return;
      }
      state.modalImageSource = source;
      const urlInput = root.querySelector("[data-image-url]");
      if (urlInput) urlInput.value = source;
      previewImageSource(source);
    };
    reader.readAsDataURL(file);
  }
  function handleModalClick(event) {
    const zoomStep = event.target.closest("[data-image-zoom-step]");
    if (zoomStep) {
      event.stopPropagation();
      state.modalImageZoom = Math.max(30, Math.min(300, (state.modalImageZoom || 100) + (zoomStep.dataset.imageZoomStep === "+" ? 15 : -15)));
      const input = root.querySelector("[data-image-zoom]");
      if (input) input.value = state.modalImageZoom;
      applyPreviewImageZoom();
      return;
    }
    const paste = event.target.closest("[data-image-paste]");
    if (paste) {
      event.stopPropagation();
      pasteImageFromClipboard();
      return;
    }
    const positionReset = event.target.closest("[data-css-position-reset]");
    if (positionReset) {
      event.stopPropagation();
      applyCssPosition({ x: 0, y: 0 });
      return;
    }
    const align = event.target.closest("[data-css-align]");
    if (align) {
      event.stopPropagation();
      applyCssProperty("textAlign", align.dataset.cssAlign);
      renderModal();
      return;
    }
    const tab = event.target.closest("[data-css-tab]");
    if (tab) {
      event.stopPropagation();
      state.cssTab = tab.dataset.cssTab;
      renderModal();
      return;
    }
    const preset = event.target.closest("[data-css-preset]");
    if (preset) {
      event.stopPropagation();
      applyCssPreset(preset.dataset.cssPreset);
      return;
    }
    const shadowReset = event.target.closest("[data-css-shadow-reset]");
    if (shadowReset) {
      event.stopPropagation();
      applyCssProperty("boxShadow", "none");
      renderModal();
      return;
    }
    const reset = event.target.closest("[data-css-reset]");
    if (reset && state.target && state.modalSnapshot) {
      event.stopPropagation();
      state.target.style.cssText = state.modalSnapshot.styleCssText || "";
      renderModal();
      return;
    }
    const restore = event.target.closest("[data-image-restore]");
    if (restore && state.target && state.modalSnapshot) {
      event.stopPropagation();
      restoreImageState(state.target, state.modalSnapshot);
      state.modalImageSource = state.modalSnapshot.src || "";
      renderModal();
      return;
    }
    const target = event.target.closest("[data-modal-action]");
    if (!target) return;
    event.stopPropagation();
    if (target.dataset.modalAction === "cancel") closeModal(true);
    else if (target.dataset.modalAction === "reset-position") {
      state.modalPosition = { x: 0, y: 0 };
      applyModalPosition();
      showToast("\u0110\xE3 \u0111\u1EB7t l\u1EA1i v\u1ECB tr\xED c\u1EEDa s\u1ED5");
    } else if (target.dataset.modalAction === "save") saveModal();
  }
  function handleModalInput(event) {
    const target = event.target;
    if (target.matches("[data-css-color]")) {
      applyCssProperty(target.dataset.cssColor, target.value);
      const card = target.closest("[data-css-card]");
      const hex = card?.querySelector("[data-css-hex]");
      const swatch = card?.querySelector(".ui-feedback-theme-card__swatch");
      if (hex) hex.value = target.value;
      if (swatch) swatch.style.background = target.value;
    } else if (target.matches("[data-css-hex]")) {
      const value = target.value.trim();
      if (/^#[0-9a-f]{6}$/i.test(value)) {
        applyCssProperty(target.dataset.cssHex, value);
        const card = target.closest("[data-css-card]");
        const color = card?.querySelector("[data-css-color]");
        const swatch = card?.querySelector(".ui-feedback-theme-card__swatch");
        if (color) color.value = value;
        if (swatch) swatch.style.background = value;
      }
    } else if (target.matches("[data-css-opacity]")) {
      applyCssProperty("opacity", String(Number(target.value) / 100));
      const output = root.querySelector("[data-css-opacity-output]");
      if (output) output.textContent = `${target.value}%`;
    } else if (target.matches("[data-css-shadow]")) {
      const shadow2 = cssShadowState();
      const key = target.dataset.cssShadow;
      if (key === "color") shadow2.color = target.value;
      else if (key === "inset") shadow2.inset = target.checked;
      else shadow2[key] = Number(target.value) || 0;
      applyCssProperty("boxShadow", shadowCss(shadow2));
      const output = root.querySelector(`[data-css-shadow-output="${key}"]`);
      if (output) output.textContent = `${Math.round(Number(target.value) || 0)}px`;
    } else if (target.matches("[data-css-range-prop]")) {
      const prop = target.dataset.cssRangeProp;
      const raw = Number(target.value);
      const unit = target.dataset.cssRangeUnit || "";
      if (prop === "colorAlpha") {
        applyCssProperty("color", colorWithAlpha(readCssValue("color", "#ffffff"), raw / 100));
      } else {
        applyCssProperty(prop, `${raw}${unit}`);
      }
      const output = root.querySelector(`[data-css-output="${prop}"]`);
      if (output) output.textContent = prop === "lineHeight" ? raw.toFixed(2) : `${raw}${unit}`;
    } else if (target.matches("[data-css-number-prop]")) {
      const prop = target.dataset.cssNumberProp;
      const value = Math.max(-1e3, Math.min(1e3, Number(target.value) || 0));
      target.value = String(value);
      applyCssProperty(prop, String(value));
    } else if (target.matches("[data-css-spacing]")) {
      const value = Math.max(0, Math.min(160, Number(target.value) || 0));
      target.value = String(value);
      applyCssProperty(target.dataset.cssSpacing, `${value}px`);
      const output = target.parentElement?.querySelector("output");
      if (output) output.textContent = `${Math.round(value)}px`;
    } else if (target.matches("[data-css-text-prop]")) {
      applyCssProperty(target.dataset.cssTextProp, target.value.trim() || (target.dataset.cssTextProp === "boxShadow" ? "none" : "auto"));
    } else if (target.matches("[data-css-x], [data-css-y], [data-css-x-number], [data-css-y-number]")) {
      const isX = target.matches("[data-css-x], [data-css-x-number]");
      state.cssPosition[isX ? "x" : "y"] = Number(target.value);
      applyCssPosition();
    } else if (target.matches("[data-image-zoom]")) {
      state.modalImageZoom = Number(target.value);
      applyPreviewImageZoom();
    } else if (target.matches("[data-css-radius]")) {
      applyCssProperty("borderRadius", `${target.value}px`);
      const output = root.querySelector("[data-css-radius-output]");
      if (output) output.value = `${target.value}px`;
      if (output) output.textContent = `${target.value}px`;
    } else if (target.matches("[data-image-url]")) {
      state.modalImageSource = target.value.trim();
      previewImageSource(state.modalImageSource);
    }
  }
  function handleModalChange(event) {
    const target = event.target;
    if (target.matches("[data-css-select-prop]")) {
      applyCssProperty(target.dataset.cssSelectProp, target.value);
      return;
    }
    if (target.matches("[data-css-font]")) {
      const value = target.value;
      if (value) {
        ensureGoogleFont(value);
        applyCssProperty(target.dataset.cssFont, `'${value}', sans-serif`);
      } else applyCssProperty(target.dataset.cssFont, "");
      renderModal();
      return;
    }
    if (target.matches("[data-image-file]") && target.files?.[0]) loadImageFile(target.files[0]);
  }
  function handleModalKeydown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeModal(true);
    }
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      saveModal();
    }
  }
  let editingExisting = null;
  function openModalWithExisting(element, mode, existing) {
    editingExisting = existing || null;
    openModal(element, mode, existing);
  }
  function saveModal() {
    const input = root.querySelector("[data-feedback-input]");
    const value = input?.value?.trim() || "";
    const existing = editingExisting;
    const modeUsed = state.mode;
    if (modeUsed === "image") {
      const source = state.modalImageSource || value;
      if (!validateImageSource(source)) {
        input?.focus();
        showToast("URL \u1EA3nh kh\xF4ng h\u1EE3p l\u1EC7 ho\u1EB7c \u1EA3nh upload v\u01B0\u1EE3t gi\u1EDBi h\u1EA1n 1 MB");
        return;
      }
      const oldImageState = state.modalSnapshot || captureImageState(state.target);
      applyImageSource(state.target, source);
      applyImagePosition(state.target, state.modalImagePosition || { x: 50, y: 50 });
      const item = {
        id: generateId(),
        type: "image",
        category: "image",
        selector: cssPath(state.target),
        tag: targetLabel(state.target),
        codeLine: firstCodeLine(state.target),
        targetText: oldImageState.src || oldImageState.backgroundImage || "",
        value: source,
        imageSourceType: source.startsWith("data:image/") ? "upload" : "url",
        oldImageState,
        newImageState: captureImageState(state.target),
        page: location.pathname || "/",
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        scrollY: Math.round(window.scrollY),
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      state.comments.push(item);
      state.undoStack.push({ type: "image", id: item.id, selector: item.selector, oldImageState });
      persist();
      state.modalCommitted = true;
      showToast("\u0110\xE3 thay \u1EA3nh tr\xEAn trang", { undo: true });
      editingExisting = null;
      closeModal(true);
      return;
    }
    if (modeUsed !== "css" && !value) {
      input?.focus();
      showToast("Vui l\xF2ng nh\u1EADp n\u1ED9i dung tr\u01B0\u1EDBc khi l\u01B0u");
      return;
    }
    if (modeUsed === "edit" || modeUsed === "css") {
      if (state.target) {
        const oldValue = modeUsed === "edit" ? state.target.textContent : state.modalSnapshot?.styleCssText || state.target.style.cssText;
        if (modeUsed === "edit") state.target.textContent = value;
        const newValue = modeUsed === "edit" ? value : state.target.style.cssText;
        const item = {
          id: generateId(),
          type: modeUsed,
          selector: cssPath(state.target),
          tag: targetLabel(state.target),
          category: modeUsed === "edit" ? "content" : "color",
          codeLine: firstCodeLine(state.target),
          targetText: safeText(oldValue, 120),
          value: newValue,
          page: location.pathname || "/",
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          scrollY: Math.round(window.scrollY),
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        state.comments.push(item);
        state.undoStack.push({
          type: modeUsed,
          id: item.id,
          selector: item.selector,
          oldValue
        });
      }
      persist();
      state.modalCommitted = true;
      showToast(modeUsed === "edit" ? "\u0110\xE3 c\u1EADp nh\u1EADt n\u1ED9i dung tr\xEAn trang" : "\u0110\xE3 apply B\u1ED9 giao di\u1EC7n", { undo: true });
    } else {
      const item = existing || { id: generateId(), createdAt: (/* @__PURE__ */ new Date()).toISOString(), type: "comment" };
      item.comment = value;
      item.priority = root.querySelector("[data-feedback-priority]")?.value || item.priority || "medium";
      item.category = root.querySelector("[data-feedback-category]")?.value || item.category || "other";
      item.selector = cssPath(state.target);
      item.tag = targetLabel(state.target);
      item.codeLine = firstCodeLine(state.target);
      item.targetText = safeText(state.target?.textContent, 120);
      item.page = location.pathname || "/";
      item.viewport = `${window.innerWidth}x${window.innerHeight}`;
      item.scrollY = Math.round(window.scrollY);
      item.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      if (!existing) state.comments.push(item);
      persist();
      state.modalCommitted = true;
      showToast(existing ? "\u0110\xE3 c\u1EADp nh\u1EADt feedback" : "\u0110\xE3 l\u01B0u feedback");
      setTimeout(() => {
        const badge = root.querySelector(".ui-feedback-badge");
        if (badge) {
          badge.classList.remove("is-pulse");
          void badge.offsetWidth;
          badge.classList.add("is-pulse");
        }
      }, 50);
    }
    editingExisting = null;
    closeModal(true);
  }
  function closeModal(resumePicking = false) {
    if (!state.modalCommitted && state.mode === "css" && state.target && state.modalSnapshot) {
      state.target.style.cssText = state.modalSnapshot.styleCssText || "";
    }
    if (!state.modalCommitted && state.mode === "image" && state.target && state.modalSnapshot) {
      restoreImageState(state.target, state.modalSnapshot);
    }
    state.modalOpen = false;
    state.target = null;
    state.modalSnapshot = null;
    state.modalImageSource = "";
    state.modalImagePosition = { x: 50, y: 50 };
    state.modalCommitted = false;
    editingExisting = null;
    renderToolbar2();
    placeMarkers();
    if (resumePicking) {
      resumePickingIfNeeded();
    }
  }
  function editComment(id) {
    return commentsController.editComment(id);
  }
  function deleteComment(id) {
    return commentsController.deleteComment(id);
  }
  function undoAction() {
    return commentsController.undoAction();
  }
  function resolveComment(id) {
    return commentsController.resolveComment(id);
  }
  function renderItemMarkdown(item, index) {
    const lines = [];
    const status = item.resolved ? "\u2705 \u0110\xE3 x\u1EED l\xFD" : "\u23F3 Ch\u01B0a x\u1EED l\xFD";
    const typeLabel = item.type === "edit" ? "\u270F\uFE0F Edit" : item.type === "css" ? "\u2726 B\u1ED9 giao di\u1EC7n" : item.type === "image" ? "\u25A7 Image" : "\u{1F4AC} Feedback";
    const title = item.type === "edit" ? "S\u1EEDa text" : item.type === "css" ? "B\u1ED9 giao di\u1EC7n" : item.type === "image" ? "Thay \u1EA3nh" : "Feedback";
    lines.push(`### ${index + 1}. ${escapeMarkdown(item.tag)} _(${typeLabel})_`, "", `- **Ti\xEAu \u0111\u1EC1:** ${title}`);
    if (item.type === "edit") {
      lines.push(`- **Text hi\u1EC7n t\u1EA1i:** ${escapeMarkdown(item.targetText || "")}`);
      lines.push(`- **Text m\u1EDBi:** ${escapeMarkdown(item.value || "")}`);
    } else if (item.type === "css") {
      lines.push(`- **CSS c\u0169:** \`${escapeMarkdown(item.targetText || "")}\``);
      lines.push(`- **CSS m\u1EDBi:** \`${escapeMarkdown(item.value || "")}\``);
    } else if (item.type === "image") {
      lines.push(`- **\u1EA2nh c\u0169:** ${escapeMarkdown(item.targetText || "Kh\xF4ng c\xF3")}`);
      lines.push(`- **\u1EA2nh m\u1EDBi:** ${escapeMarkdown(item.value || "")}`);
      lines.push(`- **Ngu\u1ED3n:** ${item.imageSourceType === "upload" ? "Upload t\u1EEB m\xE1y" : "URL website"}`);
    } else {
      lines.push(`- **\u01AFu ti\xEAn:** ${item.priority || "medium"}`);
      lines.push(`- **Feedback:** ${escapeMarkdown(item.comment || "")}`);
    }
    lines.push(`- **Ph\xE2n lo\u1EA1i:** ${categoryLabel(item.category, item.type)}`);
    lines.push(`- **D\xF2ng code \u0111\u1EA7u:** \`${escapeMarkdown(item.codeLine || getItemCodeLine(item) || item.tag || "")}\``);
    lines.push(`- **Selector:** \`${item.selector}\``);
    lines.push(`- **Tr\u1EA1ng th\xE1i:** ${status}`);
    if (item.viewport) lines.push(`- **Context:** \`${item.viewport}\` \xB7 \`${item.scrollY}px\``);
    lines.push(`- **T\u1EA1o l\xFAc:** ${item.createdAt ? formatDate(new Date(item.createdAt)) : "N/A"}`);
    lines.push(`- **C\u1EADp nh\u1EADt:** ${item.updatedAt ? formatDate(new Date(item.updatedAt)) : "N/A"}`);
    lines.push("");
    return lines;
  }
  function exportMarkdown() {
    return markdownExporter.exportMarkdown();
  }
  function showToast(message, opts = {}) {
    return toastController?.showToast(message, opts);
  }
  function createGithubIssue() {
    return githubIssueController.createGithubIssue();
  }
  function toggle() {
    state.active = !state.active;
    if (state.active) state.coachmarkVisible = config.coachmark !== false && !hasSeenCoachmark();
    persistActive();
    state.panelOpen = false;
    state.modalOpen = false;
    state._modeBeforePickingStop = null;
    clearResumeTimer();
    stopPicking();
    renderToolbar2();
    if (state.active) {
      placeMarkers();
    } else {
      pickerInspector?.closeInspector?.();
      measurementController?.destroy?.();
      clearMarkers();
    }
    showToast(state.active ? "UI Feedback \u0111\xE3 b\u1EADt" : "UI Feedback \u0111\xE3 t\u1EAFt");
  }
  function normalizeShortcutKey(event) {
    const fromCode = typeof event.code === "string" && event.code.startsWith("Key") ? event.code.slice(3) : "";
    return (fromCode || event.key || "").toLowerCase();
  }
  function navigateInspector(direction) {
    const selected = state.pickerInspector?.selected?.element;
    if (!selected || !selected.isConnected) return false;
    let next = null;
    if (direction === "parent") next = selected.parentElement;
    if (direction === "child") next = [...selected.children].find((element) => !element.closest("#ui-feedback-host")) || null;
    if (direction === "prev") next = selected.previousElementSibling;
    if (direction === "next") next = selected.nextElementSibling;
    if (!next || next === document.body || next === document.documentElement || next.closest("#ui-feedback-host")) return false;
    if (state.pickerInspector.locked) pickerInspector?.unlockTarget();
    return Boolean(pickerInspector?.selectTarget(next));
  }
  function keydown(event) {
    const inspector = state.pickerInspector;
    const isFormControl = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement;
    if (state.active && !state.modalOpen && !state.panelOpen) {
      if (event.key === "Enter" && state.picking && inspector?.candidate?.element) {
        event.preventDefault();
        pickerInspector?.selectTarget(inspector.candidate.element);
        return;
      }
      if (event.key === "Escape" && inspector?.phase && inspector.phase !== "idle") {
        event.preventDefault();
        pickerInspector?.closeInspector();
        stopPicking({ rerender: true });
        return;
      }
      if (!isFormControl && inspector?.selected?.element) {
        if (event.key.toLowerCase() === "l") {
          event.preventDefault();
          if (inspector.locked) pickerInspector?.unlockTarget();
          else pickerInspector?.lockTarget();
          return;
        }
        if (event.key.toLowerCase() === "m") {
          event.preventDefault();
          if (inspector.measurement.enabled) measurementController?.disable();
          else measurementController?.enable(inspector.selected.element, "box");
          pickerInspector?.refresh();
          return;
        }
        const navigation = { ArrowUp: "parent", ArrowDown: "child", ArrowLeft: "prev", ArrowRight: "next" };
        if (navigation[event.key]) {
          event.preventDefault();
          navigateInspector(navigation[event.key]);
          return;
        }
      }
    }
    if (event.key === "Escape" && state.active) {
      if (state.modalOpen) {
        closeModal(true);
        event.preventDefault();
        return;
      }
      if (state.panelOpen) {
        togglePanel(false);
        event.preventDefault();
        return;
      }
      if (state.picking) {
        stopPicking({ rerender: true });
        event.preventDefault();
        return;
      }
    }
    const key = normalizeShortcutKey(event);
    if (state.picking && state.highlight?.element && !state.pickingLocked) {
      const char = key.toUpperCase();
      if (["T", "C", "S"].includes(char)) {
        event.preventDefault();
        const tags = { "T": "[Typography]", "C": "[Color]", "S": "[Spacing]" };
        const item = {
          id: generateId(),
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          comment: tags[char],
          priority: "high",
          selector: cssPath(state.highlight.element),
          tag: targetLabel(state.highlight.element),
          category: char === "T" ? "typography" : char === "C" ? "color" : "spacing",
          codeLine: firstCodeLine(state.highlight.element),
          targetText: safeText(state.highlight.element.textContent, 120),
          page: location.pathname || "/",
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          scrollY: Math.round(window.scrollY),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        state.comments.push(item);
        persist();
        stopPicking();
        renderToolbar2();
        showToast(`\u0110\xE3 note ${tags[char]}`);
        setTimeout(() => {
          const badge = root.querySelector(".ui-feedback-badge");
          if (badge) {
            badge.classList.remove("is-pulse");
            void badge.offsetWidth;
            badge.classList.add("is-pulse");
          }
        }, 50);
        return;
      }
    }
    if (!config.shortcut.includes(key)) return;
    pressed.add(key);
    if (!event.repeat) {
      recentShortcutKeys.push(key);
      while (recentShortcutKeys.length > config.shortcut.length) recentShortcutKeys.shift();
      const simultaneous = config.shortcut.every((r) => pressed.has(r));
      const quickSequence = config.shortcut.every((r) => recentShortcutKeys.includes(r));
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
  function imageTargetFor(element) {
    if (!(element instanceof Element)) return null;
    if (element instanceof HTMLImageElement || element.tagName.toLowerCase() === "img") return element;
    const directPictureImage = element.closest("picture")?.querySelector("img");
    if (directPictureImage) return directPictureImage;
    const nestedImages = element.querySelectorAll?.("img");
    if (nestedImages?.length === 1) return nestedImages[0];
    return element;
  }
  function targetForMode(element, mode = state.mode) {
    return mode === "image" ? imageTargetFor(element) : element;
  }
  function elementAtPoint(clientX, clientY) {
    const picker = root.querySelector("[data-picker-layer]");
    if (picker) picker.style.display = "none";
    const stack = typeof document.elementsFromPoint === "function" ? document.elementsFromPoint(clientX, clientY) : [];
    const element = stack.find((candidate) => candidate instanceof Element && candidate !== document.documentElement && candidate !== document.body && !candidate.closest("#ui-feedback-host")) || document.elementFromPoint(clientX, clientY);
    if (picker) picker.style.display = "";
    if (!(element instanceof Element) || element === document.documentElement || element === document.body || element.closest("#ui-feedback-host"))
      return null;
    return element;
  }
  function pointerMove(event) {
    if (!state.picking || event.composedPath?.().includes(host)) return;
    const element = targetForMode(elementAtPoint(event.clientX, event.clientY));
    if (!element) return;
    if (state.pickerInspector?.measurement?.mode === "gap" && state.pickerInspector.selected?.element) {
      if (element !== state.pickerInspector.selected.element) {
        pickerInspector?.setCandidate(element);
        highlight(element);
      }
      return;
    }
    pickerInspector?.setCandidate(element);
    highlight(element);
  }
  function handleHostEvent(event) {
    const path = event.composedPath();
    const coachmarkDismiss = path.find((node) => node instanceof Element && node.matches?.("[data-coachmark-dismiss]"));
    if (coachmarkDismiss) {
      event.preventDefault();
      event.stopPropagation();
      dismissCoachmark();
      return;
    }
    const button = path.find(
      (node) => node instanceof HTMLButtonElement && node.dataset?.action
    );
    if (button) {
      triggerToolbarAction(event, button);
      return;
    }
    const inspectorControl = path.find((node) => node instanceof Element && node.matches?.("[data-inspector-action], [data-breadcrumb-index]"));
    if (inspectorControl) {
      if (event.type !== "click") return;
      event.preventDefault();
      event.stopPropagation();
      if (inspectorControl.dataset.breadcrumbIndex !== void 0) {
        pickerInspector?.selectBreadcrumb(inspectorControl.dataset.breadcrumbIndex);
        return;
      }
      const action = inspectorControl.dataset.inspectorAction;
      if (action === "close") {
        pickerInspector?.closeInspector();
        stopPicking({ rerender: true });
        return;
      }
      if (action === "lock") {
        if (state.pickerInspector?.locked) pickerInspector?.unlockTarget();
        else pickerInspector?.lockTarget();
        return;
      }
      if (action === "copy") {
        const selector = state.pickerInspector?.selected?.selector || "";
        Promise.resolve(navigator.clipboard?.writeText?.(selector)).then(() => showToast("\u0110\xE3 copy selector")).catch(() => showToast("Kh\xF4ng th\u1EC3 copy selector"));
        return;
      }
      pickerInspector?.openAction(action);
      return;
    }
    if (!state.picking || state.pickingLocked) return;
    const picker = path.find(
      (node) => node instanceof Element && node.matches?.("[data-picker-layer]")
    );
    if (!picker) return;
    const element = targetForMode(elementAtPoint(event.clientX, event.clientY));
    if (!element) return;
    event.preventDefault();
    event.stopPropagation();
    state.pickingLocked = true;
    setTimeout(() => {
      state.pickingLocked = false;
    }, 600);
    if (state.pickerInspector?.measurement?.mode === "gap" && state.pickerInspector.selected?.element) {
      if (element !== state.pickerInspector.selected.element) {
        measurementController?.setCompareTarget(element);
        stopPicking({ rerender: false });
        pickerInspector?.refresh();
        showToast("\u0110\xE3 \u0111o kho\u1EA3ng c\xE1ch gi\u1EEFa hai ph\u1EA7n t\u1EED");
      }
      return;
    }
    pickerInspector?.selectTarget(element);
  }
  function documentPickHandler(event) {
    if (!state.picking || state.pickingLocked) return;
    if (event.composedPath().includes(host)) return;
    const rawElement = event.target instanceof Element ? event.target : null;
    const element = targetForMode(rawElement);
    if (!element || element === document.documentElement || element === document.body) return;
    event.preventDefault();
    event.stopPropagation();
    state.pickingLocked = true;
    setTimeout(() => {
      state.pickingLocked = false;
    }, 600);
    if (state.pickerInspector?.measurement?.mode === "gap" && state.pickerInspector.selected?.element) {
      if (element !== state.pickerInspector.selected.element) {
        measurementController?.setCompareTarget(element);
        stopPicking({ rerender: false });
        pickerInspector?.refresh();
        showToast("\u0110\xE3 \u0111o kho\u1EA3ng c\xE1ch gi\u1EEFa hai ph\u1EA7n t\u1EED");
      }
      return;
    }
    pickerInspector?.selectTarget(element);
  }
  function handleDragStart(event) {
    const path = event.composedPath();
    const grip = path.find(
      (node) => node instanceof Element && node.matches?.("[data-drag-handle]")
    );
    if (!grip) return;
    event.preventDefault();
    event.stopPropagation();
    const toolbar = root.querySelector(".ui-feedback-toolbar");
    if (!toolbar) return;
    const rect = toolbar.getBoundingClientRect();
    dragState = {
      startX: event.clientX,
      startY: event.clientY,
      startRight: window.innerWidth - rect.right,
      startTop: rect.top
    };
    function onMove(e) {
      if (!dragState) return;
      const dx = e.clientX - dragState.startX;
      const dy = e.clientY - dragState.startY;
      toolbarPos.right = Math.max(8, Math.min(window.innerWidth - 70, dragState.startRight - dx));
      toolbarPos.top = Math.max(40, Math.min(window.innerHeight - 100, dragState.startTop + dy));
      toolbar.style.cssText = getToolbarStyle();
    }
    function onEnd() {
      dragState = null;
      document.removeEventListener("pointermove", onMove, true);
      document.removeEventListener("pointerup", onEnd, true);
      document.removeEventListener("pointercancel", onEnd, true);
    }
    document.addEventListener("pointermove", onMove, true);
    document.addEventListener("pointerup", onEnd, true);
    document.addEventListener("pointercancel", onEnd, true);
  }
  function dispose() {
    stopPicking();
    pickerInspector?.closeInspector?.();
    measurementController?.destroy?.();
    clearMarkers();
    window.removeEventListener("scroll", refreshMarkerPositions);
    window.removeEventListener("resize", refreshMarkerPositions);
    window.removeEventListener("pageshow", reapplyPageChanges);
    window.removeEventListener("popstate", reapplyPageChanges);
    document.removeEventListener("visibilitychange", reapplyPageChanges);
    document.removeEventListener("keydown", keydown, true);
    document.removeEventListener("keyup", keyup, true);
    window.removeEventListener("blur", blurHandler);
    document.removeEventListener("pointermove", pointerMove, true);
    document.removeEventListener("pointerdown", documentPickHandler, true);
    document.removeEventListener("click", documentPickHandler, true);
    host.removeEventListener("pointerdown", handleHostEvent, true);
    host.removeEventListener("click", handleHostEvent, true);
    host.removeEventListener("pointerdown", handleDragStart, true);
    host.remove();
    delete window.__uiFeedbackInstance;
  }
  const blurHandler = () => pressed.clear();
  const reapplyPageChanges = () => {
    if (!state.active) return;
    setTimeout(() => {
      applyPersistedChanges();
      placeMarkers();
    }, 0);
  };
  panelController = createPanelController({ state, root, showToast });
  modalController = createModalController({ state, root, showToast });
  cssEditor = createCssEditor({ state, root });
  measurementController = createMeasurementController({ state, root });
  pickerController = createPickerController({ state, root, config, renderToolbar: renderToolbar2, showToast, closePickerInspector: () => pickerInspector?.closeInspector?.() });
  pickerInspector = createPickerInspector({
    state,
    root,
    renderToolbar: renderToolbar2,
    measurement: measurementController,
    clearHighlight: () => pickerController?.clearHighlight?.(),
    showToast,
    onAction: (action, element) => {
      if (action === "measure-box") {
        measurementController.enable(element, "box");
        pickerInspector.refresh();
        return;
      }
      if (action === "measure-gap") {
        measurementController.enable(element, "gap");
        state.mode = "measure-gap";
        state.picking = true;
        state.pickingLocked = false;
        root.classList.add("ui-feedback-picking");
        renderToolbar2();
        showToast("R\xEA chu\u1ED9t v\xE0 b\u1EA5m ph\u1EA7n t\u1EED th\u1EE9 hai \u0111\u1EC3 \u0111o gap");
        return;
      }
      if (action === "copy") return;
      openModal(element, action);
    }
  });
  const featureContext = {
    state,
    root,
    config,
    persist,
    renderToolbar: renderToolbar2,
    renderPanel,
    renderModal,
    placeMarkers,
    clearMarkers,
    getItemCodeLine,
    openModalWithExisting,
    restoreImageState,
    showToast: (...args) => toastController?.showToast(...args),
    pickerInspector,
    measurementController
  };
  toastController = createToastController({ root, undoAction: (...args) => commentsController?.undoAction(...args) });
  commentsController = createCommentsController(featureContext);
  markdownExporter = createMarkdownExporter(featureContext);
  githubIssueController = createGithubIssueController(featureContext);
  document.addEventListener("keydown", keydown, true);
  document.addEventListener("keyup", keyup, true);
  window.addEventListener("blur", blurHandler);
  window.addEventListener("scroll", refreshMarkerPositions, { passive: true });
  window.addEventListener("resize", refreshMarkerPositions, { passive: true });
  window.addEventListener("pageshow", reapplyPageChanges);
  window.addEventListener("popstate", reapplyPageChanges);
  document.addEventListener("visibilitychange", reapplyPageChanges);
  document.addEventListener("pointermove", pointerMove, true);
  document.addEventListener("pointerdown", documentPickHandler, true);
  document.addEventListener("click", documentPickHandler, true);
  host.addEventListener("pointerdown", handleHostEvent, true);
  host.addEventListener("click", handleHostEvent, true);
  host.addEventListener("pointerdown", handleDragStart, true);
  window.__uiFeedbackInstance = {
    toggle,
    exportMarkdown,
    getComments: () => [...state.comments],
    updateTool,
    notify: showToast,
    dispose
  };
  if (state.active) applyPersistedChanges();
  renderToolbar2();
  if (state.active) placeMarkers();
  return window.__uiFeedbackInstance;
}
if (typeof window !== "undefined") {
  window.UIFeedback = { createUIFeedback };
}
export {
  createUIFeedback
};
