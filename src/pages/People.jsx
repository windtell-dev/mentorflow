import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Sparkline } from '../charts.jsx'

const FIELDS = [
  ['name', "Learner's name", false],
  ['age', 'Age', true],
  ['grade', 'Grade', true],
  ['subject', 'Subject', true],
  ['focus', 'Topic / focus', true],
  ['goals', 'Current goal', true],
  ['challenge', 'Current challenge', true],
  ['preferences', 'Learning preferences', true],
  ['notes', 'Other notes', true],
]

function AddLearnerModal({ onClose, onAdd }) {
  const [form, setForm] = useState({})
  const [busy, setBusy] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    if (!form.name?.trim()) return
    setBusy(true)
    const res = await fetch('/api/learners', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const { learner } = await res.json()
    setBusy(false)
    onAdd(learner)
  }
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Add a learner</h2>
        <p className="focus-line">Only a name is required — the rest fills in as you teach.</p>
        <form className="modal-form" onSubmit={submit}>
          {FIELDS.map(([key, label, optional]) => (
            <label key={key} className={key === 'notes' || key === 'name' ? 'span-2' : ''}>
              {label}
              {key === 'notes'
                ? <textarea rows={2} value={form[key] || ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
                : <input value={form[key] || ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />}
            </label>
          ))}
          <div className="modal-actions span-2">
            <button type="button" className="ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary" disabled={busy || !form.name?.trim()}>{busy ? 'Adding…' : 'Add learner'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function People({ state, refresh }) {
  const { learners } = state
  const navigate = useNavigate()
  const [modal, setModal] = useState(false)
  const nextFor = (id) => state.sessions.find((s) => s.learnerId === id && !s.done)

  const onAdd = async (learner) => { setModal(false); await refresh(); if (learner) navigate(`/learner/${learner.id}`) }

  return (
    <div>
      <header className="page-head">
        <div>
          <h1>Learners</h1>
          <p className="focus-line">The people you teach. Understand deeply. Teach intentionally.</p>
        </div>
        <button className="primary" onClick={() => setModal(true)}>+ Add learner</button>
      </header>

      <div className="people-list">
        {learners.map((l) => {
          const conf = l.sessionRatings.map((r) => r.confidence)
          const und = l.sessionRatings.map((r) => r.understanding)
          const next = nextFor(l.id)
          return (
            <div className="person-row" key={l.id}>
              <div className="person-id">
                <Link to={`/learner/${l.id}`} className="person-name">{l.name}</Link>
                <span className="person-sub">{l.sessionsTogether} sessions together</span>
                {next && <span className="person-next">Next · {next.time}</span>}
              </div>
              <div className="person-col"><span className="col-label">Goal</span><span className="col-val">{l.goals}</span></div>
              <div className="person-col"><span className="col-label">Challenge</span><span className="col-val">{l.challenge}</span></div>
              <div className="person-trends">
                <span className="col-label">Trends</span>
                <div className="trend-mini"><span className="trend-tag">Confidence</span><Sparkline values={conf} color="var(--ink)" /></div>
                <div className="trend-mini"><span className="trend-tag">Understanding</span><Sparkline values={und} color="var(--accent)" /></div>
              </div>
              <div className="person-actions">
                <Link to={`/learner/${l.id}`} className="ghost">Open profile</Link>
                <button className="primary" onClick={() => navigate(next ? `/prepare/${l.id}?session=${next.id}` : `/prepare/${l.id}`)}>Prepare Next Lesson</button>
              </div>
            </div>
          )
        })}
      </div>

      {modal && <AddLearnerModal onClose={() => setModal(false)} onAdd={onAdd} />}
    </div>
  )
}
