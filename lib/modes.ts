import type { Exercise, IntensityMode, ModePreset } from "./types";

export type { IntensityMode, ModePreset };

const MODE_KEY = "cardio-burner-intensity-mode";

/** Reference timed duration used to scale mode times for long exercises (e.g. jogging). */
const TIMED_REF_SEC = 45;

/** Migrate legacy mode ids stored in localStorage. */
const LEGACY_MODE_MAP: Record<string, IntensityMode> = {
  beginner: "beginning",
  intermediate: "moderate",
  advanced: "expert",
};

export const MODE_PRESETS: Record<IntensityMode, ModePreset> = {
  beginning: {
    id: "beginning",
    label: "Beginning",
    shortLabel: "Start",
    workingSets: 5,
    timedSec: 35, // mid of ~30–40s
    timedMin: 30,
    timedMax: 40,
    reps: 10, // mid of ~8–12
    repsMin: 8,
    repsMax: 12,
    description: "5 working sets + burnout · ~30–40s holds · 8–12 reps",
  },
  moderate: {
    id: "moderate",
    label: "Moderate",
    shortLabel: "Push",
    workingSets: 10,
    timedSec: 50, // mid of ~45–55s
    timedMin: 45,
    timedMax: 55,
    reps: 14, // mid of ~12–16
    repsMin: 12,
    repsMax: 16,
    description: "10 working sets + burnout · ~45–55s holds · 12–16 reps",
  },
  expert: {
    id: "expert",
    label: "Expert",
    shortLabel: "Master",
    workingSets: 15,
    timedSec: 68, // mid of ~60–75s
    timedMin: 60,
    timedMax: 75,
    reps: 18, // mid of ~15–20
    repsMin: 15,
    repsMax: 20,
    description: "15 working sets + burnout · ~60–75s holds · 15–20 reps",
  },
};

export const MODE_ORDER: IntensityMode[] = [
  "beginning",
  "moderate",
  "expert",
];

export function isIntensityMode(v: string): v is IntensityMode {
  return v === "beginning" || v === "moderate" || v === "expert";
}

export function migrateModeId(raw: string | null): IntensityMode | null {
  if (!raw) return null;
  if (isIntensityMode(raw)) return raw;
  const mapped = LEGACY_MODE_MAP[raw];
  return mapped ?? null;
}

export function getModePreset(mode: IntensityMode): ModePreset {
  return MODE_PRESETS[mode];
}

export function loadModePref(): IntensityMode {
  if (typeof window === "undefined") return "moderate";
  try {
    const raw = localStorage.getItem(MODE_KEY);
    const migrated = migrateModeId(raw);
    if (migrated) {
      // Persist migrated id so next load is clean
      if (raw && raw !== migrated) {
        localStorage.setItem(MODE_KEY, migrated);
      }
      return migrated;
    }
  } catch {
    /* ignore */
  }
  return "moderate";
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

/** Compact label for UI: "Moderate · 10 work + burnout · 50s" */
export function formatModeGoalLine(
  mode: IntensityMode,
  workingSets: number,
  targetSec: number,
  tracking: "timed" | "reps",
  targetReps?: number
): string {
  const name = MODE_PRESETS[mode].label;
  if (tracking === "reps" && typeof targetReps === "number") {
    return `${name} · ${workingSets} work + burnout · ${targetReps} reps`;
  }
  return `${name} · ${workingSets} work + burnout · ${targetSec}s`;
}

/** Brief coach line when starting a workout (mode-aware bank). */
export function modeStartCoachLine(mode: IntensityMode | string): string {
  // Lazy import avoided — pickSessionStart lives in coach.ts which imports modes.
  // Keep a solid fallback here; WorkoutClient prefers pickSessionStart directly.
  const resolved =
    migrateModeId(String(mode)) ??
    (isIntensityMode(String(mode)) ? (mode as IntensityMode) : "moderate");
  const p = MODE_PRESETS[resolved];
  const n = p.workingSets;
  if (resolved === "beginning") {
    return `Alright, beginning mode. ${n} working sets, then burnout. Let's build this clean.`;
  }
  if (resolved === "expert") {
    return `Expert mode. ${n} working sets plus burnout. No shortcuts today.`;
  }
  return `Alright, moderate. ${n} working sets, then burnout. Stay with me.`;
}
