import { ICONS } from './icons.js';

export function renderToolbar(ctx) {
  const {
    state, root, getToolbarStyle, dismissCoachmark,
    renderPanel, renderModal,
  } = ctx;
  if (!state.active) {
    root.innerHTML = '';
    return;
  }

  const undoCount = state.undoStack.length;
  const undoBadge = undoCount ? `<span class="ui-feedback-badge ui-feedback-badge--undo">${undoCount}</span>` : '';
  const coachmark = state.coachmarkVisible
    ? '<aside class="ui-feedback-coachmark" role="status"><strong>3 bước để ghi yêu cầu</strong><ol class="ui-feedback-coachmark__steps"><li>Chọn Ghi chú, Sửa chữ, Chỉnh CSS hoặc Đổi ảnh.</li><li>Bấm vào phần tử cần thay đổi và chỉnh trực tiếp.</li><li>Mở Danh sách rồi bấm Xuất .md.</li></ol><button type="button" data-coachmark-dismiss>Đã hiểu</button></aside>'
    : '';
  const bubble = `<button class="ui-feedback-toolbar-bubble" data-action="collapse" aria-label="Mở thanh công cụ" title="Mở thanh công cụ">${ICONS.grip}<span class="ui-feedback-badge" ${state.comments.length ? '' : 'hidden'}>${state.comments.length}</span></button>`;
  const dock = `<div class="ui-feedback-toolbar" role="toolbar" aria-label="UI Feedback tools" style="${getToolbarStyle()}">
      <div class="ui-feedback-toolbar-grip" data-drag-handle aria-label="Kéo để di chuyển toolbar">${ICONS.grip}</div>
      <button class="ui-feedback-tool ${state.panelOpen ? 'is-active' : ''}" data-action="list" aria-label="Mở danh sách thay đổi" title="Danh sách thay đổi">${ICONS.clipboard}<span class="ui-feedback-tool__label">Danh sách</span><span class="ui-feedback-badge" ${state.comments.length ? '' : 'hidden'}>${state.comments.length}</span></button>
      <button class="ui-feedback-tool ${state.picking && state.mode === 'comment' ? 'is-active' : ''}" data-action="comment" aria-label="Ghi chú yêu cầu" title="Ghi chú yêu cầu">${ICONS.comment}<span class="ui-feedback-tool__label">Ghi chú</span></button>
      <button class="ui-feedback-tool ${state.picking && state.mode === 'edit' ? 'is-active' : ''}" data-action="edit" aria-label="Sửa nội dung" title="Sửa nội dung">${ICONS.pencil}<span class="ui-feedback-tool__label">Sửa chữ</span></button>
      <button class="ui-feedback-tool ${state.picking && state.mode === 'css' ? 'is-active' : ''}" data-action="css" aria-label="Chỉnh CSS" title="Chỉnh CSS">${ICONS.paintbrush}<span class="ui-feedback-tool__label">Chỉnh CSS</span></button>
      <button class="ui-feedback-tool ${state.picking && state.mode === 'image' ? 'is-active' : ''}" data-action="image" aria-label="Đổi hình ảnh" title="Đổi hình ảnh">${ICONS.image}<span class="ui-feedback-tool__label">Đổi ảnh</span></button>
      ${undoCount ? `<button class="ui-feedback-tool" data-action="undo" aria-label="Hoàn tác thay đổi gần nhất" title="Hoàn tác (${undoCount})">${ICONS.undo}<span class="ui-feedback-tool__label">Hoàn tác</span>${undoBadge}</button>` : ''}
      <button class="ui-feedback-tool" data-action="collapse" aria-label="Thu gọn thanh công cụ" title="Thu gọn">${ICONS.collapse}</button>
    </div>`;
  root.innerHTML = `${state.picking ? '<div class="ui-feedback-picker-layer" data-picker-layer aria-hidden="true"></div>' : ''}${state.collapsed ? bubble : dock}${coachmark}<div data-ui-feedback-panel></div><div data-ui-feedback-modal></div><div data-ui-feedback-toast></div>`;
  if (state.panelOpen) renderPanel();
  if (state.modalOpen) renderModal();
}

export function dismissCoachmark(ctx) {
  ctx.state.coachmarkVisible = false;
  ctx.persistCoachmark?.();
  renderToolbar(ctx);
}
