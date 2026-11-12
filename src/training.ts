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
