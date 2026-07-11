---
tags: [teachpath, log]
---

# Build Log

## Done ✅

- [x] Scaffold: React + Vite + Express, one package, Vite proxy `/api` → :3001
- [x] Five screens: dashboard, learner profile, lesson builder, reflection form, insights panel
- [x] Seed data: 4 learners (Jasmine = demo), 3 sessions today, timelines
- [x] Reflection engine live on Gradient (`openai-gpt-5.5`) — verified end-to-end
- [x] Lesson planner grounded in learner memory
- [x] Family translation via fast model (`openai-gpt-5.4-mini`) — verified
- [x] Voice notes via `/v1/async-invoke` TTS — verified, real MP3
- [x] Mock fallback for every AI call
- [x] `data.json` persistence + `POST /api/reset` for clean demos
- [x] Production build verified (`vite build` clean)

## Cut (deliberately — say "deliberate scope" if asked)

- Auth, payments, real database — not the point in 18 hours
- Chat interface — against the product philosophy, not just the clock
- Image generation for worksheets — image models draw wrong fractions; a wrong diagram in a teaching tool is worse than none
- Inference Router / Evaluations — preview features needing console setup; mentioned in pitch as "what's next"

## Remaining ⬜

- [ ] Deploy to App Platform (repo → build `npm run build`, run `npm start`, env key + `PORT=8080`)
- [ ] Rehearse [[05 Demo Script]] twice, once with wifi off (mock mode)
- [ ] Rotate the API key after the event (it was pasted in chats)
- [ ] Devpost write-up — reuse [[01 Vision & Philosophy]] + the table in [[03 Architecture & Gradient AI]]

Related: [[00 TeachPath Home]]
