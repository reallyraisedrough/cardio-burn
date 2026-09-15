"use client";

export type TimerMode = "countdown" | "countup";

export interface TimerSnapshot {
  elapsedMs: number;
  remainingMs: number;
  running: boolean;
  mode: TimerMode;
  targetMs: number;
  finished: boolean;
}

export interface TimerController {
  start: () => void;
  pause: () => void;
  reset: () => void;
  getSnapshot: () => TimerSnapshot;
  destroy: () => void;
}

/**
 * Lightweight timer/stopwatch with start/pause/reset.
 * Countdown: counts down from targetMs.
 * Countup: counts up (optionally until Done for burnout — no auto-finish).
 */
export function createTimer(
  mode: TimerMode,
  targetMs: number,
  onTick: (snap: TimerSnapshot) => void,
  onComplete?: () => void
): TimerController {
  let elapsedMs = 0;
  let running = false;
  let finished = false;
  let lastTs = 0;
  let raf = 0;

  const snapshot = (): TimerSnapshot => ({
    elapsedMs,
    remainingMs: Math.max(0, targetMs - elapsedMs),
    running,
    mode,
    targetMs,
    finished,
  });

  const emit = () => onTick(snapshot());

  const loop = (ts: number) => {
    if (!running) return;
    if (!lastTs) lastTs = ts;
    const delta = ts - lastTs;
    lastTs = ts;
    elapsedMs += delta;

    if (mode === "countdown" && elapsedMs >= targetMs) {
      elapsedMs = targetMs;
      running = false;
      finished = true;
      emit();
      onComplete?.();
      return;
    }

    emit();
    raf = requestAnimationFrame(loop);
  };

  return {
    start() {
      if (finished && mode === "countdown") return;
      if (running) return;
      running = true;
      lastTs = 0;
      emit();
      raf = requestAnimationFrame(loop);
    },
    pause() {
      running = false;
      lastTs = 0;
      if (raf) cancelAnimationFrame(raf);
      emit();
    },
    reset() {
      running = false;
      finished = false;
      elapsedMs = 0;
      lastTs = 0;
      if (raf) cancelAnimationFrame(raf);
      emit();
    },
    getSnapshot: snapshot,
    destroy() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
    },
  };
}
