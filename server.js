import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import seed from './seed.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_FILE = path.join(__dirname, 'data.json')

// ponytail: JSON file as the whole database — fine for a hackathon single-tutor demo
let db = fs.existsSync(DATA_FILE) ? JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) : seed
if (!db.topics) db.topics = []
if (!db.tutor.strategyLog) db.tutor.strategyLog = [] // mentor's self-reported strategy use → outcome
const save = () => fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2))
const TINTS = ['#efe4c0', '#cdd9ea', '#ddd3ec', '#d4e3d2', '#e8d3cb', '#d3e0e4']

const app = express()
app.use(express.json())

// ---------- Gradient AI (DigitalOcean serverless inference) ----------

// One key, three Gradient surfaces: deep chat model for synthesis,
// fast chat model for lightweight language work, async TTS for voice notes.
const BASE = 'https://inference.do-ai.run/v1'
const KEY = process.env.DIGITAL_OCEAN_MODEL_ACCESS_KEY
const MODEL_DEEP = process.env.DIGITAL_OCEAN_MODEL || 'openai-gpt-5.5'
const MODEL_FAST = process.env.DIGITAL_OCEAN_MODEL_FAST || 'openai-gpt-5.4-mini'
const MODEL_TTS = process.env.DIGITAL_OCEAN_MODEL_TTS || 'fal-ai/elevenlabs/tts/multilingual-v2'
const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` }

async function chat(system, user, model = MODEL_DEEP) {
  if (!KEY) return null
  try {
    const res = await fetch(`${BASE}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.6,
      }),
    })
    if (!res.ok) throw new Error(`Gradient ${res.status}`)
    const json = await res.json()
    return json.choices?.[0]?.message?.content || null
  } catch (err) {
    console.error(`Gradient (${model}) failed, falling back to mock:`, err.message)
    return null
  }
}

async function gradient(system, user, model = MODEL_DEEP) {
  const text = await chat(system, user, model)
  if (!text) return null
  // Model may wrap JSON in code fences
  const match = text.match(/\{[\s\S]*\}/)
  try { return match ? JSON.parse(match[0]) : null } catch { return null }
}

// fal TTS via async-invoke: submit → poll → fetch result → first audio URL
async function speak(text) {
  if (!KEY) return null
  try {
    const submit = await fetch(`${BASE}/async-invoke`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ model_id: MODEL_TTS, input: { text } }),
    })
    if (!submit.ok) throw new Error(`submit ${submit.status}`)
    const { request_id } = await submit.json()
    for (let i = 0; i < 40; i++) {
      await new Promise((r) => setTimeout(r, 2000))
      const s = await (await fetch(`${BASE}/async-invoke/${request_id}/status`, { headers })).json()
      if (s.status === 'COMPLETED') break
      if (i === 39) throw new Error('timed out')
    }
    const result = await (await fetch(`${BASE}/async-invoke/${request_id}`, { headers })).json()
    const url = JSON.stringify(result).match(/https?:\/\/[^"]+/)?.[0]
    if (!url) throw new Error('no audio url in result')
    return url
  } catch (err) {
    console.error('Gradient TTS failed:', err.message)
    return null
  }
}

const first = (name) => name.split(' ')[0]

function mockLessonPlan(learner, topic, duration) {
  const f = first(learner.name)
  const best = Object.entries(learner.signals).sort((a, b) => b[1].avg - a[1].avg)[0][0]
  return {
    goal: `${f} can explain ${topic.toLowerCase()} back in their own words by the end of the session.`,
    sections: [
      { title: 'Arrive & reconnect', minutes: 5, detail: `Ask ${f} about their week before touching the material. Last time: "${learner.lastNote}" — mention it so they know you remembered.` },
      { title: 'Warm start on familiar ground', minutes: Math.round(duration * 0.2), detail: `Begin with something ${f} already owns: ${learner.topics.filter((t) => t.status === 'mastered').map((t) => t.name.toLowerCase()).join(', ') || 'last session\'s win'}. ${learner.insights.recommendations[0]}` },
      { title: `Core work: ${topic}`, minutes: Math.round(duration * 0.45), detail: `Introduce ${topic} through ${f}'s strongest channel (${SIGNAL_LABELS[best]}). One concept at a time — the data says ${SIGNAL_LABELS[Object.entries(learner.signals).sort((a, b) => a[1].avg - b[1].avg)[0][0]]} is the weak channel, so don't carry the new idea over it.` },
      { title: 'They teach it back', minutes: Math.round(duration * 0.2), detail: `Have ${f} explain the idea back to you in their own words. Listening for understanding, not correctness.` },
      { title: 'Wind down & one win', minutes: 5, detail: `End by naming one specific thing ${f} did well today. It seeds your reflection.` },
    ],
    materials: ['Paper and something to fold or cut', 'Last session\'s work for continuity'],
  }
}

