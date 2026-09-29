import { EXERCISES, getExercise } from "./exercises";
import {
  formatModeGoalLine,
  resolveReps,
  resolveTimedSec,
  resolveWorkingSets,
} from "./modes";
import { getSchedulePlan } from "./schedule";
import type { Exercise, ExerciseSlug, IntensityMode, WorkoutGoal } from "./types";

export interface PrescribedMove {
  slug: ExerciseSlug;
  name: string;
  emoji: string;
  workingSets: number;
  seconds: number;
  reps?: number;
  tracking: Exercise["tracking"];
  burnout: true;
  /** "5 sets · 10 reps · burnout last" */
  line: string;
}

export interface TodayPrescription {
  mode: IntensityMode;
  title: string;
  moves: PrescribedMove[];
}

function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / 86400000);
}

function toMove(exercise: Exercise, mode: IntensityMode): PrescribedMove {
  const workingSets = resolveWorkingSets(mode);
  const seconds = resolveTimedSec(exercise, mode);
  const reps =
    exercise.tracking === "reps" ? resolveReps(exercise, mode) : undefined;
  const dose =
    exercise.tracking === "reps" && typeof reps === "number"
      ? `${reps} reps`
      : `${seconds}s`;
  return {
    slug: exercise.slug,
    name: exercise.name,
    emoji: exercise.emoji,
    workingSets,
    seconds,
    reps,
    tracking: exercise.tracking,
    burnout: true,
    line: `${workingSets} sets · ${dose} · burnout last`,
  };
}

/**
 * Today's session is chosen by the app from the selected mode.
 * Beginning: 3 moves. Moderate: 5. Expert: half the library by day parity.
 * Doses use mode floors in lib/modes.ts (via schedule combos for which moves).
 */
export function prescribeToday(
  mode: IntensityMode,
  date = new Date()
): TodayPrescription {
  const plan = getSchedulePlan(mode);

  if (mode === "expert") {
    const days = plan.splitDays ?? [];
    const odd = date.getDate() % 2 === 1;
    const day = days[odd ? 1 : 0] ?? days[0];
    const exercises = day?.exercises ?? EXERCISES.slice(0, Math.ceil(EXERCISES.length / 2));
    return {
      mode,
      title: day?.dayLabel ?? "Expert half",
      moves: exercises.map((ex) => toMove(ex, mode)),
    };
  }

  const combos = plan.sampleCombos;
  const combo = combos[dayOfYear(date) % Math.max(1, combos.length)];
  const exercises = combo?.exercises ?? [];
  return {
    mode,
    title: combo?.label ?? plan.exercisesPerSession,
    moves: exercises.map((ex) => toMove(ex, mode)),
  };
}

export function goalFromPrescription(
  move: PrescribedMove,
  mode: IntensityMode
): WorkoutGoal {
  const exercise = getExercise(move.slug);
  const tracking = exercise?.tracking ?? move.tracking;
  return {
    workingSets: move.workingSets,
    targetSecPerSet: move.seconds,
    targetReps: move.reps,
    burnout: true,
    label: formatModeGoalLine(
      mode,
      move.workingSets,
      move.seconds,
      tracking,
      move.reps
    ),
    source: "starter",
    mode,
  };
}
