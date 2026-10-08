"use client";

import { useEffect, useState } from "react";
import type { ExerciseSlug } from "@/lib/types";
import { DigitalHuman } from "./DigitalHuman";

/**
 * Same digital human as the rest of the app, looping a start pose
 * and an execution pose in each corner. Hard cut, no crossfade.
 */

const STEP_MS = 800;

type FigureSpec = {
  slug: ExerciseSlug;
  className: string;
  opacity: number;
  mirror: boolean;
  startOnExec: boolean;
  offsetMs: number;
};

const FIGURES: FigureSpec[] = [
  {
    slug: "squats",
    className: "left-[4%] top-[4%] h-[42vh] w-[22vw]",
    opacity: 0.52,
    mirror: false,
    startOnExec: false,
    offsetMs: 0,
  },
  {
    slug: "burpees",
    className: "right-[4%] top-[4%] h-[42vh] w-[22vw]",
    opacity: 0.46,
    mirror: true,
    startOnExec: true,
    offsetMs: 400,
  },
  {
    slug: "squats",
    className: "bottom-[4%] left-[4%] h-[42vh] w-[22vw]",
    opacity: 0.4,
    mirror: true,
    startOnExec: true,
    offsetMs: 800,
  },
  {
    slug: "burpees",
    className: "bottom-[4%] right-[4%] h-[42vh] w-[22vw]",
    opacity: 0.38,
    mirror: false,
    startOnExec: false,
    offsetMs: 200,
  },
];

function LoginFigure({ spec }: { spec: FigureSpec }) {
  const [exec, setExec] = useState(spec.startOnExec);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      const show = window.setTimeout(() => setExec(true), 0);
      return () => window.clearTimeout(show);
    }
    let interval = 0;
    const tick = () => setExec((v) => !v);
    const kick = window.setTimeout(() => {
      tick();
      interval = window.setInterval(tick, STEP_MS);
    }, spec.offsetMs === 0 ? STEP_MS : spec.offsetMs);
    return () => {
      window.clearTimeout(kick);
      window.clearInterval(interval);
    };
  }, [spec]);

  return (
    <div
      className={`pointer-events-none absolute ${spec.className}`}
      style={{
        opacity: spec.opacity,
        transform: spec.mirror ? "scaleX(-1)" : undefined,
      }}
    >
      <DigitalHuman
        slug={spec.slug}
        phase={exec ? "exec" : "start"}
        preloadOther
        className="h-full w-full"
      />
    </div>
  );
}

export function LoginPeople() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      {FIGURES.map((spec) => (
        <LoginFigure key={`${spec.slug}-${spec.className}`} spec={spec} />
      ))}
    </div>
  );
}
