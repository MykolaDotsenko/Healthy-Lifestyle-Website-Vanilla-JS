import {
  DEFAULT_CALCULATOR_PREFERENCES,
  calculateDailyCalories,
} from "../domain/calculator.js";
import {
  loadCalculatorPreferences,
  saveCalculatorPreferences,
} from "./calculator-storage.js";

const NUMERIC_FIELDS = {
  height: { stateKey: "heightCm", errorId: "height-error" },
  weight: { stateKey: "weightKg", errorId: "weight-error" },
  age: { stateKey: "ageYears", errorId: "age-error" },
};

function getLocalStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function readNumericValue(input) {
  return Number.isFinite(input.valueAsNumber) ? input.valueAsNumber : null;
}

export function initCalculator() {
  const result = document.querySelector(".calculating__result span");
  const status = document.querySelector("#calculator-status");
  const storage = getLocalStorage();

  if (!result || !status) {
    return;
  }

  const preferences = storage
    ? loadCalculatorPreferences(storage)
    : { ...DEFAULT_CALCULATOR_PREFERENCES };

  const state = {
    sex: preferences.sex,
    activityMultiplier: preferences.activityMultiplier,
    heightCm: null,
    weightKg: null,
    ageYears: null,
  };

  const touchedFields = new Set();

  function savePreferences() {
    if (!storage) {
      return;
    }

    saveCalculatorPreferences(storage, {
      sex: state.sex,
      activityMultiplier: state.activityMultiplier,
    });
  }

  function restoreRadioState(selector, value) {
    document.querySelectorAll(selector).forEach((input) => {
      input.checked = input.value === String(value);
    });
  }

  function setFieldError(fieldId, message) {
    const input = document.querySelector(`#${fieldId}`);
    const error = document.querySelector(`#${NUMERIC_FIELDS[fieldId].errorId}`);

    if (!input || !error) {
      return;
    }

    const hasError = Boolean(message);
    input.setAttribute("aria-invalid", String(hasError));
    error.hidden = !hasError;
    error.textContent = message ?? "";
  }

  function render() {
    const calculation = calculateDailyCalories(state);

    for (const [fieldId, config] of Object.entries(NUMERIC_FIELDS)) {
      const message = touchedFields.has(config.stateKey)
        ? calculation.errors[config.stateKey]
        : null;
      setFieldError(fieldId, message);
    }

    if (calculation.ok) {
      const rounded = Math.round(calculation.calories / 10) * 10;
      result.textContent = `≈ ${new Intl.NumberFormat().format(rounded)}`;
      status.textContent = "Estimated daily maintenance energy.";
      document.dispatchEvent(
        new CustomEvent("nourishflow:estimate", {
          detail: { calories: calculation.calories },
        }),
      );
      return;
    }

    result.textContent = "—";
    document.dispatchEvent(
      new CustomEvent("nourishflow:estimate", {
        detail: { calories: null },
      }),
    );

    const visibleErrors = Object.values(NUMERIC_FIELDS).some(
      ({ stateKey }) =>
        touchedFields.has(stateKey) && Boolean(calculation.errors[stateKey]),
    );
    const hasTouchedFields = touchedFields.size > 0;

    status.textContent = visibleErrors
      ? "Check the highlighted fields to calculate your estimate."
      : hasTouchedFields
        ? "Complete all fields to calculate your estimate."
        : "Enter your details to calculate an estimate.";
  }

  function bindRadioGroup(selector, stateKey, transform = (value) => value) {
    document.querySelectorAll(selector).forEach((input) => {
      input.addEventListener("change", (event) => {
        if (!event.target.checked) {
          return;
        }

        state[stateKey] = transform(event.target.value);
        savePreferences();
        render();
      });
    });
  }

  restoreRadioState('#gender input[name="sex"]', state.sex);
  restoreRadioState(
    '.calculating__choose_big input[name="activity"]',
    state.activityMultiplier,
  );

  bindRadioGroup('#gender input[name="sex"]', "sex");
  bindRadioGroup(
    '.calculating__choose_big input[name="activity"]',
    "activityMultiplier",
    Number,
  );

  for (const [fieldId, config] of Object.entries(NUMERIC_FIELDS)) {
    const input = document.querySelector(`#${fieldId}`);

    if (!input) {
      continue;
    }

    input.addEventListener("input", () => {
      state[config.stateKey] = readNumericValue(input);
      touchedFields.add(config.stateKey);
      render();
    });

    input.addEventListener("blur", () => {
      touchedFields.add(config.stateKey);
      render();
    });
  }

  render();
}

