import { MEAL_APPROACHES } from "../data/meal-approaches.js";
import { getWeeklyCycleIndex } from "./weekly-cycle.js";

export { MEAL_APPROACHES };

export function getMealApproach(approachId) {
  return (
    MEAL_APPROACHES.find(({ id }) => id === approachId) ??
    MEAL_APPROACHES[0]
  );
}

export function getPlanVariantCount(approachId) {
  return getMealApproach(approachId).weeklyPlans.length;
}

export function getWeeklyPlan(approachId, now = new Date(), offset = 0) {
  const approach = getMealApproach(approachId);
  const count = approach.weeklyPlans.length;
  const cycleIndex = getWeeklyCycleIndex(now);
  const variantIndex = ((cycleIndex + offset) % count + count) % count;
  const plan = approach.weeklyPlans[variantIndex];

  return {
    approachId: approach.id,
    approachLabel: approach.label,
    image: approach.image,
    imageBase: approach.imageBase,
    imageWidth: approach.imageWidth,
    imageHeight: approach.imageHeight,
    alt: approach.alt,
    title: plan.title,
    description: plan.summary,
    meals: plan.meals,
    shopping: plan.shopping,
    variantIndex,
  };
}

export function getWeeklyPlans(now = new Date()) {
  return MEAL_APPROACHES.map(({ id }) => getWeeklyPlan(id, now));
}