const SIGNAL_LABELS = {
  visual: 'understands after a visual demonstration',
  verbal: 'follows word-heavy explanations',
  thinkAloud: 'answers correctly when thinking aloud',
  realWorld: 'real-world examples make it click',
  teachBack: 'can teach the idea back',
}

const signalSummary = (signals) =>
  Object.entries(signals)
    .map(([k, v]) => `${SIGNAL_LABELS[k]}: ${v.avg.toFixed(1)}/5 over ${v.n} sessions`)
    .join('; ')

// ---------- API ----------

app.get('/api/state', (_req, res) => res.json(db))

app.post('/api/lesson', async (req, res) => {
  const { learnerId, topic, duration = 60, sessionId, description = '', attachments = [], sections = [], save: persist = false, plan: given } = req.body
  const learner = db.learners.find((l) => l.id === learnerId)
  if (!learner) return res.status(404).json({ error: 'learner not found' })

  // Saving the shown plan: skip the AI call, persist exactly what the mentor saw
  if (persist && given) {
    const session = db.sessions.find((s) => s.id === sessionId) || db.sessions.find((s) => s.learnerId === learnerId && !s.done)
    if (session) { session.plan = { topic, duration, ...given }; session.prepared = true; session.topic = topic }
    const entry = { id: `lp-${Date.now()}`, date: new Date().toISOString().slice(0, 10), topic, duration, description, attachments, plan: given }
    learner.lessonPlans.unshift(entry)
    save()
    return res.json({ plan: given, lessonPlanId: entry.id })
  }

  const wanted = sections.length ? `Include ONLY these sections, in this order: ${sections.join(', ')}.` : 'Use 5 sections from arrival to wind-down.'
  const ai = await gradient(
    `You help a mentor prepare a one-on-one session. You receive MEASURED DATA about how this learner learns. Your job is teaching decisions — approach, sequencing, pacing, difficulty — never to explain the subject itself. Respond with JSON only: {"goal":string,"sections":[{"title":string,"minutes":number,"detail":string}],"materials":[string]}. goal is one sentence the learner should achieve. ${wanted} Route new ideas through the learner's strongest channels and calibrate difficulty to the understanding trend. Warm, specific, human tone.`,
    JSON.stringify({
      learner: { name: learner.name, age: learner.age, grade: learner.grade, subject: learner.subject, readingLevel: learner.readingLevel, focus: learner.focus, goals: learner.goals },
      learningSpectrums: signalSummary(learner.signals),
      understandingTrend: learner.sessionRatings.map((r) => `${r.date}: ${r.understanding}/5`).join(', '),
      topics: learner.topics.map((t) => `${t.name} (${t.status})`).join(', '),
      lastSessionNote: learner.lastNote,
      currentRecommendations: learner.insights.recommendations,
      requestedSections: sections,
      session: { topic, minutes: duration, mentorDescription: description || 'none', attachedResources: attachments.map((a) => a.title).join(', ') || 'none' },
    })
  )
  const plan = ai || mockLessonPlan(learner, topic, duration)
  res.json({ plan }) // preview only — persisted when the mentor clicks Save to lesson plans
})

// Freeform notes & sources pinned to a learner's profile
app.post('/api/notes', (req, res) => {
  const learner = db.learners.find((l) => l.id === req.body.learnerId)
  if (!learner) return res.status(404).json({ error: 'learner not found' })
  const text = (req.body.text || '').trim()
  if (!text) return res.status(400).json({ error: 'empty note' })
  learner.notes.unshift({ date: new Date().toISOString().slice(0, 10), text })
  save()
  res.json({ notes: learner.notes })
})

