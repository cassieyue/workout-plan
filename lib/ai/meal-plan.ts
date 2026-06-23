export function buildMealPlanPrompt(params: {
  calorieTarget: number
  proteinG: number
  carbsG: number
  fatG: number
  lastWeekMealNames: string[]
}): string {
  const avoid = params.lastWeekMealNames.length > 0
    ? `Do NOT repeat these meals from last week: ${params.lastWeekMealNames.join(', ')}.`
    : ''

  return `Generate a 7-day meal plan (Monday=day 1 through Sunday=day 7) for a 20-year-old woman.

NUTRITIONAL TARGETS per day (for 3 meals only; drink is separate):
- Calories: ${params.calorieTarget} kcal
- Protein: ${params.proteinG}g
- Carbs: ${params.carbsG}g
- Fat: ${params.fatG}g

CUISINE: High-protein, Asian-inspired. Prioritize Korean (bibimbap, bulgogi, japchae, sundubu jjigae, dakgalbi). Mix in Japanese (teriyaki, miso soup, salmon rice bowls), Chinese (stir-fries, egg fried rice), and Thai (pad see ew, larb gai). Use common grocery store ingredients. ${avoid}

DRINK per day (NOT counted in the 3 meals above): Choose from ONLY these options:
- Matcha latte (iced or hot, with oat milk or regular milk)
- Latte (espresso with steamed milk)
- Tea with sweetener (jasmine, green, or oolong)
Vary the drink each day. Include preparation details (e.g., "Iced matcha latte: 1 tsp matcha, 1 cup oat milk, 1 tsp honey over ice"). Calories: 50–150 kcal.

Return ONLY a valid JSON object with this exact structure:
{
  "days": [
    {
      "day": 1,
      "meals": {
        "breakfast": { "name": "string", "recipe": "string", "ingredients": ["string"], "calories": number, "protein_g": number, "carbs_g": number, "fat_g": number },
        "lunch": { "name": "string", "recipe": "string", "ingredients": ["string"], "calories": number, "protein_g": number, "carbs_g": number, "fat_g": number },
        "dinner": { "name": "string", "recipe": "string", "ingredients": ["string"], "calories": number, "protein_g": number, "carbs_g": number, "fat_g": number },
        "drink": { "name": "string", "preparation": "string", "calories": number, "protein_g": number, "carbs_g": number, "fat_g": number }
      }
    }
  ],
  "grocery_list": {
    "produce": [{ "name": "string", "quantity": "string", "unit": "string" }],
    "proteins": [{ "name": "string", "quantity": "string", "unit": "string" }],
    "pantry": [{ "name": "string", "quantity": "string", "unit": "string" }],
    "dairy": [{ "name": "string", "quantity": "string", "unit": "string" }],
    "other": [{ "name": "string", "quantity": "string", "unit": "string" }]
  }
}`
}
