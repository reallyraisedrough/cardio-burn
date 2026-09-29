"use client";

import { useEffect, useState } from "react";
import {
  loadModePref,
  saveModePref,
  MODE_PRESETS,
  type IntensityMode,
} from "@/lib/modes";
import { prescribeToday, type TodayPrescription } from "@/lib/prescription";
import { canStoreWorkoutData } from "@/lib/consent";
import { loadAccount } from "@/lib/account";
import { getExercise } from "@/lib/exercises";
import { ModeSelector } from "./ModeSelector";
import { Disclaimer } from "./Disclaimer";

export function HomeClient({
  onStart,
  onReviewConsent,
}: {
  onStart: (rx: TodayPrescription) => void;
  onReviewConsent: () => void;
}) {
  const [mode, setMode] = useState<IntensityMode>("moderate");
  const [rx, setRx] = useState<TodayPrescription | null>(null);
  const [stores, setStores] = useState(true);
  const [who, setWho] = useState("");

  useEffect(() => {
    const m = loadModePref();
    setMode(m);
    setRx(prescribeToday(m));
    setStores(canStoreWorkoutData());
    const account = loadAccount();
    setWho(
      account?.kind === "email"
        ? account.email
        : account?.kind === "guest"
          ? "Guest"
          : ""
    );
  }, []);

  const onModeChange = (m: IntensityMode) => {
    setMode(m);
    saveModePref(m);
    setRx(prescribeToday(m));
  };

  const preset = MODE_PRESETS[mode];

  return (
    <div className="page-in mx-auto flex h-full max-w-lg flex-col overflow-hidden px-4 pt-4 pb-[calc(4.75rem+env(safe-area-inset-bottom))]">
      <header className="shrink-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-orange-400">
          Cardio Burner{who ? ` · ${who}` : ""}
        </p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-white">
          Today&apos;s workout
        </h1>
        <p className="mt-1 text-xs text-zinc-500">
          {preset.label} · {preset.workingSets} working sets + burnout
        </p>
      </header>

      <ModeSelector
        className="mt-3 shrink-0"
        value={mode}
        onChange={onModeChange}
        variant="segmented"
      />

      <section className="mt-3 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 p-3">
        <p className="text-[11px] font-bold uppercase tracking-wider text-orange-400">
          Prescribed · {rx?.title ?? "…"}
        </p>
        <ul className="mt-2 min-h-0 flex-1 space-y-1.5 overflow-hidden">
          {(rx?.moves ?? []).map((move, i) => {
            const ex = getExercise(move.slug);
            const thumb = ex?.formExecImage || ex?.formImage;
            return (
              <li
                key={move.slug}
                className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/70 px-2 py-1.5"
              >
                {thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumb}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded-lg object-cover"
                    width={40}
                    height={40}
                  />
                ) : (
                  <span className="text-lg">{move.emoji}</span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">
                    {i + 1}. {move.name}
                  </p>
                  <p className="truncate text-xs text-zinc-400">{move.line}</p>
                </div>
              </li>
            );
          })}
        </ul>
        {!stores && (
          <button
            type="button"
            onClick={onReviewConsent}
            className="mt-2 shrink-0 text-left text-[11px] text-amber-400/90 underline"
          >
            History saves are off. Review the data notice.
          </button>
        )}
      </section>

      <button
        type="button"
        disabled={!rx || rx.moves.length === 0}
        onClick={() => rx && onStart(rx)}
        className="mt-3 flex min-h-[52px] w-full shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-base font-bold text-black disabled:opacity-50"
      >
        Start today&apos;s workout
      </button>
      <Disclaimer className="mt-2 line-clamp-2 shrink-0" />
    </div>
  );
}
