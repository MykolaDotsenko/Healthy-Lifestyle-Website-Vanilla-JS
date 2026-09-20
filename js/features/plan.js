import { getWeeklyMealIdea } from "../domain/meal-styles.js";

export function formatCalories(calories) {
  if (!Number.isFinite(calories)) {
    return "Add your details in the energy calculator";
  }

  const rounded = Math.round(calories / 10) * 10;
  return `≈ ${new Intl.NumberFormat().format(rounded)} kcal/day`;
}

export function buildPlanSummary({
  styleId = "fitness",
  calories = null,
  now = new Date(),
} = {}) {
  const meal = getWeeklyMealIdea(styleId, now);

  return {
    styleLabel: meal.styleLabel,
    energy: formatCalories(calories),
    mealTitle: meal.title,
    mealDescription: meal.description,
  };
}

export function initPlan(modal) {
  let styleId = "fitness";
  let calories = null;

  document.addEventListener("nourishflow:meal-style", (event) => {
    if (typeof event.detail?.styleId === "string") {
      styleId = event.detail.styleId;
    }
  });

  document.addEventListener("nourishflow:estimate", (event) => {
    calories = Number.isFinite(event.detail?.calories)
      ? event.detail.calories
      : null;
  });

  async function copyPlan(plan, status) {
    const text = [
      "NourishFlow plan",
      `Meal style: ${plan.styleLabel}`,
      `Daily energy: ${plan.energy}`,
      `This week's idea: ${plan.mealTitle}`,
      plan.mealDescription,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      status.textContent = "Plan copied to your clipboard.";
    } catch {
      status.textContent = "Copy is unavailable in this browser. You can select the summary text manually.";
    }
  }

  document.querySelectorAll("[data-plan]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const plan = buildPlanSummary({ styleId, calories });

      const styleOutput = document.querySelector("[data-plan-style]");
      const energyOutput = document.querySelector("[data-plan-energy]");
      const mealOutput = document.querySelector("[data-plan-meal]");
      const mealDescription = document.querySelector("[data-plan-meal-description]");
      const status = document.querySelector("[data-plan-copy-status]");

      if (styleOutput) styleOutput.textContent = plan.styleLabel;
      if (energyOutput) energyOutput.textContent = plan.energy;
      if (mealOutput) mealOutput.textContent = plan.mealTitle;
      if (mealDescription) mealDescription.textContent = plan.mealDescription;
      if (status) status.textContent = "";

      modal.open();

      const copyButton = document.querySelector("[data-copy-plan]");
      if (copyButton && status) {
        copyButton.onclick = () => copyPlan(plan, status);
      }
    });
  });
}
