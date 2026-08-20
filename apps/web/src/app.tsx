import { useState } from 'react';
import { PinGate } from './pin-gate/PinGate.js';
import { Dashboard } from './dashboard/Dashboard.js';
import { FreeTalkSession } from './free-talk-session/FreeTalkSession.js';
import { DrillSession } from './drill-session/DrillSession.js';
import { SessionSummary } from './session-summary/SessionSummary.js';
import { AddPhrase } from './add-phrase/AddPhrase.js';
import { AgentDashboard } from './agent-dashboard/AgentDashboard.js';
import type { Session, SuggestedPhrase } from './types.js';

type View =
  | { name: 'dashboard' }
  | { name: 'free-talk'; session: Session }
  | { name: 'drill'; session: Session; suggestedPhrases: SuggestedPhrase[] }
  | { name: 'session-summary'; session: Session; suggestedPhrases: SuggestedPhrase[]; comebackPhrases: string[] }
  | { name: 'agent-dashboard' }
  | { name: 'add-phrase' };

export function App() {
  const [view, setView] = useState<View>({ name: 'dashboard' });

  return (
    <PinGate>
      {view.name === 'dashboard' && (
        <Dashboard
          onStartSession={(session) => setView({ name: 'free-talk', session })}
          onOpenAgentDashboard={() => setView({ name: 'agent-dashboard' })}
          onAddPhrase={() => setView({ name: 'add-phrase' })}
        />
      )}
      {view.name === 'free-talk' && (
        <FreeTalkSession
          session={view.session}
          onComplete={(suggestedPhrases) => setView({ name: 'drill', session: view.session, suggestedPhrases })}
        />
      )}
      {view.name === 'drill' && (
        <DrillSession
          session={view.session}
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
