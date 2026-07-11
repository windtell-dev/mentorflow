import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Thinking, { withMin } from '../Thinking.jsx'

const post = (url, body) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
const SECTIONS = ['Arrival warm-up', 'Main activity & objectives', 'Socratic questions', 'Check for understanding', 'Resource recommendations', 'Activities', 'Misconceptions', 'Wind-down', 'Suggested strategy']
const STYLES = [['visual', 'Visual examples'], ['reading', 'Reading'], ['thinkAloud', 'Think aloud'], ['handsOn', 'Hands-on'], ['discussion', 'Discussion']]
const isNew = (l) => l.sessionsTogether === 0 && !l.onboarded

export default function LessonBuilder({ state, refresh }) {
  const { id } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const [learnerId, setLearnerId] = useState(id || state.learners[0].id)
  const learner = state.learners.find((l) => l.id === learnerId)
  const scheduled = state.sessions.find((s) => s.id === params.get('session')) || state.sessions.find((s) => s.learnerId === learnerId && !s.done)

  const topicOptions = (lid) => {
    const l = state.learners.find((x) => x.id === lid)
    return [...new Set([
      ...state.topics.filter((t) => !t.learnerId || t.learnerId === lid).map((t) => t.name),
      ...l.topics.map((t) => t.name), l.insights.nextFocus, l.focus,
    ].filter(Boolean))]
  }

  const [phase, setPhase] = useState(isNew(learner) ? 'intro' : 'idle')
  const [topic, setTopic] = useState(topicOptions(learnerId)[0] || '')
  const [duration, setDuration] = useState(scheduled?.duration || 60)
  const [description, setDescription] = useState('')
  const [attachments, setAttachments] = useState([])
  const [attTitle, setAttTitle] = useState('')
  const [attUrl, setAttUrl] = useState('')
  const [sections, setSections] = useState(SECTIONS)
  const [topicModal, setTopicModal] = useState(false)
  const [mt, setMt] = useState({ name: '', subtopics: '' })
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [time, setTime] = useState('16:00')
  const [plan, setPlan] = useState(null)
  const [ob, setOb] = useState({ subject: '', topic: '', confidence: 0, styles: [] })

  useEffect(() => {
    if (phase === 'intro') { const t = setTimeout(() => setPhase('onboard'), 2600); return () => clearTimeout(t) }
  }, [phase])

  const ins = learner.insights
  const weakest = Object.entries(learner.signals).sort((a, b) => a[1].avg - b[1].avg)[0]
  const WEAK = { visual: 'visual demonstration', verbal: 'word-heavy explanation', thinkAloud: 'thinking aloud', realWorld: 'real-world framing', teachBack: 'teaching it back' }

  const changeLearner = (lid) => {
    const l = state.learners.find((x) => x.id === lid)
    setLearnerId(lid); setPlan(null); setTopic(topicOptions(lid)[0] || ''); setSections(SECTIONS)
    setPhase(isNew(l) ? 'intro' : 'idle')
  }
  const toggleSection = (s) => setSections(sections.includes(s) ? sections.filter((x) => x !== s) : [...sections, s])
  const toggleStyle = (s) => setOb({ ...ob, styles: ob.styles.includes(s) ? ob.styles.filter((x) => x !== s) : [...ob.styles, s] })
  const addAttachment = () => { if (!attUrl.trim()) return; setAttachments([...attachments, { title: attTitle.trim() || attUrl.trim(), url: attUrl.trim() }]); setAttTitle(''); setAttUrl('') }

  const saveTopic = async () => {
    if (!mt.name.trim()) return
    await post('/api/topics', { name: mt.name, subject: learner.subject, learnerId, subtopics: mt.subtopics })
    await refresh(); setTopic(mt.name.trim()); setMt({ name: '', subtopics: '' }); setTopicModal(false)
  }

  const submitOnboard = async () => {
    setPhase('building')
    await withMin(post('/api/learners/onboard', { learnerId, ...ob }), 3400)
    await refresh()
    if (ob.topic) setTopic(ob.topic)
    setPhase('idle')
  }

  const generate = async () => {
    setPhase('analyzing')
    const res = await withMin(post('/api/lesson', { learnerId, topic, duration, description, attachments, sections }), 3000)
    setPlan((await res.json()).plan); setPhase('plan')
  }
  const saveToPlans = async () => { await post('/api/lesson', { learnerId, topic, duration, description, attachments, save: true, plan, sessionId: scheduled?.id }); await refresh(); navigate('/lessons') }
  const schedule = async () => { await post('/api/schedule', { learnerId, topic, date, time, duration }); await refresh(); navigate('/calendar') }

  // ---- loader phases ----
  if (phase === 'intro')
    return <div className="prepare-layout"><div className="prepare-main"><Thinking title={`Let's get to know ${learner.name.split(' ')[0]}.`} messages={['This helps MentorFlow personalize future sessions.']} /></div></div>
  if (phase === 'building')
    return <div className="prepare-layout"><div className="prepare-main"><Thinking title={`Building ${learner.name.split(' ')[0]}'s profile`} messages={['Building learner profile…', 'Analyzing teaching preferences…', 'Creating lesson strategy…', 'Preparing session…']} /></div></div>
  if (phase === 'analyzing')
    return <div className="prepare-layout"><div className="prepare-main"><Thinking title={`Preparing ${learner.name.split(' ')[0]}'s session`} messages={['Analyzing learner…', 'Reading lesson history…', 'Finding misconceptions…', 'Preparing session…']} /></div></div>

  // ---- first-time onboarding form ----
  if (phase === 'onboard')
    return (
      <div className="narrow">
        <header className="page-head"><div><div className="eyebrow">New learner</div><h1>Getting to know {learner.name.split(' ')[0]}</h1><p className="focus-line">A few taps so MentorFlow can personalize every future session.</p></div></header>
        <div className="debrief-form">
          <label>What subject?<input value={ob.subject} onChange={(e) => setOb({ ...ob, subject: e.target.value })} placeholder="e.g. Math, Reading" /></label>
          <label>First topic <span className="legend-hint">this becomes a topic you can reuse</span>
            <select value={ob.topic} onChange={(e) => setOb({ ...ob, topic: e.target.value })}>
              <option value="">Select a topic…</option>
              {[...new Set(state.topics.map((t) => t.name).concat(state.learners.flatMap((l) => l.topics.map((t) => t.name))).filter(Boolean))].map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </label>
          <fieldset className="rate-block">
            <legend>Current confidence</legend>
            <div className="yesno">{[['Low', 2], ['Medium', 3], ['High', 5]].map(([l, v]) => (
              <button key={l} type="button" className={ob.confidence === v ? 'seg on' : 'seg'} onClick={() => setOb({ ...ob, confidence: v })}>{l}</button>
            ))}</div>
          </fieldset>
          <fieldset className="rate-block">
            <legend>How does {learner.name.split(' ')[0]} usually respond?</legend>
            <div className="chips">{STYLES.map(([k, label]) => (
              <button key={k} type="button" className={ob.styles.includes(k) ? 'chip on' : 'chip'} onClick={() => toggleStyle(k)}>{label}</button>
            ))}</div>
          </fieldset>
          <button className="primary big" onClick={submitOnboard} disabled={!ob.confidence}>✦ Build learner profile</button>
        </div>
      </div>
    )

  // ---- normal builder ----
  return (
    <div className="prepare-layout">
      <div className="prepare-main">
        <header className="page-head"><div><h1>Prepare Lesson</h1><p className="focus-line">Plan intentionally. Teach with purpose.</p></div></header>

        <div className="prepare-fields">
          <label>Learner
            <select value={learnerId} onChange={(e) => changeLearner(e.target.value)}>{state.learners.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}</select>
          </label>
          <label>Working on
            <div className="inline-add">
              <select value={topic} onChange={(e) => setTopic(e.target.value)}>{topicOptions(learnerId).map((t) => <option key={t} value={t}>{t}</option>)}</select>
              <button type="button" className="ghost small" onClick={() => setTopicModal(true)}>+ topic</button>
            </div>
          </label>
          <label>Minutes
            <select value={duration} onChange={(e) => setDuration(+e.target.value)}>{[30, 45, 60, 90].map((d) => <option key={d} value={d}>{d}</option>)}</select>
          </label>
          <label>Date
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label>Time
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </label>
        </div>
        <div className="prepare-cal-row">
          <button type="button" className="ghost small" onClick={schedule}>+ Add to calendar</button>
          <span className="legend-hint">Adds this session to the calendar at the date & time above.</span>
        </div>

        <span className="attach-label lesson-structure-label">Lesson Structure:</span>
        <div className="bento">
          <div className="card"><div className="card-label">Session objective</div><p>{plan?.goal || `Represent and compare ${topic.toLowerCase()} with confidence.`}</p></div>
          <div className="card noticing"><div className="card-label">AI observations</div><p>{ins.observations[0]}</p></div>
          <div className="card"><div className="card-label">Current goal</div><p>{learner.goals}</p></div>
          <div className="card"><div className="card-label">Suggested strategy</div><p>{ins.recommendations?.[0]}</p></div>
          <div className="card"><div className="card-label">Current challenge</div><p>{learner.challenge}</p></div>
          <div className="card"><div className="card-label">Last session summary</div><p>{learner.lessons[0]?.summary || learner.lastNote}</p></div>
        </div>

        <span className="attach-label">Include in the plan <span className="legend-hint">tap to choose sections</span></span>
        <div className="chips section-chips">
          {SECTIONS.map((s) => <button key={s} className={sections.includes(s) ? 'chip on' : 'chip'} onClick={() => toggleSection(s)}>{s}</button>)}
        </div>

        <label className="full-label">Description <span className="legend-hint">optional</span>
          <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. short attention today, bring back the pizza model" />
        </label>

        <div className="attach-block">
          <span className="attach-label">Resources for this lesson <span className="legend-hint">links to videos, PDFs, worksheets</span></span>
          {attachments.map((a, i) => (
            <div className="attach-row" key={i}>
              <a href={a.url} target="_blank" rel="noreferrer" className="quiet-link accent">{a.title} ↗</a>
              <button type="button" className="ghost small" onClick={() => setAttachments(attachments.filter((_, j) => j !== i))}>remove</button>
            </div>
          ))}
          <div className="attach-add">
            <input placeholder="Title" value={attTitle} onChange={(e) => setAttTitle(e.target.value)} />
            <input placeholder="https://…" value={attUrl} onChange={(e) => setAttUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAttachment())} />
            <button type="button" className="ghost" onClick={addAttachment}>Add</button>
          </div>
        </div>

        {plan && (
          <>
            <span className="attach-label">Lesson plan</span>
            <div className="plan-grid">
              {plan.sections.map((s, i) => (
                <div className="plan-card" key={i}>
                  <div className="plan-card-head"><span className="plan-card-title">{s.title}</span><span className="plan-cell-min">{s.minutes} min</span></div>
                  {String(s.detail).split(/\n+/).filter(Boolean).map((part, j) => {
                    const m = part.match(/^([A-Z][^:]{2,32}):\s*(.+)$/)
                    return m
                      ? <div className="plan-sub" key={j}><span className="plan-sub-h">{m[1]}</span><p>{m[2]}</p></div>
                      : <p key={j}>{part}</p>
                  })}
                </div>
              ))}
            </div>
            {plan.materials?.length > 0 && <p className="materials">Bring: {plan.materials.join(' · ')}</p>}
          </>
        )}

        <div className="prepare-actions">
          <button className="ghost" onClick={generate}>{plan ? '✦ Regenerate with AI' : '✦ Generate plan with AI'}</button>
          {plan && <button className="primary" onClick={saveToPlans}>Save to lesson plans</button>}
        </div>
      </div>

      <aside className="ai-rail">
        <div className="card-label">AI Assistant · {learner.name.split(' ')[0]}</div>
        <div className="ai-block"><h4>What {learner.name.split(' ')[0]} needs today</h4><p>{ins.nextFocus}</p></div>
        <div className="ai-block"><h4>Possible blockers</h4><p>{learner.challenge}. Weakest channel: {WEAK[weakest[0]]} ({weakest[1].avg.toFixed(1)}/5).</p></div>
        <div className="ai-block"><h4>Recommended teaching move</h4><p>{ins.recommendations?.[1] || ins.recommendations?.[0]}</p></div>
        <div className="ai-block"><h4>Questions to ask</h4><ul className="rec-list"><li>What do you notice?</li><li>How do you know?</li><li>Can you prove it another way?</li></ul></div>
        <div className="ai-block"><h4>Confidence support</h4><p>Remind {learner.name.split(' ')[0]}: struggling means your brain is growing.</p></div>
      </aside>

      {topicModal && (
        <div className="modal-backdrop" onClick={() => setTopicModal(false)}>
          <div className="modal small" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Add a topic</h2>
            <p className="focus-line">One main topic; add as many subtopics as you like.</p>
            <div className="modal-form single">
              <label>Topic name<input autoFocus value={mt.name} onChange={(e) => setMt({ ...mt, name: e.target.value })} placeholder="e.g. Fractions on the number line" onKeyDown={(e) => e.key === 'Enter' && saveTopic()} /></label>
              <label>Subtopics <span className="legend-hint">comma-separated</span><input value={mt.subtopics} onChange={(e) => setMt({ ...mt, subtopics: e.target.value })} placeholder="Equivalent fractions, Comparing fractions" /></label>
              <div className="modal-actions">
                <button className="ghost" onClick={() => setTopicModal(false)}>Cancel</button>
                <button className="primary" onClick={saveTopic} disabled={!mt.name.trim()}>Save topic</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
