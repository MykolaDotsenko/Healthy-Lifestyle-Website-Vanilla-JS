const MENU_ITEMS = [
  {
    image: "img/tabs/vegy.jpg",
    alt: "Fresh vegetables prepared for the Fitness menu",
    title: "Fitness Menu",
    description:
      "The Fitness Menu is a new approach to preparing dishes: more fresh vegetables and fruits. It's a product for active and healthy individuals. This is an entirely new product with an optimal price and high quality!",
    price: 9,
  },
  {
    image: "img/tabs/post.jpg",
    alt: "Plant-based Vegetarian menu",
    title: "Vegetarian Menu",
    description:
      "The Vegetarian Menu involves a careful selection of ingredients: complete absence of animal products, almond, oat, coconut, or buckwheat milk, the right amount of protein through tofu and imported vegetarian steaks.",
    price: 14,
  },
  {
    image: "img/tabs/elite.jpg",
    alt: "Premium seafood and fruit meal",
    title: "Premium Menu",
    description:
      "In the Premium Menu, we use not only beautiful packaging design but also high-quality dish execution. Red fish, seafood, fruits - a restaurant menu without going to a restaurant!",
    price: 21,
  },
];

function createMenuCard(item) {
  const card = document.createElement("article");
  card.className = "menu__item";

  const image = document.createElement("img");
  image.src = item.image;
  image.alt = item.alt;

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
  priceLabel.textContent = "Price:";

  const priceTotal = document.createElement("span");
  priceTotal.className = "menu__item-total";

  const amount = document.createElement("strong");
  amount.textContent = String(item.price);

  priceTotal.append(amount, " EUR/day");
  price.append(priceLabel, priceTotal);
  card.append(image, title, description, divider, price);

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
