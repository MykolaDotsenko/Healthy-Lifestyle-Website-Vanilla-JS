import { initCalculator } from "./features/calculator.js";
import { initCarousel } from "./features/carousel.js";
import { initForms } from "./features/forms.js";
import { renderMenu } from "./features/menu.js";
import { initTimer } from "./features/timer.js";
import { initModal } from "./ui/modal.js";
import { initTabs } from "./ui/tabs.js";

initTabs();
initTimer();
const modal = initModal();

renderMenu();
initForms(modal);
initCarousel();
initCalculator();
