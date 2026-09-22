"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  COACH_PITCH,
  COACH_RATE,
  MID_SET_CUE_GAP_MS,
  cancelCoachSpeech,
  estimateSpeakMs,
  pickBurnoutDuring,
  pickCoachVoice,
  pickMidSetPush,
  speakCoach,
  speakCoachAndWait,
} from "@/lib/coach";

export type CountdownSec = 5 | 10 | 15;
export type MicStatus = "listening" | "off" | "unsupported";

export type CoachCommand =
  | "start"
  | "pause"
  | "resume"
  | "reset"
  | "next"
  | "done"
  | "skip";

const MUTE_KEY = "cardio-burner-coach-mute";
const COUNTDOWN_KEY = "cardio-burner-countdown-sec";
const EXPLAIN_FORM_KEY = "cardio-burner-explain-form";

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((ev: { results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }> }) => void) | null;
  onerror: ((ev: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

function getSpeechRecognitionCtor():
  | (new () => SpeechRecognitionLike)
  | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function loadCountdownPref(): CountdownSec {
  if (typeof window === "undefined") return 10;
  const raw = localStorage.getItem(COUNTDOWN_KEY);
  if (raw === "5" || raw === "10" || raw === "15") return Number(raw) as CountdownSec;
  return 10;
}

export function loadMutePref(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(MUTE_KEY) === "1";
}

export function loadExplainFormPref(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(EXPLAIN_FORM_KEY) === "1";
}

export function saveExplainFormPref(on: boolean) {
  try {
    localStorage.setItem(EXPLAIN_FORM_KEY, on ? "1" : "0");
  } catch {
    /* ignore */
  }
}

export function CountdownSelector({
  value,
  onChange,
  className = "",
}: {
  value: CountdownSec;
  onChange: (v: CountdownSec) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
        Pre-set countdown
      </p>
      <div className="flex overflow-hidden rounded-xl border border-zinc-700">
        {([5, 10, 15] as CountdownSec[]).map((sec) => (
          <button
            key={sec}
            type="button"
            onClick={() => {
              onChange(sec);
              try {
                localStorage.setItem(COUNTDOWN_KEY, String(sec));
              } catch {
                /* ignore */
              }
            }}
            className={`flex-1 min-h-[44px] text-sm font-bold transition-colors ${
              value === sec
                ? "bg-orange-500 text-black"
                : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            {sec}s
          </button>
        ))}
      </div>
    </div>
  );
}

export function ExplainFormToggle({
  value,
  onChange,
  className = "",
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => {
          const next = !value;
          onChange(next);
          saveExplainFormPref(next);
        }}
        aria-pressed={value}
        className={`flex min-h-[44px] w-full items-center justify-between rounded-xl border px-4 text-sm font-semibold transition-colors ${
          value
            ? "border-orange-500/60 bg-orange-500/15 text-orange-300"
            : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
        }`}
      >
        <span>Explain form</span>
        <span className="text-xs font-bold uppercase tracking-wider">
          {value ? "On" : "Off"}
        </span>
      </button>
      <p className="mt-1.5 text-[11px] text-zinc-600">
        When on, coach speaks a form brief before Begin countdown.
      </p>
    </div>
  );
}

type CoachBotProps = {
  /** When true, mic listens for voice commands */
  active: boolean;
  muted: boolean;
  onMuteChange: (muted: boolean) => void;
  onCommand: (cmd: CoachCommand) => void;
  /** External callouts to push into the ticker (and optionally speak) */
  announce?: string | null;
  /** Clear announce after consuming */
  onAnnounceConsumed?: () => void;
  /** When true, mid-set cues use burnout bank */
  burnout?: boolean;
};

export function CoachBot({
  active,
  muted,
  onMuteChange,
  onCommand,
  announce,
  onAnnounceConsumed,
  burnout = false,
}: CoachBotProps) {
  const [callouts, setCallouts] = useState<string[]>([
    "Coach ready. Hands-free mode.",
  ]);
  const [micStatus, setMicStatus] = useState<MicStatus>("off");
  const [listeningEnabled, setListeningEnabled] = useState(true);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const recogRef = useRef<SpeechRecognitionLike | null>(null);
  const keepListening = useRef(false);
  const lastCmdAt = useRef(0);
  const lastMidSpeakAt = useRef(0);
  const burnoutRef = useRef(burnout);
  burnoutRef.current = burnout;

  const pushCallout = useCallback((line: string) => {
    setCallouts((prev) => [...prev.slice(-8), line]);
  }, []);

  const speak = useCallback(
    (text: string, opts?: { rate?: number; pitch?: number }) => {
      pushCallout(text.length > 90 ? `${text.slice(0, 87)}…` : text);
      if (muted) return;
      speakCoach(text, false, {
        rate: opts?.rate ?? COACH_RATE,
        pitch: opts?.pitch ?? COACH_PITCH,
      });
    },
    [muted, pushCallout]
  );

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const assign = () => {
      voiceRef.current = pickCoachVoice();
    };
    assign();
    window.speechSynthesis.addEventListener("voiceschanged", assign);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", assign);
      cancelCoachSpeech();
    };
  }, []);

  useEffect(() => {
    if (!announce) return;
    speak(announce, { rate: COACH_RATE, pitch: COACH_PITCH });
    onAnnounceConsumed?.();
  }, [announce, speak, onAnnounceConsumed]);

  // Sparse mid-set push — ticker always, speech only on spaced key moments
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => {
      const line = burnoutRef.current
        ? pickBurnoutDuring()
        : pickMidSetPush();
      const now = Date.now();
      // Always show on ticker; speak only if gap elapsed (avoids spam / overlap)
      if (now - lastMidSpeakAt.current >= MID_SET_CUE_GAP_MS) {
        lastMidSpeakAt.current = now;
        speak(line, { rate: 1.02, pitch: COACH_PITCH });
      } else {
        pushCallout(line);
      }
    }, MID_SET_CUE_GAP_MS);
    return () => clearInterval(id);
  }, [active, speak, pushCallout]);

  const mapTranscript = useCallback((raw: string): CoachCommand | null => {
    const t = raw.toLowerCase().trim();
    if (/\b(start|begin|go)\b/.test(t)) return "start";
    if (/\b(pause|stop|hold)\b/.test(t)) return "pause";
    if (/\b(resume|continue|unpause)\b/.test(t)) return "resume";
    if (/\b(reset|restart)\b/.test(t)) return "reset";
    if (/\b(next|next set)\b/.test(t)) return "next";
    if (/\b(done|finish|complete)\b/.test(t)) return "done";
    if (/\b(skip)\b/.test(t)) return "skip";
    return null;
  }, []);

  useEffect(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setMicStatus("unsupported");
      return;
    }
    if (!active || !listeningEnabled) {
      keepListening.current = false;
      try {
        recogRef.current?.stop();
      } catch {
        /* ignore */
      }
      setMicStatus(Ctor ? "off" : "unsupported");
      return;
    }

    keepListening.current = true;
    const recog = new Ctor();
    recog.continuous = true;
    recog.interimResults = false;
    recog.lang = "en-US";
    recog.onresult = (ev) => {
      const results = ev.results;
      const last = results[results.length - 1];
      if (!last?.isFinal) return;
      const transcript = last[0]?.transcript || "";
      const cmd = mapTranscript(transcript);
      if (!cmd) return;
      const now = Date.now();
      if (now - lastCmdAt.current < 900) return;
      lastCmdAt.current = now;
      pushCallout(`Heard: “${cmd}”`);
      onCommand(cmd);
    };
    recog.onerror = (ev) => {
      if (ev.error === "not-allowed" || ev.error === "service-not-allowed") {
        keepListening.current = false;
        setMicStatus("off");
        setListeningEnabled(false);
      }
    };
    recog.onend = () => {
      if (keepListening.current) {
        try {
          recog.start();
        } catch {
          setMicStatus("off");
        }
      } else {
        setMicStatus("off");
      }
    };
    recogRef.current = recog;
    try {
      recog.start();
      setMicStatus("listening");
    } catch {
      setMicStatus("off");
    }
    return () => {
      keepListening.current = false;
      try {
        recog.abort();
      } catch {
        try {
          recog.stop();
        } catch {
          /* ignore */
        }
      }
      recogRef.current = null;
    };
  }, [active, listeningEnabled, mapTranscript, onCommand, pushCallout]);

  const micLabel = useMemo(() => {
    if (micStatus === "unsupported") return "Mic: Unsupported";
    if (micStatus === "listening") return "Mic: Listening";
    return "Mic: Off";
  }, [micStatus]);

  const toggleMute = () => {
    const next = !muted;
    onMuteChange(next);
    if (next) cancelCoachSpeech();
    try {
      localStorage.setItem(MUTE_KEY, next ? "1" : "0");
    } catch {
      /* ignore */
    }
  };

  const latest = callouts[callouts.length - 1] || "";

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4">
      <div className="flex items-start gap-3">
        <div
          className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${
            active
              ? "bg-gradient-to-br from-orange-500 to-red-600 shadow-[0_0_24px_rgba(249,115,22,0.45)]"
              : "bg-zinc-700"
          }`}
          aria-hidden
        >
          <div className="h-8 w-8 rounded-full bg-zinc-950/40 ring-2 ring-white/30" />
          {active && (
            <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 animate-pulse rounded-full bg-emerald-400 ring-2 ring-zinc-900" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-black uppercase tracking-wider text-orange-400">
              Drive Coach
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleMute}
                className="rounded-lg bg-zinc-800 px-2.5 py-1 text-xs font-semibold text-zinc-200"
                aria-pressed={muted}
              >
                {muted ? "Unmute" : "Mute"}
              </button>
              {micStatus !== "unsupported" && (
                <button
                  type="button"
                  onClick={() => setListeningEnabled((v) => !v)}
                  className="rounded-lg bg-zinc-800 px-2.5 py-1 text-xs font-semibold text-zinc-200"
                  aria-pressed={listeningEnabled && active}
                >
                  {listeningEnabled ? "Mic on" : "Mic off"}
                </button>
              )}
            </div>
          </div>
          <p className="mt-0.5 text-[11px] font-medium text-zinc-500">
            {micLabel}
            <span className="text-zinc-600"> · Drive intensity</span>
          </p>
          <div className="mt-2 overflow-hidden rounded-lg bg-zinc-950/60 px-3 py-2">
            <p
              key={latest}
              className="truncate text-sm font-semibold text-white"
            >
              {latest}
            </p>
          </div>
          <p className="mt-1.5 text-[10px] text-zinc-600">
            Voice: start · pause · resume · reset · next · done · skip — no chat typing
          </p>
        </div>
      </div>
    </div>
  );
}

/** Imperative helpers used by WorkoutClient for countdown + drive lines */
export function speakDrive(
  text: string,
  muted: boolean,
  opts?: { rate?: number; pitch?: number }
) {
  speakCoach(text, muted, {
    rate: opts?.rate ?? COACH_RATE,
    pitch: opts?.pitch ?? COACH_PITCH,
  });
}

export { estimateSpeakMs, speakCoachAndWait };

/**
 * Speak a form coaching script (one-way). Respects mute.
 * Returns a promise that resolves after an estimated speak duration.
 */
export function speakFormScript(
  text: string,
  muted: boolean,
  opts?: { rate?: number; pitch?: number }
): Promise<void> {
  return speakCoachAndWait(text, muted, {
    rate: opts?.rate ?? 0.95,
    pitch: opts?.pitch ?? 0.82,
  });
}

export type { CoachBotProps };
