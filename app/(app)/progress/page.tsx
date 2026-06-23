'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { getWeekStartDate } from '@/lib/utils/dates'
import type { BodyWeightLog } from '@/types'

interface WeightDataPoint {
  date: string
  weight: number
  displayDate: string
}

export default function ProgressPage() {
  const router = useRouter()
  const [weights, setWeights] = useState<BodyWeightLog[]>([])
  const [workoutLogs, setWorkoutLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const now = new Date()
      const weekStart = getWeekStartDate(now)
      const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
      const eightWeeksAgo = new Date(now.getTime() - 8 * 7 * 24 * 60 * 60 * 1000)

      const [weightsRes, workoutLogsRes] = await Promise.all([
        supabase
          .from('body_weight_logs')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', eightWeeksAgo.toISOString().split('T')[0])
          .order('date', { ascending: true }),
        supabase
          .from('workout_logs')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', monthStart.toISOString().split('T')[0]),
      ])

      setWeights((weightsRes.data ?? []) as BodyWeightLog[])
      setWorkoutLogs(workoutLogsRes.data ?? [])
      setLoading(false)
    }

    loadData()
  }, [router])

  if (loading) {
    return <div className="p-4 text-sm text-muted-foreground pb-20">Loading...</div>
  }

  // Calculate weight stats
  let currentWeight = 0
  let previousWeight = 0
  let weekChangeDirection: 'up' | 'down' | null = null
  let weekChangeAmount = 0

  if (weights.length > 0) {
    currentWeight = weights[weights.length - 1].weight_lbs
    if (weights.length > 1) {
      previousWeight = weights[weights.length - 2].weight_lbs
      weekChangeAmount = Math.abs(currentWeight - previousWeight)
      weekChangeDirection = currentWeight > previousWeight ? 'up' : 'down'
    }
  }

  // Prepare chart data
  const chartData: WeightDataPoint[] = weights.map((w) => {
    const date = new Date(w.date + 'T00:00:00Z')
    return {
      date: w.date,
      weight: w.weight_lbs,
      displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }
  })

  // Count workouts
  const now = new Date()
  const weekStart = getWeekStartDate(now)
  const thisWeekWorkouts = workoutLogs.filter(
    (w) => w.date >= weekStart && w.completed
  ).length
  const totalScheduledThisMonth = workoutLogs.length > 0
    ? Math.ceil(workoutLogs.length / 4)
    : 0
  const completedThisMonth = workoutLogs.filter((w) => w.completed).length

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto pb-20">
      {/* Header */}
      <div className="pt-2">
        <h1 className="text-2xl font-semibold tracking-tight">Progress</h1>
      </div>

      {/* Current Weight */}
      {currentWeight > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Current Weight
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">{currentWeight}</span>
              <span className="text-base text-muted-foreground">lbs</span>
            </div>
            {weekChangeDirection && (
              <div className={`flex items-center gap-1 text-sm ${
                weekChangeDirection === 'down' ? 'text-green-600' : 'text-orange-600'
              }`}>
                {weekChangeDirection === 'down' ? (
                  <TrendingDown size={16} />
                ) : (
                  <TrendingUp size={16} />
                )}
                <span>
                  {weekChangeDirection === 'down' ? '−' : '+'}{weekChangeAmount.toFixed(1)} lbs this week
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Weight Trend Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Trend (Last 8 Weeks)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-muted)" />
                <XAxis
                  dataKey="displayDate"
                  tick={{ fontSize: 12 }}
                  stroke="var(--color-muted-foreground)"
                />
                <YAxis
                  domain={['dataMin - 1', 'dataMax + 1']}
                  tick={{ fontSize: 12 }}
                  stroke="var(--color-muted-foreground)"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '0.5rem',
                  }}
                  formatter={(value) => `${(value as number).toFixed(1)} lbs`}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="var(--color-primary)"
                  dot={{ fill: 'var(--color-primary)', r: 4 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* This Week */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            This Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{thisWeekWorkouts}</span>
            <span className="text-muted-foreground">workouts completed</span>
          </div>
        </CardContent>
      </Card>

      {/* This Month */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            This Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{completedThisMonth}</span>
              <span className="text-muted-foreground">workouts completed</span>
            </div>
            {totalScheduledThisMonth > 0 && (
              <div className="text-sm text-muted-foreground">
                {Math.round((completedThisMonth / totalScheduledThisMonth) * 100)}% adherence
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* No weight data message */}
      {weights.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground">
              No weight logs yet. Log your weight to see your progress.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
