import React, { useCallback, useEffect, useState } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import Learner from './pages/Learner.jsx'
import LessonBuilder from './pages/LessonBuilder.jsx'
import Debrief from './pages/Debrief.jsx'
import People from './pages/People.jsx'
import Lessons from './pages/Lessons.jsx'
import Calendar from './pages/Calendar.jsx'

// Minimal line icons — editorial, not emoji.
const Icon = ({ d }) => (
  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
)
const ICONS = {
  dashboard: <><rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" /></>,
  learners: <><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3 3-5 6-5s6 2 6 5" /><path d="M17 8a3 3 0 0 1 0 6" /><path d="M21 20c0-2-1.5-3.5-3.5-4" /></>,
  prepare: <><path d="M4 4h11l5 5v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" /><path d="M14 4v5h5" /><path d="M9 13h6M9 17h6" /></>,
  lessons: <><path d="M4 5a2 2 0 0 1 2-2h9l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" /><path d="M8 12l2 2 4-4" /></>,
  calendar: <><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /></>,
}

export default function App() {
  const [state, setState] = useState(null)
  const refresh = useCallback(async () => {
    setState(await (await fetch('/api/state')).json())
  }, [])
  useEffect(() => { refresh() }, [refresh])
  if (!state) return <div className="loading">TeachPath</div>

  const links = [
    ['/', 'Dashboard', 'dashboard', true],
    ['/prepare', 'Make lesson plan', 'prepare', false],
    ['/people', 'Learners', 'learners', false],
    ['/lessons', 'Topics / Lessons', 'lessons', false],
    ['/calendar', 'Calendar / Availability', 'calendar', false],
  ]

  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar-brand">
          <span className="wordmark">TeachPath</span>
          <span className="brand-motto">People create understanding.</span>
        </div>
        <nav className="topnav">
          {links.map(([to, label, icon, end]) => (
            <NavLink to={to} key={to} end={end}>
              <Icon d={ICONS[icon]} />{label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="content">
        <Routes>
          <Route path="/" element={<Dashboard state={state} />} />
          <Route path="/people" element={<People state={state} refresh={refresh} />} />
          <Route path="/lessons" element={<Lessons state={state} refresh={refresh} />} />
          <Route path="/calendar" element={<Calendar state={state} />} />
          <Route path="/learner/:id" element={<Learner state={state} refresh={refresh} />} />
          <Route path="/prepare/:id?" element={<LessonBuilder state={state} refresh={refresh} />} />
          <Route path="/debrief/:sessionId" element={<Debrief state={state} refresh={refresh} />} />
        </Routes>
      </main>
    </div>
  )
}
