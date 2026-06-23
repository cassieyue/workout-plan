import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const MOCK_MEAL_PLAN: MealPlanResponse = {
  days: [
    {
      day: 1,
      meals: {
        breakfast: {
          name: 'Korean Egg Fried Rice',
          recipe: 'Cook rice, scramble eggs with soy sauce, mix together',
          ingredients: ['cooked rice', 'eggs', 'soy sauce', 'sesame oil'],
          calories: 450,
          protein_g: 12,
          carbs_g: 65,
          fat_g: 15,
        },
        lunch: {
          name: 'Bibimbap',
          recipe: 'Layer vegetables and beef over rice, top with gochujang sauce',
          ingredients: ['beef', 'rice', 'spinach', 'carrots', 'mushrooms', 'gochujang'],
          calories: 580,
          protein_g: 28,
          carbs_g: 68,
          fat_g: 16,
        },
        dinner: {
          name: 'Grilled Salmon with Teriyaki Glaze',
          recipe: 'Grill salmon, brush with teriyaki sauce in last 2 minutes',
          ingredients: ['salmon fillet', 'soy sauce', 'mirin', 'ginger', 'garlic'],
          calories: 520,
          protein_g: 42,
          carbs_g: 15,
          fat_g: 28,
        },
        drink: {
          name: 'Iced Matcha Latte',
          preparation: '1 tsp matcha, 1 cup oat milk, 1 tsp honey over ice',
          calories: 90,
          protein_g: 2,
          carbs_g: 12,
          fat_g: 3,
        },
      },
    },
    {
      day: 2,
      meals: {
        breakfast: {
          name: 'Miso Soup with Tofu',
          recipe: 'Heat dashi, add miso paste, add tofu and seaweed',
          ingredients: ['dashi', 'miso', 'tofu', 'seaweed', 'green onion'],
          calories: 320,
          protein_g: 16,
          carbs_g: 28,
          fat_g: 12,
        },
        lunch: {
          name: 'Thai Larb Gai',
          recipe: 'Brown ground chicken, add lime juice, fish sauce, herbs',
          ingredients: ['ground chicken', 'lime', 'fish sauce', 'mint', 'cilantro', 'lettuce'],
          calories: 480,
          protein_g: 35,
          carbs_g: 18,
          fat_g: 28,
        },
        dinner: {
          name: 'Japchae (Sweet Potato Noodles)',
          recipe: 'Stir-fry cooked noodles with vegetables and soy sauce',
          ingredients: ['sweet potato noodles', 'spinach', 'carrots', 'mushrooms', 'soy sauce', 'sesame oil'],
          calories: 520,
          protein_g: 18,
          carbs_g: 72,
          fat_g: 14,
        },
        drink: {
          name: 'Hot Latte',
          preparation: '1 shot espresso, 1 cup steamed milk',
          calories: 120,
          protein_g: 8,
          carbs_g: 10,
          fat_g: 4,
        },
      },
    },
    {
      day: 3,
      meals: {
        breakfast: {
          name: 'Bulgogi Rice Bowl',
          recipe: 'Marinate beef in soy-ginger sauce, grill, serve over rice',
          ingredients: ['beef', 'soy sauce', 'ginger', 'garlic', 'rice', 'green onion'],
          calories: 580,
          protein_g: 32,
          carbs_g: 62,
          fat_g: 18,
        },
        lunch: {
          name: 'Vietnamese Pho',
          recipe: 'Simmer broth, add noodles and beef, top with herbs',
          ingredients: ['beef broth', 'rice noodles', 'beef', 'basil', 'cilantro', 'lime'],
          calories: 450,
          protein_g: 28,
          carbs_g: 52,
          fat_g: 12,
        },
        dinner: {
          name: 'Stir-Fried Broccoli with Tofu',
          recipe: 'Stir-fry tofu and broccoli in garlic-soy sauce',
          ingredients: ['tofu', 'broccoli', 'garlic', 'soy sauce', 'sesame oil', 'ginger'],
          calories: 380,
          protein_g: 24,
          carbs_g: 32,
          fat_g: 18,
        },
        drink: {
          name: 'Jasmine Tea',
          preparation: 'Brew jasmine tea, add 1 tsp honey',
          calories: 50,
          protein_g: 0,
          carbs_g: 12,
          fat_g: 0,
        },
      },
    },
    {
      day: 4,
      meals: {
        breakfast: {
          name: 'Sundubu Jjigae (Soft Tofu Stew)',
          recipe: 'Simmer soft tofu with vegetables and gochugaru in anchovy broth',
          ingredients: ['soft tofu', 'gochugaru', 'anchovy broth', 'mushrooms', 'zucchini', 'eggs'],
          calories: 420,
          protein_g: 20,
          carbs_g: 35,
          fat_g: 18,
        },
        lunch: {
          name: 'Pad See Ew (Thai Wide Noodle Stir-Fry)',
          recipe: 'Stir-fry wide noodles with chicken and soy sauce',
          ingredients: ['wide rice noodles', 'chicken', 'soy sauce', 'garlic', 'broccoli'],
          calories: 520,
          protein_g: 32,
          carbs_g: 62,
          fat_g: 14,
        },
        dinner: {
          name: 'Korean Dakgalbi (Spicy Chicken)',
          recipe: 'Marinate chicken in gochujang, stir-fry with vegetables',
          ingredients: ['chicken breast', 'gochujang', 'garlic', 'sweet potato', 'green onion'],
          calories: 480,
          protein_g: 38,
          carbs_g: 42,
          fat_g: 12,
        },
        drink: {
          name: 'Oolong Tea',
          preparation: 'Brew oolong tea, no sweetener',
          calories: 0,
          protein_g: 0,
          carbs_g: 0,
          fat_g: 0,
        },
      },
    },
    {
      day: 5,
      meals: {
        breakfast: {
          name: 'Chinese Egg Fried Rice with Sausage',
          recipe: 'Stir-fry rice with diced sausage, peas, and soy sauce',
          ingredients: ['cooked rice', 'chinese sausage', 'peas', 'soy sauce', 'eggs'],
          calories: 580,
          protein_g: 22,
          carbs_g: 68,
          fat_g: 20,
        },
        lunch: {
          name: 'Salmon Teriyaki Bowl',
          recipe: 'Grill salmon, glaze with teriyaki, serve over steamed rice',
          ingredients: ['salmon', 'soy sauce', 'mirin', 'rice', 'sesame seeds'],
          calories: 560,
          protein_g: 38,
          carbs_g: 58,
          fat_g: 16,
        },
        dinner: {
          name: 'Mixed Vegetable Stir-Fry with Beef',
          recipe: 'Stir-fry beef and vegetables in garlic-soy sauce',
          ingredients: ['beef', 'bell peppers', 'mushrooms', 'onions', 'garlic', 'soy sauce'],
          calories: 480,
          protein_g: 32,
          carbs_g: 38,
          fat_g: 18,
        },
        drink: {
          name: 'Matcha Latte (Hot)',
          preparation: '1 tsp matcha, 1 cup steamed milk, 1 tsp honey',
          calories: 110,
          protein_g: 8,
          carbs_g: 12,
          fat_g: 3,
        },
      },
    },
    {
      day: 6,
      meals: {
        breakfast: {
          name: 'Korean Kimchi Fried Rice',
          recipe: 'Stir-fry rice with kimchi, bacon, and egg',
          ingredients: ['cooked rice', 'kimchi', 'bacon', 'eggs', 'soy sauce'],
          calories: 580,
          protein_g: 20,
          carbs_g: 65,
          fat_g: 22,
        },
        lunch: {
          name: 'Bento Box: Chicken Teriyaki',
          recipe: 'Grill chicken breast, glaze with teriyaki, serve with rice and vegetables',
          ingredients: ['chicken breast', 'soy sauce', 'mirin', 'rice', 'broccoli'],
          calories: 520,
          protein_g: 40,
          carbs_g: 55,
          fat_g: 12,
        },
        dinner: {
          name: 'Spicy Tuna Roll with Rice',
          recipe: 'Mix canned tuna with sriracha, mayo, serve with rice',
          ingredients: ['canned tuna', 'sriracha', 'mayo', 'rice', 'cucumber'],
          calories: 480,
          protein_g: 32,
          carbs_g: 58,
          fat_g: 12,
        },
        drink: {
          name: 'Green Tea',
          preparation: 'Brew green tea, no sweetener',
          calories: 0,
          protein_g: 0,
          carbs_g: 0,
          fat_g: 0,
        },
      },
    },
    {
      day: 7,
      meals: {
        breakfast: {
          name: 'Congee with Century Egg',
          recipe: 'Simmer rice in broth until creamy, top with century egg and ginger',
          ingredients: ['rice', 'broth', 'century egg', 'ginger', 'green onion'],
          calories: 420,
          protein_g: 14,
          carbs_g: 62,
          fat_g: 10,
        },
        lunch: {
          name: 'Korean Bibim Guksu (Mixed Noodles)',
          recipe: 'Toss noodles with gochujang sauce and vegetables',
          ingredients: ['wheat noodles', 'gochujang', 'cucumber', 'carrot', 'spinach', 'sesame'],
          calories: 500,
          protein_g: 18,
          carbs_g: 72,
          fat_g: 12,
        },
        dinner: {
          name: 'Grilled Fish with Lemon Butter',
          recipe: 'Grill white fish, finish with lemon and butter',
          ingredients: ['white fish', 'lemon', 'butter', 'garlic', 'herbs'],
          calories: 420,
          protein_g: 40,
          carbs_g: 8,
          fat_g: 22,
        },
        drink: {
          name: 'Iced Latte',
          preparation: '2 shots espresso, 1 cup oat milk over ice',
          calories: 140,
          protein_g: 3,
          carbs_g: 16,
          fat_g: 5,
        },
      },
    },
  ],
  grocery_list: {
    produce: [
      { name: 'Spinach', quantity: '2', unit: 'bunches' },
      { name: 'Broccoli', quantity: '3', unit: 'heads' },
      { name: 'Carrots', quantity: '2', unit: 'lbs' },
      { name: 'Mushrooms', quantity: '1.5', unit: 'lbs' },
      { name: 'Green onion', quantity: '1', unit: 'bunch' },
      { name: 'Ginger', quantity: '1', unit: 'piece' },
      { name: 'Garlic', quantity: '1', unit: 'bulb' },
      { name: 'Cucumber', quantity: '2', unit: 'pieces' },
    ],
    proteins: [
      { name: 'Eggs', quantity: '2', unit: 'dozen' },
      { name: 'Chicken breast', quantity: '3', unit: 'lbs' },
      { name: 'Ground chicken', quantity: '2', unit: 'lbs' },
      { name: 'Beef', quantity: '2.5', unit: 'lbs' },
      { name: 'Salmon fillet', quantity: '1.5', unit: 'lbs' },
      { name: 'White fish', quantity: '1.5', unit: 'lbs' },
      { name: 'Tofu', quantity: '3', unit: 'blocks' },
    ],
    pantry: [
      { name: 'Soy sauce', quantity: '1', unit: 'bottle' },
      { name: 'Gochujang', quantity: '1', unit: 'jar' },
      { name: 'Miso paste', quantity: '1', unit: 'container' },
      { name: 'Sesame oil', quantity: '1', unit: 'bottle' },
      { name: 'Rice', quantity: '5', unit: 'lbs' },
      { name: 'Sweet potato noodles', quantity: '1', unit: 'box' },
      { name: 'Rice noodles', quantity: '1', unit: 'box' },
    ],
    dairy: [
      { name: 'Milk', quantity: '2', unit: 'quarts' },
      { name: 'Oat milk', quantity: '1', unit: 'quart' },
      { name: 'Butter', quantity: '1', unit: 'lb' },
    ],
    other: [
      { name: 'Matcha powder', quantity: '1', unit: 'container' },
      { name: 'Honey', quantity: '1', unit: 'jar' },
      { name: 'Fish sauce', quantity: '1', unit: 'bottle' },
    ],
  },
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { weekStartDate } = await request.json()
  const parsed = MOCK_MEAL_PLAN

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
