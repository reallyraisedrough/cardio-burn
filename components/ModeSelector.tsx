"use client";

import {
  MODE_ORDER,
  MODE_PRESETS,
  type IntensityMode,
} from "@/lib/modes";

interface Props {
  value: IntensityMode;
  onChange: (mode: IntensityMode) => void;
  className?: string;
  /** Compact segmented control vs taller cards */
  variant?: "segmented" | "cards";
}

export function ModeSelector({
  value,
  onChange,
  className = "",
  variant = "segmented",
}: Props) {
  if (variant === "cards") {
    return (
      <div className={className}>
        <p className="mb-2 text-sm font-bold uppercase tracking-wider text-orange-400">
          Intensity mode
        </p>
        <div className="grid grid-cols-3 gap-2">
          {MODE_ORDER.map((id) => {
            const p = MODE_PRESETS[id];
            const active = value === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onChange(id)}
                aria-pressed={active}
                className={`rounded-2xl border px-2 py-3 text-center transition active:scale-[0.97] ${
                  active
                    ? "border-orange-500 bg-orange-500/20 shadow-[0_0_20px_rgba(249,115,22,0.2)]"
                    : "border-zinc-800 bg-zinc-900/80 hover:border-zinc-600"
                }`}
              >
                <p
                  className={`text-sm font-black ${
                    active ? "text-orange-400" : "text-zinc-200"
                  }`}
                >
                  {p.label}
                </p>
                <p className="mt-1 text-[10px] leading-tight text-zinc-500">
                  {p.workingSets} work + burnout
                </p>
                <p className="mt-0.5 text-[10px] text-zinc-600">
                  {p.timedMin}–{p.timedMax}s · {p.repsMin}–{p.repsMax} reps
                </p>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <p className="mb-2 text-sm font-bold uppercase tracking-wider text-orange-400">
        Intensity mode
      </p>
      <div
        role="group"
        aria-label="Workout intensity mode"
        className="flex rounded-2xl border border-zinc-800 bg-zinc-950 p-1"
      >
        {MODE_ORDER.map((id) => {
          const p = MODE_PRESETS[id];
          const active = value === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              aria-pressed={active}
              className={`min-h-[44px] flex-1 rounded-xl px-2 text-sm font-bold transition active:scale-[0.98] ${
                active
                  ? "bg-orange-500 text-black shadow-md shadow-orange-500/30"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-zinc-500">
        {MODE_PRESETS[value].description}
      </p>
    </div>
  );
}
