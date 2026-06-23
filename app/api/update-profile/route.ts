import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const {
    age,
    height_inches,
    weight_lbs,
    calorie_target,
    protein_g,
    carbs_g,
    fat_g,
  } = await request.json()

  if (!age || !height_inches || !weight_lbs) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      age,
      height_inches,
      weight_lbs,
      calorie_target: calorie_target || 1890,
      protein_g: protein_g || 130,
      carbs_g: carbs_g || 220,
      fat_g: fat_g || 55,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
