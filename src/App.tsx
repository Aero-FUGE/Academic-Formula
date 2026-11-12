import { useEffect, useRef, useState } from 'react'
import ModeHome from './HomePage'
import { Archive, ArrowLeft, ArrowRight, BookOpen, Check, Feather, Home, Library, Map as MapIcon, Menu, Pencil, Plus, RotateCcw, Settings2, Star, Trophy, Volume2 } from 'lucide-react'
import { buildSentence, hasCompleted, nextFormula, nextPoint, slotsFromText, type TrainingRecord } from './training'
import './training.css'

type Stage = 'home' | 'map' | 'select-point' | 'select' | 'knowledge' | 'confirm' | 'fill' | 'generate' | 'library' | 'archive' | 'done'
type Mode = 'knowledge' | 'formula'
type Formula = { id: number; title: string; text: string; slots: string[]; progress: number }
const seedFormulas: Formula[] = [
  { id: 1, title: '历史背景与艺术地位', text: '置于【时期】【思想文化思潮】的历史背景之下，【国家】【人物】作为【音乐领域】的代表性人物，凭借其在【具体创作领域】所展现出的艺术探索与实践成果，在【相关音乐体裁或艺术传统】的演进过程中确立了重要的历史地位。', slots: ['时期', '思想文化思潮', '国家', '人物', '音乐领域', '具体创作领域', '相关音乐体裁或艺术传统'], progress: 0 },
  { id: 2, title: '传统承袭与个人风格', text: '其艺术创作在承袭【既有音乐传统】的同时，进一步将【创作理念】融入【具体音乐要素】的组织与发展之中，并借助【具体创作技法】强化【音乐表现效果】，由此形成了以【核心艺术特征】为主要标志的个人创作风格。', slots: ['既有音乐传统', '创作理念', '具体音乐要素', '具体创作技法', '音乐表现效果', '核心艺术特征'], progress: 0 },
  { id: 3, title: '创作实践与艺术贡献', text: '就【核心创作领域】而言，【人物】一方面通过【具体创作实践一】推动了【音乐体裁一】的【发展成果一】，另一方面又以【具体创作实践二】促进了【音乐体裁二】在【发展方向二】上的进一步完善，从而作出了重要的艺术贡献。', slots: ['核心创作领域', '人物', '具体创作实践一', '音乐体裁一', '发展成果一', '具体创作实践二', '音乐体裁二', '发展方向二'], progress: 0 },
]

