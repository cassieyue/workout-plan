import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-react'
import { getWeekStartDate } from '@/lib/utils/dates'
import type { SessionType, WorkoutPlanExercise } from '@/types'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const SESSION_LABELS: Record<SessionType, string> = {
  strength_a: 'Strength A',
  strength_b: 'Strength B',
  easy_run: 'Easy Run',
  long_run: 'Long Run',
  rest: 'Rest',
}

const SESSION_COLORS: Record<SessionType, string> = {
  strength_a: 'bg-blue-100 text-blue-700',
  strength_b: 'bg-blue-100 text-blue-700',
  easy_run: 'bg-green-100 text-green-700',
  long_run: 'bg-green-100 text-green-700',
  rest: 'bg-slate-100 text-slate-700',
}

function getWeekNumber(createdAt: string): number {
  const msPerWeek = 7 * 24 * 60 * 60 * 1000
  const elapsed = Date.now() - new Date(createdAt).getTime()
  return Math.min(12, Math.max(1, Math.floor(elapsed / msPerWeek) + 1))
}

interface DaySchedule {
  dayOfWeek: number
  dayName: string
  sessionType: SessionType
  exercises?: WorkoutPlanExercise[]
  runDistance?: number
  runNotes?: string
  completed: boolean
}

export default async function WorkoutPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date()
  const weekStart = getWeekStartDate(today)
  const todayDayOfWeek = today.getUTCDay()

  const [profileRes, scheduleRes, variationsRes, exercisesRes, logsRes] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('created_at')
      .eq('id', user.id)
      .single(),
    supabase
      .from('workout_schedule')
      .select('day_of_week, session_type')
      .eq('user_id', user.id)
      .order('day_of_week'),
    supabase
      .from('workout_variations')
      .select('variations')
      .eq('user_id', user.id)
      .eq('week_start_date', weekStart)
      .single(),
    supabase
      .from('workout_plan_exercises')
      .select('*')
      .order('workout_type')
      .order('order_index'),
    supabase
      .from('workout_logs')
      .select('date, completed')
      .eq('user_id', user.id)
      .gte('date', weekStart),
  ])

  const profile = profileRes.data
  const schedule = scheduleRes.data ?? []
  const variations = variationsRes.data?.variations ?? {}
  const exercises = exercisesRes.data ?? []
  const logs = logsRes.data ?? []
  const weekNumber = profile ? getWeekNumber(profile.created_at) : 1

  const completedDates = new Set(logs.filter(l => l.completed).map(l => l.date))

  const runPlanRes = await supabase
    .from('run_plan')
    .select('*')
    .eq('week_number', weekNumber)

  const runPlan = runPlanRes.data ?? []

  // Build week schedule
  const weekSchedule: DaySchedule[] = Array.from({ length: 7 }, (_, i) => {
    const dayOfWeek = (i + 1) % 7 // 1-6 (Mon-Sat), 0 (Sun)
    const scheduleEntry = schedule.find(s => s.day_of_week === dayOfWeek)
    const sessionType = (scheduleEntry?.session_type ?? 'rest') as SessionType

    const dayDate = new Date(Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate() - todayDayOfWeek + dayOfWeek
    ))
    const dateStr = dayDate.toISOString().split('T')[0]
    const completed = completedDates.has(dateStr)

    let daySchedule: DaySchedule = {
      dayOfWeek,
      dayName: DAY_NAMES[dayOfWeek],
      sessionType,
      completed,
    }

    if (sessionType.startsWith('strength')) {
      const exerciseList = exercises.filter(e => e.workout_type === sessionType)
      daySchedule.exercises = exerciseList.map(e => ({
        ...e,
        exercise_name: variations[e.exercise_name] ?? e.exercise_name,
      }))
    } else if (sessionType.startsWith('run')) {
      const runEntry = runPlan.find(r => r.run_type === sessionType)
      daySchedule.runDistance = runEntry?.distance_miles
      daySchedule.runNotes = runEntry?.notes
    }

    return daySchedule
  })

  return (
    <div className="p-4 space-y-3 max-w-lg mx-auto pb-20">
      {/* Header */}
      <div className="pt-2 mb-4">
        <h1 className="text-2xl font-semibold tracking-tight">This Week's Workouts</h1>
        <p className="text-sm text-muted-foreground">Week {weekNumber} of 12</p>
      </div>

      {/* Days */}
      {weekSchedule.map((day) => (
        <Card
          key={day.dayOfWeek}
          className={day.dayOfWeek === todayDayOfWeek ? 'border-primary bg-primary/5' : ''}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">{day.dayName}</CardTitle>
                {day.dayOfWeek === todayDayOfWeek && (
                  <Badge variant="default" className="text-xs">
                    Today
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {day.completed && (
                  <Check className="w-5 h-5 text-green-600" strokeWidth={3} />
                )}
                <Badge
                  variant="secondary"
                  className={SESSION_COLORS[day.sessionType]}
                >
                  {SESSION_LABELS[day.sessionType]}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {day.sessionType === 'rest' ? (
              <p className="text-sm text-muted-foreground">Recovery day</p>
            ) : day.exercises ? (
              <div className="space-y-2">
                {day.exercises.map((ex, idx) => (
                  <div key={idx} className="text-sm bg-muted rounded p-2">
                    <div className="font-medium">{ex.exercise_name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {ex.sets} × {ex.reps ?? ex.duration_seconds ? `${ex.reps ?? ex.duration_seconds}${ex.reps ? ' reps' : 's'}` : '?'}
                      {ex.notes && ` • ${ex.notes}`}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm bg-muted rounded p-2">
                <div className="font-medium">
                  {day.runDistance}
                  <span className="text-xs font-normal text-muted-foreground ml-1">miles</span>
                </div>
                {day.runNotes && (
                  <div className="text-xs text-muted-foreground mt-0.5">{day.runNotes}</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
