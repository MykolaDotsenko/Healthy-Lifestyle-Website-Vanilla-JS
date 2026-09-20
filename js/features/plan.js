import {
  getPlanVariantCount,
  getWeeklyMealIdea,
} from "../domain/meal-styles.js";
import { loadPlan, removePlan, savePlan } from "./plan-storage.js";

export function formatCalories(calories) {
  if (!Number.isFinite(calories)) {
    return "Optional — calculate your daily estimate above";
  }

  const rounded = Math.round(calories / 10) * 10;
  return `≈ ${new Intl.NumberFormat().format(rounded)} kcal/day`;
}

export function buildPlanSummary({
  styleId = "whole-food",
  calories = null,
  energyText = null,
  now = new Date(),
  offset = 0,
} = {}) {
  const meal = getWeeklyMealIdea(styleId, now, offset);

  return {
    styleId: meal.styleId,
    styleLabel: meal.styleLabel,
    energy: energyText ?? formatCalories(calories),
    title: meal.title,
    summary: meal.description,
    meals: meal.meals.map((item) => ({ ...item })),
    shopping: [...meal.shopping],
    variantIndex: meal.variantIndex,
  };
}

export function formatPlanText(plan) {
  const mealLines = plan.meals.map(
    ({ slot, title, description }) =>
      `${slot}: ${title}\n  ${description}`,
  );

  return [
    "NourishFlow plan",
    `Meal approach: ${plan.styleLabel}`,
    `Daily energy: ${plan.energy}`,
    `Plan: ${plan.title}`,
    "",
    ...mealLines,
    "",
    `Shopping starter: ${plan.shopping.join(", ")}`,
  ].join("\n");
}

function getLocalStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function formatSavedDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Saved on this device";
  }

  return `Saved ${new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(date)}`;
}

function createMealItem(meal) {
  const item = document.createElement("article");
  item.className = "plan-meal";

  const slot = document.createElement("p");
  slot.className = "plan-meal__slot";
  slot.textContent = meal.slot;

  const title = document.createElement("h3");
  title.className = "plan-meal__title";
  title.textContent = meal.title;

  const description = document.createElement("p");
  description.className = "plan-meal__description";
  description.textContent = meal.description;

  item.append(slot, title, description);
  return item;
}

function createShoppingItem(value) {
  const item = document.createElement("li");
  item.textContent = value;
  return item;
}

export function initPlan(
  modal,
  {
    storage = getLocalStorage(),
    getNow = () => new Date(),
  } = {},
) {
  let styleId = "whole-food";
  let calories = null;
  let variantOffset = 0;
  let currentPlan = null;
  let savedRecord = loadPlan(storage);

  const styleOutput = document.querySelector("[data-plan-style]");
  const energyOutput = document.querySelector("[data-plan-energy]");
  const planTitle = document.querySelector("[data-plan-title]");
  const planSummary = document.querySelector("[data-plan-summary]");
  const mealsOutput = document.querySelector("[data-plan-meals]");
  const shoppingOutput = document.querySelector("[data-plan-shopping]");
  const status = document.querySelector("[data-plan-status]");
  const savedPanel = document.querySelector("[data-saved-plan]");
  const savedTitle = document.querySelector("[data-saved-plan-title]");
  const savedMeta = document.querySelector("[data-saved-plan-meta]");
  const savedOpenButton = document.querySelector("[data-open-saved-plan]");
  const removeSavedButton = document.querySelector("[data-remove-saved-plan]");
  const swapButton = document.querySelector("[data-swap-plan]");
  const saveButton = document.querySelector("[data-save-plan]");
  const copyButton = document.querySelector("[data-copy-plan]");

  function renderSavedPlan() {
    if (!savedPanel || !savedTitle || !savedMeta) {
      return;
    }

    savedPanel.hidden = !savedRecord;

    if (!savedRecord) {
      return;
    }

    savedTitle.textContent =
      `${savedRecord.plan.styleLabel} · ${savedRecord.plan.title}`;
    savedMeta.textContent = formatSavedDate(savedRecord.savedAt);
  }

  function renderPlan(plan) {
    if (styleOutput) styleOutput.textContent = plan.styleLabel;
    if (energyOutput) energyOutput.textContent = plan.energy;
    if (planTitle) planTitle.textContent = plan.title;
    if (planSummary) planSummary.textContent = plan.summary;
    if (status) status.textContent = "";

    mealsOutput?.replaceChildren(...plan.meals.map(createMealItem));
    shoppingOutput?.replaceChildren(...plan.shopping.map(createShoppingItem));
  }

  function openPlan(plan) {
    currentPlan = plan;
    renderPlan(plan);
    modal.open();
  }

  function openCurrentPlan({ energyText = null } = {}) {
    openPlan(
      buildPlanSummary({
        styleId,
        calories,
        energyText,
        now: getNow(),
        offset: variantOffset,
      }),
    );
  }

  function alignStateToPlan(plan) {
    styleId = plan.styleId;
    const variantCount = getPlanVariantCount(styleId);
    const baseline = getWeeklyMealIdea(styleId, getNow(), 0).variantIndex;
    variantOffset =
      ((plan.variantIndex - baseline) % variantCount + variantCount) %
      variantCount;
  }

  async function copyCurrentPlan() {
    if (!currentPlan || !status) {
      return;
    }

    try {
      await navigator.clipboard.writeText(formatPlanText(currentPlan));
      status.textContent = "Plan copied to your clipboard.";
    } catch {
      status.textContent =
        "Copy is unavailable here. You can still select the plan text manually.";
    }
  }

  function saveCurrentPlan() {
    if (!currentPlan || !status) {
      return;
    }

    const savedAt = getNow();

    if (savePlan(storage, currentPlan, savedAt)) {
      savedRecord = {
        version: 1,
        savedAt: savedAt.toISOString(),
        plan: currentPlan,
      };
      renderSavedPlan();
      status.textContent = "Plan saved on this device.";
      return;
    }

    status.textContent = "This browser could not save the plan.";
  }

  document.querySelectorAll("[data-plan]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      variantOffset = 0;
      openCurrentPlan();
    });
  });

  swapButton?.addEventListener("click", () => {
    const preservedEnergy = currentPlan?.energy ?? null;
    variantOffset =
      (variantOffset + 1) % getPlanVariantCount(styleId);
    openCurrentPlan({ energyText: preservedEnergy });
  });

  saveButton?.addEventListener("click", saveCurrentPlan);
  copyButton?.addEventListener("click", copyCurrentPlan);

  savedOpenButton?.addEventListener("click", () => {
    if (savedRecord) {
      alignStateToPlan(savedRecord.plan);
      openPlan(savedRecord.plan);
    }
  });

  removeSavedButton?.addEventListener("click", () => {
    if (!savedRecord) {
      return;
    }

    if (removePlan(storage)) {
      savedRecord = null;
      renderSavedPlan();
      if (status) {
        status.textContent = "Saved plan removed from this device.";
      }
    }
  });

  renderSavedPlan();

  return {
    setStyle(nextStyleId) {
      if (typeof nextStyleId === "string" && nextStyleId) {
        styleId = nextStyleId;
        variantOffset = 0;
      }
    },
    setCalories(nextCalories) {
      calories = Number.isFinite(nextCalories) ? nextCalories : null;
    },
    refreshWeekly() {
      variantOffset = 0;
    },
    clearSaved() {
      savedRecord = null;
      renderSavedPlan();
    },
  };
}
