import { FEEDBACK_CATEGORIES, defaultCategoryForType, categoryLabel } from '../core/config.js';
import { escapeAttribute, escapeHtml, firstCodeLine, relativeTime, resolveSelector, safeText } from '../core/dom-utils.js';
import { ICONS } from '../ui/icons.js';

export function createCommentsController(ctx) {
  const { state } = ctx;

  function imageDisplayValue(item) {
    return item.imageSourceType === 'upload' || String(item.value || '').startsWith('data:image/')
      ? '[Ảnh upload local]'
      : item.value;
  }

  function getFilteredComments() {
    let items = state.comments;
    if (state.drawerTab === 'comment') items = items.filter((item) => item.type === 'comment');
    if (state.drawerTab === 'edit') items = items.filter((item) => ['edit', 'css', 'image'].includes(item.type));
    if (state.drawerTab === 'resolved') items = items.filter((item) => item.resolved);
    if (state.filterPriority !== 'all') items = items.filter((item) => item.priority === state.filterPriority);
    if (state.filterCategory !== 'all') {
      items = items.filter((item) => (item.category || defaultCategoryForType(item.type)) === state.filterCategory);
    }
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      items = items.filter((item) => [item.comment, item.selector, item.tag, item.targetText, item.value]
        .some((value) => String(value || '').toLowerCase().includes(query)));
    }
    return items;
  }

  function getItemCodeLine(item) {
    return firstCodeLine(resolveSelector(item.selector)) || item.codeLine || '';
  }

  function renderItem(item) {
    const expanded = Boolean(state.expandedComments?.[item.id]);
    const time = relativeTime(item.updatedAt || item.createdAt);
    const contextTags = [];
    if (item.viewport) contextTags.push(`📱 ${item.viewport}`);
    if (item.scrollY !== undefined) contextTags.push(`↕️ ${item.scrollY}px`);
    const category = categoryLabel(item.category, item.type);
    const content = item.type === 'edit'
      ? `<p class="ui-feedback-item__comment">✏️ Nội dung mong muốn: <code>${escapeHtml(item.value)}</code></p>`
      : item.type === 'css'
        ? '<p class="ui-feedback-item__comment">✦ Đã ghi nhận các thuộc tính CSS thay đổi</p>'
        : item.type === 'image'
          ? `<p class="ui-feedback-item__comment">▧ Hình ảnh mong muốn: <code>${escapeHtml(imageDisplayValue(item))}</code></p>`
          : `<p class="ui-feedback-item__comment">${escapeHtml(item.comment)}</p>`;
    const details = expanded ? `<div class="ui-feedback-item__details">
      ${contextTags.length ? `<div class="ui-feedback-item__context">${contextTags.map((tag) => `<span class="ui-feedback-context-tag">${escapeHtml(tag)}</span>`).join('')}</div>` : ''}
      ${time ? `<div class="ui-feedback-item__time">${escapeHtml(time)}</div>` : ''}
      <div class="ui-feedback-item__code" title="Dòng code đầu của component"><code>${escapeHtml(item.codeLine || getItemCodeLine(item) || item.tag || 'Không xác định')}</code></div>
    </div>` : '';
    const typeLabel = item.type === 'edit' ? 'Sửa chữ' : item.type === 'css' ? 'CSS' : item.type === 'image' ? 'Hình ảnh' : 'Ghi chú';
    const targetPreview = item.type === 'css' ? 'Thay đổi style của phần tử này' : (item.targetText || 'Không có nội dung xem trước');
    return `<article class="ui-feedback-item ${expanded ? 'is-expanded' : ''}" data-comment-id="${escapeAttribute(item.id)}" tabindex="0" aria-label="Mở phần tử ${escapeAttribute(item.tag || item.selector)}">
      <div class="ui-feedback-item__meta">
        <div class="ui-feedback-item__identity"><span class="ui-feedback-item__selector" title="${escapeAttribute(item.selector)}">${escapeHtml(item.selector)}</span><button class="ui-feedback-copy-selector" data-copy-selector="${escapeAttribute(item.selector)}" aria-label="Copy selector" title="Copy selector">⧉</button></div>
        <div class="ui-feedback-item__badges"><span class="ui-feedback-category-chip">${escapeHtml(typeLabel)}</span><span class="ui-feedback-category-chip ui-feedback-category-chip--muted">${escapeHtml(category)}</span></div>
      </div>
      <p class="ui-feedback-item__target">${escapeHtml(item.tag)} <span aria-hidden="true">·</span> ${escapeHtml(targetPreview)}</p>
      ${content}
      ${details}
      <div class="ui-feedback-item__actions">
        <button class="ui-feedback-mini ui-feedback-mini--details" data-toggle-comment="${escapeAttribute(item.id)}" aria-expanded="${expanded ? 'true' : 'false'}">${expanded ? 'Ẩn chi tiết' : 'Chi tiết'} <span aria-hidden="true">${expanded ? '⌃' : '⌄'}</span></button>
        <span class="ui-feedback-item__action-spacer"></span>
        ${!['edit', 'css', 'image'].includes(item.type) ? `<button class="ui-feedback-mini" data-edit-comment="${escapeAttribute(item.id)}">${ICONS.edit} Sửa</button>` : ''}
        <button class="ui-feedback-mini" data-delete-comment="${escapeAttribute(item.id)}">${ICONS.trash} Xóa</button>
      </div>
    </article>`;
  }

  function renderGroupedComments(items) {
    const grouped = items.reduce((groups, item) => {
      const page = item.page || location.pathname || '/';
      (groups[page] ||= []).push(item);
      return groups;
    }, {});
    return Object.entries(grouped).map(([page, pageItems]) => {
      return `<section class="ui-feedback-group"><div class="ui-feedback-group__name"><span title="${escapeAttribute(page)}">${escapeHtml(page)}</span><span>${pageItems.length}</span></div>${pageItems.map(renderItem).join('')}</section>`;
    }).join('');
  }

  function renderCategoryOptions(selected = 'all') {
    return `<option value="all" ${selected === 'all' ? 'selected' : ''}>Tất cả phân loại</option>${FEEDBACK_CATEGORIES.map((category) => `<option value="${category.value}" ${selected === category.value ? 'selected' : ''}>${category.label}</option>`).join('')}`;
  }

  function editComment(id) {
    const item = state.comments.find((comment) => comment.id === id);
    if (!item) return;
    if ((item.page || '/') !== (location.pathname || '/')) {
      ctx.showToast(`Feedback nằm ở trang ${item.page || '/'}`);
      return;
    }
    const element = resolveSelector(item.selector);
    if (!element) {
      ctx.showToast('Không tìm thấy phần tử để sửa feedback');
      return;
    }
    ctx.openModalWithExisting(element, ['css', 'image'].includes(item.type) ? item.type : 'comment', item);
  }

  function deleteComment(id) {
    const index = state.comments.findIndex((comment) => comment.id === id);
    if (index === -1) return;
    const deleted = state.comments.splice(index, 1)[0];
    state.undoStack.push({ type: 'delete', item: deleted, index });
    ctx.persist();
    ctx.renderToolbar();
    state.panelOpen = true;
    ctx.renderPanel();
    ctx.placeMarkers();
    ctx.showToast('Đã xóa feedback', { undo: true });
  }

  function undoAction() {
    const entry = state.undoStack.pop();
    if (!entry) return;
    if (entry.type === 'delete') {
      state.comments.splice(entry.index, 0, entry.item);
      ctx.persist();
      ctx.renderToolbar();
      state.panelOpen = true;
      ctx.renderPanel();
      ctx.placeMarkers();
      ctx.showToast('Đã hoàn tác xóa');
      return;
    }
    if (entry.type === 'export-clear') {
      state.comments.splice(0, state.comments.length, ...entry.items);
      ctx.persist();
      ctx.renderToolbar();
      state.panelOpen = true;
      ctx.renderPanel();
      ctx.placeMarkers();
      ctx.showToast(`Đã khôi phục ${entry.items.length} mục`);
      return;
    }
    if (['edit', 'css', 'image'].includes(entry.type)) {
      const element = resolveSelector(entry.selector);
      if (element) {
        if (entry.type === 'edit') element.textContent = entry.oldValue;
        if (entry.type === 'css') element.style.cssText = entry.oldValue;
        if (entry.type === 'image') ctx.restoreImageState(element, entry.oldImageState);
      }
      const index = state.comments.findIndex((comment) => comment.id === entry.id);
      if (index !== -1) state.comments.splice(index, 1);
      ctx.persist();
      ctx.renderToolbar();
      ctx.renderPanel();
      ctx.placeMarkers();
      ctx.showToast('Đã hoàn tác chỉnh sửa');
    }
  }

  function resolveComment(id) {
    const item = state.comments.find((comment) => comment.id === id);
    if (!item) return;
    item.resolved = !item.resolved;
    item.updatedAt = new Date().toISOString();
    ctx.persist();
    ctx.renderPanel();
    ctx.placeMarkers();
    ctx.showToast(item.resolved ? 'Đã đánh dấu xong' : 'Đã mở lại feedback');
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
    resolveComment,
  };
}
