---
tags: [teachpath, demo]
---

# Demo Script — 90 seconds

**Before demoing:** `curl -X POST localhost:3001/api/reset` — clean seed data. Have the app already open on the dashboard. Zoom the browser to ~110%.

## The script

**[Dashboard]**
> "This is TeachPath. It's for the millions of people who teach one learner at a time — volunteer tutors, mentors, older siblings — with no training and no support. It's not an AI dashboard. It's a private teaching journal with intelligent structure."

Point once: today's sessions, learners, and what TeachPath is *noticing* about how Jasmine learns.

**[Click "Prepare next session — Jasmine at 4:00 pm"]**
> "Jasmine is ten. She gets fractions when they're pizza slices, and freezes when they're notation. TeachPath remembers that — so when Gradient AI drafts her session plan, it plans for *her*, not for 'a 5th grader.'"

Click **Draft session plan**. Read one section aloud — the one referencing the pizza model.

**[Save plan → back → open Reflect on Jasmine's session]**
> "After the session: no essay, no prompting the AI. Thirty seconds of taps — the same five learning signals for every learner, every session. That's what makes it data instead of anecdotes."

Tap (fast): 4 stars · visual 5 · word-heavy 2 · think-aloud 4 · real-world 5 · teach-back 4 · friction: *confidence* · toggle *breakthrough moment* · optional note: "placed 3/4 on the number line herself". Submit.

**[Learner profile rewrites]**
> "The app folds those ratings into running averages — the app remembers, not the model. Then Gradient AI reads the measurements and writes judgment: notice it cites the numbers — 'visual demonstration 4.6 out of 5 across 5 sessions.' It never explains fractions. It helps the person who does."

Point at the learning-profile bars and the understanding trend.

**[The closer — family card]**
> "Jasmine's family speaks Spanish at home."

Click **In Spanish** — translation appears (fast mini model — say "right-sized model, this call costs a fraction of a cent").
Click **Voice note** — audio player appears. **Play three seconds of it.**

> "That's Gradient text synthesis, model tiering, and text-to-speech — one key, three surfaces — all in service of one relationship: a tutor, a kid, and her family. Technology delivers information. People create understanding."

## Failure modes

- No wifi / API down → mock fallback answers instantly; the script still works, skip the model-attribution line
- Voice note takes ~20–60s → click it *while talking* about the translation, it lands by the time you finish
- Never type reflections live from memory — have them on a sticky note

Related: [[06 Judging Strategy]] · [[02 The Loop]]
