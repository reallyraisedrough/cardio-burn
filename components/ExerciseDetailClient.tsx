"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Exercise } from "@/lib/exercises";
import { getSessionsForExercise } from "@/lib/db";
import { computeGoal } from "@/lib/goals";
import { formatMs, formatDate } from "@/lib/format";
import { Disclaimer } from "./Disclaimer";
import type { WorkoutGoal, WorkoutSession } from "@/lib/types";

export function ExerciseDetailClient({ exercise }: { exercise: Exercise }) {
  const [last, setLast] = useState<WorkoutSession | null>(null);
  const [goal, setGoal] = useState<WorkoutGoal | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const hist = await getSessionsForExercise(exercise.slug);
      if (cancelled) return;
      setLast(hist[0] ?? null);
      setGoal(computeGoal(exercise, hist));
    })().catch(() => setGoal(computeGoal(exercise, [])));
    return () => {
      cancelled = true;
    };
  }, [exercise]);

  return (
    <div className="mx-auto max-w-lg px-4 pb-28 pt-6">
      <Link
        href="/"
        className="inline-flex min-h-11 items-center text-sm font-medium text-zinc-400 hover:text-white"
      >
        ← Exercises
      </Link>

      <div className="mt-4 flex items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800 text-4xl">
          {exercise.emoji}
        </span>
        <div>
          <h1 className="text-3xl font-black text-white">{exercise.name}</h1>
          <p className="text-sm text-zinc-400">{exercise.description}</p>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="text-sm font-bold uppercase tracking-wider text-orange-400">
          Form cues
        </h2>
        <ol className="mt-3 space-y-3">
          {exercise.formCues.map((cue, i) => (
            <li
              key={i}
              className="flex gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-500/20 text-sm font-bold text-orange-400">
                {i + 1}
              </span>
              <p className="text-base leading-snug text-zinc-200">{cue}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
          Your goal
        </h2>
        <p className="mt-2 text-xl font-bold text-white">
          {goal?.label ?? "Computing…"}
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          {goal?.source === "starter"
            ? "No history yet — starter prescription."
            : "Progressive overload from your recent sessions."}
        </p>
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
        className="mt-8 flex min-h-[56px] w-full items-center justify-center rounded-2xl bg-orange-500 text-lg font-bold text-black shadow-lg shadow-orange-500/25 transition active:scale-[0.98] hover:bg-orange-400"
      >
        Start workout
      </Link>

      <Disclaimer className="mt-6" />
    </div>
  );
}
