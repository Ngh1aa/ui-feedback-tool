export function createImageEditor() {
  function imageBackgroundSource(value) {
    const match = String(value || '').trim().match(/url\((?:"|')?(.*?)(?:"|')?\)/i);
    return match ? match[1] : '';
  }

  function clampPercent(value, fallback = 50) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.max(0, Math.min(100, number)) : fallback;
  }

  function normalizePosition(position = { x: 50, y: 50 }) {
    return { x: clampPercent(position.x, 50), y: clampPercent(position.y, 50) };
  }

  function parseImagePosition(value) {
    const parts = String(value || '').trim().toLowerCase().split(/\s+/).filter(Boolean);
    const convert = (part, fallback, axis) => {
      if (!part) return fallback;
      if ((axis === 'x' && part === 'left') || (axis === 'y' && part === 'top')) return 0;
      if (part === 'center') return 50;
      if ((axis === 'x' && part === 'right') || (axis === 'y' && part === 'bottom')) return 100;
      return clampPercent(parseFloat(part), fallback);
    };
    const horizontal = parts.find((part) => ['left', 'right'].includes(part));
    const vertical = parts.find((part) => ['top', 'bottom'].includes(part));
    if (horizontal || vertical) return normalizePosition({ x: convert(horizontal || 'center', 50, 'x'), y: convert(vertical || 'center', 50, 'y') });
    return normalizePosition({ x: convert(parts[0], 50, 'x'), y: convert(parts[1], 50, 'y') });
  }

  function isImageElement(element) {
    return element instanceof Element && (element instanceof HTMLImageElement || element.tagName.toLowerCase() === 'img');
  }

  function clampZoom(value) {
    return Math.max(30, Math.min(300, Number(value) || 100));
  }

  function parseImageZoom(value) {
    const match = String(value || '').match(/scale(?:3d)?\(\s*([0-9.]+)/i);
    return match ? clampZoom(Number(match[1]) * 100) : 100;
  }

  function parseBackgroundZoom(value) {
    const match = String(value || '').trim().match(/([0-9.]+)%/);
    return match ? clampZoom(Number(match[1])) : 100;
  }

  function captureImageState(element) {
    if (!(element instanceof Element)) return { kind: 'background', src: '', srcset: '', backgroundImage: '', backgroundPosition: '', backgroundSize: '', position: { x: 50, y: 50 }, zoom: 100 };
    let computed = {};
    try { computed = getComputedStyle(element); } catch { /* inaccessible style */ }
    if (isImageElement(element)) {
      const objectPosition = element.style.objectPosition || computed.objectPosition || '50% 50%';
      const transform = element.style.transform || '';
      const effectiveTransform = computed.transform || 'none';
      return {
        kind: 'src',
        src: element.getAttribute('src') || '',
        effectiveSrc: element.currentSrc || '',
        srcset: element.getAttribute('srcset') || '',
        backgroundImage: '',
        objectPosition,
        objectFit: element.style.objectFit || computed.objectFit || '',
        transform,
        effectiveObjectPosition: computed.objectPosition || objectPosition,
        effectiveTransform,
        position: parseImagePosition(objectPosition),
        zoom: transform ? parseImageZoom(transform) : parseImageZoom(effectiveTransform),
      };
    }
    const backgroundImage = element.style.backgroundImage || computed.backgroundImage || '';
    const backgroundPosition = element.style.backgroundPosition || computed.backgroundPosition || '50% 50%';
    const backgroundSize = element.style.backgroundSize || computed.backgroundSize || 'cover';
    return {
      kind: 'background',
      src: imageBackgroundSource(backgroundImage),
      srcset: '',
      backgroundImage: element.style.backgroundImage || '',
      backgroundPosition,
      backgroundSize,
      effectiveBackgroundPosition: computed.backgroundPosition || backgroundPosition,
      effectiveBackgroundSize: computed.backgroundSize || backgroundSize,
      position: parseImagePosition(backgroundPosition),
      zoom: parseBackgroundZoom(backgroundSize),
    };
  }

  function applyImageSource(element, source) {
    if (!(element instanceof Element)) return;
    const safeSource = String(source || '').trim();
    if (isImageElement(element)) {
      element.setAttribute('src', safeSource);
      if (element.hasAttribute('srcset')) element.removeAttribute('srcset');
    } else {
      element.style.backgroundImage = safeSource ? `url("${safeSource.replace(/"/g, '\\"')}")` : '';
    }
  }

  function applyImagePosition(element, position = { x: 50, y: 50 }) {
    if (!(element instanceof Element)) return;
    const normalized = normalizePosition(position);
    const value = `${normalized.x}% ${normalized.y}%`;
    if (isImageElement(element)) {
      element.style.objectFit = 'cover';
      element.style.objectPosition = value;
    } else {
      element.style.backgroundPosition = value;
    }
  }

  function applyImageZoom(element, zoom = 100, baseTransform = '') {
    if (!(element instanceof Element)) return;
    const safeZoom = clampZoom(zoom);
    if (isImageElement(element)) {
      const base = String(baseTransform || '').trim();
      const withoutScale = base.replace(/\bscale(?:3d|x|y)?\([^)]*\)/gi, '').replace(/\s+/g, ' ').trim();
      const preserved = withoutScale && withoutScale !== 'none' ? `${withoutScale} ` : '';
      element.style.transformOrigin = '50% 50%';
      element.style.transform = `${preserved}scale(${safeZoom / 100})`;
      element.style.willChange = 'transform';
    } else {
      element.style.backgroundSize = safeZoom === 100 ? 'cover' : `${safeZoom}% auto`;
    }
  }

  function applyImageState(element, snapshot) {
    if (!(element instanceof Element) || !snapshot) return;
    if (snapshot.kind === 'src') {
      if (snapshot.src) element.setAttribute('src', snapshot.src); else element.removeAttribute('src');
      if (snapshot.srcset) element.setAttribute('srcset', snapshot.srcset); else element.removeAttribute('srcset');
      const position = snapshot.objectPosition || (snapshot.position ? `${clampPercent(snapshot.position.x)}% ${clampPercent(snapshot.position.y)}%` : snapshot.effectiveObjectPosition);
      if (position) element.style.objectPosition = position;
      if (snapshot.objectFit) element.style.objectFit = snapshot.objectFit;
      if (snapshot.transform) element.style.transform = snapshot.transform;
      else if (snapshot.zoom !== undefined && Number(snapshot.zoom) !== 100) applyImageZoom(element, snapshot.zoom);
      else element.style.removeProperty('transform');
    } else {
      element.style.backgroundImage = snapshot.backgroundImage || (snapshot.src ? `url("${snapshot.src.replace(/"/g, '\\"')}")` : '');
      const position = snapshot.backgroundPosition || (snapshot.position ? `${clampPercent(snapshot.position.x)}% ${clampPercent(snapshot.position.y)}%` : snapshot.effectiveBackgroundPosition);
      if (position) element.style.backgroundPosition = position;
      if (snapshot.backgroundSize) element.style.backgroundSize = snapshot.backgroundSize;
      else if (snapshot.zoom !== undefined && Number(snapshot.zoom) !== 100) applyImageZoom(element, snapshot.zoom);
    }
  }

  function restoreImageState(element, snapshot) {
    if (!(element instanceof Element) || !snapshot) return;
    if (snapshot.kind === 'src') {
      if (snapshot.src) element.setAttribute('src', snapshot.src); else element.removeAttribute('src');
      if (snapshot.srcset) element.setAttribute('srcset', snapshot.srcset); else element.removeAttribute('srcset');
      if (snapshot.objectPosition) element.style.objectPosition = snapshot.objectPosition; else element.style.removeProperty('object-position');
      if (snapshot.objectFit) element.style.objectFit = snapshot.objectFit; else element.style.removeProperty('object-fit');
      if (snapshot.transform) element.style.transform = snapshot.transform; else element.style.removeProperty('transform');
      element.style.removeProperty('transform-origin');
      element.style.removeProperty('will-change');
    } else {
      element.style.backgroundImage = snapshot.backgroundImage || '';
      if (snapshot.backgroundPosition) element.style.backgroundPosition = snapshot.backgroundPosition; else element.style.removeProperty('background-position');
      if (snapshot.backgroundSize) element.style.backgroundSize = snapshot.backgroundSize; else element.style.removeProperty('background-size');
    }
  }

  function validateImageSource(source) {
    const value = String(source || '').trim();
    if (!value) return false;
    if (value.startsWith('data:image/')) {
      try {
        const payload = value.split(',', 2)[1] || '';
        const bytes = /;base64,/i.test(value)
          ? Math.floor((payload.length * 3) / 4) - (payload.endsWith('==') ? 2 : payload.endsWith('=') ? 1 : 0)
          : new TextEncoder().encode(decodeURIComponent(payload)).length;
        return bytes <= 1024 * 1024;
      } catch { return false; }
    }
    try { return ['http:', 'https:'].includes(new URL(value, location.href).protocol); } catch { return false; }
  }

  return { parseImagePosition, parseImageZoom, captureImageState, applyImageSource, applyImagePosition, applyImageZoom, applyImageState, restoreImageState, validateImageSource, normalizePosition, clampZoom };
}
