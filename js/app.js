import { initCalculator } from "./features/calculator.js";
import { initCarousel } from "./features/carousel.js";
import { initForms } from "./features/forms.js";
import { renderMenu } from "./features/menu.js";
import { initModal } from "./ui/modal.js";
import { initTabs } from "./ui/tabs.js";

initTabs();
const modal = initModal();

renderMenu();
initForms(modal);
initCarousel();
initCalculator();
