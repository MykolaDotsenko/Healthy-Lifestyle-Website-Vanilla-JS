import {
  getPlanVariantCount,
  getWeeklyPlan,
} from "../domain/meal-plans.js";
import { createPlanView } from "../ui/plan-view.js";
import { loadPlan, removePlan, savePlan } from "./plan-storage.js";

export function formatCalories(calories) {
  if (!Number.isFinite(calories)) {
    return "Optional — calculate your daily estimate above";
  }

  const rounded = Math.round(calories / 10) * 10;
  return `≈ ${new Intl.NumberFormat().format(rounded)} kcal/day`;
}

export function buildPlanSummary({
  approachId = "whole-food",
  calories = null,
  energyText = null,
  now = new Date(),
  offset = 0,
} = {}) {
  const weeklyPlan = getWeeklyPlan(approachId, now, offset);

  return {
    approachId: weeklyPlan.approachId,
    approachLabel: weeklyPlan.approachLabel,
    energy: energyText ?? formatCalories(calories),
    title: weeklyPlan.title,
    summary: weeklyPlan.description,
    meals: weeklyPlan.meals.map((item) => ({ ...item })),
    shopping: [...weeklyPlan.shopping],
    variantIndex: weeklyPlan.variantIndex,
  };
}

export function formatPlanText(plan) {
  const mealLines = plan.meals.map(
    ({ slot, title, description }) =>
      `${slot}: ${title}\n  ${description}`,
  );

  return [
    "NourishFlow plan",
    `Meal approach: ${plan.approachLabel}`,
    `Energy context: ${plan.energy}`,
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

export function initPlan(
  modal,
  {
    storage = getLocalStorage(),
    getNow = () => new Date(),
  } = {},
) {
  let approachId = "whole-food";
  let calories = null;
  let variantOffset = 0;
  let currentPlan = null;
  let savedRecord = loadPlan(storage);

  const view = createPlanView();
  const savedOpenButton = document.querySelector("[data-open-saved-plan]");
  const removeSavedButton = document.querySelector("[data-remove-saved-plan]");
  const swapButton = document.querySelector("[data-swap-plan]");
  const saveButton = document.querySelector("[data-save-plan]");
  const copyButton = document.querySelector("[data-copy-plan]");

  function openPlan(plan) {
    currentPlan = plan;
    view.renderPlan(plan);
    modal.open();
  }

  function openCurrentPlan({ energyText = null } = {}) {
    openPlan(
      buildPlanSummary({
        approachId,
        calories,
        energyText,
        now: getNow(),
        offset: variantOffset,
      }),
    );
  }

  function alignStateToPlan(plan) {
    approachId = plan.approachId;
    const variantCount = getPlanVariantCount(approachId);
    const baseline = getWeeklyPlan(approachId, getNow(), 0).variantIndex;
    variantOffset =
      ((plan.variantIndex - baseline) % variantCount + variantCount) %
      variantCount;
  }

  async function copyCurrentPlan() {
    if (!currentPlan) {
      return;
    }

    try {
      await navigator.clipboard.writeText(formatPlanText(currentPlan));
      view.setDialogStatus("Plan copied to your clipboard.");
    } catch {
      view.setDialogStatus(
        "Copy is unavailable here. You can still select the plan text manually.",
      );
    }
  }

  function saveCurrentPlan() {
    if (!currentPlan) {
      return;
    }

    const savedAt = getNow();

    if (savePlan(storage, currentPlan, savedAt)) {
      savedRecord = {
        version: 2,
        savedAt: savedAt.toISOString(),
        plan: currentPlan,
      };
      view.renderSavedPlan(savedRecord);
      view.setPageStatus("");
      view.setDialogStatus("Plan saved on this device.");
      return;
    }

    view.setDialogStatus("This browser could not save the plan.");
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
      (variantOffset + 1) % getPlanVariantCount(approachId);
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
      view.renderSavedPlan(null);
      view.setPageStatus("Saved plan removed from this device.");
    }
  });

  view.renderSavedPlan(savedRecord);

  return {
    setApproach(nextApproachId) {
      if (typeof nextApproachId === "string" && nextApproachId) {
        approachId = nextApproachId;
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
      view.renderSavedPlan(null);
      view.setPageStatus("");
    },
  };
}
