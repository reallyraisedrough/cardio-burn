import type { Exercise, IntensityMode, ModePreset } from "./types";

export type { IntensityMode, ModePreset };

const MODE_KEY = "cardio-burner-intensity-mode";

/** Reference timed duration used to scale mode times for long exercises (e.g. jogging). */
const TIMED_REF_SEC = 45;

export const MODE_PRESETS: Record<IntensityMode, ModePreset> = {
  beginner: {
    id: "beginner",
    label: "Beginner",
    shortLabel: "Easy",
    workingSets: 3,
    timedSec: 30, // mid of ~25–35s
    timedMin: 25,
    timedMax: 35,
    reps: 9, // mid of ~8–10
    repsMin: 8,
    repsMax: 10,
    description: "3 sets · shorter holds · easier volume",
  },
  intermediate: {
    id: "intermediate",
    label: "Intermediate",
    shortLabel: "Hard",
    workingSets: 4,
    timedSec: 45, // mid of ~40–50s
    timedMin: 40,
    timedMax: 50,
    reps: 13, // mid of ~12–15
    repsMin: 12,
    repsMax: 15,
    description: "4 sets · solid targets · steady push",
  },
  advanced: {
    id: "advanced",
    label: "Advanced",
    shortLabel: "Beast",
    workingSets: 5,
    timedSec: 65, // mid of ~55–75s
    timedMin: 55,
    timedMax: 75,
    reps: 17, // mid of ~15–20
    repsMin: 15,
    repsMax: 20,
    description: "5 sets · max push · empty the tank",
  },
};

export const MODE_ORDER: IntensityMode[] = [
  "beginner",
  "intermediate",
  "advanced",
];

export function isIntensityMode(v: string): v is IntensityMode {
  return v === "beginner" || v === "intermediate" || v === "advanced";
}

export function getModePreset(mode: IntensityMode): ModePreset {
  return MODE_PRESETS[mode];
}

export function loadModePref(): IntensityMode {
  if (typeof window === "undefined") return "intermediate";
  try {
    const raw = localStorage.getItem(MODE_KEY);
    if (raw && isIntensityMode(raw)) return raw;
  } catch {
    /* ignore */
  }
  return "intermediate";
}

export function saveModePref(mode: IntensityMode) {
  try {
    localStorage.setItem(MODE_KEY, mode);
  } catch {
    /* ignore */
  }
}

/**
 * Resolve timed set duration for an exercise under a mode.
 * Scales up for long-default exercises (jogging) so mode feel stays proportional.
 */
export function resolveTimedSec(exercise: Exercise, mode: IntensityMode): number {
  const preset = MODE_PRESETS[mode];
  const scale =
    exercise.defaultSetDurationSec > TIMED_REF_SEC * 1.25
      ? exercise.defaultSetDurationSec / TIMED_REF_SEC
      : 1;
  return Math.round(preset.timedSec * scale);
}

/** Min timed floor (scaled) for progressive clamping. */
export function resolveTimedFloor(exercise: Exercise, mode: IntensityMode): number {
  const preset = MODE_PRESETS[mode];
  const scale =
    exercise.defaultSetDurationSec > TIMED_REF_SEC * 1.25
      ? exercise.defaultSetDurationSec / TIMED_REF_SEC
      : 1;
  return Math.round(preset.timedMin * scale);
}

export function resolveReps(exercise: Exercise, mode: IntensityMode): number {
  const preset = MODE_PRESETS[mode];
  // Prefer mode reps; nudge toward exercise default if close
  if (exercise.defaultReps) {
    return Math.max(preset.repsMin, Math.min(preset.repsMax, preset.reps));
  }
  return preset.reps;
}

export function resolveWorkingSets(mode: IntensityMode): number {
  return MODE_PRESETS[mode].workingSets;
}

/** Compact label for UI: "Intermediate · 4 sets · 40s" or "… · 12 reps" */
export function formatModeGoalLine(
  mode: IntensityMode,
  workingSets: number,
  targetSec: number,
  tracking: "timed" | "reps",
  targetReps?: number
): string {
  const name = MODE_PRESETS[mode].label;
  if (tracking === "reps" && typeof targetReps === "number") {
    return `${name} · ${workingSets} sets · ${targetReps} reps`;
  }
  return `${name} · ${workingSets} sets · ${targetSec}s`;
}

/** Brief coach line when starting a workout. */
export function modeStartCoachLine(mode: IntensityMode): string {
  const p = MODE_PRESETS[mode];
  const setWord = p.workingSets === 1 ? "set" : "sets";
  if (mode === "beginner") {
    return `${p.label} mode. ${p.workingSets} ${setWord}. Steady and strong.`;
  }
  if (mode === "advanced") {
    return `${p.label} mode. ${p.workingSets} ${setWord}. Let's work.`;
  }
  return `${p.label} mode. ${p.workingSets} ${setWord}. Let's go.`;
}