type KnowledgeGroup = { period: string; composers: string[]; works: string[]; genres: string[] }
const knowledgeGroups: KnowledgeGroup[] = [
  { period: '古希腊与中世纪', composers: ['吟游诗人'], works: [], genres: ['悲剧', '格里高利圣咏', '奥尔加农', '经文歌'] },
  { period: '文艺复兴时期', composers: ['帕莱斯特里那'], works: [], genres: ['新艺术', '众赞歌', '牧歌', '勃艮第乐派', '佛兰德乐派', '罗马乐派', '文艺复兴时期的宗教改革音乐'] },
  { period: '巴洛克时期', composers: ['巴赫', '亨德尔', '蒙特威尔第', 'A·斯卡拉蒂', '维瓦尔第', '科雷利', '拉莫', '吕利', '库普兰', '普赛尔'], works: ['《平均律钢琴曲集》', '《马太受难曲》', '《勃兰登堡协奏曲》', '《弥赛亚》', '《四季》'], genres: ['歌剧', '正歌剧', '清唱剧', '康塔塔', '受难曲', '前奏曲', '托卡塔', '赋格', '巴洛克奏鸣曲', '巴洛克协奏曲', '古组曲'] },
  { period: '古典主义时期', composers: ['格鲁克', '海顿', '莫扎特', '贝多芬'], works: ['《费加罗的婚礼》', '《魔笛》', '《英雄交响曲》', '《命运交响曲》', '《田园交响曲》', '《合唱交响曲》'], genres: ['古典奏鸣曲', '古典协奏曲', '古典交响曲', '弦乐四重奏', '奏鸣曲式', '18世纪意大利喜歌剧的产生与发展', '曼海姆乐派', '维也纳古典乐派'] },
  { period: '浪漫主义时期', composers: ['韦伯', '舒伯特', '瓦格纳', '马勒', '理查·斯特劳斯', '小约翰·施特劳斯', '布鲁克纳', '格林卡', '柴可夫斯基', '拉赫玛尼诺夫', '斯克里亚宾', '柏辽兹', '比才', '圣桑', '罗西尼', '普契尼', '威尔第', '肖邦', '斯美塔那', '德沃夏克', '格里格', '西贝柳斯', '李斯特'], works: ['《自由射手》', '《魔王》', '《鳟鱼》', '《冬之旅》', '《美丽的磨坊女》', '《未完成交响曲》', '《大地之歌》', '《英雄的生涯》', '《图画展览会》', '《舍赫拉查德》', '《幻想交响曲》', '《哈洛尔德在意大利》', '《卡门》', '《动物狂欢节》', '《塞维利亚的理发师》', '《蝴蝶夫人》', '《图兰朵》', '《阿依达》', '《茶花女》', '夜曲', '《我的祖国》', '《自新大陆交响曲》'], genres: ['绝对音乐', '标题音乐', '艺术歌曲', '乐剧', '大歌剧', '喜歌剧', '轻歌剧', '抒情歌剧', '交响诗', '主题变形'] },
  { period: '20世纪', composers: ['巴托克', '肖斯塔科维奇', '梅西安', '凯奇', '德彪西', '勋伯格', '斯特拉文斯基', '普罗科菲耶夫'], works: ['《牧神午后》', '《一个华沙幸存者》', '《春之祭》', '《调性游戏》'], genres: ['整体序列主义音乐', '偶然音乐', '音色音乐', '印象主义音乐', '表现主义音乐', '十二音体系', '第二维也纳乐派', '新古典主义', '六人团'] },
]

const groupPoints = (group: KnowledgeGroup) => [...group.composers, ...group.works, ...group.genres]
const allKnowledgePoints = [...new Set(knowledgeGroups.flatMap(groupPoints))]
const groupForPoint = (point: string) => knowledgeGroups.find(group => groupPoints(group).includes(point)) || knowledgeGroups[3]
const pointType = (point: string, group: KnowledgeGroup) => group.composers.includes(point) ? '作曲家' : group.works.includes(point) ? '音乐作品' : '音乐体裁 / 艺术传统'
const load = <T,>(key: string, fallback: T): T => { try { return JSON.parse(localStorage.getItem(key) || '') as T } catch { return fallback } }
type Draft = { stage: Stage; mode: Mode; point: string; formulaId: number; answers: Record<string, string>; filled: Record<string, string>; essay: string; reviewed: boolean; attemptId: string }
const initialDraft = (): Draft => ({ stage: 'home', mode: 'formula', point: '', formulaId: 1, answers: {}, filled: {}, essay: '', reviewed: false, attemptId: crypto.randomUUID() })

