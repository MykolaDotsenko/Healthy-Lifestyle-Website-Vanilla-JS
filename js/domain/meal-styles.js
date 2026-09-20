import { getWeeklyCycleIndex } from "./weekly-cycle.js";

export const MEAL_STYLES = Object.freeze([
  Object.freeze({
    id: "fitness",
    label: "Fitness",
    image: "img/tabs/vegy.jpg",
    imageBase: "img/optimized/tabs/vegy",
    imageWidth: 1920,
    imageHeight: 1221,
    alt: "Fresh vegetables prepared for the Fitness meal style",
    weeklyIdeas: Object.freeze([
      Object.freeze({
        title: "Fresh Produce Plate",
        description:
          "A produce-forward combination with vegetables, fruit, whole grains, and a straightforward protein choice.",
      }),
      Object.freeze({
        title: "Everyday Fuel Bowl",
        description:
          "A bright, practical bowl built around vegetables, grains, and a protein source for an active day.",
      }),
    ]),
  }),
  Object.freeze({
    id: "premium",
    label: "Premium",
    image: "img/tabs/elite.jpg",
    imageBase: "img/optimized/tabs/elite",
    imageWidth: 1920,
    imageHeight: 1281,
    alt: "Seafood and fruit for the Premium meal style",
    weeklyIdeas: Object.freeze([
      Object.freeze({
        title: "Seafood & Seasonal Greens",
        description:
          "A richer meal idea pairing seafood with vegetables, fruit, and seasonal ingredients.",
      }),
      Object.freeze({
        title: "Coastal Produce Plate",
        description:
          "A seafood-led combination with fresh produce and a lighter grain or vegetable side.",
      }),
    ]),
  }),
  Object.freeze({
    id: "vegetarian",
    label: "Vegetarian",
    image: "img/tabs/post.jpg",
    imageBase: "img/optimized/tabs/post",
    imageWidth: 1920,
    imageHeight: 1280,
    alt: "Plant-based food for the Vegetarian meal style",
    weeklyIdeas: Object.freeze([
      Object.freeze({
        title: "Plant-Forward Grain Bowl",
        description:
          "A plant-based combination of grains, vegetables, legumes or tofu, herbs, and a simple dressing.",
      }),
      Object.freeze({
        title: "Garden Protein Plate",
        description:
          "Vegetables and whole grains paired with a plant protein source for a balanced meat-free meal.",
      }),
    ]),
  }),
  Object.freeze({
    id: "balanced",
    label: "Balanced",
    image: "img/slider/food-12.jpg",
    imageBase: "img/optimized/slider/food-12",
    imageWidth: 1920,
    imageHeight: 1080,
    alt: "Prepared meal for the Balanced meal style",
    weeklyIdeas: Object.freeze([
      Object.freeze({
        title: "Balanced Everyday Plate",
        description:
          "A practical mix of vegetables, protein, and carbohydrates designed for an uncomplicated everyday meal.",
      }),
      Object.freeze({
        title: "Simple Three-Part Bowl",
        description:
          "A flexible meal idea built from vegetables, a protein source, and a satisfying grain or starch.",
      }),
    ]),
  }),
]);

export function getMealStyle(styleId) {
  return MEAL_STYLES.find(({ id }) => id === styleId) ?? MEAL_STYLES[0];
}

export function getWeeklyMealIdea(styleId, now = new Date()) {
  const style = getMealStyle(styleId);
  const index = Math.abs(getWeeklyCycleIndex(now)) % style.weeklyIdeas.length;

  return {
    styleId: style.id,
    styleLabel: style.label,
    image: style.image,
    imageBase: style.imageBase,
    imageWidth: style.imageWidth,
    imageHeight: style.imageHeight,
    alt: style.alt,
    ...style.weeklyIdeas[index],
  };
}

export function getWeeklyMenu(now = new Date()) {
  return MEAL_STYLES.map(({ id }) => getWeeklyMealIdea(id, now));
}
