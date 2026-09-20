function freezePlan(plan) {
  return Object.freeze({
    ...plan,
    meals: Object.freeze(plan.meals.map((meal) => Object.freeze(meal))),
    shopping: Object.freeze([...plan.shopping]),
  });
}

function freezeApproach(style) {
  return Object.freeze({
    ...style,
    weeklyPlans: Object.freeze(style.weeklyPlans.map(freezePlan)),
  });
}

export const MEAL_APPROACHES = Object.freeze([
  freezeApproach({
    id: "whole-food",
    label: "Whole-Food",
    image: "img/tabs/vegy.jpg",
    imageBase: "img/optimized/tabs/vegy",
    imageWidth: 1920,
    imageHeight: 1221,
    alt: "Fresh vegetables for the Whole-Food meal approach",
    tabDescription:
      "Simple meals built around vegetables, fruit, grains, legumes, and straightforward protein choices.",
    weeklyPlans: [
      {
        title: "Fresh Staples",
        summary:
          "A flexible day built from familiar ingredients that can be mixed, matched, and reused.",
        meals: [
          {
            slot: "Morning",
            title: "Oats, fruit & yogurt",
            description:
              "Oats with seasonal fruit and yogurt or a plant-based alternative.",
          },
          {
            slot: "Midday",
            title: "Chickpea grain bowl",
            description:
              "A grain, chickpeas, crunchy vegetables, herbs, and a simple dressing.",
          },
          {
            slot: "Evening",
            title: "Sheet-pan vegetables & protein",
            description:
              "Roasted vegetables with potatoes plus chicken, tofu, beans, or another familiar protein.",
          },
        ],
        shopping: ["oats", "seasonal fruit", "yogurt or alternative", "chickpeas", "whole grain", "mixed vegetables"],
      },
      {
        title: "Simple Pantry Day",
        summary:
          "A low-friction set that leans on pantry staples and ingredients that work in more than one meal.",
        meals: [
          {
            slot: "Morning",
            title: "Toast, eggs or tofu & tomatoes",
            description:
              "Whole-grain toast with a simple protein choice and sliced tomatoes.",
          },
          {
            slot: "Midday",
            title: "Lentil vegetable soup",
            description:
              "Lentils, vegetables, and herbs with bread or another grain on the side.",
          },
          {
            slot: "Evening",
            title: "Rice, greens & protein",
            description:
              "Rice with sautéed greens and a protein you already enjoy.",
          },
        ],
        shopping: ["whole-grain bread", "tomatoes", "lentils", "rice", "leafy greens", "eggs or tofu"],
      },
      {
        title: "Colorful Produce",
        summary:
          "A produce-forward day that keeps the structure simple and lets seasonal ingredients do the work.",
        meals: [
          {
            slot: "Morning",
            title: "Fruit, oats & seeds",
            description:
              "Oats topped with fruit and seeds, served warm or prepared overnight.",
          },
          {
            slot: "Midday",
            title: "Roasted vegetable wrap",
            description:
              "Roasted vegetables, hummus, and greens wrapped in a whole-grain flatbread.",
          },
          {
            slot: "Evening",
            title: "Vegetable tray & grain",
            description:
              "A large tray of roasted vegetables with a grain and an easy protein choice.",
          },
        ],
        shopping: ["oats", "fruit", "seeds", "hummus", "flatbread", "roasting vegetables"],
      },
      {
        title: "Mix-and-Match Basics",
        summary:
          "Three adaptable meals designed around ingredients that can be swapped without rebuilding the day.",
        meals: [
          {
            slot: "Morning",
            title: "Yogurt, banana & oats",
            description:
              "A quick bowl using yogurt or an alternative, banana, oats, and optional seeds.",
          },
          {
            slot: "Midday",
            title: "Bean & vegetable plate",
            description:
              "Beans with vegetables, a grain or bread, and a simple herb dressing.",
          },
          {
            slot: "Evening",
            title: "One-pan grain & vegetables",
            description:
              "Cooked grain folded through vegetables with your preferred protein source.",
          },
        ],
        shopping: ["banana", "oats", "beans", "mixed vegetables", "grain", "fresh herbs"],
      },
    ],
  }),
  freezeApproach({
    id: "mediterranean",
    label: "Mediterranean",
    image: "img/tabs/elite.jpg",
    imageBase: "img/optimized/tabs/elite",
    imageWidth: 1920,
    imageHeight: 1281,
    alt: "Seafood, fruit, and vegetables for the Mediterranean meal approach",
    tabDescription:
      "Vegetables, legumes, grains, olive oil, herbs, and optional seafood in a Mediterranean-inspired rhythm.",
    weeklyPlans: [
      {
        title: "Coastal Basics",
        summary:
          "A Mediterranean-inspired day with simple produce, grains, legumes, and an optional seafood dinner.",
        meals: [
          {
            slot: "Morning",
            title: "Yogurt, fruit & nuts",
            description:
              "Plain yogurt or an alternative with fruit, nuts, and a small spoon of oats.",
          },
          {
            slot: "Midday",
            title: "Tomato chickpea salad",
            description:
              "Chickpeas, tomatoes, cucumber, herbs, and olive oil with bread or a grain.",
          },
          {
            slot: "Evening",
            title: "Fish or beans with potatoes & greens",
            description:
              "Baked fish or white beans with potatoes, greens, lemon, and herbs.",
          },
        ],
        shopping: ["fruit", "nuts", "chickpeas", "tomatoes", "cucumber", "potatoes", "greens"],
      },
      {
        title: "Herbs, Grains & Greens",
        summary:
          "A flexible set where herbs, vegetables, grains, and olive oil create most of the variation.",
        meals: [
          {
            slot: "Morning",
            title: "Whole-grain toast & tomatoes",
            description:
              "Toast with tomatoes, herbs, and a side of fruit or yogurt.",
          },
          {
            slot: "Midday",
            title: "Lentil herb bowl",
            description:
              "Lentils, grain, chopped vegetables, herbs, lemon, and olive oil.",
          },
          {
            slot: "Evening",
            title: "Roasted vegetables with couscous",
            description:
              "Roasted vegetables over couscous with beans, fish, or another preferred protein.",
          },
        ],
        shopping: ["whole-grain bread", "tomatoes", "lentils", "fresh herbs", "couscous", "roasting vegetables"],
      },
      {
        title: "Mediterranean Pantry",
        summary:
          "A practical pantry-led day using beans, grains, canned tomatoes, herbs, and fresh produce.",
        meals: [
          {
            slot: "Morning",
            title: "Oats with citrus & nuts",
            description:
              "Oats with orange or another fruit, nuts, and yogurt or an alternative.",
          },
          {
            slot: "Midday",
            title: "White bean tomato toast",
            description:
              "White beans and tomatoes spooned over toast with herbs and olive oil.",
          },
          {
            slot: "Evening",
            title: "Tomato grain skillet",
            description:
              "A grain-based skillet with tomatoes, vegetables, olives, and a protein choice.",
          },
        ],
        shopping: ["oats", "citrus fruit", "white beans", "canned tomatoes", "olives", "whole grain"],
      },
      {
        title: "Bright & Simple",
        summary:
          "Fresh produce and straightforward meals with lemon, herbs, and olive oil doing the flavor work.",
        meals: [
          {
            slot: "Morning",
            title: "Fruit & yogurt bowl",
            description:
              "Fruit with yogurt or an alternative, oats, and a few nuts or seeds.",
          },
          {
            slot: "Midday",
            title: "Hummus vegetable plate",
            description:
              "Hummus, vegetables, olives, and whole-grain bread or pita.",
          },
          {
            slot: "Evening",
            title: "Lemon herb tray bake",
            description:
              "Vegetables and potatoes roasted with lemon and herbs plus fish, tofu, or beans.",
          },
        ],
        shopping: ["fruit", "hummus", "olives", "whole-grain pita", "lemon", "potatoes", "vegetables"],
      },
    ],
  }),
  freezeApproach({
    id: "plant-based",
    label: "Plant-Based",
    image: "img/tabs/post.jpg",
    imageBase: "img/optimized/tabs/post",
    imageWidth: 1920,
    imageHeight: 1280,
    alt: "Plant-based ingredients for the Plant-Based meal approach",
    tabDescription:
      "Meals centered on vegetables, grains, legumes, tofu, nuts, seeds, herbs, and other plant foods.",
    weeklyPlans: [
      {
        title: "Plant-Powered Basics",
        summary:
          "A practical plant-based day built from oats, legumes, vegetables, grains, and tofu.",
        meals: [
          {
            slot: "Morning",
            title: "Overnight oats & berries",
            description:
              "Oats with berries, chia or seeds, and a plant-based milk or yogurt.",
          },
          {
            slot: "Midday",
            title: "Lentil grain bowl",
            description:
              "Lentils, grain, vegetables, herbs, and a tahini or lemon dressing.",
          },
          {
            slot: "Evening",
            title: "Tofu vegetable stir-fry",
            description:
              "Tofu with vegetables and rice or noodles in a simple savory sauce.",
          },
        ],
        shopping: ["oats", "berries", "lentils", "whole grain", "tofu", "stir-fry vegetables"],
      },
      {
        title: "Beans, Greens & Grains",
        summary:
          "A low-complexity plant-based set with ingredients that carry across the whole day.",
        meals: [
          {
            slot: "Morning",
            title: "Banana oat bowl",
            description:
              "Oats with banana, nut or seed butter, and optional cinnamon.",
          },
          {
            slot: "Midday",
            title: "Black bean wrap",
            description:
              "Black beans, vegetables, greens, and salsa in a whole-grain wrap.",
          },
          {
            slot: "Evening",
            title: "Chickpea tomato stew",
            description:
              "Chickpeas simmered with tomatoes and vegetables, served with rice or bread.",
          },
        ],
        shopping: ["banana", "oats", "black beans", "wraps", "chickpeas", "canned tomatoes", "greens"],
      },
      {
        title: "Colorful Plant Day",
        summary:
          "Produce-forward meals with different textures and a clear plant protein source at midday and evening.",
        meals: [
          {
            slot: "Morning",
            title: "Fruit, seeds & plant yogurt",
            description:
              "Plant yogurt with fruit, oats, and seeds for an easy cold breakfast.",
          },
          {
            slot: "Midday",
            title: "Hummus roasted-veg bowl",
            description:
              "Roasted vegetables with hummus, grain, greens, and herbs.",
          },
          {
            slot: "Evening",
            title: "Bean & vegetable tacos",
            description:
              "Beans, sautéed vegetables, cabbage, and salsa in soft tortillas.",
          },
        ],
        shopping: ["plant yogurt", "fruit", "hummus", "grain", "beans", "tortillas", "cabbage"],
      },
      {
        title: "Plant Pantry Reset",
        summary:
          "A pantry-friendly set that keeps prep simple with lentils, beans, grains, and frozen or fresh vegetables.",
        meals: [
          {
            slot: "Morning",
            title: "Warm apple oats",
            description:
              "Oats with chopped apple, cinnamon, and a spoon of seeds or nut butter.",
          },
          {
            slot: "Midday",
            title: "Lentil tomato soup",
            description:
              "Lentils and tomatoes with vegetables, served with bread or a grain.",
          },
          {
            slot: "Evening",
            title: "Bean rice skillet",
            description:
              "Beans and rice cooked with vegetables, herbs, and a simple tomato base.",
          },
        ],
        shopping: ["apples", "oats", "lentils", "canned tomatoes", "beans", "rice", "mixed vegetables"],
      },
    ],
  }),
  freezeApproach({
    id: "balanced",
    label: "Balanced",
    image: "img/slider/food-12.jpg",
    imageBase: "img/optimized/slider/food-12",
    imageWidth: 1920,
    imageHeight: 1080,
    alt: "Prepared meal for the Balanced meal approach",
    tabDescription:
      "Flexible everyday meals that combine vegetables, a protein source, and a satisfying grain or starch.",
    weeklyPlans: [
      {
        title: "Everyday Balanced",
        summary:
          "A flexible day with familiar meals and room to swap ingredients without changing the whole plan.",
        meals: [
          {
            slot: "Morning",
            title: "Eggs or tofu, toast & fruit",
            description:
              "A simple protein choice with whole-grain toast and fruit on the side.",
          },
          {
            slot: "Midday",
            title: "Chicken or tofu grain bowl",
            description:
              "Grain, vegetables, and chicken or tofu with a dressing you already like.",
          },
          {
            slot: "Evening",
            title: "Salmon or beans, rice & vegetables",
            description:
              "A flexible plate using rice, vegetables, and either fish or beans.",
          },
        ],
        shopping: ["whole-grain bread", "fruit", "grain", "mixed vegetables", "tofu or chicken", "rice", "beans or fish"],
      },
      {
        title: "Busy-Day Basics",
        summary:
          "Simple meals with repeat ingredients so the day is easier to shop for and assemble.",
        meals: [
          {
            slot: "Morning",
            title: "Yogurt, oats & banana",
            description:
              "Yogurt or an alternative with oats, banana, and optional seeds.",
          },
          {
            slot: "Midday",
            title: "Turkey, bean or tofu wrap",
            description:
              "A whole-grain wrap with vegetables and a straightforward protein choice.",
          },
          {
            slot: "Evening",
            title: "One-pan potatoes, vegetables & protein",
            description:
              "Roasted potatoes and vegetables with chicken, tofu, beans, or fish.",
          },
        ],
        shopping: ["yogurt or alternative", "oats", "banana", "whole-grain wraps", "vegetables", "potatoes", "protein choice"],
      },
      {
        title: "Simple Bowl Day",
        summary:
          "Three meals with a clear structure and ingredients that can be prepared in batches.",
        meals: [
          {
            slot: "Morning",
            title: "Oats, berries & seeds",
            description:
              "Warm or overnight oats with berries and seeds.",
          },
          {
            slot: "Midday",
            title: "Rice, vegetables & protein bowl",
            description:
              "Rice with vegetables and beans, tofu, chicken, or another familiar protein.",
          },
          {
            slot: "Evening",
            title: "Pasta, greens & tomato",
            description:
              "Pasta with tomatoes, greens, and beans, fish, or another protein choice.",
          },
        ],
        shopping: ["oats", "berries", "rice", "mixed vegetables", "pasta", "tomatoes", "leafy greens"],
      },
      {
        title: "Flexible Family Table",
        summary:
          "A familiar set designed so components can be served separately or combined depending on preference.",
        meals: [
          {
            slot: "Morning",
            title: "Toast, fruit & protein",
            description:
              "Whole-grain toast, fruit, and eggs, yogurt, tofu, or another preferred protein.",
          },
          {
            slot: "Midday",
            title: "Build-your-own lunch bowl",
            description:
              "Set out a grain, vegetables, and one or two protein choices to mix and match.",
          },
          {
            slot: "Evening",
            title: "Taco-style dinner",
            description:
              "Tortillas with vegetables, beans, and optional chicken or another protein choice.",
          },
        ],
        shopping: ["whole-grain toast", "fruit", "grain", "vegetables", "beans", "tortillas", "protein choice"],
      },
    ],
  }),
]);
