export const TOOL_VERSION = '0.13.0';

export const DEFAULTS = {
  version: TOOL_VERSION,
  shortcut: ['q', 'w', 'e'],
  storageKey: 'ui-feedback-session',
  accent: '#ffffff',
  position: 'right',
  theme: 'auto',
  githubRepo: '',
  persistActive: true,
  coachmark: true,
};

export function mergeConfig(options = {}) {
  const shortcutInput = Array.isArray(options.shortcut) ? options.shortcut : DEFAULTS.shortcut;
  const shortcut = [...new Set(shortcutInput
    .map((key) => String(key || '').trim().toLowerCase())
    .filter(Boolean))];
  return {
    ...DEFAULTS,
    ...options,
    shortcut: shortcut.length >= 2 ? shortcut : [...DEFAULTS.shortcut],
  };
}

export const FEEDBACK_CATEGORIES = [
  { value: 'layout', label: 'Bố cục' },
  { value: 'image', label: 'Hình ảnh' },
  { value: 'content', label: 'Nội dung' },
  { value: 'typography', label: 'Kiểu chữ' },
  { value: 'color', label: 'Màu sắc' },
  { value: 'spacing', label: 'Khoảng cách' },
  { value: 'interaction', label: 'Tương tác' },
  { value: 'other', label: 'Khác' },
];

export const CATEGORY_LABELS = Object.fromEntries(
  FEEDBACK_CATEGORIES.map((item) => [item.value, item.label]),
);

export const CSS_COLOR_FIELDS = [
  { key: 'background', label: 'Màu nền phần tử', prop: 'backgroundColor', fallback: '#ffffff', hint: 'background-color' },
  { key: 'text', label: 'Màu chữ phần tử', prop: 'color', fallback: '#1b212b', hint: 'color' },
];

export const EXTRA_COLOR_FIELDS = [
  { key: 'border', label: 'Viền', prop: 'borderColor', fallback: '#d1d5db', hint: 'border-color' },
  { key: 'outline', label: 'Outline', prop: 'outlineColor', fallback: '#f5a623', hint: 'outline-color' },
  { key: 'decoration', label: 'Gạch chân', prop: 'textDecorationColor', fallback: '#f5a623', hint: 'text-decoration-color' },
  { key: 'caret', label: 'Caret', prop: 'caretColor', fallback: '#f5a623', hint: 'caret-color' },
  { key: 'accent', label: 'Accent', prop: 'accentColor', fallback: '#f5a623', hint: 'accent-color' },
  { key: 'columnRule', label: 'Column rule', prop: 'columnRuleColor', fallback: '#d1d5db', hint: 'column-rule-color' },
  { key: 'fill', label: 'SVG fill', prop: 'fill', fallback: '#f5a623', hint: 'fill' },
];

export const FONT_OPTIONS = [
  { value: '', label: 'Mặc định website' },
  { value: 'Inter', label: 'Inter' },
  { value: 'DM Sans', label: 'DM Sans' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Lora', label: 'Lora' },
];

export const FONT_WEIGHT_OPTIONS = [
  { value: '400', label: '400 · Regular' },
  { value: '500', label: '500 · Medium' },
  { value: '600', label: '600 · Semibold' },
  { value: '700', label: '700 · Bold' },
  { value: '800', label: '800 · Extra bold' },
];

export const TEXT_ALIGN_OPTIONS = [
  { value: 'left', label: 'Trái', icon: '⇤' },
  { value: 'center', label: 'Giữa', icon: '≡' },
  { value: 'right', label: 'Phải', icon: '⇥' },
  { value: 'justify', label: 'Đều', icon: '☰' },
];

export const CSS_SPACING_SIDES = [
  { key: 'top', label: 'Trên', prop: 'Top' },
  { key: 'right', label: 'Phải', prop: 'Right' },
  { key: 'bottom', label: 'Dưới', prop: 'Bottom' },
  { key: 'left', label: 'Trái', prop: 'Left' },
];

export function defaultCategoryForType(type) {
  if (type === 'image') return 'image';
  if (type === 'edit') return 'content';
  if (type === 'css') return 'color';
  return 'other';
}

export function categoryLabel(value, type = 'comment') {
  return CATEGORY_LABELS[value] || CATEGORY_LABELS[defaultCategoryForType(type)] || 'Khác';
}
