import { describe, it, expect } from 'vitest'
import { getWeekStartDate, shouldGenerateMealPlan, shouldGenerateWorkoutVariation } from './dates'

describe('getWeekStartDate', () => {
  it('returns the Monday of the current week for a Wednesday input', () => {
    const wednesday = new Date('2026-06-24') // Wednesday
    expect(getWeekStartDate(wednesday)).toBe('2026-06-22')
  })

  it('returns the same Monday for a Monday input', () => {
    const monday = new Date('2026-06-22')
    expect(getWeekStartDate(monday)).toBe('2026-06-22')
  })

  it('returns the previous Monday for a Sunday input', () => {
    const sunday = new Date('2026-06-21')
    expect(getWeekStartDate(sunday)).toBe('2026-06-15')
  })
})

describe('shouldGenerateMealPlan', () => {
  it('returns true if no plan has ever been generated', () => {
    expect(shouldGenerateMealPlan(null, new Date('2026-06-21'))).toBe(true)
  })

  it('returns false if it is not Sunday', () => {
    expect(shouldGenerateMealPlan(null, new Date('2026-06-22'))).toBe(false)
  })

  it('returns false if plan already generated for next week', () => {
    // Sunday June 21, next week starts June 22
    expect(shouldGenerateMealPlan('2026-06-22', new Date('2026-06-21'))).toBe(false)
  })

  it('returns true on Sunday when next week not yet generated', () => {
    expect(shouldGenerateMealPlan('2026-06-15', new Date('2026-06-21'))).toBe(true)
  })
})

describe('shouldGenerateWorkoutVariation', () => {
  it('returns true if no variation exists', () => {
    expect(shouldGenerateWorkoutVariation(null, new Date('2026-06-22'))).toBe(true)
  })

  it('returns false if not Monday', () => {
    expect(shouldGenerateWorkoutVariation(null, new Date('2026-06-23'))).toBe(false)
  })

  it('returns false if variation already exists for this week', () => {
    expect(shouldGenerateWorkoutVariation('2026-06-22', new Date('2026-06-22'))).toBe(false)
  })

  it('returns true on Monday when variation missing for this week', () => {
    expect(shouldGenerateWorkoutVariation('2026-06-15', new Date('2026-06-22'))).toBe(true)
  })
})
