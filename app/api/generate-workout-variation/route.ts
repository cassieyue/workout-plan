import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { buildWorkoutVariationPrompt } from '@/lib/ai/workout-variation'
import { VARIATION_POOLS } from '@/lib/plan-data/workouts'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { weekStartDate, lastWeekVariations = {} } = await request.json()

  const prompt = buildWorkoutVariationPrompt({
    variationPools: VARIATION_POOLS,
    lastWeekVariations,
  })

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    return NextResponse.json({ error: 'Unexpected response type' }, { status: 500 })
  }

  let parsed: { variations: Record<string, string> }
  try {
    const jsonText = content.text.replace(/^```json?\n?/, '').replace(/\n?```$/, '')
    parsed = JSON.parse(jsonText)
  } catch {
    return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
  }

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
