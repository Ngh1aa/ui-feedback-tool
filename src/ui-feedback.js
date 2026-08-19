/**
 * UI Feedback Tool v0.4
 * ---------------------
 * Công cụ ghi nhận feedback UI/UX trực tiếp trên trang web.
 * Bật / tắt bằng cách nhấn đồng thời Q + W + E.
 *
 * Changelog v0.4:
 *   - New: marker trên trang cho edit / css (xanh lá / tím) — biết ngay
 *         chỗ nào đã cập nhật
 *   - New: nút Undo trên toolbar (kèm counter) — hoàn tác delete / edit / css
 *   - New: button toolbar toggleable (click lại để tắt picking)
 *   - Fix: resume picking an toàn qua clearable timer, không còn race 80ms
 *   - Fix: đóng panel / Escape trong picking vẫn nhớ mode và phục hồi
 *   - Fix: export Markdown / GitHub Issue có section riêng cho edit / css
 *         (trước đây ghi `undefined` trong feedback)
 *   - New: phân phối qua jsDelivr CDN + semver tag — project khác import
 *         `https://cdn.jsdelivr.net/gh/Ngh1aa/StudioOS@v0.4.0/ui-feedback.js`
 *         và nhận update chỉ bằng cách bump tag.
 *
 * Changelog v0.3:
 *   - New: Bắt ngữ cảnh màn hình (viewport, scrollY)
 *   - New: CSS Tinkering mode (sửa inline CSS trực tiếp)
 *   - New: Phím tắt Quick Tagging (T, C, S) khi picking
 *   - New: Tạo GitHub Issue 1-click
 *
 * Changelog v0.2:
 *   - Fix: đổi `const CSS` → `STYLESHEET` để không shadow `window.CSS`
 *   - Fix: thống nhất event flow qua host delegation, loại bỏ double-fire
 *   - New: dark mode (auto-detect hoặc config `theme`)
 *   - New: animations (modal fade, panel slide, toast slide, toolbar pulse)
 *   - New: drag & drop toolbar
 *   - New: filter & search trong panel
 *   - New: resolve / unresolve status trên mỗi comment
 *   - New: timestamp hiển thị trên comment items
 *   - New: undo delete (toast + hoàn tác)
 *   - New: improved markdown export (status, summary)
 *   - New: Escape đóng modal/panel
 */

const DEFAULTS = {
  shortcut: ['q', 'w', 'e'],
  storageKey: 'ui-feedback-session',
  accent: '#f5a623',
  position: 'right',
  theme: 'auto', // 'light' | 'dark' | 'auto'
  githubRepo: 'Ngh1aa/StudioOS', // 'username/repo' cho GitHub Issue
  persistActive: true, // giữ trạng thái bật trong cùng một tab khi chuyển trang
};

/* ── helpers ─────────────────────────────────────────────────────────── */

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 11);
}

function escapeMarkdown(value) {
  return String(value || '').replace(/[\\`*_{}\[\]()#+.!|>-]/g, '\\$&');
}

function formatDate(date) {
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function relativeTime(isoString) {
  if (!isoString) return '';
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}

function safeText(value, max = 180) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function isEditable(target) {
  return (
    target instanceof HTMLElement &&
    (target.matches('input, textarea, select, [contenteditable="true"]') ||
      Boolean(target.closest('input, textarea, select, [contenteditable="true"]')))
  );
}

function cssPath(element) {
  if (!(element instanceof Element)) return '';
  const parts = [];
  let node = element;
  while (node && node.nodeType === 1 && node !== document.body && parts.length < 6) {
    let part = node.tagName.toLowerCase();
    if (node.id) {
      // Use window.CSS explicitly to avoid any scope issues
      part += `#${window.CSS.escape(node.id)}`;
      parts.unshift(part);
      break;
    }
    const classes = [...node.classList].filter(Boolean).slice(0, 2);
    if (classes.length) part += `.${classes.map(window.CSS.escape).join('.')}`;
    const siblings = node.parentElement
      ? [...node.parentElement.children].filter((s) => s.tagName === node.tagName)
      : [];
    if (siblings.length > 1) part += `:nth-of-type(${siblings.indexOf(node) + 1})`;
    parts.unshift(part);
    node = node.parentElement;
  }
  return parts.join(' > ');
}

function targetLabel(element) {
  if (!(element instanceof Element)) return 'Element chưa xác định';
  const tag = element.tagName.toLowerCase();
  const id = element.id ? `#${element.id}` : '';
  const classes = [...element.classList]
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => `.${n}`)
    .join('');
  return `${tag}${id}${classes}`;
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[c],
  );
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, '&#096;');
}

