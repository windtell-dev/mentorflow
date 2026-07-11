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
      age: 14,
      grade: '9th grade',
      readingLevel: 'On grade level',
      homeLanguage: 'Spanish',
      subject: 'Biology',
      focus: 'Cell structure — organelles and their functions',
      goals: 'Understand cells as living systems, not vocab lists',
      challenge: 'Memorizing organelles without grasping what they do',
      preferences: 'Diagrams, analogies, hands-on models',
      sessionsTogether: 8,
      tint: '#cdd9ea',
      since: daysAgo(60),
      momentum: 'gaining ground',
      lastNote: 'The cell-as-a-factory analogy finally made organelles click.',
      signals: sig(4.4, 2.8, 4.0, 4.6, 3.8, 6),
      sessionRatings: ratings(
        [2, 2, 3, 3, 4, 4, 4, 5],
        [2, 3, 3, 3, 4, 4, 5, 5]
      ),
      topics: [
        { name: 'The cell membrane', status: 'mastered', resources: [] },
        { name: 'Organelles and their functions', status: 'working', resources: [] },
        { name: 'Photosynthesis', status: 'working', resources: [] },
        { name: 'Cellular respiration', status: 'working', resources: [] },
      ],
      lessons: [
        { date: daysAgo(2), topic: 'Organelles', objective: 'Match organelles to their jobs', confBefore: 3, confAfter: 4, understBefore: 2, understAfter: 3, summary: 'Cell-as-a-factory analogy made it click. Named all the organelles.', strategies: ['Analogy', 'Diagram labeling'], breakthrough: true },
        { date: daysAgo(9), topic: 'The cell membrane', objective: 'Explain selective permeability', confBefore: 2, confAfter: 3, understBefore: 3, understAfter: 3, summary: 'Got the "gatekeeper" idea. Diffusion vs. active transport still fuzzy.', strategies: ['Diagram labeling'], breakthrough: false },
        { date: daysAgo(16), topic: 'What is a cell', objective: 'Cells as the unit of life', confBefore: 2, confAfter: 3, understBefore: 2, understAfter: 3, summary: 'Microscope images helped him see it as real, not abstract.', strategies: ['Real specimens'], breakthrough: false },
      ],
      notes: [],
      lessonPlans: [
        {
          id: 'lp-diego-1', date: iso(today), topic: 'Biology — Photosynthesis', duration: 45, description: 'Build the equation from a diagram, then connect it back to the cell.', attachments: [],
          plan: {
            goal: 'Diego can explain photosynthesis as an input-output process in his own words.',
            sections: [
              { title: 'What does a plant eat?', minutes: 5, detail: 'Open with the question, let him guess. Curiosity first.' },
              { title: 'Label the chloroplast', minutes: 25, detail: 'Diagram-first. Build the equation from the picture, not the textbook.' },
              { title: 'Teach it back', minutes: 15, detail: 'He explains sunlight → sugar to me. End on the analogy.' },
            ],
            materials: ['Chloroplast diagram', 'A leaf to look at'],
          },
        },
      ],
      insights: {
        observations: [
          'Diego learns organelles fast when each one is tied to a real-world job (analogy 4.6/5). Straight memorization stalls (word-heavy 2.8/5).',
          'Diagrams anchor him — he recalls structure far better after labeling it himself than after reading about it.',
        ],
        recommendations: [
          'Lead every new structure with an analogy, then the diagram, then the term.',
          'Have him label a blank diagram from memory before introducing the next system.',
        ],
        parentSummary:
          'Diego is starting to see cells as living systems rather than lists to memorize. The turning point this week was the "cell as a factory" analogy. At home, connecting biology to real things — food, plants, the body — helps it stick far more than flashcards.',
        nextFocus: 'Photosynthesis, built from a diagram.',
        updatedAt: daysAgo(2),
        reflectionCount: 6,
      },
      timeline: [
        { date: daysAgo(2), kind: 'breakthrough', text: 'Cell-as-a-factory analogy landed. Named every organelle and its job.' },
        { date: daysAgo(9), kind: 'session', text: 'Cell membrane as a gatekeeper. Selective permeability still developing.' },
      ],
    },
    {
      id: 'amara',
      name: 'Amara Osei',
      age: 13,
      grade: '8th grade',
      readingLevel: 'Above grade level',
      homeLanguage: 'English',
      subject: 'Asian American Studies',
      focus: 'Reading primary sources — early immigration history',
      goals: 'Read primary sources critically and build an argument',
      challenge: 'Connecting a single document to the bigger picture',
      preferences: 'Discussion, primary documents, fast verbal pace',
      sessionsTogether: 13,
      tint: '#ddd3ec',
      since: daysAgo(70),
      momentum: 'steady',
      lastNote: 'Strong close reader. Zooming out to themes is the next step.',
      signals: sig(3.6, 4.4, 4.2, 3.4, 4.0, 3),
      sessionRatings: ratings(
        [3, 3, 4, 4, 3, 4, 4, 5, 4],
        [3, 3, 3, 4, 4, 4, 4, 4, 5]
      ),
      topics: [
        { name: 'The Chinese Exclusion Act', status: 'mastered', resources: [] },
        { name: 'Angel Island', status: 'mastered', resources: [] },
        { name: 'Japanese American incarceration', status: 'working', resources: [] },
        { name: 'The 1965 Immigration Act', status: 'working', resources: [] },
      ],
      lessons: [
        { date: daysAgo(5), topic: 'Japanese American incarceration', objective: 'Analyze Executive Order 9066', confBefore: 3, confAfter: 4, understBefore: 3, understAfter: 4, summary: 'Close read of the order was sharp. Linking it to civil rights took prompting.', strategies: ['Primary source', 'Socratic questioning'], breakthrough: true },
        { date: daysAgo(12), topic: 'Angel Island', objective: 'Read detainee poetry as evidence', confBefore: 3, confAfter: 4, understBefore: 3, understAfter: 4, summary: 'Moved by the wall poems. Used them as evidence in her argument.', strategies: ['Primary source', 'Discussion'], breakthrough: false },
        { date: daysAgo(19), topic: 'The Chinese Exclusion Act', objective: 'Explain the law and its context', confBefore: 3, confAfter: 4, understBefore: 4, understAfter: 4, summary: 'Confident summary of the law. Ready to compare across eras.', strategies: ['Discussion'], breakthrough: false },
      ],
      notes: [],
      lessonPlans: [],
      insights: {
        observations: [
          'Amara is a strong close reader and verbal reasoner (verbal 4.4/5) — she nails what a document says, but connecting it to broader themes needs a nudge.',
          'She builds the sharpest arguments in live discussion, weaker when asked to write cold.',
        ],
        recommendations: [
          'End each source with one "so what — how does this connect to today?" question.',
          'Let her argue it aloud first, then write; the spoken version is always stronger.',
        ],
        parentSummary:
          'Amara reads historical documents with real care and asks excellent questions. Our current work is helping her zoom out — connecting one law or letter to the larger story of immigration and belonging. Talking through the news together at home feeds directly into this.',
        nextFocus: 'Connect incarceration to the wider civil-rights arc.',
        updatedAt: daysAgo(5),
        reflectionCount: 3,
      },
      timeline: [
        { date: daysAgo(5), kind: 'reflection', text: 'Close read of EO 9066 was sharp. Connecting it to the bigger civil-rights story took prompting. Struggled with: synthesis.' },
      ],
    },
    {
      id: 'sam',
      name: 'Sam Whitfield',
      age: 11,
      grade: '6th grade',
      readingLevel: 'On grade level',
      homeLanguage: 'English',
      subject: 'Chinese',
      focus: 'Tones and building a core vocabulary',
      goals: 'Hold a simple conversation with correct tones',
      challenge: 'Hearing the difference between 2nd and 3rd tone',
      preferences: 'Say it aloud first, flashcards, no pressure',
      sessionsTogether: 11,
      tint: '#d4e3d2',
      since: daysAgo(30),
      momentum: 'finding footing',
      lastNote: 'Tone pairs are the wall. Singing them exaggerated helps a lot.',
      signals: sig(3.0, 2.6, 4.8, 4.2, 4.4, 2),
      sessionRatings: ratings(
        [2, 2, 3, 3, 2, 3, 3, 4],
        [2, 3, 3, 3, 3, 4, 3, 4]
      ),
      topics: [
        { name: 'The four tones', status: 'working', resources: [] },
        { name: 'Greetings & introductions', status: 'mastered', resources: [] },
        { name: 'Numbers 1–100', status: 'working', resources: [] },
      ],
      lessons: [
        { date: daysAgo(6), topic: 'The four tones', objective: 'Distinguish 2nd vs 3rd tone', confBefore: 2, confAfter: 3, understBefore: 2, understAfter: 3, summary: 'Exaggerating the tone contour helped. Still slips at speed.', strategies: ['Say-aloud', 'Modeling'], breakthrough: false },
        { date: daysAgo(13), topic: 'Greetings', objective: 'Introduce himself in Mandarin', confBefore: 2, confAfter: 3, understBefore: 3, understAfter: 3, summary: 'Said his whole self-intro aloud, then matched the characters. Best session yet.', strategies: ['Say-aloud', 'Flashcards'], breakthrough: true },
      ],
      notes: [],
      lessonPlans: [],
      insights: {
        observations: [
          'Sam produces tones well when he says a phrase out loud first (think-aloud 4.8/5) but stalls when starting from the written characters.',
        ],
        recommendations: [
          'Voice first: he hears it, repeats it exaggerated, then meets the character.',
          'This week: he self-corrects one tone pair without a prompt.',
        ],
        parentSummary:
          'Sam has a good ear and a real willingness to speak — our work now is lowering the gap between hearing a tone and producing it reliably. Playing simple Mandarin call-and-response at home, even silly and exaggerated, helps enormously.',
        nextFocus: 'He self-corrects a 2nd/3rd tone pair on his own.',
        updatedAt: daysAgo(6),
        reflectionCount: 2,
      },
      timeline: [
        { date: daysAgo(6), kind: 'reflection', text: 'Said his full self-intro aloud, then matched the characters. Best session yet, but tones slip when he reads cold.' },
      ],
    },
  ],

  topics: [
    { id: 't-frac', subject: 'Math', name: 'Fractions on the number line', learnerId: 'jasmine', material: '', description: 'Bridge the pizza model to the number line.', subtopics: ['Equivalent fractions', 'Comparing fractions'] },
    { id: 't-bio', subject: 'Biology', name: 'Photosynthesis', learnerId: 'diego', material: '', description: 'Build the equation from a diagram, analogy first.', subtopics: ['Chloroplasts', 'Inputs and outputs'] },
    { id: 't-aas', subject: 'Asian American Studies', name: 'Japanese American incarceration', learnerId: 'amara', material: '', description: 'Read EO 9066, connect it to the wider civil-rights arc.', subtopics: ['Executive Order 9066', 'Redress and memory'] },
    { id: 't-chin', subject: 'Chinese', name: 'The four tones', learnerId: 'sam', material: '', description: 'Say it aloud and exaggerated before meeting the character.', subtopics: ['2nd vs 3rd tone', 'Numbers 1–100'] },
  ],

  sessions: [
    { id: 's1', learnerId: 'jasmine', time: '4:00 pm', start: 16, date: iso(today), topic: 'Fractions on the number line', duration: 60, prepared: false, done: false, plan: null },
    { id: 's2', learnerId: 'diego', time: '5:30 pm', start: 17.5, date: iso(today), topic: 'Biology — Photosynthesis', duration: 45, prepared: true, done: false, plan: null },
    { id: 's3', learnerId: 'amara', time: '7:00 pm', start: 19, date: iso(today), topic: 'Japanese American incarceration', duration: 45, prepared: false, done: false, plan: null },
  ],

  reflections: [],
}
