const MENU_IMAGE_SIZES =
  "(min-width: 64rem) 33vw, (min-width: 40rem) 50vw, 100vw";

const MENU_ITEMS = [
  {
    image: "img/tabs/vegy.jpg",
    imageBase: "img/optimized/tabs/vegy",
    imageWidth: 1920,
    imageHeight: 1221,
    alt: "Fresh vegetables prepared for the Fitness menu",
    title: "Fitness Menu",
    description:
      "A produce-forward meal concept built around fresh vegetables, fruit, and straightforward portions.",
    price: 9,
  },
  {
    image: "img/tabs/post.jpg",
    imageBase: "img/optimized/tabs/post",
    imageWidth: 1920,
    imageHeight: 1280,
    alt: "Plant-based Vegetarian menu",
    title: "Vegetarian Menu",
    description:
      "A plant-based meal concept combining grains, vegetables, tofu, and dairy-free alternatives.",
    price: 14,
  },
  {
    image: "img/tabs/elite.jpg",
    imageBase: "img/optimized/tabs/elite",
    imageWidth: 1920,
    imageHeight: 1281,
    alt: "Premium seafood and fruit meal",
    title: "Premium Menu",
    description:
      "A seafood-focused concept that demonstrates a more premium visual treatment and card hierarchy.",
    price: 21,
  },
];

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

function createMenuCard(item) {
  const card = document.createElement("article");
  card.className = "menu__item";

  const picture = createMenuPicture(item);

  const title = document.createElement("h3");
  title.className = "menu__item-subtitle";
  title.textContent = item.title;

  const description = document.createElement("p");
  description.className = "menu__item-descr";
  description.textContent = item.description;

  const divider = document.createElement("div");
  divider.className = "menu__item-divider";
  divider.setAttribute("aria-hidden", "true");

  const price = document.createElement("div");
  price.className = "menu__item-price";

  const priceLabel = document.createElement("span");
  priceLabel.className = "menu__item-cost";
  priceLabel.textContent = "Demo price:";

  const priceTotal = document.createElement("span");
  priceTotal.className = "menu__item-total";

  const amount = document.createElement("strong");
  amount.textContent = String(item.price);

  priceTotal.append(amount, " EUR/day");
  price.append(priceLabel, priceTotal);
  card.append(picture, title, description, divider, price);

  return card;
}

export function renderMenu({
  selector = "#menu-list",
  items = MENU_ITEMS,
} = {}) {
  const container = document.querySelector(selector);

  if (!container) {
    return;
  }

  container.replaceChildren(...items.map(createMenuCard));
}
