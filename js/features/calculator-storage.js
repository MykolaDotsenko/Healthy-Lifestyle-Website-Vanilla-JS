import {
  DEFAULT_CALCULATOR_PREFERENCES,
  normalizeCalculatorPreferences,
} from "../domain/calculator.js";

export const CALCULATOR_STORAGE_KEY =
  "healthy-lifestyle.calculator.preferences";

const LEGACY_SEX_KEY = "sex";
const LEGACY_RATIO_KEY = "ratio";

function readJsonPreferences(storage) {
  const raw = storage.getItem(CALCULATOR_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);

    return parsed?.version === DEFAULT_CALCULATOR_PREFERENCES.version
      ? parsed
      : null;
  } catch {
    return null;
  }
}

function readLegacyPreferences(storage) {
  const sex = storage.getItem(LEGACY_SEX_KEY);
  const ratio = storage.getItem(LEGACY_RATIO_KEY);

  if (sex === null && ratio === null) {
    return null;
  }

  return {
    sex,
    activityMultiplier: ratio === null ? undefined : Number(ratio),
  };
}

export function saveCalculatorPreferences(storage, preferences) {
  const normalized = normalizeCalculatorPreferences(preferences);

  try {
    storage.setItem(CALCULATOR_STORAGE_KEY, JSON.stringify(normalized));
    return true;
  } catch {
    return false;
  }
}

export function loadCalculatorPreferences(storage) {
  try {
    const stored = readJsonPreferences(storage);

    if (stored) {
      return normalizeCalculatorPreferences(stored);
    }

    const legacy = readLegacyPreferences(storage);
    const preferences = normalizeCalculatorPreferences(
      legacy ?? DEFAULT_CALCULATOR_PREFERENCES,
    );

    if (saveCalculatorPreferences(storage, preferences) && legacy) {
      storage.removeItem(LEGACY_SEX_KEY);
      storage.removeItem(LEGACY_RATIO_KEY);
    }

    return preferences;
  } catch {
    return { ...DEFAULT_CALCULATOR_PREFERENCES };
  }
}
