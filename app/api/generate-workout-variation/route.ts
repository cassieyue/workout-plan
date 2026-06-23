import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const MOCK_VARIATIONS = {
  variations: {
    'Goblet Squat': 'Box Squat',
    'Romanian Deadlift': 'Single-Leg RDL',
    'Dumbbell Row': 'Chest-Supported Row',
    'Dumbbell Chest Press': 'Push-Ups',
    'Plank': 'Dead Bug',
    'Sumo Deadlift': 'Conventional Deadlift',
    'Bulgarian Split Squat': 'Reverse Lunge',
    'Lat Pulldown': 'Assisted Pull-Up',
    'Dumbbell Shoulder Press': 'Arnold Press',
    'Hip Thrust': 'Glute Bridge',
  },
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { weekStartDate } = await request.json()
  const parsed = MOCK_VARIATIONS

  // Delete existing variation for this week if regenerating
  await supabase
    .from('workout_variations')
    .delete()
    .eq('user_id', user.id)
    .eq('week_start_date', weekStartDate)

  const { data: variation, error: insertError } = await supabase
    .from('workout_variations')
    .insert({
      user_id: user.id,
      week_start_date: weekStartDate,
      variations: parsed.variations,
    })
    .select()
    .single()

  if (insertError || !variation) {
    return NextResponse.json({ error: 'Failed to save workout variation' }, { status: 500 })
  }

  return NextResponse.json({ variationId: variation.id })
}
