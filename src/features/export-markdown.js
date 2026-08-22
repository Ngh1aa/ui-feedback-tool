import { categoryLabel } from '../core/config.js';
import { escapeMarkdown, formatDate } from '../core/dom-utils.js';

export function createMarkdownExporter(ctx) {
  const { state } = ctx;

  function exportImageValue(item) {
    if (item.imageSourceType === 'upload' || String(item.value || '').startsWith('data:image/')) {
      return '[Ảnh upload local — dùng đúng ảnh đã chọn trong phiên review]';
    }
    return item.value || '';
  }

  function tableValue(value, fallback = '—') {
    const text = String(value ?? '').trim();
    return (text || fallback).replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
  }

  function codeTableValue(value, fallback = '—') {
    const text = String(value ?? '').trim();
    return (text || fallback).replace(/\|/g, '\\|').replace(/`/g, '\\`').replace(/\r?\n/g, ' ');
  }

  function inlineCode(value, fallback = '—') {
    const text = String(value ?? '').trim();
    return (text || fallback).replace(/`/g, '\\`').replace(/\r?\n/g, ' ');
  }

  function proseValue(value, fallback = '—') {
    const text = String(value ?? '').trim();
    return (text || fallback).replace(/\r?\n/g, '  \n');
  }

  function parseCssText(value) {
    return String(value || '').split(';').reduce((result, declaration) => {
      const separator = declaration.indexOf(':');
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
    return [...new Set([...Object.keys(before), ...Object.keys(after)])]
      .filter((property) => before[property] !== after[property])
      .map((property) => ({ property, before: before[property] || '', after: after[property] || '' }));
  }

  function renderLocation(item) {
    return [
      `- **Trang:** \`${inlineCode(item.page || '/')}\``,
      `- **Phần tử:** ${escapeMarkdown(item.tag || 'Không xác định')}`,
      `- **Selector:** \`${inlineCode(item.selector || '')}\``,
      `- **Dòng code nhận diện:** \`${inlineCode(item.codeLine || ctx.getItemCodeLine?.(item) || item.tag || '')}\``,
      item.viewport ? `- **Viewport:** \`${inlineCode(item.viewport)}\`${item.scrollY !== undefined ? ` · scroll Y \`${Math.round(item.scrollY)}px\`` : ''}` : '',
    ].filter(Boolean);
  }

  function renderItemMarkdown(item, index) {
    const typeLabel = item.type === 'edit' ? 'Sửa nội dung' : item.type === 'css' ? 'Điều chỉnh CSS' : item.type === 'image' ? 'Thay hình ảnh' : 'Ghi chú yêu cầu';
    const lines = [`### ${index + 1}. ${typeLabel}: ${escapeMarkdown(item.tag || 'Element')}`, ''];
    lines.push(...renderLocation(item), '');

    if (item.type === 'edit') {
      lines.push('#### Nội dung cần cập nhật', '');
      lines.push('| Hiện tại | Mong muốn |', '|---|---|');
      lines.push(`| ${tableValue(item.oldValue || item.targetText)} | ${tableValue(item.value)} |`, '');
    } else if (item.type === 'css') {
      const changes = cssChanges(item);
      lines.push('#### CSS cần cập nhật', '');
      if (changes.length) {
        lines.push('| Thuộc tính | Hiện tại | Mong muốn |', '|---|---|---|');
        changes.forEach((change) => lines.push(`| \`${codeTableValue(change.property)}\` | \`${codeTableValue(change.before)}\` | \`${codeTableValue(change.after)}\` |`));
        lines.push('', '```css', `${item.selector || '/* selector chưa xác định */'} {`);
        changes.forEach((change) => {
          lines.push(change.after ? `  ${change.property}: ${change.after};` : `  /* Xóa ${change.property} */`);
        });
        lines.push('}', '```', '');
      } else {
        lines.push(`- **CSS mong muốn:** \`${inlineCode(item.value || 'Không có thay đổi')}\``, '');
      }
    } else if (item.type === 'image') {
      const position = item.newImageState?.objectPosition || item.newImageState?.backgroundPosition || '';
      const transform = item.newImageState?.transform || '';
      lines.push('#### Hình ảnh cần cập nhật', '');
      lines.push(`- **Ảnh hiện tại:** ${proseValue(item.targetText || 'Không có')}`);
      lines.push(`- **Ảnh mong muốn:** ${proseValue(exportImageValue(item))}`);
      if (position) lines.push(`- **Vị trí ảnh:** \`${inlineCode(position)}\``);
      if (transform) lines.push(`- **Transform/zoom:** \`${inlineCode(transform)}\``);
      lines.push('');
    } else {
      lines.push('#### Ý định thay đổi', '');
      lines.push(proseValue(item.comment || 'Chưa nhập yêu cầu.'), '');
    }

    lines.push(`- **Nhóm:** ${categoryLabel(item.category, item.type)}`);
    lines.push(`- **Thời điểm ghi nhận:** ${item.updatedAt ? formatDate(new Date(item.updatedAt)) : 'N/A'}`);
    lines.push('');
    return lines;
  }

  function buildMarkdown({ href = globalThis.location?.href || '', now = new Date() } = {}) {
    const counts = state.comments.reduce((result, item) => {
      result[item.type || 'comment'] = (result[item.type || 'comment'] || 0) + 1;
      return result;
    }, {});
    const lines = [
      '# Yêu cầu cập nhật UI/UX', '',
      '> Đây là tài liệu yêu cầu chỉnh sửa được tạo từ UI Feedback Tool. Hãy thực hiện đúng các thay đổi bên dưới và giữ nguyên những phần không được đề cập.', '',
      '## Nguyên tắc thực hiện', '',
      '1. Xác định phần tử bằng trang, selector và dòng code nhận diện.',
      '2. Ưu tiên giá trị trong cột **Mong muốn**; cột **Hiện tại** chỉ dùng để đối chiếu.',
      '3. Giữ responsive, accessibility và hành vi hiện có nếu yêu cầu không nói khác.',
      '4. Không tự thay đổi nội dung, màu sắc, khoảng cách hoặc hình ảnh ngoài phạm vi tài liệu.', '',
      '## Thông tin phiên review', '',
      `- **URL xuất file:** ${href || 'Không xác định'}`,
      `- **Ngày xuất:** ${formatDate(now)}`,
      `- **Tổng số thay đổi:** ${state.comments.length}`,
      `- **Thành phần:** ${counts.comment || 0} ghi chú · ${counts.edit || 0} sửa nội dung · ${counts.css || 0} CSS · ${counts.image || 0} hình ảnh`, '',
      '## Danh sách thay đổi', '',
    ];

    const grouped = state.comments.reduce((groups, item) => {
      const key = item.page || '/';
      (groups[key] ||= []).push(item);
      return groups;
    }, {});
    Object.entries(grouped).forEach(([page, items]) => {
      lines.push(`## Trang: ${escapeMarkdown(page)}`, '');
      items.forEach((item, index) => lines.push(...renderItemMarkdown(item, index)));
    });
    return lines.join('\n').replace(/\n\n\n+/g, '\n\n').trimEnd() + '\n';
  }

  function exportMarkdown() {
    if (!state.comments.length) {
      ctx.showToast('Chưa có thay đổi để xuất');
      return;
    }
    const markdown = buildMarkdown();
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `ui-changes-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.md`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    ctx.showToast(`Đã xuất ${state.comments.length} thay đổi; danh sách vẫn được giữ lại`);
  }

  return { exportMarkdown, buildMarkdown, renderItemMarkdown, cssChanges };
}
