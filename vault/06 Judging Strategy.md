---
tags: [teachpath, strategy]
---

# Judging Strategy

Target: **1st place, Best Use of Gradient AI in a Social Good Hack** ($1000) + DO's **$600 best use of DigitalOcean AI**. Secondary: **Best UI/UX**.

## Best Use of Gradient AI — the pitch

Not "we called an LLM." The story is **three Gradient surfaces, deliberately chosen**:

1. **Deep model** (`openai-gpt-5.5`) for synthesis that requires judgment — turning reflections into learner memory
2. **Fast model** (`openai-gpt-5.4-mini`) for light work — translation. Say the phrase *"right-sized model per task"*
3. **Async TTS** (`/v1/async-invoke`, fal ElevenLabs) — a second modality with a social-good reason: families who don't read English get a voice note in their home language

Plus: graceful mock fallback (engineering maturity), model attribution in the UI, deployed on App Platform (their whole stack).

## Criteria mapping

## Best Use of Data — now a real second target

The reflection form collects *comparable structured data* (same five spectrums for every learner, every session). The app computes running averages and understanding trends; the UI visualizes them (learning-profile bars, per-session trend bars, topic mastery). "Data that is typically hard to parse" = how a child learns — normally locked in a tutor's head, here measured and visualized.

## Criteria mapping

| Criterion | Our answer |
|---|---|
| Originality | The mentor never prompts the AI — they *rate observations*, click-and-go; AI turns accumulated measurements into teaching judgment. Not a chatbot, not a mini-Canvas |
| Technology | 3 Gradient surfaces incl. async submit-poll TTS; model tiering; deterministic data layer (running averages) under the AI layer; fallback architecture |
| Design | Editorial design system, one accent, real accessibility (see [[04 Design System]]) |
| Learning | First DO deploy, first async inference pipeline, first time designing for calm |
| Social Good | Volunteer tutors/mentors/siblings — unpaid teachers of under-resourced kids; multilingual family inclusion |
| Completion | Full loop works end-to-end, live AI, deployed |

## Judge Q&A prep

- *"Why not let students talk to the AI?"* — Deliberate. The relationship is the intervention; AI serves the human who serves the learner.
- *"What about privacy?"* — Learner data stays in the tutor's own instance; no accounts, no tracking. Production would add per-tutor encryption.
- *"How does it scale?"* — Each tutor is independent; the JSON file becomes DO Managed Postgres, the rest is already stateless.
- *"Is the streak gamification?"* — It's seven dots. It acknowledges practice, it doesn't reward addiction.

Related: [[05 Demo Script]] · [[03 Architecture & Gradient AI]]
