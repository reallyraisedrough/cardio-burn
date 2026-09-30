"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Exercise } from "@/lib/exercises";
import { DigitalHuman } from "./DigitalHuman";
import { buildFormCoachScript } from "@/lib/exercises";
import { getSessionsForExercise, saveSession } from "@/lib/db";
import { computeGoal, evaluateGoal } from "@/lib/goals";
import { canStoreWorkoutData } from "@/lib/consent";
import {
  goalFromPrescription,
  type PrescribedMove,
} from "@/lib/prescription";
import {
  loadModePref,
  saveModePref,
  type IntensityMode,
} from "@/lib/modes";
import {
  COACH_PITCH,
  COACH_RATE,
  COACH_RATE_COUNT,
  COACH_RATE_GO,
  COACH_RATE_FORM,
  COACH_PITCH_FORM,
  COUNTDOWN_SPEAK_LAST,
  ackCommand,
  estimateSpeakMs,
  pickBurnoutStart,
  pickGoLine,
  pickNextSet,
  pickSessionStart,
  pickSetCompleteRest,
  pickWorkoutComplete,
  speakCoach,
} from "@/lib/coach";
import { createTimer, type TimerSnapshot } from "@/lib/timer";
import { notifySetComplete } from "@/lib/audio";
import { formatMs, uid } from "@/lib/format";
import type { SetResult, WorkoutGoal, WorkoutSession } from "@/lib/types";
import { ModeSelector } from "./ModeSelector";
import {
  CoachBot,
  CountdownSelector,
  ExplainFormToggle,
  loadCountdownPref,
  loadExplainFormPref,
  loadMutePref,
  speakFormScript,
  type CoachCommand,
  type CountdownSec,
} from "./CoachBot";

type Phase = "loading" | "ready" | "active" | "summary";

