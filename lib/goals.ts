import type {
  Exercise,
  IntensityMode,
  WorkoutGoal,
  WorkoutSession,
} from "./types";
import {
  formatModeGoalLine,
  getModePreset,
  resolveReps,
  resolveTimedFloor,
  resolveTimedSec,
  resolveWorkingSets,
} from "./modes";

const MAX_WORKING_SETS = 20;
const MAX_SET_SEC = 240;
const MIN_SET_SEC = 15;

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
  if (!sessions.length) return 0;
  const last = sessions[0];
  return last.sets.filter((s) => !s.isBurnout && s.completed).length;
}

function avgWorkingReps(session: WorkoutSession): number {
  const working = session.sets.filter(
    (s) => !s.isBurnout && s.completed && typeof s.reps === "number"
  );
  if (!working.length) return 0;
  return (
    working.reduce((sum, s) => sum + (s.reps ?? 0), 0) / working.length
  );
}

/**
 * Personalized goal from history, seeded/clamped by intensity mode.
 * Mode = baseline floor; history can progress at or above that floor.
 */
export function computeGoal(
  exercise: Exercise,
  history: WorkoutSession[],
  mode: IntensityMode = "moderate"
): WorkoutGoal {
  const preset = getModePreset(mode);
  const modeSets = resolveWorkingSets(mode);
  const modeTimed = resolveTimedSec(exercise, mode);
  const modeTimedFloor = resolveTimedFloor(exercise, mode);
  const modeReps = resolveReps(exercise, mode);

  if (!history.length) {
    const targetSec = Math.min(
      MAX_SET_SEC,
      Math.max(MIN_SET_SEC, modeTimed)
    );
    const targetReps =
      exercise.tracking === "reps" ? modeReps : undefined;
    return {
      workingSets: modeSets,
      targetSecPerSet: targetSec,
      targetReps,
      burnout: true,
      label: formatModeGoalLine(
        mode,
        modeSets,
        targetSec,
        exercise.tracking,
        targetReps
      ),
      source: "starter",
      mode,
    };
  }

  const recent = history.slice(0, 5);
  const bestMs = bestWorkingSetMs(recent);
  const lastAvg = avgWorkingSetMs(history[0]);
  // Floor baseline at mode timed (mode seeds intensity)
  const modeFloorMs = modeTimedFloor * 1000;
  const baselineMs = Math.max(
    bestMs,
    lastAvg,
    modeFloorMs,
    modeTimed * 1000 * 0.9
  );

  // +5–10% progressive overload on time
  const bump = 1 + (0.05 + Math.random() * 0.05);
  let targetSec = Math.round((baselineMs * bump) / 1000);
  targetSec = Math.min(
    MAX_SET_SEC,
    Math.max(MIN_SET_SEC, Math.max(modeTimedFloor, targetSec))
  );

  let workingSets = recentWorkingSetCount(history);
  // Mode sets are the floor; history can add more
  workingSets = Math.max(modeSets, workingSets || modeSets);
  if (workingSets < MAX_WORKING_SETS && lastAvg >= baselineMs * 0.9) {
    workingSets = Math.min(MAX_WORKING_SETS, workingSets + 1);
  }
  workingSets = Math.min(MAX_WORKING_SETS, Math.max(modeSets, workingSets));

  let targetReps: number | undefined;
  if (exercise.tracking === "reps") {
    const lastReps = avgWorkingReps(history[0]);
    const floor = preset.repsMin;
    if (lastReps > 0) {
      const bumped = Math.round(lastReps * (1 + 0.05 + Math.random() * 0.05));
      targetReps = Math.max(floor, Math.max(modeReps, bumped));
    } else {
      targetReps = modeReps;
    }
    targetReps = Math.min(preset.repsMax + 10, targetReps);
  }

  return {
    workingSets,
    targetSecPerSet: targetSec,
    targetReps,
    burnout: true,
    label: formatModeGoalLine(
      mode,
      workingSets,
      targetSec,
      exercise.tracking,
      targetReps
    ),
    source: "progressive",
    mode,
  };
}

export function evaluateGoal(
  goal: WorkoutGoal,
  sets: { isBurnout: boolean; durationMs: number; completed: boolean; reps?: number }[]
): boolean {
  const working = sets.filter((s) => !s.isBurnout && s.completed);
  if (working.length < goal.workingSets) return false;
  const targetMs = goal.targetSecPerSet * 1000;
  // Met if at least workingSets completed at >= 90% of target time
  const hits = working.filter((s) => s.durationMs >= targetMs * 0.9).length;
  if (hits < goal.workingSets) return false;
  if (typeof goal.targetReps === "number" && goal.targetReps > 0) {
    const repHits = working.filter(
      (s) => (s.reps ?? 0) >= goal.targetReps! * 0.9
    ).length;
    return repHits >= goal.workingSets;
  }
  return true;
}
