export const PLAN_STORAGE_KEY = "nourishflow.saved-plan";
const PLAN_STORAGE_VERSION = 1;

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0 && value.length <= 500;
}

function isMeal(value) {
  return (
    value &&
    typeof value === "object" &&
    isNonEmptyString(value.slot) &&
    isNonEmptyString(value.title) &&
    isNonEmptyString(value.description)
  );
}

function isPlan(value) {
  return (
    value &&
    typeof value === "object" &&
    isNonEmptyString(value.styleId) &&
    isNonEmptyString(value.styleLabel) &&
    isNonEmptyString(value.energy) &&
    isNonEmptyString(value.title) &&
    isNonEmptyString(value.summary) &&
    Number.isInteger(value.variantIndex) &&
    value.variantIndex >= 0 &&
    value.variantIndex < 100 &&
    Array.isArray(value.meals) &&
    value.meals.length === 3 &&
    value.meals.every(isMeal) &&
    Array.isArray(value.shopping) &&
    value.shopping.length > 0 &&
    value.shopping.length <= 24 &&
    value.shopping.every(isNonEmptyString)
  );
}

export function savePlan(storage, plan, savedAt = new Date()) {
  if (!storage || !isPlan(plan)) {
    return false;
  }

  try {
    storage.setItem(
      PLAN_STORAGE_KEY,
      JSON.stringify({
        version: PLAN_STORAGE_VERSION,
        savedAt: savedAt.toISOString(),
        plan,
      }),
    );
    return true;
  } catch {
    return false;
  }
}

export function loadPlan(storage) {
  if (!storage) {
    return null;
  }

  try {
    const raw = storage.getItem(PLAN_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);

    if (
      parsed?.version !== PLAN_STORAGE_VERSION ||
      typeof parsed.savedAt !== "string" ||
      Number.isNaN(Date.parse(parsed.savedAt)) ||
      !isPlan(parsed.plan)
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function removePlan(storage) {
  if (!storage) {
    return false;
  }

  try {
    storage.removeItem(PLAN_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
