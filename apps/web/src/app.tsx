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
import type { Session, SessionMode, StudyTopic, SuggestedPhrase } from './types.js';

type View =
  | { name: 'dashboard' }
  | { name: 'free-talk'; session: Session; mode: SessionMode; topics: StudyTopic[] }
  | { name: 'drill'; session: Session; suggestedPhrases: SuggestedPhrase[]; topics: StudyTopic[] }
  | { name: 'session-summary'; session: Session; suggestedPhrases: SuggestedPhrase[]; comebackPhrases: string[] }
  | { name: 'agent-dashboard' }
  | { name: 'add-phrase' }
  | { name: 'recitation' }
  | { name: 'grammar' };

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
        />
      )}
      {view.name === 'recitation' && <RecitationSession onDone={() => setView({ name: 'dashboard' })} />}
      {view.name === 'grammar' && <GrammarSession onDone={() => setView({ name: 'dashboard' })} />}
      {view.name === 'free-talk' && (
        <FreeTalkSession
          session={view.session}
          onComplete={(suggestedPhrases, session) =>
            view.mode === 'free-talk'
              ? setView({ name: 'session-summary', session, suggestedPhrases, comebackPhrases: [] })
              : setView({ name: 'drill', session, suggestedPhrases, topics: view.topics })
          }
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
