import { createOptimizedPicture } from '../../../../scripts/aem.js';

export default function decorate(element, fieldJson, container, formId) {
  element.classList.add('card');

  element.querySelectorAll('.radio-wrapper').forEach((radioWrapper) => {
    const image = createOptimizedPicture(
      'https://main--adobecustom--earivoli.aem.page/icons/cc.svg',
      'card-image'
    );
    radioWrapper.appendChild(image);
  });

  return element;
}
