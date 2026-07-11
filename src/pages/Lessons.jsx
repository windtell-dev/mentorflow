import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

const fmt = (d) => new Date(d + 'T00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
const post = (url, body) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })

export default function Lessons({ state, refresh }) {
  const [q, setQ] = useState('')
  const [learnerId, setLearnerId] = useState('all')
  const [topicFilter, setTopicFilter] = useState('all')
  const [view, setView] = useState('list')

  const byId = Object.fromEntries(state.learners.map((l) => [l.id, l]))
  const topicsFor = (r) => state.topics.filter((t) => t.name === r.topic || t.learnerId === r.learner.id)

  const rows = useMemo(() =>
    state.learners
      .flatMap((l) => l.lessons.map((les, i) => ({ ...les, learner: l, _key: `${l.id}-${i}` })))
      .filter((r) => learnerId === 'all' || r.learner.id === learnerId)
      .filter((r) => {
        if (topicFilter === 'all') return true
        if (r.topic === topicFilter) return true
        const gt = state.topics.find((t) => t.name === topicFilter)
        return gt && (gt.learnerId === r.learner.id || gt.subtopics?.includes(r.topic))
      })
      .filter((r) => {
        if (!q) return true
        const subs = topicsFor(r).flatMap((t) => [t.name, ...(t.subtopics || [])]).join(' ')
        const hay = `${r.topic} ${r.objective} ${r.summary} ${r.learner.name} ${subs}`.toLowerCase()
        return q.toLowerCase().split(/\s+/).filter(Boolean).every((w) => hay.includes(w) || hay.includes(w.replace(/s$/, '')))
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1)),
    [state, q, learnerId, topicFilter])

  const toggle = async (r) => { await post('/api/lessons/toggle', { learnerId: r.learner.id, date: r.date, topic: r.topic }); await refresh() }

  const Card = (r) => {
    const done = r.completed !== false
    return (
      <div className={`lesson-card ${view}`} key={r._key}>
        <div className="lesson-card-top">
          <Link to={`/learner/${r.learner.id}`} className="cell-learner">
            <span className="avatar" style={{ background: r.learner.tint }}>{r.learner.name[0]}</span>
            {r.learner.name.split(' ')[0]}
          </Link>
          <span className="muted-cell">{fmt(r.date)}</span>
        </div>
        <div className="lesson-topic">{r.topic}{r.breakthrough && <span className="star-mark"> ★</span>}</div>
        <div className="lesson-obj">{r.objective}</div>
        <p className="lesson-summary">{r.summary}</p>
        <div className="lesson-metrics">
          <span>Conf <b className="ba">{r.confBefore}<span className="arrow">→</span>{r.confAfter}</b></span>
          <span>Underst <b className="ba">{r.understBefore}<span className="arrow">→</span>{r.understAfter}</b></span>
        </div>
        <div className="lesson-foot">
          <span className="quiet-tag">{r.learner.subject}</span>
          <button className={done ? 'status-pill done' : 'status-pill'} onClick={() => toggle(r)}>{done ? '✓ Completed' : 'Mark complete'}</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <header className="page-head">
        <div>
          <h1>Topics / Lessons</h1>
          <p className="focus-line">What you teach, and how each session went.</p>
        </div>
      </header>

      <div className="tl-split">
        <section className="tl-topics">
          <h2 className="section-title flush tl-heading">Topics</h2>
          {state.topics.length === 0 && <p className="empty-hint">No topics yet. Add one from Make lesson plan.</p>}
          <div className="topic-cards">
            {state.topics.map((t) => (
              <div className="topic-card" key={t.id}>
                <div className="topic-item-head">
                  <span className="topic-item-name">{t.name}</span>
                  <span className="quiet-tag">{t.subject}</span>
                </div>
                {t.subtopics?.length > 0 && <div className="subtopics">{t.subtopics.map((s, i) => <span className="subtopic" key={i}>{s}</span>)}</div>}
                {t.description && <p className="topic-desc">{t.description}</p>}
                {t.learnerId && byId[t.learnerId] && <div className="card-foot">for {byId[t.learnerId].name.split(' ')[0]}</div>}
              </div>
            ))}
          </div>
        </section>

        <section className="tl-lessons">
          <div className="tl-lessons-head">
            <h2 className="section-title flush tl-heading">Lesson plans</h2>
            <div className="view-toggle">
              <button className={view === 'list' ? 'seg on' : 'seg'} onClick={() => setView('list')}>List</button>
              <button className={view === 'grid' ? 'seg on' : 'seg'} onClick={() => setView('grid')}>Grid</button>
            </div>
          </div>

          <div className="filter-bar">
            <input className="search" placeholder="Search learner, lesson, topic, subtopic…" value={q} onChange={(e) => setQ(e.target.value)} />
            <select value={learnerId} onChange={(e) => setLearnerId(e.target.value)}>
              <option value="all">All learners</option>
              {state.learners.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
            <select value={topicFilter} onChange={(e) => setTopicFilter(e.target.value)}>
              <option value="all">All topics</option>
              {state.topics.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
            </select>
          </div>

          <div className={view === 'grid' ? 'lesson-grid' : 'lesson-list'}>
            {rows.map(Card)}
          </div>
        </section>
      </div>
    </div>
  )
}
