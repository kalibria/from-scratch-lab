export type Session = {
  id: number;
  startedAt: string;
  endedAt: string | null;
  plannedMinutes: number;
};

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
