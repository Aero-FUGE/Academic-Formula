export type TrainingRecord = {
  id: string
  formulaId: number
  formulaTitle: string
  point: string
  mode: 'knowledge' | 'formula'
  answers: Record<string, string>
  template: string
  sentence: string
  essay: string
  completedAt: string
}

export const hasCompleted = (records: TrainingRecord[], formulaId: number, point: string) =>
  records.some(record => record.formulaId === formulaId && record.point === point)

export const nextPoint = (records: TrainingRecord[], formulaId: number, points: string[]) =>
  points.find(point => !hasCompleted(records, formulaId, point))

export const nextFormula = (records: TrainingRecord[], point: string, formulas: { id: number }[]) =>
  formulas.find(formula => !hasCompleted(records, formula.id, point))?.id

export const slotsFromText = (text: string) => [...new Set(Array.from(text.matchAll(/【([^】]+)】/g), match => match[1]))]

export const buildSentence = (text: string, filled: Record<string, string>) =>
  text.replace(/【([^】]+)】/g, (placeholder, slot: string) => filled[slot] || placeholder)

// Treat equal answer texts as distinct blocks without exposing their field names.
export const availableBlocks = (blocks: { id: string; text: string }[], filled: Record<string, string>) => {
  const used = Object.values(filled).filter(Boolean)
  return blocks.filter(block => {
    const index = used.indexOf(block.text)
    if (index < 0) return true
    used.splice(index, 1)
    return false
  })
}
