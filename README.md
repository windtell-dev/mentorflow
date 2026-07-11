# TeachPath

*Technology can deliver information. People create understanding.*

A calm teaching companion for tutors, mentors, volunteers, and older siblings — the people who teach one learner at a time. TeachPath is a private teaching journal with intelligent structure: you reflect for two minutes after a session, and DigitalOcean Gradient AI turns that reflection into durable memory — how this learner learns, what to try next, and a warm summary for their family.

## The loop

**Prepare → Teach → Observe → Adapt → Reflect → Repeat**

## How Gradient AI is used (three surfaces, one key)

| Feature | Gradient surface | Model |
|---|---|---|
| Reflection engine — turns a raw post-session reflection into learning patterns, next-session moves, and a family summary | `/v1/chat/completions` | `openai-gpt-5.5` |
| Lesson planner — drafts a session plan grounded in the learner's accumulated memory | `/v1/chat/completions` | `openai-gpt-5.5` |
| Family translation — parent summary in the family's home language | `/v1/chat/completions` | `openai-gpt-5.4-mini` (right-sized: cheap model for light work) |
| Voice notes — the family summary as audio, in their language | `/v1/async-invoke` (submit → poll → fetch) | `fal-ai/elevenlabs/tts/multilingual-v2` |

Built on **DigitalOcean Gradient AI Serverless Inference** — one Model Access Key, the OpenAI-compatible **Chat Completions API**, and **structured JSON output** (every endpoint prompts for and parses a strict JSON shape, e.g. the debrief returns `{observations, timelineEntry, parentSummary, nextFocus, recommendations, homework, strategyNote, trendNote}`).

**Model flexibility** is a feature, not an afterthought: the deep-synthesis model, the fast translation model, and the TTS model are each a single env var, so you can swap any model from the Gradient **catalog** without touching code. We default to one strong model (`openai-gpt-5.5`) for judgment-heavy synthesis and a smaller one for light language work.

**The debrief loop** is the core: mentor marks a session done → fills a quick structured debrief (what clicked, what confused, strategy worked/didn't, confidence + engagement ratings, review-next, and an opt-in parent summary) → Gradient AI returns the teaching intelligence above → the learner's memory, trends, timeline, and recommendations update. The parent summary intentionally does not exist until after a debrief — before the lesson, the app doesn't know what happened.

No API key? Every AI feature falls back to believable mock output — the demo cannot die on stage.

## Run it

```bash
npm install
cp .env.example .env   # add your DigitalOcean model access key
npm run dev            # app on :5173, API on :3001
```

`.env`:

```
DIGITAL_OCEAN_MODEL_ACCESS_KEY=your-key
DIGITAL_OCEAN_MODEL=openai-gpt-5.5        # optional
DIGITAL_OCEAN_MODEL_FAST=openai-gpt-5.4-mini  # optional
```

## Deploy (DigitalOcean App Platform)

1. Push to GitHub.
2. App Platform → create app from the repo (Node buildpack).
3. Build command `npm run build`, run command `npm start`.
4. Set env vars `DIGITAL_OCEAN_MODEL_ACCESS_KEY` and `PORT=8080`.

Express serves the built frontend from `dist/` in production — one component, no separate static site.

## Demo (90 seconds)

1. Dashboard — today's sessions, learners, what TeachPath is noticing. One primary action: **Prepare next session**.
2. Prepare Jasmine's fractions session — the plan is drafted around what TeachPath remembers about *her* (pizza model works, number line doesn't yet).
3. Teach (offstage). Then reflect: two honest minutes about where she lit up and where she struggled.
4. Watch her profile rewrite itself — patterns, next-session moves, family summary.
5. One click: the summary in Spanish. One more: as a voice note her family can listen to.

## Stack

React + Vite · Express · DigitalOcean Gradient AI · a JSON file as the database (18-hour hackathon; the database is not the point)

## Reset demo data

```bash
curl -X POST localhost:3001/api/reset
```
