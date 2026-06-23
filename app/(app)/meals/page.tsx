import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getWeekStartDate } from '@/lib/utils/dates'
import type { Meal } from '@/types'

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const MEAL_TYPE_LABELS = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  drink: 'Drink',
}

export default async function MealsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const weekStart = getWeekStartDate(new Date())
  const today = new Date()
  const todayDayNum = (today.getUTCDay() + 6) % 7 + 1 // Convert 0-6 (Sun-Sat) to 1-7 (Mon-Sun)

  const mealPlanRes = await supabase
    .from('meal_plans')
    .select('id')
    .eq('user_id', user.id)
    .eq('week_start_date', weekStart)
    .single()

  if (!mealPlanRes.data) {
    return (
      <div className="p-4 space-y-4 max-w-lg mx-auto pb-20">
        <div className="pt-2">
          <h1 className="text-2xl font-semibold tracking-tight">Meal Plan</h1>
        </div>
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">No meal plan generated yet</p>
              <p className="text-xs text-muted-foreground">
                Generate a personalized 7-day meal plan based on your nutrition targets.
              </p>
            </div>
            <Button className="w-full">Generate Meal Plan</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const mealsRes = await supabase
    .from('meals')
    .select('*')
    .eq('meal_plan_id', mealPlanRes.data.id)
    .order('day_of_week')
    .order('meal_type', {
      foreignTable: 'meals',
      ascending: true,
    })

  const meals = (mealsRes.data ?? []) as Meal[]

  // Organize meals by day
  const mealsByDay: Record<number, Record<string, Meal[]>> = {}
  for (let i = 1; i <= 7; i++) {
    mealsByDay[i] = {
      breakfast: [],
      lunch: [],
      dinner: [],
      drink: [],
    }
  }

  meals.forEach((meal) => {
    const dayMeals = mealsByDay[meal.day_of_week] || {}
    if (!dayMeals[meal.meal_type]) dayMeals[meal.meal_type] = []
    dayMeals[meal.meal_type].push(meal)
  })

  return (
    <div className="p-4 space-y-3 max-w-lg mx-auto pb-20">
      {/* Header */}
      <div className="pt-2 mb-2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Meal Plan</h1>
        </div>
        <Button variant="outline" size="sm">
          Regenerate
        </Button>
      </div>

      {/* Days */}
      {Array.from({ length: 7 }).map((_, i) => {
        const day = i + 1
        const dayMeals = mealsByDay[day]
        const isToday = day === todayDayNum

        return (
          <Card
            key={day}
            className={isToday ? 'border-primary bg-primary/5' : ''}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {DAY_NAMES[i]}
                </CardTitle>
                {isToday && (
                  <span className="text-xs font-semibold text-primary">Today</span>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-2">
              {(['breakfast', 'lunch', 'dinner', 'drink'] as const).map((mealType) => {
                const mealList = dayMeals[mealType] || []
                const meal = mealList[0]

                if (!meal) return null

                return (
                  <div key={mealType} className="bg-muted rounded-lg p-3 space-y-1">
                    <div className="font-medium text-sm">
                      {MEAL_TYPE_LABELS[mealType]}
                    </div>
                    <div className="text-sm font-semibold">{meal.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {meal.calories} kcal
                      {meal.protein_g && (
                        <>
                          {' '}
                          • P:{meal.protein_g}g C:{meal.carbs_g}g F:{meal.fat_g}g
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
