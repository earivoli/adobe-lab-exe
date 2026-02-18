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
                    element = rewriteHlxToAemImages(element)
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


function rewriteHlxToAemImages(input, options = {}) {
  const { mutate = false } = options;

  // --- helpers ---
  function rewriteDomain(url) {
    try {
      const u = new URL(url, window.location.origin);
      if (u.hostname.endsWith('.hlx.live')) {
        u.hostname = u.hostname.replace('.hlx.live', '.aem.live');
      }
      return u.toString();
    } catch {
      // Not a valid absolute/relative URL for URL(), return as-is
      return url;
    }
  }

  function rewriteSrcset(srcset) {
    if (!srcset || typeof srcset !== 'string') return srcset;
    return srcset
      .split(',')
      .map(part => {
        const trimmed = part.trim();
        if (!trimmed) return trimmed;
        const pieces = trimmed.split(/\s+/, 2);
        const url = pieces[0];
        const descriptor = pieces[1] || '';
        const rewritten = rewriteDomain(url);
        return descriptor ? `${rewritten} ${descriptor}` : rewritten;
      })
      .join(', ');
  }

  function processRoot(root) {
    if (!root) return root;

    // <img>
    root.querySelectorAll('img[src]').forEach(img => {
      const src = img.getAttribute('src');
      if (src) img.setAttribute('src', rewriteDomain(src));
      // Some setups also use srcset on <img>
      if (img.hasAttribute('srcset')) {
        img.setAttribute('srcset', rewriteSrcset(img.getAttribute('srcset')));
      }
    });

    // <source> (picture/video/audio sources)
    root.querySelectorAll('source').forEach(source => {
      if (source.hasAttribute('srcset')) {
        source.setAttribute('srcset', rewriteSrcset(source.getAttribute('srcset')));
      }
      if (source.hasAttribute('src')) {
        source.setAttribute('src', rewriteDomain(source.getAttribute('src')));
      }
    });

    // <picture> (rarely has src/srcset, but safe to cover)
    root.querySelectorAll('picture').forEach(pic => {
      if (pic.hasAttribute('srcset')) {
        pic.setAttribute('srcset', rewriteSrcset(pic.getAttribute('srcset')));
      }
      if (pic.hasAttribute('src')) {
        pic.setAttribute('src', rewriteDomain(pic.getAttribute('src')));
      }
    });

    return root;
  }

  // --- main dispatch: string vs DOM ---
  const isString = typeof input === 'string';

  if (isString) {
    // Parse HTML string
    const parser = new DOMParser();
    const doc = parser.parseFromString(input, 'text/html');

    // If input is a fragment (like just a <fieldset>), it will appear under body.
    // We’ll process the body.
    processRoot(doc);

    // If the input looked like a single root element, return its outerHTML.
    // Otherwise, return the whole <body> inner HTML.
    const body = doc.body;
    if (body && body.children.length === 1) {
      return body.children[0].outerHTML;
    }
    return body.innerHTML;
  } else {
    // Element/Node path
    const root = input instanceof Node ? input : null;
    if (!root) return input;

    const target = mutate ? root : root.cloneNode(true);
    processRoot(target);
    return target;
  }
}