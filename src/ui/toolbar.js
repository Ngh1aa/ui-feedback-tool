import { ICONS } from './icons.js';

export function renderToolbar(ctx) {
  const {
    state, root, getToolbarStyle, dismissCoachmark,
    renderPanel, renderModal, renderInspector,
  } = ctx;
  if (!state.active) {
    root.innerHTML = '';
    return;
  }

  const undoCount = state.undoStack.length;
  const undoBadge = undoCount ? `<span class="ui-feedback-badge ui-feedback-badge--undo">${undoCount}</span>` : '';
  const updateLabel = state.updateBusy ? 'Đang kiểm tra' : 'Update';
  const coachmark = state.coachmarkVisible
    ? '<aside class="ui-feedback-coachmark" role="status"><strong>Bắt đầu với UI Feedback</strong><p>Ghi nhận thay đổi ngay trên bản preview, không cần rời khỏi trang.</p><ol class="ui-feedback-coachmark__steps"><li>Chọn một công cụ trên thanh dock.</li><li>Rê chuột và bấm vào phần tử cần review.</li><li>Lưu feedback hoặc hoàn tác bằng nút Undo.</li></ol><button type="button" data-coachmark-dismiss>Đã hiểu</button></aside>'
    : '';
  const bubble = `<button class="ui-feedback-toolbar-bubble" data-action="collapse" aria-label="Mở thanh công cụ" title="Mở thanh công cụ">${ICONS.grip}<span class="ui-feedback-badge" ${state.comments.length ? '' : 'hidden'}>${state.comments.length}</span></button>`;
  const dock = `<div class="ui-feedback-toolbar" role="toolbar" aria-label="UI Feedback tools" style="${getToolbarStyle()}">
      <div class="ui-feedback-toolbar-grip" data-drag-handle aria-label="Kéo để di chuyển toolbar">${ICONS.grip}</div>
      <button class="ui-feedback-tool ${state.panelOpen ? 'is-active' : ''}" data-action="list" aria-label="Mở danh sách feedback" title="Danh sách feedback">${ICONS.clipboard}<span class="ui-feedback-tool__label">Feedback</span><span class="ui-feedback-badge" ${state.comments.length ? '' : 'hidden'}>${state.comments.length}</span></button>
      <button class="ui-feedback-tool ${state.picking && state.mode === 'comment' ? 'is-active' : ''}" data-action="comment" aria-label="Thêm note" title="Thêm note">${ICONS.comment}<span class="ui-feedback-tool__label">Note</span></button>
      <button class="ui-feedback-tool ${state.picking && state.mode === 'edit' ? 'is-active' : ''}" data-action="edit" aria-label="Sửa nội dung UI" title="Sửa text">${ICONS.pencil}<span class="ui-feedback-tool__label">Sửa text</span></button>
      <button class="ui-feedback-tool ${state.picking && state.mode === 'css' ? 'is-active' : ''}" data-action="css" aria-label="Mở Bộ CSS" title="Bộ CSS">${ICONS.paintbrush}<span class="ui-feedback-tool__label">Bộ CSS</span></button>
      <button class="ui-feedback-tool ${state.picking && state.mode === 'image' ? 'is-active' : ''}" data-action="image" aria-label="Thay ảnh" title="Thay ảnh">${ICONS.image}<span class="ui-feedback-tool__label">Thay ảnh</span></button>
      <button class="ui-feedback-tool ui-feedback-tool--update ${state.updateBusy ? 'is-busy' : ''}" data-action="update" aria-label="Kiểm tra và cập nhật UI Feedback tool" title="Kiểm tra bản cập nhật" aria-busy="${state.updateBusy ? 'true' : 'false'}">${ICONS.refresh}<span class="ui-feedback-tool__label">${updateLabel}</span></button>
      ${undoCount ? `<button class="ui-feedback-tool" data-action="undo" aria-label="Hoàn tác thao tác gần nhất" title="Hoàn tác (${undoCount})">${ICONS.undo}<span class="ui-feedback-tool__label">Undo</span>${undoBadge}</button>` : ''}
      <button class="ui-feedback-tool" data-action="collapse" aria-label="Thu gọn thanh công cụ" title="Thu gọn">${ICONS.collapse}</button>
    </div>`;
  root.innerHTML = `${state.picking ? '<div class="ui-feedback-picker-layer" data-picker-layer aria-hidden="true"></div>' : ''}<div class="ui-feedback-measurement-layer" data-picker-measurement-layer aria-hidden="true"></div>${state.collapsed ? bubble : dock}${coachmark}<div data-ui-feedback-panel></div><div data-ui-feedback-modal></div>${renderInspector ? renderInspector() : ''}<div data-ui-feedback-toast></div>`;
  if (state.panelOpen) renderPanel();
  if (state.modalOpen) renderModal();
}

export function dismissCoachmark(ctx) {
  ctx.state.coachmarkVisible = false;
  ctx.persistCoachmark?.();
  renderToolbar(ctx);
}
