export const TOOL_VERSION = '0.8.0';

export const DEFAULTS = {
  version: TOOL_VERSION,
  updateUrl: 'https://ngh1aa.github.io/Atelier/ui-feedback.js',
  updateMirrors: [
    'https://ngh1aa.github.io/Atelier/ui-feedback.js',
    'https://ngh1aa.github.io/LuxRoom/ui-feedback.js',
    'https://ngh1aa.github.io/StudioOS/ui-feedback.js',
    'https://raw.githubusercontent.com/Ngh1aa/ui-feedback-tool/main/src/ui-feedback.js',
  ],
  shortcut: ['q', 'w', 'e'],
  storageKey: 'ui-feedback-session',
  accent: '#ffffff',
  position: 'right',
  theme: 'auto',
  githubRepo: 'Ngh1aa/StudioOS',
  persistActive: true,
  coachmark: true,
};

export function mergeConfig(options = {}) {
  return {
    ...DEFAULTS,
    ...options,
    shortcut: (options.shortcut || DEFAULTS.shortcut).map((key) => String(key).toLowerCase()),
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
  { key: 'primary', label: 'Màu chính', prop: 'backgroundColor', fallback: '#cb0236', hint: 'background-color' },
  { key: 'primaryText', label: 'Chữ trên màu chính', prop: 'color', fallback: '#ffffff', hint: 'color' },
  { key: 'pageBackground', label: 'Nền trang', prop: 'backgroundColor', fallback: '#f4f8f8', hint: 'background-color' },
  { key: 'text', label: 'Màu chữ', prop: 'color', fallback: '#1b212b', hint: 'color' },
];

export const EXTRA_COLOR_FIELDS = [
  { key: 'border', label: 'Viền', prop: 'borderColor', fallback: '#d1d5db', hint: 'border-color' },
  { key: 'outline', label: 'Outline', prop: 'outlineColor', fallback: '#f5a623', hint: 'outline-color' },
  { key: 'decoration', label: 'Gạch chân', prop: 'textDecorationColor', fallback: '#f5a623', hint: 'text-decoration-color' },
  { key: 'caret', label: 'Caret', prop: 'caretColor', fallback: '#f5a623', hint: 'caret-color' },
  { key: 'accent', label: 'Accent', prop: 'accentColor', fallback: '#f5a623', hint: 'accent-color' },
  { key: 'columnRule', label: 'Column rule', prop: 'columnRuleColor', fallback: '#d1d5db', hint: 'column-rule-color' },
  { key: 'marker', label: 'Marker', prop: 'markerColor', fallback: '#f5a623', hint: 'marker-color' },
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

export function defaultCategoryForType(type) {
  if (type === 'image') return 'image';
  if (type === 'edit') return 'content';
  if (type === 'css') return 'color';
  return 'other';
}

export function categoryLabel(value, type = 'comment') {
  return CATEGORY_LABELS[value] || CATEGORY_LABELS[defaultCategoryForType(type)] || 'Khác';
}
