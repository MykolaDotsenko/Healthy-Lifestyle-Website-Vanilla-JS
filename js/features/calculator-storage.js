import {
  DEFAULT_CALCULATOR_PREFERENCES,
  normalizeCalculatorPreferences,
} from "../domain/calculator.js";

export const CALCULATOR_STORAGE_KEY = "nourishflow.calculator.preferences";

const PREVIOUS_STORAGE_KEY = "healthy-lifestyle.calculator.preferences";
const LEGACY_SEX_KEY = "sex";
const LEGACY_RATIO_KEY = "ratio";

function parseStoredPreferences(raw) {
  if (!raw) {
    return { status: "missing", value: null };
  }

  try {
    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { status: "malformed", value: null };
    }

    if (parsed.version === DEFAULT_CALCULATOR_PREFERENCES.version) {
      return { status: "current", value: parsed };
    }

    return { status: "unsupported-version", value: null };
  } catch {
    return { status: "malformed", value: null };
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
    const currentRaw = storage.getItem(CALCULATOR_STORAGE_KEY);
    const current = parseStoredPreferences(currentRaw);

    if (current.status === "current") {
      return normalizeCalculatorPreferences(current.value);
    }

    // A newer client may have written a schema we do not understand.
    // Fall back in memory without destroying that future-version payload.
    if (current.status === "unsupported-version") {
      return { ...DEFAULT_CALCULATOR_PREFERENCES };
    }

    const previousRaw = storage.getItem(PREVIOUS_STORAGE_KEY);
    const previous = parseStoredPreferences(previousRaw);

    if (previous.status === "current") {
      const preferences = normalizeCalculatorPreferences(previous.value);

      if (saveCalculatorPreferences(storage, preferences)) {
        storage.removeItem(PREVIOUS_STORAGE_KEY);
      }

      return preferences;
    }

    if (previous.status === "unsupported-version") {
      return { ...DEFAULT_CALCULATOR_PREFERENCES };
    }

    const legacy = readLegacyPreferences(storage);
    const preferences = normalizeCalculatorPreferences(
      legacy ?? DEFAULT_CALCULATOR_PREFERENCES,
    );

    if (legacy && saveCalculatorPreferences(storage, preferences)) {
      storage.removeItem(LEGACY_SEX_KEY);
      storage.removeItem(LEGACY_RATIO_KEY);
    }

    return preferences;
  } catch {
    return { ...DEFAULT_CALCULATOR_PREFERENCES };
  }
}
