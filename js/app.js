import { initCalculator } from "./features/calculator.js";
import { initCarousel } from "./features/carousel.js";
import { initLocalDataControls } from "./features/local-data.js";
import { initMenu } from "./features/menu.js";
import { initPlan } from "./features/plan.js";
import { initTimer } from "./features/timer.js";
import { initModal } from "./ui/modal.js";
import { initTabs } from "./ui/tabs.js";

const modal = initModal();
const plan = initPlan(modal);
const menu = initMenu();

initTabs({ onChange: plan.setStyle });
initTimer({
  onRefresh() {
    menu.render();
    plan.refreshWeekly();
  },
});
initCarousel();
initCalculator({ onEstimate: plan.setCalories });

initLocalDataControls({
  onCleared() {
    window.location.reload();
  },
});
