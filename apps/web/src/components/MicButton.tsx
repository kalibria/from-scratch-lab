import { useSpeechRecognition } from './use-speech-recognition.js';

type MicButtonProps = { onTranscript: (text: string) => void };

export function MicButton({ onTranscript }: MicButtonProps) {
  const { isSupported, isListening, start, stop } = useSpeechRecognition();

  if (!isSupported) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => (isListening ? stop() : start(onTranscript))}
      aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors ${
        isListening ? 'border-accent bg-accent-soft text-accent' : 'border-border text-ink-soft'
      }`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="9" y="2" width="6" height="12" rx="3" />
        <path d="M5 10v1a7 7 0 0 0 14 0v-1" strokeLinecap="round" />
        <path d="M12 18v4" strokeLinecap="round" />
      </svg>
    </button>
  );
}
