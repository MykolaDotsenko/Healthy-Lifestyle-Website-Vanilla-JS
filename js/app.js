import { initCalculator } from "./features/calculator.js";
import { initCarousel } from "./features/carousel.js";
import { initMenu } from "./features/menu.js";
import { initPlan } from "./features/plan.js";
import { initTimer } from "./features/timer.js";
import { initModal } from "./ui/modal.js";
import { initTabs } from "./ui/tabs.js";

const modal = initModal();
initPlan(modal);
initTabs();
initTimer();
initMenu();
initCarousel();
initCalculator();
