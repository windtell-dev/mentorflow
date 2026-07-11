import React from 'react'

// Small inline line chart, no axes. values: numbers 1–5.
export function Sparkline({ values, w = 96, h = 34, color = 'var(--accent)' }) {
  if (!values || values.length < 2) return <svg width={w} height={h} aria-hidden="true" />
  const pts = values.map((v, i) => [
    (i / (values.length - 1)) * (w - 6) + 3,
    h - 4 - ((v - 1) / 4) * (h - 8),
  ])
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
  return (
    <svg width={w} height={h} className="spark" aria-hidden="true">
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2" fill={color} />
    </svg>
  )
}

// Trend chart with Low/Medium/High gridlines and a few date labels.
export function TrendChart({ values, dates, color = 'var(--accent)', h = 150 }) {
  const w = 320
  const padL = 44, padR = 12, padT = 14, padB = 22
  const innerW = w - padL - padR
  const innerH = h - padT - padB
  const x = (i) => padL + (values.length === 1 ? innerW / 2 : (i / (values.length - 1)) * innerW)
  const y = (v) => padT + innerH - ((v - 1) / 4) * innerH
  const d = values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
  const bands = [{ label: 'High', v: 5 }, { label: 'Medium', v: 3 }, { label: 'Low', v: 1 }]
  const ticks = dates
    ? [...new Set([0, Math.floor((dates.length - 1) / 2), dates.length - 1])]
    : []
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="trend-chart" preserveAspectRatio="xMidYMid meet">
      {bands.map((b) => (
        <g key={b.label}>
          <line x1={padL} x2={w - padR} y1={y(b.v)} y2={y(b.v)} className="grid-line" />
          <text x={padL - 8} y={y(b.v) + 3} className="axis-label" textAnchor="end">{b.label}</text>
        </g>
      ))}
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {values.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="3" fill={color} />)}
      {ticks.map((i) => (
        <text key={i} x={x(i)} y={h - 5} className="axis-label" textAnchor="middle">{dates[i].slice(5)}</text>
      ))}
    </svg>
  )
}