function detectTheme(preference) {
  if (preference === 'dark') return 'dark';
  if (preference === 'light') return 'light';
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/* ── icons ───────────────────────────────────────────────────────────── */

const ICONS = {
  clipboard:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4.5V3h6v1.5M9 9h6M9 13h6M9 17h4"/></svg>',
  comment:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5.5h14v10H9l-4 3v-13Z"/><path d="M9 10.5h6M12 8v5"/></svg>',
  pencil:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 16.5-.8 4.3 4.3-.8L19 8.5 15.5 5 4 16.5Z"/><path d="m13.8 6.7 3.5 3.5M4 20.8l3.5-.8"/></svg>',
  close:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>',
  download:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M4 20h16"/></svg>',
  trash:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M10 11v5M14 11v5M8 7l1 13h6l1-13M9 7l1-3h4l1 3"/></svg>',
  edit:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 16.5-.8 4.3 4.3-.8L19 8.5 15.5 5 4 16.5Z"/><path d="m13.8 6.7 3.5 3.5"/></svg>',
  check:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5L20 7"/></svg>',
  undo:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10h13a4 4 0 0 1 0 8H9"/><path d="M7 6l-4 4 4 4"/></svg>',
  search:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M16 16l5 5"/></svg>',
  filter:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M7 12h10M10 18h4"/></svg>',
  grip:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="6" r="1.2"/><circle cx="15" cy="6" r="1.2"/><circle cx="9" cy="12" r="1.2"/><circle cx="15" cy="12" r="1.2"/><circle cx="9" cy="18" r="1.2"/><circle cx="15" cy="18" r="1.2"/></svg>',
  paintbrush:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/><path d="M9 11l-4 4s-1.5 2 1 4.5 4.5 1 4.5 1l4-4"/></svg>',
  github:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>',
};

/* ── stylesheet ──────────────────────────────────────────────────────── */
/* Renamed from `CSS` to `STYLESHEET` to avoid shadowing `window.CSS`. */

const STYLESHEET = `
:host { all: initial; }
* { box-sizing: border-box; }
button, input, textarea, select { font: inherit; }
button { cursor: pointer; }

/* ── theme tokens ── */
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
}

.ui-feedback-root [hidden] { display: none !important; }

/* ── animations ── */
@keyframes uiFeedbackFadeIn {
  from { opacity: 0; transform: translate(-50%, -50%) scale(.96); }
  to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}
@keyframes uiFeedbackSlideIn {
  from { opacity: 0; transform: translateY(-50%) translateX(18px); }
  to   { opacity: 1; transform: translateY(-50%) translateX(0); }
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
  from { opacity: 0; transform: translateY(-50%) translateX(20px); }
  to   { opacity: 1; transform: translateY(-50%) translateX(0); }
}

/* ── toolbar ── */
.ui-feedback-toolbar {
  position: fixed;
  z-index: 2147483000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  animation: uiFeedbackToolbarIn .32s cubic-bezier(.4,0,.2,1) both;
  touch-action: none;
  user-select: none;
}

.ui-feedback-toolbar-grip {
  width: 32px;
  height: 18px;
  display: grid;
  place-items: center;
  cursor: grab;
  color: #555;
  opacity: .5;
  transition: opacity .18s ease;
  border: 0;
  background: transparent;
  padding: 0;
}
.ui-feedback-toolbar-grip:hover { opacity: 1; }
.ui-feedback-toolbar-grip:active { cursor: grabbing; }
.ui-feedback-toolbar-grip svg { width: 16px; height: 16px; stroke: currentColor; fill: currentColor; stroke-width: 0; }

.ui-feedback-tool {
  width: 54px;
  height: 54px;
  border: 1px solid rgba(255,255,255,.18);
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: var(--_text-toolbar);
  background: var(--_bg-toolbar);
  box-shadow: 0 10px 26px var(--_shadow);
  transition: transform .18s ease, background .18s ease, box-shadow .18s ease;
  position: relative;
}
.ui-feedback-tool:hover,
.ui-feedback-tool:focus-visible {
  transform: translateY(-2px);
  background: var(--_bg-toolbar-hover);
  box-shadow: 0 14px 28px var(--_shadow-heavy);
  outline: 3px solid color-mix(in srgb, var(--ui-feedback-accent), transparent 65%);
  outline-offset: 2px;
}
.ui-feedback-tool.is-active {
  background: var(--ui-feedback-accent);
  color: #141414;
}
.ui-feedback-tool svg {
  width: 22px;
  height: 22px;
  stroke: currentColor;
  fill: none;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

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
.ui-feedback-badge.is-pulse {
  animation: uiFeedbackPulse .4s ease;
}
.ui-feedback-badge--undo {
  background: #0ea5e9;
  border-color: var(--_bg-toolbar);
}
.ui-feedback-root.is-dark .ui-feedback-badge--undo {
  background: #38bdf8;
  color: #0c4a6e;
}

/* ── panel ── */
.ui-feedback-panel {
  position: fixed;
  right: 88px;
  top: 50%;
  transform: translateY(-50%);
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
  padding: 15px 16px;
  color: #111;
  background: var(--ui-feedback-accent);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.ui-feedback-panel__header strong { font-size: 15px; }
.ui-feedback-panel__actions { display: flex; gap: 5px; }

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

/* ── panel search & filter bar ── */
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

.ui-feedback-panel__body {
  max-height: calc(min(680px, 100vh - 32px) - 110px);
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

.ui-feedback-item {
  padding: 12px;
  background: var(--_bg-item);
  border: 1px solid var(--_border);
  border-top: 0;
  transition: background .15s ease;
}
.ui-feedback-item:hover { background: var(--_bg-hover); }
.ui-feedback-item:last-child { border-radius: 0 0 7px 7px; }
.ui-feedback-item + .ui-feedback-item { border-top: 1px solid var(--_border); }

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

/* ── modal ── */
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
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
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
}
.ui-feedback-modal__top h2 { margin: 0 0 7px; font-size: 16px; color: var(--_text); }
.ui-feedback-modal__top p { overflow: hidden; margin: 0; color: var(--_text-secondary); font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.ui-feedback-modal__content { padding: 17px 20px; }
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
  box-shadow: 0 2px 0 rgba(245,166,35,.3);
}
.ui-feedback-form-row { display: grid; grid-template-columns: 1fr 120px; gap: 18px; margin-top: 17px; }
.ui-feedback-modal__footer { display: flex; justify-content: flex-end; gap: 9px; padding: 0 20px 18px; }
.ui-feedback-button { min-width: 76px; border: 1px solid var(--_border); padding: 9px 16px; border-radius: 8px; color: var(--_text); background: var(--_bg-panel); transition: background .12s; }
.ui-feedback-button:hover { background: var(--_bg-hover); }
.ui-feedback-button--primary { border-color: var(--ui-feedback-accent); background: var(--ui-feedback-accent); color: #141414; }
.ui-feedback-button--primary:hover { filter: brightness(.95); }

/* ── toast ── */
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

/* ── comment markers ── */
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
  pointer-events: none;
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

/* ── color picker ── */
.ui-feedback-color-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 6px;
  margin: 10px 0;
}
.ui-feedback-color-swatch {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 6px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform .1s, border-color .1s, box-shadow .1s;
  box-shadow: 0 1px 3px rgba(0,0,0,.12);
}
.ui-feedback-color-swatch:hover {
  transform: scale(1.18);
  box-shadow: 0 3px 10px rgba(0,0,0,.2);
}
.ui-feedback-color-swatch.is-selected {
  border-color: var(--_text);
  transform: scale(1.1);
}
.ui-feedback-css-section {
  margin-top: 12px;
}
.ui-feedback-css-section__title {
  font-size: 11px;
  font-weight: 700;
  color: var(--_text-secondary);
  margin-bottom: 6px;
}
.ui-feedback-css-prop-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.ui-feedback-css-prop-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--_text-secondary);
  min-width: 80px;
}
.ui-feedback-css-inline {
  width: 100%;
  border: 0;
  border-bottom: 2px solid var(--_border);
  padding: 6px 0;
  color: var(--_text);
  background: transparent;
  outline: none;
  font-size: 12px;
  font-family: monospace;
}
.ui-feedback-css-inline:focus {
  border-bottom-color: var(--ui-feedback-accent);
}

/* ── picker ── */
.ui-feedback-picking,
.ui-feedback-picking * { cursor: crosshair !important; }
.ui-feedback-picker-layer {
  position: fixed;
  inset: 0;
  z-index: 2147482990;
  background: transparent;
  cursor: crosshair;
}

/* ── responsive ── */
@media (max-width: 640px) {
  .ui-feedback-toolbar { gap: 9px; }
  .ui-feedback-tool { width: 48px; height: 48px; }
  .ui-feedback-panel { right: 70px; width: min(340px, calc(100vw - 84px)); }
  .ui-feedback-form-row { grid-template-columns: 1fr; gap: 12px; }
}
`;

/* ── main factory ────────────────────────────────────────────────────── */

export function createUIFeedback(options = {}) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return null;
  if (window.__uiFeedbackInstance) return window.__uiFeedbackInstance;

    const config = {
    ...DEFAULTS,
    ...options,
    shortcut: (options.shortcut || DEFAULTS.shortcut).map((k) => k.toLowerCase()),
  };
  const activeStorageKey = `${config.storageKey}:active`;
  const pressed = new Set();
  const recentShortcutKeys = [];
  let shortcutTimer;

  const state = {
    active: loadActive(),
    picking: false,
    pickingLocked: false, // guard against double-fire
    mode: 'comment',
    panelOpen: false,
    modalOpen: false,
    target: null,
    highlight: null,
    comments: loadComments(),
    undoStack: [], // for undoing deletes, edits, and css
    filterPriority: 'all',
    searchQuery: '',
    theme: detectTheme(config.theme),
    // Resume context: remember the mode that was active before picking was
    // stopped (panel open, Escape, manual stop) so we can call beginPicking()
    // again with the same value when the interrupt clears.
    _modeBeforePickingStop: null,
    _resumeTimer: null,
  };

  // Marker tracking
  const markers = []; // { element, markerEl, commentId }

  /* ── shadow DOM setup ── */
  const host = document.createElement('div');
  host.id = 'ui-feedback-host';
  host.dataset.uiFeedbackIgnore = 'true';
  const shadow = host.attachShadow({ mode: 'open' });
  shadow.innerHTML = `<style>${STYLESHEET}</style><div class="ui-feedback-root${state.theme === 'dark' ? ' is-dark' : ''}" style="--ui-feedback-accent:${config.accent}"></div>`;
  const root = shadow.querySelector('.ui-feedback-root');
  document.documentElement.appendChild(host);

  // Listen for system theme changes
  if (config.theme === 'auto') {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      state.theme = e.matches ? 'dark' : 'light';
      root.classList.toggle('is-dark', state.theme === 'dark');
    });
  }

  /* ── toolbar drag state ── */
  let dragState = null;
  let toolbarPos = { right: 20, top: null }; // null = centered (50%)

  function getToolbarStyle() {
    const r = toolbarPos.right;
    if (toolbarPos.top !== null) {
      return `right:${r}px;top:${toolbarPos.top}px;transform:none;`;
    }
    return `right:${r}px;top:50%;transform:translateY(-50%);`;
  }

  /* ── persistence ── */
  function loadComments() {
    try {
      return JSON.parse(localStorage.getItem(config.storageKey) || '[]');
    } catch {
      return [];
    }
  }

    function persist() {
    localStorage.setItem(config.storageKey, JSON.stringify(state.comments));
  }
  function loadActive() {
    if (!config.persistActive) return false;
    try {
      return sessionStorage.getItem(activeStorageKey) === '1';
    } catch {
      return false;
    }
  }
  function persistActive() {
    if (!config.persistActive) return;
    try {
      sessionStorage.setItem(activeStorageKey, state.active ? '1' : '0');
    } catch {
      // Private browsing or a blocked storage API should not break the tool.
    }
  }
  /* ── rendering ── */
  function renderToolbar() {
    if (!state.active) {
      root.innerHTML = '';
      return;
    }
    const undoCount = state.undoStack.length;
    const undoBadge = undoCount
      ? `<span class="ui-feedback-badge ui-feedback-badge--undo">${undoCount}</span>`
      : '';
    const undoButton = `<button class="ui-feedback-tool" data-action="undo" aria-label="Hoàn tác thao tác gần nhất" title="Hoàn tác (${undoCount})" ${undoCount ? '' : 'hidden'}>${ICONS.undo}${undoBadge}</button>`;
    root.innerHTML = `${state.picking ? '<div class="ui-feedback-picker-layer" data-picker-layer aria-hidden="true"></div>' : ''}<div class="ui-feedback-toolbar" role="toolbar" aria-label="UI Feedback tools" style="${getToolbarStyle()}">
      <div class="ui-feedback-toolbar-grip" data-drag-handle aria-label="Kéo để di chuyển toolbar">${ICONS.grip}</div>
      <button class="ui-feedback-tool ${state.panelOpen ? 'is-active' : ''}" data-action="list" aria-label="Mở danh sách feedback" title="Danh sách feedback">${ICONS.clipboard}<span class="ui-feedback-badge" ${state.comments.length ? '' : 'hidden'}>${state.comments.length}</span></button>
      <button class="ui-feedback-tool ${state.picking && state.mode === 'comment' ? 'is-active' : ''}" data-action="comment" aria-label="Thêm comment" title="Thêm comment">${ICONS.comment}</button>
      <button class="ui-feedback-tool ${state.picking && state.mode === 'edit' ? 'is-active' : ''}" data-action="edit" aria-label="Sửa nội dung UI" title="Sửa nội dung UI">${ICONS.pencil}</button>
      <button class="ui-feedback-tool ${state.picking && state.mode === 'css' ? 'is-active' : ''}" data-action="css" aria-label="Tinh chỉnh CSS" title="Tinh chỉnh CSS">${ICONS.paintbrush}</button>
      ${undoButton}
    </div>
    <div data-ui-feedback-panel></div>
    <div data-ui-feedback-modal></div>
    <div data-ui-feedback-toast></div>`;
    if (state.panelOpen) renderPanel();
    if (state.modalOpen) renderModal();
  }

  /* ── toolbar actions ── */
  let lastToolbarAction = '';
  let lastToolbarActionAt = 0;

  function dispatchToolbarAction(action) {
    if (action === 'activate') toggle();
    if (action === 'list') togglePanel();
    if (action === 'undo') undoAction();
    if (action === 'comment') toggleMode('comment');
    if (action === 'edit') toggleMode('edit');
    if (action === 'css') toggleMode('css');
  }

  // Toggling behavior: clicking the same picking mode again turns it off.
  // Clicking a different mode swaps to that mode without an intermediate
  // "off" state.
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

  /* ── panel ── */
  function togglePanel(force) {
    state.panelOpen = typeof force === 'boolean' ? force : !state.panelOpen;
    if (!state.panelOpen) {
      renderToolbar();
      // If picking was active before the panel opened, resume it now.
      resumePickingIfNeeded();
      return;
    }
    stopPicking();
    renderToolbar();
    renderPanel();
  }

  function getFilteredComments() {
    let items = state.comments;
    if (state.filterPriority !== 'all') {
      items = items.filter((c) => c.priority === state.filterPriority);
    }
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      items = items.filter(
        (c) =>
          (c.comment || '').toLowerCase().includes(q) ||
          (c.selector || '').toLowerCase().includes(q) ||
          (c.tag || '').toLowerCase().includes(q) ||
          (c.targetText || '').toLowerCase().includes(q),
      );
    }
    return items;
  }

  function renderPanel() {
    const mount = root.querySelector('[data-ui-feedback-panel]');
    if (!mount || !state.panelOpen) return;
    const filtered = getFilteredComments();
    const grouped = filtered.reduce((groups, item) => {
      const key = item.page || location.pathname || '/';
      (groups[key] ||= []).push(item);
      return groups;
    }, {});
    const resolvedCount = state.comments.filter((c) => c.resolved).length;
    const openCount = state.comments.filter((c) => !c.resolved && c.type !== 'edit' && c.type !== 'css').length;
    const editCount = state.comments.filter((c) => c.type === 'edit' || c.type === 'css').length;
    const content = Object.entries(grouped)
      .map(
        ([page, items]) =>
          `<section class="ui-feedback-group"><span class="ui-feedback-group__name">${escapeHtml(page)} · ${items.length} mục</span>${items.map(renderItem).join('')}</section>`,
      )
      .join('');
    mount.innerHTML = `<aside class="ui-feedback-panel" aria-label="Danh sách feedback">
      <header class="ui-feedback-panel__header"><strong>Feedback (${openCount} mở · ${resolvedCount} xong) · Sửa (${editCount})</strong><span class="ui-feedback-panel__actions">${config.githubRepo ? `<button class="ui-feedback-icon-button" data-panel-action="github" aria-label="Tạo GitHub Issue" title="Tạo GitHub Issue">${ICONS.github}</button>` : ''}<button class="ui-feedback-icon-button" data-panel-action="export" aria-label="Xuất Markdown" title="Xuất Markdown">${ICONS.download}</button><button class="ui-feedback-icon-button" data-panel-action="close" aria-label="Đóng">${ICONS.close}</button></span></header>
      <div class="ui-feedback-panel__filter">
        <div class="ui-feedback-search-wrap">${ICONS.search}<input class="ui-feedback-search-input" data-panel-search type="text" placeholder="Tìm feedback…" value="${escapeAttribute(state.searchQuery)}" /></div>
        <select class="ui-feedback-filter-select" data-panel-filter aria-label="Lọc theo mức độ">
          <option value="all" ${state.filterPriority === 'all' ? 'selected' : ''}>Tất cả</option>
          <option value="high" ${state.filterPriority === 'high' ? 'selected' : ''}>Cao</option>
          <option value="medium" ${state.filterPriority === 'medium' ? 'selected' : ''}>Trung bình</option>
          <option value="low" ${state.filterPriority === 'low' ? 'selected' : ''}>Thấp</option>
        </select>
      </div>
      <div class="ui-feedback-panel__body">${content || `<div class="ui-feedback-empty">${state.searchQuery || state.filterPriority !== 'all' ? 'Không tìm thấy feedback phù hợp.' : 'Chưa có feedback. Chọn biểu tượng comment rồi bấm vào một phần tử trên trang.'}</div>`}</div>
    </aside>`;
    // Bind panel events through delegation
    mount.addEventListener('click', handlePanelClick);
    mount.addEventListener('input', handlePanelInput);
    mount.addEventListener('change', handlePanelChange);
  }

  function handlePanelClick(event) {
    const target = event.target.closest('[data-panel-action], [data-edit-comment], [data-delete-comment], [data-resolve-comment]');
    if (!target) return;
    event.stopPropagation();
    if (target.dataset.panelAction === 'close') togglePanel(false);
    else if (target.dataset.panelAction === 'export') exportMarkdown();
    else if (target.dataset.panelAction === 'github') createGithubIssue();
    else if (target.dataset.editComment) editComment(target.dataset.editComment);
    else if (target.dataset.deleteComment) deleteComment(target.dataset.deleteComment);
    else if (target.dataset.resolveComment) resolveComment(target.dataset.resolveComment);
  }

  function handlePanelInput(event) {
    if (event.target.matches('[data-panel-search]')) {
      state.searchQuery = event.target.value;
      // Re-render body only
      const body = root.querySelector('.ui-feedback-panel__body');
      if (body) {
        const filtered = getFilteredComments();
        const grouped = filtered.reduce((groups, item) => {
          const key = item.page || location.pathname || '/';
          (groups[key] ||= []).push(item);
          return groups;
        }, {});
        const content = Object.entries(grouped)
          .map(
            ([page, items]) =>
              `<section class="ui-feedback-group"><span class="ui-feedback-group__name">${escapeHtml(page)} · ${items.length} mục</span>${items.map(renderItem).join('')}</section>`,
          )
          .join('');
        body.innerHTML = content || `<div class="ui-feedback-empty">${state.searchQuery || state.filterPriority !== 'all' ? 'Không tìm thấy feedback phù hợp.' : 'Chưa có feedback.'}</div>`;
      }
    }
  }

  function handlePanelChange(event) {
    if (event.target.matches('[data-panel-filter]')) {
      state.filterPriority = event.target.value;
      renderPanel();
    }
  }

  function renderItem(item) {
    const priority = item.priority || 'medium';
    const resolved = item.resolved;
    const timeStr = relativeTime(item.updatedAt || item.createdAt);
    const contextTags = [];
    if (item.viewport) contextTags.push(`📱 ${item.viewport}`);
    if (item.scrollY !== undefined) contextTags.push(`↕️ ${item.scrollY}px`);

    return `<article class="ui-feedback-item ${resolved ? 'is-resolved' : ''}">
      <div class="ui-feedback-item__meta">
        <span class="ui-feedback-item__selector" title="${escapeAttribute(item.selector)}">${escapeHtml(item.selector)}</span>
        <span class="ui-feedback-priority ui-feedback-priority--${priority}">${priority}</span>
        <span class="ui-feedback-resolve-badge ${resolved ? 'is-resolved' : 'is-open'}">${resolved ? `${ICONS.check} Xong` : 'Mở'}</span>
      </div>
      ${contextTags.length ? `<div class="ui-feedback-item__context">${contextTags.map(t => `<span class="ui-feedback-context-tag">${escapeHtml(t)}</span>`).join('')}</div>` : ''}
      ${timeStr ? `<div class="ui-feedback-item__time">${escapeHtml(timeStr)}</div>` : ''}
      <p class="ui-feedback-item__target">${escapeHtml(item.tag)} · ${escapeHtml(item.targetText || 'Không có nội dung xem trước')}</p>
      ${item.type === 'edit' ? `<p class="ui-feedback-item__comment">✏️ Thay đổi text: <code>${escapeHtml(item.value)}</code></p>` : item.type === 'css' ? `<p class="ui-feedback-item__comment">🎨 Thay đổi CSS: <code>${escapeHtml(item.value)}</code></p>` : `<p class="ui-feedback-item__comment">${escapeHtml(item.comment)}</p>`}
      <div class="ui-feedback-item__actions">
        <button class="ui-feedback-mini ui-feedback-mini--resolve" data-resolve-comment="${item.id}" title="${resolved ? 'Mở lại' : 'Đánh dấu xong'}">${resolved ? ICONS.undo : ICONS.check} ${resolved ? 'Mở lại' : 'Xong'}</button>
        ${item.type !== 'edit' && item.type !== 'css' ? `<button class="ui-feedback-mini" data-edit-comment="${item.id}">${ICONS.edit} Sửa</button>` : ''}
        <button class="ui-feedback-mini" data-delete-comment="${item.id}">${ICONS.trash} Xóa</button>
      </div>
    </article>`;
  }

  /* ── picking ── */
  function clearResumeTimer() {
    if (state._resumeTimer) {
      clearTimeout(state._resumeTimer);
      state._resumeTimer = null;
    }
  }

  function beginPicking(mode, opts = {}) {
    clearResumeTimer();
    state.panelOpen = false;
    state.mode = mode;
    state.picking = true;
    state.pickingLocked = false;
    // Once picking is being explicitly entered, the previous resume context
    // is no longer relevant.
    state._modeBeforePickingStop = null;
    root.classList.add('ui-feedback-picking');
    renderToolbar();
    if (!opts.silent) {
      showToast(mode === 'comment' ? 'Chọn phần tử để ghi comment' : mode === 'edit' ? 'Chọn phần tử để sửa nội dung' : 'Chọn phần tử để tinh chỉnh CSS');
    }
  }

  function stopPicking(opts = {}) {
    clearResumeTimer();
    if (state.picking) {
      // Only remember the mode if picking was actually active — avoids
      // stomping on a previously saved context.
      state._modeBeforePickingStop = state.mode;
    }
    state.picking = false;
    state.pickingLocked = false;
    root.classList.remove('ui-feedback-picking');
    clearHighlight();
    // Some callers (e.g. the modal close path) need the toolbar to
    // re-render so the active state is cleared immediately.
    if (opts.rerender) renderToolbar();
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

  function clearHighlight() {
    if (state.highlight) {
      state.highlight.element.setAttribute('style', state.highlight.style || '');
      if (!state.highlight.style) state.highlight.element.removeAttribute('style');
      state.highlight = null;
    }
  }

  function highlight(element) {
    if (!(element instanceof Element) || element.closest('#ui-feedback-host')) return;
    if (state.highlight?.element === element) return;
    clearHighlight();
    state.highlight = { element, style: element.getAttribute('style') };
    element.style.setProperty('outline', `2px solid ${config.accent}`, 'important');
    element.style.setProperty('outline-offset', '3px', 'important');
  }

  /* ── comment markers on page ── */
  function placeMarkers() {
    // remove old markers
    markers.forEach((m) => m.markerEl?.remove());
    markers.length = 0;
    if (!state.active) return;
    state.comments.forEach((comment, index) => {
      let el;
      try { el = document.querySelector(comment.selector); } catch { el = null; }
      if (!el) return;
      const marker = document.createElement('div');
      const typeClass = comment.type === 'edit'
        ? ' is-edit'
        : comment.type === 'css'
          ? ' is-css'
          : '';
      const resolvedClass = comment.resolved ? ' is-resolved' : '';
      marker.className = `ui-feedback-marker${typeClass}${resolvedClass}`;
      // Use a glyph for edit/css so they read as "touched", comment items
      // keep their numeric index for ordering.
      if (comment.type === 'edit') marker.textContent = '✎';
      else if (comment.type === 'css') marker.textContent = '✦';
      else marker.textContent = index + 1;
      marker.title = comment.type === 'edit'
        ? `Đã sửa text: ${safeText(comment.value, 80)}`
        : comment.type === 'css'
          ? `Đã sửa CSS: ${safeText(comment.value, 80)}`
          : `Feedback #${index + 1}`;
      marker.style.position = 'absolute';
      // position relative to the element
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

  /* ── modal ── */
  function openModal(element, mode, existing = null) {
    // stopPicking() records state._modeBeforePickingStop so closeModal()
    // can resume the same mode after save/cancel.
    stopPicking();
    state.target = element;
    state.mode = mode;
    state.modalOpen = true;
    renderToolbar();
    renderModal(existing);
    setTimeout(() => root.querySelector('[data-feedback-input]')?.focus(), 0);
  }

  // Color palette for CSS mode
  const COLOR_PALETTE = [
    '#000000','#333333','#666666','#999999','#cccccc','#ffffff','#f5f5f5','#e0e0e0',
    '#ef4444','#f97316','#f59e0b','#eab308','#84cc16','#22c55e','#14b8a6','#06b6d4',
    '#0ea5e9','#3b82f6','#6366f1','#8b5cf6','#a855f7','#d946ef','#ec4899','#f43f5e',
    '#fecaca','#fed7aa','#fef08a','#d9f99d','#bbf7d0','#a7f3d0','#a5f3fc','#bfdbfe',
    '#7f1d1d','#9a3412','#78350f','#365314','#14532d','#134e4a','#0c4a6e','#1e3a5f',
  ];

  function renderModal(existing = null) {
    const mount = root.querySelector('[data-ui-feedback-modal]');
    if (!mount || !state.modalOpen) return;
    const isEdit = state.mode === 'edit';
    const isCss = state.mode === 'css';
    const currentText = existing?.comment || (isEdit ? safeText(state.target?.textContent, 500) : '');
    const priorityValue = existing?.priority || 'medium';
    const title = isEdit ? 'Sửa nội dung UI' : isCss ? 'Tinh chỉnh CSS' : 'Ghi chú feedback';

    let cssContent = '';
    if (isCss) {
      const currentColor = state.target?.style.color || '';
      const currentBg = state.target?.style.backgroundColor || '';
      cssContent = `
        <div class="ui-feedback-css-section">
          <div class="ui-feedback-css-section__title">Màu chữ (Color)</div>
          <div class="ui-feedback-color-grid" data-css-target="color">
            ${COLOR_PALETTE.map(c => `<div class="ui-feedback-color-swatch" data-swatch-color="${c}" data-css-prop="color" style="background:${c}" title="${c}"></div>`).join('')}
          </div>
        </div>
        <div class="ui-feedback-css-section">
          <div class="ui-feedback-css-section__title">Màu nền (Background)</div>
          <div class="ui-feedback-color-grid" data-css-target="backgroundColor">
            ${COLOR_PALETTE.map(c => `<div class="ui-feedback-color-swatch" data-swatch-color="${c}" data-css-prop="backgroundColor" style="background:${c}" title="${c}"></div>`).join('')}
          </div>
        </div>
        <div class="ui-feedback-css-section">
          <div class="ui-feedback-css-section__title">CSS tùy chỉnh</div>
          <input class="ui-feedback-css-inline" data-feedback-input placeholder="vd: font-size: 16px; padding: 10px;" value="${escapeAttribute(state.target?.style.cssText || '')}" />
        </div>
      `;
    }

    const commentContent = isEdit
      ? `<label class="ui-feedback-label" for="ui-feedback-input">Nội dung hiển thị</label><input class="ui-feedback-field" data-feedback-input value="${escapeAttribute(currentText)}" />`
      : isCss
        ? cssContent
        : `<label class="ui-feedback-label" for="ui-feedback-input">Element này cần sửa gì?</label><textarea class="ui-feedback-textarea" data-feedback-input placeholder="Ví dụ: Tăng khoảng cách giữa tiêu đề và danh sách…">${escapeHtml(currentText)}</textarea><div class="ui-feedback-form-row"><div><label class="ui-feedback-label" for="ui-feedback-priority">Mức độ ưu tiên</label><select id="ui-feedback-priority" class="ui-feedback-select" data-feedback-priority><option value="high" ${priorityValue === 'high' ? 'selected' : ''}>Cao</option><option value="medium" ${priorityValue === 'medium' ? 'selected' : ''}>Trung bình</option><option value="low" ${priorityValue === 'low' ? 'selected' : ''}>Thấp</option></select></div><div></div></div>`;

    mount.innerHTML = `<div class="ui-feedback-scrim" data-modal-action="cancel"></div><section class="ui-feedback-modal" role="dialog" aria-modal="true" aria-labelledby="ui-feedback-title"><div class="ui-feedback-modal__top"><h2 id="ui-feedback-title">${title}</h2><p>${escapeHtml(targetLabel(state.target))} · ${escapeHtml(safeText(cssPath(state.target), 90))}</p></div><div class="ui-feedback-modal__content">${commentContent}</div><footer class="ui-feedback-modal__footer"><button class="ui-feedback-button" data-modal-action="cancel">Hủy</button><button class="ui-feedback-button ui-feedback-button--primary" data-modal-action="save">Lưu</button></footer></section>`;
    // Bind via delegation on mount
    mount.addEventListener('click', handleModalClick);
    mount.addEventListener('keydown', handleModalKeydown);
  }

  function handleModalClick(event) {
    // Color swatch click
    const swatch = event.target.closest('[data-swatch-color]');
    if (swatch && state.target) {
      event.stopPropagation();
      const color = swatch.dataset.swatchColor;
      const prop = swatch.dataset.cssProp; // 'color' or 'backgroundColor'
      state.target.style[prop] = color;
      // highlight selected
      const grid = swatch.closest('.ui-feedback-color-grid');
      grid?.querySelectorAll('.ui-feedback-color-swatch').forEach(s => s.classList.remove('is-selected'));
      swatch.classList.add('is-selected');
      return;
    }
    const target = event.target.closest('[data-modal-action]');
    if (!target) return;
    event.stopPropagation();
    if (target.dataset.modalAction === 'cancel') closeModal(true); // true to resume picking mode
    else if (target.dataset.modalAction === 'save') saveModal();
  }

  function handleModalKeydown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeModal(true); // resume picking on Escape
    }
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      saveModal();
    }
  }

  // Track existing item being edited
  let editingExisting = null;

  function openModalWithExisting(element, mode, existing) {
    editingExisting = existing || null;
    openModal(element, mode, existing);
  }

  function saveModal() {
    const input = root.querySelector('[data-feedback-input]');
    const value = input?.value?.trim() || '';
    if (!value) {
      input?.focus();
      showToast('Vui lòng nhập nội dung trước khi lưu');
      return;
    }
    const existing = editingExisting;
    const modeUsed = state.mode;
    if (modeUsed === 'edit' || modeUsed === 'css') {
      if (state.target) {
        const oldValue = modeUsed === 'edit' ? state.target.textContent : state.target.style.cssText;
        if (modeUsed === 'edit') state.target.textContent = value;
        if (modeUsed === 'css') {
          // Apply the inline input CSS on top of color swatch changes
          const inlineInput = root.querySelector('.ui-feedback-css-inline');
          if (inlineInput?.value?.trim()) {
            state.target.style.cssText = state.target.style.cssText + '; ' + inlineInput.value.trim();
          }
        }
        const newValue = modeUsed === 'edit' ? value : state.target.style.cssText;
        
        const item = {
          id: generateId(),
          type: modeUsed,
          selector: cssPath(state.target),
          tag: targetLabel(state.target),
          targetText: safeText(oldValue, 120),
          value: newValue,
          page: location.pathname || '/',
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          scrollY: Math.round(window.scrollY),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        state.comments.push(item);
        
        state.undoStack.push({
          type: modeUsed,
          id: item.id,
          selector: item.selector,
          oldValue: oldValue
        });
      }
      persist();
      showToast(modeUsed === 'edit' ? 'Đã cập nhật nội dung trên trang' : 'Đã apply CSS', { undo: true });
    } else {
      const item = existing || { id: generateId(), createdAt: new Date().toISOString(), type: 'comment' };
      item.comment = value;
      item.priority = root.querySelector('[data-feedback-priority]')?.value || item.priority || 'medium';
      item.selector = cssPath(state.target);
      item.tag = targetLabel(state.target);
      item.targetText = safeText(state.target?.textContent, 120);
      item.page = location.pathname || '/';
      item.viewport = `${window.innerWidth}x${window.innerHeight}`;
      item.scrollY = Math.round(window.scrollY);
      item.updatedAt = new Date().toISOString();
      if (!existing) state.comments.push(item);
      persist();
      showToast(existing ? 'Đã cập nhật feedback' : 'Đã lưu feedback');
      // Pulse the badge
      setTimeout(() => {
        const badge = root.querySelector('.ui-feedback-badge');
        if (badge) {
          badge.classList.remove('is-pulse');
          void badge.offsetWidth;
          badge.classList.add('is-pulse');
        }
      }, 50);
    }
    editingExisting = null;
    closeModal(true); // true = came from save, should resume picking
  }

  function closeModal(resumePicking = false) {
    state.modalOpen = false;
    state.target = null;
    editingExisting = null;
    renderToolbar();
    // Place markers after comment save
    placeMarkers();
    // Resume picking mode if came from a save
    if (resumePicking) {
      resumePickingIfNeeded();
    }
  }

  /* ── comment CRUD ── */
  function editComment(id) {
    const item = state.comments.find((c) => c.id === id);
    if (!item) return;
    let target = null;
    try {
      target = document.querySelector(item.selector);
    } catch { /* selector may have changed */ }
    openModalWithExisting(target || document.body, 'comment', item);
  }

  function deleteComment(id) {
    const index = state.comments.findIndex((c) => c.id === id);
    if (index === -1) return;
    const deleted = state.comments.splice(index, 1)[0];
    state.undoStack.push({ type: 'delete', item: deleted, index });
    persist();
    renderToolbar();
    state.panelOpen = true;
    renderPanel();
    showToast('Đã xóa feedback', { undo: true });
  }

  function undoAction() {
    const entry = state.undoStack.pop();
    if (!entry) return;

    if (entry.type === 'delete') {
      state.comments.splice(entry.index, 0, entry.item);
      persist();
      renderToolbar();
      state.panelOpen = true;
      renderPanel();
      showToast('Đã hoàn tác xóa');
    } else if (entry.type === 'edit' || entry.type === 'css') {
      try {
        const el = document.querySelector(entry.selector);
        if (el) {
          if (entry.type === 'edit') el.textContent = entry.oldValue;
          if (entry.type === 'css') el.style.cssText = entry.oldValue;
        }
      } catch (e) { console.error('Undo DOM error', e); }
      const idx = state.comments.findIndex(c => c.id === entry.id);
      if (idx !== -1) state.comments.splice(idx, 1);
      persist();
      renderToolbar();
      renderPanel();
      placeMarkers();
      showToast('Đã hoàn tác chỉnh sửa');
    }
  }

  function resolveComment(id) {
    const item = state.comments.find((c) => c.id === id);
    if (!item) return;
    item.resolved = !item.resolved;
    item.updatedAt = new Date().toISOString();
    persist();
    renderPanel();
    showToast(item.resolved ? 'Đã đánh dấu xong' : 'Đã mở lại feedback');
  }

  /* ── export ── */
  function renderItemMarkdown(item, index) {
    const lines = [];
    const status = item.resolved ? '✅ Đã xử lý' : '⏳ Chưa xử lý';
    const typeLabel = item.type === 'edit' ? '✏️ Edit' : item.type === 'css' ? '🎨 CSS' : '💬 Feedback';
    const title = item.type === 'edit' ? 'Sửa text' : item.type === 'css' ? 'Sửa CSS' : 'Feedback';
    lines.push(`### ${index + 1}. ${escapeMarkdown(item.tag)} _(${typeLabel})_`, '', `- **Tiêu đề:** ${title}`);
    if (item.type === 'edit') {
      lines.push(`- **Text hiện tại:** ${escapeMarkdown(item.targetText || '')}`);
      lines.push(`- **Text mới:** ${escapeMarkdown(item.value || '')}`);
    } else if (item.type === 'css') {
      lines.push(`- **CSS cũ:** \`${escapeMarkdown(item.targetText || '')}\``);
      lines.push(`- **CSS mới:** \`${escapeMarkdown(item.value || '')}\``);
    } else {
      lines.push(`- **Ưu tiên:** ${item.priority || 'medium'}`);
      lines.push(`- **Feedback:** ${escapeMarkdown(item.comment || '')}`);
    }
    lines.push(`- **Selector:** \`${item.selector}\``);
    lines.push(`- **Trạng thái:** ${status}`);
    if (item.viewport) lines.push(`- **Context:** \`${item.viewport}\` · \`${item.scrollY}px\``);
    lines.push(`- **Tạo lúc:** ${item.createdAt ? formatDate(new Date(item.createdAt)) : 'N/A'}`);
    lines.push(`- **Cập nhật:** ${item.updatedAt ? formatDate(new Date(item.updatedAt)) : 'N/A'}`);
    lines.push('');
    return lines;
  }

  function exportMarkdown() {
    const resolvedCount = state.comments.filter((c) => c.resolved).length;
    const openCount = state.comments.length - resolvedCount;
    const editCount = state.comments.filter((c) => c.type === 'edit' || c.type === 'css').length;
    const feedbackCount = state.comments.length - editCount;
    const lines = [
      `# UI/UX Feedback`,
      '',
      `- **URL:** ${location.href}`,
      `- **Ngày xuất:** ${formatDate(new Date())}`,
      `- **Tổng feedback:** ${state.comments.length} (${feedbackCount} ghi chú, ${editCount} chỉnh sửa, ${openCount} mở, ${resolvedCount} đã xử lý)`,
      '',
    ];
    const grouped = state.comments.reduce((groups, item) => {
      const key = item.page || '/';
      (groups[key] ||= []).push(item);
      return groups;
    }, {});
    Object.entries(grouped).forEach(([page, items]) => {
      lines.push(`## ${page}`, '');
      items.forEach((item, index) => {
        renderItemMarkdown(item, index).forEach((l) => lines.push(l));
      });
    });
    // Summary table — only buckets comment items (edit/css lack priority).
    lines.push('---', '', '## Tóm tắt', '');
    lines.push(`| Loại | Số lượng |`);
    lines.push(`|------|----------|`);
    lines.push(`| 💬 Feedback (ghi chú) | ${feedbackCount} |`);
    lines.push(`| ✏️ Edit (sửa text) | ${state.comments.filter((c) => c.type === 'edit').length} |`);
    lines.push(`| 🎨 CSS (sửa CSS) | ${state.comments.filter((c) => c.type === 'css').length} |`);
    lines.push('');
    lines.push(`### Theo mức độ (chỉ feedback)`);
    lines.push(`| Mức độ | Mở | Xong | Tổng |`);
    lines.push(`|--------|-----|------|------|`);
    ['high', 'medium', 'low'].forEach((p) => {
      const all = state.comments.filter((c) => c.type === 'comment' && (c.priority || 'medium') === p);
      const res = all.filter((c) => c.resolved).length;
      const label = p === 'high' ? 'Cao' : p === 'medium' ? 'Trung bình' : 'Thấp';
      lines.push(`| ${label} | ${all.length - res} | ${res} | ${all.length} |`);
    });
    lines.push('');

    const blob = new Blob([lines.join('\n').replace(/\n\n\n+/g, '\n\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `ui-feedback-${new Date().toISOString().slice(0, 10)}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
    showToast('Đã xuất file Markdown');
  }

  /* ── toast ── */
  let toastTimer;
  function showToast(message, opts = {}) {
    const mount = root.querySelector('[data-ui-feedback-toast]');
    if (!mount) return;
    clearTimeout(toastTimer);
    const undoBtn = opts.undo
      ? `<button class="ui-feedback-toast__undo" data-toast-undo>Hoàn tác</button>`
      : '';
    mount.innerHTML = `<div class="ui-feedback-toast" role="status">${escapeHtml(message)}${undoBtn}</div>`;
    if (opts.undo) {
      mount.querySelector('[data-toast-undo]')?.addEventListener('click', (e) => {
        e.stopPropagation();
        undoAction();
        mount.innerHTML = '';
      });
    }
    toastTimer = setTimeout(() => {
      const toast = mount.querySelector('.ui-feedback-toast');
      if (toast) {
        toast.classList.add('is-leaving');
        setTimeout(() => { mount.innerHTML = ''; }, 220);
      }
    }, opts.undo ? 5000 : 2400);
  }

  /* ── github issue ── */
  function createGithubIssue() {
    if (!config.githubRepo) return;
    const unresolved = state.comments.filter((c) => !c.resolved);
    if (!unresolved.length) {
      showToast('Không có feedback nào đang mở!');
      return;
    }
    const lines = [
      `# UI Feedback Review`,
      `\n**Context:** \`${window.innerWidth}x${window.innerHeight}\` · \`${state.theme}\``,
      '',
    ];
    unresolved.forEach((item, i) => {
      const typeLabel = item.type === 'edit' ? '✏️ Edit' : item.type === 'css' ? '🎨 CSS' : '💬 Feedback';
      lines.push(`### ${i + 1}. ${escapeMarkdown(item.tag)} _(${typeLabel})_`);
      if (item.type === 'edit') {
        lines.push(`- **Current text:** ${escapeMarkdown(item.targetText || '')}`);
        lines.push(`- **New text:** ${escapeMarkdown(item.value || '')}`);
      } else if (item.type === 'css') {
        lines.push(`- **Old CSS:** \`${escapeMarkdown(item.targetText || '')}\``);
        lines.push(`- **New CSS:** \`${escapeMarkdown(item.value || '')}\``);
      } else {
        lines.push(`- **Priority:** ${item.priority || 'medium'}`);
        lines.push(`- **Feedback:** ${escapeMarkdown(item.comment || '')}`);
      }
      lines.push(`- **Element:** \`${item.targetText ? escapeMarkdown(item.targetText.substring(0, 60)) : 'N/A'}\``);
      lines.push('');
    });
    const body = encodeURIComponent(lines.join('\n'));
    const url = `https://github.com/${config.githubRepo}/issues/new?title=UI+Feedback+Review&body=${body}`;
    window.open(url, '_blank');
    showToast('Đang mở trang tạo Issue');
  }

  /* ── toggle ── */
  function toggle() {
    state.active = !state.active;
    persistActive();
    state.panelOpen = false;
    state.modalOpen = false;
    // Don't carry over picking context across a hard toggle on/off.
    state._modeBeforePickingStop = null;
    clearResumeTimer();
    stopPicking();
    renderToolbar();
    if (state.active) {
      placeMarkers();
    } else {
      clearMarkers();
    }
    showToast(state.active ? 'UI Feedback đã bật' : 'UI Feedback đã tắt');
  }

  /* ── keyboard shortcut ── */
  function normalizeShortcutKey(event) {
    const fromCode = typeof event.code === 'string' && event.code.startsWith('Key') ? event.code.slice(3) : '';
    return (fromCode || event.key || '').toLowerCase();
  }

  function keydown(event) {
    // Escape closes modal or panel when active
    if (event.key === 'Escape' && state.active) {
      if (state.modalOpen) { closeModal(true); event.preventDefault(); return; }
      if (state.panelOpen) { togglePanel(false); event.preventDefault(); return; }
      if (state.picking) {
        // Stop cleanly but keep the mode so the next toolbar click
        // resumes (or the user can hit the same button to re-enter).
        stopPicking({ rerender: true });
        event.preventDefault();
        return;
      }
    }

    const key = normalizeShortcutKey(event);

    // Quick Tagging during picking
    if (state.picking && state.highlight?.element && !state.pickingLocked) {
      const char = key.toUpperCase();
      if (['T', 'C', 'S'].includes(char)) {
        event.preventDefault();
        const tags = { 'T': '[Typography]', 'C': '[Color]', 'S': '[Spacing]' };
        const item = {
          id: generateId(),
          createdAt: new Date().toISOString(),
          comment: tags[char],
          priority: 'high',
          selector: cssPath(state.highlight.element),
          tag: targetLabel(state.highlight.element),
          targetText: safeText(state.highlight.element.textContent, 120),
          page: location.pathname || '/',
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          scrollY: Math.round(window.scrollY),
          updatedAt: new Date().toISOString()
        };
        state.comments.push(item);
        persist();
        stopPicking();
        renderToolbar();
        showToast(`Đã note ${tags[char]}`);
        setTimeout(() => {
          const badge = root.querySelector('.ui-feedback-badge');
          if (badge) {
            badge.classList.remove('is-pulse');
            void badge.offsetWidth;
            badge.classList.add('is-pulse');
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

  /* ── element picking ── */
  function elementAtPoint(clientX, clientY) {
    const picker = root.querySelector('[data-picker-layer]');
    if (picker) picker.style.display = 'none';
    const element = document.elementFromPoint(clientX, clientY);
    if (picker) picker.style.display = '';
    if (
      !(element instanceof Element) ||
      element === document.documentElement ||
      element === document.body ||
      element.closest('#ui-feedback-host')
    )
      return null;
    return element;
  }

  function pointerMove(event) {
    if (!state.picking) return;
    const element = elementAtPoint(event.clientX, event.clientY);
    if (element) highlight(element);
  }

  /* ── unified host-level event delegation ── */
  // All click/pointerdown events are handled here to prevent double-fire issues.
  function handleHostEvent(event) {
    const path = event.composedPath();

    // 1) toolbar buttons
    const button = path.find(
      (node) => node instanceof HTMLButtonElement && node.dataset?.action,
    );
    if (button) {
      triggerToolbarAction(event, button);
      return;
    }

    // 2) picker layer interactions
    if (!state.picking || state.pickingLocked) return;
    const picker = path.find(
      (node) => node instanceof Element && node.matches?.('[data-picker-layer]'),
    );
    if (!picker) return;

    const element = elementAtPoint(event.clientX, event.clientY);
    if (!element) return;

    event.preventDefault();
    event.stopPropagation();

    // Lock to prevent the companion click from also firing
    state.pickingLocked = true;
    setTimeout(() => { state.pickingLocked = false; }, 600);

    openModal(element, state.mode);
  }

  /* ── document-level picking fallback ── */
  // Only fires for elements NOT inside the shadow host, in case the picker
  // layer fails to intercept (e.g. on elements with pointer-events:none above it).
  function documentPickHandler(event) {
    if (!state.picking || state.pickingLocked) return;
    if (event.composedPath().includes(host)) return;
    const element = event.target instanceof Element ? event.target : null;
    if (!element || element === document.documentElement || element === document.body) return;
    event.preventDefault();
    event.stopPropagation();
    state.pickingLocked = true;
    setTimeout(() => { state.pickingLocked = false; }, 600);
    openModal(element, state.mode);
  }

  /* ── drag & drop toolbar ── */
  function handleDragStart(event) {
    const path = event.composedPath();
    const grip = path.find(
      (node) => node instanceof Element && node.matches?.('[data-drag-handle]'),
    );
    if (!grip) return;

    event.preventDefault();
    event.stopPropagation();

    const toolbar = root.querySelector('.ui-feedback-toolbar');
    if (!toolbar) return;

    const rect = toolbar.getBoundingClientRect();
    dragState = {
      startX: event.clientX,
      startY: event.clientY,
      startRight: window.innerWidth - rect.right,
      startTop: rect.top,
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
      document.removeEventListener('pointermove', onMove, true);
      document.removeEventListener('pointerup', onEnd, true);
      document.removeEventListener('pointercancel', onEnd, true);
    }

    document.addEventListener('pointermove', onMove, true);
    document.addEventListener('pointerup', onEnd, true);
    document.addEventListener('pointercancel', onEnd, true);
  }

  /* ── dispose ── */
  function dispose() {
    stopPicking();
    clearMarkers();
    window.removeEventListener('scroll', refreshMarkerPositions);
    window.removeEventListener('resize', refreshMarkerPositions);
    document.removeEventListener('keydown', keydown, true);
    document.removeEventListener('keyup', keyup, true);
    window.removeEventListener('blur', blurHandler);
    document.removeEventListener('pointermove', pointerMove, true);
    document.removeEventListener('pointerdown', documentPickHandler, true);
    document.removeEventListener('click', documentPickHandler, true);
    host.removeEventListener('pointerdown', handleHostEvent, true);
    host.removeEventListener('click', handleHostEvent, true);
    host.removeEventListener('pointerdown', handleDragStart, true);
    host.remove();
    delete window.__uiFeedbackInstance;
  }

  /* ── bind global listeners ── */
  const blurHandler = () => pressed.clear();

  document.addEventListener('keydown', keydown, true);
  document.addEventListener('keyup', keyup, true);
  window.addEventListener('blur', blurHandler);
  // Keep markers positioned on scroll/resize
  window.addEventListener('scroll', refreshMarkerPositions, { passive: true });
  window.addEventListener('resize', refreshMarkerPositions, { passive: true });
  document.addEventListener('pointermove', pointerMove, true);
  // Document-level pick fallback (capture)
  document.addEventListener('pointerdown', documentPickHandler, true);
  document.addEventListener('click', documentPickHandler, true);
  // Host-level delegation — handles toolbar buttons + picker layer
  host.addEventListener('pointerdown', handleHostEvent, true);
  host.addEventListener('click', handleHostEvent, true);
  // Drag
  host.addEventListener('pointerdown', handleDragStart, true);

  window.__uiFeedbackInstance = {
    toggle,
    exportMarkdown,
    getComments: () => [...state.comments],
    dispose,
  };
  renderToolbar();
  if (state.active) placeMarkers();
  return window.__uiFeedbackInstance;
}

if (typeof window !== 'undefined') {
  window.UIFeedback = { createUIFeedback };
}