export default function App() {
  const [records, setRecords] = useState<TrainingRecord[]>(() => load('af-training-records-v1', []))
  const [formulas, setFormulas] = useState<Formula[]>(() => {
    const stored = load<Formula[]>('af-formulas', seedFormulas)
    return (Array.isArray(stored) && stored.length ? stored : seedFormulas).map(f => ({ ...f, slots: slotsFromText(f.text) }))
  })
  const [draft, setDraft] = useState<Draft>(() => load('af-training-draft-v1', initialDraft()))
  const saving = useRef(false)
  const finishedAttempts = useRef(new Set<string>())
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const formula = formulas.find(f => f.id === draft.formulaId) || formulas[0]
  const { stage, mode, point, answers, filled, essay } = draft
  const go = (stage: Stage) => { setDraft(d => ({ ...d, stage })); window.scrollTo(0, 0) }
  useEffect(() => {
    try { localStorage.setItem('af-training-draft-v1', JSON.stringify(draft)); localStorage.setItem('af-formulas', JSON.stringify(formulas)) }
    catch { setError('本机存储空间不足，请保留当前页面。') }
  }, [draft, formulas])
  const completedPoints = allKnowledgePoints.filter(p => formulas.every(f => hasCompleted(records, f.id, p))).length
  const begin = (mode: Mode, formulaId: number, point: string) => {
    saving.current = false
    setError('')
    setDraft({ ...initialDraft(), mode, formulaId, point, stage: 'knowledge' })
    window.scrollTo(0, 0)
  }
  const chooseFormula = (f: Formula) => {
    const next = nextPoint(records, f.id, allKnowledgePoints)
    if (next) begin('formula', f.id, next)
    else setDraft({ ...initialDraft(), mode: 'formula', formulaId: f.id, stage: 'done' })
  }
  const choosePoint = (point: string) => {
    const id = nextFormula(records, point, formulas)
    if (id !== undefined) begin('knowledge', id, point)
    else setDraft({ ...initialDraft(), mode: 'knowledge', point, stage: 'done' })
  }
  const finish = () => {
    if (saving.current || finishedAttempts.current.has(draft.attemptId) || !essay.trim()) return
    saving.current = true
    const record: TrainingRecord = { id: draft.attemptId, formulaId: formula.id, formulaTitle: formula.title, point, mode, answers, template: formula.text, sentence: buildSentence(formula.text, filled), essay, completedAt: new Date().toISOString() }
    const updated = records.some(r => r.id === record.id) ? records : [...records, record]
    try { localStorage.setItem('af-training-records-v1', JSON.stringify(updated)) }
    catch { saving.current = false; setError('保存失败，请释放本机存储空间后重试。'); return }
    finishedAttempts.current.add(draft.attemptId)
    setRecords(updated)
    if (mode === 'formula') {
      const next = nextPoint(updated, formula.id, allKnowledgePoints)
      if (next) { begin(mode, formula.id, next); return }
    } else {
      const next = nextFormula(updated, point, formulas)
      if (next !== undefined) { begin(mode, next, point); return }
    }
    setDraft(d => ({ ...d, stage: 'done' }))
  }
  const newFormula = () => setFormulas(fs => [...fs, { id: Date.now(), title: '新的学术句型', text: '【人物】通过【方法】作出了【贡献】。', slots: ['人物', '方法', '贡献'], progress: 0 }])
  const edit = (f: Formula) => {
    const title = window.prompt('编辑句型名称', f.title)
    if (!title?.trim()) return
    const text = window.prompt('编辑完整句型，使用【槽位标题】设置知识槽位', f.text)
    if (!text?.trim() || !slotsFromText(text).length) return
    setFormulas(fs => fs.map(item => item.id === f.id ? { ...f, title: title.trim(), text, slots: slotsFromText(text) } : item))
  }
  return <div className="app"><div className="ambient"/>{error && <p role="alert" className="training-error">{error}</p>}
    {stage === 'home' && <ModeHome points={records.length * 120} completed={completedPoints} total={allKnowledgePoints.length} patternCount={formulas.length} onFormula={() => { setDraft(d => ({ ...d, mode: 'formula' })); go('select') }} onKnowledge={() => { setDraft(d => ({ ...d, mode: 'knowledge' })); go('select-point') }}/>}
    {stage === 'select' && <main className="page select-page"><Header title="选择训练句型" go={go}/><div className="formula-choice-list">{formulas.map((f, i) => <button className="formula-choice" key={f.id} onClick={() => chooseFormula(f)}><span className="choice-number">0{i + 1}</span><span><b>{f.title}</b><small>已练 {new Set(records.filter(r => r.formulaId === f.id).map(r => r.point)).size} / {allKnowledgePoints.length} 个考点 · {records.filter(r => r.formulaId === f.id).length} 次</small></span><ArrowRight size={17}/></button>)}</div></main>}
    {(stage === 'map' || stage === 'select-point') && <main className="page map-page"><Header title={stage === 'map' ? '考点地图' : '选择训练考点'} go={go}/><section className="map-progress-card"><MapIcon/><div><span>全部句型均已完成的考点</span><strong>{completedPoints} / {allKnowledgePoints.length}</strong></div></section><input className="point-search" placeholder="搜索作曲家、作品或体裁" aria-label="搜索考点" value={search} onChange={e => setSearch(e.target.value)}/>{knowledgeGroups.map(group => {
      const categories = stage === 'select-point' ? [['作曲家', group.composers], ['音乐作品', group.works]] as const : [['作曲家', group.composers], ['音乐作品', group.works], ['音乐体裁 / 传统', group.genres]] as const
      return <section className="map-period training-chapter" key={group.period}><h2>{group.period}</h2>{categories.map(([label, points]) => <div className="point-category" key={label}><h3>{label}</h3>{points.filter(p => p.includes(search.trim())).map(p => <details className="point-progress" key={p}><summary>{p}<small>{formulas.filter(f => hasCompleted(records, f.id, p)).length} / {formulas.length} 句型</small></summary><ul>{formulas.map(f => <li key={f.id}>{hasCompleted(records, f.id, p) ? '✓ 已完成' : '○ 未完成'} · {f.title}</li>)}</ul><button className="primary-button" onClick={() => choosePoint(p)}>以此考点训练 <ArrowRight size={15}/></button></details>)}</div>)}</section>
    })}</main>}
    {['knowledge', 'confirm', 'fill', 'generate'].includes(stage) && <div className="session-label">{mode === 'formula' ? '句型专项 · 固定句型' : '考点专项 · 固定考点'}<br/>{point} · {formula.title}</div>}
    {stage === 'knowledge' && <KnowledgePage point={point} group={groupForPoint(point)} formula={formula} answers={answers} setAnswer={(slot, value) => setDraft(d => ({ ...d, answers: { ...d.answers, [slot]: value } }))} go={next => { if (next === 'confirm' && formula.slots.some(slot => !answers[slot]?.trim())) { setError('请填写所有知识槽位后继续。'); return } setError(''); go(next) }}/>}
    {stage === 'confirm' && <ConfirmPage formula={formula} answers={answers} go={go}/>}
    {stage === 'fill' && <FillPage point={point} formula={formula} answers={answers} filled={filled} setFilled={filled => setDraft(d => ({ ...d, filled }))} go={go}/>}
    {stage === 'generate' && <GeneratePage draft={draft} formula={formula} setDraft={setDraft} finish={finish} go={go}/>}
    {stage === 'library' && <main className="page library-page"><Header title="句型档案" go={go}/><div className="library-intro"><BookOpen/><p>{formulas.length} 个句型 · 双模式共用记录</p><button onClick={newFormula}><Plus size={16}/>新增</button></div>{formulas.map(f => {
      const history = records.filter(r => r.formulaId === f.id)
      const practiced = [...new Set(history.map(r => r.point))]
      return <section className="formula-archive" key={f.id}><div className="card-title"><h2>{f.title}</h2><button aria-label={'编辑' + f.title} onClick={() => edit(f)}><Settings2 size={16}/></button></div><p>{f.text}</p><strong>{history.length} 次练习 · {practiced.length} / {allKnowledgePoints.length} 个考点</strong><details><summary>练过哪些考点</summary><div className="chips">{practiced.length ? practiced.map(p => <span key={p}>✓ {p}</span>) : '尚无已完成记录'}</div></details><button className="primary-button" onClick={() => chooseFormula(f)}>继续练习此句型</button></section>
    })}</main>}
    {stage === 'archive' && <main className="page archive-page"><Header title="学习档案" go={go}/><div className="stats-grid"><div><strong>{records.length}</strong><span>累计训练次数</span></div><div><strong>{new Set(records.map(r => r.point)).size}</strong><span>练过的考点</span></div><div><strong>{completedPoints}</strong><span>全部句型已完成</span></div></div>{[...records].reverse().map(r => <details className="history training-history" key={r.id}><summary>{r.point} · {r.formulaTitle}<small>{new Date(r.completedAt).toLocaleString()} · {r.mode === 'formula' ? '句型专项' : '考点专项'}</small></summary><h3>知识定位</h3>{Object.entries(r.answers).map(([key, value]) => <p key={key}>{key}：{value}</p>)}<h3>句型填充</h3><p>{r.sentence}</p><h3>独立生成</h3><p>{r.essay}</p></details>)}{!records.length && <p>完成三阶段训练并确认后，记录会出现在这里。</p>}</main>}
    {stage === 'done' && <main className="page"><Header title="本轮训练完成" go={go}/><section className="current-point-card"><Trophy/><h2>{mode === 'formula' ? formula.title : point}</h2><p>{mode === 'formula' ? '此句型已练完全部考点。' : '此考点已完成全部句型。'}</p><button className="primary-button" onClick={() => go(mode === 'formula' ? 'select' : 'select-point')}>选择下一轮训练</button><button className="text-action" onClick={() => go('archive')}>查看训练记录</button></section></main>}
    {['home', 'map', 'library', 'archive'].includes(stage) && <BottomNav stage={stage} go={go}/>}
  </div>
}
function Header({ title, eyebrow, go }: { title: string; eyebrow?: string; go: (stage: Stage) => void }) { return <header className="top"><button className="back" onClick={() => go('home')}><ArrowLeft size={18} /></button><div><span className="eyebrow">{eyebrow || 'ACADEMIC FORMULA'}</span><h1>{title}</h1></div><button className="top-icon"><Menu size={19} /></button></header> }
function Progress({ current }: { current: number }) { return <div className="stage-progress"><div className={current >= 1 ? 'on' : ''}><span>01</span><small>知识定位</small></div><i /><div className={current >= 2 ? 'on' : ''}><span>02</span><small>句型填充</small></div><i /><div className={current >= 3 ? 'on' : ''}><span>03</span><small>独立生成</small></div></div> }

