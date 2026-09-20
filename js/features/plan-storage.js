export const PLAN_STORAGE_KEY = "nourishflow.saved-plan";
const PLAN_STORAGE_VERSION = 2;

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
    isNonEmptyString(value.approachId) &&
    isNonEmptyString(value.approachLabel) &&
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

function migrateV1Plan(plan) {
  if (!plan || typeof plan !== "object") {
    return null;
  }

  const migrated = {
    ...plan,
    approachId: plan.styleId,
    approachLabel: plan.styleLabel,
  };

  delete migrated.styleId;
  delete migrated.styleLabel;

  return isPlan(migrated) ? migrated : null;
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

    if (typeof parsed?.savedAt !== "string" || Number.isNaN(Date.parse(parsed.savedAt))) {
      return null;
    }

    if (parsed.version === PLAN_STORAGE_VERSION && isPlan(parsed.plan)) {
      return parsed;
    }

    if (parsed.version === 1) {
      const migratedPlan = migrateV1Plan(parsed.plan);

      if (!migratedPlan) {
        return null;
      }

      const migratedRecord = {
        version: PLAN_STORAGE_VERSION,
        savedAt: parsed.savedAt,
        plan: migratedPlan,
      };

      storage.setItem(PLAN_STORAGE_KEY, JSON.stringify(migratedRecord));
      return migratedRecord;
    }

    return null;
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
