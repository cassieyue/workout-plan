'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { UserProfile } from '@/types'

export default function SettingsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [email, setEmail] = useState('')
  const [age, setAge] = useState('')
  const [heightFt, setHeightFt] = useState('')
  const [heightIn, setHeightIn] = useState('')
  const [weightLbs, setWeightLbs] = useState('')
  const [calorieTarget, setCalorieTarget] = useState('')
  const [proteinG, setProteinG] = useState('')
  const [carbsG, setCarbsG] = useState('')
  const [fatG, setFatG] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setEmail(user.email || '')

      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
        setAge(profileData.age.toString())
        setHeightFt(Math.floor(profileData.height_inches / 12).toString())
        setHeightIn((profileData.height_inches % 12).toString())
        setWeightLbs(profileData.weight_lbs.toString())
        setCalorieTarget(profileData.calorie_target.toString())
        setProteinG(profileData.protein_g.toString())
        setCarbsG(profileData.carbs_g.toString())
        setFatG(profileData.fat_g.toString())
      }
      setLoading(false)
    }

    loadProfile()
  }, [router])

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const heightInches = parseInt(heightFt) * 12 + parseInt(heightIn)
      const response = await fetch('/api/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: parseInt(age),
          height_inches: heightInches,
          weight_lbs: parseFloat(weightLbs),
          calorie_target: parseInt(calorieTarget),
          protein_g: parseInt(proteinG),
          carbs_g: parseInt(carbsG),
          fat_g: parseInt(fatG),
        }),
      })

      if (!response.ok) {
        setMessage({ type: 'error', text: 'Failed to save profile' })
        setSaving(false)
        return
      }

      setMessage({ type: 'success', text: 'Profile saved successfully' })
    } catch (err) {
      setMessage({ type: 'error', text: 'An error occurred' })
    }
    setSaving(false)
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (loading) {
    return <div className="p-4 text-sm text-muted-foreground">Loading...</div>
  }

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto pb-20">
      {/* Header */}
      <div className="pt-2">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      </div>

      {/* Email Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground uppercase">Email</Label>
            <p className="text-sm font-medium mt-1">{email}</p>
          </div>
        </CardContent>
      </Card>

      {/* Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
          <CardDescription className="text-xs">Update your body measurements and nutrition targets</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min="16"
                max="80"
                required
              />
            </div>

            <div>
              <Label>Height</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="number"
                    value={heightFt}
                    onChange={(e) => setHeightFt(e.target.value)}
                    placeholder="ft"
                    min="4"
                    max="7"
                    required
                  />
                </div>
                <div className="flex-1">
                  <Input
                    type="number"
                    value={heightIn}
                    onChange={(e) => setHeightIn(e.target.value)}
                    placeholder="in"
                    min="0"
                    max="11"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="weight">Weight (lbs)</Label>
              <Input
                id="weight"
                type="number"
                value={weightLbs}
                onChange={(e) => setWeightLbs(e.target.value)}
                step="0.1"
                min="80"
                max="400"
                required
              />
            </div>

            <hr className="my-4" />

            <div>
              <Label htmlFor="calories">Daily Calorie Target</Label>
              <Input
                id="calories"
                type="number"
                value={calorieTarget}
                onChange={(e) => setCalorieTarget(e.target.value)}
                min="1000"
                max="5000"
                required
              />
            </div>

            <div>
              <Label htmlFor="protein">Protein (g)</Label>
              <Input
                id="protein"
                type="number"
                value={proteinG}
                onChange={(e) => setProteinG(e.target.value)}
                min="50"
                max="300"
                required
              />
            </div>

            <div>
              <Label htmlFor="carbs">Carbs (g)</Label>
              <Input
                id="carbs"
                type="number"
                value={carbsG}
                onChange={(e) => setCarbsG(e.target.value)}
                min="100"
                max="500"
                required
              />
            </div>

            <div>
              <Label htmlFor="fat">Fat (g)</Label>
              <Input
                id="fat"
                type="number"
                value={fatG}
                onChange={(e) => setFatG(e.target.value)}
                min="30"
                max="200"
                required
              />
            </div>

            {message && (
              <div
                className={`text-sm p-2 rounded ${
                  message.type === 'success'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {message.text}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? 'Saving…' : 'Save Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Card>
        <CardContent className="pt-6">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
