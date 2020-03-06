import { elements } from "./base";

export const renderItem = item => {
  const markup = `
    <li class="shopping__item" data-itemid="${item.id}">
        <div class="shopping__count">
            <input type="number" value="${item.count}" step="${item.count}" min="1" class="shopping__count-value">
            <p>${item.unit}</p>
        </div>
        <p class="shopping__description">${item.ingredient}</p>
        <button class="shopping__delete btn-tiny">
            <svg>
                <use href="img/icons.svg#icon-circle-with-cross"></use>
            </svg>
        </button>
    </li>
  `;

  elements.shopping.insertAdjacentHTML("beforeend", markup);
};

export const deleteItem = id => {
  const item = document.querySelector(`[data-itemid="${id}"]`);
  if (item) item.parentElement.removeChild(item);
};

export const renderClearListBtn = () => {
  const markup = `
  <div class="clear__shopping--list">
    <button class="btn-tiny">
      <svg>
          <use href="img/icons.svg#icon-circle-with-minus"></use>
      </svg>
    </button>
  </div>
  `;
  elements.shopListHeading.insertAdjacentHTML("beforeend", markup);
};

export const deleteFullList = () => {
  elements.shopping.innerHTML = "";
};

export const deleteClearListBtn = () => {
  const el = document.querySelector(".clear__shopping--list");
  if (el) el.parentElement.removeChild(el);
};
