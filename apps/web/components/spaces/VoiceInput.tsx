"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

type VoiceState = "idle" | "listening" | "processing" | "error" | "unsupported";

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

function MicIcon({ state }: { state: VoiceState }) {
  const isListening = state === "listening";
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect
        x="5.5" y="1" width="5" height="8" rx="2.5"
        stroke={isListening ? "rgba(224,116,58,0.9)" : "rgba(255,255,255,0.4)"}
        strokeWidth="1.2"
        fill={isListening ? "rgba(224,116,58,0.15)" : "none"}
      />
      <path
        d="M2.5 8C2.5 11.038 5.462 13.5 8 13.5C10.538 13.5 13.5 11.038 13.5 8"
        stroke={isListening ? "rgba(224,116,58,0.9)" : "rgba(255,255,255,0.4)"}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <line
        x1="8" y1="13.5" x2="8" y2="15.5"
        stroke={isListening ? "rgba(224,116,58,0.9)" : "rgba(255,255,255,0.4)"}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function VoiceInput({ onTranscript, disabled = false }: VoiceInputProps) {
  const [state, setState] = useState<VoiceState>("idle");
  const [interimText, setInterimText] = useState("");
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const finalTranscriptRef = useRef("");

  // Check support on mount
  useEffect(() => {
    const SpeechRecognition =
      typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SpeechRecognition) {
      setState("unsupported");
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setState("idle");
    setInterimText("");
  }, []);

  const startListening = useCallback(() => {
    if (state === "listening") {
      stopListening();
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    finalTranscriptRef.current = "";

    recognition.onstart = () => {
      setState("listening");
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final = finalTranscriptRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript + " ";
        } else {
          interim += transcript;
        }
      }

      finalTranscriptRef.current = final;
      setInterimText(interim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "no-speech") {
        // Silently stop — user just didn't speak
        stopListening();
        return;
      }
      setState("error");
      setTimeout(() => setState("idle"), 2000);
    };

    recognition.onend = () => {
      const final = finalTranscriptRef.current.trim();
      if (final) {
        onTranscript(final);
      }
      setState("idle");
      setInterimText("");
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [state, stopListening, onTranscript]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  if (state === "unsupported") return null;

  return (
    <div className="relative flex items-center">
      <button
        onClick={startListening}
        disabled={disabled}
        title={state === "listening" ? "Stop recording" : "Speak your moment"}
        className={`relative flex items-center justify-center w-9 h-9 border transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
          state === "listening"
            ? "border-[#e0743a]/40 bg-[#e0743a]/[0.08]"
            : state === "error"
            ? "border-red-500/30 bg-red-500/[0.06]"
            : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.16] hover:bg-white/[0.04]"
        }`}
        style={{ borderRadius: 8 }}
        aria-label={state === "listening" ? "Stop voice input" : "Start voice input"}
        aria-pressed={state === "listening"}
      >
        {/* Pulse ring when listening */}
        <AnimatePresence>
          {state === "listening" && (
            <motion.span
              key="pulse"
              className="absolute inset-0 rounded-lg border border-[#e0743a]/30"
              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </AnimatePresence>
        <MicIcon state={state} />
      </button>

      {/* Interim transcript tooltip */}
      <AnimatePresence>
        {state === "listening" && interimText && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute bottom-full left-0 mb-2 max-w-xs bg-[#0c0a0d] border border-white/[0.08] px-3 py-2 pointer-events-none z-10"
            style={{ borderRadius: 8 }}
          >
            <p className="text-[12px] text-[#76716b] italic leading-relaxed">{interimText}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Listening indicator */}
      <AnimatePresence>
        {state === "listening" && (
          <motion.div
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            className="ml-2 flex items-center gap-1.5"
          >
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-0.5 bg-[#e0743a]/60 rounded-full"
                animate={{ height: ["4px", "12px", "4px"] }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.15,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#e0743a]/60 ml-1">
              Listening
            </span>
          </motion.div>
        )}
        {state === "error" && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="ml-2 font-mono text-[9px] uppercase tracking-[0.14em] text-red-400/60"
          >
            Mic error
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}