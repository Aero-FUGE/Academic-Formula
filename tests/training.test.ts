import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSentence, hasCompleted, nextFormula, nextPoint, slotsFromText, type TrainingRecord } from '../src/training.ts'

const record = (formulaId: number, point: string, mode: 'knowledge' | 'formula' = 'formula'): TrainingRecord => ({
  id: `${formulaId}-${point}`, formulaId, point, mode, formulaTitle: '句型', answers: {}, template: '', sentence: '', essay: '独立作答', completedAt: '2026-11-12T00:00:00Z',
})

test('句型模式固定句型，只安排尚未练过的考点，且识别考点模式记录', () => {
  const records = [record(1, '贝多芬', 'knowledge'), record(2, '莫扎特')]
  assert.equal(nextPoint(records, 1, ['贝多芬', '莫扎特', '海顿']), '莫扎特')
  assert.equal(nextPoint(records, 2, ['贝多芬', '莫扎特', '海顿']), '贝多芬')
  assert.equal(hasCompleted(records, 1, '贝多芬'), true)
})

test('考点模式固定考点，依次选择未完成句型，且识别句型模式记录', () => {
  const records = [record(1, '贝多芬'), record(2, '莫扎特')]
  assert.equal(nextFormula(records, '贝多芬', [{ id: 1 }, { id: 2 }, { id: 3 }]), 2)
  assert.equal(nextFormula(records, '莫扎特', [{ id: 1 }, { id: 2 }, { id: 3 }]), 1)
})

test('完成最后一个组合后结束，不重复安排已完成项目', () => {
  const records = [record(1, '贝多芬'), record(2, '贝多芬')]
  assert.equal(nextFormula(records, '贝多芬', [{ id: 1 }, { id: 2 }]), undefined)
  assert.equal(nextPoint(records, 1, ['贝多芬']), undefined)
  assert.equal(nextFormula(records, '贝多芬', [{ id: 1 }, { id: 2 }, { id: 9 }]), 9)
})

test('槽位从句型提取，重复标题共用答案，重复答案值不丢槽位', () => {
  const template = '【人物】以【方法】发展创作，【人物】推动【贡献】。'
  assert.deepEqual(slotsFromText(template), ['人物', '方法', '贡献'])
  assert.equal(buildSentence(template, { 人物: '贝多芬', 方法: '主题发展', 贡献: '主题发展' }), '贝多芬以主题发展发展创作，贝多芬推动主题发展。')
  assert.equal(buildSentence(template, {}), template)
})
