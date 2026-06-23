export type SessionType = 'strength_a' | 'strength_b' | 'easy_run' | 'long_run' | 'rest'
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'drink'
export type RunType = 'easy_run' | 'long_run'
export type GroceryCategory = 'produce' | 'proteins' | 'pantry' | 'dairy' | 'other'

export interface UserProfile {
  id: string
  age: number
  height_inches: number
  weight_lbs: number
  calorie_target: number
  protein_g: number
  carbs_g: number
  fat_g: number
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface WorkoutScheduleEntry {
  id: string
  user_id: string
  day_of_week: number // 0=Sunday, 1=Monday...6=Saturday
  session_type: SessionType
}

export interface WorkoutPlanExercise {
  id: string
  workout_type: 'strength_a' | 'strength_b'
  exercise_name: string
  sets: number
  reps: number | null
  duration_seconds: number | null
  notes: string | null
  order_index: number
}

export interface RunPlanEntry {
  id: string
  week_number: number
  run_type: RunType
  distance_miles: number
  notes: string | null
}

export interface WorkoutLog {
  id: string
  user_id: string
  date: string
  session_type: SessionType
  week_number: number | null
  completed: boolean
  created_at: string
}

export interface StrengthSet {
  id: string
  workout_log_id: string
  exercise_name: string
  set_number: number
  reps: number
  weight_lbs: number
  created_at: string
}

export interface RunLog {
  id: string
  user_id: string
  workout_log_id: string | null
  date: string
  run_type: RunType
  distance_miles: number
  duration_minutes: number
  pace_min_per_mile: number
  created_at: string
}

export interface WorkoutVariation {
  id: string
  user_id: string
  week_start_date: string
  variations: Record<string, string> // { originalExercise: alternativeExercise }
  created_at: string
}

export interface MealPlan {
  id: string
  user_id: string
  week_start_date: string
  generated_at: string
}

export interface Meal {
  id: string
  meal_plan_id: string
  day_of_week: number // 1=Monday...7=Sunday
  meal_type: MealType
  name: string
  recipe: string | null
  ingredients: string[] | null
  preparation: string | null
  calories: number
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
}

export interface GroceryItem {
  name: string
  quantity: string
  unit: string
  category: GroceryCategory
}

export interface GroceryList {
  id: string
  meal_plan_id: string
  user_id: string
  items: GroceryItem[]
  checked_items: string[]
  created_at: string
}

export interface BodyWeightLog {
  id: string
  user_id: string
  date: string
  weight_lbs: number
  created_at: string
}

export interface Macros {
  protein: number
  carbs: number
  fat: number
}
