export function createImageEditor() {
  function imageBackgroundSource(value) {
    const match = String(value || '').trim().match(/url\((?:"|')?(.*?)(?:"|')?\)/i);
    return match ? match[1] : '';
  }

  function parseImagePosition(value) {
    const parts = String(value || '').trim().toLowerCase().split(/\s+/).filter(Boolean);
    const convert = (part, fallback, axis) => {
      if (!part) return fallback;
      if ((axis === 'x' && part === 'left') || (axis === 'y' && part === 'top')) return 0;
      if (part === 'center') return 50;
      if ((axis === 'x' && part === 'right') || (axis === 'y' && part === 'bottom')) return 100;
      const numeric = parseFloat(part);
      return Number.isFinite(numeric) ? Math.max(0, Math.min(100, numeric)) : fallback;
    };
    const horizontal = parts.find((part) => ['left', 'right'].includes(part));
    const vertical = parts.find((part) => ['top', 'bottom'].includes(part));
    if (horizontal || vertical) {
      return { x: convert(horizontal || 'center', 50, 'x'), y: convert(vertical || 'center', 50, 'y') };
    }
    return { x: convert(parts[0], 50, 'x'), y: convert(parts[1], 50, 'y') };
  }

  function isImageElement(element) {
    return element instanceof Element && (element instanceof HTMLImageElement || element.tagName.toLowerCase() === 'img');
  }

  function clampZoom(value) {
    return Math.max(30, Math.min(300, Number(value) || 100));
  }

  function parseImageZoom(value) {
    const match = String(value || '').match(/scale\(\s*([0-9.]+)\s*\)/i);
    return match ? clampZoom(Number(match[1]) * 100) : 100;
  }

  function captureImageState(element) {
    if (!(element instanceof Element)) return { kind: 'background', src: '', srcset: '', backgroundImage: '', backgroundPosition: '', backgroundSize: '' };
    if (isImageElement(element)) {
      let computed = {};
      try { computed = getComputedStyle(element); } catch { /* inaccessible style */ }
      return { kind: 'src', src: element.getAttribute('src') || '', effectiveSrc: element.currentSrc || '', srcset: element.getAttribute('srcset') || '', backgroundImage: '', objectPosition: element.style.objectPosition || '', objectFit: element.style.objectFit || '', transform: element.style.transform || '', effectiveObjectPosition: computed.objectPosition || '50% 50%', effectiveTransform: computed.transform || 'none' };
    }
    const backgroundImage = element.style.backgroundImage || (() => { try { return getComputedStyle(element).backgroundImage || ''; } catch { return ''; } })();
    let computed = {};
    try { computed = getComputedStyle(element); } catch { /* inaccessible style */ }
    return { kind: 'background', src: imageBackgroundSource(backgroundImage), srcset: '', backgroundImage: element.style.backgroundImage || '', backgroundPosition: element.style.backgroundPosition || '', backgroundSize: element.style.backgroundSize || '', effectiveBackgroundPosition: computed.backgroundPosition || '50% 50%' };
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
    const x = Math.max(0, Math.min(100, Number(position.x) || 0));
    const y = Math.max(0, Math.min(100, Number(position.y) || 0));
    if (isImageElement(element)) {
      element.style.objectFit = 'cover';
      element.style.objectPosition = `${x}% ${y}%`;
    } else element.style.backgroundPosition = `${x}% ${y}%`;
  }

  function applyImageZoom(element, zoom = 100, baseTransform = '') {
    if (!(element instanceof Element)) return;
    const safeZoom = clampZoom(zoom);
    if (isImageElement(element)) {
      const base = String(baseTransform || '').trim();
      const withoutScale = base.replace(/\bscale(?:3d|x|y)?\([^)]*\)/gi, '').replace(/\s+/g, ' ').trim();
      const preserved = withoutScale && withoutScale !== 'none' ? `${withoutScale} ` : '';
      element.style.transform = `${preserved}scale(${safeZoom / 100})`;
    } else {
      element.style.backgroundSize = safeZoom === 100 ? 'cover' : `${safeZoom}%`;
    }
  }

  function applyImageState(element, snapshot) {
    if (!(element instanceof Element) || !snapshot) return;
    if (snapshot.kind === 'src') {
      if (snapshot.src) element.setAttribute('src', snapshot.src); else element.removeAttribute('src');
      if (snapshot.srcset) element.setAttribute('srcset', snapshot.srcset); else element.removeAttribute('srcset');
      if (snapshot.objectPosition) element.style.objectPosition = snapshot.objectPosition; else if (snapshot.effectiveObjectPosition) element.style.objectPosition = snapshot.effectiveObjectPosition;
      if (snapshot.objectFit) element.style.objectFit = snapshot.objectFit;
      if (snapshot.transform) element.style.transform = snapshot.transform; else element.style.removeProperty('transform');
    } else {
      element.style.backgroundImage = snapshot.backgroundImage || (snapshot.src ? `url("${snapshot.src.replace(/"/g, '\\"')}")` : '');
      if (snapshot.backgroundPosition) element.style.backgroundPosition = snapshot.backgroundPosition; else if (snapshot.effectiveBackgroundPosition) element.style.backgroundPosition = snapshot.effectiveBackgroundPosition;
      if (snapshot.backgroundSize) element.style.backgroundSize = snapshot.backgroundSize;
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

  return { parseImagePosition, parseImageZoom, captureImageState, applyImageSource, applyImagePosition, applyImageZoom, applyImageState, restoreImageState, validateImageSource };
}