// Data-driven mock debrief when Gradient is unavailable
function mockDebrief(learner, d) {
  const f = first(learner.name)
  const best = Object.entries(learner.signals).sort((a, b) => b[1].avg - a[1].avg)[0][0]
  return {
    observations: [
      `${f} ${SIGNAL_LABELS[best]} (${learner.signals[best].avg.toFixed(1)}/5). Today confidence read ${d.confidence}/5 and engagement ${d.engagement}/5${d.clicked ? `, with "${d.clicked}" clicking` : ''}.`,
      d.confused ? `Friction point: ${d.confused}. ${d.understanding < 3 ? 'The idea is not anchored yet.' : 'The concept is landing; the block is elsewhere.'}` : `No major friction — pacing looks right.`,
    ],
    timelineEntry: [d.clicked && `${d.clicked} clicked`, d.confused && `confused by ${d.confused}`].filter(Boolean).join('; ') || `Worked on ${learner.focus}.`,
    parentSummary: d.wantParentSummary ? `${f} had a good session. ${d.clicked ? `A highlight: ${d.clicked}.` : ''} ${d.confused ? `We're still working through ${d.confused.toLowerCase()} — a normal part of this stage.` : ''} The best help at home is low-pressure practice and noticing effort out loud.` : null,
    nextFocus: d.reviewNext || `Revisit ${d.confused || learner.focus}.`,
    recommendations: [
      d.strategyWorked ? `Keep leaning on: ${d.strategyWorked}.` : `Lead with ${f}'s strongest channel.`,
      d.strategyFailed ? `Ease off: ${d.strategyFailed} didn't land today.` : `Put the hardest idea in the first twenty minutes.`,
      d.reviewNext ? `Open next session on: ${d.reviewNext}.` : `Warm up with a confidence win.`,
    ],
    homework: [d.reviewNext ? `Light practice on ${d.reviewNext}.` : `Five easy problems to keep confidence up.`, `Ten quiet minutes on ${learner.subject.toLowerCase()} at home.`],
    strategyNote: `${d.strategyWorked ? `"${d.strategyWorked}" worked` : 'strategy steady'}${d.strategyFailed ? `; "${d.strategyFailed}" fell flat` : ''}.`,
    trendNote: `Confidence ${d.confidence}/5, understanding ${d.understanding}/5 this session.`,
  }
}

