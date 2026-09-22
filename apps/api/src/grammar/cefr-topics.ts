export type CefrLevel = 'B1' | 'B2' | 'C1';

export type CefrTopic = { name: string; level: CefrLevel; description: string };

export const CEFR_TOPICS: CefrTopic[] = [
  {
    name: 'Present Perfect vs Past Simple',
    level: 'B1',
    description: "Choosing between 'I have done' and 'I did' — Russian doesn't distinguish these aspects.",
  },
  {
    name: 'First Conditional',
    level: 'B1',
    description: "If + present simple, will + base verb, for real future possibilities.",
  },
  {
    name: 'Second Conditional',
    level: 'B1',
    description: "If + past simple, would + base verb, for hypothetical present situations.",
  },
  {
    name: 'Modals of Obligation',
    level: 'B1',
    description: "must / have to / should / need to — negative forms change meaning (don't have to vs mustn't).",
  },
  {
    name: 'Comparatives and Superlatives',
    level: 'B1',
    description: '-er/-est vs more/most, plus irregular forms (good/better/best).',
  },
  {
    name: 'Present Continuous for Future Arrangements',
    level: 'B1',
    description: "Fixed future plans, e.g. 'I'm meeting him tomorrow.'",
  },
  {
    name: 'Used to / Would for Past Habits',
    level: 'B1',
    description: 'Talking about past habits and states that no longer happen.',
  },
  {
    name: 'Passive Voice (Simple Tenses)',
    level: 'B1',
    description: "'is done' / 'was done' — often skipped in favor of active voice.",
  },
  {
    name: 'Third Conditional',
    level: 'B2',
    description: 'If + past perfect, would have + past participle, for unreal past situations.',
  },
  {
    name: 'Reported Speech',
    level: 'B2',
    description: 'Backshifting tenses when reporting what someone said.',
  },
  {
    name: 'Relative Clauses',
    level: 'B2',
    description: 'Defining vs non-defining, who/which/that, and when commas matter.',
  },
  {
    name: 'Passive Voice (All Tenses)',
    level: 'B2',
    description: 'Extending passive constructions to perfect and continuous tenses.',
  },
  {
    name: 'Modals of Deduction',
    level: 'B2',
    description: "must have / might have / can't have, for guessing about the past.",
  },
  {
    name: 'Gerunds vs Infinitives',
    level: 'B2',
    description: 'Verbs followed by -ing vs to + verb — a frequent source of errors.',
  },
  {
    name: 'Articles',
    level: 'B2',
    description: 'a/an/the/zero article — a concept absent in Russian, a persistent difficulty.',
  },
  {
    name: 'Mixed Conditionals',
    level: 'B2',
    description: 'Combining past and present unreal conditions in one sentence.',
  },
  {
    name: 'Inversion for Emphasis',
    level: 'C1',
    description: "Starting a sentence with a negative adverbial, e.g. 'Never have I seen...'",
  },
  {
    name: 'Cleft Sentences',
    level: 'C1',
    description: "It was... that / What... is, for emphasizing part of a sentence.",
  },
  {
    name: 'Subjunctive Mood',
    level: 'C1',
    description: "After suggest/recommend/insist, e.g. 'I suggest he go', or in 'if I were you'.",
  },
  {
    name: 'Advanced Modals of Criticism',
    level: 'C1',
    description: 'should have / needn\'t have / could have, for judging past actions.',
  },
  {
    name: 'Participle Clauses',
    level: 'C1',
    description: 'Reducing relative or time clauses with -ing or -ed forms.',
  },
  {
    name: 'Ellipsis and Substitution',
    level: 'C1',
    description: "Omitting repeated words, e.g. 'I think so', 'so did I'.",
  },
  {
    name: 'Nuanced Prepositions',
    level: 'C1',
    description: "Fixed preposition combinations with no Russian equivalent, e.g. 'depend on', 'good at'.",
  },
  {
    name: 'Discourse Markers and Hedging',
    level: 'C1',
    description: "Native-sounding connectors and softening language, e.g. 'to be fair', 'as it happens'.",
  },
];
