const DEFAULTS = {
  shortcut: ['q', 'w', 'e'],
  storageKey: 'ui-feedback-session',
  accent: '#f5a623',
  position: 'right',
};

const CSS = `
:host { all: initial; }
* { box-sizing: border-box; }
button, input, textarea, select { font: inherit; }
button { cursor: pointer; }
.ui-feedback-root { color: #171717; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 14px; line-height: 1.4; }
.ui-feedback-root [hidden] { display: none !important; }
.ui-feedback-toolbar { position: fixed; right: 20px; top: 50%; transform: translateY(-50%); z-index: 2147483000; display: flex; flex-direction: column; gap: 12px; align-items: center; }
.ui-feedback-tool { width: 54px; height: 54px; border: 1px solid rgba(255,255,255,.18); border-radius: 50%; display: grid; place-items: center; color: #fff; background: #121212; box-shadow: 0 10px 26px rgba(0,0,0,.18); transition: transform .18s ease, background .18s ease, box-shadow .18s ease; position: relative; }
.ui-feedback-tool:hover, .ui-feedback-tool:focus-visible { transform: translateY(-2px); background: #282828; box-shadow: 0 14px 28px rgba(0,0,0,.24); outline: 3px solid color-mix(in srgb, var(--ui-feedback-accent), transparent 65%); outline-offset: 2px; }
.ui-feedback-tool.is-active { background: var(--ui-feedback-accent); color: #141414; }
.ui-feedback-tool svg { width: 22px; height: 22px; stroke: currentColor; fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.ui-feedback-badge { position: absolute; top: -5px; right: -5px; min-width: 21px; height: 21px; padding: 0 5px; display: grid; place-items: center; border-radius: 99px; color: #fff; background: #d11b51; font-size: 11px; font-weight: 800; border: 2px solid #fff; }
.ui-feedback-panel { position: fixed; right: 88px; top: 50%; transform: translateY(-50%); width: min(390px, calc(100vw - 112px)); max-height: min(640px, calc(100vh - 32px)); overflow: hidden; z-index: 2147482999; border: 1px solid #dedede; border-radius: 14px; background: #fff; box-shadow: 0 22px 60px rgba(0,0,0,.22); }
.ui-feedback-panel__header { padding: 15px 16px; color: #111; background: var(--ui-feedback-accent); display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.ui-feedback-panel__header strong { font-size: 15px; }
.ui-feedback-panel__actions { display: flex; gap: 5px; }
.ui-feedback-icon-button { width: 30px; height: 30px; border: 0; border-radius: 7px; display: grid; place-items: center; color: inherit; background: transparent; }
.ui-feedback-icon-button:hover, .ui-feedback-icon-button:focus-visible { background: rgba(0,0,0,.11); outline: none; }
.ui-feedback-icon-button svg { width: 17px; height: 17px; stroke: currentColor; fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.ui-feedback-panel__body { max-height: calc(min(640px, 100vh - 32px) - 62px); overflow: auto; padding: 10px; background: #fafafa; }
.ui-feedback-empty { padding: 35px 18px; color: #777; text-align: center; }
.ui-feedback-group { margin-bottom: 10px; }
.ui-feedback-group__name { display: block; padding: 7px 9px; color: #666; background: #ededed; border-radius: 7px 7px 0 0; font-size: 12px; font-weight: 700; }
.ui-feedback-item { padding: 12px; background: #fff; border: 1px solid #e5e5e5; border-top: 0; }
.ui-feedback-item:first-of-type { border-radius: 0 0 7px 7px; }
.ui-feedback-item + .ui-feedback-item { border-top: 1px solid #ececec; }
.ui-feedback-item__meta { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 7px; color: #777; font-size: 11px; }
.ui-feedback-item__selector { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ui-feedback-priority { padding: 2px 6px; border-radius: 99px; font-size: 10px; font-weight: 800; text-transform: uppercase; }
.ui-feedback-priority--high { color: #991b1b; background: #fee2e2; }
.ui-feedback-priority--medium { color: #92400e; background: #fef3c7; }
.ui-feedback-priority--low { color: #166534; background: #dcfce7; }
.ui-feedback-item__comment { margin: 0; white-space: pre-wrap; color: #222; font-size: 13px; }
.ui-feedback-item__target { margin: 8px 0 0; color: #888; font-size: 11px; }
.ui-feedback-item__actions { display: flex; justify-content: flex-end; gap: 4px; margin-top: 7px; }
.ui-feedback-mini { border: 0; padding: 4px 7px; border-radius: 5px; color: #555; background: #f1f1f1; font-size: 11px; }
.ui-feedback-mini:hover { color: #111; background: #e4e4e4; }
.ui-feedback-scrim { position: fixed; inset: 0; z-index: 2147482990; background: rgba(0,0,0,.18); backdrop-filter: blur(1px); }
.ui-feedback-modal { position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%); width: min(430px, calc(100vw - 32px)); z-index: 2147483010; border: 1px solid #e1e1e1; border-radius: 14px; background: #fff; box-shadow: 0 30px 80px rgba(0,0,0,.27); overflow: hidden; }
.ui-feedback-modal__top { padding: 18px 20px 12px; border-bottom: 1px solid #efefef; }
.ui-feedback-modal__top h2 { margin: 0 0 7px; font-size: 16px; }
.ui-feedback-modal__top p { overflow: hidden; margin: 0; color: #777; font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.ui-feedback-modal__content { padding: 17px 20px; }
.ui-feedback-label { display: block; margin: 0 0 7px; color: #666; font-size: 12px; font-weight: 700; }
.ui-feedback-field, .ui-feedback-textarea, .ui-feedback-select { width: 100%; border: 0; border-bottom: 2px solid var(--ui-feedback-accent); border-radius: 0; padding: 8px 0; color: #171717; background: transparent; outline: none; }
.ui-feedback-textarea { min-height: 94px; resize: vertical; }
.ui-feedback-field:focus, .ui-feedback-textarea:focus, .ui-feedback-select:focus { box-shadow: 0 2px 0 rgba(245,166,35,.3); }
.ui-feedback-form-row { display: grid; grid-template-columns: 1fr 120px; gap: 18px; margin-top: 17px; }
.ui-feedback-modal__footer { display: flex; justify-content: flex-end; gap: 9px; padding: 0 20px 18px; }
.ui-feedback-button { min-width: 76px; border: 1px solid #222; padding: 9px 16px; color: #222; background: #fff; }
.ui-feedback-button:hover { background: #f6f6f6; }
.ui-feedback-button--primary { border-color: var(--ui-feedback-accent); background: var(--ui-feedback-accent); }
.ui-feedback-button--primary:hover { filter: brightness(.95); }
.ui-feedback-toast { position: fixed; right: 22px; bottom: 20px; z-index: 2147483020; padding: 11px 15px; border-radius: 8px; color: #fff; background: #151515; box-shadow: 0 10px 25px rgba(0,0,0,.2); font-size: 12px; }
.ui-feedback-picking, .ui-feedback-picking * { cursor: crosshair !important; }
@media (max-width: 640px) {
  .ui-feedback-toolbar { right: 12px; gap: 9px; }
  .ui-feedback-tool { width: 48px; height: 48px; }
  .ui-feedback-panel { right: 70px; width: min(340px, calc(100vw - 84px)); }
  .ui-feedback-form-row { grid-template-columns: 1fr; gap: 12px; }
}
`;