// Debrief: mentor marks a session done → structured teaching intelligence out.
app.post('/api/debrief', async (req, res) => {
  const { learnerId, sessionId, understanding = 3, confidence = 3, engagement = 3,
    clicked = '', confused = '', strategyWorked = '', strategyFailed = '', reviewNext = '', wantParentSummary = false } = req.body
  const learner = db.learners.find((l) => l.id === learnerId)
  if (!learner) return res.status(404).json({ error: 'learner not found' })

  const date = new Date().toISOString().slice(0, 10)
  const session = db.sessions.find((s) => s.id === sessionId)
  if (session) { session.done = true; db.tutor.totalMinutes += session.duration || 0 }

  // Fold ratings into the trends — the app remembers, the model interprets
  const prev = learner.sessionRatings[learner.sessionRatings.length - 1] || { confidence, understanding }
  learner.sessionRatings.push({ date, confidence, understanding })
  learner.engagementRatings = [...(learner.engagementRatings || []), { date, engagement }]

  // The mentor tells us which planned strategies they actually used → correlate with the gain
  const delta = (understanding - prev.understanding) + (confidence - prev.confidence)
  for (const s of (req.body.implemented || [])) db.tutor.strategyLog.push({ strategy: s, delta, learnerId, date })

  const ai = await gradient(
    'You are the quiet memory of a mentoring practice. From a post-session DEBRIEF plus measured trends, produce teaching intelligence for the mentor — never teach the subject. Respond with JSON ONLY, exactly this shape: {"observations":[string,string],"timelineEntry":string,"parentSummary":string,"nextFocus":string,"recommendations":[string,string,string],"homework":[string,string],"strategyNote":string,"trendNote":string}. observations cite the numbers. timelineEntry is one short line for a teaching timeline. parentSummary is a warm jargon-free paragraph (empty string if not requested). recommendations are next-session moves. homework is resource/practice suggestions. strategyNote judges what worked vs did not. trendNote summarizes confidence/understanding movement. Never invent events not in the debrief.',
    JSON.stringify({
      learner: { name: learner.name, age: learner.age, subject: learner.subject, focus: learner.focus, goals: learner.goals },
      learningSpectrums: signalSummary(learner.signals),
      confidenceTrend: learner.sessionRatings.map((r) => r.confidence).join(','),
      understandingTrend: learner.sessionRatings.map((r) => r.understanding).join(','),
      debrief: { topic: session?.topic, understanding, confidence, engagement, clicked, confused, strategyWorked, strategyFailed, reviewNext },
      parentSummaryRequested: wantParentSummary,
    })
  )
  const intel = ai || mockDebrief(learner, { understanding, confidence, engagement, clicked, confused, strategyWorked, strategyFailed, reviewNext, wantParentSummary })

  learner.lessons.unshift({
    date, topic: session?.topic || learner.focus, objective: learner.insights.nextFocus || '',
    confBefore: prev.confidence, confAfter: confidence, understBefore: prev.understanding, understAfter: understanding,
    summary: intel.timelineEntry, strategies: [strategyWorked].filter(Boolean), breakthrough: false, completed: true,
  })
  learner.sessionsTogether = (learner.sessionsTogether || 0) + 1
  learner.timeline.unshift({ date, kind: 'reflection', text: intel.timelineEntry })
  if (clicked) learner.lastNote = clicked

  learner.insights = {
    ...learner.insights,
    observations: intel.observations,
    recommendations: intel.recommendations,
    homework: intel.homework,
    strategyNote: intel.strategyNote,
    trendNote: intel.trendNote,
    nextFocus: intel.nextFocus,
    // Parent summary exists ONLY when the mentor asked for it this debrief
    parentSummary: wantParentSummary ? intel.parentSummary : learner.insights.parentSummary,
    model: ai ? MODEL_DEEP : 'mock',
    updatedAt: date,
    reflectionCount: (learner.insights.reflectionCount || 0) + 1,
  }
  save()
  res.json({ intel: { ...intel, parentSummary: wantParentSummary ? intel.parentSummary : null }, aiUsed: !!ai })
})

// Fast model: parent summary in the family's home language
app.post('/api/translate', async (req, res) => {
  const learner = db.learners.find((l) => l.id === req.body.learnerId)
  if (!learner) return res.status(404).json({ error: 'learner not found' })
  const lang = learner.homeLanguage || 'Spanish'
  const text = await chat(
    `You translate messages from a mentor to a learner's family. Translate into ${lang}. Keep the warm, plain tone. Return only the translation.`,
    learner.insights.parentSummary,
    MODEL_FAST
  )
  if (!text) return res.status(503).json({ error: 'translation unavailable' })
  learner.insights.translated = { language: lang, text: text.trim(), model: MODEL_FAST }
  save()
  res.json(learner.insights.translated)
})

// TTS: parent summary as a voice note (reads the translation if one exists)
app.post('/api/voice-note', async (req, res) => {
  const learner = db.learners.find((l) => l.id === req.body.learnerId)
  if (!learner) return res.status(404).json({ error: 'learner not found' })
  const url = await speak(learner.insights.translated?.text || learner.insights.parentSummary)
  if (!url) return res.status(503).json({ error: 'voice note unavailable' })
  learner.insights.voiceNoteUrl = url
  save()
  res.json({ url })
})

