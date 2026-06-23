import { SupabaseClient } from '@supabase/supabase-js'
import { DEFAULT_WORKOUT_SCHEDULE } from './workouts'

export async function seedUserPlan(supabase: SupabaseClient, userId: string): Promise<void> {
  const scheduleData = DEFAULT_WORKOUT_SCHEDULE.map(entry => ({
    user_id: userId,
    ...entry,
  }))
  const { error } = await supabase.from('workout_schedule').insert(scheduleData)
  if (error) throw new Error(`Failed to seed workout schedule: ${error.message}`)
}
