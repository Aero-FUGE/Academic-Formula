import { test } from 'node:test'
import assert from 'node:assert/strict'
import { availableBlocks, buildSentence, hasCompleted, nextFormula, nextPoint, slotsFromText, type TrainingRecord } from '../src/training.ts'

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

test('词块可放入任意空位，使用后移出词库，撤回后恢复', () => {
  const blocks = [{ id: 'a', text: '贝多芬' }, { id: 'b', text: '德国' }]
  const filled = { 人物: '德国' }
  assert.deepEqual(availableBlocks(blocks, filled), [{ id: 'a', text: '贝多芬' }])
  assert.equal(buildSentence('【人物】来自【国家】', filled), '德国来自【国家】')
  assert.deepEqual(availableBlocks(blocks, {}), blocks)
})

test('相同内容的词块按数量消耗，互不覆盖，刷新后可重建可用词块', () => {
  const blocks = [{ id: 'a', text: '歌剧' }, { id: 'b', text: '歌剧' }]
  assert.equal(availableBlocks(blocks, { 领域: '歌剧' }).length, 1)
  assert.equal(availableBlocks(blocks, { 领域: '歌剧', 体裁: '歌剧' }).length, 0)
  assert.equal(availableBlocks(blocks, {}).length, 2)
})
