import type { Exercise, WorkoutGoal, WorkoutSession } from "./types";

const STARTER_SETS = 3;
const DEFAULT_WORKING_SETS = 4;
const MAX_WORKING_SETS = 6;
const MAX_SET_SEC = 180;
const MIN_SET_SEC = 20;

function avgWorkingSetMs(session: WorkoutSession): number {
  const working = session.sets.filter((s) => !s.isBurnout && s.completed);
  if (!working.length) return 0;
  return working.reduce((sum, s) => sum + s.durationMs, 0) / working.length;
}

function bestWorkingSetMs(sessions: WorkoutSession[]): number {
  let best = 0;
  for (const session of sessions) {
    for (const set of session.sets) {
      if (!set.isBurnout && set.completed) {
        best = Math.max(best, set.durationMs);
      }
    }
  }
  return best;
}

function recentWorkingSetCount(sessions: WorkoutSession[]): number {
  if (!sessions.length) return STARTER_SETS;
  const last = sessions[0];
  return last.sets.filter((s) => !s.isBurnout && s.completed).length || STARTER_SETS;
}

/**
 * Personalized goal from history.
 * - No history: starter (3 × 30–45s based on exercise default)
 * - With history: progressive overload (~+5–10% time or +1 set from recent best/avg, capped)
 */
export function computeGoal(
  exercise: Exercise,
  history: WorkoutSession[]
): WorkoutGoal {
  if (!history.length) {
    const starterSec = Math.min(
      MAX_SET_SEC,
      Math.max(MIN_SET_SEC, Math.round(exercise.defaultSetDurationSec * 0.85))
    );
    return {
      workingSets: STARTER_SETS,
      targetSecPerSet: starterSec,
      burnout: true,
      label: `Starter: ${STARTER_SETS}×${starterSec}s + burnout`,
      source: "starter",
    };
  }

  const recent = history.slice(0, 5);
  const bestMs = bestWorkingSetMs(recent);
  const lastAvg = avgWorkingSetMs(history[0]);
  const baselineMs = Math.max(bestMs, lastAvg, exercise.defaultSetDurationSec * 1000);

  // +5–10% progressive overload on time
  const bump = 1 + (0.05 + Math.random() * 0.05);
  let targetSec = Math.round((baselineMs * bump) / 1000);
  targetSec = Math.min(MAX_SET_SEC, Math.max(MIN_SET_SEC, targetSec));

  let workingSets = recentWorkingSetCount(history);
  // Occasionally add a set if already hitting solid times
  if (workingSets < MAX_WORKING_SETS && lastAvg >= baselineMs * 0.9) {
    workingSets = Math.min(MAX_WORKING_SETS, workingSets + 1);
  } else {
    workingSets = Math.min(
      MAX_WORKING_SETS,
      Math.max(DEFAULT_WORKING_SETS, workingSets)
    );
  }

  return {
    workingSets,
    targetSecPerSet: targetSec,
    burnout: true,
    label: `Goal: ${workingSets}×${targetSec}s + burnout`,
    source: "progressive",
  };
}

export function evaluateGoal(
  goal: WorkoutGoal,
  sets: { isBurnout: boolean; durationMs: number; completed: boolean }[]
): boolean {
  const working = sets.filter((s) => !s.isBurnout && s.completed);
  if (working.length < goal.workingSets) return false;
  const targetMs = goal.targetSecPerSet * 1000;
  // Met if at least workingSets completed at >= 90% of target time
  const hits = working.filter((s) => s.durationMs >= targetMs * 0.9).length;
  return hits >= goal.workingSets;
}
