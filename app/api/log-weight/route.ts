import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { weight, date } = await request.json()
  if (!weight || !date) {
    return NextResponse.json({ error: 'Missing weight or date' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('body_weight_logs')
    .insert({
      user_id: user.id,
      date,
      weight_lbs: parseFloat(weight),
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ id: data.id })
}
