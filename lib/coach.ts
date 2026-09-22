/**
 * Drive-coach TTS voice + cue banks for Cardio Burner workouts.
 * One-way motivational calls — no medical claims.
 */

import type { Exercise } from "./types";
import type { IntensityMode } from "./modes";
import { MODE_PRESETS, isIntensityMode, migrateModeId } from "./modes";

/** Slightly lower pitch, firm rate — deeper drive voice. */
export const COACH_PITCH = 0.85;
export const COACH_RATE = 1.0;
export const COACH_RATE_COUNT = 1.02;
export const COACH_RATE_FORM = 0.95;
export const COACH_PITCH_FORM = 0.82;

/** Minimum gap between mid-set push cues (ms). */
export const MID_SET_CUE_GAP_MS = 38_000;

/** Only speak countdown ticks for the final N seconds. */
export const COUNTDOWN_SPEAK_LAST = 3;

const DEEP_VOICE_RE =
  /david|daniel|alex|fred|mark|george|thomas|james|arthur|ravi|guy|ryan|noah|male|man|deep|bass|baritone|google uk english male|microsoft david|microsoft mark|microsoft guy|english united kingdom|english \(united kingdom\)|en-gb.*male/i;

const FEMALE_AVOID_RE =
  /samantha|karen|moira|tessa|victoria|zira|susan|linda|heather|female|woman|google us english|google uk english female|microsoft zira|microsoft susan/i;

export function pickCoachVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const en = voices.filter((v) => /en(-|_|$)/i.test(v.lang));
  const pool = en.length ? en : voices;

  const scored = pool.map((v) => {
    let score = 0;
    const name = v.name || "";
    const lang = v.lang || "";
    if (DEEP_VOICE_RE.test(name)) score += 40;
    if (FEMALE_AVOID_RE.test(name)) score -= 25;
    if (/en-GB|en_GB/i.test(lang)) score += 12;
    if (/en-US|en_US/i.test(lang)) score += 8;
    if (/en-AU|en_AU|en-IN|en_IN/i.test(lang)) score += 4;
    // Local voices often sound fuller / less robotic
    if ((v as SpeechSynthesisVoice & { localService?: boolean }).localService) {
      score += 6;
    }
    // Prefer names that sound like adult male coaches when gender unknown
    if (/\b(David|Daniel|Alex|Fred|Mark|George|James|Arthur|Thomas|Ryan|Noah)\b/i.test(name)) {
      score += 20;
    }
    return { v, score };
  });

  scored.sort((a, b) => b.score - a.score);
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
    if (opts?.cancel !== false) cancelCoachSpeech();
    const u = new SpeechSynthesisUtterance(trimmed);
    u.rate = opts?.rate ?? COACH_RATE;
    u.pitch = opts?.pitch ?? COACH_PITCH;
    u.volume = 1;
    const voice = pickCoachVoice();
    if (voice) u.voice = voice;
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
  const rate = opts?.rate ?? COACH_RATE_FORM;
  if (muted || typeof window === "undefined" || !window.speechSynthesis) {
    return Promise.resolve();
  }
  speakCoach(text, muted, { ...opts, rate });
  return new Promise((resolve) => {
    window.setTimeout(resolve, estimateSpeakMs(text, rate));
  });
}

function pick(bank: string[]): string {
  return bank[Math.floor(Math.random() * bank.length)]!;
}

