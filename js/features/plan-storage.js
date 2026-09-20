export const PLAN_STORAGE_KEY = "nourishflow.saved-plan";
const PLAN_STORAGE_VERSION = 1;

function isMeal(value) {
  return (
    value &&
    typeof value === "object" &&
    typeof value.slot === "string" &&
    typeof value.title === "string" &&
    typeof value.description === "string"
  );
}

function isPlan(value) {
  return (
    value &&
    typeof value === "object" &&
    typeof value.styleId === "string" &&
    typeof value.styleLabel === "string" &&
    typeof value.energy === "string" &&
    typeof value.title === "string" &&
    Array.isArray(value.meals) &&
    value.meals.length === 3 &&
    value.meals.every(isMeal) &&
    Array.isArray(value.shopping) &&
    value.shopping.every((item) => typeof item === "string")
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
      !isPlan(parsed.plan)
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}