export function WorkoutClient({
  exercise,
  prescribed,
  modeLock,
  stepLabel,
  finishLabel,
  onExit,
  onFinished,
}: {
  exercise: Exercise;
  prescribed?: PrescribedMove;
  modeLock?: IntensityMode;
  stepLabel?: string;
  finishLabel?: string;
  onExit?: () => void;
  onFinished?: () => void;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("loading");
  const [goal, setGoal] = useState<WorkoutGoal | null>(null);
  const [setIndex, setSetIndex] = useState(0);
  const [sets, setSets] = useState<SetResult[]>([]);
  const [timerSnap, setTimerSnap] = useState<TimerSnapshot | null>(null);
  const [reps, setReps] = useState(exercise.defaultReps ?? 10);
  const [metGoal, setMetGoal] = useState(false);
  const [startedAt, setStartedAt] = useState<string>("");
  const timerRef = useRef<ReturnType<typeof createTimer> | null>(null);
  const alarmFired = useRef(false);

  const [countdownSec, setCountdownSec] = useState<CountdownSec>(10);
  const [muted, setMuted] = useState(false);
  const [explainForm, setExplainForm] = useState(false);
  const [mode, setMode] = useState<IntensityMode>("moderate");
  const [history, setHistory] = useState<WorkoutSession[]>([]);
  const [preCount, setPreCount] = useState<number | null>(null);
  const [showGo, setShowGo] = useState(false);
  const [announce, setAnnounce] = useState<string | null>(null);
  const [saveNote, setSaveNote] = useState<string | null>(null);
  const [readyPane, setReadyPane] = useState<"brief" | "options">("brief");
  const [setPage, setSetPage] = useState(0);
  const countdownBusy = useRef(false);
  const pendingStart = useRef(false);

  useEffect(() => {
    setCountdownSec(loadCountdownPref());
    setMuted(loadMutePref());
    setExplainForm(loadExplainFormPref());
    setMode(loadModePref());
  }, []);

  const totalSets = useMemo(() => {
    if (!goal) return 5;
    return goal.workingSets + (goal.burnout ? 1 : 0);
  }, [goal]);

  const isBurnout = Boolean(goal && setIndex >= goal.workingSets);
  const targetMs = goal
    ? isBurnout
      ? 0
      : goal.targetSecPerSet * 1000
    : exercise.defaultSetDurationSec * 1000;

  useEffect(() => {
    let cancelled = false;
    const m = modeLock ?? loadModePref();
    setMode(m);
    if (prescribed) {
      setHistory([]);
      setGoal(goalFromPrescription(prescribed, m));
      setPhase("ready");
      return () => {
        cancelled = true;
        timerRef.current?.destroy();
      };
    }
    (async () => {
      const hist = await getSessionsForExercise(exercise.slug);
      if (cancelled) return;
      setHistory(hist);
      setGoal(computeGoal(exercise, hist, m));
      setPhase("ready");
    })().catch(() => {
      if (cancelled) return;
      setHistory([]);
      setGoal(computeGoal(exercise, [], m));
      setPhase("ready");
    });
    return () => {
      cancelled = true;
      timerRef.current?.destroy();
    };
  }, [exercise, prescribed, modeLock]);

  const onModeChange = useCallback(
    (m: IntensityMode) => {
      if (phase !== "ready" || modeLock) return;
      setMode(m);
      saveModePref(m);
      setGoal(computeGoal(exercise, history, m));
    },
    [phase, exercise, history, modeLock]
  );

  const teardownTimer = () => {
    timerRef.current?.destroy();
    timerRef.current = null;
  };

  const setupTimer = useCallback(
    (burnout: boolean, target: number) => {
      teardownTimer();
      alarmFired.current = false;
      const mode = burnout ? "countup" : "countdown";
      const t = createTimer(
        mode,
        burnout ? Number.MAX_SAFE_INTEGER : target,
        (snap) => setTimerSnap(snap),
        () => {
          if (!burnout && !alarmFired.current) {
            alarmFired.current = true;
            notifySetComplete(
              "Set complete",
              `${exercise.name} — target time reached`
            );
            setAnnounce(pickSetCompleteRest());
          }
        }
      );
      timerRef.current = t;
      setTimerSnap(t.getSnapshot());
    },
    [exercise.name]
  );

  const runPreCountdown = useCallback(
    async (thenStart: boolean) => {
      if (countdownBusy.current) return;
      countdownBusy.current = true;
      pendingStart.current = thenStart;
      const total = countdownSec;
      for (let n = total; n >= 1; n--) {
        setPreCount(n);
        // Visual always; speak only last 3 ticks to avoid spam/overlap
        if (n <= COUNTDOWN_SPEAK_LAST) {
          speakCoach(String(n), muted, {
            rate: COACH_RATE_COUNT,
            pitch: COACH_PITCH,
          });
        }
        await new Promise((r) => setTimeout(r, 1000));
      }
      setPreCount(null);
      setShowGo(true);
      speakCoach(pickGoLine(), muted, {
        rate: COACH_RATE_GO,
        pitch: COACH_PITCH,
      });
      await new Promise((r) => setTimeout(r, 700));
      setShowGo(false);
      if (pendingStart.current) {
        timerRef.current?.start();
      }
      countdownBusy.current = false;
    },
    [countdownSec, muted]
  );

  const beginWorkout = useCallback(() => {
    if (!goal) return;
    setStartedAt(new Date().toISOString());
    setSets([]);
    setSetIndex(0);
    setReps(goal.targetReps ?? exercise.defaultReps ?? 10);
    setPhase("active");
    setupTimer(false, goal.targetSecPerSet * 1000);
    void (async () => {
      // Announce speaks once via CoachBot; wait estimated duration (no double TTS)
      const modeLine = pickSessionStart(goal.mode ?? mode);
      setAnnounce(modeLine);
      await new Promise((r) =>
        setTimeout(r, muted ? 600 : estimateSpeakMs(modeLine, COACH_RATE))
      );
      if (explainForm) {
        const script = buildFormCoachScript(exercise);
        const formCue = "Quick form check.";
        setAnnounce(formCue);
        // Let the cue finish before the form script so the two never overlap.
        await new Promise((r) =>
          setTimeout(r, muted ? 200 : estimateSpeakMs(formCue, COACH_RATE))
        );
        await speakFormScript(script, muted, {
          rate: COACH_RATE_FORM,
          pitch: COACH_PITCH_FORM,
        });
      }
      const goCue = "Alright, let's go.";
      setAnnounce(goCue);
      await new Promise((r) =>
        setTimeout(r, muted ? 200 : estimateSpeakMs(goCue, COACH_RATE))
      );
      await runPreCountdown(true);
    })();
  }, [goal, exercise, setupTimer, runPreCountdown, explainForm, muted, mode]);

  const finishSet = useCallback(() => {
    if (!goal || !timerSnap) return;
    if (countdownBusy.current) return;
    timerRef.current?.pause();
    const burnout = setIndex >= goal.workingSets;
    const recordedMs = Math.round(timerSnap.elapsedMs);

    const result: SetResult = {
      setIndex,
      isBurnout: burnout,
      durationMs: recordedMs,
      targetMs: burnout ? recordedMs : goal.targetSecPerSet * 1000,
      reps: exercise.tracking === "reps" ? reps : undefined,
      completed: true,
    };

    const nextSets = [...sets, result];
    setSets(nextSets);

    const nextIndex = setIndex + 1;
    if (nextIndex >= totalSets) {
      teardownTimer();
      const ok = evaluateGoal(goal, nextSets);
      setMetGoal(ok);
      setAnnounce(pickWorkoutComplete(ok));
      setPhase("summary");
      return;
    }

    const nextBurnout = nextIndex >= goal.workingSets;
    setSetIndex(nextIndex);
    setReps(goal.targetReps ?? exercise.defaultReps ?? 10);
    setupTimer(
      nextBurnout,
      nextBurnout ? 0 : goal.targetSecPerSet * 1000
    );
    if (nextBurnout) {
      setAnnounce(pickBurnoutStart());
    } else {
      setAnnounce(pickNextSet());
    }
    void runPreCountdown(true);
  }, [
    goal,
    timerSnap,
    setIndex,
    sets,
    totalSets,
    exercise,
    reps,
    setupTimer,
    runPreCountdown,
  ]);

  const saveAndDone = async () => {
    if (!goal) return;
    const totalDurationMs = sets.reduce((a, s) => a + s.durationMs, 0);
    const totalReps =
      exercise.tracking === "reps"
        ? sets.reduce((a, s) => a + (s.reps ?? 0), 0)
        : undefined;
    const session = {
      id: uid(),
      exerciseSlug: exercise.slug,
      exerciseName: exercise.name,
      startedAt: startedAt || new Date().toISOString(),
      completedAt: new Date().toISOString(),
      sets,
      goal,
      metGoal,
      totalDurationMs,
      totalReps,
    };
    if (!canStoreWorkoutData()) {
      setSaveNote(
        "Not saved. History stays off until you accept the data notice."
      );
      if (onFinished) onFinished();
      return;
    }
    try {
      await saveSession(session);
    } catch {
      setSaveNote("Could not save this session.");
      return;
    }
    if (onFinished) onFinished();
    else router.push("/progress");
  };

  const handleCoachCommand = useCallback(
    (cmd: CoachCommand) => {
      if (phase !== "active") {
        if (cmd === "start" && phase === "ready") {
          setAnnounce(ackCommand("start"));
          beginWorkout();
        }
        return;
      }
      switch (cmd) {
        case "start":
        case "resume":
          setAnnounce(ackCommand(cmd === "start" ? "start" : "resume"));
          if (!timerSnap?.running && !countdownBusy.current) {
            void runPreCountdown(true);
          } else if (!timerSnap?.running) {
            timerRef.current?.start();
          }
          break;
        case "pause":
          timerRef.current?.pause();
          setAnnounce(ackCommand("pause"));
          break;
        case "reset":
          alarmFired.current = false;
          timerRef.current?.reset();
          setAnnounce(ackCommand("reset"));
          break;
        case "done":
        case "next":
        case "skip":
          setAnnounce(ackCommand(cmd));
          finishSet();
          break;
      }
    },
    [phase, timerSnap, runPreCountdown, finishSet, beginWorkout]
  );

  if (phase === "loading" || !goal) {
    return (
      <div className="flex h-full items-center justify-center overflow-hidden bg-zinc-950 text-zinc-400">
        Preparing workout…
      </div>
    );
  }

  const exitNode = onExit ? (
    <button
      type="button"
      onClick={() => {
        teardownTimer();
        onExit();
      }}
      className="text-sm text-zinc-400"
    >
      ← Back
    </button>
  ) : (
    <Link
      href={`/exercise/${exercise.slug}`}
      className="text-sm text-zinc-400"
      onClick={() => teardownTimer()}
    >
      ← Back
    </Link>
  );

  if (phase === "ready") {
    return (
      <div className="mx-auto flex h-full max-w-lg flex-col overflow-hidden px-4 py-3">
        <div className="flex items-center justify-between">
          {exitNode}
          {stepLabel && (
            <p className="text-xs font-semibold text-zinc-500">{stepLabel}</p>
          )}
        </div>
        {readyPane === "brief" ? (
          <>
            <div className="mt-3 flex items-center gap-3">
              <DigitalHuman
                slug={exercise.slug}
                phase="exec"
                className="h-20 w-20 shrink-0 rounded-2xl bg-zinc-950"
                title={`Form for ${exercise.name}`}
              />
              <div className="min-w-0">
                <h1 className="truncate text-2xl font-black text-white">
                  {exercise.emoji} {exercise.name}
                </h1>
                <p className="mt-1 text-sm text-orange-300">{goal.label}</p>
                <p className="mt-1 text-xs text-zinc-400">
                  {goal.workingSets} working sets + burnout last
                  {exercise.tracking === "reps" && goal.targetReps
                    ? ` · ${goal.targetReps} reps · ${goal.targetSecPerSet}s`
                    : ` · ${goal.targetSecPerSet}s`}
                </p>
              </div>
            </div>
            <CountdownSelector
              className="mt-4"
              value={countdownSec}
              onChange={setCountdownSec}
            />
            <ExplainFormToggle
              className="mt-3"
              value={explainForm}
              onChange={setExplainForm}
            />
            <button
              type="button"
              onClick={() => setReadyPane("options")}
              className="mt-3 flex min-h-[44px] w-full items-center justify-center rounded-xl border border-zinc-700 text-sm font-semibold text-zinc-200"
            >
              Coach & options
            </button>
            <button
              type="button"
              onClick={beginWorkout}
              className="mt-auto flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-orange-500 text-lg font-bold text-black"
            >
              Begin
            </button>
          </>
        ) : (
          <>
            <h1 className="mt-3 text-xl font-black text-white">Coach & options</h1>
            {!modeLock && (
              <ModeSelector
                className="mt-3"
                value={mode}
                onChange={onModeChange}
                variant="segmented"
              />
            )}
            <div className="mt-3 min-h-0 flex-1 overflow-hidden">
              <CoachBot
                active={false}
                muted={muted}
                onMuteChange={setMuted}
                onCommand={handleCoachCommand}
                announce={announce}
                onAnnounceConsumed={() => setAnnounce(null)}
              />
            </div>
            <button
              type="button"
              onClick={() => setReadyPane("brief")}
              className="mt-3 flex min-h-[44px] w-full items-center justify-center rounded-xl border border-zinc-700 text-sm font-semibold text-zinc-300"
            >
              Back to exercise
            </button>
            <button
              type="button"
              onClick={beginWorkout}
              className="mt-2 flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-orange-500 text-lg font-bold text-black"
            >
              Begin
            </button>
          </>
        )}
      </div>
    );
  }

  if (phase === "summary") {
    const allowSave = canStoreWorkoutData();
    const pageSize = 4;
    const pageCount = Math.max(1, Math.ceil(sets.length / pageSize));
    const visible = sets.slice(setPage * pageSize, setPage * pageSize + pageSize);
    const primary = allowSave
      ? finishLabel
        ? `Save & ${finishLabel.toLowerCase()}`
        : "Save session"
      : finishLabel ?? "Continue without saving";
    return (
      <div className="mx-auto flex h-full max-w-lg flex-col overflow-hidden px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-white">Exercise done</h1>
          {stepLabel && (
            <p className="text-xs font-semibold text-zinc-500">{stepLabel}</p>
          )}
        </div>
        <div
          className={`mt-3 rounded-2xl border p-4 ${
            metGoal
              ? "border-emerald-500/50 bg-emerald-500/10"
              : "border-zinc-700 bg-zinc-900"
          }`}
        >
          <p className="text-sm font-bold text-white">{goal.label}</p>
          <p
            className={`mt-1 text-lg font-black ${
              metGoal ? "text-emerald-400" : "text-zinc-300"
            }`}
          >
            {metGoal ? "Goal crushed" : "Below goal"}
          </p>
        </div>
        <ul className="mt-3 min-h-0 flex-1 space-y-1.5 overflow-hidden">
          {visible.map((s) => (
            <li
              key={s.setIndex}
              className={`flex justify-between rounded-xl px-3 py-2 text-sm ${
                s.isBurnout
                  ? "bg-red-500/15 text-red-300"
                  : "bg-zinc-900 text-zinc-200"
              }`}
            >
              <span>
                {s.isBurnout ? "BURNOUT" : `Set ${s.setIndex + 1}`}
                {typeof s.reps === "number" ? ` · ${s.reps} reps` : ""}
              </span>
              <span className="font-mono">{formatMs(s.durationMs)}</span>
            </li>
          ))}
        </ul>
        {pageCount > 1 && (
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              disabled={setPage === 0}
              onClick={() => setSetPage((n) => Math.max(0, n - 1))}
              className="min-h-[40px] flex-1 rounded-xl border border-zinc-700 text-sm font-semibold text-zinc-300 disabled:opacity-40"
            >
              Previous sets
            </button>
            <button
              type="button"
              disabled={setPage >= pageCount - 1}
              onClick={() => setSetPage((n) => Math.min(pageCount - 1, n + 1))}
              className="min-h-[40px] flex-1 rounded-xl border border-zinc-700 text-sm font-semibold text-zinc-300 disabled:opacity-40"
            >
              Next sets
            </button>
          </div>
        )}
        {!allowSave && (
          <p className="mt-2 text-xs text-amber-400">
            Saves are off until you accept the data notice.
          </p>
        )}
        {saveNote && (
          <p className="mt-2 text-xs text-zinc-400" role="status">
            {saveNote}
          </p>
        )}
        <button
          type="button"
          onClick={saveAndDone}
          className="mt-3 flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-orange-500 text-base font-bold text-black"
        >
          {primary}
        </button>
        {onExit ? (
          <button
            type="button"
            onClick={onExit}
            className="mt-2 flex min-h-[40px] items-center justify-center text-sm text-zinc-400"
          >
            Exit workout
          </button>
        ) : (
          <Link
            href="/"
            className="mt-2 flex min-h-[40px] items-center justify-center text-sm text-zinc-400"
          >
            Discard & go home
          </Link>
        )}
      </div>
    );
  }

  const displayTime = isBurnout
    ? formatMs(timerSnap?.elapsedMs ?? 0)
    : formatMs(timerSnap?.remainingMs ?? targetMs);

  return (
    <div className="relative mx-auto flex h-full max-w-lg flex-col overflow-hidden bg-zinc-950 px-4 py-3">
      {(preCount !== null || showGo) && (
        <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center bg-zinc-950/70">
          <p
            className={`font-black tabular-nums text-orange-500 ${
              showGo ? "text-7xl" : "text-8xl"
            }`}
          >
            {showGo ? "GO" : preCount}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        {onExit ? (
          <button
            type="button"
            className="text-sm text-zinc-500"
            onClick={() => {
              teardownTimer();
              onExit();
            }}
          >
            Exit
          </button>
        ) : (
          <Link
            href={`/exercise/${exercise.slug}`}
            className="text-sm text-zinc-500"
            onClick={() => teardownTimer()}
          >
            Exit
          </Link>
        )}
        <p className="text-xs font-semibold text-zinc-400">
          {stepLabel ? `${stepLabel} · ` : ""}
          {setIndex + 1} / {totalSets}
          {isBurnout ? " · burnout" : ""}
        </p>
      </div>

      <div className="mt-2">
        <CoachBot
          active
          muted={muted}
          onMuteChange={setMuted}
          onCommand={handleCoachCommand}
          announce={announce}
          onAnnounceConsumed={() => setAnnounce(null)}
          burnout={isBurnout}
        />
      </div>

      <div className="mt-2 flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/70 p-2">
        <DigitalHuman
          slug={exercise.slug}
          phase="exec"
          className="h-12 w-12 shrink-0 rounded-lg bg-zinc-950"
          title={`${exercise.name} form`}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-white">{exercise.name}</p>
          <p className="truncate text-xs text-zinc-400">
            {isBurnout
              ? "Burnout last — count up, then Done"
              : exercise.tracking === "reps" && goal.targetReps
                ? `${goal.targetReps} reps · ${goal.targetSecPerSet}s`
                : `${goal.targetSecPerSet}s`}
          </p>
        </div>
      </div>

      <div
        className={`mt-2 rounded-2xl border px-4 py-3 ${
          isBurnout
            ? "border-red-500 bg-red-950/40"
            : "border-zinc-800 bg-zinc-900"
        }`}
      >
        <p
          className={`text-center font-mono text-5xl font-black tabular-nums ${
            isBurnout ? "text-red-400" : "text-white"
          }`}
        >
          {displayTime}
        </p>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => {
            if (countdownBusy.current) return;
            if (!timerSnap?.running) void runPreCountdown(true);
            else timerRef.current?.start();
          }}
          className="flex min-h-[48px] items-center justify-center rounded-xl bg-emerald-600 text-sm font-bold text-white"
        >
          Start
        </button>
        <button
          type="button"
          onClick={() => timerRef.current?.pause()}
          className="flex min-h-[48px] items-center justify-center rounded-xl bg-zinc-700 text-sm font-bold text-white"
        >
          Pause
        </button>
        <button
          type="button"
          onClick={() => {
            alarmFired.current = false;
            timerRef.current?.reset();
          }}
          className="flex min-h-[48px] items-center justify-center rounded-xl bg-zinc-800 text-sm font-bold text-zinc-200"
        >
          Reset
        </button>
      </div>

      {exercise.tracking === "reps" && (
        <div className="mt-2 flex items-center justify-center gap-4">
          <button
            type="button"
            aria-label="Decrease reps"
            onClick={() => setReps((r) => Math.max(0, r - 1))}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-800 text-xl font-bold text-white"
          >
            −
          </button>
          <span className="min-w-[3rem] text-center font-mono text-3xl font-black text-white">
            {reps}
          </span>
          <button
            type="button"
            aria-label="Increase reps"
            onClick={() => setReps((r) => r + 1)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-800 text-xl font-bold text-white"
          >
            +
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={finishSet}
        className={`mt-auto flex min-h-[52px] w-full items-center justify-center rounded-2xl text-base font-black ${
          isBurnout ? "bg-red-500 text-white" : "bg-orange-500 text-black"
        }`}
      >
        {isBurnout ? "Done — finish burnout" : "Done — next set"}
      </button>
    </div>
  );
}