/** Mode-aware session openers — firm, not corny. */
const SESSION_START: Record<IntensityMode, string[]> = {
  beginning: [
    "Beginning mode. Five working sets, then burnout. Build clean and finish strong.",
    "Beginning mode locked. Steady pace, solid form, empty the tank on burnout.",
    "Starting Beginning. Five sets plus burnout. Own the work.",
  ],
  moderate: [
    "Moderate mode. Ten working sets plus burnout. Stay locked in.",
    "Moderate locked. Ten sets, then burnout. Drive every interval.",
    "Push mode. Ten working sets. Burnout waits. Let's work.",
  ],
  expert: [
    "Expert mode. Fifteen working sets plus burnout. No shortcuts.",
    "Expert locked. Fifteen sets. Empty the tank when burnout hits.",
    "Master pace. Fifteen working sets. Earn the finish.",
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

const GO_LINES = ["GO!", "GO — now!", "Drive — GO!", "GO. Move!"];

export function pickGoLine(): string {
  return pick(GO_LINES);
}

const MID_SET_PUSH = [
  "Drive.",
  "Stay locked in.",
  "Push through.",
  "Keep the pace.",
  "Strong.",
  "Don't fade.",
  "Own this set.",
  "Breathe and drive.",
  "Hold the line.",
  "Empty a little more.",
];

export function pickMidSetPush(): string {
  return pick(MID_SET_PUSH);
}

const SET_COMPLETE_REST = [
  "Time. Rest.",
  "Set done. Breathe.",
  "That's a set. Recover.",
  "Good. Reset for the next.",
  "Done. Shake it out.",
];

export function pickSetCompleteRest(): string {
  return pick(SET_COMPLETE_REST);
}

const NEXT_SET = [
  "Next set. Ready.",
  "One more. Push through.",
  "Next. Stay sharp.",
  "Again. Drive it.",
  "Next set — lock in.",
];

export function pickNextSet(): string {
  return pick(NEXT_SET);
}

const BURNOUT_START = [
  "Burnout. Empty the tank.",
  "Final burnout. Go to max.",
  "Burnout — leave nothing.",
  "Last stand. Burnout. Dig in.",
];

export function pickBurnoutStart(): string {
  return pick(BURNOUT_START);
}

const BURNOUT_DURING = [
  "Keep going.",
  "Don't quit.",
  "Dig deeper.",
  "Hold on.",
  "One more breath.",
  "Finish what you started.",
];

export function pickBurnoutDuring(): string {
  return pick(BURNOUT_DURING);
}

const GOAL_MET = [
  "Goal crushed.",
  "Session complete. Goal met.",
  "You hit the mark. Done.",
  "Goal locked. Strong finish.",
];

const GOAL_MISSED = [
  "Session complete. Next time you take it.",
  "Work done. Goal still out there — come back.",
  "Session in the books. Chase the goal next round.",
  "Complete. Close the gap next session.",
];

export function pickWorkoutComplete(metGoal: boolean): string {
  return metGoal ? pick(GOAL_MET) : pick(GOAL_MISSED);
}

/** Brief hands-free acknowledgments — keep short so they don't eat workout time. */
export const CMD_ACK: Record<string, string> = {
  start: "Starting.",
  pause: "Paused.",
  resume: "Resuming.",
  reset: "Reset.",
  next: "Next set.",
  done: "Done.",
  skip: "Skip.",
};

export function ackCommand(cmd: string): string {
  return CMD_ACK[cmd] ?? "Got it.";
}

/**
 * Form explain: setup → execution → breathing → mistakes,
 * framed for fat burn / strength / stamina.
 */
export function buildFormCoachScript(exercise: Exercise): string {
  const cues = exercise.formCues;
  const setup = cues[0] ?? "Get into a strong starting position.";
  const execution = cues.slice(1, -1).join(" ");
  const last = cues.length > 1 ? cues[cues.length - 1]! : "";
  const breathHint = /breath/i.test(cues.join(" "))
    ? last
    : "Breathe with the movement — never hold your breath.";
  const execBody =
    execution.trim() ||
    "Move with control through the full range. Quality over frantic speed.";

  return (
    `${exercise.name}. This move drives fat burn, builds strength, and builds stamina. ` +
    `Setup: ${setup} ` +
    `Execution: ${execBody} ` +
    `Breathing: ${breathHint} ` +
    `Mistakes to avoid: rushing reps, losing a tight midline, and cutting range short. ` +
    `Own every rep.`
  );
}
