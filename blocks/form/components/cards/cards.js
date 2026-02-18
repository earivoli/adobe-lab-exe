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
    const image = createOptimizedPicture(enums[index].image || 'https://main--afb--jalagari.hlx.page/lab/images/card.png', 'card-image');
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