function KnowledgePage({ point, group, formula, answers, setAnswer, go }: { point: string; group: KnowledgeGroup; formula: Formula; answers: Record<string, string>; setAnswer: (key: string, value: string) => void; go: (stage: Stage) => void }) { return <main className="page flow-page"><Header title="知识定位" eyebrow="FIRST CHAMBER · 01" go={go} /><Progress current={1} /><section className="person-card"><div className="portrait">✦</div><div><span>{group.period} · CURRENT POINT</span><h2>{point}</h2><p>{pointType(point, group)} · 自动联动考点</p></div><Feather size={25} /></section><section className="form-card formula-slots">{formula.slots.map(slot => <label className="knowledge-field" key={slot}><span>{slot}<b>*</b></span><input value={answers[slot] || ''} onChange={e => setAnswer(slot, e.target.value)} placeholder={`填写${slot}`} /></label>)}</section><button className="primary-button bottom-button" onClick={() => go('confirm')}>确认知识 <ArrowRight size={17} /></button></main> }
function ConfirmPage({ formula, answers, go }: { formula: Formula; answers: Record<string, string>; go: (stage: Stage) => void }) { return <main className="page flow-page"><Header title="知识确认" eyebrow="FIRST CHAMBER · REVIEW" go={go} /><Progress current={1} /><section className="parchment review-card"><div className="seal">AF</div>{formula.slots.map(slot => <div className="review-row" key={slot}><span>{slot}</span><strong>{answers[slot] || '尚未填写'}</strong><Pencil size={14} onClick={() => go('knowledge')} /></div>)}<div className="paper-line" /></section><button className="primary-button bottom-button" onClick={() => go('fill')}>进入句型填充 <ArrowRight size={17} /></button></main> }

