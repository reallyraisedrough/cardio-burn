"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllSessions, isUnlocked } from "@/lib/db";
import { getExercise } from "@/lib/exercises";
import { formatMs, formatDate, formatSec } from "@/lib/format";
import type { WorkoutSession } from "@/lib/types";
import { Disclaimer } from "./Disclaimer";

export function ProgressClient() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [unlocked, setUnlocked] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [all, unlock] = await Promise.all([getAllSessions(), isUnlocked()]);
      if (cancelled) return;
      setUnlocked(unlock);
      setSessions(all);
    })().catch(() => {
      setUnlocked(false);
      setSessions([]);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (unlocked === null) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center text-zinc-400">
        Loading progress…
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="mx-auto max-w-lg px-4 pb-28 pt-6">
        <h1 className="text-3xl font-black text-white">Progress</h1>
        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-center">
          <p className="text-lg font-semibold text-zinc-200">
            Unlock progress history
          </p>
          <p className="mt-2 text-sm text-zinc-400">
            Subscribe or use Demo unlock to view full set/time/goal history.
          </p>
          <Link
            href="/subscribe"
            className="mt-6 inline-flex min-h-[52px] items-center justify-center rounded-xl bg-orange-500 px-6 font-bold text-black"
          >
            Go to Subscribe
          </Link>
        </div>
        <Disclaimer className="mt-8" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 pb-28 pt-6">
      <h1 className="text-3xl font-black text-white">Progress</h1>
      <p className="mt-1 text-sm text-zinc-400">
        History of sets, times, and goals.
      </p>

      {sessions.length === 0 ? (
        <p className="mt-10 text-center text-zinc-500">
          No sessions yet. Crush a workout from Home.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {sessions.map((s) => {
            const ex = getExercise(s.exerciseSlug);
            return (
              <li
                key={s.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-lg font-bold text-white">
                      {ex?.emoji} {s.exerciseName}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {formatDate(s.completedAt)}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      s.metGoal
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-zinc-700 text-zinc-300"
                    }`}
                  >
                    {s.metGoal ? "Goal met" : "Below goal"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-orange-400/90">{s.goal.label}</p>
                <ul className="mt-3 space-y-1.5">
                  {s.sets.map((set) => (
                    <li
                      key={set.setIndex}
                      className={`flex justify-between text-sm ${
                        set.isBurnout ? "text-red-400" : "text-zinc-300"
                      }`}
                    >
                      <span>
                        {set.isBurnout
                          ? "BURNOUT"
                          : `Set ${set.setIndex + 1}`}
                        {typeof set.reps === "number" ? ` · ${set.reps} reps` : ""}
                      </span>
                      <span>
                        {formatMs(set.durationMs)}
                        {!set.isBurnout && (
                          <span className="text-zinc-550 text-zinc-500">
                            {" "}
                            / {formatSec(Math.round(set.targetMs / 1000))}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-zinc-500">
                  Total {formatMs(s.totalDurationMs)}
                  {typeof s.totalReps === "number"
                    ? ` · ${s.totalReps} reps`
                    : ""}
                </p>
              </li>
            );
          })}
        </ul>
      )}
      <Disclaimer className="mt-8" />
    </div>
  );
}
