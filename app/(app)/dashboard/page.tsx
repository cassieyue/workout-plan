import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getWeekStartDate } from '@/lib/utils/dates'
import type { SessionType } from '@/types'

const SESSION_LABELS: Record<SessionType, string> = {
  strength_a: 'Strength A',
  strength_b: 'Strength B',
  easy_run: 'Easy Run',
  long_run: 'Long Run',
  rest: 'Rest',
}

const SESSION_DESCRIPTIONS: Record<SessionType, string> = {
  strength_a: '5 exercises · Squats, Deadlifts, Rows, Chest, Core',
  strength_b: '5 exercises · Deadlifts, Split Squats, Pulldowns, Press, Glutes',
  easy_run: 'Conversational pace — comfortable throughout',
  long_run: 'Easy pace — build your aerobic base',
  rest: 'Recovery day — stretch, walk, or rest',
}

function getWeekNumber(createdAt: string): number {
  const msPerWeek = 7 * 24 * 60 * 60 * 1000
  const elapsed = Date.now() - new Date(createdAt).getTime()
  return Math.min(12, Math.max(1, Math.floor(elapsed / msPerWeek) + 1))
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date()
  const dayOfWeek = today.getUTCDay()
  const weekStart = getWeekStartDate(today)

  const [profileResult, scheduleResult, allScheduleResult, logsResult] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('calorie_target, protein_g, carbs_g, fat_g, created_at')
      .eq('id', user.id)
      .single(),
    supabase
      .from('workout_schedule')
      .select('session_type')
      .eq('user_id', user.id)
      .eq('day_of_week', dayOfWeek)
      .single(),
    supabase
      .from('workout_schedule')
      .select('session_type')
      .eq('user_id', user.id)
      .neq('session_type', 'rest'),
    supabase
      .from('workout_logs')
      .select('completed')
      .eq('user_id', user.id)
      .gte('date', weekStart)
      .eq('completed', true),
  ])

  const profile = profileResult.data
  const todaySession = (scheduleResult.data?.session_type ?? 'rest') as SessionType
  const totalScheduled = allScheduleResult.data?.length ?? 0
  const completedThisWeek = logsResult.data?.length ?? 0
  const weekNumber = profile ? getWeekNumber(profile.created_at) : 1

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="pt-2">
        <p className="text-sm text-muted-foreground">{formatDate(today)}</p>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
      </div>

      {/* Today's Plan */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Today
            </CardTitle>
            <Badge variant={todaySession === 'rest' ? 'secondary' : 'default'}>
              {SESSION_LABELS[todaySession]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{SESSION_DESCRIPTIONS[todaySession]}</p>
        </CardContent>
      </Card>

      {/* Week Progress */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              This Week
            </CardTitle>
            <span className="text-xs text-muted-foreground">Week {weekNumber} of 12</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold">{completedThisWeek}</span>
            <span className="text-muted-foreground mb-1">/ {totalScheduled} sessions done</span>
          </div>
          <div className="flex gap-1.5 mt-3">
            {Array.from({ length: totalScheduled }).map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full ${
                  i < completedThisWeek ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Daily Nutrition Targets */}
      {profile && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Daily Targets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-3">
              {profile.calorie_target}
              <span className="text-base font-normal text-muted-foreground ml-1">kcal</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <MacroStat label="Protein" value={profile.protein_g} unit="g" />
              <MacroStat label="Carbs" value={profile.carbs_g} unit="g" />
              <MacroStat label="Fat" value={profile.fat_g} unit="g" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function MacroStat({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="bg-muted rounded-lg p-3 text-center">
      <div className="text-lg font-semibold">
        {value}
        <span className="text-xs font-normal text-muted-foreground ml-0.5">{unit}</span>
      </div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
    </div>
  )
}