function FillPage({ point, formula, answers, filled, setFilled, go }: { point: string; formula: Formula; answers: Record<string,string>; filled: Record<string,string>; setFilled: (filled: Record<string,string>) => void; go: (stage: Stage) => void }) {
  const [selected, setSelected] = useState<string | null>(null)
  const count = formula.slots.filter(slot => filled[slot]).length
  const complete = count === formula.slots.length
  const choose = (source: string) => {
    const target = selected || formula.slots.find(slot => !filled[slot])
    if (!target) return
    setFilled({ ...filled, [target]: answers[source] })
    setSelected(null)
  }
  const undo = (slot: string) => { const next = { ...filled }; delete next[slot]; setFilled(next); setSelected(slot) }
  return <main className="page flow-page"><Header title="句型填充" go={go}/><Progress current={2}/><div className="compact-person"><b>{point}</b><span>{formula.title}</span></div><section className="parchment sentence-card"><p>{formula.text.split(/(【[^】]+】)/g).map((part, i) => {
    const match = part.match(/^【([^】]+)】$/)
    if (!match) return <span key={i}>{part}</span>
    const slot = match[1]
    return <button className={'slot ' + (filled[slot] ? 'filled' : '')} aria-pressed={selected === slot} key={i} onClick={() => filled[slot] ? undo(slot) : setSelected(slot)}>{filled[slot] || slot}</button>
  })}</p><div className="sentence-status">{count} / {formula.slots.length} 个槽位已填</div>{complete && <button className="text-action" onClick={() => { const utterance = new SpeechSynthesisUtterance(buildSentence(formula.text, filled)); utterance.lang = 'zh-CN'; window.speechSynthesis?.speak(utterance) }}><Volume2 size={16}/>朗读完整句子</button>}</section><section className="word-bank"><div className="card-title"><span>{selected ? '正在填入：' + selected : '点击词块填入空位'}</span><button onClick={() => { setFilled({}); setSelected(null) }}><RotateCcw size={14}/>重置</button></div><div className="chips">{formula.slots.map(slot => <button className="chip" key={slot} onClick={() => choose(slot)}>{answers[slot]}</button>)}</div></section><button disabled={!complete} className="primary-button bottom-button" onClick={() => go('generate')}>进入独立生成 <ArrowRight size={16}/></button></main>
}

