export const CALCULATOR_LIMITS = Object.freeze({
  heightCm: Object.freeze({ min: 100, max: 250 }),
  weightKg: Object.freeze({ min: 30, max: 350 }),
  ageYears: Object.freeze({ min: 18, max: 120 }),
});

export const ACTIVITY_MULTIPLIERS = Object.freeze([1.2, 1.375, 1.55, 1.725]);
export const SEX_VALUES = Object.freeze(["female", "male"]);

export const DEFAULT_CALCULATOR_PREFERENCES = Object.freeze({
  version: 1,
  sex: "female",
  activityMultiplier: 1.375,
});

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function isInRange(value, { min, max }) {
  return isFiniteNumber(value) && value >= min && value <= max;
}

export function normalizeCalculatorPreferences(value) {
  const candidate =
    value && typeof value === "object" && !Array.isArray(value) ? value : {};

  const sex = SEX_VALUES.includes(candidate.sex)
    ? candidate.sex
    : DEFAULT_CALCULATOR_PREFERENCES.sex;

  const activityMultiplier = ACTIVITY_MULTIPLIERS.includes(
    Number(candidate.activityMultiplier),
  )
    ? Number(candidate.activityMultiplier)
    : DEFAULT_CALCULATOR_PREFERENCES.activityMultiplier;

  return {
    version: DEFAULT_CALCULATOR_PREFERENCES.version,
    sex,
    activityMultiplier,
  };
}

export function validateCalculatorInput(input) {
  const errors = {};

  if (!SEX_VALUES.includes(input.sex)) {
    errors.sex = "Choose a supported sex value.";
  }

  if (!ACTIVITY_MULTIPLIERS.includes(input.activityMultiplier)) {
    errors.activityMultiplier = "Choose a supported activity level.";
  }

  if (!isInRange(input.heightCm, CALCULATOR_LIMITS.heightCm)) {
    errors.heightCm =
      `Enter height from ${CALCULATOR_LIMITS.heightCm.min} to ${CALCULATOR_LIMITS.heightCm.max} cm.`;
  }

  if (!isInRange(input.weightKg, CALCULATOR_LIMITS.weightKg)) {
    errors.weightKg =
      `Enter weight from ${CALCULATOR_LIMITS.weightKg.min} to ${CALCULATOR_LIMITS.weightKg.max} kg.`;
  }

  if (
    !isInRange(input.ageYears, CALCULATOR_LIMITS.ageYears) ||
    !Number.isInteger(input.ageYears)
  ) {
    errors.ageYears =
      `Enter age as a whole number from ${CALCULATOR_LIMITS.ageYears.min} to ${CALCULATOR_LIMITS.ageYears.max}.`;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function calculateDailyCalories(input) {
  const validation = validateCalculatorInput(input);

  if (!validation.valid) {
    return {
      ok: false,
      errors: validation.errors,
      calories: null,
    };
  }

  const restingEnergy =
    input.sex === "female"
      ? 447.6 +
        9.2 * input.weightKg +
        3.1 * input.heightCm -
        4.3 * input.ageYears
      : 88.36 +
        13.4 * input.weightKg +
        4.8 * input.heightCm -
        5.7 * input.ageYears;

  return {
    ok: true,
    errors: {},
    calories: Math.round(restingEnergy * input.activityMultiplier),
  };
}
