export type Session = {
  id: number;
  startedAt: string;
  endedAt: string | null;
  plannedMinutes: number;
};

export type SessionMode = 'combined' | 'free-talk' | 'drill';

export type StudyTopic = string;

export type Phrase = {
  id: number;
  enText: string;
  ruGloss: string | null;
  box: number;
};

export type SuggestedPhrase = {
  enText: string;
  ruGloss?: string;
  usageNote?: string;
};

export type LessonProgress = {
  vocabDone: boolean;
  grammarDone: boolean;
  writingDone: boolean;
  speakingDone: boolean;
  checkpointDone: boolean;
  checkpointScore: number | null;
};

export type LessonSummary = {
  id: number;
  number: number;
  title: string;
  sourceBook: string;
  level: string;
  vocabTheme: string;
  progress: LessonProgress;
};

export type LessonDetail = LessonSummary & {
  vocabCategory: string;
  grammarTopicId: number;
  grammarTopicName: string;
  speakingPrompt: string;
};

export type ReturnDestination = { name: 'dashboard' } | { name: 'lesson'; lessonId: number };
