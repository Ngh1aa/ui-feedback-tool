import { categoryLabel } from '../core/config.js';
import { copyText, escapeMarkdown } from '../core/dom-utils.js';

export function createGithubIssueController(ctx) {
  const { state, config } = ctx;

  function issueImageValue(item) {
    if (item.imageSourceType === 'upload' || String(item.value || '').startsWith('data:image/')) {
      return '[Ảnh upload local — xem trong phiên UI Feedback hoặc đính kèm thủ công]';
    }
    return item.value || '';
  }

  function createGithubIssue() {
    if (!/^[\w.-]+\/[\w.-]+$/.test(config.githubRepo || '')) {
      ctx.showToast('Cấu hình githubRepo chưa hợp lệ');
      return;
    }
    const unresolved = state.comments.filter((item) => !item.resolved);
    if (!unresolved.length) {
      ctx.showToast('Không có feedback nào đang mở!');
      return;
    }
    const lines = [
      '# UI Feedback Review',
      `\n**URL:** ${location.href}`,
      `**Context:** \`${window.innerWidth}x${window.innerHeight}\` · \`${state.theme}\``,
      '',
    ];
    unresolved.forEach((item, index) => {
      const typeLabel = item.type === 'edit' ? '✏️ Edit' : item.type === 'css' ? '✦ Bộ giao diện' : item.type === 'image' ? '▧ Image' : '💬 Feedback';
      lines.push(`### ${index + 1}. ${escapeMarkdown(item.tag)} _(${typeLabel})_`);
      if (item.type === 'edit') {
        lines.push(`- **Current text:** ${escapeMarkdown(item.targetText || '')}`);
        lines.push(`- **New text:** ${escapeMarkdown(item.value || '')}`);
      } else if (item.type === 'css') {
        lines.push(`- **Old CSS:** \`${escapeMarkdown(item.targetText || '')}\``);
        lines.push(`- **New CSS:** \`${escapeMarkdown(item.value || '')}\``);
      } else if (item.type === 'image') {
        const imageState = item.newImageState || {};
        const position = imageState.position || (() => {
          const match = String(imageState.objectPosition || imageState.backgroundPosition || '').match(/(-?[0-9.]+)%\s+(-?[0-9.]+)%/);
          return match ? { x: Number(match[1]), y: Number(match[2]) } : null;
        })();
        lines.push(`- **Old image:** ${escapeMarkdown(item.targetText || 'N/A')}`);
        lines.push(`- **New image:** ${escapeMarkdown(issueImageValue(item))}`);
        lines.push(`- **Source:** ${item.imageSourceType === 'upload' ? 'Local upload' : 'Website URL'}`);
        if (position) lines.push(`- **Crop position:** ${Math.round(Number(position.x))}% ${Math.round(Number(position.y))}%`);
        if (Number.isFinite(Number(imageState.zoom))) lines.push(`- **Crop zoom:** ${Math.round(Number(imageState.zoom))}%`);
      } else {
        lines.push(`- **Priority:** ${item.priority || 'medium'}`);
        lines.push(`- **Feedback:** ${escapeMarkdown(item.comment || '')}`);
      }
      lines.push(`- **Category:** ${categoryLabel(item.category, item.type)}`);
      lines.push(`- **Page:** \`${escapeMarkdown(item.page || '/')}\``);
      lines.push(`- **Selector:** \`${escapeMarkdown(item.selector || '')}\``);
      lines.push(`- **Component code:** \`${escapeMarkdown(item.codeLine || ctx.getItemCodeLine(item) || item.tag || 'N/A')}\``);
      lines.push(`- **Element:** \`${item.targetText ? escapeMarkdown(item.targetText.substring(0, 60)) : 'N/A'}\``, '');
    });
    const markdown = lines.join('\n');
    const issueUrl = `https://github.com/${config.githubRepo}/issues/new?title=UI+Feedback+Review&body=${encodeURIComponent(markdown)}`;
    if (issueUrl.length > 7500) {
      window.open(`https://github.com/${config.githubRepo}/issues/new?title=UI+Feedback+Review`, '_blank', 'noopener,noreferrer');
      copyText(markdown).then((copied) => ctx.showToast(copied ? 'Nội dung dài đã được copy để dán vào Issue' : 'Issue đã mở; nội dung quá dài để điền tự động'));
      return;
    }
    window.open(issueUrl, '_blank', 'noopener,noreferrer');
    ctx.showToast('Đang mở trang tạo Issue');
  }

  return { createGithubIssue };
}
