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

export function createPlanView() {
  const approachOutput = document.querySelector("[data-plan-approach]");
  const energyOutput = document.querySelector("[data-plan-energy]");
  const planTitle = document.querySelector("[data-plan-title]");
  const planSummary = document.querySelector("[data-plan-summary]");
  const mealsOutput = document.querySelector("[data-plan-meals]");
  const shoppingOutput = document.querySelector("[data-plan-shopping]");
  const dialogStatus = document.querySelector("[data-plan-status]");
  const pageStatus = document.querySelector("[data-plan-page-status]");
  const savedPanel = document.querySelector("[data-saved-plan]");
  const savedTitle = document.querySelector("[data-saved-plan-title]");
  const savedMeta = document.querySelector("[data-saved-plan-meta]");

  function renderPlan(plan) {
    if (approachOutput) approachOutput.textContent = plan.approachLabel;
    if (energyOutput) energyOutput.textContent = plan.energy;
    if (planTitle) planTitle.textContent = plan.title;
    if (planSummary) planSummary.textContent = plan.summary;
    if (dialogStatus) dialogStatus.textContent = "";

    mealsOutput?.replaceChildren(...plan.meals.map(createMealItem));
    shoppingOutput?.replaceChildren(...plan.shopping.map(createShoppingItem));
  }

  function renderSavedPlan(record) {
    if (!savedPanel || !savedTitle || !savedMeta) {
      return;
    }

    savedPanel.hidden = !record;

    if (!record) {
      savedTitle.textContent = "";
      savedMeta.textContent = "";
      return;
    }

    savedTitle.textContent =
      `${record.plan.approachLabel} · ${record.plan.title}`;
    savedMeta.textContent = formatSavedDate(record.savedAt);
  }

  function setDialogStatus(message) {
    if (dialogStatus) {
      dialogStatus.textContent = message;
    }
  }

  function setPageStatus(message) {
    if (pageStatus) {
      pageStatus.textContent = message;
    }
  }

  return {
    renderPlan,
    renderSavedPlan,
    setDialogStatus,
    setPageStatus,
  };
}
