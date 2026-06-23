'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { seedUserPlan } from '@/lib/plan-data/seed'
import { calculateBMR, calculateTDEE, calculateDailyCalories, calculateMacros } from '@/lib/utils/tdee'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function OnboardingPage() {
  const router = useRouter()
  const [age, setAge] = useState('20')
  const [heightFt, setHeightFt] = useState('5')
  const [heightIn, setHeightIn] = useState('9')
  const [weightLbs, setWeightLbs] = useState('156')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const heightInches = parseInt(heightFt) * 12 + parseInt(heightIn)
    const weight = parseFloat(weightLbs)
    const ageNum = parseInt(age)

    const bmr = calculateBMR(weight, heightInches, ageNum)
    const tdee = calculateTDEE(bmr)
    const calories = calculateDailyCalories(tdee)
    const macros = calculateMacros(calories)

    const { error: profileError } = await supabase.from('user_profiles').insert({
      id: user.id,
      age: ageNum,
      height_inches: heightInches,
      weight_lbs: weight,
      calorie_target: calories,
      protein_g: macros.protein,
      carbs_g: macros.carbs,
      fat_g: macros.fat,
      onboarding_completed: true,
    })

    if (profileError) { setError(profileError.message); setLoading(false); return }

    try {
      await seedUserPlan(supabase, user.id)
    } catch (err) {
      setError(String(err))
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Set up your plan</CardTitle>
          <CardDescription>We&apos;ll calculate your calorie targets automatically.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Age</Label>
              <Input type="number" value={age} onChange={e => setAge(e.target.value)} min="16" max="80" required />
            </div>
            <div>
              <Label>Height</Label>
              <div className="flex gap-2">
                <Input type="number" value={heightFt} onChange={e => setHeightFt(e.target.value)} placeholder="ft" min="4" max="7" required className="w-20" />
                <Input type="number" value={heightIn} onChange={e => setHeightIn(e.target.value)} placeholder="in" min="0" max="11" required className="w-20" />
              </div>
            </div>
            <div>
              <Label>Weight (lbs)</Label>
              <Input type="number" value={weightLbs} onChange={e => setWeightLbs(e.target.value)} step="0.1" min="80" max="400" required />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Setting up…' : 'Start my plan'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
