import { useState } from 'react';
import { PinGate } from './pin-gate/PinGate.js';
import { Dashboard } from './dashboard/Dashboard.js';
import { FreeTalkSession } from './free-talk-session/FreeTalkSession.js';
import { DrillSession } from './drill-session/DrillSession.js';
import { SessionSummary } from './session-summary/SessionSummary.js';
import { AddPhrase } from './add-phrase/AddPhrase.js';
import { AgentDashboard } from './agent-dashboard/AgentDashboard.js';
import { RecitationSession } from './recitation/RecitationSession.js';
import { GrammarSession } from './grammar/GrammarSession.js';
import { BrowseSession } from './browse-session/BrowseSession.js';
import { LessonHub } from './lessons/LessonHub.js';
import { LessonDetail } from './lessons/LessonDetail.js';
import { LessonWritingStep } from './lessons/LessonWritingStep.js';
import { LessonSpeakingStep } from './lessons/LessonSpeakingStep.js';
import { LessonCheckpoint } from './lessons/LessonCheckpoint.js';
import { markLessonStep } from './lessons/mark-lesson-step.js';
import type { Session, SessionMode, StudyTopic, SuggestedPhrase, ReturnDestination } from './types.js';

type View =
  | { name: 'dashboard' }
  | { name: 'free-talk'; session: Session; mode: SessionMode; topics: StudyTopic[] }
  | { name: 'drill'; session: Session; suggestedPhrases: SuggestedPhrase[]; topics: StudyTopic[] }
  | { name: 'session-summary'; session: Session; suggestedPhrases: SuggestedPhrase[]; comebackPhrases: string[] }
  | { name: 'agent-dashboard' }
  | { name: 'add-phrase' }
  | { name: 'recitation' }
  | { name: 'grammar'; topicId?: number; returnTo?: ReturnDestination }
  | { name: 'browse'; topics: StudyTopic[]; returnTo?: ReturnDestination }
  | { name: 'lesson-hub' }
  | { name: 'lesson'; lessonId: number }
  | { name: 'lesson-writing'; lessonId: number }
  | { name: 'lesson-speaking'; lessonId: number }
  | { name: 'lesson-checkpoint'; lessonId: number };

export function App() {
  const [view, setView] = useState<View>({ name: 'dashboard' });

  return (
    <PinGate>
      {view.name === 'dashboard' && (
        <Dashboard
          onStartSession={(session, mode, topics) =>
            mode === 'drill'
              ? setView({ name: 'drill', session, suggestedPhrases: [], topics })
              : setView({ name: 'free-talk', session, mode, topics })
          }
          onOpenAgentDashboard={() => setView({ name: 'agent-dashboard' })}
          onAddPhrase={() => setView({ name: 'add-phrase' })}
          onOpenRecitation={() => setView({ name: 'recitation' })}
          onOpenGrammar={() => setView({ name: 'grammar' })}
          onOpenBrowse={(topics) => setView({ name: 'browse', topics })}
          onOpenLessons={() => setView({ name: 'lesson-hub' })}
        />
      )}
      {view.name === 'recitation' && <RecitationSession onDone={() => setView({ name: 'dashboard' })} />}
      {view.name === 'grammar' && (
        <GrammarSession
          topicId={view.topicId}
          onDone={async () => {
            if (view.returnTo?.name === 'lesson') {
              await markLessonStep(view.returnTo.lessonId, 'grammar');
            }
            setView(view.returnTo ?? { name: 'dashboard' });
          }}
        />
      )}
      {view.name === 'browse' && (
        <BrowseSession
          topics={view.topics}
          backLabel={view.returnTo?.name === 'lesson' ? 'Back to lesson' : undefined}
          onDone={async () => {
            if (view.returnTo?.name === 'lesson') {
              await markLessonStep(view.returnTo.lessonId, 'vocab');
            }
            setView(view.returnTo ?? { name: 'dashboard' });
          }}
        />
      )}
      {view.name === 'lesson-hub' && (
        <LessonHub
          onOpenLesson={(lessonId) => setView({ name: 'lesson', lessonId })}
          onDone={() => setView({ name: 'dashboard' })}
        />
      )}
      {view.name === 'lesson' && (
        <LessonDetail
          lessonId={view.lessonId}
          onOpenVocab={(vocabCategory, lessonId) =>
            setView({ name: 'browse', topics: [vocabCategory], returnTo: { name: 'lesson', lessonId } })
          }
          onOpenGrammar={(topicId, lessonId) =>
            setView({ name: 'grammar', topicId, returnTo: { name: 'lesson', lessonId } })
          }
          onOpenWriting={(lessonId) => setView({ name: 'lesson-writing', lessonId })}
          onOpenSpeaking={(lessonId) => setView({ name: 'lesson-speaking', lessonId })}
          onOpenCheckpoint={(lessonId) => setView({ name: 'lesson-checkpoint', lessonId })}
          onDone={() => setView({ name: 'lesson-hub' })}
        />
      )}
      {view.name === 'lesson-writing' && (
        <LessonWritingStep
          lessonId={view.lessonId}
          onDone={() => setView({ name: 'lesson', lessonId: view.lessonId })}
        />
      )}
      {view.name === 'lesson-speaking' && (
        <LessonSpeakingStep
          lessonId={view.lessonId}
          onDone={() => setView({ name: 'lesson', lessonId: view.lessonId })}
        />
      )}
      {view.name === 'lesson-checkpoint' && (
        <LessonCheckpoint
          lessonId={view.lessonId}
          onDone={() => setView({ name: 'lesson', lessonId: view.lessonId })}
        />
      )}
      {view.name === 'free-talk' && (
        <FreeTalkSession
          session={view.session}
          onComplete={(suggestedPhrases, session) =>
            view.mode === 'free-talk'
              ? setView({ name: 'session-summary', session, suggestedPhrases, comebackPhrases: [] })
              : setView({ name: 'drill', session, suggestedPhrases, topics: view.topics })
          }
          onExit={() => setView({ name: 'dashboard' })}
        />
      )}
      {view.name === 'drill' && (
        <DrillSession
          session={view.session}
          topics={view.topics}
          onFinish={(comebackPhrases) =>
            setView({
              name: 'session-summary',
              session: view.session,
              suggestedPhrases: view.suggestedPhrases,
              comebackPhrases,
            })
          }
        />
      )}
      {view.name === 'session-summary' && (
        <SessionSummary
          session={view.session}
          suggestedPhrases={view.suggestedPhrases}
          comebackPhrases={view.comebackPhrases}
          onDone={() => setView({ name: 'dashboard' })}
        />
      )}
      {view.name === 'agent-dashboard' && <AgentDashboard onBack={() => setView({ name: 'dashboard' })} />}
      {view.name === 'add-phrase' && <AddPhrase onDone={() => setView({ name: 'dashboard' })} />}
    </PinGate>
  );
}
