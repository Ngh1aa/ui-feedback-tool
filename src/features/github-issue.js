import { categoryLabel } from '../core/config.js';
import { escapeMarkdown } from '../core/dom-utils.js';

export function createGithubIssueController(ctx) {
  const { state, config } = ctx;

  function createGithubIssue() {
    if (!config.githubRepo) return;
    const unresolved = state.comments.filter((item) => !item.resolved);
    if (!unresolved.length) {
      ctx.showToast('Không có feedback nào đang mở!');
      return;
    }
    const lines = [
      '# UI Feedback Review',
      `\n**Context:** \`${window.innerWidth}x${window.innerHeight}\` · \`${state.theme}\``,
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
        lines.push(`- **Old image:** ${escapeMarkdown(item.targetText || 'N/A')}`);
        lines.push(`- **New image:** ${escapeMarkdown(item.value || '')}`);
        lines.push(`- **Source:** ${item.imageSourceType === 'upload' ? 'Local upload' : 'Website URL'}`);
      } else {
        lines.push(`- **Priority:** ${item.priority || 'medium'}`);
        lines.push(`- **Feedback:** ${escapeMarkdown(item.comment || '')}`);
      }
      lines.push(`- **Category:** ${categoryLabel(item.category, item.type)}`);
      lines.push(`- **Component code:** \`${escapeMarkdown(item.codeLine || ctx.getItemCodeLine(item) || item.tag || 'N/A')}\``);
      lines.push(`- **Element:** \`${item.targetText ? escapeMarkdown(item.targetText.substring(0, 60)) : 'N/A'}\``, '');
    });
    const body = encodeURIComponent(lines.join('\n'));
    window.open(`https://github.com/${config.githubRepo}/issues/new?title=UI+Feedback+Review&body=${body}`, '_blank');
    ctx.showToast('Đang mở trang tạo Issue');
  }

  return { createGithubIssue };
}
