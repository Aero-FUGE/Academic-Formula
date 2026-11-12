import './home.css'
import './dragcss.css'

type Props = {
  points: number
  completed: number
  total: number
  patternCount: number
  onKnowledge: () => void
  onFormula: () => void
}

export default function HomePage({ points, completed, total, patternCount, onKnowledge, onFormula }: Props) {
  return <main className="mode-home">
    <header className="mode-heading">
      <span className="mode-eyebrow">THE HIDDEN STUDY</span>
      <h1>学术八股文</h1>
      <p>让知识成为语言，让语言成为本能。</p>
      <div className="mode-rule">✧ ♮ ✧</div>
      <span className="mode-points">★ {points.toLocaleString()}</span>
    </header>
    <section className="mode-cards" aria-label="选择训练模式">
      <button className="mode-card mode-formula" onClick={onFormula}>
        <span className="mode-card-title">句型专项训练</span>
        <span className="mode-card-description">固定句型反复演练<br/>强化学术表达结构</span>
        <span className="mode-card-action">开始句型训练 <span>→</span></span>
      </button>
      <button className="mode-card mode-knowledge" onClick={onKnowledge}>
        <span className="mode-card-title">考点专项训练</span>
        <span className="mode-card-description">跟随考点进度推进<br/>集中提取与表达</span>
        <span className="mode-card-action">开始考点训练 <span>→</span></span>
      </button>
    </section>
    <section className="mode-overview" aria-label="学习概览">
      <h2>学习概览</h2>
      <div><p><span>已完成考点</span><strong>{completed}<small> / {total}</small></strong></p><p><span>可练习句型</span><strong>{patternCount}</strong></p></div>
    </section>
  </main>
}
