import { describe, it, expect } from 'vitest'
import { calculateBMR, calculateTDEE, calculateDailyCalories, calculateMacros } from './tdee'

describe('calculateBMR', () => {
  it('calculates BMR for 20-year-old female, 5\'9", 156 lbs', () => {
    // Mifflin-St Jeor female: 10×70.76 + 6.25×175.26 - 5×20 - 161 = 1542
    const result = calculateBMR(156, 69, 20)
    expect(result).toBeCloseTo(1542, 0)
  })

  it('returns higher BMR for heavier person', () => {
    expect(calculateBMR(180, 69, 20)).toBeGreaterThan(calculateBMR(156, 69, 20))
  })

  it('returns lower BMR for older person', () => {
    expect(calculateBMR(156, 69, 30)).toBeLessThan(calculateBMR(156, 69, 20))
  })
})

describe('calculateTDEE', () => {
  it('multiplies BMR by 1.55 by default', () => {
    expect(calculateTDEE(1542)).toBe(Math.round(1542 * 1.55))
  })

  it('accepts custom multiplier', () => {
    expect(calculateTDEE(1542, 1.725)).toBe(Math.round(1542 * 1.725))
  })
})

describe('calculateDailyCalories', () => {
  it('subtracts 500 from TDEE by default', () => {
    expect(calculateDailyCalories(2390)).toBe(1890)
  })

  it('accepts custom deficit', () => {
    expect(calculateDailyCalories(2390, 300)).toBe(2090)
  })
})

describe('calculateMacros', () => {
  it('returns correct macros for 1890 kcal', () => {
    const macros = calculateMacros(1890)
    expect(macros.protein).toBe(130)
    expect(macros.fat).toBe(55)
    expect(macros.carbs).toBeGreaterThan(0)
    // calories should be close to target
    const total = macros.protein * 4 + macros.carbs * 4 + macros.fat * 9
    expect(total).toBeCloseTo(1890, -1)
  })
})
