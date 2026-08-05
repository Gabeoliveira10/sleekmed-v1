/* ═══════════════════════════════════════════════════════
   foods.js — food database
   Macros are per 100 g unless unit === 'ml'. `serving` is a
   common household portion in the same base unit.
   Values are rounded reference figures for everyday tracking.
   ═══════════════════════════════════════════════════════ */

const F = (name, kcal, p, c, f, serving, servingLabel, group, unit = 'g') =>
  ({ name, kcal, p, c, f, serving, servingLabel, group, unit });

export const FOODS = [
  // ── Protein: meat & poultry ──
  F('Chicken Breast, grilled', 165, 31, 0, 3.6, 150, '1 breast (150 g)', 'protein'),
  F('Chicken Thigh, skinless', 209, 26, 0, 10.9, 120, '1 thigh (120 g)', 'protein'),
  F('Ground Turkey, 93%', 176, 22, 0, 9.4, 113, '4 oz (113 g)', 'protein'),
  F('Ground Beef, 90% lean', 176, 20, 0, 10, 113, '4 oz (113 g)', 'protein'),
  F('Sirloin Steak', 206, 30, 0, 9, 170, '6 oz (170 g)', 'protein'),
  F('Pork Tenderloin', 143, 26, 0, 3.5, 113, '4 oz (113 g)', 'protein'),
  F('Bacon, cooked', 541, 37, 1.4, 42, 16, '2 slices (16 g)', 'protein'),
  F('Deli Turkey', 104, 17, 3, 2.5, 56, '2 oz (56 g)', 'protein'),

  // ── Protein: fish & seafood ──
  F('Salmon, Atlantic', 208, 20, 0, 13, 170, '6 oz fillet (170 g)', 'protein'),
  F('Tuna, canned in water', 116, 26, 0, 0.8, 142, '1 can (142 g)', 'protein'),
  F('Cod', 82, 18, 0, 0.7, 170, '6 oz (170 g)', 'protein'),
  F('Shrimp, cooked', 99, 24, 0.2, 0.3, 113, '4 oz (113 g)', 'protein'),
  F('Tilapia', 129, 26, 0, 2.7, 150, '1 fillet (150 g)', 'protein'),

  // ── Protein: eggs & dairy ──
  F('Whole Egg', 143, 12.6, 0.7, 9.5, 50, '1 large egg (50 g)', 'protein'),
  F('Egg White', 52, 11, 0.7, 0.2, 33, '1 white (33 g)', 'protein'),
  F('Greek Yogurt, 0% fat', 59, 10, 3.6, 0.4, 170, '1 cup (170 g)', 'dairy'),
  F('Greek Yogurt, 2%', 73, 9.9, 4.0, 1.9, 170, '1 cup (170 g)', 'dairy'),
  F('Cottage Cheese, 2%', 84, 11, 4.5, 2.3, 226, '1 cup (226 g)', 'dairy'),
  F('Skim Milk', 34, 3.4, 5, 0.1, 240, '1 cup (240 ml)', 'dairy', 'ml'),
  F('Whole Milk', 61, 3.2, 4.8, 3.3, 240, '1 cup (240 ml)', 'dairy', 'ml'),
  F('Cheddar Cheese', 403, 25, 1.3, 33, 28, '1 slice (28 g)', 'dairy'),
  F('Mozzarella, part-skim', 254, 24, 2.8, 16, 28, '1 oz (28 g)', 'dairy'),
  F('Whey Protein Powder', 380, 78, 8, 4, 31, '1 scoop (31 g)', 'supplement'),
  F('Casein Protein Powder', 360, 74, 8, 2, 33, '1 scoop (33 g)', 'supplement'),

  // ── Protein: plant ──
  F('Tofu, firm', 144, 17, 3, 8, 100, '1/2 block (100 g)', 'protein'),
  F('Tempeh', 192, 20, 8, 11, 85, '3 oz (85 g)', 'protein'),
  F('Edamame, shelled', 121, 12, 9, 5, 155, '1 cup (155 g)', 'protein'),
  F('Black Beans, cooked', 132, 8.9, 24, 0.5, 172, '1 cup (172 g)', 'protein'),
  F('Chickpeas, cooked', 164, 8.9, 27, 2.6, 164, '1 cup (164 g)', 'protein'),
  F('Lentils, cooked', 116, 9, 20, 0.4, 198, '1 cup (198 g)', 'protein'),
  F('Seitan', 141, 25, 14, 2, 100, '100 g', 'protein'),

  // ── Carbs: grains & starches ──
  F('White Rice, cooked', 130, 2.7, 28, 0.3, 158, '1 cup (158 g)', 'carbs'),
  F('Brown Rice, cooked', 123, 2.7, 26, 1, 195, '1 cup (195 g)', 'carbs'),
  F('Jasmine Rice, cooked', 129, 2.7, 28, 0.2, 158, '1 cup (158 g)', 'carbs'),
  F('Quinoa, cooked', 120, 4.4, 21, 1.9, 185, '1 cup (185 g)', 'carbs'),
  F('Oats, dry', 389, 17, 66, 7, 40, '1/2 cup dry (40 g)', 'carbs'),
  F('Sweet Potato, baked', 90, 2, 21, 0.1, 150, '1 medium (150 g)', 'carbs'),
  F('White Potato, baked', 93, 2.5, 21, 0.1, 173, '1 medium (173 g)', 'carbs'),
  F('Pasta, cooked', 158, 5.8, 31, 0.9, 140, '1 cup (140 g)', 'carbs'),
  F('Whole Wheat Bread', 247, 13, 41, 3.4, 28, '1 slice (28 g)', 'carbs'),
  F('White Bread', 265, 9, 49, 3.2, 25, '1 slice (25 g)', 'carbs'),
  F('Bagel, plain', 250, 10, 49, 1.5, 98, '1 bagel (98 g)', 'carbs'),
  F('Tortilla, flour', 306, 8, 51, 7.6, 45, '1 medium (45 g)', 'carbs'),
  F('Tortilla, corn', 218, 5.7, 45, 2.9, 26, '1 tortilla (26 g)', 'carbs'),
  F('Couscous, cooked', 112, 3.8, 23, 0.2, 157, '1 cup (157 g)', 'carbs'),
  F('Rice Cake', 387, 8, 82, 2.8, 9, '1 cake (9 g)', 'carbs'),
  F('Cereal, bran flakes', 350, 10, 80, 2, 40, '1 cup (40 g)', 'carbs'),
  F('Granola', 471, 10, 64, 20, 55, '1/2 cup (55 g)', 'carbs'),

  // ── Fruit ──
  F('Banana', 89, 1.1, 23, 0.3, 118, '1 medium (118 g)', 'fruit'),
  F('Apple', 52, 0.3, 14, 0.2, 182, '1 medium (182 g)', 'fruit'),
  F('Blueberries', 57, 0.7, 14, 0.3, 148, '1 cup (148 g)', 'fruit'),
  F('Strawberries', 32, 0.7, 7.7, 0.3, 152, '1 cup (152 g)', 'fruit'),
  F('Orange', 47, 0.9, 12, 0.1, 131, '1 medium (131 g)', 'fruit'),
  F('Grapes', 69, 0.7, 18, 0.2, 92, '1 cup (92 g)', 'fruit'),
  F('Mango', 60, 0.8, 15, 0.4, 165, '1 cup (165 g)', 'fruit'),
  F('Pineapple', 50, 0.5, 13, 0.1, 165, '1 cup (165 g)', 'fruit'),
  F('Watermelon', 30, 0.6, 7.6, 0.2, 152, '1 cup (152 g)', 'fruit'),
  F('Avocado', 160, 2, 8.5, 15, 100, '1/2 avocado (100 g)', 'fat'),

  // ── Vegetables ──
  F('Broccoli, cooked', 35, 2.4, 7.2, 0.4, 156, '1 cup (156 g)', 'veg'),
  F('Spinach, raw', 23, 2.9, 3.6, 0.4, 30, '1 cup (30 g)', 'veg'),
  F('Asparagus', 20, 2.2, 3.9, 0.1, 134, '1 cup (134 g)', 'veg'),
  F('Green Beans', 31, 1.8, 7, 0.2, 125, '1 cup (125 g)', 'veg'),
  F('Bell Pepper', 31, 1, 6, 0.3, 119, '1 medium (119 g)', 'veg'),
  F('Carrots', 41, 0.9, 10, 0.2, 128, '1 cup (128 g)', 'veg'),
  F('Zucchini', 17, 1.2, 3.1, 0.3, 124, '1 cup (124 g)', 'veg'),
  F('Cauliflower', 25, 1.9, 5, 0.3, 107, '1 cup (107 g)', 'veg'),
  F('Mixed Salad Greens', 17, 1.4, 3.3, 0.2, 85, '3 cups (85 g)', 'veg'),
  F('Tomato', 18, 0.9, 3.9, 0.2, 123, '1 medium (123 g)', 'veg'),
  F('Mushrooms', 22, 3.1, 3.3, 0.3, 70, '1 cup (70 g)', 'veg'),
  F('Onion', 40, 1.1, 9.3, 0.1, 110, '1 medium (110 g)', 'veg'),
  F('Brussels Sprouts', 43, 3.4, 9, 0.3, 156, '1 cup (156 g)', 'veg'),

  // ── Fats & nuts ──
  F('Almonds', 579, 21, 22, 50, 28, '1 oz / 23 nuts (28 g)', 'fat'),
  F('Peanut Butter', 588, 25, 20, 50, 32, '2 tbsp (32 g)', 'fat'),
  F('Almond Butter', 614, 21, 19, 56, 32, '2 tbsp (32 g)', 'fat'),
  F('Walnuts', 654, 15, 14, 65, 28, '1 oz (28 g)', 'fat'),
  F('Cashews', 553, 18, 30, 44, 28, '1 oz (28 g)', 'fat'),
  F('Olive Oil', 884, 0, 0, 100, 14, '1 tbsp (14 g)', 'fat'),
  F('Butter', 717, 0.9, 0.1, 81, 14, '1 tbsp (14 g)', 'fat'),
  F('Chia Seeds', 486, 17, 42, 31, 28, '2 tbsp (28 g)', 'fat'),
  F('Flaxseed, ground', 534, 18, 29, 42, 14, '2 tbsp (14 g)', 'fat'),
  F('Coconut Oil', 862, 0, 0, 100, 14, '1 tbsp (14 g)', 'fat'),

  // ── Condiments & extras ──
  F('Hummus', 166, 8, 14, 10, 30, '2 tbsp (30 g)', 'other'),
  F('Ketchup', 101, 1.2, 26, 0.1, 17, '1 tbsp (17 g)', 'other'),
  F('Mayonnaise', 680, 1, 0.6, 75, 14, '1 tbsp (14 g)', 'other'),
  F('Ranch Dressing', 430, 1, 6, 45, 30, '2 tbsp (30 g)', 'other'),
  F('Soy Sauce', 53, 8, 4.9, 0.6, 16, '1 tbsp (16 ml)', 'other', 'ml'),
  F('Hot Sauce', 12, 0.5, 1.8, 0.4, 5, '1 tsp (5 ml)', 'other', 'ml'),
  F('Honey', 304, 0.3, 82, 0, 21, '1 tbsp (21 g)', 'other'),
  F('Maple Syrup', 260, 0, 67, 0.1, 20, '1 tbsp (20 g)', 'other'),
  F('Salsa', 36, 1.5, 7, 0.2, 36, '2 tbsp (36 g)', 'other'),

  // ── Drinks ──
  F('Black Coffee', 2, 0.3, 0, 0, 240, '1 cup (240 ml)', 'drink', 'ml'),
  F('Latte, whole milk', 56, 3, 5.3, 3, 350, '12 oz (350 ml)', 'drink', 'ml'),
  F('Orange Juice', 45, 0.7, 10, 0.2, 240, '1 cup (240 ml)', 'drink', 'ml'),
  F('Beer, regular', 43, 0.5, 3.6, 0, 355, '1 bottle (355 ml)', 'drink', 'ml'),
  F('Red Wine', 85, 0.1, 2.6, 0, 148, '1 glass (148 ml)', 'drink', 'ml'),
  F('Cola', 42, 0, 10.6, 0, 355, '1 can (355 ml)', 'drink', 'ml'),
  F('Diet Cola', 0.4, 0, 0.1, 0, 355, '1 can (355 ml)', 'drink', 'ml'),
  F('Sports Drink', 26, 0, 6.6, 0, 500, '1 bottle (500 ml)', 'drink', 'ml'),
  F('Almond Milk, unsweetened', 15, 0.6, 0.6, 1.2, 240, '1 cup (240 ml)', 'drink', 'ml'),
  F('Oat Milk', 47, 1.3, 7.9, 1.5, 240, '1 cup (240 ml)', 'drink', 'ml'),

  // ── Common prepared / restaurant ──
  F('Cheese Pizza, slice', 266, 11, 33, 10, 107, '1 slice (107 g)', 'meal'),
  F('Cheeseburger, fast food', 254, 13, 25, 12, 165, '1 burger (165 g)', 'meal'),
  F('French Fries', 312, 3.4, 41, 15, 117, 'medium (117 g)', 'meal'),
  F('Chicken Burrito', 206, 11, 24, 7.5, 350, '1 burrito (350 g)', 'meal'),
  F('Caesar Salad w/ chicken', 158, 12, 5, 10, 300, '1 bowl (300 g)', 'meal'),
  F('Sushi Roll, salmon avocado', 145, 6, 21, 4, 170, '1 roll (170 g)', 'meal'),
  F('Pad Thai', 181, 8, 24, 6, 400, '1 plate (400 g)', 'meal'),
  F('Chicken Noodle Soup', 36, 2.4, 4.2, 1.1, 240, '1 cup (240 g)', 'meal'),
  F('Protein Bar', 375, 30, 38, 11, 60, '1 bar (60 g)', 'snack'),
  F('Dark Chocolate 70%', 598, 7.8, 46, 43, 30, '3 squares (30 g)', 'snack'),
  F('Potato Chips', 536, 7, 53, 34, 28, '1 oz (28 g)', 'snack'),
  F('Popcorn, air-popped', 387, 13, 78, 4.5, 24, '3 cups (24 g)', 'snack'),
  F('Trail Mix', 462, 14, 45, 29, 40, '1/4 cup (40 g)', 'snack'),
  F('Ice Cream, vanilla', 207, 3.5, 24, 11, 66, '1/2 cup (66 g)', 'snack'),
  F('Cookie, chocolate chip', 488, 5.6, 64, 24, 30, '1 cookie (30 g)', 'snack')
];