// Create a learner from the Add-learner modal (all fields optional except name)
app.post('/api/learners', (req, res) => {
  const { name, age, grade, subject, focus, goals, challenge, preferences, notes } = req.body
  if (!name?.trim()) return res.status(400).json({ error: 'name required' })
  const id = name.trim().toLowerCase().split(' ')[0].replace(/[^a-z0-9]/g, '') + '-' + Date.now().toString(36).slice(-4)
  const learner = {
    id, name: name.trim(), age: age || null, grade: grade || '', readingLevel: '', homeLanguage: 'English',
    subject: subject || 'General', focus: focus || goals || 'Getting started',
    goals: goals || 'To be set together', challenge: challenge || 'To be discovered',
    preferences: preferences || 'To be discovered', sessionsTogether: 0, tint: TINTS[db.learners.length % TINTS.length],
    since: new Date().toISOString().slice(0, 10), momentum: 'just starting', lastNote: notes || 'New learner.',
    signals: { visual: { avg: 3, n: 0 }, verbal: { avg: 3, n: 0 }, thinkAloud: { avg: 3, n: 0 }, realWorld: { avg: 3, n: 0 }, teachBack: { avg: 3, n: 0 } },
    sessionRatings: [], topics: focus ? [{ name: focus, status: 'working', resources: [] }] : [],
    lessons: [], notes: notes ? [{ date: new Date().toISOString().slice(0, 10), text: notes }] : [], lessonPlans: [],
    insights: {
      observations: ['Not enough sessions yet — patterns appear here after the first reflection.'],
      recommendations: ['Start with an easy win to read how they respond.'],
      parentSummary: `We're just getting started with ${name.trim().split(' ')[0]}.`,
      nextFocus: focus || goals || 'Get to know them', updatedAt: new Date().toISOString().slice(0, 10), reflectionCount: 0,
    },
    timeline: [],
  }
  db.learners.push(learner)
  save()
  res.json({ learner })
})

// Compact assistant for the dashboard — short, practical answers, not a chat thread
app.post('/api/ask', async (req, res) => {
  const question = (req.body.question || '').trim()
  if (!question) return res.status(400).json({ error: 'empty question' })
  const ctx = db.learners.map((l) => `${l.name} (${l.subject}; focus: ${l.focus}; next: ${l.insights.nextFocus}; challenge: ${l.challenge})`).join(' | ')
  const answer = await chat(
    `You are MentorFlow, a concise assistant for a one-on-one mentor. Answer in 2-3 practical sentences — no preamble, no lists unless essential. You help with lesson planning and understanding these learners: ${ctx}.`,
    question
  )
  res.json({ answer: answer?.trim() || "I'm offline right now — add a Gradient key to enable answers." })
})

// First-time learner onboarding: subject, current confidence, how they respond → seed the profile
app.post('/api/learners/onboard', async (req, res) => {
  const { learnerId, subject, topic, confidence = 3, styles = [] } = req.body
  const learner = db.learners.find((l) => l.id === learnerId)
  if (!learner) return res.status(404).json({ error: 'learner not found' })
  const STYLE_MAP = { visual: 'visual', reading: 'verbal', thinkAloud: 'thinkAloud', handsOn: 'realWorld', discussion: 'teachBack' }

  if (subject) learner.subject = subject
  if (topic) {
    learner.focus = topic
    if (!learner.topics.some((t) => t.name === topic)) learner.topics.push({ name: topic, status: 'working', resources: [] })
    if (!db.topics.some((t) => t.name === topic && t.learnerId === learnerId)) db.topics.unshift({ id: `t-${Date.now()}`, subject: subject || learner.subject, name: topic, learnerId, description: '', subtopics: [] })
  }
  // Response styles nudge the learning-type spectrums up from neutral
  for (const s of styles) { const k = STYLE_MAP[s]; if (k) learner.signals[k] = { avg: 4.3, n: 1 } }
  learner.sessionRatings = [{ date: new Date().toISOString().slice(0, 10), confidence, understanding: confidence }]
  learner.onboarded = true

  const ai = await gradient(
    'A mentor just onboarded a new learner. From the intake, write two brief starter observations about how to teach them and one next focus. JSON only: {"observations":[string,string],"nextFocus":string}. No invented history.',
    JSON.stringify({ learner: { name: learner.name, age: learner.age, subject, topic }, currentConfidence: `${confidence}/5`, respondsWellTo: styles })
  )
  if (ai) {
    learner.insights = { ...learner.insights, observations: ai.observations, nextFocus: ai.nextFocus, model: MODEL_DEEP, updatedAt: new Date().toISOString().slice(0, 10) }
  } else if (styles.length) {
    learner.insights = { ...learner.insights, observations: [`${first(learner.name)} responds well to ${styles.join(', ')}. Lead with those channels.`, `Starting confidence is ${confidence}/5 — build early wins.`], nextFocus: topic || learner.focus }
  }
  save()
  res.json({ learner, aiUsed: !!ai })
})

