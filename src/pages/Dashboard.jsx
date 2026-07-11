import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { withMin } from '../Thinking.jsx'

const greeting = () => {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}
const longDate = () => new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

// ---- Ask MentorFlow (compact, not chat-first) ----
function AskCard() {
  const [q, setQ] = useState('')
  const [answer, setAnswer] = useState('')
  const [busy, setBusy] = useState(false)
  const ask = async (e) => {
    e.preventDefault()
    if (!q.trim()) return
    setBusy(true); setAnswer('')
    const res = await fetch('/api/ask', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: q }) })
    setAnswer((await res.json()).answer); setBusy(false)
  }
  return (
    <div className="card ask-card">
      <div className="card-label">Ask MentorFlow</div>
      <form className="ask-form" onSubmit={ask}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask about lesson planning or learners…" />
        <button className="primary" type="submit" disabled={busy}>{busy ? '…' : 'Ask'}</button>
      </form>
      {(busy || answer) && <p className="ask-answer">{busy ? 'Thinking…' : answer}</p>}
    </div>
  )
}

// ---- AI Teaching Style Insights (the mentor's own patterns) ----
const GEN_MSGS = ['Reading your sessions…', 'Finding your patterns…', 'Scoring what actually works…']
function GenLine() {
  const [i, setI] = useState(0)
  useEffect(() => { const t = setInterval(() => setI((x) => (x + 1) % GEN_MSGS.length), 1200); return () => clearInterval(t) }, [])
  return <div className="gen-line"><span className="gen-spark">✦</span> {GEN_MSGS[i]}</div>
}

function InsightsCard({ initial }) {
  const [data, setData] = useState(initial || null)
  const [busy, setBusy] = useState(false)
  const [tooLittle, setTooLittle] = useState(false)
  const gen = async () => {
    setBusy(true); setTooLittle(false)
    const res = await withMin(fetch('/api/teaching-style', { method: 'POST' }), 2400)
    const j = await res.json()
    if (!j.enoughData) setTooLittle(true)
    else setData({ insights: j.insights, correlations: j.correlations })
    setBusy(false)
  }
  return (
    <div className="card insight-card">
      <div className="insight-head">
        <div className="card-label"><span className="gen-spark still">✦</span> AI Teaching Style Insights</div>
        {data && !busy && <button className="refresh-link" onClick={gen} title="Regenerate">↻</button>}
      </div>

      {busy && <GenLine />}
      {!busy && tooLittle && <p className="insight-empty">Teach a few more sessions and your teaching-style insights will appear here.</p>}

      {!busy && !tooLittle && !data && (
        <div className="insight-empty-cta">
          <p>See what your own teaching data reveals — the moves that keep landing across all your learners.</p>
          <button className="primary" onClick={gen}>Generate insights</button>
        </div>
      )}

      {!busy && data && (
        <>
          <ul className="insight-list">
            {data.insights.map((t, i) => <li key={i}><span className="insight-check">✓</span><span>{t}</span></li>)}
          </ul>
          {data.correlations?.length > 0 && (
            <div className="corr-block">
              <div className="corr-title">What correlates with gains</div>
              {data.correlations.slice(0, 3).map((c, i) => (
                <div className="corr-row" key={i}>
                  <span className="corr-name">{c.strategy}</span>
                  <span className={c.avgDelta >= 0 ? 'corr-val up' : 'corr-val down'}>{c.avgDelta >= 0 ? '+' : ''}{c.avgDelta}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ---- Weekly recommendation (derived from availability + active learners) ----
const WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
function weeklyPlan(tutor) {
  const avail = Object.fromEntries((tutor.availability || []).map((a) => [a.day, a.end - a.start]))
  const days = WEEK.map((day) => {
    const h = avail[day] || 0
    return { day: day.slice(0, 3), hours: h, students: h ? Math.max(1, Math.round(h / 1.5)) : 0 }
  })
  const max = WEEK.reduce((n, d) => n + (avail[d] || 0), 0)
  return { days, max }
}

export default function Dashboard({ state }) {
  const { tutor, learners, sessions } = state
  const byId = Object.fromEntries(learners.map((l) => [l.id, l]))
  const hours = Math.floor(tutor.totalMinutes / 60)
  const { days, max } = weeklyPlan(tutor)

  const actions = [
    { to: '/prepare', title: 'Make Lesson Plan', icon: '✎' },
    { to: '/people', title: 'Review Learners', icon: '◐' },
    { to: '/calendar', title: 'Open Calendar', icon: '▦' },
  ]

  return (
    <div className="dashboard">
      <header className="dash-hero">
        <h1>{greeting()}, Mentor.</h1>
        <p className="hero-sub">You're making a real difference in your learners' lives.</p>
      </header>

      <div className="dash-grid">
        <div className="dash-main">
          <div className="stat-strip">
            <div className="stat"><span className="stat-num">{hours}h {tutor.totalMinutes % 60}m</span><span className="stat-label">teaching together</span></div>
            <div className="stat"><span className="stat-num">{learners.length}</span><span className="stat-label">learners helped</span></div>
            <div className="stat"><span className="stat-num">{tutor.breakthroughs} <span className="star-mark">★</span></span><span className="stat-label">breakthrough moments</span></div>
          </div>

          <div className="today-card">
            <div className="today-head">
              <h2 className="section-title flush">Today's sessions</h2>
              <span className="today-date">{longDate()}</span>
            </div>
            <div className="today-board">
              {sessions.map((s) => {
                const l = byId[s.learnerId]
                return (
                  <div className="today-row" key={s.id}>
                    <span className="today-time">{s.time}</span>
                    <span className="today-rail"><span className="today-dot" style={{ background: l.tint }} /></span>
                    <span className="today-body">
                      <Link to={`/learner/${l.id}`} className="name-link">{l.name}</Link>
                      <span className="session-topic">{s.topic} · {s.duration} min</span>
                    </span>
                    <span className="today-action">
                      {s.done ? <span className="quiet-tag done-tag">✓ done</span>
                        : s.prepared ? <Link to={`/debrief/${s.id}`} className="mark-done">Mark as done</Link>
                          : <Link to={`/prepare/${s.learnerId}?session=${s.id}`} className="quiet-link accent">Prepare →</Link>}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="card weekly-card">
            <div className="weekly-head">
              <div className="card-label"><span className="gen-spark still">✦</span> AI Weekly Recommendation</div>
              <span className="legend-hint">Based on your availability and learner needs</span>
            </div>
            <div className="week-days">
              {days.map((d) => (
                <div className={d.hours ? 'week-day' : 'week-day rest'} key={d.day}>
                  <span className="week-dow">{d.day}</span>
                  {d.hours ? <><span className="week-count">{d.students} {d.students === 1 ? 'learner' : 'learners'}</span><span className="week-hrs">~{d.hours}h</span></>
                    : <span className="week-rest">Rest day</span>}
                </div>
              ))}
              <div className="week-day max">
                <span className="week-dow">Max / week</span>
                <span className="week-count big">{max}h</span>
              </div>
            </div>
          </div>

          <AskCard />
        </div>

        <aside className="dash-side">
          <InsightsCard initial={tutor.teachingStyle} />
          <div className="card qa-card">
            <div className="card-label">Quick actions</div>
            <div className="qa-tiles">
              {actions.map((a) => (
                <Link to={a.to} key={a.to} className="qa-tile">
                  <span className="qa-icon">{a.icon}</span>
                  <span className="qa-label">{a.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
