'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { getWeekStartDate } from '@/lib/utils/dates'
import type { GroceryList, GroceryItem } from '@/types'

type Category = 'produce' | 'proteins' | 'pantry' | 'dairy' | 'other'

const CATEGORY_LABELS: Record<Category, string> = {
  produce: 'Produce',
  proteins: 'Proteins',
  pantry: 'Pantry',
  dairy: 'Dairy',
  other: 'Other',
}

const CATEGORIES: Category[] = ['produce', 'proteins', 'pantry', 'dairy', 'other']

interface GroceryItemWithCategory extends GroceryItem {
  category: Category
}

export default function GroceryPage() {
  const router = useRouter()
  const [groceryList, setGroceryList] = useState<GroceryList | null>(null)
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchGroceryList() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const weekStart = getWeekStartDate(new Date())

      const mealPlanRes = await supabase
        .from('meal_plans')
        .select('id')
        .eq('user_id', user.id)
        .eq('week_start_date', weekStart)
        .single()

      if (!mealPlanRes.data) {
        setLoading(false)
        return
      }

      const groceryRes = await supabase
        .from('grocery_lists')
        .select('*')
        .eq('meal_plan_id', mealPlanRes.data.id)
        .single()

      if (groceryRes.data) {
        setGroceryList(groceryRes.data)
        setCheckedItems(new Set(groceryRes.data.checked_items || []))
      }
      setLoading(false)
    }

    fetchGroceryList()
  }, [router])

  const handleToggleItem = async (itemKey: string) => {
    const newChecked = new Set(checkedItems)
    if (newChecked.has(itemKey)) {
      newChecked.delete(itemKey)
    } else {
      newChecked.add(itemKey)
    }
    setCheckedItems(newChecked)

    // Persist to database
    if (groceryList) {
      const supabase = createClient()
      await supabase
        .from('grocery_lists')
        .update({ checked_items: Array.from(newChecked) })
        .eq('id', groceryList.id)
    }
  }

  if (loading) {
    return (
      <div className="p-4 max-w-lg mx-auto pb-20">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!groceryList) {
    return (
      <div className="p-4 space-y-4 max-w-lg mx-auto pb-20">
        <div className="pt-2">
          <h1 className="text-2xl font-semibold tracking-tight">Grocery List</h1>
        </div>
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">No grocery list available</p>
              <p className="text-xs text-muted-foreground">
                Generate a meal plan to get your grocery list.
              </p>
            </div>
            <Button className="w-full" onClick={() => router.push('/meals')}>
              Go to Meal Plan
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Organize items by category
  const itemsByCategory: Record<Category, GroceryItemWithCategory[]> = {
    produce: [],
    proteins: [],
    pantry: [],
    dairy: [],
    other: [],
  }

  groceryList.items.forEach((item: GroceryItemWithCategory) => {
    const cat = item.category as Category
    if (itemsByCategory[cat]) {
      itemsByCategory[cat].push(item)
    }
  })

  const totalItems = groceryList.items.length
  const checkedCount = checkedItems.size
  const progressPercent = totalItems > 0 ? (checkedCount / totalItems) * 100 : 0

  const getItemKey = (item: GroceryItem) => `${item.name}-${item.quantity}-${item.unit}`

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto pb-20">
      {/* Header */}
      <div className="pt-2">
        <h1 className="text-2xl font-semibold tracking-tight">Grocery List</h1>
        <p className="text-sm text-muted-foreground">
          {checkedCount} of {totalItems} items
        </p>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-4">
          <Progress value={progressPercent} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {Math.round(progressPercent)}% complete
          </p>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="produce">Produce</TabsTrigger>
          <TabsTrigger value="proteins">Proteins</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3 mt-4">
          {CATEGORIES.map((cat) => {
            const items = itemsByCategory[cat]
            if (items.length === 0) return null
            return (
              <CategorySection
                key={cat}
                category={cat}
                items={items}
                checkedItems={checkedItems}
                onToggle={handleToggleItem}
                getItemKey={getItemKey}
              />
            )
          })}
        </TabsContent>

        {CATEGORIES.map((cat) => (
          <TabsContent key={cat} value={cat} className="space-y-2 mt-4">
            <CategorySection
              category={cat}
              items={itemsByCategory[cat]}
              checkedItems={checkedItems}
              onToggle={handleToggleItem}
              getItemKey={getItemKey}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

function CategorySection({
  category,
  items,
  checkedItems,
  onToggle,
  getItemKey,
}: {
  category: Category
  items: GroceryItemWithCategory[]
  checkedItems: Set<string>
  onToggle: (key: string) => void
  getItemKey: (item: GroceryItem) => string
}) {
  if (items.length === 0) return null

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{CATEGORY_LABELS[category]}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => {
          const key = getItemKey(item)
          const isChecked = checkedItems.has(key)

          return (
            <label
              key={key}
              className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${
                isChecked
                  ? 'bg-muted text-muted-foreground'
                  : 'hover:bg-muted/50'
              }`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => onToggle(key)}
                className="w-4 h-4 mt-0.5 cursor-pointer"
              />
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium ${isChecked ? 'line-through' : ''}`}>
                  {item.name}
                </div>
                <div className={`text-xs ${isChecked ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                  {item.quantity} {item.unit}
                </div>
              </div>
            </label>
          )
        })}
      </CardContent>
    </Card>
  )
}