// Topic library — subject/topic/subtopics/material tagged to a learner
app.get('/api/topics', (_req, res) => res.json(db.topics))
app.post('/api/topics', (req, res) => {
  const { subject, name, learnerId, material, description, subtopics } = req.body
  if (!name?.trim()) return res.status(400).json({ error: 'topic name required' })
  const topic = {
    id: `t-${Date.now()}`, subject: subject || 'General', name: name.trim(), learnerId: learnerId || null,
    material: material || '', description: description || '',
    subtopics: (subtopics || '').split(',').map((s) => s.trim()).filter(Boolean),
  }
  db.topics.unshift(topic)
  save()
  res.json({ topics: db.topics })
})

// Add a subtopic under an existing topic
app.post('/api/topics/subtopic', (req, res) => {
  const topic = db.topics.find((t) => t.id === req.body.topicId)
  if (!topic) return res.status(404).json({ error: 'topic not found' })
  const name = (req.body.subtopic || '').trim()
  if (!name) return res.status(400).json({ error: 'empty subtopic' })
  topic.subtopics = [...(topic.subtopics || []), name]
  save()
  res.json({ topics: db.topics })
})

// Schedule a session on the calendar from the lesson builder
app.post('/api/schedule', (req, res) => {
  const { learnerId, topic, date, time, duration = 60 } = req.body
  const learner = db.learners.find((l) => l.id === learnerId)
  if (!learner) return res.status(404).json({ error: 'learner not found' })
  if (!date || !time) return res.status(400).json({ error: 'date and time required' })
  const [h, m] = time.split(':').map(Number) // native <input type=time> gives 24h "HH:MM"
  const display = `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`
  const session = { id: `s-${Date.now()}`, learnerId, date, time: display, start: h + (m || 0) / 60, topic, duration, prepared: true, done: false, plan: null }
  db.sessions.push(session)
  save()
  res.json({ session })
})

// Toggle a lesson's completed state (lesson plans diary)
app.post('/api/lessons/toggle', (req, res) => {
  const learner = db.learners.find((l) => l.id === req.body.learnerId)
  const lesson = learner?.lessons.find((l) => l.date === req.body.date && l.topic === req.body.topic)
  if (!lesson) return res.status(404).json({ error: 'lesson not found' })
  // undefined counts as completed (past sessions), so flip off the displayed state
  lesson.completed = lesson.completed === false
  save()
  res.json({ completed: lesson.completed })
})

// Regenerate AI observations through a chosen lens (no free-text prompting)
app.post('/api/observations', async (req, res) => {
  const learner = db.learners.find((l) => l.id === req.body.learnerId)
  if (!learner) return res.status(404).json({ error: 'learner not found' })
  const LENS = {
    strengths: 'what is working — the learner\'s strongest channels and where to lean in',
    confidence: 'confidence specifically — where it dips, where it holds, and why',
    pacing: 'pacing and attention — session length, sequencing, energy over time',
    'next-steps': 'what to do differently next session, concretely',
  }
  const lens = LENS[req.body.lens] || LENS.strengths
  const ai = await gradient(
    `You are the quiet memory of a mentoring practice. From MEASURED DATA, surface two observations focused on: ${lens}. Cite the numbers. Never teach the subject. Respond JSON only: {"observations":[string,string]}.`,
    JSON.stringify({
      learner: { name: learner.name, age: learner.age, subject: learner.subject, focus: learner.focus },
      learningSpectrums: signalSummary(learner.signals),
      understandingTrend: learner.sessionRatings.map((r) => `${r.date}: U${r.understanding}/C${r.confidence}`).join(', '),
      recentLessons: learner.lessons.slice(0, 4).map((l) => `${l.date} ${l.topic}: ${l.summary}`),
    })
  )
  const observations = ai?.observations || learner.insights.observations
  learner.insights = { ...learner.insights, observations, lens: req.body.lens, model: ai ? MODEL_DEEP : 'mock' }
  save()
  res.json({ observations, aiUsed: !!ai })
})

