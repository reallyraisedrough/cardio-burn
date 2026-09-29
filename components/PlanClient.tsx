"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  loadModePref,
  saveModePref,
  MODE_PRESETS,
  type IntensityMode,
} from "@/lib/modes";
import { getFoodHints, getSchedulePlan } from "@/lib/schedule";
import { ModeSelector } from "./ModeSelector";
import { DailyInspirationSettings } from "./DailyInspirationSettings";

const STEPS = ["Schedule", "Moves", "Fuel", "Reminders"] as const;

export function PlanClient() {
  const [mode, setMode] = useState<IntensityMode>("moderate");
  const [step, setStep] = useState(0);
  const [moveIndex, setMoveIndex] = useState(0);

  useEffect(() => {
    setMode(loadModePref());
  }, []);

  const onModeChange = (m: IntensityMode) => {
    setMode(m);
    saveModePref(m);
  };

  const plan = getSchedulePlan(mode);
  const food = getFoodHints(mode);
  const preset = MODE_PRESETS[mode];
  const moves =
    plan.sampleCombos.length > 0
      ? plan.sampleCombos.map((c) => ({ label: c.label, exercises: c.exercises }))
      : (plan.splitDays ?? []).map((d) => ({
          label: d.dayLabel,
          exercises: d.exercises,
        }));
  const shown = moves[moveIndex];

  return (
    <div className="page-in mx-auto flex h-full max-w-lg flex-col overflow-hidden px-4 pt-4 pb-[calc(4.75rem+env(safe-area-inset-bottom))]">
      <header className="shrink-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-orange-400">
          {STEPS[step]} · {step + 1}/{STEPS.length}
        </p>
        <h1 className="mt-1 text-2xl font-black text-white">Your plan</h1>
      </header>

      <div className="mt-3 min-h-0 flex-1 overflow-hidden">
        {step === 0 && (
          <div>
            <ModeSelector value={mode} onChange={onModeChange} variant="segmented" />
            <section className="mt-3 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-orange-400">
                {plan.title}
              </h2>
              <p className="mt-2 text-sm text-zinc-200">{plan.frequency}</p>
              <p className="mt-1 text-sm text-zinc-300">{plan.exercisesPerSession}</p>
              <p className="mt-1 text-sm text-zinc-400">
                {preset.workingSets} working sets + burnout each
              </p>
              <p className="mt-3 text-sm text-zinc-400">{plan.summary}</p>
            </section>
          </div>
        )}
        {step === 1 && shown && (
          <section className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">
            <p className="text-xs text-zinc-500">
              {moveIndex + 1} / {moves.length}
            </p>
            <p className="mt-1 font-bold text-white">{shown.label}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {shown.exercises.map((ex) => (
                <li key={ex.slug}>
                  <Link
                    href={`/exercise/${ex.slug}`}
                    className="inline-flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-xs font-semibold text-zinc-200"
                  >
                    <span aria-hidden>{ex.emoji}</span>
                    {ex.name}
                  </Link>
                </li>
              ))}
            </ul>
            {moves.length > 1 && (
              <button
                type="button"
                className="mt-4 min-h-[44px] w-full rounded-xl border border-zinc-700 text-sm font-bold text-zinc-200"
                onClick={() => setMoveIndex((n) => (n + 1) % moves.length)}
              >
                Next rotation
              </button>
            )}
          </section>
        )}
        {step === 2 && (
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-orange-400">
              {food.title}
            </h2>
            <p className="mt-2 text-sm text-zinc-300">{food.focus}</p>
            <p className="mt-3 text-sm text-zinc-400">{food.tips[0]}</p>
            <p className="mt-2 text-xs text-zinc-500">
              {food.tips.slice(1, 3).join(" ")}
            </p>
          </section>
        )}
        {step === 3 && <DailyInspirationSettings />}
      </div>

      <div className="mt-3 flex shrink-0 gap-2">
        <button
          type="button"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className="min-h-[48px] flex-1 rounded-xl border border-zinc-700 text-sm font-bold text-zinc-200 disabled:opacity-40"
        >
          Back
        </button>
        <button
          type="button"
          disabled={step === STEPS.length - 1}
          onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
          className="min-h-[48px] flex-1 rounded-xl bg-orange-500 text-sm font-bold text-black disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
