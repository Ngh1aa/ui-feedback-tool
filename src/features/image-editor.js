export function createImageEditor() {
  function imageBackgroundSource(value) {
    const match = String(value || '').trim().match(/url\((?:"|')?(.*?)(?:"|')?\)/i);
    return match ? match[1] : '';
  }

  function parseImagePosition(value) {
    const parts = String(value || '').trim().toLowerCase().split(/\s+/).filter(Boolean);
    const convert = (part, fallback) => {
      if (!part) return fallback;
      if (part === 'left' || part === 'top') return 0;
      if (part === 'center') return 50;
      if (part === 'right' || part === 'bottom') return 100;
      const numeric = parseFloat(part);
      return Number.isFinite(numeric) ? Math.max(0, Math.min(100, numeric)) : fallback;
    };
    return { x: convert(parts[0], 50), y: convert(parts[1], 50) };
  }

  function isImageElement(element) {
    return element instanceof Element && (element instanceof HTMLImageElement || element.tagName.toLowerCase() === 'img');
  }

  function captureImageState(element) {
    if (!(element instanceof Element)) return { kind: 'background', src: '', srcset: '', backgroundImage: '', backgroundPosition: '', backgroundSize: '' };
    if (isImageElement(element)) {
      let computed = {};
      try { computed = getComputedStyle(element); } catch { /* inaccessible style */ }
      return { kind: 'src', src: element.currentSrc || element.getAttribute('src') || '', srcset: element.getAttribute('srcset') || '', backgroundImage: '', objectPosition: element.style.objectPosition || '', objectFit: element.style.objectFit || '', effectiveObjectPosition: computed.objectPosition || '50% 50%' };
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

  function applyImageState(element, snapshot) {
    if (!(element instanceof Element) || !snapshot) return;
    if (snapshot.kind === 'src') {
      if (snapshot.src) element.setAttribute('src', snapshot.src); else element.removeAttribute('src');
      if (snapshot.srcset) element.setAttribute('srcset', snapshot.srcset); else element.removeAttribute('srcset');
      if (snapshot.objectPosition) element.style.objectPosition = snapshot.objectPosition; else if (snapshot.effectiveObjectPosition) element.style.objectPosition = snapshot.effectiveObjectPosition;
      if (snapshot.objectFit) element.style.objectFit = snapshot.objectFit;
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
    } else {
      element.style.backgroundImage = snapshot.backgroundImage || '';
      if (snapshot.backgroundPosition) element.style.backgroundPosition = snapshot.backgroundPosition; else element.style.removeProperty('background-position');
      if (snapshot.backgroundSize) element.style.backgroundSize = snapshot.backgroundSize; else element.style.removeProperty('background-size');
    }
  }

  function validateImageSource(source) {
    const value = String(source || '').trim();
    if (!value) return false;
    if (value.startsWith('data:image/')) return value.length <= 1000000;
    try { return ['http:', 'https:'].includes(new URL(value, location.href).protocol); } catch { return false; }
  }

  return { imageBackgroundSource, parseImagePosition, captureImageState, applyImageSource, applyImagePosition, applyImageState, restoreImageState, validateImageSource };
}
