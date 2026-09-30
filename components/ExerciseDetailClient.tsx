"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Exercise } from "@/lib/exercises";
import { buildFormCoachScript } from "@/lib/exercises";
import { getSessionsForExercise } from "@/lib/db";
import { computeGoal } from "@/lib/goals";
import {
  loadModePref,
  saveModePref,
  type IntensityMode,
} from "@/lib/modes";
import { formatMs, formatDate } from "@/lib/format";
import { ModeSelector } from "./ModeSelector";
import { COACH_PITCH_FORM, COACH_RATE_FORM } from "@/lib/coach";
import {
  loadMutePref,
  speakFormScript,
} from "./CoachBot";
import type { WorkoutGoal, WorkoutSession } from "@/lib/types";

export function ExerciseDetailClient({ exercise }: { exercise: Exercise }) {
  const [last, setLast] = useState<WorkoutSession | null>(null);
  const [history, setHistory] = useState<WorkoutSession[]>([]);
  const [goal, setGoal] = useState<WorkoutGoal | null>(null);
  const [mode, setMode] = useState<IntensityMode>("moderate");
  const [hearing, setHearing] = useState(false);
  const [cueIndex, setCueIndex] = useState(0);

  const applyGoal = useCallback(
    (m: IntensityMode, hist: WorkoutSession[]) => {
      setGoal(computeGoal(exercise, hist, m));
    },
    [exercise]
  );

  useEffect(() => {
    setMode(loadModePref());
    let cancelled = false;
    (async () => {
      const hist = await getSessionsForExercise(exercise.slug);
      if (cancelled) return;
      const m = loadModePref();
      setLast(hist[0] ?? null);
      setHistory(hist);
      setMode(m);
      applyGoal(m, hist);
    })().catch(() => {
      const m = loadModePref();
      setMode(m);
      applyGoal(m, []);
    });
    return () => {
      cancelled = true;
    };
  }, [exercise, applyGoal]);

  const onModeChange = (m: IntensityMode) => {
    setMode(m);
    saveModePref(m);
    applyGoal(m, history);
  };

  const hearForm = async () => {
    if (hearing) return;
    setHearing(true);
    const muted = loadMutePref();
    const script = buildFormCoachScript(exercise);
    await speakFormScript(script, muted, {
      rate: COACH_RATE_FORM,
      pitch: COACH_PITCH_FORM,
    });
    setHearing(false);
  };

  const startSrc = exercise.formStartImage || exercise.formImage;
  const execSrc = exercise.formExecImage || exercise.formImage;

  return (
    <div className="page-in mx-auto flex h-full max-w-lg flex-col overflow-hidden px-4 pt-3 pb-[calc(4.75rem+env(safe-area-inset-bottom))]">
      <Link
        href="/"
        className="inline-flex min-h-11 items-center text-sm font-medium text-zinc-400 hover:text-white"
      >
        ← Exercises
      </Link>

      <div className="mt-2 flex items-center gap-3">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800 text-4xl">
          {exercise.emoji}
        </span>
        <div>
          <h1 className="text-2xl font-black text-white">{exercise.name}</h1>
          <p className="text-sm text-zinc-400">{exercise.description}</p>
        </div>
      </div>

      <div className="mt-3 grid min-h-0 flex-1 grid-cols-2 gap-2">
        <figure className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={startSrc}
            alt={`Starting pose for ${exercise.name}`}
            className="mx-auto h-auto h-full max-h-full w-full object-contain object-center"
            width={800}
            height={600}
          />
          <figcaption className="border-t border-zinc-800 px-3 py-2 text-center text-xs font-bold uppercase tracking-wider text-orange-400">
            Starting pose
          </figcaption>
        </figure>
        <figure className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={execSrc}
            alt={`Execution pose for ${exercise.name}`}
            className="mx-auto h-auto h-full max-h-full w-full object-contain object-center"
            width={800}
            height={600}
          />
          <figcaption className="border-t border-zinc-800 px-3 py-2 text-center text-xs font-bold uppercase tracking-wider text-orange-400">
            Execution / mid-rep
          </figcaption>
        </figure>
      </div>

      <button
        type="button"
        onClick={() => void hearForm()}
        disabled={hearing}
        className="mt-4 flex min-h-[48px] w-full items-center justify-center rounded-2xl border border-orange-500/50 bg-orange-500/10 text-sm font-bold text-orange-300 transition active:scale-[0.98] hover:bg-orange-500/20 disabled:opacity-60"
      >
        {hearing ? "Speaking form…" : "Hear proper form"}
      </button>

      <div className="mt-2 flex shrink-0 items-center gap-2">
        <button
          type="button"
          className="min-h-[40px] rounded-xl border border-zinc-700 px-3 text-xs font-bold text-zinc-300"
          onClick={() => setCueIndex((n) => (n === 0 ? exercise.formCues.length - 1 : n - 1))}
        >
          Cue
        </button>
        <p className="min-w-0 flex-1 text-xs leading-snug text-zinc-300">
          {cueIndex + 1}/{exercise.formCues.length} {exercise.formCues[cueIndex]}
        </p>
        <button
          type="button"
          className="min-h-[40px] rounded-xl border border-zinc-700 px-3 text-xs font-bold text-zinc-300"
          onClick={() => setCueIndex((n) => (n + 1) % exercise.formCues.length)}
        >
          Next
        </button>
      </div>

      <ModeSelector
        className="mt-2 shrink-0"
        value={mode}
        onChange={onModeChange}
        variant="segmented"
      />

      <section className="mt-2 shrink-0 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
          Your goal
        </h2>
        <p className="mt-2 text-xl font-bold text-white">
          {goal?.label ?? "Computing…"}
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          {goal?.source === "starter"
            ? "No history yet — mode seeds the starter prescription."
            : "Progressive overload from your recent sessions, floored by mode."}
        </p>
        {goal && (
          <p className="mt-2 text-sm text-zinc-400">
            {goal.workingSets} working sets
            {goal.burnout ? " + burnout" : ""}
            {exercise.tracking === "reps" && goal.targetReps
              ? ` · ~${goal.targetReps} reps/set`
              : ` · ${goal.targetSecPerSet}s/set`}
          </p>
        )}
        {last && (
          <p className="mt-3 text-sm text-zinc-400">
            Last session {formatDate(last.completedAt)} · total working{" "}
            {formatMs(
              last.sets
                .filter((s) => !s.isBurnout && s.completed)
                .reduce((a, s) => a + s.durationMs, 0)
            )}
            {last.metGoal ? " · goal met ✓" : " · goal missed"}
          </p>
        )}
      </section>

      <Link
        href={`/workout/${exercise.slug}`}
        className="mt-2 flex min-h-[48px] shrink-0 w-full items-center justify-center rounded-2xl bg-orange-500 text-lg font-bold text-black shadow-lg shadow-orange-500/25 transition active:scale-[0.98] hover:bg-orange-400"
      >
        Start workout
      </Link>

    </div>
  );
}
