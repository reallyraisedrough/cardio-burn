import type { ExerciseSlug, ExerciseSummary, WorkoutSession } from "./types";
import { EXERCISES } from "./exercises";

export function summarizeExercise(
  slug: ExerciseSlug,
  sessions: WorkoutSession[]
): ExerciseSummary {
  const forEx = sessions.filter((s) => s.exerciseSlug === slug);
  let bestSetMs = 0;
  let bestReps = 0;
  let sumMs = 0;
  let countSets = 0;

  for (const session of forEx) {
    for (const set of session.sets) {
      if (!set.completed) continue;
      bestSetMs = Math.max(bestSetMs, set.durationMs);
      if (typeof set.reps === "number") bestReps = Math.max(bestReps, set.reps);
      if (!set.isBurnout) {
        sumMs += set.durationMs;
        countSets += 1;
      }
    }
  }

  return {
    exerciseSlug: slug,
    lastSession: forEx[0] ?? null,
    sessionCount: forEx.length,
    bestSetMs,
    avgSetMs: countSets ? sumMs / countSets : 0,
    bestReps,
  };
}

export function summarizeAll(sessions: WorkoutSession[]): ExerciseSummary[] {
  return EXERCISES.map((e) => summarizeExercise(e.slug, sessions));
}