// Cross-learner strategy outcomes: which teaching moves precede understanding/confidence gains.
// Built from every logged lesson's strategies + the mentor's self-reported adherence.
function strategyOutcomes(db) {
  const map = {}
  const add = (s, d) => { (map[s] ||= []).push(d) }
  for (const l of db.learners)
    for (const les of l.lessons)
      for (const s of (les.strategies || []))
        add(s, (les.understAfter - les.understBefore) + (les.confAfter - les.confBefore))
  for (const e of (db.tutor.strategyLog || [])) add(e.strategy, e.delta)
  return Object.entries(map)
    .map(([strategy, ds]) => ({ strategy, n: ds.length, avgDelta: +(ds.reduce((a, b) => a + b, 0) / ds.length).toFixed(1) }))
    .sort((a, b) => b.avgDelta - a.avgDelta)
}
const reflectionTotal = (db) => db.learners.reduce((n, l) => n + (l.insights?.reflectionCount || 0), 0)

// AI Teaching Style Insights: the mentor's OWN patterns across all learners + strategy correlations.
app.post('/api/teaching-style', async (req, res) => {
  const outcomes = strategyOutcomes(db)
  if (reflectionTotal(db) < 3 || outcomes.length === 0)
    return res.json({ enoughData: false, insights: [], correlations: [] })

  const ai = await gradient(
    'You analyze a mentor\'s OWN teaching patterns across ALL their learners — never a single learner\'s subject. From measured strategy→outcome data and learner trends, surface how THIS MENTOR teaches and what correlates with real gains. Address the mentor as "You". JSON only: {"insights":[string,string,string]}. Each insight: one warm, specific sentence about the mentor\'s habits or what works for them. Describe tendencies, not raw numbers. Never teach a subject.',
    JSON.stringify({
      strategyOutcomes: outcomes.map((o) => `${o.strategy}: avg ${o.avgDelta >= 0 ? '+' : ''}${o.avgDelta} confidence+understanding over ${o.n} sessions`),
      learners: db.learners.map((l) => ({ name: first(l.name), subject: l.subject, strongestChannel: SIGNAL_LABELS[Object.entries(l.signals).sort((a, b) => b[1].avg - a[1].avg)[0][0]], recentTrend: l.sessionRatings.slice(-3).map((r) => r.understanding).join('→') })),
    })
  )
  const insights = ai?.insights || [
    `Your strongest move is ${outcomes[0].strategy.toLowerCase()} — it precedes an average ${outcomes[0].avgDelta >= 0 ? '+' : ''}${outcomes[0].avgDelta} gain across ${outcomes[0].n} sessions.`,
    'You tend to anchor new ideas to something concrete before introducing notation.',
    outcomes.length > 1 ? `${outcomes[outcomes.length - 1].strategy} carries less weight lately — worth pairing with a stronger channel.` : 'Teach-back keeps showing up right before your breakthroughs.',
  ]
  const correlations = outcomes.slice(0, 4)
  db.tutor.teachingStyle = { insights, correlations, updatedAt: new Date().toISOString().slice(0, 10), model: ai ? MODEL_DEEP : 'mock' }
  save()
  res.json({ enoughData: true, insights, correlations, aiUsed: !!ai })
})

app.post('/api/reset', (_req, res) => {
  db.topics = []
  // Demo convenience: put the data back to its seeded state
  db = JSON.parse(JSON.stringify(seed))
  save()
  res.json({ ok: true })
})

// ---------- Static (production) ----------

const dist = path.join(__dirname, 'dist')
if (fs.existsSync(dist)) {
  app.use(express.static(dist))
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')))
}

const port = process.env.PORT || 3001
app.listen(port, () => console.log(`MentorFlow server on :${port} — Gradient AI ${KEY ? `LIVE (deep=${MODEL_DEEP}, fast=${MODEL_FAST}, tts=${MODEL_TTS})` : 'mock mode'}`))
