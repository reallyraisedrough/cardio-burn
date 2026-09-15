"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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

const DRIVE_LINES = [
  "Let's go.",
  "Push through.",
  "One more.",
  "Stay locked in.",
  "Empty the tank.",
  "You got this.",
  "Drive.",
  "Keep moving.",
  "Strong.",
  "Burn it out.",
];

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

function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  const en = voices.filter((v) => /en(-|_|$)/i.test(v.lang));
  const pool = en.length ? en : voices;
  if (!pool.length) return null;
  const preferred = pool.find((v) =>
    /david|daniel|alex|fred|male|deep|bass|baritone|google uk english male|microsoft david|microsoft guy|samantha/i.test(
      v.name
    )
  );
  // Prefer lower-sounding / male-coded English voices when available
  return preferred || pool.find((v) => /en-US|en-GB/i.test(v.lang)) || pool[0];
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
};

export function CoachBot({
  active,
  muted,
  onMuteChange,
  onCommand,
  announce,
  onAnnounceConsumed,
}: CoachBotProps) {
  const [callouts, setCallouts] = useState<string[]>(["Coach ready. Hands-free mode."]);
  const [micStatus, setMicStatus] = useState<MicStatus>("off");
  const [listeningEnabled, setListeningEnabled] = useState(true);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const recogRef = useRef<SpeechRecognitionLike | null>(null);
  const keepListening = useRef(false);
  const lastCmdAt = useRef(0);

  const pushCallout = useCallback((line: string) => {
    setCallouts((prev) => [...prev.slice(-8), line]);
  }, []);

  const speak = useCallback(
    (text: string, opts?: { rate?: number; pitch?: number }) => {
      pushCallout(text);
      if (muted) return;
      if (typeof window === "undefined" || !window.speechSynthesis) return;
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.rate = opts?.rate ?? 1.0;
        u.pitch = opts?.pitch ?? 0.9;
        u.volume = 1;
        if (voiceRef.current) u.voice = voiceRef.current;
        window.speechSynthesis.speak(u);
      } catch {
        /* TTS optional */
      }
    },
    [muted, pushCallout]
  );

  // Load voices
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const assign = () => {
      voiceRef.current = pickVoice();
    };
    assign();
    window.speechSynthesis.addEventListener("voiceschanged", assign);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", assign);
    };
  }, []);

  // Consume external announcements
  useEffect(() => {
    if (!announce) return;
    speak(announce, { rate: 0.98, pitch: 0.88 });
    onAnnounceConsumed?.();
  }, [announce, speak, onAnnounceConsumed]);

  // Motivational ticker while active (visual + occasional TTS)
  useEffect(() => {
    if (!active) return;
    let i = 0;
    const id = window.setInterval(() => {
      const line = DRIVE_LINES[i % DRIVE_LINES.length];
      i += 1;
      // Visual always; speak every other line to avoid chatter
      if (i % 2 === 0) {
        speak(line, { rate: 1.02, pitch: 0.9 });
      } else {
        pushCallout(line);
      }
    }, 22000);
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

  // Speech recognition
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
        {/* Drive orb avatar */}
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
              Coach
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
          <p className="mt-0.5 text-[11px] font-medium text-zinc-500">{micLabel}</p>
          {/* Scrolling one-line callout — NO chat input */}
          <div className="mt-2 overflow-hidden rounded-lg bg-zinc-950/60 px-3 py-2">
            <p
              key={latest}
              className="truncate text-sm font-semibold text-white"
            >
              {latest}
            </p>
          </div>
          <p className="mt-1.5 text-[10px] text-zinc-600">
            Voice: start · pause · resume · reset · next · done · skip
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
  if (muted) return;
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = opts?.rate ?? 1.0;
    u.pitch = opts?.pitch ?? 0.9;
    const voice = pickVoice();
    if (voice) u.voice = voice;
    window.speechSynthesis.speak(u);
  } catch {
    /* optional */
  }
}

export type { CoachBotProps };
