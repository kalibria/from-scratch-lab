export type Session = {
  id: number;
  startedAt: string;
  endedAt: string | null;
  plannedMinutes: number;
};

export type SessionMode = 'combined' | 'free-talk' | 'drill';

export type StudyTopic = 'collocation' | 'phrasal_verb' | 'idiom' | 'free_talk';

export type Phrase = {
  id: number;
  enText: string;
  ruGloss: string | null;
};

export type SuggestedPhrase = {
  enText: string;
  ruGloss?: string;
  usageNote?: string;
};
