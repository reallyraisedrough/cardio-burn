/**
 * Drive-coach TTS voice + cue banks for Cardio Burner workouts.
 * One-way motivational calls — no medical claims.
 */

import type { Exercise } from "./types";
import type { IntensityMode } from "./modes";
import { MODE_PRESETS, isIntensityMode, migrateModeId } from "./modes";

/**
 * Slightly energetic human trainer — not a deep slow robot.
 * Rate stays in 1.05–1.12; pitch stays in 1.0–1.08.
 */
export const COACH_PITCH = 1.04;
export const COACH_RATE = 1.08;
export const COACH_RATE_COUNT = 1.1;
export const COACH_RATE_GO = 1.12;
export const COACH_RATE_FORM = 1.06;
export const COACH_PITCH_FORM = 1.02;

const RATE_MIN = 1.05;
const RATE_MAX = 1.12;
const PITCH_MIN = 1.0;
const PITCH_MAX = 1.08;

/** Keep every utterance in the human band, even if a caller passes the old robot values. */
export function humanRate(rate?: number): number {
  const r = rate ?? COACH_RATE;
  if (!Number.isFinite(r)) return COACH_RATE;
  return Math.min(RATE_MAX, Math.max(RATE_MIN, r));
}

export function humanPitch(pitch?: number): number {
  const p = pitch ?? COACH_PITCH;
  if (!Number.isFinite(p)) return COACH_PITCH;
  return Math.min(PITCH_MAX, Math.max(PITCH_MIN, p));
}

/** Minimum gap between mid-set push cues (ms). */
export const MID_SET_CUE_GAP_MS = 38_000;

/** Only speak countdown ticks for the final N seconds. */
export const COUNTDOWN_SPEAK_LAST = 3;

/**
 * Known natural English voices (Web Speech). Higher score = more human.
 * Google US English, Samantha, and Daniel are the usual "real person" installs.
 * Neural / Premium / Enhanced names (Edge, macOS) rank with them.
 */
const NATURAL_VOICE_TIERS: { re: RegExp; score: number }[] = [
  { re: /google us english/i, score: 120 },
  { re: /\bsamantha\b/i, score: 112 },
  { re: /\bdaniel\b/i, score: 110 },
  { re: /google uk english female/i, score: 104 },
  { re: /google uk english male/i, score: 102 },
  { re: /google .+ english/i, score: 98 },
  { re: /\b(allison|ava|serena|nicky|siri)\b/i, score: 90 },
  { re: /\b(karen|moira|tessa|victoria|fiona|alex|rishi|aaron|nathan|lee)\b/i, score: 84 },
  { re: /\b(aria|jenny|guy|davis|sonia|libby|natasha|michelle|ryan)\b/i, score: 78 },
];

/** Classic desktop TTS, eSpeak, and macOS novelty voices — avoid when anything better exists. */
const ROBOTIC_VOICE_RE =
  /espeak|festival|mbrola|compact|novelty|bad news|\bbahh\b|\bbells\b|\bboing\b|bubbles|cellos|deranged|good news|hysterical|\bjunior\b|pipe organ|trinoids|\bwhisper\b|zarvox|\balbert\b|\bfred\b|superstar|wobble|\borgan\b|\brobot\b|microsoft david|microsoft zira|microsoft mark|microsoft hazel/i;

function naturalNameScore(name: string): number {
  let best = 0;
  for (const tier of NATURAL_VOICE_TIERS) {
    if (tier.re.test(name)) best = Math.max(best, tier.score);
  }
  if (/natural|neural|premium|enhanced/i.test(name)) best += 36;
  return best;
}

/**
 * Pick the most natural English voice installed.
 * Rule: score English voices by known human names (Google US English, Samantha,
 * Daniel, and similar), plus Natural/Neural/Premium. Penalize robotic defaults
 * (eSpeak, Microsoft David/Zira, novelty voices). Remote Google voices are not
 * penalized for being non-local — they usually sound more human than the OS default.
 * If every voice looks robotic, still return the least-bad one; speakCoach keeps
 * the energetic human rate and pitch either way.
 */
