// UI Feedback Tool v0.14.0

// src/core/config.js
var TOOL_VERSION = "0.14.0";
var DEFAULTS = {
  version: TOOL_VERSION,
  shortcut: ["q", "w", "e"],
  storageKey: "ui-feedback-session",
  accent: "#ffffff",
  position: "right",
  theme: "auto",
  githubRepo: "",
  persistActive: true,
  coachmark: true
};
function mergeConfig(options = {}) {
  const shortcutInput = Array.isArray(options.shortcut) ? options.shortcut : DEFAULTS.shortcut;
  const shortcut = [...new Set(shortcutInput.map((key) => String(key || "").trim().toLowerCase()).filter(Boolean))];
  return {
    ...DEFAULTS,
    ...options,
    shortcut: shortcut.length >= 2 ? shortcut : [...DEFAULTS.shortcut]
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
  { key: "background", label: "M\xE0u n\u1EC1n ph\u1EA7n t\u1EED", prop: "backgroundColor", fallback: "#ffffff", hint: "background-color" },
  { key: "text", label: "M\xE0u ch\u1EEF ph\u1EA7n t\u1EED", prop: "color", fallback: "#1b212b", hint: "color" }
];
var EXTRA_COLOR_FIELDS = [
  { key: "border", label: "Vi\u1EC1n", prop: "borderColor", fallback: "#d1d5db", hint: "border-color" },
  { key: "outline", label: "Outline", prop: "outlineColor", fallback: "#f5a623", hint: "outline-color" },
  { key: "decoration", label: "G\u1EA1ch ch\xE2n", prop: "textDecorationColor", fallback: "#f5a623", hint: "text-decoration-color" },
  { key: "caret", label: "Caret", prop: "caretColor", fallback: "#f5a623", hint: "caret-color" },
  { key: "accent", label: "Accent", prop: "accentColor", fallback: "#f5a623", hint: "accent-color" },
  { key: "columnRule", label: "Column rule", prop: "columnRuleColor", fallback: "#d1d5db", hint: "column-rule-color" },
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
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "N/A";
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}
function relativeTime(isoString) {
  if (!isoString) return "";
  const timestamp = new Date(isoString).getTime();
  if (!Number.isFinite(timestamp)) return "";
  const diff = Math.max(0, Date.now() - timestamp);
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
function isEditable(target) {
  const editableSelector = 'input, textarea, select, [contenteditable]:not([contenteditable="false"])';
  return typeof HTMLElement !== "undefined" && target instanceof HTMLElement && (target.matches(editableSelector) || Boolean(target.closest(editableSelector)));
}
function cssEscape(value) {
  const input = String(value || "");
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") return CSS.escape(input);
  return [...input].map((character, index) => {
    const code = character.codePointAt(0);
    if (code === 0) return "\uFFFD";
    if (code >= 1 && code <= 31 || code === 127 || index === 0 && code >= 48 && code <= 57 || index === 1 && code >= 48 && code <= 57 && input[0] === "-") {
      return `\\${code.toString(16)} `;
    }
    if (index === 0 && character === "-" && input.length === 1) return "\\-";
    if (code >= 128 || character === "-" || character === "_" || /[a-zA-Z0-9]/.test(character)) return character;
    return `\\${character}`;
  }).join("");
}
function cssPath(element) {
  if (typeof Element === "undefined" || !(element instanceof Element)) return "";
  const parts = [];
  let node = element;
  while (node && node.nodeType === 1 && node !== document.body && parts.length < 6) {
    let part = node.tagName.toLowerCase();
    if (node.id) {
      part += `#${cssEscape(node.id)}`;
      parts.unshift(part);
      break;
    }
    const classes = [...node.classList].filter(Boolean).slice(0, 2);
    if (classes.length) part += `.${classes.map(cssEscape).join(".")}`;
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
async function copyText(value) {
  const text = String(value || "");
  if (!text) return false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
  }
  if (typeof document === "undefined" || !document.body) return false;
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.cssText = "position:fixed;opacity:0;pointer-events:none;";
  document.body.appendChild(textarea);
  textarea.select();
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }
  textarea.remove();
  return copied;
}

// src/core/state.js
function createFeedbackState(config) {
  const activeStorageKey = `${config.storageKey}:active`;
  function loadComments() {
    try {
      const parsed = JSON.parse(localStorage.getItem(config.storageKey) || "[]");
      if (!Array.isArray(parsed)) return [];
      const validTypes = /* @__PURE__ */ new Set(["comment", "edit", "css", "image"]);
      return parsed.filter((item) => item && typeof item === "object").map((item) => ({
        ...item,
        id: String(item.id || generateId()),
        type: validTypes.has(item.type) ? item.type : "comment",
        selector: String(item.selector || ""),
        page: String(item.page || "/"),
        createdAt: item.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: item.updatedAt || item.createdAt || (/* @__PURE__ */ new Date()).toISOString()
      }));
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
    modalImageBaseTransform: "",
    selectionChooser: null,
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
    panelPosition: { x: 0, y: 0 }
  };
  function persist() {
    try {
      localStorage.setItem(config.storageKey, JSON.stringify(state.comments));
      return true;
    } catch {
      return false;
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
.ui-feedback-panel__actions { display: flex; align-items: center; gap: 5px; }
.ui-feedback-export-button { display: inline-flex; align-items: center; gap: 6px; min-height: 34px; padding: 7px 11px; border: 1px solid var(--ui-feedback-accent); border-radius: 9px; color: #111827; background: var(--ui-feedback-accent); font-size: 11px; font-weight: 800; white-space: nowrap; }
.ui-feedback-export-button svg { width: 14px; height: 14px; stroke: currentColor; fill: none; }
.ui-feedback-export-button:hover { filter: brightness(.96); transform: translateY(-1px); }
.ui-feedback-panel__intro { margin: 10px 12px 0; padding: 10px 12px; border: 1px solid var(--_border); border-radius: 10px; color: var(--_text-muted); background: var(--_bg-alt); font-size: 11px; line-height: 1.5; }
.ui-feedback-panel__tabs { display: flex; gap: 4px; overflow-x: auto; padding: 8px 12px 0; background: var(--_bg-panel); }
.ui-feedback-panel__tab { flex: 0 0 auto; border: 0; border-bottom: 2px solid transparent; padding: 7px 8px 8px; color: var(--_text-muted); background: transparent; font-size: 10px; font-weight: 800; white-space: nowrap; }
.ui-feedback-panel__tab:hover, .ui-feedback-panel__tab.is-active { color: var(--_text); border-bottom-color: color-mix(in srgb, var(--ui-feedback-accent), var(--_text) 28%); }

.ui-feedback-icon-button {
  width: 34px;
  height: 34px;
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
.ui-feedback-category-chip--muted { color: var(--_text-muted); background: transparent; }
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
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
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
.ui-feedback-modal.is-editor { left: auto; right: 22px; top: 22px; transform: translate(var(--ui-feedback-modal-x), var(--ui-feedback-modal-y)); width: min(520px, calc(100vw - 32px)); height: calc(100vh - 44px); display: flex; flex-direction: column; animation: uiFeedbackSlideIn .25s cubic-bezier(.4,0,.2,1) both; }
.ui-feedback-modal.is-editor .ui-feedback-modal__content { flex: 1; overflow: auto; }
.ui-feedback-modal.is-mini { width: min(380px, calc(100vw - 32px)); }
.ui-feedback-label { display: block; margin: 0 0 7px; color: var(--_text-secondary); font-size: 12px; font-weight: 700; }
.ui-feedback-input-hint { display: block; margin-top: 8px; color: var(--_text-muted); font-size: 10px; line-height: 1.5; }
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
  position: fixed;
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
  padding: 0;
}
.ui-feedback-marker-layer { position: fixed; inset: 0; z-index: 2147482980; pointer-events: none; }
.ui-feedback-marker:focus-visible { outline: 3px solid #111; outline-offset: 2px; }
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
.ui-feedback-marker-layer.is-dark .ui-feedback-marker.is-edit {
  background: #166534;
  border-color: #86efac;
  color: #dcfce7;
}
.ui-feedback-marker-layer.is-dark .ui-feedback-marker.is-css {
  background: #5b21b6;
  border-color: #c4b5fd;
  color: #ede9fe;
}

/* \u2500\u2500 advanced CSS editor \u2500\u2500 */
.ui-feedback-css-tabs {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
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
.ui-feedback-position-pad.is-dragging { cursor: grabbing; }
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
.ui-feedback-image-preview { position: relative; display: block; width: 100%; height: 180px; min-height: 180px; overflow: hidden; border: 1px dashed var(--_border); border-radius: 8px; background: repeating-conic-gradient(var(--_bg-alt) 0 25%, var(--_bg-hover) 0 50%) 50% / 16px 16px; cursor: grab; touch-action: none; isolation: isolate; }
.ui-feedback-image-preview:active,
.ui-feedback-image-preview.is-dragging { cursor: grabbing; }
.ui-feedback-image-preview img.ui-feedback-image-preview__media { position: absolute; inset: 0; display: block; width: 100%; height: 100%; min-width: 100%; min-height: 100%; object-fit: cover; user-select: none; pointer-events: none; transform-origin: 50% 50%; transition: transform .12s ease, object-position .12s ease; }
.ui-feedback-image-preview img[style*="transform"] { will-change: transform; }
.ui-feedback-image-preview span { padding: 20px; color: var(--_text-muted); font-size: 11px; text-align: center; }
.ui-feedback-image-canvas-hint { position: absolute; right: 8px; bottom: 8px; border-radius: 99px; padding: 4px 7px; color: #fff; background: rgba(0,0,0,.58); font-size: 9px; pointer-events: none; }
.ui-feedback-image-zoom { display: grid; grid-template-columns: 28px 1fr 28px auto; align-items: center; gap: 6px; }
.ui-feedback-image-zoom button { width: 28px; height: 28px; border: 1px solid var(--_border); border-radius: 6px; color: var(--_text); background: var(--_bg-panel); }
.ui-feedback-image-zoom input { width: 100%; accent-color: var(--ui-feedback-accent); }
.ui-feedback-image-zoom output { min-width: 42px; color: var(--_text-secondary); font-size: 10px; text-align: right; }
.ui-feedback-image-position { display: flex; justify-content: space-between; color: var(--_text-muted); font-size: 10px; }
.ui-feedback-image-position-controls { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 5px; }
.ui-feedback-image-position-controls button { min-height: 28px; border: 1px solid var(--_border); border-radius: 6px; padding: 4px 5px; color: var(--_text-secondary); background: var(--_bg-panel); font-size: 10px; font-weight: 700; }
.ui-feedback-image-position-controls button:hover,
.ui-feedback-image-position-controls button:focus-visible { color: var(--_text); border-color: var(--ui-feedback-accent); outline: none; }
.ui-feedback-item__image-crop { color: var(--_text-secondary); font-size: 10px; }
.ui-feedback-image-url { width: 100%; border: 1px solid var(--_border); border-radius: 6px; padding: 9px 10px; color: var(--_text); background: var(--_bg-input); outline: none; font-size: 11px; }
.ui-feedback-image-url:focus { border-color: var(--ui-feedback-accent); }
.ui-feedback-image-paste { width: 100%; border: 1px solid var(--_border); border-radius: 6px; padding: 8px; color: var(--_text-secondary); background: var(--_bg-panel); font-size: 11px; }
.ui-feedback-image-paste:hover { border-color: var(--ui-feedback-accent); color: var(--_text); }
.ui-feedback-image-upload { width: 100%; border: 1px dashed var(--_border); border-radius: 6px; padding: 8px; color: var(--_text-secondary); background: var(--_bg-alt); font-size: 11px; }
.ui-feedback-image-original { display: block; overflow: hidden; color: var(--_text-muted); font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
.ui-feedback-marker.is-image { background: #fcd34d; border-color: #b45309; color: #78350f; font-size: 11px; line-height: 1; }
.ui-feedback-marker-layer.is-dark .ui-feedback-marker.is-image { background: #92400e; border-color: #fcd34d; color: #fef3c7; }

/* \u2500\u2500 precise element selection \u2500\u2500 */
.ui-feedback-selection-chooser { position: fixed; z-index: 2147483002; width: min(360px, calc(100vw - 24px)); max-height: min(520px, calc(100vh - 24px)); overflow: hidden; color: var(--_text); background: var(--_bg-panel); border: 1px solid var(--_border); border-radius: 14px; box-shadow: 0 18px 55px var(--_shadow); }
.ui-feedback-selection-chooser__header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 12px 13px; border-bottom: 1px solid var(--_border); background: var(--_bg-alt); }
.ui-feedback-selection-chooser__header strong { display: block; font-size: 12px; }
.ui-feedback-selection-chooser__header small { display: block; margin-top: 3px; color: var(--_text-muted); font-size: 10px; }
.ui-feedback-selection-chooser__header button { width: 24px; height: 24px; border: 1px solid var(--_border); border-radius: 7px; color: var(--_text-secondary); background: var(--_bg-panel); font-size: 17px; line-height: 1; cursor: pointer; }
.ui-feedback-selection-chooser__list { display: grid; gap: 6px; max-height: 390px; overflow: auto; padding: 9px; }
.ui-feedback-selection-choice { display: grid; grid-template-columns: 24px 1fr; align-items: center; gap: 9px; width: 100%; padding: 9px; border: 1px solid var(--_border); border-radius: 9px; color: var(--_text); background: var(--_bg-item); text-align: left; cursor: pointer; }
.ui-feedback-selection-choice:hover, .ui-feedback-selection-choice:focus-visible { border-color: var(--ui-feedback-accent); background: var(--_bg-hover); outline: none; }
.ui-feedback-selection-choice__number { display: grid; place-items: center; width: 23px; height: 23px; border-radius: 50%; color: var(--_bg-panel); background: var(--ui-feedback-accent); font-size: 11px; font-weight: 800; }
.ui-feedback-selection-choice strong { display: block; overflow: hidden; font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
.ui-feedback-selection-choice small { display: block; overflow: hidden; margin-top: 3px; color: var(--_text-muted); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }
.ui-feedback-selection-chooser__footer { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 9px 12px; border-top: 1px solid var(--_border); color: var(--_text-muted); font-size: 9px; }
.ui-feedback-selection-chooser__footer .ui-feedback-button { width: auto; min-width: 70px; margin: 0; padding: 6px 10px; }

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
/* \u2500\u2500 responsive \u2500\u2500 */
@media (max-width: 640px) {
  .ui-feedback-css-tabs { grid-template-columns: repeat(6, minmax(72px, 1fr)); overflow-x: auto; scrollbar-width: thin; }
  .ui-feedback-css-select-row select { max-width: 145px; }
  .ui-feedback-spacing-grid { grid-template-columns: 1fr; }
  .ui-feedback-toolbar { bottom: 10px; max-width: calc(100vw - 20px); justify-content: flex-start; overflow-x: auto; overscroll-behavior-x: contain; scrollbar-width: none; }
  .ui-feedback-toolbar::-webkit-scrollbar { display: none; }
  .ui-feedback-toolbar-grip { display: none; }
  .ui-feedback-tool { min-width: 38px; width: 38px; padding: 0; }
  .ui-feedback-tool__label { display: none; }
  .ui-feedback-panel { right: 10px; left: 10px; width: auto; }
  .ui-feedback-form-row { grid-template-columns: 1fr; gap: 12px; }
  .ui-feedback-modal.is-editor { right: 10px; top: 10px; width: calc(100vw - 20px); height: calc(100vh - 20px); }
  .ui-feedback-coachmark { right: 16px; bottom: 68px; }
  .ui-feedback-selection-chooser { left: 12px !important; right: 12px; width: auto; max-height: calc(100vh - 24px); }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; scroll-behavior: auto !important; }
}
  /* \u2500\u2500 v0.7 visual refresh: white accent + modern dark surfaces \u2500\u2500 */
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
    .ui-feedback-modal.is-editor { right: 12px; width: calc(100vw - 24px); height: calc(100vh - 24px); }
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

  /* Theme correction: the modern refresh must still honor light/auto theme and custom accent. */
  .ui-feedback-root:not(.is-dark) .ui-feedback-panel,
  .ui-feedback-root:not(.is-dark) .ui-feedback-modal { color: var(--_text); border-color: var(--_border-panel); background: var(--_bg-panel); box-shadow: 0 24px 72px var(--_shadow-heavy); }
  .ui-feedback-root:not(.is-dark) .ui-feedback-panel__header,
  .ui-feedback-root:not(.is-dark) .ui-feedback-modal__top,
  .ui-feedback-root:not(.is-dark) .ui-feedback-panel__tabs,
  .ui-feedback-root:not(.is-dark) .ui-feedback-panel__filter,
  .ui-feedback-root:not(.is-dark) .ui-feedback-modal__content,
  .ui-feedback-root:not(.is-dark) .ui-feedback-modal__footer { color: var(--_text); border-color: var(--_border); background: var(--_bg-panel); }
  .ui-feedback-root:not(.is-dark) .ui-feedback-panel__header strong,
  .ui-feedback-root:not(.is-dark) .ui-feedback-modal__top h2 { color: var(--_text); }
  .ui-feedback-root:not(.is-dark) .ui-feedback-panel__header small,
  .ui-feedback-root:not(.is-dark) .ui-feedback-modal__top p,
  .ui-feedback-root:not(.is-dark) .ui-feedback-label { color: var(--_text-secondary); }
  .ui-feedback-root:not(.is-dark) .ui-feedback-window-grip,
  .ui-feedback-root:not(.is-dark) .ui-feedback-drag-hint { color: var(--_text-muted); border-color: var(--_border); background: var(--_bg-alt); }
  .ui-feedback-root:not(.is-dark) .ui-feedback-panel__body { background: var(--_bg-alt); }
  .ui-feedback-root:not(.is-dark) .ui-feedback-panel__tab { color: var(--_text-muted); }
  .ui-feedback-root:not(.is-dark) .ui-feedback-panel__tab:hover,
  .ui-feedback-root:not(.is-dark) .ui-feedback-panel__tab.is-active { color: var(--_text); border-bottom-color: var(--ui-feedback-accent); }
  .ui-feedback-root:not(.is-dark) .ui-feedback-search-input,
  .ui-feedback-root:not(.is-dark) .ui-feedback-filter-select,
  .ui-feedback-root:not(.is-dark) .ui-feedback-field,
  .ui-feedback-root:not(.is-dark) .ui-feedback-textarea,
  .ui-feedback-root:not(.is-dark) .ui-feedback-select { color: var(--_text); border-color: var(--_border); background: var(--_bg); }
  .ui-feedback-root:not(.is-dark) .ui-feedback-search-input:focus,
  .ui-feedback-root:not(.is-dark) .ui-feedback-filter-select:focus,
  .ui-feedback-root:not(.is-dark) .ui-feedback-field:focus,
  .ui-feedback-root:not(.is-dark) .ui-feedback-textarea:focus,
  .ui-feedback-root:not(.is-dark) .ui-feedback-select:focus { border-color: var(--ui-feedback-accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--ui-feedback-accent), transparent 82%); }
  .ui-feedback-root:not(.is-dark) .ui-feedback-group__name,
  .ui-feedback-root:not(.is-dark) .ui-feedback-category-chip,
  .ui-feedback-root:not(.is-dark) .ui-feedback-context-tag { color: var(--_text-secondary); border-color: var(--_border); background: var(--_bg-alt); }
  .ui-feedback-root:not(.is-dark) .ui-feedback-category-label { color: var(--_text-secondary); background: transparent; }
  .ui-feedback-root:not(.is-dark) .ui-feedback-item { color: var(--_text); border-color: var(--_border); background: var(--_bg-item); }
  .ui-feedback-root:not(.is-dark) .ui-feedback-item:hover { background: var(--_bg-hover); }
  .ui-feedback-root:not(.is-dark) .ui-feedback-item__comment { color: var(--_text); }
  .ui-feedback-root:not(.is-dark) .ui-feedback-item__code { color: var(--_text-secondary); border-color: var(--_border); background: var(--_bg-alt); }
  .ui-feedback-root:not(.is-dark) .ui-feedback-mini { color: var(--_text-secondary); background: var(--_bg-alt); }
  .ui-feedback-root:not(.is-dark) .ui-feedback-css-tabs { background: var(--_bg-alt); }
  .ui-feedback-root:not(.is-dark) .ui-feedback-css-tab.is-active { color: var(--_text); background: var(--_bg); box-shadow: 0 1px 2px var(--_shadow); }
  .ui-feedback-root:not(.is-dark) .ui-feedback-theme-card,
  .ui-feedback-root:not(.is-dark) .ui-feedback-font-row,
  .ui-feedback-root:not(.is-dark) .ui-feedback-range-row,
  .ui-feedback-root:not(.is-dark) .ui-feedback-css-preset,
  .ui-feedback-root:not(.is-dark) .ui-feedback-css-side-row { color: var(--_text); border-color: var(--_border); background: var(--_bg); }
  .ui-feedback-root:not(.is-dark) .ui-feedback-button { color: var(--_text); border-color: var(--_border); background: var(--_bg); }
  .ui-feedback-root:not(.is-dark) .ui-feedback-button--primary { color: var(--_accent-ink); border-color: var(--ui-feedback-accent); background: var(--ui-feedback-accent); }

  .ui-feedback-item:focus-visible { outline: 2px solid var(--ui-feedback-accent); outline-offset: 2px; }
  .ui-feedback-modal__close { flex: 0 0 auto; }
  @media (max-width: 560px) {
    .ui-feedback-panel { right: 12px !important; left: 12px !important; width: auto !important; }
    .ui-feedback-icon-button { width: 40px; height: 40px; }
    .ui-feedback-mini { min-height: 36px; }
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
  function imageDisplayValue(item) {
    return item.imageSourceType === "upload" || String(item.value || "").startsWith("data:image/") ? "[\u1EA2nh upload local]" : item.value;
  }
  function imageCropSummary(item) {
    const state2 = item.newImageState || {};
    const position = state2.position || (() => {
      const raw = state2.objectPosition || state2.backgroundPosition || "";
      const parts = String(raw).match(/(-?[0-9.]+)%\s+(-?[0-9.]+)%/);
      return parts ? { x: Number(parts[1]), y: Number(parts[2]) } : null;
    })();
    const zoom = Number(state2.zoom);
    if (!position && !Number.isFinite(zoom)) return "";
    const x = Number.isFinite(Number(position?.x)) ? Math.round(Number(position.x)) : 50;
    const y = Number.isFinite(Number(position?.y)) ? Math.round(Number(position.y)) : 50;
    const zoomLabel = Number.isFinite(zoom) ? ` \xB7 zoom ${Math.round(zoom)}%` : "";
    return `Crop: X ${x}% \xB7 Y ${y}%${zoomLabel}`;
  }
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
    const expanded = Boolean(state.expandedComments?.[item.id]);
    const time = relativeTime(item.updatedAt || item.createdAt);
    const contextTags = [];
    if (item.viewport) contextTags.push(`\u{1F4F1} ${item.viewport}`);
    if (item.scrollY !== void 0) contextTags.push(`\u2195\uFE0F ${item.scrollY}px`);
    const category = categoryLabel(item.category, item.type);
    const content = item.type === "edit" ? `<p class="ui-feedback-item__comment">\u270F\uFE0F N\u1ED9i dung mong mu\u1ED1n: <code>${escapeHtml(item.value)}</code></p>` : item.type === "css" ? '<p class="ui-feedback-item__comment">\u2726 \u0110\xE3 ghi nh\u1EADn c\xE1c thu\u1ED9c t\xEDnh CSS thay \u0111\u1ED5i</p>' : item.type === "image" ? `<p class="ui-feedback-item__comment">\u25A7 H\xECnh \u1EA3nh mong mu\u1ED1n: <code>${escapeHtml(imageDisplayValue(item))}</code></p>${imageCropSummary(item) ? `<p class="ui-feedback-item__comment ui-feedback-item__image-crop">\u2316 ${escapeHtml(imageCropSummary(item))}</p>` : ""}` : `<p class="ui-feedback-item__comment">${escapeHtml(item.comment)}</p>`;
    const details = expanded ? `<div class="ui-feedback-item__details">
      ${contextTags.length ? `<div class="ui-feedback-item__context">${contextTags.map((tag) => `<span class="ui-feedback-context-tag">${escapeHtml(tag)}</span>`).join("")}</div>` : ""}
      ${time ? `<div class="ui-feedback-item__time">${escapeHtml(time)}</div>` : ""}
      <div class="ui-feedback-item__code" title="D\xF2ng code \u0111\u1EA7u c\u1EE7a component"><code>${escapeHtml(item.codeLine || getItemCodeLine(item) || item.tag || "Kh\xF4ng x\xE1c \u0111\u1ECBnh")}</code></div>
    </div>` : "";
    const typeLabel = item.type === "edit" ? "S\u1EEDa ch\u1EEF" : item.type === "css" ? "CSS" : item.type === "image" ? "H\xECnh \u1EA3nh" : "Ghi ch\xFA";
    const targetPreview = item.type === "css" ? "Thay \u0111\u1ED5i style c\u1EE7a ph\u1EA7n t\u1EED n\xE0y" : item.targetText || "Kh\xF4ng c\xF3 n\u1ED9i dung xem tr\u01B0\u1EDBc";
    return `<article class="ui-feedback-item ${expanded ? "is-expanded" : ""}" data-comment-id="${escapeAttribute(item.id)}" tabindex="0" aria-label="M\u1EDF ph\u1EA7n t\u1EED ${escapeAttribute(item.tag || item.selector)}">
      <div class="ui-feedback-item__meta">
        <div class="ui-feedback-item__identity"><span class="ui-feedback-item__selector" title="${escapeAttribute(item.selector)}">${escapeHtml(item.selector)}</span><button class="ui-feedback-copy-selector" data-copy-selector="${escapeAttribute(item.selector)}" aria-label="Copy selector" title="Copy selector">\u29C9</button></div>
        <div class="ui-feedback-item__badges"><span class="ui-feedback-category-chip">${escapeHtml(typeLabel)}</span><span class="ui-feedback-category-chip ui-feedback-category-chip--muted">${escapeHtml(category)}</span></div>
      </div>
      <p class="ui-feedback-item__target">${escapeHtml(item.tag)} <span aria-hidden="true">\xB7</span> ${escapeHtml(targetPreview)}</p>
      ${content}
      ${details}
      <div class="ui-feedback-item__actions">
        <button class="ui-feedback-mini ui-feedback-mini--details" data-toggle-comment="${escapeAttribute(item.id)}" aria-expanded="${expanded ? "true" : "false"}">${expanded ? "\u1EA8n chi ti\u1EBFt" : "Chi ti\u1EBFt"} <span aria-hidden="true">${expanded ? "\u2303" : "\u2304"}</span></button>
        <span class="ui-feedback-item__action-spacer"></span>
        ${!["edit", "css", "image"].includes(item.type) ? `<button class="ui-feedback-mini" data-edit-comment="${escapeAttribute(item.id)}">${ICONS.edit} S\u1EEDa</button>` : ""}
        <button class="ui-feedback-mini" data-delete-comment="${escapeAttribute(item.id)}">${ICONS.trash} X\xF3a</button>
      </div>
    </article>`;
  }
  function renderGroupedComments(items) {
    const grouped = items.reduce((groups, item) => {
      const page = item.page || location.pathname || "/";
      (groups[page] || (groups[page] = [])).push(item);
      return groups;
    }, {});
    return Object.entries(grouped).map(([page, pageItems]) => {
      return `<section class="ui-feedback-group"><div class="ui-feedback-group__name"><span title="${escapeAttribute(page)}">${escapeHtml(page)}</span><span>${pageItems.length}</span></div>${pageItems.map(renderItem).join("")}</section>`;
    }).join("");
  }
  function renderCategoryOptions(selected = "all") {
    return `<option value="all" ${selected === "all" ? "selected" : ""}>T\u1EA5t c\u1EA3 ph\xE2n lo\u1EA1i</option>${FEEDBACK_CATEGORIES.map((category) => `<option value="${category.value}" ${selected === category.value ? "selected" : ""}>${category.label}</option>`).join("")}`;
  }
  function editComment(id) {
    const item = state.comments.find((comment) => comment.id === id);
    if (!item) return;
    if ((item.page || "/") !== (location.pathname || "/")) {
      ctx.showToast(`Feedback n\u1EB1m \u1EDF trang ${item.page || "/"}`);
      return;
    }
    const element = resolveSelector(item.selector);
    if (!element) {
      ctx.showToast("Kh\xF4ng t\xECm th\u1EA5y ph\u1EA7n t\u1EED \u0111\u1EC3 s\u1EEDa feedback");
      return;
    }
    ctx.openModalWithExisting(element, ["css", "image"].includes(item.type) ? item.type : "comment", item);
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
    ctx.placeMarkers();
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
      ctx.placeMarkers();
      ctx.showToast("\u0110\xE3 ho\xE0n t\xE1c x\xF3a");
      return;
    }
    if (entry.type === "export-clear") {
      state.comments.splice(0, state.comments.length, ...entry.items);
      ctx.persist();
      ctx.renderToolbar();
      state.panelOpen = true;
      ctx.renderPanel();
      ctx.placeMarkers();
      ctx.showToast(`\u0110\xE3 kh\xF4i ph\u1EE5c ${entry.items.length} m\u1EE5c`);
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
    ctx.placeMarkers();
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
  function exportImageValue(item) {
    if (item.imageSourceType === "upload" || String(item.value || "").startsWith("data:image/")) {
      return "[\u1EA2nh upload local \u2014 d\xF9ng \u0111\xFAng \u1EA3nh \u0111\xE3 ch\u1ECDn trong phi\xEAn review]";
    }
    return item.value || "";
  }
  function tableValue(value, fallback = "\u2014") {
    const text = String(value ?? "").trim();
    return (text || fallback).replace(/\|/g, "\\|").replace(/\r?\n/g, "<br>");
  }
  function codeTableValue(value, fallback = "\u2014") {
    const text = String(value ?? "").trim();
    return (text || fallback).replace(/\|/g, "\\|").replace(/`/g, "\\`").replace(/\r?\n/g, " ");
  }
  function inlineCode(value, fallback = "\u2014") {
    const text = String(value ?? "").trim();
    return (text || fallback).replace(/`/g, "\\`").replace(/\r?\n/g, " ");
  }
  function proseValue(value, fallback = "\u2014") {
    const text = String(value ?? "").trim();
    return (text || fallback).replace(/\r?\n/g, "  \n");
  }
  function parseCssText(value) {
    return String(value || "").split(";").reduce((result, declaration) => {
      const separator = declaration.indexOf(":");
      if (separator < 1) return result;
      const property = declaration.slice(0, separator).trim().toLowerCase();
      const cssValue = declaration.slice(separator + 1).trim();
      if (property) result[property] = cssValue;
      return result;
    }, {});
  }
  function cssChanges(item) {
    const before = parseCssText(item.oldValue || item.originalValue || item.targetText);
    const after = parseCssText(item.value);
    return [.../* @__PURE__ */ new Set([...Object.keys(before), ...Object.keys(after)])].filter((property) => before[property] !== after[property]).map((property) => ({ property, before: before[property] || "", after: after[property] || "" }));
  }
  function renderLocation(item) {
    return [
      `- **Trang:** \`${inlineCode(item.page || "/")}\``,
      `- **Ph\u1EA7n t\u1EED:** ${escapeMarkdown(item.tag || "Kh\xF4ng x\xE1c \u0111\u1ECBnh")}`,
      `- **Selector:** \`${inlineCode(item.selector || "")}\``,
      `- **D\xF2ng code nh\u1EADn di\u1EC7n:** \`${inlineCode(item.codeLine || ctx.getItemCodeLine?.(item) || item.tag || "")}\``,
      item.viewport ? `- **Viewport:** \`${inlineCode(item.viewport)}\`${item.scrollY !== void 0 ? ` \xB7 scroll Y \`${Math.round(item.scrollY)}px\`` : ""}` : ""
    ].filter(Boolean);
  }
  function renderItemMarkdown(item, index) {
    const typeLabel = item.type === "edit" ? "S\u1EEDa n\u1ED9i dung" : item.type === "css" ? "\u0110i\u1EC1u ch\u1EC9nh CSS" : item.type === "image" ? "Thay h\xECnh \u1EA3nh" : "Ghi ch\xFA y\xEAu c\u1EA7u";
    const lines = [`### ${index + 1}. ${typeLabel}: ${escapeMarkdown(item.tag || "Element")}`, ""];
    lines.push(...renderLocation(item), "");
    if (item.type === "edit") {
      lines.push("#### N\u1ED9i dung c\u1EA7n c\u1EADp nh\u1EADt", "");
      lines.push("| Hi\u1EC7n t\u1EA1i | Mong mu\u1ED1n |", "|---|---|");
      lines.push(`| ${tableValue(item.oldValue || item.targetText)} | ${tableValue(item.value)} |`, "");
    } else if (item.type === "css") {
      const changes = cssChanges(item);
      lines.push("#### CSS c\u1EA7n c\u1EADp nh\u1EADt", "");
      if (changes.length) {
        lines.push("| Thu\u1ED9c t\xEDnh | Hi\u1EC7n t\u1EA1i | Mong mu\u1ED1n |", "|---|---|---|");
        changes.forEach((change) => lines.push(`| \`${codeTableValue(change.property)}\` | \`${codeTableValue(change.before)}\` | \`${codeTableValue(change.after)}\` |`));
        lines.push("", "```css", `${item.selector || "/* selector ch\u01B0a x\xE1c \u0111\u1ECBnh */"} {`);
        changes.forEach((change) => {
          lines.push(change.after ? `  ${change.property}: ${change.after};` : `  /* X\xF3a ${change.property} */`);
        });
        lines.push("}", "```", "");
      } else {
        lines.push(`- **CSS mong mu\u1ED1n:** \`${inlineCode(item.value || "Kh\xF4ng c\xF3 thay \u0111\u1ED5i")}\``, "");
      }
    } else if (item.type === "image") {
      const imageState = item.newImageState || {};
      const position = imageState.position || (() => {
        const raw = imageState.objectPosition || imageState.backgroundPosition || "";
        const parts = String(raw).match(/(-?[0-9.]+)%\s+(-?[0-9.]+)%/);
        return parts ? { x: Number(parts[1]), y: Number(parts[2]) } : null;
      })();
      const positionValue = position ? `${Math.round(Number(position.x))}% ${Math.round(Number(position.y))}%` : imageState.objectPosition || imageState.backgroundPosition || "";
      const zoomValue = Number.isFinite(Number(imageState.zoom)) ? `${Math.round(Number(imageState.zoom))}%` : "";
      const transform = imageState.transform || "";
      lines.push("#### H\xECnh \u1EA3nh c\u1EA7n c\u1EADp nh\u1EADt", "");
      lines.push(`- **\u1EA2nh hi\u1EC7n t\u1EA1i:** ${proseValue(item.targetText || "Kh\xF4ng c\xF3")}`);
      lines.push(`- **\u1EA2nh mong mu\u1ED1n:** ${proseValue(exportImageValue(item))}`);
      if (positionValue) lines.push(`- **V\u1ECB tr\xED crop:** \`${inlineCode(positionValue)}\``);
      if (zoomValue) lines.push(`- **M\u1EE9c thu ph\xF3ng crop:** \`${inlineCode(zoomValue)}\``);
      if (imageState.crop?.frame) lines.push(`- **Khung crop:** \`${inlineCode(imageState.crop.frame)}\``);
      if (transform) lines.push(`- **Transform gi\u1EEF l\u1EA1i:** \`${inlineCode(transform)}\``);
      lines.push("");
    } else {
      lines.push("#### \xDD \u0111\u1ECBnh thay \u0111\u1ED5i", "");
      lines.push(proseValue(item.comment || "Ch\u01B0a nh\u1EADp y\xEAu c\u1EA7u."), "");
    }
    lines.push(`- **Nh\xF3m:** ${categoryLabel(item.category, item.type)}`);
    lines.push(`- **Th\u1EDDi \u0111i\u1EC3m ghi nh\u1EADn:** ${item.updatedAt ? formatDate(new Date(item.updatedAt)) : "N/A"}`);
    lines.push("");
    return lines;
  }
  function buildMarkdown({ href = globalThis.location?.href || "", now = /* @__PURE__ */ new Date() } = {}) {
    const counts = state.comments.reduce((result, item) => {
      result[item.type || "comment"] = (result[item.type || "comment"] || 0) + 1;
      return result;
    }, {});
    const lines = [
      "# Y\xEAu c\u1EA7u c\u1EADp nh\u1EADt UI/UX",
      "",
      "> \u0110\xE2y l\xE0 t\xE0i li\u1EC7u y\xEAu c\u1EA7u ch\u1EC9nh s\u1EEDa \u0111\u01B0\u1EE3c t\u1EA1o t\u1EEB UI Feedback Tool. H\xE3y th\u1EF1c hi\u1EC7n \u0111\xFAng c\xE1c thay \u0111\u1ED5i b\xEAn d\u01B0\u1EDBi v\xE0 gi\u1EEF nguy\xEAn nh\u1EEFng ph\u1EA7n kh\xF4ng \u0111\u01B0\u1EE3c \u0111\u1EC1 c\u1EADp.",
      "",
      "## Nguy\xEAn t\u1EAFc th\u1EF1c hi\u1EC7n",
      "",
      "1. X\xE1c \u0111\u1ECBnh ph\u1EA7n t\u1EED b\u1EB1ng trang, selector v\xE0 d\xF2ng code nh\u1EADn di\u1EC7n.",
      "2. \u01AFu ti\xEAn gi\xE1 tr\u1ECB trong c\u1ED9t **Mong mu\u1ED1n**; c\u1ED9t **Hi\u1EC7n t\u1EA1i** ch\u1EC9 d\xF9ng \u0111\u1EC3 \u0111\u1ED1i chi\u1EBFu.",
      "3. Gi\u1EEF responsive, accessibility v\xE0 h\xE0nh vi hi\u1EC7n c\xF3 n\u1EBFu y\xEAu c\u1EA7u kh\xF4ng n\xF3i kh\xE1c.",
      "4. Kh\xF4ng t\u1EF1 thay \u0111\u1ED5i n\u1ED9i dung, m\xE0u s\u1EAFc, kho\u1EA3ng c\xE1ch ho\u1EB7c h\xECnh \u1EA3nh ngo\xE0i ph\u1EA1m vi t\xE0i li\u1EC7u.",
      "",
      "## Th\xF4ng tin phi\xEAn review",
      "",
      `- **URL xu\u1EA5t file:** ${href || "Kh\xF4ng x\xE1c \u0111\u1ECBnh"}`,
      `- **Ng\xE0y xu\u1EA5t:** ${formatDate(now)}`,
      `- **T\u1ED5ng s\u1ED1 thay \u0111\u1ED5i:** ${state.comments.length}`,
      `- **Th\xE0nh ph\u1EA7n:** ${counts.comment || 0} ghi ch\xFA \xB7 ${counts.edit || 0} s\u1EEDa n\u1ED9i dung \xB7 ${counts.css || 0} CSS \xB7 ${counts.image || 0} h\xECnh \u1EA3nh`,
      "",
      "## Danh s\xE1ch thay \u0111\u1ED5i",
      ""
    ];
    const grouped = state.comments.reduce((groups, item) => {
      const key = item.page || "/";
      (groups[key] || (groups[key] = [])).push(item);
      return groups;
    }, {});
    Object.entries(grouped).forEach(([page, items]) => {
      lines.push(`## Trang: ${escapeMarkdown(page)}`, "");
      items.forEach((item, index) => lines.push(...renderItemMarkdown(item, index)));
    });
    return lines.join("\n").replace(/\n\n\n+/g, "\n\n").trimEnd() + "\n";
  }
  function exportMarkdown() {
    if (!state.comments.length) {
      ctx.showToast("Ch\u01B0a c\xF3 thay \u0111\u1ED5i \u0111\u1EC3 xu\u1EA5t");
      return;
    }
    const markdown = buildMarkdown();
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `ui-changes-${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-").slice(0, 19)}.md`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1e3);
    ctx.showToast(`\u0110\xE3 xu\u1EA5t ${state.comments.length} thay \u0111\u1ED5i; danh s\xE1ch v\u1EABn \u0111\u01B0\u1EE3c gi\u1EEF l\u1EA1i`);
  }
  return { exportMarkdown, buildMarkdown, renderItemMarkdown, cssChanges };
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
    if (match) return `#${[match[1], match[2], match[3]].map((n) => Math.max(0, Math.min(255, Number(n))).toString(16).padStart(2, "0")).join("")}`;
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
    const supportsTranslate = "translate" in state.target.style || typeof CSS !== "undefined" && CSS.supports?.("translate", "0 0");
    if (supportsTranslate) state.target.style.setProperty("translate", `${x}px ${y}px`);
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
  function clampPercent(value, fallback = 50) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.max(0, Math.min(100, number)) : fallback;
  }
  function normalizePosition(position = { x: 50, y: 50 }) {
    return { x: clampPercent(position.x, 50), y: clampPercent(position.y, 50) };
  }
  function parseImagePosition(value) {
    const parts = String(value || "").trim().toLowerCase().split(/\s+/).filter(Boolean);
    const convert = (part, fallback, axis) => {
      if (!part) return fallback;
      if (axis === "x" && part === "left" || axis === "y" && part === "top") return 0;
      if (part === "center") return 50;
      if (axis === "x" && part === "right" || axis === "y" && part === "bottom") return 100;
      return clampPercent(parseFloat(part), fallback);
    };
    const horizontal = parts.find((part) => ["left", "right"].includes(part));
    const vertical = parts.find((part) => ["top", "bottom"].includes(part));
    if (horizontal || vertical) return normalizePosition({ x: convert(horizontal || "center", 50, "x"), y: convert(vertical || "center", 50, "y") });
    return normalizePosition({ x: convert(parts[0], 50, "x"), y: convert(parts[1], 50, "y") });
  }
  function isImageElement(element) {
    return element instanceof Element && (element instanceof HTMLImageElement || element.tagName.toLowerCase() === "img");
  }
  function clampZoom(value) {
    return Math.max(30, Math.min(300, Number(value) || 100));
  }
  function parseImageZoom(value) {
    const match = String(value || "").match(/scale(?:3d)?\(\s*([0-9.]+)/i);
    return match ? clampZoom(Number(match[1]) * 100) : 100;
  }
  function parseBackgroundZoom(value) {
    const match = String(value || "").trim().match(/([0-9.]+)%/);
    return match ? clampZoom(Number(match[1])) : 100;
  }
  function captureImageState(element) {
    if (!(element instanceof Element)) return { kind: "background", src: "", srcset: "", backgroundImage: "", backgroundPosition: "", backgroundSize: "", position: { x: 50, y: 50 }, zoom: 100 };
    let computed = {};
    try {
      computed = getComputedStyle(element);
    } catch {
    }
    if (isImageElement(element)) {
      const objectPosition = element.style.objectPosition || computed.objectPosition || "50% 50%";
      const transform = element.style.transform || "";
      const effectiveTransform = computed.transform || "none";
      return {
        kind: "src",
        src: element.getAttribute("src") || "",
        effectiveSrc: element.currentSrc || "",
        srcset: element.getAttribute("srcset") || "",
        backgroundImage: "",
        objectPosition,
        objectFit: element.style.objectFit || computed.objectFit || "",
        transform,
        effectiveObjectPosition: computed.objectPosition || objectPosition,
        effectiveTransform,
        position: parseImagePosition(objectPosition),
        zoom: transform ? parseImageZoom(transform) : parseImageZoom(effectiveTransform)
      };
    }
    const backgroundImage = element.style.backgroundImage || computed.backgroundImage || "";
    const backgroundPosition = element.style.backgroundPosition || computed.backgroundPosition || "50% 50%";
    const backgroundSize = element.style.backgroundSize || computed.backgroundSize || "cover";
    return {
      kind: "background",
      src: imageBackgroundSource(backgroundImage),
      srcset: "",
      backgroundImage: element.style.backgroundImage || "",
      backgroundPosition,
      backgroundSize,
      effectiveBackgroundPosition: computed.backgroundPosition || backgroundPosition,
      effectiveBackgroundSize: computed.backgroundSize || backgroundSize,
      position: parseImagePosition(backgroundPosition),
      zoom: parseBackgroundZoom(backgroundSize)
    };
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
    const normalized = normalizePosition(position);
    const value = `${normalized.x}% ${normalized.y}%`;
    if (isImageElement(element)) {
      element.style.objectFit = "cover";
      element.style.objectPosition = value;
    } else {
      element.style.backgroundPosition = value;
    }
  }
  function applyImageZoom(element, zoom = 100, baseTransform = "") {
    if (!(element instanceof Element)) return;
    const safeZoom = clampZoom(zoom);
    if (isImageElement(element)) {
      const base = String(baseTransform || "").trim();
      const withoutScale = base.replace(/\bscale(?:3d|x|y)?\([^)]*\)/gi, "").replace(/\s+/g, " ").trim();
      const preserved = withoutScale && withoutScale !== "none" ? `${withoutScale} ` : "";
      element.style.transformOrigin = "50% 50%";
      element.style.transform = `${preserved}scale(${safeZoom / 100})`;
      element.style.willChange = "transform";
    } else {
      element.style.backgroundSize = safeZoom === 100 ? "cover" : `${safeZoom}% auto`;
    }
  }
  function applyImageState(element, snapshot) {
    if (!(element instanceof Element) || !snapshot) return;
    if (snapshot.kind === "src") {
      if (snapshot.src) element.setAttribute("src", snapshot.src);
      else element.removeAttribute("src");
      if (snapshot.srcset) element.setAttribute("srcset", snapshot.srcset);
      else element.removeAttribute("srcset");
      const position = snapshot.objectPosition || (snapshot.position ? `${clampPercent(snapshot.position.x)}% ${clampPercent(snapshot.position.y)}%` : snapshot.effectiveObjectPosition);
      if (position) element.style.objectPosition = position;
      if (snapshot.objectFit) element.style.objectFit = snapshot.objectFit;
      if (snapshot.transform) element.style.transform = snapshot.transform;
      else if (snapshot.zoom !== void 0 && Number(snapshot.zoom) !== 100) applyImageZoom(element, snapshot.zoom);
      else element.style.removeProperty("transform");
    } else {
      element.style.backgroundImage = snapshot.backgroundImage || (snapshot.src ? `url("${snapshot.src.replace(/"/g, '\\"')}")` : "");
      const position = snapshot.backgroundPosition || (snapshot.position ? `${clampPercent(snapshot.position.x)}% ${clampPercent(snapshot.position.y)}%` : snapshot.effectiveBackgroundPosition);
      if (position) element.style.backgroundPosition = position;
      if (snapshot.backgroundSize) element.style.backgroundSize = snapshot.backgroundSize;
      else if (snapshot.zoom !== void 0 && Number(snapshot.zoom) !== 100) applyImageZoom(element, snapshot.zoom);
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
      if (snapshot.transform) element.style.transform = snapshot.transform;
      else element.style.removeProperty("transform");
      element.style.removeProperty("transform-origin");
      element.style.removeProperty("will-change");
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
    if (value.startsWith("data:image/")) {
      try {
        const payload = value.split(",", 2)[1] || "";
        const bytes = /;base64,/i.test(value) ? Math.floor(payload.length * 3 / 4) - (payload.endsWith("==") ? 2 : payload.endsWith("=") ? 1 : 0) : new TextEncoder().encode(decodeURIComponent(payload)).length;
        return bytes <= 1024 * 1024;
      } catch {
        return false;
      }
    }
    try {
      return ["http:", "https:"].includes(new URL(value, location.href).protocol);
    } catch {
      return false;
    }
  }
  return { parseImagePosition, parseImageZoom, captureImageState, applyImageSource, applyImagePosition, applyImageZoom, applyImageState, restoreImageState, validateImageSource, normalizePosition, clampZoom };
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
    const { element, outline, outlinePriority, outlineOffset, outlineOffsetPriority } = state.highlight;
    if (element?.style) {
      if (outline) element.style.setProperty("outline", outline, outlinePriority);
      else element.style.removeProperty("outline");
      if (outlineOffset) element.style.setProperty("outline-offset", outlineOffset, outlineOffsetPriority);
      else element.style.removeProperty("outline-offset");
    }
    state.highlight = null;
  }
  function highlight(element) {
    if (!(element instanceof Element) || element.closest("#ui-feedback-host")) return;
    if (state.highlight?.element === element) return;
    clearHighlight();
    state.highlight = {
      element,
      outline: element.style.getPropertyValue("outline"),
      outlinePriority: element.style.getPropertyPriority("outline"),
      outlineOffset: element.style.getPropertyValue("outline-offset"),
      outlineOffsetPriority: element.style.getPropertyPriority("outline-offset")
    };
    element.style.setProperty("outline", `2px solid ${config.accent}`, "important");
    element.style.setProperty("outline-offset", "3px", "important");
  }
  function beginPicking(mode, opts = {}) {
    clearResumeTimer();
    state.panelOpen = false;
    state.mode = mode;
    state.picking = true;
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

// src/ui/panel.js
function createPanelController(ctx) {
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
      state.panelPosition = clampDelta(
        panel,
        drag.x + moveEvent.clientX - drag.clientX,
        drag.y + moveEvent.clientY - drag.clientY,
        state.panelPosition || { x: 0, y: 0 }
      );
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
  return { applyPanelPosition, resetPosition, handlePointerDown };
}

// src/ui/modal.js
function createModalController(ctx) {
  const { state, root } = ctx;
  function clampDelta(modal, nextX, nextY, current) {
    if (!modal) return { x: nextX, y: nextY };
    const rect = modal.getBoundingClientRect();
    const margin = 8;
    const dx = Math.max(margin - rect.left, Math.min(window.innerWidth - margin - rect.right, nextX - current.x));
    const dy = Math.max(margin - rect.top, Math.min(window.innerHeight - margin - rect.bottom, nextY - current.y));
    return { x: current.x + dx, y: current.y + dy };
  }
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
      state.modalPosition = clampDelta(
        modal,
        drag.x + moveEvent.clientX - drag.clientX,
        drag.y + moveEvent.clientY - drag.clientY,
        state.modalPosition || { x: 0, y: 0 }
      );
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
    renderModal
  } = ctx;
  if (!state.active) {
    root.innerHTML = "";
    return;
  }
  const undoCount = state.undoStack.length;
  const undoBadge = undoCount ? `<span class="ui-feedback-badge ui-feedback-badge--undo">${undoCount}</span>` : "";
  const coachmark = state.coachmarkVisible ? '<aside class="ui-feedback-coachmark" role="status"><strong>3 b\u01B0\u1EDBc \u0111\u1EC3 ghi y\xEAu c\u1EA7u</strong><ol class="ui-feedback-coachmark__steps"><li>Ch\u1ECDn Ghi ch\xFA, S\u1EEDa ch\u1EEF, Ch\u1EC9nh CSS ho\u1EB7c \u0110\u1ED5i \u1EA3nh.</li><li>B\u1EA5m v\xE0o ph\u1EA7n t\u1EED c\u1EA7n thay \u0111\u1ED5i v\xE0 ch\u1EC9nh tr\u1EF1c ti\u1EBFp.</li><li>M\u1EDF Danh s\xE1ch r\u1ED3i b\u1EA5m Xu\u1EA5t .md.</li></ol><button type="button" data-coachmark-dismiss>\u0110\xE3 hi\u1EC3u</button></aside>' : "";
  const bubble = `<button class="ui-feedback-toolbar-bubble" data-action="collapse" aria-label="M\u1EDF thanh c\xF4ng c\u1EE5" title="M\u1EDF thanh c\xF4ng c\u1EE5">${ICONS.grip}<span class="ui-feedback-badge" ${state.comments.length ? "" : "hidden"}>${state.comments.length}</span></button>`;
  const dock = `<div class="ui-feedback-toolbar" role="toolbar" aria-label="UI Feedback tools" style="${getToolbarStyle()}">
      <div class="ui-feedback-toolbar-grip" data-drag-handle aria-label="K\xE9o \u0111\u1EC3 di chuy\u1EC3n toolbar">${ICONS.grip}</div>
      <button class="ui-feedback-tool ${state.panelOpen ? "is-active" : ""}" data-action="list" aria-label="M\u1EDF danh s\xE1ch thay \u0111\u1ED5i" title="Danh s\xE1ch thay \u0111\u1ED5i">${ICONS.clipboard}<span class="ui-feedback-tool__label">Danh s\xE1ch</span><span class="ui-feedback-badge" ${state.comments.length ? "" : "hidden"}>${state.comments.length}</span></button>
      <button class="ui-feedback-tool ${state.picking && state.mode === "comment" ? "is-active" : ""}" data-action="comment" aria-label="Ghi ch\xFA y\xEAu c\u1EA7u" title="Ghi ch\xFA y\xEAu c\u1EA7u">${ICONS.comment}<span class="ui-feedback-tool__label">Ghi ch\xFA</span></button>
      <button class="ui-feedback-tool ${state.picking && state.mode === "edit" ? "is-active" : ""}" data-action="edit" aria-label="S\u1EEDa n\u1ED9i dung" title="S\u1EEDa n\u1ED9i dung">${ICONS.pencil}<span class="ui-feedback-tool__label">S\u1EEDa ch\u1EEF</span></button>
      <button class="ui-feedback-tool ${state.picking && state.mode === "css" ? "is-active" : ""}" data-action="css" aria-label="Ch\u1EC9nh CSS" title="Ch\u1EC9nh CSS">${ICONS.paintbrush}<span class="ui-feedback-tool__label">Ch\u1EC9nh CSS</span></button>
      <button class="ui-feedback-tool ${state.picking && state.mode === "image" ? "is-active" : ""}" data-action="image" aria-label="\u0110\u1ED5i h\xECnh \u1EA3nh" title="\u0110\u1ED5i h\xECnh \u1EA3nh">${ICONS.image}<span class="ui-feedback-tool__label">\u0110\u1ED5i \u1EA3nh</span></button>
      ${undoCount ? `<button class="ui-feedback-tool" data-action="undo" aria-label="Ho\xE0n t\xE1c thay \u0111\u1ED5i g\u1EA7n nh\u1EA5t" title="Ho\xE0n t\xE1c (${undoCount})">${ICONS.undo}<span class="ui-feedback-tool__label">Ho\xE0n t\xE1c</span>${undoBadge}</button>` : ""}
      <button class="ui-feedback-tool" data-action="collapse" aria-label="Thu g\u1ECDn thanh c\xF4ng c\u1EE5" title="Thu g\u1ECDn">${ICONS.collapse}</button>
    </div>`;
  root.innerHTML = `${state.picking ? '<div class="ui-feedback-picker-layer" data-picker-layer aria-hidden="true"></div>' : ""}${state.collapsed ? bubble : dock}${coachmark}<div data-ui-feedback-panel></div><div data-ui-feedback-modal></div><div data-ui-feedback-toast></div>`;
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
  let panelController;
  let modalController;
  let cssEditor;
  const imageEditor = createImageEditor();
  let pickerController;
  let themeMedia = null;
  let themeChangeHandler = null;
  let domObserver = null;
  let reapplyTimer = null;
  let focusBeforeModal = null;
  const host = document.createElement("div");
  host.id = "ui-feedback-host";
  host.dataset.uiFeedbackIgnore = "true";
  const shadow = host.attachShadow({ mode: "open" });
  shadow.innerHTML = `<style>${STYLESHEET}</style><div class="ui-feedback-root${state.theme === "dark" ? " is-dark" : ""}"></div><div class="ui-feedback-marker-layer${state.theme === "dark" ? " is-dark" : ""}" aria-label="C\xE1c v\u1ECB tr\xED feedback"></div>`;
  const root = shadow.querySelector(".ui-feedback-root");
  const markerLayer = shadow.querySelector(".ui-feedback-marker-layer");
  root.style.setProperty("--ui-feedback-accent", config.accent);
  markerLayer.style.setProperty("--ui-feedback-accent", config.accent);
  document.documentElement.appendChild(host);
  if (config.theme === "auto") {
    themeMedia = window.matchMedia("(prefers-color-scheme: dark)");
    themeChangeHandler = (e) => {
      state.theme = e.matches ? "dark" : "light";
      root.classList.toggle("is-dark", state.theme === "dark");
      markerLayer.classList.toggle("is-dark", state.theme === "dark");
    };
    if (themeMedia.addEventListener) themeMedia.addEventListener("change", themeChangeHandler);
    else themeMedia.addListener?.(themeChangeHandler);
  }
  let dragState = null;
  let toolbarPos = { side: config.position === "left" ? "left" : "right", inset: 20, top: null };
  function getToolbarStyle() {
    const horizontal = `${toolbarPos.side}:${toolbarPos.inset}px;`;
    if (toolbarPos.top !== null) {
      return `${horizontal}top:${toolbarPos.top}px;transform:none;`;
    }
    return `${horizontal}bottom:20px;`;
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
      if (item.type === "edit" && element.textContent !== (item.value || "")) element.textContent = item.value || "";
      else if (item.type === "css" && element.style.cssText !== (item.value || "")) element.style.cssText = item.value || "";
      else if (item.type === "image") {
        const snapshot = { ...item.newImageState || { kind: "src" }, src: item.value || item.newImageState?.src || "" };
        applyImageState(element, snapshot);
      }
    });
  }
  function renderToolbar2() {
    renderToolbar({
      state,
      root,
      getToolbarStyle,
      renderPanel,
      renderModal
    });
  }
  function dispatchToolbarAction(action) {
    if (action === "activate") toggle();
    if (action === "list") togglePanel();
    if (action === "undo") undoAction();
    if (action === "comment") toggleMode("comment");
    if (action === "edit") toggleMode("edit");
    if (action === "css") toggleMode("css");
    if (action === "image") toggleMode("image");
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
  function renderGroupedComments(items) {
    return commentsController.renderGroupedComments(items);
  }
  function renderPanel() {
    const mount = root.querySelector("[data-ui-feedback-panel]");
    if (!mount || !state.panelOpen) return;
    const content = renderGroupedComments(state.comments);
    mount.innerHTML = `<aside class="ui-feedback-panel" aria-label="Danh s\xE1ch thay \u0111\u1ED5i">
      <header class="ui-feedback-panel__header" data-panel-drag-handle title="K\xE9o v\xF9ng ti\xEAu \u0111\u1EC1 \u0111\u1EC3 di chuy\u1EC3n c\u1EEDa s\u1ED5"><div class="ui-feedback-window-heading"><span class="ui-feedback-window-grip" aria-hidden="true">${ICONS.grip}</span><div><strong>Danh s\xE1ch thay \u0111\u1ED5i</strong><small>${state.comments.length} m\u1EE5c \u0111\xE3 ghi nh\u1EADn <span class="ui-feedback-drag-hint" title="K\xE9o \u0111\u1EC3 di chuy\u1EC3n">K\xE9o</span></small></div></div><span class="ui-feedback-panel__actions"><button class="ui-feedback-export-button" data-panel-action="export" aria-label="Xu\u1EA5t file Markdown" title="Xu\u1EA5t file Markdown">${ICONS.download}<span>Xu\u1EA5t .md</span></button><button class="ui-feedback-icon-button" data-panel-action="reset-position" aria-label="\u0110\u01B0a c\u1EEDa s\u1ED5 v\u1EC1 v\u1ECB tr\xED m\u1EB7c \u0111\u1ECBnh" title="\u0110\u1EB7t l\u1EA1i v\u1ECB tr\xED">${ICONS.undo}</button><button class="ui-feedback-icon-button" data-panel-action="close" aria-label="\u0110\xF3ng c\u1EEDa s\u1ED5">${ICONS.close}</button></span></header>
      <div class="ui-feedback-panel__intro">File Markdown s\u1EBD m\xF4 t\u1EA3 r\xF5 ph\u1EA7n t\u1EED, tr\u1EA1ng th\xE1i hi\u1EC7n t\u1EA1i v\xE0 thay \u0111\u1ED5i mong mu\u1ED1n \u0111\u1EC3 AI c\xF3 th\u1EC3 th\u1EF1c hi\u1EC7n ngay.</div>
      <div class="ui-feedback-panel__body">${content || '<div class="ui-feedback-empty">Ch\u01B0a c\xF3 thay \u0111\u1ED5i. Ch\u1ECDn m\u1ED9t c\xF4ng c\u1EE5 tr\xEAn thanh d\u01B0\u1EDBi r\u1ED3i b\u1EA5m v\xE0o ph\u1EA7n t\u1EED c\u1EA7n ch\u1EC9nh.</div>'}</div>
    </aside>`;
    applyPanelPosition();
    mount.onclick = handlePanelClick;
    mount.onpointerdown = handlePanelPointerDown;
    mount.onkeydown = handlePanelKeydown;
  }
  function applyPanelPosition() {
    return panelController.applyPanelPosition();
  }
  function handlePanelPointerDown(event) {
    return panelController.handlePointerDown(event);
  }
  function handlePanelClick(event) {
    const target = event.target.closest("[data-panel-action], [data-edit-comment], [data-delete-comment], [data-copy-selector], [data-toggle-comment], [data-comment-id]");
    if (!target) return;
    event.stopPropagation();
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
      copyText(target.dataset.copySelector).then((copied) => showToast(copied ? "\u0110\xE3 copy selector" : "Kh\xF4ng th\u1EC3 copy selector"));
      return;
    }
    if (target.dataset.panelAction === "close") togglePanel(false);
    else if (target.dataset.panelAction === "export") exportMarkdown();
    else if (target.dataset.editComment) editComment(target.dataset.editComment);
    else if (target.dataset.deleteComment) deleteComment(target.dataset.deleteComment);
    else {
      const card = event.target.closest("[data-comment-id]");
      if (card) focusComment(card.dataset.commentId);
    }
  }
  function handlePanelKeydown(event) {
    const card = event.target.closest?.("[data-comment-id]");
    if (card === event.target && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      focusComment(card.dataset.commentId);
    }
  }
  function getItemCodeLine(item) {
    return commentsController.getItemCodeLine(item);
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
    if ((item.page || "/") !== (location.pathname || "/")) {
      showToast(`Feedback n\u1EB1m \u1EDF trang ${item.page || "/"}`);
      return;
    }
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
    let commentNumber = 0;
    const currentPage = location.pathname || "/";
    state.comments.filter((comment) => (comment.page || "/") === currentPage).forEach((comment) => {
      let el;
      try {
        el = document.querySelector(comment.selector);
      } catch {
        el = null;
      }
      if (!el) return;
      const marker = document.createElement("button");
      marker.type = "button";
      const typeClass = comment.type === "edit" ? " is-edit" : comment.type === "css" ? " is-css" : comment.type === "image" ? " is-image" : "";
      marker.className = `ui-feedback-marker${typeClass}`;
      if (comment.type === "edit") marker.textContent = "\u270E";
      else if (comment.type === "css") marker.textContent = "\u2726";
      else if (comment.type === "image") marker.textContent = "\u25A7";
      else {
        commentNumber += 1;
        marker.textContent = commentNumber;
      }
      marker.title = comment.type === "edit" ? `\u0110\xE3 s\u1EEDa text: ${safeText(comment.value, 80)}` : comment.type === "css" ? `\u0110\xE3 s\u1EEDa CSS: ${safeText(comment.value, 80)}` : comment.type === "image" ? `\u0110\xE3 thay \u1EA3nh: ${safeText(comment.value, 80)}` : `Feedback #${commentNumber}`;
      marker.dataset.commentId = comment.id;
      marker.setAttribute("aria-label", marker.title);
      marker.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        focusComment(comment.id);
      });
      positionMarker(el, marker);
      markerLayer.appendChild(marker);
      markers.push({ element: el, markerEl: marker, commentId: comment.id });
    });
  }
  function positionMarker(el, marker) {
    const rect = el.getBoundingClientRect();
    marker.style.top = `${rect.top - 8}px`;
    marker.style.left = `${rect.left - 8}px`;
  }
  function refreshMarkerPositions() {
    markers.forEach((m) => {
      if (m.element?.isConnected && m.markerEl) positionMarker(m.element, m.markerEl);
    });
  }
  function clearMarkers() {
    markers.forEach((m) => m.markerEl?.remove());
    markers.length = 0;
  }
  function selectionCandidates(element) {
    if (!(element instanceof Element)) return [];
    const candidates = [];
    let current = element;
    while (current && current instanceof Element && current !== document.body && current !== document.documentElement && candidates.length < 7) {
      if (!current.closest("#ui-feedback-host") && !current.matches("script,style,svg,path")) {
        const rect = current.getBoundingClientRect?.();
        if (!rect || rect.width >= 8 && rect.height >= 8) candidates.push(current);
      }
      current = current.parentElement;
    }
    return candidates.filter((candidate, index, list) => list.findIndex((item) => item === candidate) === index);
  }
  function selectionCandidateLabel(element) {
    const tag = targetLabel(element) || element.tagName?.toLowerCase() || "Element";
    const selector = safeText(cssPath(element), 90);
    const rect = element.getBoundingClientRect?.();
    const size = rect && rect.width && rect.height ? ` \xB7 ${Math.round(rect.width)}\xD7${Math.round(rect.height)}px` : "";
    return { tag, selector: `${selector}${size}` };
  }
  function positionSelectionChooser() {
    const chooser = root.querySelector("[data-selection-chooser]");
    const source = state.selectionChooser?.source;
    if (!chooser || !source) return;
    const rect = source.getBoundingClientRect();
    const width = Math.min(360, Math.max(260, chooser.offsetWidth || 320));
    const height = Math.min(window.innerHeight - 24, chooser.offsetHeight || 420);
    const left = Math.max(12, Math.min(window.innerWidth - width - 12, rect.left));
    const top = Math.max(12, Math.min(window.innerHeight - height - 12, rect.bottom + 10));
    chooser.style.left = `${left}px`;
    chooser.style.top = `${top}px`;
  }
  function closeSelectionChooser(resume = false) {
    root.querySelector("[data-selection-chooser]")?.remove();
    clearHighlight();
    const mode = state.selectionChooser?.mode;
    state.selectionChooser = null;
    if (resume && mode && state.active && !state.modalOpen) beginPicking(mode, { silent: true });
    renderToolbar2();
  }
  function openSelectionChooser(source, mode) {
    const candidates = selectionCandidates(source);
    if (mode === "image" || candidates.length <= 1) {
      openModal(mode === "image" ? targetForMode(source, mode) : source, mode);
      return;
    }
    stopPicking();
    state.selectionChooser = { source, mode, candidates };
    const chooser = document.createElement("div");
    chooser.className = "ui-feedback-selection-chooser";
    chooser.dataset.selectionChooser = "true";
    chooser.setAttribute("role", "dialog");
    chooser.setAttribute("aria-label", "Ch\u1ECDn ph\u1EA7n t\u1EED ch\xEDnh x\xE1c");
    chooser.innerHTML = `<header class="ui-feedback-selection-chooser__header"><div><strong>Ch\u1ECDn ph\u1EA7n t\u1EED ch\xEDnh x\xE1c</strong><small>Ch\u1ECDn \u0111\xFAng l\u1EDBp mu\u1ED1n ch\u1EC9nh s\u1EEDa</small></div><button type="button" data-selection-cancel aria-label="H\u1EE7y ch\u1ECDn">\xD7</button></header><div class="ui-feedback-selection-chooser__list">${candidates.map((candidate, index) => {
      const label = selectionCandidateLabel(candidate);
      return `<button type="button" class="ui-feedback-selection-choice" data-selection-index="${index}"><span class="ui-feedback-selection-choice__number">${index + 1}</span><span><strong>${escapeHtml(label.tag)}</strong><small>${escapeHtml(label.selector)}</small></span></button>`;
    }).join("")}</div><footer class="ui-feedback-selection-chooser__footer"><span>Ph\u1EA7n t\u1EED g\u1EA7n nh\u1EA5t hi\u1EC3n th\u1ECB tr\u01B0\u1EDBc</span><button type="button" class="ui-feedback-button" data-selection-cancel>H\u1EE7y</button></footer>`;
    root.appendChild(chooser);
    chooser.onclick = (event) => {
      const cancel = event.target.closest("[data-selection-cancel]");
      if (cancel) {
        event.preventDefault();
        closeSelectionChooser(true);
        return;
      }
      const choice = event.target.closest("[data-selection-index]");
      if (!choice) return;
      event.preventDefault();
      const candidate = state.selectionChooser?.candidates?.[Number(choice.dataset.selectionIndex)];
      const selectedMode = state.selectionChooser?.mode || mode;
      closeSelectionChooser(false);
      if (candidate) openModal(candidate, selectedMode);
    };
    chooser.onpointerover = (event) => {
      const choice = event.target.closest("[data-selection-index]");
      if (!choice) return;
      const candidate = state.selectionChooser?.candidates?.[Number(choice.dataset.selectionIndex)];
      if (candidate) highlight(candidate);
    };
    positionSelectionChooser();
    showToast("\u0110\xE3 t\xECm th\u1EA5y nhi\u1EC1u l\u1EDBp ph\u1EA7n t\u1EED. Ch\u1ECDn card/container mu\u1ED1n ch\u1EC9nh s\u1EEDa.");
  }
  function openPickedElement(rawElement) {
    if (!(rawElement instanceof Element)) return;
    const mode = state.mode;
    const target = targetForMode(rawElement, mode);
    if (!target) return;
    openSelectionChooser(target, mode);
  }
  function openModal(element, mode, existing = null) {
    stopPicking();
    state.target = element;
    state.mode = mode;
    state.modalSnapshot = mode === "css" ? { styleCssText: element?.style?.cssText || "" } : mode === "image" ? captureImageState(element) : null;
    focusBeforeModal = shadow.activeElement || document.activeElement;
    state.modalImageSource = mode === "image" ? state.modalSnapshot?.src || state.modalSnapshot?.effectiveSrc || "" : "";
    const initialPosition = mode === "image" ? state.modalSnapshot?.position || state.modalSnapshot?.objectPosition || state.modalSnapshot?.effectiveObjectPosition || state.modalSnapshot?.backgroundPosition || state.modalSnapshot?.effectiveBackgroundPosition || "50% 50%" : "50% 50%";
    state.modalImagePosition = mode === "image" ? imageEditor.normalizePosition(typeof initialPosition === "object" ? initialPosition : parseImagePosition(initialPosition)) : { x: 50, y: 50 };
    state.modalImageBaseTransform = mode === "image" ? state.modalSnapshot?.transform || state.modalSnapshot?.effectiveTransform || "" : "";
    state.modalImageZoom = mode === "image" ? imageEditor.clampZoom(state.modalSnapshot?.zoom || imageEditor.parseImageZoom(state.modalSnapshot?.transform || state.modalSnapshot?.effectiveTransform || state.modalSnapshot?.backgroundSize || "")) : 100;
    state.modalCommitted = false;
    state.cssTab = mode === "css" ? "colors" : "advanced";
    state.cssTransformBase = mode === "css" ? String(element?.style?.transform || "").replace(/\btranslate(?:3d|x|y)?\([^)]*\)/gi, "").replace(/\s+/g, " ").trim() : "";
    state.cssPosition = mode === "css" ? parseTranslatePosition(element?.style?.translate || element?.style?.transform || (element ? getComputedStyle(element).translate : "") || (element ? getComputedStyle(element).transform : "") || "") : { x: 0, y: 0 };
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
  function applyImageZoom(element, zoom = 100, baseTransform = "") {
    return imageEditor.applyImageZoom(element, zoom, baseTransform);
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
  function cssRangeValue(prop, fallback = 0) {
    const raw = String(readCssValue(prop, "") || "");
    const parsed = parseFloat(raw);
    if (!Number.isFinite(parsed)) return fallback;
    if (prop === "opacity") return parsed * 100;
    if (prop === "lineHeight" && /px$/i.test(raw)) {
      const fontSize = parseFloat(readCssValue("fontSize", "16px")) || 16;
      return parsed / fontSize;
    }
    return parsed;
  }
  function renderCssRange(label, prop, min, max, step, unit, fallback, formatter = (value) => `${value}${unit}`) {
    const value = Math.max(min, Math.min(max, cssRangeValue(prop, fallback)));
    const output = formatter(value);
    return `<div class="ui-feedback-range-row"><div class="ui-feedback-range-row__head"><span>${label}</span><output data-css-output="${prop}">${output}</output></div><input type="range" min="${min}" max="${max}" step="${step}" data-css-range-prop="${prop}" data-css-range-unit="${unit}" data-css-range-output="${prop}" value="${value}" aria-label="${label}" /></div>`;
  }
  function renderCssSelect(label, prop, options2, fallback) {
    const current = String(readCssValue(prop, fallback) || fallback);
    return `<label class="ui-feedback-css-select-row"><span>${label}</span><select data-css-select-prop="${prop}" aria-label="${label}">${options2.map((option) => `<option value="${escapeAttribute(option.value)}" ${option.value === current ? "selected" : ""}>${escapeHtml(option.label)}</option>`).join("")}</select></label>`;
  }
  function renderSpacingGroup(label, prop) {
    const min = prop === "margin" ? -160 : 0;
    return `<div class="ui-feedback-css-subsection"><div class="ui-feedback-css-subtitle">${label}</div><div class="ui-feedback-spacing-grid">${CSS_SPACING_SIDES.map((side) => {
      const cssProp = `${prop}${side.prop}`;
      const value = Math.max(min, Math.min(160, cssNumberValue(cssProp, 0)));
      return `<label><span>${side.label}</span><input type="number" min="${min}" max="160" step="1" data-css-spacing="${cssProp}" value="${Math.round(value)}" inputmode="numeric" aria-label="${label} ${side.label}" /><output>${Math.round(value)}px</output></label>`;
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
    const colors = `<div class="ui-feedback-css-section"><div class="ui-feedback-css-section__title">M\xE0u s\u1EAFc</div>${CSS_COLOR_FIELDS.map(renderCssColorCard).join("")}<details class="ui-feedback-more-colors"><summary>\u2304 Th\xEAm ${EXTRA_COLOR_FIELDS.length} m\xE0u kh\xE1c</summary><div style="margin-top:6px">${EXTRA_COLOR_FIELDS.map(renderCssColorCard).join("")}</div></details></div><div class="ui-feedback-css-section"><div class="ui-feedback-css-section__title">B\u1EC1 m\u1EB7t & vi\u1EC1n</div>${renderCssRange("Border radius", "borderRadius", 0, 32, 1, "px", 0)}${renderCssRange("Border width", "borderWidth", 0, 12, 1, "px", 0)}${renderCssSelect("Border style", "borderStyle", [{ value: "none", label: "None" }, { value: "solid", label: "Solid" }, { value: "dashed", label: "Dashed" }, { value: "dotted", label: "Dotted" }], "solid")}${renderCssRange("Opacity", "opacity", 0, 100, 1, "%", 100, (value) => `${Math.round(value)}%`)}</div>`;
    const typography = `<div class="ui-feedback-css-section"><div class="ui-feedback-css-section__title">Typography</div>${renderFontRow("Font ch\u1EEF (Google Fonts)", "fontFamily")}${renderCssRange("C\u1EE1 ch\u1EEF", "fontSize", 10, 72, 1, "px", 16)}${renderCssSelect("\u0110\u1ED9 \u0111\u1EADm", "fontWeight", FONT_WEIGHT_OPTIONS, "400")}${renderCssRange("Line height", "lineHeight", 1, 2, 0.05, "", 1.5, (value) => Number(value).toFixed(2))}${renderCssRange("Letter spacing", "letterSpacing", -2, 4, 0.1, "px", 0, (value) => `${Number(value).toFixed(1)}px`)}${renderTextAlign()}${renderCssSelect("Bi\u1EBFn \u0111\u1ED5i ch\u1EEF", "textTransform", [{ value: "none", label: "Gi\u1EEF nguy\xEAn" }, { value: "uppercase", label: "UPPERCASE" }, { value: "capitalize", label: "Capitalize" }, { value: "lowercase", label: "lowercase" }], "none")}</div>`;
    const spacing = `<div class="ui-feedback-css-section"><div class="ui-feedback-css-section__title">Kho\u1EA3ng c\xE1ch & k\xEDch th\u01B0\u1EDBc</div><p class="ui-feedback-css-help">\u0110\u1ED5i t\u1EEBng c\u1EA1nh tr\u1EF1c ti\u1EBFp. Gi\xE1 tr\u1ECB \u0111\u01B0\u1EE3c \xE1p d\u1EE5ng theo px \u0111\u1EC3 d\u1EC5 ki\u1EC3m so\xE1t khi review.</p>${renderSpacingGroup("Padding", "padding")}${renderSpacingGroup("Margin", "margin")}<div class="ui-feedback-css-subsection"><div class="ui-feedback-css-subtitle">Chi\u1EC1u r\u1ED9ng</div><label class="ui-feedback-css-text-row"><span>Width</span><input type="text" data-css-text-prop="width" value="${escapeAttribute(readCssValue("width", "auto"))}" placeholder="auto \xB7 320px \xB7 80%" /></label><label class="ui-feedback-css-text-row"><span>Max-width</span><input type="text" data-css-text-prop="maxWidth" value="${escapeAttribute(readCssValue("maxWidth", "none"))}" placeholder="none \xB7 720px \xB7 100%" /></label></div><div class="ui-feedback-css-subsection"><div class="ui-feedback-css-subtitle">B\xF3ng n\xE2ng cao</div><label class="ui-feedback-css-text-row"><span>Box shadow</span><input type="text" data-css-text-prop="boxShadow" value="${escapeAttribute(readCssValue("boxShadow", "none"))}" placeholder="0 10px 30px rgba(0,0,0,.12)" /></label></div></div>`;
    const position = `<div class="ui-feedback-css-section"><div class="ui-feedback-css-section__title">V\u1ECB tr\xED 2D</div><div class="ui-feedback-position-pad" data-css-position-pad tabindex="0" aria-label="\u0110i\u1EC1u ch\u1EC9nh v\u1ECB tr\xED X Y"></div><div class="ui-feedback-position-sliders"><label><span>X</span><input type="range" min="-200" max="200" step="1" data-css-x value="${Math.round(state.cssPosition.x)}" /><output data-css-x-output>${Math.round(state.cssPosition.x)}px</output></label><label><span>Y</span><input type="range" min="-200" max="200" step="1" data-css-y value="${Math.round(state.cssPosition.y)}" /><output data-css-y-output>${Math.round(state.cssPosition.y)}px</output></label></div><div class="ui-feedback-position-inputs"><label><span>X (px)</span><input type="number" min="-200" max="200" step="1" data-css-x-number value="${Math.round(state.cssPosition.x)}" inputmode="numeric" /></label><label><span>Y (px)</span><input type="number" min="-200" max="200" step="1" data-css-y-number value="${Math.round(state.cssPosition.y)}" inputmode="numeric" /></label></div><button class="ui-feedback-button ui-feedback-css-reset" data-css-position-reset type="button">\u0110\u1EB7t l\u1EA1i (0,0)</button></div><button class="ui-feedback-button ui-feedback-css-reset" data-css-reset type="button">\u21B6 Kh\xF4i ph\u1EE5c m\u1EB7c \u0111\u1ECBnh</button>`;
    const advanced = renderAdvancedCss();
    const content = { preset: presets, colors, typography, spacing, position, advanced }[tab] || colors;
    return `<div class="ui-feedback-css-tabs" role="tablist" aria-label="Nh\xF3m thu\u1ED9c t\xEDnh CSS">${tabs.map(([value, label]) => `<button class="ui-feedback-css-tab ${tab === value ? "is-active" : ""}" data-css-tab="${value}" type="button" role="tab" aria-selected="${tab === value}">${label}</button>`).join("")}</div>${content}`;
  }
  function renderImageContent() {
    const snapshot = state.modalSnapshot || captureImageState(state.target);
    const source = state.modalImageSource || snapshot.src || snapshot.effectiveSrc || "";
    const position = imageEditor.normalizePosition(state.modalImagePosition || snapshot.position || { x: 50, y: 50 });
    const zoom = imageEditor.clampZoom(state.modalImageZoom || snapshot.zoom || 100);
    const positionStyle = `object-position:${position.x}% ${position.y}%;transform:scale(${zoom / 100});transform-origin:50% 50%;`;
    const preview = source ? `<img class="ui-feedback-image-preview__media" data-image-preview src="${escapeAttribute(source)}" alt="\u1EA2nh preview" style="${positionStyle}" />` : "<span data-image-preview>Ph\u1EA7n t\u1EED n\xE0y ch\u01B0a c\xF3 \u1EA3nh URL tr\u1EF1c ti\u1EBFp. H\xE3y nh\u1EADp URL ho\u1EB7c ch\u1ECDn file.</span>";
    return `<div class="ui-feedback-image-block"><div class="ui-feedback-image-heading"><div><strong>Block: ${escapeHtml(targetLabel(state.target))}</strong><small>\u0110\u01B0\u1EDDng d\u1EABn \u1EA3nh \xB7 ${escapeHtml(safeText(cssPath(state.target), 90))}</small></div><span class="ui-feedback-image-state">${source && source !== snapshot.src ? "\u0111\xE3 \u0111\u1ED5i" : "ch\u01B0a \u0111\u1ED5i"}</span></div><div class="ui-feedback-image-preview" data-image-canvas aria-label="K\xE9o \u1EA3nh \u0111\u1EC3 c\u0103n ch\u1EC9nh">${preview}<span class="ui-feedback-image-canvas-hint">K\xE9o \u1EA3nh \u0111\u1EC3 c\u0103n ch\u1EC9nh</span></div><div class="ui-feedback-image-zoom"><button type="button" data-image-zoom-step="-" aria-label="Thu nh\u1ECF \u1EA3nh">\u2212</button><input type="range" min="30" max="300" step="5" data-image-zoom value="${zoom}" aria-label="Zoom \u1EA3nh trong khung crop" /><button type="button" data-image-zoom-step="+" aria-label="Ph\xF3ng to \u1EA3nh">+</button><output data-image-zoom-output>${zoom}%</output></div><div class="ui-feedback-image-position"><span>V\u1ECB tr\xED crop</span><output data-image-position>${Math.round(position.x)}% \xB7 ${Math.round(position.y)}%</output></div><div class="ui-feedback-image-position-controls" role="group" aria-label="C\u0103n ch\u1EC9nh v\u1ECB tr\xED \u1EA3nh"><button type="button" data-image-position-step="left" aria-label="C\u0103n tr\xE1i">\u2190 Tr\xE1i</button><button type="button" data-image-position-step="right" aria-label="C\u0103n ph\u1EA3i">Ph\u1EA3i \u2192</button><button type="button" data-image-position-step="up" aria-label="C\u0103n l\xEAn">\u2191 L\xEAn</button><button type="button" data-image-position-step="down" aria-label="C\u0103n xu\u1ED1ng">Xu\u1ED1ng \u2193</button><button type="button" data-image-position-reset aria-label="\u0110\u1EB7t \u1EA3nh v\u1EC1 gi\u1EEFa">\u0110\u1EB7t gi\u1EEFa</button></div><label class="ui-feedback-label" for="ui-feedback-image-url">URL \u1EA3nh</label><input id="ui-feedback-image-url" class="ui-feedback-image-url" data-feedback-input data-image-url value="${escapeAttribute(source)}" placeholder="https://example.com/image.jpg" type="url" /><button type="button" class="ui-feedback-image-paste" data-image-paste>D\xE1n \u1EA3nh t\u1EEB clipboard (Ctrl/Cmd + V)</button><label class="ui-feedback-label" for="ui-feedback-image-file">Ho\u1EB7c upload t\u1EEB m\xE1y</label><input id="ui-feedback-image-file" class="ui-feedback-image-upload" data-image-file type="file" accept="image/*" /><small class="ui-feedback-image-original">URL g\u1ED1c: ${escapeHtml(safeText(snapshot.src || snapshot.backgroundImage || "Kh\xF4ng c\xF3", 150))}</small><small class="ui-feedback-image-original">Crop s\u1EBD l\u01B0u c\xF9ng feedback: X ${Math.round(position.x)}% \xB7 Y ${Math.round(position.y)}% \xB7 zoom ${zoom}%.</small><small class="ui-feedback-image-original">Upload local \u0111\u01B0\u1EE3c gi\u1EEF t\u1ED1i \u0111a 1 MB \u0111\u1EC3 tr\xE1nh l\xE0m \u0111\u1EA7y localStorage.</small></div>`;
  }
  function renderModal(existing = null) {
    const mount = root.querySelector("[data-ui-feedback-modal]");
    if (!mount || !state.modalOpen) return;
    const isEdit = state.mode === "edit";
    const isCss = state.mode === "css";
    const isImage = state.mode === "image";
    const currentText = existing?.comment || (isEdit ? String(state.target?.textContent || "") : "");
    const title = isEdit ? "S\u1EEDa n\u1ED9i dung UI" : isCss ? "B\u1ED9 giao di\u1EC7n" : isImage ? "Thay \u1EA3nh" : "Ghi ch\xFA feedback";
    const commentContent = isEdit ? `<label class="ui-feedback-label" for="ui-feedback-input">N\u1ED9i dung hi\u1EC3n th\u1ECB</label><textarea id="ui-feedback-input" class="ui-feedback-textarea ui-feedback-textarea--edit" data-feedback-input>${escapeHtml(currentText)}</textarea>` : isCss ? renderCssContent() : isImage ? renderImageContent() : `<label class="ui-feedback-label" for="ui-feedback-input">B\u1EA1n mu\u1ED1n thay \u0111\u1ED5i g\xEC \u1EDF ph\u1EA7n t\u1EED n\xE0y?</label><textarea id="ui-feedback-input" class="ui-feedback-textarea" data-feedback-input placeholder="M\xF4 t\u1EA3 ng\u1EAFn g\u1ECDn k\u1EBFt qu\u1EA3 mong mu\u1ED1n. V\xED d\u1EE5: T\u0103ng kho\u1EA3ng c\xE1ch ph\xEDa tr\xEAn \u0111\u1EC3 ti\xEAu \u0111\u1EC1 tho\xE1ng h\u01A1n\u2026">${escapeHtml(currentText)}</textarea><small class="ui-feedback-input-hint">Vi\u1EBFt theo k\u1EBFt qu\u1EA3 mong mu\u1ED1n; file Markdown s\u1EBD t\u1EF1 b\u1ED5 sung trang, selector v\xE0 th\xF4ng tin ph\u1EA7n t\u1EED.</small>`;
    const footer = isImage ? `<button class="ui-feedback-button" data-modal-action="cancel">\u0110\xF3ng</button><button class="ui-feedback-button" data-modal-action="reset-position" title="\u0110\u01B0a c\u1EEDa s\u1ED5 v\u1EC1 v\u1ECB tr\xED m\u1EB7c \u0111\u1ECBnh">\u0110\u1EB7t l\u1EA1i v\u1ECB tr\xED</button><button class="ui-feedback-button" data-image-restore type="button">Kh\xF4i ph\u1EE5c</button><button class="ui-feedback-button ui-feedback-button--primary" data-modal-action="save">L\u01B0u \u1EA3nh</button>` : `<button class="ui-feedback-button" data-modal-action="cancel">H\u1EE7y</button><button class="ui-feedback-button" data-modal-action="reset-position" title="\u0110\u01B0a c\u1EEDa s\u1ED5 v\u1EC1 v\u1ECB tr\xED m\u1EB7c \u0111\u1ECBnh">\u0110\u1EB7t l\u1EA1i v\u1ECB tr\xED</button><button class="ui-feedback-button ui-feedback-button--primary" data-modal-action="save">L\u01B0u</button>`;
    const modalClass = isCss || isImage ? "ui-feedback-modal is-editor" : "ui-feedback-modal is-mini";
    mount.innerHTML = `<div class="ui-feedback-scrim" data-modal-action="cancel"></div><section class="${modalClass}" role="dialog" aria-modal="true" aria-labelledby="ui-feedback-title"><div class="ui-feedback-modal__top" data-modal-drag-handle title="K\xE9o v\xF9ng ti\xEAu \u0111\u1EC1 \u0111\u1EC3 di chuy\u1EC3n c\u1EEDa s\u1ED5"><div class="ui-feedback-window-heading"><span class="ui-feedback-window-grip" aria-hidden="true">${ICONS.grip}</span><div><span class="ui-feedback-drag-hint">K\xE9o \u0111\u1EC3 di chuy\u1EC3n</span><h2 id="ui-feedback-title">${title}</h2><p>${escapeHtml(targetLabel(state.target))} \xB7 ${escapeHtml(safeText(cssPath(state.target), 90))}</p></div></div><button type="button" class="ui-feedback-icon-button ui-feedback-modal__close" data-modal-action="cancel" aria-label="\u0110\xF3ng c\u1EEDa s\u1ED5" title="\u0110\xF3ng">${ICONS.close}</button></div><div class="ui-feedback-modal__content">${commentContent}</div><footer class="ui-feedback-modal__footer">${footer}</footer></section>`;
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
    applyPreviewImageZoom();
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
    else preview.outerHTML = `<img data-image-preview src="${escapeAttribute(source)}" alt="\u1EA2nh preview" style="object-position:${state.modalImagePosition?.x || 50}% ${state.modalImagePosition?.y || 50}%;transform-origin:50% 50%;" />`;
    applyPreviewImagePosition();
    applyPreviewImageZoom();
  }
  function applyCssPreset(name) {
    if (!state.target) return;
    if (name === "clean") {
      applyCssProperty("borderRadius", "4px");
      applyCssProperty("boxShadow", "none");
      applyCssProperty("borderWidth", "1px");
      applyCssProperty("borderStyle", "solid");
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
  function updateImagePositionFromPointer(clientX, clientY) {
    if (!imageDragState || !state.modalOpen || state.mode !== "image") return;
    const rect = imageDragState.canvas.getBoundingClientRect();
    const position = {
      x: Math.max(0, Math.min(100, imageDragState.x + (clientX - imageDragState.clientX) / rect.width * 100)),
      y: Math.max(0, Math.min(100, imageDragState.y + (clientY - imageDragState.clientY) / rect.height * 100))
    };
    state.modalImagePosition = position;
    applyPreviewImagePosition();
  }
  function handleImagePointerDown(event) {
    if (state.mode !== "image" || !state.modalOpen || event.button !== 0) return;
    const canvas = event.target.closest?.("[data-image-canvas]");
    if (!canvas) return;
    event.preventDefault();
    event.stopPropagation();
    const position = state.modalImagePosition || { x: 50, y: 50 };
    imageDragState = { canvas, clientX: event.clientX, clientY: event.clientY, x: position.x, y: position.y, pointerId: event.pointerId };
    canvas.classList.add("is-dragging");
    try {
      canvas.setPointerCapture?.(event.pointerId);
    } catch {
    }
    const onMove = (moveEvent) => {
      if (!imageDragState || moveEvent.pointerId !== imageDragState.pointerId) return;
      updateImagePositionFromPointer(moveEvent.clientX, moveEvent.clientY);
    };
    const onEnd = (endEvent) => {
      if (endEvent?.pointerId != null && endEvent.pointerId !== imageDragState?.pointerId) return;
      canvas.classList.remove("is-dragging");
      try {
        canvas.releasePointerCapture?.(imageDragState?.pointerId);
      } catch {
      }
      imageDragState = null;
      document.removeEventListener("pointermove", onMove, true);
      document.removeEventListener("pointerup", onEnd, true);
      document.removeEventListener("pointercancel", onEnd, true);
    };
    document.addEventListener("pointermove", onMove, true);
    document.addEventListener("pointerup", onEnd, true);
    document.addEventListener("pointercancel", onEnd, true);
  }
  let cssPositionDragState = null;
  function handleCssPositionPointerDown(event) {
    if (state.mode !== "css" || !state.modalOpen || event.button !== 0) return false;
    const pad = event.target.closest?.("[data-css-position-pad]");
    if (!pad) return false;
    event.preventDefault();
    event.stopPropagation();
    cssPositionDragState = { pad, pointerId: event.pointerId };
    pad.classList.add("is-dragging");
    updateCssPositionFromPointer(event.clientX, event.clientY);
    try {
      pad.setPointerCapture?.(event.pointerId);
    } catch {
    }
    const onMove = (moveEvent) => {
      if (!cssPositionDragState || moveEvent.pointerId !== cssPositionDragState.pointerId) return;
      moveEvent.preventDefault();
      updateCssPositionFromPointer(moveEvent.clientX, moveEvent.clientY);
    };
    const onEnd = (endEvent) => {
      if (endEvent?.pointerId != null && endEvent.pointerId !== cssPositionDragState?.pointerId) return;
      pad.classList.remove("is-dragging");
      try {
        pad.releasePointerCapture?.(cssPositionDragState?.pointerId);
      } catch {
      }
      cssPositionDragState = null;
      document.removeEventListener("pointermove", onMove, true);
      document.removeEventListener("pointerup", onEnd, true);
      document.removeEventListener("pointercancel", onEnd, true);
    };
    document.addEventListener("pointermove", onMove, true);
    document.addEventListener("pointerup", onEnd, true);
    document.addEventListener("pointercancel", onEnd, true);
    return true;
  }
  function handleModalPointerDown(event) {
    if (handleCssPositionPointerDown(event)) return;
    handleImagePointerDown(event);
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
    if (Number(file.size) > 1024 * 1024) {
      showToast("\u1EA2nh upload v\u01B0\u1EE3t gi\u1EDBi h\u1EA1n 1 MB");
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
    const positionStep = event.target.closest("[data-image-position-step]");
    if (positionStep) {
      event.stopPropagation();
      const position = { ...state.modalImagePosition || { x: 50, y: 50 } };
      const step = 5;
      if (positionStep.dataset.imagePositionStep === "left") position.x -= step;
      if (positionStep.dataset.imagePositionStep === "right") position.x += step;
      if (positionStep.dataset.imagePositionStep === "up") position.y -= step;
      if (positionStep.dataset.imagePositionStep === "down") position.y += step;
      state.modalImagePosition = { x: Math.max(0, Math.min(100, position.x)), y: Math.max(0, Math.min(100, position.y)) };
      applyPreviewImagePosition();
      return;
    }
    const imagePositionReset = event.target.closest("[data-image-position-reset]");
    if (imagePositionReset) {
      event.stopPropagation();
      state.modalImagePosition = { x: 50, y: 50 };
      applyPreviewImagePosition();
      return;
    }
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
      state.cssPosition = parseTranslatePosition(state.target.style.translate || state.target.style.transform || "");
      renderModal();
      return;
    }
    const restore = event.target.closest("[data-image-restore]");
    if (restore && state.target && state.modalSnapshot) {
      event.stopPropagation();
      restoreImageState(state.target, state.modalSnapshot);
      state.modalImageSource = state.modalSnapshot.src || state.modalSnapshot.effectiveSrc || "";
      const restoredPosition = state.modalSnapshot.position || state.modalSnapshot.objectPosition || state.modalSnapshot.effectiveObjectPosition || state.modalSnapshot.backgroundPosition || state.modalSnapshot.effectiveBackgroundPosition || "50% 50%";
      state.modalImagePosition = imageEditor.normalizePosition(typeof restoredPosition === "object" ? restoredPosition : parseImagePosition(restoredPosition));
      state.modalImageBaseTransform = state.modalSnapshot.transform || state.modalSnapshot.effectiveTransform || "";
      state.modalImageZoom = imageEditor.clampZoom(state.modalSnapshot.zoom || imageEditor.parseImageZoom(state.modalSnapshot.transform || state.modalSnapshot.effectiveTransform || state.modalSnapshot.backgroundSize || ""));
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
    if (applyCssSelectControl(target)) {
      return;
    } else if (target.matches("[data-css-color]")) {
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
      } else if (prop === "opacity") {
        applyCssProperty("opacity", String(raw / 100));
      } else {
        applyCssProperty(prop, `${raw}${unit}`);
      }
      const output = root.querySelector(`[data-css-output="${prop}"]`);
      if (output) output.textContent = prop === "lineHeight" ? raw.toFixed(2) : prop === "opacity" ? `${Math.round(raw)}%` : `${raw}${unit}`;
    } else if (target.matches("[data-css-number-prop]")) {
      const prop = target.dataset.cssNumberProp;
      const value = Math.max(-1e3, Math.min(1e3, Number(target.value) || 0));
      target.value = String(value);
      applyCssProperty(prop, String(value));
    } else if (target.matches("[data-css-spacing]")) {
      const min = target.dataset.cssSpacing.startsWith("margin") ? -160 : 0;
      const value = Math.max(min, Math.min(160, Number(target.value) || 0));
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
      state.modalImageZoom = Math.max(30, Math.min(300, Number(target.value) || 100));
      target.value = state.modalImageZoom;
      applyPreviewImageZoom();
    } else if (target.matches("[data-css-radius]")) {
      applyCssProperty("borderRadius", `${target.value}px`);
      const output = root.querySelector("[data-css-radius-output]");
      if (output) output.value = `${target.value}px`;
      if (output) output.textContent = `${target.value}px`;
    } else if (target.matches("[data-image-url]")) {
      state.modalImageSource = target.value.trim();
    }
  }
  function applyCssSelectControl(target) {
    if (target.matches("[data-css-select-prop]")) {
      applyCssProperty(target.dataset.cssSelectProp, target.value);
      return true;
    }
    if (target.matches("[data-css-font]")) {
      const value = target.value;
      if (value) {
        ensureGoogleFont(value);
        applyCssProperty(target.dataset.cssFont, `'${value}', sans-serif`);
      } else applyCssProperty(target.dataset.cssFont, "");
      const label = target.closest(".ui-feedback-font-row")?.querySelector(".ui-feedback-font-row__value");
      if (label) label.textContent = value || "M\u1EB7c \u0111\u1ECBnh c\u1EE7a website";
      return true;
    }
    return false;
  }
  function handleModalChange(event) {
    const target = event.target;
    if (applyCssSelectControl(target)) return;
    if (target.matches("[data-image-url]")) {
      previewImageSource(state.modalImageSource);
      return;
    }
    if (target.matches("[data-image-file]") && target.files?.[0]) loadImageFile(target.files[0]);
  }
  function handleModalKeydown(event) {
    const cssPositionPad = event.target.closest?.("[data-css-position-pad]");
    if (cssPositionPad && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
      event.preventDefault();
      const step = event.shiftKey ? 10 : 1;
      const next = { ...state.cssPosition };
      if (event.key === "ArrowLeft") next.x -= step;
      if (event.key === "ArrowRight") next.x += step;
      if (event.key === "ArrowUp") next.y -= step;
      if (event.key === "ArrowDown") next.y += step;
      applyCssPosition(next);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      closeModal(true);
    }
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      saveModal();
    }
    if (event.key === "Tab") {
      const modal = event.currentTarget?.querySelector?.(".ui-feedback-modal");
      const focusable = [...modal?.querySelectorAll('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])') || []].filter((element) => !element.hidden && element.getClientRects().length);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && shadow.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && shadow.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }
  let editingExisting = null;
  function openModalWithExisting(element, mode, existing) {
    editingExisting = existing || null;
    openModal(element, mode, existing);
  }
  function saveModal() {
    const input = root.querySelector("[data-feedback-input]");
    const existing = editingExisting;
    const modeUsed = state.mode;
    const rawValue = input?.value || "";
    const value = modeUsed === "edit" ? rawValue : rawValue.trim();
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
      applyImageZoom(state.target, state.modalImageZoom || 100, state.modalImageBaseTransform || "");
      const newImageState = {
        ...captureImageState(state.target),
        position: imageEditor.normalizePosition(state.modalImagePosition || { x: 50, y: 50 }),
        zoom: imageEditor.clampZoom(state.modalImageZoom || 100),
        crop: {
          x: imageEditor.normalizePosition(state.modalImagePosition || { x: 50, y: 50 }).x,
          y: imageEditor.normalizePosition(state.modalImagePosition || { x: 50, y: 50 }).y,
          zoom: imageEditor.clampZoom(state.modalImageZoom || 100),
          frame: "image-preview"
        }
      };
      delete newImageState.src;
      delete newImageState.effectiveSrc;
      delete newImageState.backgroundImage;
      const oldImageReference = oldImageState.src || oldImageState.backgroundImage || "";
      const item = {
        id: generateId(),
        type: "image",
        category: "image",
        selector: cssPath(state.target),
        tag: targetLabel(state.target),
        codeLine: firstCodeLine(state.target),
        targetText: String(oldImageReference).startsWith("data:image/") ? "[\u1EA2nh upload local tr\u01B0\u1EDBc \u0111\xF3]" : oldImageReference,
        value: source,
        imageSourceType: source.startsWith("data:image/") ? "upload" : "url",
        oldImageState,
        newImageState,
        page: location.pathname || "/",
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        scrollY: Math.round(window.scrollY),
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      state.comments.push(item);
      state.undoStack.push({ type: "image", id: item.id, selector: item.selector, oldImageState });
      const persisted = persist();
      state.modalCommitted = true;
      showToast(persisted ? "\u0110\xE3 thay \u1EA3nh tr\xEAn trang" : "\u0110\xE3 thay \u1EA3nh trong phi\xEAn n\xE0y nh\u01B0ng kh\xF4ng th\u1EC3 l\u01B0u v\xE0o tr\xECnh duy\u1EC7t", { undo: true });
      editingExisting = null;
      closeModal(true);
      return;
    }
    if (modeUsed !== "css" && !value.trim()) {
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
          category: modeUsed === "edit" ? "content" : { colors: "color", typography: "typography", spacing: "spacing", position: "layout" }[state.cssTab] || "other",
          codeLine: firstCodeLine(state.target),
          targetText: safeText(oldValue, 120),
          oldValue,
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
      const persisted = persist();
      state.modalCommitted = true;
      const successMessage = modeUsed === "edit" ? "\u0110\xE3 c\u1EADp nh\u1EADt n\u1ED9i dung tr\xEAn trang" : "\u0110\xE3 apply B\u1ED9 giao di\u1EC7n";
      showToast(persisted ? successMessage : `${successMessage} trong phi\xEAn n\xE0y nh\u01B0ng kh\xF4ng th\u1EC3 l\u01B0u v\xE0o tr\xECnh duy\u1EC7t`, { undo: true });
    } else {
      const item = existing || { id: generateId(), createdAt: (/* @__PURE__ */ new Date()).toISOString(), type: "comment" };
      item.comment = value;
      item.priority = item.priority || "medium";
      item.category = item.category || "other";
      item.selector = cssPath(state.target);
      item.tag = targetLabel(state.target);
      item.codeLine = firstCodeLine(state.target);
      item.targetText = safeText(state.target?.textContent, 120);
      item.page = location.pathname || "/";
      item.viewport = `${window.innerWidth}x${window.innerHeight}`;
      item.scrollY = Math.round(window.scrollY);
      item.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      if (!existing) state.comments.push(item);
      const persisted = persist();
      state.modalCommitted = true;
      const successMessage = existing ? "\u0110\xE3 c\u1EADp nh\u1EADt feedback" : "\u0110\xE3 l\u01B0u feedback";
      showToast(persisted ? successMessage : `${successMessage} trong phi\xEAn n\xE0y nh\u01B0ng kh\xF4ng th\u1EC3 l\u01B0u v\xE0o tr\xECnh duy\u1EC7t`);
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
    state.modalImageZoom = 100;
    state.modalImageBaseTransform = "";
    state.modalCommitted = false;
    editingExisting = null;
    const returnFocus = focusBeforeModal;
    focusBeforeModal = null;
    renderToolbar2();
    placeMarkers();
    if (resumePicking) {
      resumePickingIfNeeded();
    }
    if (returnFocus?.isConnected) setTimeout(() => returnFocus.focus?.({ preventScroll: true }), 0);
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
  function exportMarkdown() {
    return markdownExporter.exportMarkdown();
  }
  function showToast(message, opts = {}) {
    return toastController?.showToast(message, opts);
  }
  function toggle() {
    const nextActive = !state.active;
    if (!nextActive && state.modalOpen) closeModal(false);
    state.active = nextActive;
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
      clearMarkers();
    }
    showToast(state.active ? "UI Feedback \u0111\xE3 b\u1EADt" : "UI Feedback \u0111\xE3 t\u1EAFt");
  }
  function normalizeShortcutKey(event) {
    const fromCode = typeof event.code === "string" && event.code.startsWith("Key") ? event.code.slice(3) : "";
    return (fromCode || event.key || "").toLowerCase();
  }
  function keydown(event) {
    const editableTarget = (event.composedPath?.() || [event.target]).some((node) => node instanceof Element && isEditable(node));
    if (event.key === "Escape" && state.active) {
      if (state.modalOpen) {
        closeModal(true);
        event.preventDefault();
        return;
      }
      if (state.selectionChooser) {
        closeSelectionChooser(true);
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
    if (editableTarget) return;
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
    if (!config.shortcut.includes(key)) {
      if (!["shift", "control", "alt", "meta"].includes(key)) {
        recentShortcutKeys.length = 0;
        clearTimeout(shortcutTimer);
      }
      return;
    }
    pressed.add(key);
    if (!event.repeat) {
      recentShortcutKeys.push(key);
      while (recentShortcutKeys.length > config.shortcut.length) recentShortcutKeys.shift();
      const simultaneous = config.shortcut.every((r) => pressed.has(r));
      const quickSequence = recentShortcutKeys.length === config.shortcut.length && config.shortcut.every((required, index) => recentShortcutKeys[index] === required);
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
    highlight(element);
  }
  function handleHostEvent(event) {
    const path = event.composedPath();
    const coachmarkDismiss = path.find((node) => node instanceof Element && node.matches?.("[data-coachmark-dismiss]"));
    if (coachmarkDismiss) {
      if (event.type !== "click") return;
      event.preventDefault();
      event.stopPropagation();
      dismissCoachmark();
      return;
    }
    const button = path.find(
      (node) => node instanceof HTMLButtonElement && node.dataset?.action
    );
    if (button) {
      if (event.type !== "click") return;
      triggerToolbarAction(event, button);
      return;
    }
    if (!state.picking || state.pickingLocked) return;
    const picker = path.find(
      (node) => node instanceof Element && node.matches?.("[data-picker-layer]")
    );
    if (!picker) return;
    if (event.type !== "click") return;
    const element = targetForMode(elementAtPoint(event.clientX, event.clientY));
    if (!element) return;
    event.preventDefault();
    event.stopPropagation();
    state.pickingLocked = true;
    setTimeout(() => {
      state.pickingLocked = false;
    }, 600);
    openPickedElement(element);
  }
  function documentPickHandler(event) {
    if (!state.picking || state.pickingLocked) return;
    if (event.composedPath().includes(host)) return;
    if (event.type !== "click") return;
    const rawElement = event.target instanceof Element ? event.target : null;
    const element = targetForMode(rawElement);
    if (!element || element === document.documentElement || element === document.body) return;
    event.preventDefault();
    event.stopPropagation();
    state.pickingLocked = true;
    setTimeout(() => {
      state.pickingLocked = false;
    }, 600);
    openPickedElement(rawElement);
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
      startInset: toolbarPos.side === "left" ? rect.left : window.innerWidth - rect.right,
      startTop: rect.top
    };
    function onMove(e) {
      if (!dragState) return;
      const dx = e.clientX - dragState.startX;
      const dy = e.clientY - dragState.startY;
      const nextInset = toolbarPos.side === "left" ? dragState.startInset + dx : dragState.startInset - dx;
      toolbarPos.inset = Math.max(8, Math.min(window.innerWidth - 70, nextInset));
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
    if (state.modalOpen) closeModal(false);
    if (state.selectionChooser) closeSelectionChooser(false);
    stopPicking();
    clearMarkers();
    window.removeEventListener("scroll", handleViewportChange);
    window.removeEventListener("resize", handleViewportChange);
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
    clearTimeout(shortcutTimer);
    clearTimeout(reapplyTimer);
    domObserver?.disconnect();
    toastController?.dispose?.();
    if (themeMedia && themeChangeHandler) {
      if (themeMedia.removeEventListener) themeMedia.removeEventListener("change", themeChangeHandler);
      else themeMedia.removeListener?.(themeChangeHandler);
    }
    host.remove();
    delete window.__uiFeedbackInstance;
  }
  const blurHandler = () => {
    pressed.clear();
    recentShortcutKeys.length = 0;
    clearTimeout(shortcutTimer);
  };
  const handleViewportChange = () => {
    refreshMarkerPositions();
    if (state.selectionChooser) positionSelectionChooser();
  };
  const reapplyPageChanges = () => {
    if (!state.active) return;
    if (reapplyTimer) return;
    reapplyTimer = setTimeout(() => {
      reapplyTimer = null;
      applyPersistedChanges();
      placeMarkers();
    }, 40);
  };
  panelController = createPanelController({ state, root, showToast });
  modalController = createModalController({ state, root, showToast });
  cssEditor = createCssEditor({ state, root });
  pickerController = createPickerController({ state, root, config, renderToolbar: renderToolbar2, showToast });
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
    showToast: (...args) => toastController?.showToast(...args)
  };
  toastController = createToastController({ root, undoAction: (...args) => commentsController?.undoAction(...args) });
  commentsController = createCommentsController(featureContext);
  markdownExporter = createMarkdownExporter(featureContext);
  if (typeof MutationObserver === "function") {
    domObserver = new MutationObserver((mutations) => {
      if (!state.active || !mutations.some((mutation) => !host.contains(mutation.target))) return;
      reapplyPageChanges();
    });
    domObserver.observe(document.body || document.documentElement, { childList: true, subtree: true });
  }
  document.addEventListener("keydown", keydown, true);
  document.addEventListener("keyup", keyup, true);
  window.addEventListener("blur", blurHandler);
  window.addEventListener("scroll", handleViewportChange, { passive: true });
  window.addEventListener("resize", handleViewportChange, { passive: true });
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
