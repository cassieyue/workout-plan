import { Macros } from '@/types'

export function calculateBMR(weightLbs: number, heightInches: number, age: number): number {
  const weightKg = weightLbs * 0.453592
  const heightCm = heightInches * 2.54
  // Mifflin-St Jeor for female
  return 10 * weightKg + 6.25 * heightCm - 5 * age - 161
}

export function calculateTDEE(bmr: number, activityMultiplier = 1.55): number {
  return Math.round(bmr * activityMultiplier)
}

export function calculateDailyCalories(tdee: number, deficit = 500): number {
  return tdee - deficit
}

export function calculateMacros(calories: number): Macros {
  const protein = 130
  const fat = 55
  const carbCals = calories - protein * 4 - fat * 9
  return { protein, fat, carbs: Math.round(carbCals / 4) }
}
