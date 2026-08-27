import { useEffect, useRef, useState } from 'react';

const STARTUP_TIMEOUT_MS = 3000;

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: { transcript: string };
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const startupTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSupported = getSpeechRecognitionConstructor() !== null;

  function clearStartupTimeout() {
    if (startupTimeoutRef.current !== null) {
      clearTimeout(startupTimeoutRef.current);
      startupTimeoutRef.current = null;
    }
  }

  function start(onTranscript: (text: string) => void) {
    const Constructor = getSpeechRecognitionConstructor();

    if (!Constructor) {
      return;
    }

    const recognition = new Constructor();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onstart = () => clearStartupTimeout();

    recognition.onresult = (event) => {
      let finalText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        }
      }

      if (finalText) {
        onTranscript(finalText);
      }
    };

    recognition.onerror = () => {
      clearStartupTimeout();
      setIsListening(false);
    };
    recognition.onend = () => {
      clearStartupTimeout();
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    // Some browsers (notably iOS WebKit) expose the SpeechRecognition
    // constructor but never actually start listening — no event fires at
    // all. If that happens, give up instead of leaving the button stuck.
    startupTimeoutRef.current = setTimeout(() => {
      recognition.stop();
      setIsListening(false);
    }, STARTUP_TIMEOUT_MS);

    recognition.start();
    setIsListening(true);
  }

  function stop() {
    clearStartupTimeout();
    recognitionRef.current?.stop();
    setIsListening(false);
  }

  useEffect(() => {
    return () => {
      clearStartupTimeout();
      recognitionRef.current?.stop();
    };
  }, []);

  return { isSupported, isListening, start, stop };
}