function GeneratePage({ draft, formula, setDraft, finish, go }: { draft: Draft; formula: Formula; setDraft: React.Dispatch<React.SetStateAction<Draft>>; finish: () => void; go: (stage: Stage) => void }) {
  return <main className="page flow-page"><Header title="独立生成" go={go}/><Progress current={3}/><section className="generate-heading"><h2>{draft.point}</h2></section><textarea className="essay-paper" value={draft.essay} onChange={e => setDraft(d => ({ ...d, essay: e.target.value, reviewed: false }))} aria-label="独立论述" placeholder="独立写出完整论述……"/><div className="essay-tools">{draft.essay.length} 字</div><button disabled={!draft.essay.trim()} className="primary-button bottom-button" onClick={() => setDraft(d => ({ ...d, reviewed: true }))}>完成作答，查看对照</button>{draft.reviewed && <section className="reference-card"><h3>前两阶段记录</h3><details><summary>知识定位</summary>{formula.slots.map(slot => <p key={slot}>{slot}：{draft.answers[slot]}</p>)}</details><details><summary>句型填充</summary><p>{buildSentence(formula.text, draft.filled)}</p></details><button className="primary-button bottom-button" onClick={finish}><Check size={16}/>我确认完成，保存并继续</button></section>}</main>
}
function BottomNav({ stage, go }: { stage: Stage; go: (stage: Stage) => void }) { return <nav className="bottom-nav"><button className={stage === 'home' ? 'active' : ''} onClick={() => go('home')}><Home size={18} /><span>首页</span></button><button className={stage === 'map' ? 'active' : ''} onClick={() => go('map')}><MapIcon size={18} /><span>考点地图</span></button><button className={stage === 'library' ? 'active' : ''} onClick={() => go('library')}><Library size={18} /><span>句型库</span></button><button className={stage === 'archive' ? 'active' : ''} onClick={() => go('archive')}><Archive size={18} /><span>学习档案</span></button></nav> }
