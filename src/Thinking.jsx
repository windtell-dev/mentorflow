import React, { useEffect, useState } from 'react'

// Cinematic loader: cycles through step messages while the AI works.
export default function Thinking({ messages, title }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI((x) => Math.min(x + 1, messages.length - 1)), 1500)
    return () => clearInterval(t)
  }, [messages.length])
  return (
    <div className="memory-loading">
      <div className="studious-loader">
        <svg viewBox="0 0 50 50" className="loader-ring"><circle cx="25" cy="25" r="20" /></svg>
        <span className="loader-glyph">✎</span>
      </div>
      {title && <h2 className="memory-title">{title}</h2>}
      <div className="thinking-steps">
        {messages.map((m, idx) => (
          <p key={idx} className={`thinking-step ${idx < i ? 'past' : idx === i ? 'now' : 'next'}`}>
            {idx < i ? '✓' : idx === i ? '○' : '○'} {m}
          </p>
        ))}
      </div>
    </div>
  )
}

// Run an async task but keep the loader visible at least `ms` so it never flashes.
export const withMin = async (promise, ms = 2800) => {
  const [r] = await Promise.all([promise, new Promise((res) => setTimeout(res, ms))])
  return r
}
