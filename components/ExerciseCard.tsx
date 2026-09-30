"use client";

import Link from "next/link";
import type { Exercise } from "@/lib/exercises";
import type { WorkoutSession } from "@/lib/types";
import { formatMs, formatDate } from "@/lib/format";
import { DigitalHuman } from "./DigitalHuman";

interface Props {
  exercise: Exercise;
  last: WorkoutSession | null;
  goalLabel?: string;
}

export function ExerciseCard({ exercise, last, goalLabel }: Props) {
  const lastHint = last
    ? `Last: ${formatMs(
        last.sets
          .filter((s) => !s.isBurnout && s.completed)
          .reduce((a, s) => a + s.durationMs, 0)
      )} · ${formatDate(last.completedAt)}`
    : "No sessions yet — starter goal ready";

  return (
    <Link
      href={`/exercise/${exercise.slug}`}
      className="block rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 transition active:scale-[0.98] hover:border-orange-500/50 hover:bg-zinc-900"
    >
      <div className="flex items-start gap-3">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950">
          <DigitalHuman
            slug={exercise.slug}
            phase="exec"
            className="h-full w-full"
            title={`Proper form for ${exercise.name}`}
          />
          <span className="absolute bottom-0.5 right-0.5 text-sm leading-none drop-shadow">
            {exercise.emoji}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-zinc-50">{exercise.name}</h2>
            <span className="text-zinc-500 text-sm">›</span>
          </div>
          <p className="mt-0.5 text-sm text-zinc-400 line-clamp-1">
            {exercise.description}
          </p>
          <p className="mt-2 text-xs text-zinc-500">{lastHint}</p>
          {goalLabel && (
            <p className="mt-1 text-xs font-medium text-orange-400/90">
              {goalLabel}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
