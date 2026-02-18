import { createOptimizedPicture } from '../../../../scripts/aem.js';
import { subscribe } from '../../rules/index.js';

function createCard(element, enums) {
  element.querySelectorAll('.radio-wrapper').forEach((radioWrapper, index) => {
    if (enums[index]?.name) {
      let label = radioWrapper.querySelector('label');
      if (!label) {
        label = document.createElement('label');
        radioWrapper.appendChild(label);
      }
      label.textContent = enums[index]?.name;
    }
    radioWrapper.querySelector('input').dataset.index = index;
    const image = createOptimizedPicture(enums[index].image || 'https://main--afb--jalagari.aem.live/lab/images/card.png', 'card-image');
   radioWrapper.appendChild(image);
  });
}


export default function decorate(element, fieldJson, container, formId) {
    element.classList.add('card');
    createCard(element, fieldJson.enum);
    subscribe(element, formId, (fieldDiv, fieldModel) => {
        fieldModel.subscribe((e) => {
            const { payload } = e;
            payload?.changes?.forEach((change) => {
                if (change?.propertyName === 'enum') {

                    console.log("Ezhiloli",element,change.currentValue);
                    element = rewriteHlxToAemInPlace(element)
                    createCard(element, change.currentValue);
                }
            });
        });

        element.addEventListener('change', (e) => {
            e.stopPropagation();
            const value = fieldModel.enum?.[parseInt(e.target.dataset.index, 10)];
            fieldModel.value = value.name;
        });
    });
    return element;
}


/**
 * Mutates the given DOM element by rewriting image URLs from *.hlx.live to *.aem.live.
 * Updates src and srcset on <img>, <source>, and <picture> within the element.
 *
 * @param {Element} rootEl - The container element to process (e.g., your fieldset).
 * @returns {Element} The same element, after in-place updates.
 */
function rewriteHlxToAemInPlace(rootEl) {
  if (!rootEl || !(rootEl instanceof Element)) return rootEl;

  // Change only the hostname from *.hlx.live to *.aem.live
  const rewriteDomain = (url) => {
    try {
      const base = (typeof window !== 'undefined' && window.location) ? window.location.origin : 'https://example.com';
      const u = new URL(url, base);
      if (u.hostname.endsWith('.hlx.live')) {
        u.hostname = u.hostname.replace('.hlx.live', '.aem.live');
      }
      return u.toString();
    } catch {
      return url; // leave unchanged if not a valid/parseable URL
    }
  };

  // Handle "url 1x, url2 2x" or "url 750w"
  const rewriteSrcset = (srcset) => {
    if (!srcset || typeof srcset !== 'string') return srcset;
    return srcset
      .split(',')
      .map(part => {
        const trimmed = part.trim();
        if (!trimmed) return trimmed;
        const [url, descriptor = ''] = trimmed.split(/\s+/, 2);
        const rewritten = rewriteDomain(url);
        return descriptor ? `${rewritten} ${descriptor}` : rewritten;
      })
      .join(', ');
  };

  // <img>
  rootEl.querySelectorAll('img').forEach(img => {
    if (img.hasAttribute('src')) {
      img.setAttribute('src', rewriteDomain(img.getAttribute('src')));
    }
    if (img.hasAttribute('srcset')) {
      img.setAttribute('srcset', rewriteSrcset(img.getAttribute('srcset')));
    }
  });

  // <source> (within <picture>, <video>, etc.)
  rootEl.querySelectorAll('source').forEach(source => {
    if (source.hasAttribute('src')) {
      source.setAttribute('src', rewriteDomain(source.getAttribute('src')));
    }
    if (source.hasAttribute('srcset')) {
      source.setAttribute('srcset', rewriteSrcset(source.getAttribute('srcset')));
    }
  });

  // <picture> (rarely has src/srcset, but safe to support)
  rootEl.querySelectorAll('picture').forEach(pic => {
    if (pic.hasAttribute('src')) {
      pic.setAttribute('src', rewriteDomain(pic.getAttribute('src')));
    }
    if (pic.hasAttribute('srcset')) {
      pic.setAttribute('srcset', rewriteSrcset(pic.getAttribute('srcset')));
    }
  });

  return rootEl;
}