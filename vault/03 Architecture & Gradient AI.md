---
tags: [teachpath, tech]
---

# Architecture & Gradient AI

## Stack

- **Frontend** — React + Vite, plain CSS (no UI framework), react-router
- **Backend** — Express, one file (`server.js`)
- **Data** — `data.json` on disk, seeded from `seed.js`. The database is deliberately not the point
- **AI** — DigitalOcean Gradient AI, one key, OpenAI-compatible endpoints
- **Deploy** — DO App Platform: `npm run build`, `npm start`, Express serves `dist/`

## The three Gradient surfaces

One key (`DIGITAL_OCEAN_MODEL_ACCESS_KEY`), three distinct uses — this is the "Best Use of Gradient AI" story:

### 1. Deep synthesis — `openai-gpt-5.5` on `/v1/chat/completions`
- **Reflection engine** (`POST /api/reflections`): the mentor never types prompts. Input is *structured data* — a 1–5 understanding rating, five fixed learning-signal spectrums (visual / word-heavy / think-aloud / real-world / teach-back), friction tags, breakthrough toggle, one optional note. The app folds ratings into running averages (**the app remembers, not the model**); the AI receives only measured data + history and returns `{observations, recommendations, parentSummary, nextFocus}` — teaching judgment, never subject explanations.
- **Lesson planner** (`POST /api/lesson`): learner's measured spectrums + topic mastery + understanding trend → goal + five-section plan routed through the learner's strongest channel, editable by the mentor.

### 2. Right-sized fast model — `openai-gpt-5.4-mini`
- **Family translation** (`POST /api/translate`): parent summary → the family's home language. Cheap model for light work — deliberate cost-aware model tiering, worth saying out loud to judges.

### 3. Second modality — TTS via `/v1/async-invoke`
- **Voice notes** (`POST /api/voice-note`): `fal-ai/elevenlabs/tts/multilingual-v2`, submit → poll → fetch → MP3 URL. Reads the *translated* summary if one exists — a Spanish-speaking family gets a voice note in Spanish.

## Reliability

Every AI call falls back to believable mock output on missing key or API error. **The demo cannot die on stage.** UI shows quiet model attribution ("woven by openai-gpt-5.5 on DigitalOcean Gradient") only when the real API served it.

## Env

`.env` → loaded with Node's native `--env-file-if-exists` (no dotenv). Keys: `DIGITAL_OCEAN_MODEL_ACCESS_KEY`, optional `DIGITAL_OCEAN_MODEL`, `DIGITAL_OCEAN_MODEL_FAST`, `DIGITAL_OCEAN_MODEL_TTS`.

Related: [[06 Judging Strategy]] · [[07 Build Log]]