export const FOOD_GROUPS = {
  protein: { label: 'Protein', emoji: '🍗' },
  carbs: { label: 'Carbs & grains', emoji: '🍚' },
  dairy: { label: 'Dairy', emoji: '🥛' },
  fruit: { label: 'Fruit', emoji: '🍎' },
  veg: { label: 'Vegetables', emoji: '🥦' },
  fat: { label: 'Fats & nuts', emoji: '🥑' },
  meal: { label: 'Meals', emoji: '🍽️' },
  snack: { label: 'Snacks', emoji: '🍫' },
  drink: { label: 'Drinks', emoji: '☕' },
  supplement: { label: 'Supplements', emoji: '💊' },
  other: { label: 'Condiments', emoji: '🧂' }
};

/** Scale a food's per-100 macros to an arbitrary amount. */
export function scaleFood(food, amount) {
  const r = amount / 100;
  return {
    name: food.name,
    kcal: Math.round(food.kcal * r),
    protein: Math.round(food.p * r * 10) / 10,
    carbs: Math.round(food.c * r * 10) / 10,
    fat: Math.round(food.f * r * 10) / 10,
    amount,
    unit: food.unit || 'g'
  };
}

export function searchFoods(query, customFoods = []) {
  const q = query.trim().toLowerCase();
  const all = [...customFoods, ...FOODS];
  if (!q) return all.slice(0, 40);
  const starts = [];
  const contains = [];
  for (const f of all) {
    const n = f.name.toLowerCase();
    if (n.startsWith(q)) starts.push(f);
    else if (n.includes(q)) contains.push(f);
  }
  return [...starts, ...contains].slice(0, 40);
}
