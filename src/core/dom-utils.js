import { categoryLabel, defaultCategoryForType } from './config.js';

export function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
}

export function escapeMarkdown(value) {
  return String(value || '').replace(/[\\`*_{}\[\]()#+.!|>-]/g, '\\$&');
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export function relativeTime(isoString) {
  if (!isoString) return '';
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return `${Math.floor(hours / 24)} ngày trước`;
}

export function safeText(value, max = 180) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

export function isEditable(target) {
  return typeof HTMLElement !== 'undefined' && target instanceof HTMLElement && (
    target.matches('input, textarea, select, [contenteditable="true"]')
    || Boolean(target.closest('input, textarea, select, [contenteditable="true"]'))
  );
}

export function cssPath(element) {
  if (typeof Element === 'undefined' || !(element instanceof Element)) return '';
  const parts = [];
  let node = element;
  while (node && node.nodeType === 1 && node !== document.body && parts.length < 6) {
    let part = node.tagName.toLowerCase();
    if (node.id) {
      part += `#${window.CSS.escape(node.id)}`;
      parts.unshift(part);
      break;
    }
    const classes = [...node.classList].filter(Boolean).slice(0, 2);
    if (classes.length) part += `.${classes.map(window.CSS.escape).join('.')}`;
    const siblings = node.parentElement
      ? [...node.parentElement.children].filter((sibling) => sibling.tagName === node.tagName)
      : [];
    if (siblings.length > 1) part += `:nth-of-type(${siblings.indexOf(node) + 1})`;
    parts.unshift(part);
    node = node.parentElement;
  }
  return parts.join(' > ');
}

export function targetLabel(element) {
  if (typeof Element === 'undefined' || !(element instanceof Element)) return 'Element chưa xác định';
  const tag = element.tagName.toLowerCase();
  const id = element.id ? `#${element.id}` : '';
  const classes = [...element.classList].filter(Boolean).slice(0, 2).map((name) => `.${name}`).join('');
  return `${tag}${id}${classes}`;
}

export function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
  })[character]);
}

export function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, '&#096;');
}

export function firstCodeLine(element) {
  if (typeof Element === 'undefined' || !(element instanceof Element)) return '';
  const markup = String(element.outerHTML || '').trim();
  return safeText(markup.split(/\r?\n/)[0] || markup, 180);
}

export function detectTheme(preference) {
  if (preference === 'dark') return 'dark';
  if (preference === 'light') return 'light';
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function resolveSelector(selector) {
  if (!selector) return null;
  try { return document.querySelector(selector); } catch { return null; }
}

export function getItemCategory(item) {
  return categoryLabel(item.category, item.type || 'comment');
}

export { categoryLabel, defaultCategoryForType };
