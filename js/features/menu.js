import { getWeeklyMenu } from "../domain/meal-styles.js";

const MENU_IMAGE_SIZES =
  "(min-width: 64rem) 25vw, (min-width: 40rem) 50vw, 100vw";

function createMenuPicture(item) {
  const picture = document.createElement("picture");

  for (const type of ["avif", "webp"]) {
    const source = document.createElement("source");
    source.type = `image/${type}`;
    source.srcset = [
      `${item.imageBase}-768.${type} 768w`,
      `${item.imageBase}-1440.${type} 1440w`,
    ].join(", ");
    source.sizes = MENU_IMAGE_SIZES;
    picture.append(source);
  }

  const image = document.createElement("img");
  image.src = item.image;
  image.alt = item.alt;
  image.width = item.imageWidth;
  image.height = item.imageHeight;
  image.sizes = MENU_IMAGE_SIZES;
  image.loading = "lazy";
  image.decoding = "async";
  picture.append(image);

  return picture;
}

function createMenuCard(item, selectedStyleId) {
  const isSelected = item.styleId === selectedStyleId;
  const card = document.createElement("article");
  card.className = "menu__item";
  card.classList.toggle("menu__item_selected", isSelected);
  card.dataset.styleId = item.styleId;

  if (isSelected) {
    card.setAttribute("aria-current", "true");
  }

  const picture = createMenuPicture(item);

  const style = document.createElement("p");
  style.className = "menu__item-style";
  style.textContent = item.styleLabel;

  const title = document.createElement("h3");
  title.className = "menu__item-subtitle";
  title.textContent = item.title;

  const description = document.createElement("p");
  description.className = "menu__item-descr";
  description.textContent = item.description;

  const footer = document.createElement("p");
  footer.className = "menu__item-week";
  footer.textContent = isSelected
    ? "Your current approach · This week's plan"
    : "This week's meal idea";

  card.append(picture, style, title, description, footer);

  return card;
}

export function renderMenu({
  selector = "#menu-list",
  now = new Date(),
  selectedStyleId = "whole-food",
} = {}) {
  const container = document.querySelector(selector);

  if (!container) {
    return;
  }

  const items = getWeeklyMenu(now);
  container.replaceChildren(
    ...items.map((item) => createMenuCard(item, selectedStyleId)),
  );
}

export function initMenu(options = {}) {
  let selectedStyleId = options.selectedStyleId ?? "whole-food";

  function render(now = new Date()) {
    renderMenu({ ...options, now, selectedStyleId });
  }

  function setSelectedStyle(nextStyleId) {
    if (typeof nextStyleId !== "string" || !nextStyleId) {
      return;
    }

    selectedStyleId = nextStyleId;
    render();
  }

  render();

  return { render, setSelectedStyle };
}
