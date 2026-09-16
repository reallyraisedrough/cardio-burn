"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { EXERCISES } from "@/lib/exercises";
import { getAllSessions } from "@/lib/db";
import { computeGoal } from "@/lib/goals";
import {
  loadModePref,
  saveModePref,
  MODE_PRESETS,
  type IntensityMode,
} from "@/lib/modes";
import {
  foodHomeBlurb,
  getFoodHints,
  scheduleHomeBlurb,
} from "@/lib/schedule";
import { ExerciseCard } from "./ExerciseCard";
import { Disclaimer } from "./Disclaimer";
import { ModeSelector } from "./ModeSelector";
import type { WorkoutSession } from "@/lib/types";

export function HomeClient() {
  const [lastBySlug, setLastBySlug] = useState<
    Record<string, WorkoutSession | null>
  >({});
  const [goals, setGoals] = useState<Record<string, string>>({});
  const [historyBySlug, setHistoryBySlug] = useState<
    Record<string, WorkoutSession[]>
  >({});
  const [mode, setMode] = useState<IntensityMode>("moderate");

  const recomputeGoals = useCallback(
    (m: IntensityMode, histMap: Record<string, WorkoutSession[]>) => {
      const goalMap: Record<string, string> = {};
      for (const ex of EXERCISES) {
        goalMap[ex.slug] = computeGoal(ex, histMap[ex.slug] ?? [], m).label;
      }
      setGoals(goalMap);
    },
    []
  );

  useEffect(() => {
    setMode(loadModePref());
    let cancelled = false;
    (async () => {
      const all = await getAllSessions();
      if (cancelled) return;
      const lasts: Record<string, WorkoutSession | null> = {};
      const histMap: Record<string, WorkoutSession[]> = {};
      const m = loadModePref();
      for (const ex of EXERCISES) {
        const hist = all.filter((s) => s.exerciseSlug === ex.slug);
        histMap[ex.slug] = hist;
        lasts[ex.slug] = hist[0] ?? null;
      }
      setLastBySlug(lasts);
      setHistoryBySlug(histMap);
      setMode(m);
      recomputeGoals(m, histMap);
    })().catch(() => {
      /* empty history ok */
    });
    return () => {
      cancelled = true;
    };
  }, [recomputeGoals]);

  const onModeChange = (m: IntensityMode) => {
    setMode(m);
    saveModePref(m);
    recomputeGoals(m, historyBySlug);
  };

  const food = getFoodHints(mode);
  const preset = MODE_PRESETS[mode];

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

      <ModeSelector
        className="mb-4"
        value={mode}
        onChange={onModeChange}
        variant="cards"
      />

      <section className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-orange-400">
              Plan snapshot · {preset.label}
            </p>
            <p className="mt-1 text-sm text-zinc-300">
              {scheduleHomeBlurb(mode)}
            </p>
            <p className="mt-2 text-xs text-zinc-500">{foodHomeBlurb(mode)}</p>
            <ul className="mt-2 space-y-1">
              {food.tips.slice(0, 2).map((t) => (
                <li key={t} className="text-xs text-zinc-400">
                  · {t}
                </li>
              ))}
            </ul>
          </div>
          <Link
            href="/plan"
            className="shrink-0 rounded-xl border border-orange-500/40 bg-orange-500/10 px-3 py-2 text-xs font-bold text-orange-400 hover:bg-orange-500/20"
          >
            Full plan
          </Link>
        </div>
      </section>

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