const ICONS = {
  clipboard: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4.5V3h6v1.5M9 9h6M9 13h6M9 17h4"/></svg>',
  comment: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5.5h14v10H9l-4 3v-13Z"/><path d="M9 10.5h6M12 8v5"/></svg>',
  pencil: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 16.5-.8 4.3 4.3-.8L19 8.5 15.5 5 4 16.5Z"/><path d="m13.8 6.7 3.5 3.5M4 20.8l3.5-.8"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>',
  download: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M4 20h16"/></svg>',
  trash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M10 11v5M14 11v5M8 7l1 13h6l1-13M9 7l1-3h4l1 3"/></svg>',
  edit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 16.5-.8 4.3 4.3-.8L19 8.5 15.5 5 4 16.5Z"/><path d="m13.8 6.7 3.5 3.5"/></svg>',
};

function escapeMarkdown(value) {
  return String(value || '').replace(/[\\`*_{}\[\]()#+.!|>-]/g, '\\$&');
}

function formatDate(date) {
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function safeText(value, max = 180) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function isEditable(target) {
  return target instanceof HTMLElement && (target.matches('input, textarea, select, [contenteditable="true"]') || Boolean(target.closest('input, textarea, select, [contenteditable="true"]')));
}

function cssPath(element) {
  if (!(element instanceof Element)) return '';
  const parts = [];
  let node = element;
  while (node && node.nodeType === 1 && node !== document.body && parts.length < 6) {
    let part = node.tagName.toLowerCase();
    if (node.id) {
      part += `#${CSS.escape(node.id)}`;
      parts.unshift(part);
      break;
    }
    const classes = [...node.classList].filter(Boolean).slice(0, 2);
    if (classes.length) part += `.${classes.map(CSS.escape).join('.')}`;
    const siblings = node.parentElement ? [...node.parentElement.children].filter((sibling) => sibling.tagName === node.tagName) : [];
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
  const classes = [...element.classList].filter(Boolean).slice(0, 2).map((name) => `.${name}`).join('');
  return `${tag}${id}${classes}`;
}

export function createUIFeedback(options = {}) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return null;
  if (window.__uiFeedbackInstance) return window.__uiFeedbackInstance;

  const config = { ...DEFAULTS, ...options, shortcut: (options.shortcut || DEFAULTS.shortcut).map((key) => key.toLowerCase()) };
  const pressed = new Set();
  const recentShortcutKeys = [];
  let shortcutTimer;
  const state = {
    active: false,
    picking: false,
    mode: 'comment',
    panelOpen: false,
    modalOpen: false,
    target: null,
    highlight: null,
    comments: loadComments(),
    edits: [],
  };

  const host = document.createElement('div');
  host.id = 'ui-feedback-host';
  host.dataset.uiFeedbackIgnore = 'true';
  const shadow = host.attachShadow({ mode: 'open' });
  shadow.innerHTML = `<style>${CSS}</style><div class="ui-feedback-root" style="--ui-feedback-accent:${config.accent}"></div>`;
  const root = shadow.querySelector('.ui-feedback-root');
  document.documentElement.appendChild(host);

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

  function renderToolbar() {
    if (!state.active) {
      root.innerHTML = '';
      return;
    }
    root.innerHTML = `<div class="ui-feedback-toolbar" role="toolbar" aria-label="UI Feedback tools">
      <button class="ui-feedback-tool ${state.panelOpen ? 'is-active' : ''}" data-action="list" aria-label="Mở danh sách feedback" title="Danh sách feedback">${ICONS.clipboard}<span class="ui-feedback-badge" ${state.comments.length ? '' : 'hidden'}>${state.comments.length}</span></button>
      <button class="ui-feedback-tool ${state.picking && state.mode === 'comment' ? 'is-active' : ''}" data-action="comment" aria-label="Thêm comment" title="Thêm comment">${ICONS.comment}</button>
      <button class="ui-feedback-tool ${state.picking && state.mode === 'edit' ? 'is-active' : ''}" data-action="edit" aria-label="Sửa nội dung UI" title="Sửa nội dung UI">${ICONS.pencil}</button>
    </div>
    <div data-ui-feedback-panel></div>
    <div data-ui-feedback-modal></div>
    <div data-ui-feedback-toast></div>`;
    bindToolbar();
    if (state.panelOpen) renderPanel();
    if (state.modalOpen) renderModal();
  }

  function bindToolbar() {
    root.querySelectorAll('[data-action]').forEach((button) => {
      button.addEventListener('click', () => {
        const action = button.dataset.action;
        if (action === 'list') togglePanel();
        if (action === 'comment') beginPicking('comment');
        if (action === 'edit') beginPicking('edit');
      });
    });
  }

  function togglePanel(force) {
    state.panelOpen = typeof force === 'boolean' ? force : !state.panelOpen;
    if (!state.panelOpen) {
      renderToolbar();
      return;
    }
    stopPicking();
    renderToolbar();
    renderPanel();
  }

  function renderPanel() {
    const mount = root.querySelector('[data-ui-feedback-panel]');
    if (!mount || !state.panelOpen) return;
    const grouped = state.comments.reduce((groups, item) => {
      const key = item.page || location.pathname || '/';
      (groups[key] ||= []).push(item);
      return groups;
    }, {});
    const content = Object.entries(grouped).map(([page, items]) => `<section class="ui-feedback-group"><span class="ui-feedback-group__name">${page} · ${items.length} mục</span>${items.map(renderItem).join('')}</section>`).join('');
    mount.innerHTML = `<aside class="ui-feedback-panel" aria-label="Danh sách feedback">
      <header class="ui-feedback-panel__header"><strong>Feedback (${state.comments.length}) · Sửa nội dung (${state.edits.length})</strong><span class="ui-feedback-panel__actions"><button class="ui-feedback-icon-button" data-panel-action="export" aria-label="Xuất Markdown" title="Xuất Markdown">${ICONS.download}</button><button class="ui-feedback-icon-button" data-panel-action="close" aria-label="Đóng">${ICONS.close}</button></span></header>
      <div class="ui-feedback-panel__body">${content || '<div class="ui-feedback-empty">Chưa có feedback. Chọn biểu tượng comment rồi bấm vào một phần tử trên trang.</div>'}</div>
    </aside>`;
    mount.querySelector('[data-panel-action="close"]').addEventListener('click', () => togglePanel(false));
    mount.querySelector('[data-panel-action="export"]').addEventListener('click', exportMarkdown);
    mount.querySelectorAll('[data-edit-comment]').forEach((button) => button.addEventListener('click', () => editComment(button.dataset.editComment)));
    mount.querySelectorAll('[data-delete-comment]').forEach((button) => button.addEventListener('click', () => deleteComment(button.dataset.deleteComment)));
  }

  function renderItem(item) {
    const priority = item.priority || 'medium';
    return `<article class="ui-feedback-item"><div class="ui-feedback-item__meta"><span class="ui-feedback-item__selector" title="${item.selector}">${item.selector}</span><span class="ui-feedback-priority ui-feedback-priority--${priority}">${priority}</span></div><p class="ui-feedback-item__comment">${item.comment}</p><p class="ui-feedback-item__target">${item.tag} · ${item.targetText || 'Không có nội dung xem trước'}</p><div class="ui-feedback-item__actions"><button class="ui-feedback-mini" data-edit-comment="${item.id}">${ICONS.edit} Sửa</button><button class="ui-feedback-mini" data-delete-comment="${item.id}">${ICONS.trash} Xóa</button></div></article>`;
  }

  function beginPicking(mode) {
    state.panelOpen = false;
    state.mode = mode;
    state.picking = true;
    root.classList.add('ui-feedback-picking');
    renderToolbar();
    showToast(mode === 'comment' ? 'Chọn phần tử để ghi comment' : 'Chọn phần tử để sửa nội dung');
  }

  function stopPicking() {
    state.picking = false;
    root.classList.remove('ui-feedback-picking');
    clearHighlight();
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

  function openModal(element, mode, existing = null) {
    stopPicking();
    state.target = element;
    state.mode = mode;
    state.modalOpen = true;
    renderToolbar();
    renderModal(existing);
    setTimeout(() => root.querySelector('[data-feedback-input]')?.focus(), 0);
  }

  function renderModal(existing = null) {
    const mount = root.querySelector('[data-ui-feedback-modal]');
    if (!mount || !state.modalOpen) return;
    const isEdit = state.mode === 'edit';
    const currentText = existing?.comment || (isEdit ? safeText(state.target?.textContent, 500) : '');
    mount.innerHTML = `<div class="ui-feedback-scrim" data-modal-action="cancel"></div><section class="ui-feedback-modal" role="dialog" aria-modal="true" aria-labelledby="ui-feedback-title"><div class="ui-feedback-modal__top"><h2 id="ui-feedback-title">${isEdit ? 'Sửa nội dung UI' : 'Ghi chú feedback'}</h2><p>${targetLabel(state.target)} · ${safeText(cssPath(state.target), 90)}</p></div><div class="ui-feedback-modal__content"><label class="ui-feedback-label" for="ui-feedback-input">${isEdit ? 'Nội dung hiển thị' : 'Element này cần sửa gì?'}</label>${isEdit ? `<input class="ui-feedback-field" data-feedback-input value="${escapeAttribute(currentText)}" />` : `<textarea class="ui-feedback-textarea" data-feedback-input placeholder="Ví dụ: Tăng khoảng cách giữa tiêu đề và danh sách...">${escapeHtml(currentText)}</textarea><div class="ui-feedback-form-row"><div><label class="ui-feedback-label" for="ui-feedback-priority">Mức độ ưu tiên</label><select id="ui-feedback-priority" class="ui-feedback-select" data-feedback-priority><option value="high">Cao</option><option value="medium" selected>Trung bình</option><option value="low">Thấp</option></select></div><div></div></div>`}</div><footer class="ui-feedback-modal__footer"><button class="ui-feedback-button" data-modal-action="cancel">Hủy</button><button class="ui-feedback-button ui-feedback-button--primary" data-modal-action="save">Lưu</button></footer></section>`;
    mount.querySelectorAll('[data-modal-action="cancel"]').forEach((button) => button.addEventListener('click', closeModal));
    mount.querySelector('[data-modal-action="save"]').addEventListener('click', () => saveModal(existing));
    mount.querySelector('[data-feedback-input]')?.addEventListener('keydown', (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') saveModal(existing);
    });
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, '&#096;');
  }

  function saveModal(existing) {
    const input = root.querySelector('[data-feedback-input]');
    const value = input?.value?.trim() || '';
    if (!value) {
      input?.focus();
      showToast('Vui lòng nhập nội dung trước khi lưu');
      return;
    }
    if (state.mode === 'edit') {
      if (state.target) {
        state.target.textContent = value;
        state.edits.push({ selector: cssPath(state.target), tag: targetLabel(state.target), value, updatedAt: new Date().toISOString() });
      }
      showToast('Đã cập nhật nội dung trên trang');
    } else {
      const item = existing || { id: crypto.randomUUID(), createdAt: new Date().toISOString() };
      item.comment = value;
      item.priority = root.querySelector('[data-feedback-priority]')?.value || item.priority || 'medium';
      item.selector = cssPath(state.target);
      item.tag = targetLabel(state.target);
      item.targetText = safeText(state.target?.textContent, 120);
      item.page = location.pathname || '/';
      if (!existing) state.comments.push(item);
      persist();
      showToast(existing ? 'Đã cập nhật feedback' : 'Đã lưu feedback');
    }
    closeModal();
  }

  function closeModal() {
    state.modalOpen = false;
    state.target = null;
    renderToolbar();
  }

  function editComment(id) {
    const item = state.comments.find((comment) => comment.id === id);
    if (!item) return;
    const target = [...document.querySelectorAll('*')].find((element) => cssPath(element) === item.selector);
    openModal(target || document.body, 'comment', item);
  }

  function deleteComment(id) {
    state.comments = state.comments.filter((comment) => comment.id !== id);
    persist();
    renderToolbar();
    state.panelOpen = true;
    renderPanel();
    showToast('Đã xóa feedback');
  }

  function exportMarkdown() {
    const lines = [`# UI/UX Feedback`, '', `- **URL:** ${location.href}`, `- **Ngày xuất:** ${formatDate(new Date())}`, `- **Số feedback:** ${state.comments.length}`, `- **Số chỉnh sửa nội dung:** ${state.edits.length}`, ''];
    Object.entries(state.comments.reduce((groups, item) => {
      const key = item.page || '/';
      (groups[key] ||= []).push(item);
      return groups;
    }, {})).forEach(([page, items]) => {
      lines.push(`## ${page}`, '');
      items.forEach((item, index) => {
        lines.push(`### ${index + 1}. ${escapeMarkdown(item.tag)}`, '', `- **Ưu tiên:** ${item.priority || 'medium'}`, `- **Selector:** \`${item.selector}\``, `- **Element:** ${escapeMarkdown(item.targetText || '')}`, `- **Feedback:** ${escapeMarkdown(item.comment)}`, `- **Trạng thái:** Chưa xử lý`, '');
      });
    });
    if (state.edits.length) {
      lines.push('## Lịch sử sửa nội dung', '');
      state.edits.forEach((edit) => lines.push(`- **${escapeMarkdown(edit.tag)}** · \`${edit.selector}\` → ${escapeMarkdown(edit.value)}`));
      lines.push('');
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `ui-feedback-${new Date().toISOString().slice(0, 10)}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
    showToast('Đã xuất file Markdown');
  }

  let toastTimer;
  function showToast(message) {
    const mount = root.querySelector('[data-ui-feedback-toast]');
    if (!mount) return;
    mount.innerHTML = `<div class="ui-feedback-toast" role="status">${escapeHtml(message)}</div>`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { mount.innerHTML = ''; }, 2400);
  }

  function toggle() {
    state.active = !state.active;
    state.panelOpen = false;
    state.modalOpen = false;
    stopPicking();
    renderToolbar();
    showToast(state.active ? 'UI Feedback đã bật' : 'UI Feedback đã tắt');
  }

  function keydown(event) {
    if (isEditable(event.target)) return;
    const key = event.key.toLowerCase();
    if (!config.shortcut.includes(key)) return;
    pressed.add(key);
    if (!event.repeat) {
      recentShortcutKeys.push(key);
      while (recentShortcutKeys.length > config.shortcut.length) recentShortcutKeys.shift();
      const simultaneous = config.shortcut.every((required) => pressed.has(required));
      const quickSequence = config.shortcut.every((required) => recentShortcutKeys.includes(required));
      if (simultaneous || quickSequence) {
        event.preventDefault();
        recentShortcutKeys.length = 0;
        clearTimeout(shortcutTimer);
        toggle();
      } else {
        clearTimeout(shortcutTimer);
        shortcutTimer = setTimeout(() => { recentShortcutKeys.length = 0; }, 700);
      }
    }
  }

  function keyup(event) {
    pressed.delete(event.key.toLowerCase());
  }

  function pointerMove(event) {
    if (!state.picking || event.composedPath().includes(host)) return;
    const element = event.target instanceof Element ? event.target : null;
    if (element && element !== document.documentElement && element !== document.body) highlight(element);
  }

  function pointerClick(event) {
    if (!state.picking || event.composedPath().includes(host)) return;
    const element = event.target instanceof Element ? event.target : null;
    if (!element || element === document.documentElement || element === document.body) return;
    event.preventDefault();
    event.stopPropagation();
    openModal(element, state.mode);
  }

  function dispose() {
    stopPicking();
    window.removeEventListener('keydown', keydown, true);
    window.removeEventListener('keyup', keyup, true);
    window.removeEventListener('blur', () => pressed.clear());
    document.removeEventListener('pointermove', pointerMove, true);
    document.removeEventListener('click', pointerClick, true);
    host.remove();
    delete window.__uiFeedbackInstance;
  }

  window.addEventListener('keydown', keydown, true);
  window.addEventListener('keyup', keyup, true);
  window.addEventListener('blur', () => pressed.clear());
  document.addEventListener('pointermove', pointerMove, true);
  document.addEventListener('click', pointerClick, true);
  window.__uiFeedbackInstance = { toggle, exportMarkdown, getComments: () => [...state.comments], dispose };
  return window.__uiFeedbackInstance;
}

if (typeof window !== 'undefined') {
  window.UIFeedback = { createUIFeedback };
}
