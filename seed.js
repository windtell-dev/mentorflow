// Seed data for MentorFlow. One mentor, four learners.
// Dates are relative to server start so the demo always looks "today".
const today = new Date()
const iso = (d) => d.toISOString().slice(0, 10)
const daysAgo = (n) => {
  const d = new Date(today)
  d.setDate(d.getDate() - n)
  return iso(d)
}

// running averages on the fixed learning-type spectrums (1–5), n = observations
const sig = (visual, verbal, thinkAloud, realWorld, teachBack, n) => ({
  visual: { avg: visual, n },
  verbal: { avg: verbal, n },
  thinkAloud: { avg: thinkAloud, n },
  realWorld: { avg: realWorld, n },
  teachBack: { avg: teachBack, n },
})

// confidence[] + understanding[] → dated rating points, spaced back from today
const ratings = (conf, und, spacing = 4) =>
  conf.map((c, i) => ({ date: daysAgo((conf.length - 1 - i) * spacing), confidence: c, understanding: und[i] }))

export default {
  tutor: {
    name: 'Felix',
    totalMinutes: 1240,
    breakthroughs: 9,
    strategies: [
      'Concrete → Representational → Abstract',
      'Teach-back (the protégé effect)',
      'Retrieval practice over re-explaining',
      'Think-alouds before written work',
    ],
    availability: [
      { day: 'Monday', start: 16, end: 19 },
      { day: 'Wednesday', start: 10, end: 13 },
      { day: 'Friday', start: 15, end: 18 },
    ],
  },

  learners: [
    {
      id: 'jasmine',
      name: 'Jasmine Carter',
      age: 10,
      grade: '5th grade',
      readingLevel: 'On grade level',
      homeLanguage: 'Spanish',
      subject: 'Math',
      focus: 'Fractions — equivalence and comparison',
      goals: 'Master fractions and build confidence',
      challenge: 'Writing inequalities with confidence',
      preferences: 'Visual models, real-life examples, quiet think time',
      sessionsTogether: 10,
      tint: '#efe4c0',
      since: daysAgo(42),
      momentum: 'finding footing',
      lastNote: 'Lit up using the pizza model, froze on the number line.',
      signals: sig(4.5, 2.0, 3.5, 4.8, 3.2, 4),
      sessionRatings: ratings(
        [2, 2, 3, 3, 3, 4, 3, 4, 4, 5],
        [2, 2, 2, 3, 3, 3, 4, 4, 4, 5]
      ),
      topics: [
        { name: 'Fractions as sharing', status: 'mastered', resources: [] },
        { name: 'Equivalent fractions', status: 'mastered', resources: [] },
        { name: 'Comparing fractions', status: 'working', resources: [] },
        {
          name: 'Fractions on the number line', status: 'working',
          resources: [{ title: 'Khan Academy — Fractions on a number line', url: 'https://www.khanacademy.org/math/cc-third-grade-math/imp-fractions/imp-fractions-on-the-number-line/v/fractions-on-a-number-line' }],
        },
      ],
      lessons: [
        { date: daysAgo(3), topic: 'Comparing fractions', objective: 'Use fraction strips to compare', confBefore: 2, confAfter: 4, understBefore: 2, understAfter: 4, summary: 'Lit up with visual model. Hesitated on writing inequality.', strategies: ['Concrete', 'Think-aloud', 'Retrieval'], breakthrough: true },
        { date: daysAgo(9), topic: 'Equivalent fractions', objective: 'Find equivalent fractions', confBefore: 3, confAfter: 4, understBefore: 3, understAfter: 4, summary: 'Folded paper worked. Taught it back unprompted.', strategies: ['Concrete', 'Teach-back'], breakthrough: true },
        { date: daysAgo(16), topic: 'Adding fractions', objective: 'Add fractions with like denominators', confBefore: 2, confAfter: 3, understBefore: 2, understAfter: 3, summary: 'Word problems still a wall. Reading aloud helped.', strategies: ['Read-aloud'], breakthrough: false },
        { date: daysAgo(23), topic: 'Fractions as sharing', objective: 'Understand fractions as parts of a whole', confBefore: 1, confAfter: 3, understBefore: 2, understAfter: 3, summary: 'Pizza analogy landed immediately.', strategies: ['Concrete', 'Real-world'], breakthrough: false },
      ],
      notes: [
        { date: daysAgo(8), text: 'Loves soccer — game scores work well for comparison examples.' },
      ],
      lessonPlans: [],
      insights: {
        observations: [
          'Jasmine understands concepts when she can manipulate something physical or see it visually (4.5/5). Confidence dips when moving to abstract symbols (word-heavy 2.0/5).',
          'Real-world framing is her strongest signal (4.8/5). New notation lands only after it is anchored to something physical.',
        ],
        recommendations: [
          'Use more visual-to-abstract bridging. Give structured sentence stems for justifying answers.',
          'Introduce the number line side by side with the pizza model, not after it.',
          'Put the hardest new idea in the first twenty minutes, while energy is highest.',
        ],
        parentSummary:
          'Jasmine is building a real feel for what fractions mean, not just how to write them. This week we worked on comparing fractions with objects she can see and touch. She is most confident with visual models, and we are gently bridging toward written notation. A good way to help at home: when cooking or sharing food, ask her "which is bigger?" questions out loud.',
        nextFocus: 'Bridge the pizza model to the number line.',
        updatedAt: daysAgo(3),
        reflectionCount: 4,
      },
      timeline: [
        { date: daysAgo(3), kind: 'reflection', text: 'Comparing fractions with strips — got it physically, hesitated writing the inequality. Struggled with: confidence.' },
        { date: daysAgo(9), kind: 'breakthrough', text: 'Equivalent fractions with folded paper — she taught it back unprompted.' },
        { date: daysAgo(16), kind: 'reflection', text: 'Word problems still a wall. Reading the problem aloud together helped.' },
        { date: daysAgo(23), kind: 'session', text: 'Introduced fractions as sharing. Pizza analogy worked immediately.' },
      ],
    },
    {
      id: 'diego',
      name: 'Diego Reyes',
      age: 8,
      grade: '3rd grade',
      readingLevel: 'One year below grade level',
      homeLanguage: 'Spanish',
      subject: 'Reading',
      focus: 'Reading fluency and confidence aloud',
      goals: 'Stronger reading fluency and comprehension',
      challenge: 'Overthinks and loses focus when reading',
      preferences: 'Choice of text, no timers, echo reading',
      sessionsTogether: 8,
      tint: '#cdd9ea',
      since: daysAgo(60),
      momentum: 'gaining ground',
      lastNote: 'Read a full page aloud without stopping for the first time.',
      signals: sig(3.4, 2.8, 4.6, 4.0, 3.8, 6),
      sessionRatings: ratings(
        [2, 2, 3, 3, 4, 4, 4, 5],
        [2, 3, 3, 3, 4, 4, 5, 5]
      ),
      topics: [
        { name: 'Decoding multi-syllable words', status: 'working', resources: [] },
        { name: 'Reading aloud with expression', status: 'working', resources: [] },
        { name: 'Sight words', status: 'mastered', resources: [] },
      ],
      lessons: [
        { date: daysAgo(2), topic: 'Reading fluency', objective: 'Read a full page aloud', confBefore: 3, confAfter: 4, understBefore: 2, understAfter: 3, summary: 'Read a full page aloud without stopping!', strategies: ['Echo reading', 'Chunking'], breakthrough: true },
        { date: daysAgo(9), topic: 'Expression', objective: 'Read with expression', confBefore: 2, confAfter: 3, understBefore: 3, understAfter: 3, summary: 'Paired reading, alternating paragraphs. He mirrors my pacing.', strategies: ['Echo reading'], breakthrough: false },
        { date: daysAgo(16), topic: 'Decoding', objective: 'Break down multi-syllable words', confBefore: 2, confAfter: 3, understBefore: 2, understAfter: 3, summary: 'Chunking words into syllables reduced the freeze.', strategies: ['Chunking'], breakthrough: false },
      ],
      notes: [],
      lessonPlans: [
        {
          id: 'lp-diego-1', date: iso(today), topic: 'Reading — new chapter book', duration: 45, description: 'First chapter of the new dinosaur series he picked.', attachments: [],
          plan: {
            goal: 'Diego reads the first chapter aloud with expression and wants to keep going.',
            sections: [
              { title: 'He picks where we start', minutes: 5, detail: 'Two options, his choice. Ownership first.' },
              { title: 'Alternate paragraphs', minutes: 25, detail: 'Model expression, then he mirrors. No timer visible anywhere.' },
              { title: 'He reads the cliffhanger', minutes: 15, detail: 'End on momentum — he takes the best part.' },
            ],
            materials: ['The dinosaur book', 'A backup option he can reject'],
          },
        },
      ],
      insights: {
        observations: [
          'Diego answers correctly when allowed to think aloud (4.6/5) — silence pressure is his enemy, not the text.',
          'He self-corrects more when he chooses the book himself; accuracy drops when anything looks like a timer.',
        ],
        recommendations: [
          'Bring two book options and let him choose.',
          'Keep read-alouds untimed; model expression first, then alternate paragraphs.',
        ],
        parentSummary:
          'Diego read a full page aloud without stopping this week — a real milestone. He does best when he picks the book and no one is watching the clock. Fifteen relaxed minutes of reading together at night is worth more than any drill.',
        nextFocus: 'Longer passages, same low pressure.',
        updatedAt: daysAgo(2),
        reflectionCount: 6,
      },
      timeline: [
        { date: daysAgo(2), kind: 'breakthrough', text: 'Full page aloud, no stopping. Chose the dinosaur book again.' },
        { date: daysAgo(9), kind: 'session', text: 'Paired reading, alternating paragraphs. He mirrors my pacing.' },
      ],
    },
    {
      id: 'amara',
      name: 'Amara Osei',
      age: 13,
      grade: '8th grade',
      readingLevel: 'Above grade level',
      homeLanguage: 'English',
      subject: 'Math',
      focus: 'Linear equations — solving for x',
      goals: 'Master algebra foundations',
      challenge: 'Negative numbers and signs',
      preferences: 'Fast pace, verbal reasoning, worked examples',
      sessionsTogether: 13,
      tint: '#ddd3ec',
      since: daysAgo(70),
      momentum: 'steady',
      lastNote: 'Solid on two-step equations. Negative coefficients still trip her.',
      signals: sig(3.6, 4.2, 4.4, 3.0, 4.0, 3),
      sessionRatings: ratings(
        [3, 3, 4, 4, 3, 4, 4, 5, 4],
        [3, 3, 3, 4, 4, 4, 4, 4, 5]
      ),
      topics: [
        { name: 'One-step equations', status: 'mastered', resources: [] },
        { name: 'Two-step equations', status: 'mastered', resources: [] },
        { name: 'Negative coefficients', status: 'working', resources: [] },
      ],
      lessons: [
        { date: daysAgo(5), topic: 'Negative coefficients', objective: 'Understand signs in equations', confBefore: 2, confAfter: 3, understBefore: 2, understAfter: 3, summary: 'Getting signs right in simpler equations.', strategies: ['Visual models', 'Guided practice'], breakthrough: true },
        { date: daysAgo(12), topic: 'Two-step equations', objective: 'Solve two-step equations', confBefore: 3, confAfter: 4, understBefore: 3, understAfter: 4, summary: 'Fluent on two-step. -3x = 12 caused a pause — knew it, didn\'t trust it.', strategies: ['Worked examples'], breakthrough: false },
        { date: daysAgo(19), topic: 'One-step equations', objective: 'Isolate the variable', confBefore: 3, confAfter: 4, understBefore: 4, understAfter: 4, summary: 'Fast and accurate. Ready to move on.', strategies: ['Retrieval'], breakthrough: false },
      ],
      notes: [],
      lessonPlans: [],
      insights: {
        observations: [
          'Amara works fast and accurately until a negative sign appears, then second-guesses correct work — a confidence pattern, not a knowledge gap.',
        ],
        recommendations: [
          'Five negatives-only problems, talked through aloud, before anything new.',
          'Ask "what does your gut say?" before offering help.',
        ],
        parentSummary:
          'Amara is moving steadily through solving equations. She has the core method down; we are polishing the details around negative numbers, which is a very normal sticking point at this stage.',
        nextFocus: 'Negative coefficients, spoken aloud.',
        updatedAt: daysAgo(5),
        reflectionCount: 3,
      },
      timeline: [
        { date: daysAgo(5), kind: 'reflection', text: 'Two-step equations fluent. -3x = 12 caused a long pause; she knew the answer but didn\'t trust it. Struggled with: confidence.' },
      ],
    },
    {
      id: 'sam',
      name: 'Sam Whitfield',
      age: 11,
      grade: '6th grade',
      readingLevel: 'On grade level',
      homeLanguage: 'English',
      subject: 'Writing',
      focus: 'Paragraph structure and getting started',
      goals: 'Improve writing structure and flow',
      challenge: 'Starting strong ("blank page" block)',
      preferences: 'Talk it out first, then write; sentence stems',
      sessionsTogether: 11,
      tint: '#d4e3d2',
      since: daysAgo(30),
      momentum: 'finding footing',
      lastNote: 'Blank page is the enemy. Talking first, writing second works.',
      signals: sig(3.0, 2.6, 4.8, 4.2, 4.4, 2),
      sessionRatings: ratings(
        [2, 2, 3, 3, 2, 3, 3, 4],
        [2, 3, 3, 3, 3, 4, 3, 4]
      ),
      topics: [
        { name: 'Topic sentences', status: 'working', resources: [] },
        { name: 'Talking a story before writing it', status: 'mastered', resources: [] },
      ],
      lessons: [
        { date: daysAgo(6), topic: 'Paragraph structure', objective: 'Strong opening sentences', confBefore: 2, confAfter: 3, understBefore: 2, understAfter: 3, summary: 'Used a hook! Needs more detail.', strategies: ['Sentence stems', 'Modeling'], breakthrough: false },
        { date: daysAgo(13), topic: 'Getting started', objective: 'Beat the blank page', confBefore: 2, confAfter: 3, understBefore: 3, understAfter: 3, summary: 'Talked through his soccer story, then wrote it. Best paragraph yet.', strategies: ['Talk-first', 'Scribing'], breakthrough: true },
      ],
      notes: [],
      lessonPlans: [],
      insights: {
        observations: [
          'Sam can say a full, well-formed paragraph out loud (think-aloud 4.8/5) but stalls when asked to write the same thing.',
        ],
        recommendations: [
          'Voice first: have him say it, you scribe the first sentence, he continues.',
          'This week: he writes the first sentence himself.',
        ],
        parentSummary:
          'Sam has strong ideas — our work right now is lowering the barrier between saying them and writing them down. He responds well to talking a piece through before touching the page.',
        nextFocus: 'He writes the first sentence himself this week.',
        updatedAt: daysAgo(6),
        reflectionCount: 2,
      },
      timeline: [
        { date: daysAgo(6), kind: 'reflection', text: 'Talked through his soccer story, then wrote it. Best paragraph yet, but I wrote the opening line for him.' },
      ],
    },
  ],

  topics: [
    { id: 't-frac', subject: 'Math', name: 'Fractions on the number line', learnerId: 'jasmine', material: '', description: 'Bridge the pizza model to the number line.', subtopics: ['Equivalent fractions', 'Comparing fractions'] },
    { id: 't-read', subject: 'Reading', name: 'Reading fluency', learnerId: 'diego', material: '', description: 'Untimed, learner picks the book.', subtopics: ['Decoding', 'Expression'] },
    { id: 't-neg', subject: 'Math', name: 'Negative coefficients', learnerId: 'amara', material: '', description: 'Signs-only practice, spoken aloud.', subtopics: ['Sign rules', 'Two-step with negatives'] },
    { id: 't-para', subject: 'Writing', name: 'Paragraph structure', learnerId: 'sam', material: '', description: 'Talk it out, then scribe the first line.', subtopics: ['Topic sentences', 'Hooks'] },
  ],

  sessions: [
    { id: 's1', learnerId: 'jasmine', time: '4:00 pm', start: 16, date: iso(today), topic: 'Fractions on the number line', duration: 60, prepared: false, done: false, plan: null },
    { id: 's2', learnerId: 'diego', time: '5:30 pm', start: 17.5, date: iso(today), topic: 'Reading — new chapter book', duration: 45, prepared: true, done: false, plan: null },
    { id: 's3', learnerId: 'amara', time: '7:00 pm', start: 19, date: iso(today), topic: 'Negative coefficients', duration: 45, prepared: false, done: false, plan: null },
  ],

  reflections: [],
}
