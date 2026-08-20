import { categoryLabel } from '../core/config.js';
import { escapeMarkdown, formatDate } from '../core/dom-utils.js';

export function createMarkdownExporter(ctx) {
  const { state } = ctx;

  function renderItemMarkdown(item, index) {
    const status = item.resolved ? 'Đã xử lý' : 'Đang mở';
    const lines = [`### ${index + 1}. ${escapeMarkdown(item.tag || 'Element')} _(${item.type || 'comment'})_`];
    if (item.type === 'edit') {
      lines.push(`- **Text cũ:** ${escapeMarkdown(item.targetText || '')}`);
      lines.push(`- **Text mới:** ${escapeMarkdown(item.value || '')}`);
    } else if (item.type === 'css') {
      lines.push(`- **CSS cũ:** \`${escapeMarkdown(item.targetText || '')}\``);
      lines.push(`- **CSS mới:** \`${escapeMarkdown(item.value || '')}\``);
    } else if (item.type === 'image') {
      lines.push(`- **Ảnh cũ:** ${escapeMarkdown(item.targetText || 'Không có')}`);
      lines.push(`- **Ảnh mới:** ${escapeMarkdown(item.value || '')}`);
      lines.push(`- **Nguồn:** ${item.imageSourceType === 'upload' ? 'Upload từ máy' : 'URL website'}`);
    } else {
      lines.push(`- **Ưu tiên:** ${item.priority || 'medium'}`);
      lines.push(`- **Feedback:** ${escapeMarkdown(item.comment || '')}`);
    }
    lines.push(`- **Phân loại:** ${categoryLabel(item.category, item.type)}`);
    lines.push(`- **Dòng code đầu:** \`${escapeMarkdown(item.codeLine || ctx.getItemCodeLine(item) || item.tag || '')}\``);
    lines.push(`- **Selector:** \`${escapeMarkdown(item.selector || '')}\``);
    lines.push(`- **Trạng thái:** ${status}`);
    if (item.viewport) lines.push(`- **Context:** \`${item.viewport}\` · \`${item.scrollY}px\``);
    lines.push(`- **Tạo lúc:** ${item.createdAt ? formatDate(new Date(item.createdAt)) : 'N/A'}`);
    lines.push(`- **Cập nhật:** ${item.updatedAt ? formatDate(new Date(item.updatedAt)) : 'N/A'}`);
    lines.push('');
    return lines;
  }

  function exportMarkdown() {
    const resolvedCount = state.comments.filter((item) => item.resolved).length;
    const openCount = state.comments.length - resolvedCount;
    const editCount = state.comments.filter((item) => ['edit', 'css', 'image'].includes(item.type)).length;
    const feedbackCount = state.comments.length - editCount;
    const lines = [
      '# UI/UX Feedback', '',
      `- **URL:** ${location.href}`,
      `- **Ngày xuất:** ${formatDate(new Date())}`,
      `- **Tổng feedback:** ${state.comments.length} (${feedbackCount} ghi chú, ${editCount} chỉnh sửa, ${openCount} mở, ${resolvedCount} đã xử lý)`, '',
    ];
    const grouped = state.comments.reduce((groups, item) => {
      const key = item.page || '/';
      (groups[key] ||= []).push(item);
      return groups;
    }, {});
    Object.entries(grouped).forEach(([page, items]) => {
      lines.push(`## ${page}`, '');
      items.forEach((item, index) => renderItemMarkdown(item, index).forEach((line) => lines.push(line)));
    });
    lines.push('---', '', '## Tóm tắt', '', '| Loại | Số lượng |', '|------|----------|');
    lines.push(`| Feedback (ghi chú) | ${feedbackCount} |`);
    lines.push(`| Edit (sửa text) | ${state.comments.filter((item) => item.type === 'edit').length} |`);
    lines.push(`| CSS (Bộ giao diện) | ${state.comments.filter((item) => item.type === 'css').length} |`);
    lines.push(`| Image (thay ảnh) | ${state.comments.filter((item) => item.type === 'image').length} |`, '');
    lines.push('### Theo mức độ (chỉ feedback)', '| Mức độ | Mở | Xong | Tổng |', '|--------|-----|------|------|');
    ['high', 'medium', 'low'].forEach((priority) => {
      const all = state.comments.filter((item) => !['edit', 'css', 'image'].includes(item.type) && (item.priority || 'medium') === priority);
      const resolved = all.filter((item) => item.resolved).length;
      const label = priority === 'high' ? 'Cao' : priority === 'medium' ? 'Trung bình' : 'Thấp';
      lines.push(`| ${label} | ${all.length - resolved} | ${resolved} | ${all.length} |`);
    });
    lines.push('');

    const blob = new Blob([lines.join('\n').replace(/\n\n\n+/g, '\n\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `ui-feedback-${new Date().toISOString().slice(0, 10)}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
    const exportedCount = state.comments.length;
    state.comments = [];
    state.undoStack = [];
    ctx.persist();
    ctx.clearMarkers();
    state.panelOpen = false;
    ctx.renderToolbar();
    ctx.showToast(exportedCount ? `Đã xuất Markdown và làm sạch ${exportedCount} mục` : 'Đã xuất file Markdown');
  }

  return { exportMarkdown, renderItemMarkdown };
}
