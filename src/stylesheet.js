export const STYLESHEET = `
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

/* ── animations ── */
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

/* ── floating action dock ── */
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

/* ── first-use coachmark ── */
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
.ui-feedback-coachmark__steps li::before { content: '•'; margin-right: 6px; color: var(--ui-feedback-accent); }
.ui-feedback-coachmark button { width: 100%; border: 1px solid var(--ui-feedback-accent); border-radius: 7px; padding: 7px 9px; color: #141414; background: var(--ui-feedback-accent); font-size: 11px; font-weight: 800; }

/* ── panel ── */
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

/* ── advanced CSS editor ── */
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
.ui-feedback-image-preview { position: relative; display: flex; align-items: center; justify-content: center; min-height: 180px; overflow: hidden; border: 1px dashed var(--_border); border-radius: 8px; background: repeating-conic-gradient(var(--_bg-alt) 0 25%, var(--_bg-hover) 0 50%) 50% / 16px 16px; cursor: grab; touch-action: none; }
.ui-feedback-image-preview:active,
.ui-feedback-image-preview.is-dragging { cursor: grabbing; }
.ui-feedback-image-preview img { display: block; width: 100%; height: 180px; object-fit: cover; user-select: none; pointer-events: none; transform-origin: 50% 50%; transition: transform .12s ease, object-position .12s ease; }
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
.ui-feedback-image-url { width: 100%; border: 1px solid var(--_border); border-radius: 6px; padding: 9px 10px; color: var(--_text); background: var(--_bg-input); outline: none; font-size: 11px; }
.ui-feedback-image-url:focus { border-color: var(--ui-feedback-accent); }
.ui-feedback-image-paste { width: 100%; border: 1px solid var(--_border); border-radius: 6px; padding: 8px; color: var(--_text-secondary); background: var(--_bg-panel); font-size: 11px; }
.ui-feedback-image-paste:hover { border-color: var(--ui-feedback-accent); color: var(--_text); }
.ui-feedback-image-upload { width: 100%; border: 1px dashed var(--_border); border-radius: 6px; padding: 8px; color: var(--_text-secondary); background: var(--_bg-alt); font-size: 11px; }
.ui-feedback-image-original { display: block; overflow: hidden; color: var(--_text-muted); font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
.ui-feedback-marker.is-image { background: #fcd34d; border-color: #b45309; color: #78350f; font-size: 11px; line-height: 1; }
.ui-feedback-marker-layer.is-dark .ui-feedback-marker.is-image { background: #92400e; border-color: #fcd34d; color: #fef3c7; }

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
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; scroll-behavior: auto !important; }
}
  /* ── v0.7 visual refresh: white accent + modern dark surfaces ── */
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

  /* ── v0.9 visual refresh: modern minimalism ── */
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

  /* ── v0.10 advanced CSS editor ── */
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
