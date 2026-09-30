export type ExerciseSlug =
  | "planks"
  | "burpees"
  | "jogging"
  | "dips"
  | "lunges"
  | "squats"
  | "push-ups"
  | "sit-ups"
  | "skull-crushers"
  | "downward-dog"
  | "warrior"
  | "childs-pose"
  | "cobra"
  | "hip-flexor"
  | "hamstring"
  | "chest-opener"
  | "shoulder-stretch"
  | "quad-stretch"
  | "calf-stretch";

export type TrackingMode = "timed" | "reps";

export type IntensityMode = "beginning" | "moderate" | "expert";

export interface ModePreset {
  id: IntensityMode;
  label: string;
  shortLabel: string;
  workingSets: number;
  timedSec: number;
  timedMin: number;
  timedMax: number;
  reps: number;
  repsMin: number;
  repsMax: number;
  description: string;
}

export interface Exercise {
  slug: ExerciseSlug;
  name: string;
  emoji: string;
  description: string;
  formCues: string[];
  /** Starting / setup pose (whole-body preferred) */
  formStartImage: string;
  /** Execution / mid-rep pose (whole-body preferred) */
  formExecImage: string;
  /** Legacy / card thumbnail — usually same as formExecImage */
  formImage: string;
  /** Default target seconds per working set */
  defaultSetDurationSec: number;
  /** Primary tracking: timed countdown, or also log reps */
  tracking: TrackingMode;
  /** Suggested starter reps when tracking includes reps */
  defaultReps?: number;
}

export interface SetResult {
  setIndex: number;
  isBurnout: boolean;
  durationMs: number;
  targetMs: number;
  reps?: number;
  completed: boolean;
}

export interface WorkoutGoal {
  workingSets: number;
  targetSecPerSet: number;
  /** Target reps per working set (rep-tracked exercises) */
  targetReps?: number;
  burnout: boolean;
  label: string;
  source: "starter" | "progressive";
  mode: IntensityMode;
}

export interface WorkoutSession {
  id: string;
  exerciseSlug: ExerciseSlug;
  exerciseName: string;
  startedAt: string;
  completedAt: string;
  sets: SetResult[];
  goal: WorkoutGoal;
  metGoal: boolean;
  totalDurationMs: number;
  totalReps?: number;
}

export interface ExerciseSummary {
  exerciseSlug: ExerciseSlug;
  lastSession: WorkoutSession | null;
  sessionCount: number;
  bestSetMs: number;
  avgSetMs: number;
  bestReps: number;
}

export type PlanId = "monthly" | "sixmo" | "yearly" | "lifetime";

export interface Plan {
  id: PlanId;
  name: string;
  priceLabel: string;
  priceCents: number;
  interval: string;
  description: string;
  highlight?: boolean;
}
