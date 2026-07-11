import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const START = 8, END = 20, H = 46 // 8am–8pm, px per hour
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const iso = (d) => d.toISOString().slice(0, 10)

export default function Calendar({ state }) {
  const { tutor, learners, sessions } = state
  const byId = Object.fromEntries(learners.map((l) => [l.id, l]))
  const [weekOffset, setWeekOffset] = useState(0)

  const now = new Date()
  const todayIso = iso(now)
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7) + weekOffset * 7)
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(monday); d.setDate(monday.getDate() + i); return d })
  const range = `${monday.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} – ${days[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`

  const weekIsos = days.map(iso)
  const weekMinutes = sessions.filter((s) => weekIsos.includes(s.date)).reduce((n, s) => n + s.duration, 0)
  const todaySessions = sessions.filter((s) => s.date === todayIso)

  return (
    <div>
      <header className="page-head">
        <div>
          <h1>Calendar</h1>
          <p className="focus-line">Your availability and sessions, one place.</p>
        </div>
      </header>

      <div className="cal-summary">
        <div className="cal-sum-card">
          <div className="card-label">Total hours scheduled this week</div>
          <p className="big-stat">{Math.floor(weekMinutes / 60)}h {weekMinutes % 60}m</p>
        </div>
        <div className="cal-sum-card">
          <div className="card-label">Today's sessions</div>
          {todaySessions.length === 0 && <p className="focus-line">Nothing scheduled today.</p>}
          <div className="cal-today-list">
            {todaySessions.map((s) => (
              <div className="mini-session" key={s.id}>
                <span className="session-time">{s.time}</span>
                <Link to={`/learner/${s.learnerId}`} className="name-link">{byId[s.learnerId].name}</Link>
                <span className="session-topic">{s.topic}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="cal-toolbar">
        <button className="ghost" onClick={() => setWeekOffset(0)}>Today</button>
        <span className="cal-nav"><button className="ghost small" onClick={() => setWeekOffset(weekOffset - 1)}>‹</button><button className="ghost small" onClick={() => setWeekOffset(weekOffset + 1)}>›</button></span>
        <span className="cal-range">{range}</span>
        <span className="cal-week-tag">Week</span>
      </div>

      <div className="cal-head">
        <div className="cal-gutter" />
        {days.map((d, i) => (
          <div className={`cal-day-head ${iso(d) === todayIso ? 'today' : ''}`} key={i}>
            {d.toLocaleDateString('en-US', { weekday: 'short' })} {d.getDate()}
          </div>
        ))}
      </div>
      <div className="cal-body" style={{ height: (END - START) * H }}>
        <div className="cal-gutter">
          {Array.from({ length: END - START }, (_, i) => (
            <div className="cal-hour" key={i} style={{ height: H }}>{((START + i - 1) % 12) + 1}{START + i < 12 ? 'am' : 'pm'}</div>
          ))}
        </div>
        {days.map((d, i) => {
          const avail = tutor.availability.find((a) => a.day === DAY_NAMES[d.getDay()])
          const daySessions = sessions.filter((s) => s.date === iso(d))
          return (
            <div className="cal-col" key={i}>
              {Array.from({ length: END - START }, (_, h) => <div className="cal-slot" key={h} style={{ height: H }} />)}
              {avail && (
                <div className="cal-block avail" style={{ top: (avail.start - START) * H, height: (avail.end - avail.start) * H }}>
                  Available<br />{avail.start > 12 ? avail.start - 12 : avail.start}:00 – {avail.end > 12 ? avail.end - 12 : avail.end}:00
                </div>
              )}
              {daySessions.map((s) => (
                <Link to={`/learner/${s.learnerId}`} key={s.id} className="cal-block session"
                  style={{ top: (s.start - START) * H, height: (s.duration / 60) * H, background: byId[s.learnerId].tint }}>
                  {byId[s.learnerId].name.split(' ')[0]}<br /><span className="cal-time">{s.time}</span>
                </Link>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
