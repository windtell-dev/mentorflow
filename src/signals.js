// The fixed learning-signal spectrums every learner is observed on.
// Same set for everyone — that's what makes the data comparable over time.
export const SIGNALS = [
  { key: 'visual', label: 'Understands after a visual demonstration' },
  { key: 'verbal', label: 'Follows word-heavy explanations' },
  { key: 'thinkAloud', label: 'Answers correctly when thinking aloud' },
  { key: 'realWorld', label: 'Real-world examples make it click' },
  { key: 'teachBack', label: 'Can teach the idea back' },
]

export const STRUGGLES = ['vocabulary', 'core concept', 'attention', 'confidence', 'pacing']
