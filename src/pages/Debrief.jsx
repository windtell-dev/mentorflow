import React, { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Thinking, { withMin } from '../Thinking.jsx'

const post = (url, body) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
const CLICK = [['Yes', 5], ['Somewhat', 3], ['No', 1]]
const CONF = [['Low', 2], ['Medium', 3], ['High', 5]]
const STRATS = ['Diagram', 'Teach-back', 'Analogy', 'Physical object', 'Think-aloud', 'Real-world example']

export default function Debrief({ state, refresh }) {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const session = state.sessions.find((s) => s.id === sessionId)
  const learner = session && state.learners.find((l) => l.id === session.learnerId)
  const [understanding, setUnderstanding] = useState(0)
  const [confidence, setConfidence] = useState(0)
  const [strategyWorked, setStrategyWorked] = useState('')
  const [implemented, setImplemented] = useState([])
  const [note, setNote] = useState('')
  const [wantParentSummary, setWant] = useState(false)
  const [phase, setPhase] = useState('form') // form | loading | done
  const [intel, setIntel] = useState(null)
  const [aiUsed, setAiUsed] = useState(false)
  if (!session) return <p>Session not found.</p>

  const f = learner.name.split(' ')[0]
  const canGo = understanding && confidence

  const generate = async () => {
    setPhase('loading')
    const res = await withMin(post('/api/debrief', {
      learnerId: learner.id, sessionId, understanding, confidence, engagement: understanding,
      clicked: understanding >= 4 ? 'Yes' : understanding >= 3 ? 'Somewhat' : 'No', strategyWorked, implemented, reviewNext: '', confused: '', strategyFailed: '', note, wantParentSummary,
    }), 3000)
    const json = await res.json()
    setIntel(json.intel); setAiUsed(json.aiUsed); await refresh(); setPhase('done')
  }

  if (phase === 'loading')
    return <div className="narrow"><Thinking title={`Updating ${f}'s learner memory`} messages={['Reading your debrief…', 'Updating teaching intelligence…', 'Refreshing confidence & understanding…', 'Saving to learner memory…']} /></div>

  if (phase === 'done') {
    const rows = [
      ['AI observations', intel.observations?.join(' ')],
      ['Teaching timeline entry', intel.timelineEntry],
      ['Next-session recommendation', intel.nextFocus],
      ['Resource / homework', intel.homework?.join(' · ')],
      ['Strategy effectiveness', intel.strategyNote],
      ['Confidence / understanding trend', intel.trendNote],
      ...(intel.parentSummary ? [['Parent / guardian summary', intel.parentSummary]] : []),
    ]
    return (
      <div className="narrow">
        <div className="memory-done-head">
          <div className="check-badge">✓</div>
          <div><h1>Learner memory updated</h1><p className="focus-line">{aiUsed ? 'Gradient AI' : 'Local memory'} updated {f}'s profile.</p></div>
        </div>
        <div className="memory-rows">
          {rows.map(([label, val], i) => (
            <div className="memory-row" key={i} style={{ animationDelay: `${i * 0.08}s` }}><span className="memory-label">{label}</span><span className="memory-val">{val}</span></div>
          ))}
        </div>
        <div className="prepare-actions">
          <Link className="primary" to={`/learner/${learner.id}`}>View updated profile</Link>
          <Link className="ghost" to="/">Back to dashboard</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="narrow">
      <div className="breadcrumb"><Link to="/">← Today</Link></div>
      <header className="page-head"><div><div className="eyebrow">Reflection · {session.topic}</div><h1>How did it go with {f}?</h1><p className="focus-line">A few taps. MentorFlow turns it into {f}'s memory.</p></div></header>

      <div className="debrief-form">
        <fieldset className="rate-block">
          <legend>Did anything click today?</legend>
          <div className="yesno wide">{CLICK.map(([l, v]) => <button key={l} type="button" className={understanding === v ? 'seg on' : 'seg'} onClick={() => setUnderstanding(v)}>{l}</button>)}</div>
        </fieldset>

        <fieldset className="rate-block">
          <legend>How confident did {f} seem?</legend>
          <div className="yesno wide">{CONF.map(([l, v]) => <button key={l} type="button" className={confidence === v ? 'seg on' : 'seg'} onClick={() => setConfidence(v)}>{l}</button>)}</div>
        </fieldset>

        <fieldset className="rate-block">
          <legend>What strategy worked best?</legend>
          <div className="chips">{STRATS.map((s) => <button key={s} type="button" className={strategyWorked === s ? 'chip on' : 'chip'} onClick={() => setStrategyWorked(strategyWorked === s ? '' : s)}>{s}</button>)}</div>
        </fieldset>

        <fieldset className="rate-block">
          <legend>Which of these did you actually use today?</legend>
          <span className="legend-hint">Your honesty trains the teaching-style insights on your dashboard.</span>
          <div className="chips">{STRATS.map((s) => <button key={s} type="button" className={implemented.includes(s) ? 'chip on' : 'chip'} onClick={() => setImplemented(implemented.includes(s) ? implemented.filter((x) => x !== s) : [...implemented, s])}>{s}</button>)}</div>
        </fieldset>

        <label>Anything else? <span className="legend-hint">optional</span><textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="one line worth remembering" /></label>

        <div className="parent-toggle">
          <div><span className="parent-toggle-q">Generate a parent / guardian summary?</span><span className="legend-hint">A warm note for {f}'s family.</span></div>
          <div className="yesno"><button className={wantParentSummary ? 'seg on' : 'seg'} onClick={() => setWant(true)}>Yes</button><button className={!wantParentSummary ? 'seg on' : 'seg'} onClick={() => setWant(false)}>No</button></div>
        </div>

        <button className="primary big" onClick={generate} disabled={!canGo}>✦ Generate teaching intelligence</button>
        {!canGo && <p className="legend-hint">Answer the first two to continue.</p>}
      </div>
    </div>
  )
}
