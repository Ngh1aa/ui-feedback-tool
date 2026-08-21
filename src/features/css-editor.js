export function createCssEditor(ctx) {
  const { state, root } = ctx;

  function ensureGoogleFont(fontName) {
    if (!fontName || fontName === 'inherit') return;
    const id = `ui-feedback-font-${fontName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName).replace(/%20/g, '+')}:wght@400;500;600;700&display=swap`;
    document.head.appendChild(link);
  }

  function normalizeColor(value, fallback = '#ffffff') {
    const raw = String(value || '').trim();
    if (/^#[0-9a-f]{6}$/i.test(raw)) return raw.toLowerCase();
    if (/^#[0-9a-f]{3}$/i.test(raw)) return raw.toLowerCase().replace(/^#(.)(.)(.)$/, '#$1$1$2$2$3$3');
    const match = raw.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (match) return `#${[match[1], match[2], match[3]].map((n) => Math.max(0, Math.min(255, Number(n))).toString(16).padStart(2, '0')).join('')}`;
    return fallback;
  }

  function readCssValue(prop, fallback = '') {
    if (!state.target) return fallback;
    if (state.target.style?.[prop]) return state.target.style[prop];
    try { return getComputedStyle(state.target)[prop] || fallback; } catch { return fallback; }
  }

  function applyCssProperty(prop, value) {
    if (state.target && prop) state.target.style[prop] = value;
  }

  function parseTranslatePosition(value) {
    const raw = String(value || '').trim();
    const translate = raw.match(/translate\(\s*(-?\d+(?:\.\d+)?)px(?:\s*,\s*|\s+)(-?\d+(?:\.\d+)?)px\s*\)/i);
    if (translate) return { x: Number(translate[1]), y: Number(translate[2]) };
    const pair = raw.match(/^\s*(-?\d+(?:\.\d+)?)px[\s,]+(-?\d+(?:\.\d+)?)px\s*$/i);
    if (pair) return { x: Number(pair[1]), y: Number(pair[2]) };
    const matrix = raw.match(/matrix(?:3d)?\(([^)]+)\)/i);
    if (matrix) {
      const values = matrix[1].split(',').map(Number);
      if (values.length === 6) return { x: values[4] || 0, y: values[5] || 0 };
      if (values.length === 16) return { x: values[12] || 0, y: values[13] || 0 };
    }
    return { x: 0, y: 0 };
  }

  function applyCssPosition(position = state.cssPosition) {
    if (!state.target) return;
    const x = Math.max(-200, Math.min(200, Number(position.x) || 0));
    const y = Math.max(-200, Math.min(200, Number(position.y) || 0));
    state.cssPosition = { x, y };
    const supportsTranslate = 'translate' in state.target.style || (typeof CSS !== 'undefined' && CSS.supports?.('translate', '0 0'));
    if (supportsTranslate) state.target.style.setProperty('translate', `${x}px ${y}px`);
    else state.target.style.transform = `translate(${x}px, ${y}px)${state.cssTransformBase ? ` ${state.cssTransformBase}` : ''}`;
    const pad = root.querySelector('[data-css-position-pad]');
    if (pad) { pad.style.setProperty('--pad-x', `${x * 0.3}px`); pad.style.setProperty('--pad-y', `${y * 0.3}px`); }
    root.querySelectorAll('[data-css-x], [data-css-x-number]').forEach((input) => { input.value = String(Math.round(x)); });
    root.querySelectorAll('[data-css-y], [data-css-y-number]').forEach((input) => { input.value = String(Math.round(y)); });
    root.querySelector('[data-css-x-output]')?.replaceChildren(`${Math.round(x)}px`);
    root.querySelector('[data-css-y-output]')?.replaceChildren(`${Math.round(y)}px`);
  }

  function updatePositionFromPointer(clientX, clientY) {
    const pad = root.querySelector('[data-css-position-pad]');
    if (!pad) return;
    const rect = pad.getBoundingClientRect();
    applyCssPosition({ x: ((clientX - rect.left) / rect.width - 0.5) * 400, y: ((clientY - rect.top) / rect.height - 0.5) * 400 });
  }

  return { ensureGoogleFont, normalizeColor, readCssValue, applyCssProperty, parseTranslatePosition, applyCssPosition, updatePositionFromPointer };
}