export function pickCoachVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const en = voices.filter((v) => /^en(-|_|\b)/i.test(v.lang) || /^en$/i.test(v.lang));
  const pool = en.length ? en : voices;

  const scored = pool.map((v) => {
    const name = v.name || "";
    const lang = v.lang || "";
    let score = naturalNameScore(name);
    if (/^en/i.test(lang)) score += 20;
    if (/en-US|en_US/i.test(lang)) score += 8;
    else if (/en-GB|en_GB/i.test(lang)) score += 6;
    else if (/^en/i.test(lang)) score += 3;
    if (ROBOTIC_VOICE_RE.test(name)) score -= 60;
    // Generic "English (United States)" with no person name is the usual robotic default.
    if (
      /english\s*(\(united states\)|united states)/i.test(name) &&
      naturalNameScore(name) < 40
    ) {
      score -= 24;
    }
    const local = (v as SpeechSynthesisVoice & { localService?: boolean }).localService;
    // Only reward local when the name already looks human (Samantha, Daniel, Neural).
    if (local && naturalNameScore(name) >= 70) score += 8;
    return { v, score };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    // Tie: the system default is often the robotic voice.
    if (a.v.default !== b.v.default) return a.v.default ? 1 : -1;
    return (a.v.name || "").localeCompare(b.v.name || "");
  });
  return scored[0]?.v ?? pool[0] ?? null;
}

export function cancelCoachSpeech(): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* optional */
  }
}

export type SpeakOpts = {
  rate?: number;
  pitch?: number;
  /** When false, do not cancel the previous utterance (rare). Default true. */
  cancel?: boolean;
};

/** Speak with drive defaults; always cancels prior utterance unless cancel:false. */
export function speakCoach(
  text: string,
  muted: boolean,
  opts?: SpeakOpts
): void {
  if (muted) return;
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const trimmed = text.trim();
  if (!trimmed) return;
  try {
    // Cancel anything still playing so cues never stack or overlap.
    if (opts?.cancel !== false) cancelCoachSpeech();
    const u = new SpeechSynthesisUtterance(trimmed);
    const rate = humanRate(opts?.rate);
    const pitch = humanPitch(opts?.pitch);
    u.rate = rate;
    u.pitch = pitch;
    u.volume = 1;
    u.lang = "en-US";
    const voice = pickCoachVoice();
    if (voice) {
      u.voice = voice;
      if (voice.lang) u.lang = voice.lang;
    }
    window.speechSynthesis.speak(u);
  } catch {
    /* TTS optional */
  }
}

export function estimateSpeakMs(text: string, rate = COACH_RATE_FORM): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const wpm = 165 * rate;
  return Math.min(45_000, Math.max(2500, Math.round((words / wpm) * 60_000) + 400));
}

/** Speak and resolve after estimated duration (for sequencing form → countdown). */
export function speakCoachAndWait(
  text: string,
  muted: boolean,
  opts?: SpeakOpts
): Promise<void> {
  const rate = humanRate(opts?.rate ?? COACH_RATE_FORM);
  if (muted || typeof window === "undefined" || !window.speechSynthesis) {
    return Promise.resolve();
  }
  speakCoach(text, muted, { ...opts, rate, pitch: humanPitch(opts?.pitch ?? COACH_PITCH_FORM) });
  return new Promise((resolve) => {
    window.setTimeout(resolve, estimateSpeakMs(text, rate));
  });
}

function pick(bank: string[]): string {
  return bank[Math.floor(Math.random() * bank.length)]!;
}

/** Mode-aware session openers — short, like a person talking. */
const SESSION_START: Record<IntensityMode, string[]> = {
  beginning: [
    "Alright, beginning mode. 5 working sets, then burnout. Let's build this clean.",
    "Okay, we're starting easy. 5 sets, then a burnout. Stay smooth.",
    "Beginning mode. 5 working sets plus burnout. You've got this.",
  ],
  moderate: [
    "Alright, moderate. 10 working sets, then burnout. Stay with me.",
    "Moderate mode. 10 sets, then we empty it. Let's work.",
    "Okay, push pace. 10 working sets. Burnout's waiting. Let's go.",
  ],
  expert: [
    "Expert mode. 15 working sets plus burnout. No shortcuts today.",
    "Alright, expert. 15 sets. When burnout hits, leave it all out there.",
    "15 working sets. This is the hard one. Earn it.",
  ],
};

