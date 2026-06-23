export function getWeekStartDate(date: Date = new Date()): string {
  // Work entirely in UTC to avoid timezone offset issues
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth()
  const dayOfMonth = date.getUTCDate()
  const day = date.getUTCDay() // 0=Sunday

  const d = new Date(Date.UTC(year, month, dayOfMonth))
  const diff = day === 0 ? -6 : 1 - day // shift to Monday
  d.setUTCDate(d.getUTCDate() + diff)
  return d.toISOString().split('T')[0]
}

// Meal plan generates on Sunday for the coming week (starts next Monday)
export function shouldGenerateMealPlan(
  lastGeneratedWeekStart: string | null,
  now: Date = new Date()
): boolean {
  if (now.getUTCDay() !== 0) return false // Not Sunday
  if (!lastGeneratedWeekStart) return true
  const nextMonday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1))
  const nextWeekStart = nextMonday.toISOString().split('T')[0]
  return lastGeneratedWeekStart !== nextWeekStart
}

// Workout variation generates on Monday for the current week
export function shouldGenerateWorkoutVariation(
  lastGeneratedWeekStart: string | null,
  now: Date = new Date()
): boolean {
  if (now.getUTCDay() !== 1) return false // Not Monday
  if (!lastGeneratedWeekStart) return true
  const currentWeekStart = getWeekStartDate(now)
  return lastGeneratedWeekStart !== currentWeekStart
}
