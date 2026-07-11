import React, { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { SIGNALS } from '../signals.js'
import { TrendChart } from '../charts.jsx'

const fmt = (d) => new Date(d + 'T00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

export default function Learner({ state, refresh }) {
  const { id } = useParams()
  const learner = state.learners.find((l) => l.id === id)
  const [tab, setTab] = useState('lessons')
  const [copied, setCopied] = useState(false)
  const [translated, setTranslated] = useState(null)
  const [voiceUrl, setVoiceUrl] = useState(null)
  const [busy, setBusy] = useState(null)
  const [noteText, setNoteText] = useState('')
  const [obs, setObs] = useState(null)
  const [lens, setLens] = useState(null)
  const [obsBusy, setObsBusy] = useState(false)
  if (!learner) return <p>Learner not found.</p>

  const f = learner.name.split(' ')[0]
  const ins = learner.insights
  const trans = translated || ins.translated
  const voice = voiceUrl || ins.voiceNoteUrl
  const nextSession = state.sessions.find((s) => s.learnerId === id && !s.done)
  const dates = learner.sessionRatings.map((r) => r.date)
  const breakthroughs = learner.lessons.filter((l) => l.breakthrough)

  const post = (url, body) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })

  const copySummary = async () => {
    await navigator.clipboard.writeText([ins.parentSummary, trans?.text].filter(Boolean).join('\n\n'))
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }
  const translate = async () => { setBusy('translate'); const r = await post('/api/translate', { learnerId: id }); if (r.ok) setTranslated(await r.json()); setBusy(null) }
  const makeVoiceNote = async () => { setBusy('voice'); const r = await post('/api/voice-note', { learnerId: id }); if (r.ok) setVoiceUrl((await r.json()).url); setBusy(null) }
  const addNote = async (e) => { e.preventDefault(); if (!noteText.trim()) return; await post('/api/notes', { learnerId: id, text: noteText }); setNoteText(''); await refresh() }
  const observations = obs || ins.observations
  const regenObs = async (l) => { setObsBusy(true); setLens(l); const r = await post('/api/observations', { learnerId: id, lens: l }); if (r.ok) setObs((await r.json()).observations); setObsBusy(false) }
  const resources = learner.topics.flatMap((t) => (t.resources || []).map((r) => ({ ...r, topic: t.name })))
  const LENSES = [['strengths', 'Strengths'], ['confidence', 'Confidence'], ['pacing', 'Pacing'], ['next-steps', 'Next steps']]

  return (
    <div>
      <div className="breadcrumb"><Link to="/people">← Back to people</Link></div>
      <header className="page-head">
        <div>
          <h1>{learner.name} <span className="h1-grade">{learner.grade}</span></h1>
          <p className="focus-line">{learner.subject} · {learner.age} yrs{learner.readingLevel ? ` · ${learner.readingLevel}` : ''}</p>
        </div>
        <div className="head-actions">
          {nextSession && <Link className="primary" to={`/prepare/${learner.id}?session=${nextSession.id}`}>Prepare Next Lesson</Link>}
          <button className="ghost">Edit profile</button>
        </div>
      </header>

      <div className="mini-dash">
        <div className="mini-dash-item"><span className="mini-dash-num">{learner.sessionsTogether}</span><span className="mini-dash-label">sessions together</span></div>
        <div className="mini-dash-item">
          <span className="mini-dash-num">{nextSession ? nextSession.time : '—'}</span>
          <span className="mini-dash-label">{nextSession ? `next session · ${nextSession.topic}` : 'no session scheduled'}</span>
        </div>
        <div className="mini-dash-item"><span className="mini-dash-num">{breakthroughs.length} <span className="star-mark">★</span></span><span className="mini-dash-label">breakthroughs</span></div>
      </div>

      <div className="profile-grid">
        <div className="profile-left">
          <div className="card"><div className="card-label">Current goal</div><p>{learner.goals}</p></div>
          <div className="card"><div className="card-label">Current challenge</div><p>{learner.challenge}</p></div>
          <div className="card"><div className="card-label">Learning preferences</div><p>{learner.preferences}</p></div>
          <div className="card"><div className="card-label">Teaching timeline</div><p>{fmt(learner.since)}, {learner.since.slice(0, 4)} — Present</p></div>
        </div>

        <div className="profile-right">
          <div className="trend-pair">
            <div className="card">
              <div className="card-label">Confidence trend</div>
              <TrendChart values={learner.sessionRatings.map((r) => r.confidence)} dates={dates} color="var(--ink)" />
            </div>
            <div className="card">
              <div className="card-label">Understanding trend</div>
              <TrendChart values={learner.sessionRatings.map((r) => r.understanding)} dates={dates} color="var(--accent)" />
            </div>
          </div>

          <div className="two">
            <div className="card noticing">
              <div className="card-label">AI observations {ins.model && ins.model !== 'mock' && <span className="via">via {ins.model}</span>}</div>
              <div className="lens-row">
                {LENSES.map(([k, label]) => (
                  <button key={k} className={lens === k ? 'lens on' : 'lens'} onClick={() => regenObs(k)} disabled={obsBusy}>{label}</button>
                ))}
              </div>
              <div className="obs-fade" key={observations.join('|')}>
                {obsBusy ? <p className="obs-loading">Reading {f}'s patterns…</p> : observations.map((o, i) => <p key={i} style={{ animationDelay: `${i * 0.15}s` }}>{o}</p>)}
              </div>
            </div>
            <div className="card">
              <div className="card-label">Suggested strategy</div>
              <p>{ins.recommendations[0]}</p>
              <div className="card-foot">Next focus — {ins.nextFocus}</div>
            </div>
          </div>

          <div className="three">
            <div className="card">
              <div className="card-label">Last reflection</div>
              <p className="reflection-quote">“{learner.timeline[0]?.text}”</p>
              <div className="card-foot">{learner.timeline[0]?.date}</div>
            </div>
            <div className="card">
              <div className="card-label">Next session</div>
              {nextSession
                ? <><p>{nextSession.time}</p><p className="card-foot">{nextSession.topic}</p>{nextSession.prepared && <Link to={`/debrief/${nextSession.id}`} className="mark-done">Mark as done →</Link>}</>
                : <p className="card-foot">Nothing scheduled yet.</p>}
            </div>
            <div className="card">
              <div className="card-label">Breakthrough moments ({breakthroughs.length})</div>
              {breakthroughs.slice(0, 3).map((b, i) => (
                <p className="star-line" key={i}><span className="star-mark">★</span> {b.summary}</p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="secondary-grid">
        <div className="card">
          <div className="card-label">Lessons ({learner.lessons.length})</div>
          {learner.lessons.length === 0 && <p className="empty-hint">No lessons logged yet.</p>}
          <ul className="mini-lessons">
            {learner.lessons.slice(0, 6).map((l, i) => (
              <li className="mini-lesson" key={i}>
                <span className="ml-date">{fmt(l.date)}</span>
                <span className="ml-topic">{l.topic}{l.breakthrough && <span className="star-mark"> ★</span>}</span>
                <span className="ml-delta">U {l.understBefore}<span className="arrow">→</span>{l.understAfter}</span>
              </li>
            ))}
          </ul>
          {learner.lessons.length > 6 && <div className="card-foot">+{learner.lessons.length - 6} more in Lesson history below</div>}
        </div>

        <div className="card noticing">
          <div className="card-label">How {f} learns — measured</div>
          {SIGNALS.map((s) => {
            const v = learner.signals[s.key]
            return (
              <div className="sig-row" key={s.key} title={`${v.avg.toFixed(1)}/5 over ${v.n} sessions`}>
                <span className="sig-label">{s.label}</span>
                <span className="sig-bar-track"><span className="sig-bar" style={{ width: `${v.avg * 20}%` }} /></span>
                <span className="sig-val">{v.avg.toFixed(1)}</span>
              </div>
            )
          })}
        </div>

        <div className="card">
          <div className="card-label">Resources</div>
          {resources.length === 0 && <p className="empty-hint">Attach links on a lesson plan and they collect here.</p>}
          {resources.map((r, i) => (
            <p className="note-item" key={i}><a href={r.url} target="_blank" rel="noreferrer" className="quiet-link accent">{r.title}</a><br /><span className="timeline-date">{r.topic}</span></p>
          ))}
        </div>

        <div className="card">
          <div className="card-label">Notes & sources</div>
          {learner.notes.map((n, i) => <p className="note-item" key={i}><span className="timeline-date">{n.date}</span> — {n.text}</p>)}
          <form className="note-add" onSubmit={addNote}>
            <input value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder={`Keep something about ${f}`} />
            <button className="ghost" type="submit">Add</button>
          </form>
        </div>

        {ins.homework?.length > 0 && (
          <div className="card">
            <div className="card-label">Homework & resources</div>
            <ul className="rec-list">{ins.homework.map((h, i) => <li key={i}>{h}</li>)}</ul>
            {ins.strategyNote && <div className="card-foot">{ins.strategyNote}</div>}
          </div>
        )}

        {ins.parentSummary && (
          <div className="card">
            <div className="card-label">For {f}'s family</div>
            <p className="parent-summary">{ins.parentSummary}</p>
            {trans && <p className="parent-summary translated" lang={trans.language === 'Spanish' ? 'es' : undefined}>{trans.text}</p>}
            {voice && <audio controls src={voice} className="voice-note" />}
            <div className="family-actions">
              <button className="ghost" onClick={copySummary}>{copied ? 'Copied' : 'Copy'}</button>
              {learner.homeLanguage !== 'English' && !trans && (
                <button className="ghost" onClick={translate} disabled={!!busy}>{busy === 'translate' ? '…' : `In ${learner.homeLanguage}`}</button>
              )}
              {!voice && <button className="ghost" onClick={makeVoiceNote} disabled={!!busy}>{busy === 'voice' ? '…' : 'Voice note'}</button>}
            </div>
          </div>
        )}
      </div>

      <div className="history">
        <div className="tabs">
          {[['lessons', 'Lesson history'], ['reflections', 'Reflection history'], ['notes', 'Notes from mentor']].map(([k, label]) => (
            <button key={k} className={tab === k ? 'tab on' : 'tab'} onClick={() => setTab(k)}>{label}</button>
          ))}
        </div>

        {tab === 'lessons' && (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Date</th><th>Topic</th><th>Objective</th><th>Confidence</th><th>Understanding</th><th></th></tr></thead>
              <tbody>
                {learner.lessons.map((l, i) => (
                  <tr key={i}>
                    <td>{fmt(l.date)}</td>
                    <td>{l.topic}</td>
                    <td className="muted-cell">{l.objective}</td>
                    <td><span className="ba">{l.confBefore} <span className="arrow">→</span> {l.confAfter}</span></td>
                    <td><span className="ba">{l.understBefore} <span className="arrow">→</span> {l.understAfter}</span></td>
                    <td>{l.breakthrough && <span className="star-mark">★</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'reflections' && (
          <div className="timeline">
            {learner.timeline.map((t, i) => (
              <div className="timeline-entry" key={i}>
                <div className="timeline-meta">
                  <span className="timeline-date">{t.date}</span>
                  <span className={t.kind === 'breakthrough' ? 'quiet-tag mastered' : 'quiet-tag'}>{t.kind}</span>
                </div>
                <p>{t.text}</p>
              </div>
            ))}
          </div>
        )}

        {tab === 'notes' && (
          <div className="timeline">
            {learner.notes.length === 0 && <p className="empty-hint">No notes yet.</p>}
            {learner.notes.map((n, i) => (
              <div className="timeline-entry" key={i}>
                <div className="timeline-meta"><span className="timeline-date">{n.date}</span></div>
                <p>{n.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