export function pickSessionStart(mode: IntensityMode | string): string {
  const resolved =
    migrateModeId(String(mode)) ??
    (isIntensityMode(String(mode)) ? (mode as IntensityMode) : "moderate");
  const p = MODE_PRESETS[resolved];
  const bank = SESSION_START[resolved];
  const line = pick(bank);
  // Ensure set count is audible even if bank varies
  if (!line.includes(String(p.workingSets))) {
    return `${p.label} mode. ${p.workingSets} working sets plus burnout. ${line.split(". ").slice(-1)[0]}`;
  }
  return line;
}

const GO_LINES = ["Go!", "Let's go!", "Go, now!", "Alright, go!"];

export function pickGoLine(): string {
  return pick(GO_LINES);
}

const MID_SET_PUSH = [
  "Keep pushing.",
  "Stay with it.",
  "You've got this.",
  "Nice pace. Keep it.",
  "Strong. Stay there.",
  "Don't fade on me.",
  "Own this one.",
  "Breathe. Keep driving.",
  "Hold that line.",
  "A little more. Come on.",
];

export function pickMidSetPush(): string {
  return pick(MID_SET_PUSH);
}

const SET_COMPLETE_REST = [
  "Time. Shake it out.",
  "That's the set. Breathe.",
  "Nice. Recover.",
  "Good work. Reset.",
  "Done. Catch your breath.",
];

export function pickSetCompleteRest(): string {
  return pick(SET_COMPLETE_REST);
}

const NEXT_SET = [
  "Next set. You ready?",
  "One more. Push through.",
  "Alright, next one. Stay sharp.",
  "Again. Drive it.",
  "Next set. Lock in.",
];

export function pickNextSet(): string {
  return pick(NEXT_SET);
}

const BURNOUT_START = [
  "Burnout. Empty the tank.",
  "Last one. Go all out.",
  "Burnout time. Leave nothing.",
  "This is it. Dig in.",
];

export function pickBurnoutStart(): string {
  return pick(BURNOUT_START);
}

const BURNOUT_DURING = [
  "Keep going.",
  "Don't quit now.",
  "Dig a little deeper.",
  "Stay with me.",
  "One more breath.",
  "Finish what you started.",
];

export function pickBurnoutDuring(): string {
  return pick(BURNOUT_DURING);
}

const GOAL_MET = [
  "Yes! You crushed it.",
  "That's the session. Goal met.",
  "You hit it. We're done.",
  "Goal locked. Strong finish.",
];

const GOAL_MISSED = [
  "Session's done. We'll get the goal next time.",
  "Good work. The goal's still out there. Come back for it.",
  "That's in the books. Chase the goal next round.",
  "We're done. Close the gap next time.",
];

export function pickWorkoutComplete(metGoal: boolean): string {
  return metGoal ? pick(GOAL_MET) : pick(GOAL_MISSED);
}

/** Brief hands-free acknowledgments — keep short so they don't eat workout time. */
export const CMD_ACK: Record<string, string> = {
  start: "Alright, starting.",
  pause: "Paused.",
  resume: "Back in.",
  reset: "Reset.",
  next: "Next set.",
  done: "Done.",
  skip: "Skipping that one.",
};

export function ackCommand(cmd: string): string {
  return CMD_ACK[cmd] ?? "Got it.";
}

/**
 * Form explain: setup → execution → breathing → mistakes,
 * framed for fat burn / strength / stamina. Spoken like a person, not an announcer.
 */
export function buildFormCoachScript(exercise: Exercise): string {
  const cues = exercise.formCues;
  const setup = cues[0] ?? "Get into a strong start.";
  const execution = cues.slice(1, -1).join(" ");
  const last = cues.length > 1 ? cues[cues.length - 1]! : "";
  const breathHint = /breath/i.test(cues.join(" "))
    ? last
    : "Breathe with the move. Don't hold your breath.";
  const execBody =
    execution.trim() ||
    "Move through the full range, under control. Smooth beats sloppy speed.";

  return (
    `${exercise.name}. Alright, this one burns fat, builds strength, and builds stamina. ` +
    `Set up like this: ${setup} ` +
    `Then: ${execBody} ` +
    `Breathing: ${breathHint} ` +
    `Don't rush the reps, don't let your core go soft, and don't cut the range short. ` +
    `Own every one.`
  );
}
