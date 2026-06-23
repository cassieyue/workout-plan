export function buildWorkoutVariationPrompt(params: {
  variationPools: Record<string, string[]>
  lastWeekVariations: Record<string, string>
}): string {
  const exerciseLines = Object.entries(params.variationPools)
    .map(([exercise, alternatives]) => {
      const last = params.lastWeekVariations[exercise]
      const avoid = last ? ` (avoid "${last}" — used last week)` : ''
      return `- ${exercise}: ${alternatives.join(', ')}${avoid}`
    })
    .join('\n')

  return `You are a fitness coach selecting weekly exercise variations to keep workouts fresh.

For each exercise below, pick exactly ONE alternative from its list. Avoid repeating last week's choice where noted.

EXERCISES AND THEIR ALLOWED ALTERNATIVES:
${exerciseLines}

Return ONLY a valid JSON object with this exact structure:
{
  "variations": {
    "ExerciseName": "ChosenAlternative"
  }
}

Include all ${Object.keys(params.variationPools).length} exercises. Choose only from the listed alternatives for each.`
}
