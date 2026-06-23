import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { buildMealPlanPrompt } from '@/lib/ai/meal-plan'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { weekStartDate, lastWeekMealNames = [] } = await request.json()

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('calorie_target, protein_g, carbs_g, fat_g')
    .eq('id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const prompt = buildMealPlanPrompt({
    calorieTarget: profile.calorie_target,
    proteinG: profile.protein_g,
    carbsG: profile.carbs_g,
    fatG: profile.fat_g,
    lastWeekMealNames,
  })

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8192,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    return NextResponse.json({ error: 'Unexpected response type' }, { status: 500 })
  }

  let parsed: MealPlanResponse
  try {
    // Strip markdown code fences if present
    const jsonText = content.text.replace(/^```json?\n?/, '').replace(/\n?```$/, '')
    parsed = JSON.parse(jsonText) as MealPlanResponse
  } catch {
    return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
  }

  // Delete existing plan for this week if regenerating
  await supabase
    .from('meal_plans')
    .delete()
    .eq('user_id', user.id)
    .eq('week_start_date', weekStartDate)

  const { data: mealPlan, error: planError } = await supabase
    .from('meal_plans')
    .insert({ user_id: user.id, week_start_date: weekStartDate })
    .select()
    .single()

  if (planError || !mealPlan) {
    return NextResponse.json({ error: 'Failed to save meal plan' }, { status: 500 })
  }

  const mealsToInsert = parsed.days.flatMap((day) =>
    Object.entries(day.meals).map(([mealType, meal]) => ({
      meal_plan_id: mealPlan.id,
      day_of_week: day.day,
      meal_type: mealType,
      name: meal.name,
      recipe: 'recipe' in meal ? meal.recipe ?? null : null,
      ingredients: 'ingredients' in meal ? meal.ingredients ?? null : null,
      preparation: 'preparation' in meal ? meal.preparation ?? null : null,
      calories: meal.calories,
      protein_g: meal.protein_g ?? null,
      carbs_g: meal.carbs_g ?? null,
      fat_g: meal.fat_g ?? null,
    }))
  )

  await supabase.from('meals').insert(mealsToInsert)

  const groceryItems = (Object.entries(parsed.grocery_list) as [string, GroceryItem[]][]).flatMap(
    ([category, items]) =>
      items.map((item) => ({ ...item, category }))
  )

  await supabase.from('grocery_lists').insert({
    meal_plan_id: mealPlan.id,
    user_id: user.id,
    items: groceryItems,
  })

  return NextResponse.json({ mealPlanId: mealPlan.id })
}

// --- Local types for parsed AI response ---

interface MealBase {
  name: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
}

interface RegularMeal extends MealBase {
  recipe: string
  ingredients: string[]
}

interface DrinkMeal extends MealBase {
  preparation: string
}

interface DayMeals {
  breakfast: RegularMeal
  lunch: RegularMeal
  dinner: RegularMeal
  drink: DrinkMeal
}

interface Day {
  day: number
  meals: DayMeals
}

interface GroceryItem {
  name: string
  quantity: string
  unit: string
}

interface GroceryList {
  produce: GroceryItem[]
  proteins: GroceryItem[]
  pantry: GroceryItem[]
  dairy: GroceryItem[]
  other: GroceryItem[]
}

interface MealPlanResponse {
  days: Day[]
  grocery_list: GroceryList
}
