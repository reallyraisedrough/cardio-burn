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
import { Disclaimer } from "./Disclaimer";
import { DailyInspirationSettings } from "./DailyInspirationSettings";

export function PlanClient() {
  const [mode, setMode] = useState<IntensityMode>("moderate");

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

  return (
    <div className="mx-auto max-w-lg px-4 pb-28 pt-6">
      <header className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-orange-400">
          Schedule & fuel
        </p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-white">
          Your plan
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Weekly exercise cadence and practical food tips for{" "}
          {preset.label} mode — coaching hints only, not medical advice.
        </p>
      </header>

      <ModeSelector
        className="mb-6"
        value={mode}
        onChange={onModeChange}
        variant="segmented"
      />

      <section className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-orange-400">
          {plan.title}
        </h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div>
            <dt className="text-zinc-500">Frequency</dt>
            <dd className="font-semibold text-zinc-100">{plan.frequency}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Per session</dt>
            <dd className="font-semibold text-zinc-100">
              {plan.exercisesPerSession}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500">Sets</dt>
            <dd className="font-semibold text-zinc-100">
              {preset.workingSets} working sets + burnout each exercise
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          {plan.summary}
        </p>
        <ul className="mt-3 space-y-1.5">
          {plan.tips.map((t) => (
            <li key={t} className="text-xs text-zinc-500">
              · {t}
            </li>
          ))}
        </ul>
      </section>

      {plan.sampleCombos.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-zinc-400">
            Sample rotations
          </h2>
          <ul className="flex flex-col gap-3">
            {plan.sampleCombos.map((combo) => (
              <li
                key={combo.label}
                className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4"
              >
                <p className="font-bold text-white">{combo.label}</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {combo.exercises.map((ex) => (
                    <li key={ex.slug}>
                      <Link
                        href={`/exercise/${ex.slug}`}
                        className="inline-flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-xs font-semibold text-zinc-200 hover:border-orange-500/50 hover:text-orange-400"
                      >
                        <span aria-hidden>{ex.emoji}</span>
                        {ex.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      )}

      {plan.splitDays && plan.splitDays.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-zinc-400">
            Two-day library split
          </h2>
          <ul className="flex flex-col gap-3">
            {plan.splitDays.map((day) => (
              <li
                key={day.dayLabel}
                className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4"
              >
                <p className="font-bold text-white">{day.dayLabel}</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {day.exercises.map((ex) => (
                    <li key={ex.slug}>
                      <Link
                        href={`/exercise/${ex.slug}`}
                        className="inline-flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-xs font-semibold text-zinc-200 hover:border-orange-500/50 hover:text-orange-400"
                      >
                        <span aria-hidden>{ex.emoji}</span>
                        {ex.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-orange-400">
          {food.title}
        </h2>
        <p className="mt-2 text-sm text-zinc-300">{food.focus}</p>
        <ul className="mt-3 space-y-2">
          {food.tips.map((t) => (
            <li
              key={t}
              className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 px-3 py-2 text-sm text-zinc-400"
            >
              {t}
            </li>
          ))}
        </ul>
      </section>

      <DailyInspirationSettings />

      <Disclaimer />
    </div>
  );
}
