"use client";

import { useEffect, useState } from "react";
import { EXERCISES } from "@/lib/exercises";
import { getAllSessions } from "@/lib/db";
import { computeGoal } from "@/lib/goals";
import { ExerciseCard } from "./ExerciseCard";
import { Disclaimer } from "./Disclaimer";
import type { WorkoutSession } from "@/lib/types";

export function HomeClient() {
  const [lastBySlug, setLastBySlug] = useState<
    Record<string, WorkoutSession | null>
  >({});
  const [goals, setGoals] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const all = await getAllSessions();
      if (cancelled) return;
      const lasts: Record<string, WorkoutSession | null> = {};
      const goalMap: Record<string, string> = {};
      for (const ex of EXERCISES) {
        const hist = all.filter((s) => s.exerciseSlug === ex.slug);
        lasts[ex.slug] = hist[0] ?? null;
        goalMap[ex.slug] = computeGoal(ex, hist).label;
      }
      setLastBySlug(lasts);
      setGoals(goalMap);
    })().catch(() => {
      /* empty history ok */
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-lg px-4 pb-28 pt-6">
      <header className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-orange-400">
          Cardio Burner
        </p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-white">
          Pick your burn
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Mobile-first workouts with progressive goals and a final burnout set.
        </p>
      </header>

      <ul className="flex flex-col gap-3">
        {EXERCISES.map((ex) => (
          <li key={ex.slug}>
            <ExerciseCard
              exercise={ex}
              last={lastBySlug[ex.slug] ?? null}
              goalLabel={goals[ex.slug]}
            />
          </li>
        ))}
      </ul>

      <Disclaimer className="mt-8" />
      <div className="mt-4 flex gap-4 text-xs text-zinc-600">
        <a href="/privacy" className="hover:text-zinc-400">
          Privacy
        </a>
        <a href="/terms" className="hover:text-zinc-400">
          Terms
        </a>
      </div>
    </div>
  );
}
