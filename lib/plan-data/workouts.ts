import { SessionType } from '@/types'

export const VARIATION_POOLS: Record<string, string[]> = {
  'Goblet Squat': ['Front Squat', 'Box Squat', 'Pause Squat'],
  'Romanian Deadlift': ['Single-Leg RDL', 'Stiff-Leg Deadlift', 'Kettlebell RDL'],
  'Dumbbell Row': ['Cable Row', 'Chest-Supported Row', 'Barbell Bent-Over Row'],
  'Dumbbell Chest Press': ['Push-Ups', 'Incline Dumbbell Press', 'Cable Fly'],
  'Plank': ['Side Plank', 'Dead Bug', 'Hollow Body Hold'],
  'Sumo Deadlift': ['Conventional Deadlift', 'Trap Bar Deadlift'],
  'Bulgarian Split Squat': ['Reverse Lunge', 'Step-Up', 'Single-Leg Squat'],
  'Lat Pulldown': ['Assisted Pull-Up', 'Cable Pullover', 'Straight-Arm Pulldown'],
  'Dumbbell Shoulder Press': ['Arnold Press', 'Cable Shoulder Press', 'Lateral Raise + Press'],
  'Hip Thrust': ['Glute Bridge', 'Cable Pull-Through', 'Donkey Kick'],
}

export const DEFAULT_WORKOUT_SCHEDULE: { day_of_week: number; session_type: SessionType }[] = [
  { day_of_week: 1, session_type: 'strength_a' }, // Monday
  { day_of_week: 3, session_type: 'easy_run' },   // Wednesday
  { day_of_week: 5, session_type: 'strength_b' }, // Friday
  { day_of_week: 0, session_type: 'long_run' },   // Sunday
]
