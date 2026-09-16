"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Exercise } from "@/lib/exercises";
import { buildFormCoachScript } from "@/lib/exercises";
import { getSessionsForExercise, saveSession } from "@/lib/db";
import { computeGoal, evaluateGoal } from "@/lib/goals";
import { createTimer, type TimerSnapshot } from "@/lib/timer";
import { notifySetComplete } from "@/lib/audio";
import { formatMs, uid } from "@/lib/format";
import type { SetResult, WorkoutGoal } from "@/lib/types";
import { Disclaimer } from "./Disclaimer";
import {
  CoachBot,
  CountdownSelector,
  ExplainFormToggle,
  loadCountdownPref,
  loadExplainFormPref,
  loadMutePref,
  speakDrive,
  speakFormScript,
  type CoachCommand,
  type CountdownSec,
} from "./CoachBot";

type Phase = "loading" | "ready" | "active" | "summary";

export function WorkoutClient({ exercise }: { exercise: Exercise }) {
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
  const [preCount, setPreCount] = useState<number | null>(null);
  const [showGo, setShowGo] = useState(false);
  const [announce, setAnnounce] = useState<string | null>(null);
  const countdownBusy = useRef(false);
  const pendingStart = useRef(false);

  useEffect(() => {
    setCountdownSec(loadCountdownPref());
    setMuted(loadMutePref());
    setExplainForm(loadExplainFormPref());
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
    (async () => {
      const hist = await getSessionsForExercise(exercise.slug);
      if (cancelled) return;
      const g = computeGoal(exercise, hist);
      setGoal(g);
      setPhase("ready");
    })().catch(() => {
      const g = computeGoal(exercise, []);
      setGoal(g);
      setPhase("ready");
    });
    return () => {
      cancelled = true;
      timerRef.current?.destroy();
    };
  }, [exercise]);

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
            setAnnounce("Time. Rest.");
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
        speakDrive(String(n), muted, { rate: 1.05, pitch: 0.85 });
        await new Promise((r) => setTimeout(r, 1000));
      }
      setPreCount(null);
      setShowGo(true);
      speakDrive("GO", muted, { rate: 1.05, pitch: 0.88 });
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
    setReps(exercise.defaultReps ?? 10);
    setPhase("active");
    setupTimer(false, goal.targetSecPerSet * 1000);
    void (async () => {
      if (explainForm) {
        const script = buildFormCoachScript(exercise);
        setAnnounce("Form brief.");
        await speakFormScript(script, muted, { rate: 0.95, pitch: 0.88 });
      }
      setAnnounce("Let's go.");
      await runPreCountdown(true);
    })();
  }, [goal, exercise, setupTimer, runPreCountdown, explainForm, muted]);

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
      setAnnounce(ok ? "Goal crushed." : "Session complete.");
      setPhase("summary");
      return;
    }

    const nextBurnout = nextIndex >= goal.workingSets;
    setSetIndex(nextIndex);
    setReps(exercise.defaultReps ?? 10);
    setupTimer(
      nextBurnout,
      nextBurnout ? 0 : goal.targetSecPerSet * 1000
    );
    if (nextBurnout) {
      setAnnounce("Burnout — empty the tank.");
    } else {
      setAnnounce("One more. Push through.");
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
    await saveSession(session);
    router.push("/progress");
  };

  const handleCoachCommand = useCallback(
    (cmd: CoachCommand) => {
      if (phase !== "active") {
        if (cmd === "start" && phase === "ready") beginWorkout();
        return;
      }
      switch (cmd) {
        case "start":
        case "resume":
          if (!timerSnap?.running && !countdownBusy.current) {
            void runPreCountdown(true);
          } else if (!timerSnap?.running) {
            timerRef.current?.start();
          }
          break;
        case "pause":
          timerRef.current?.pause();
          setAnnounce("Hold. Breathe.");
          break;
        case "reset":
          alarmFired.current = false;
          timerRef.current?.reset();
          setAnnounce("Reset. Ready.");
          break;
        case "done":
        case "next":
        case "skip":
          finishSet();
          break;
      }
    },
    [phase, timerSnap, runPreCountdown, finishSet, beginWorkout]
  );

  if (phase === "loading" || !goal) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        Preparing workout…
      </div>
    );
  }

  if (phase === "ready") {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col px-4 py-6">
        <Link href={`/exercise/${exercise.slug}`} className="text-sm text-zinc-400">
          ← Back
        </Link>
        <h1 className="mt-6 text-3xl font-black text-white">
          {exercise.emoji} {exercise.name}
        </h1>
        <div className="mt-6 rounded-2xl border border-orange-500/40 bg-orange-500/10 p-5">
          <p className="text-sm font-bold uppercase tracking-wider text-orange-400">
            Today&apos;s goal
          </p>
          <p className="mt-2 text-2xl font-black text-white">{goal.label}</p>
          <p className="mt-2 text-sm text-zinc-300">
            {goal.workingSets} working sets
            {goal.burnout
              ? " + 1 final BURNOUT (go to max, count-up until Done)"
              : ""}
            . Target {goal.targetSecPerSet}s per working set.
          </p>
        </div>

        <CountdownSelector
          className="mt-6"
          value={countdownSec}
          onChange={setCountdownSec}
        />

        <ExplainFormToggle
          className="mt-4"
          value={explainForm}
          onChange={setExplainForm}
        />

        <div className="mt-4">
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
          onClick={beginWorkout}
          className="mt-8 flex min-h-[56px] w-full items-center justify-center rounded-2xl bg-orange-500 text-lg font-bold text-black"
        >
          Begin
        </button>
        <Disclaimer className="mt-auto pt-8" />
      </div>
    );
  }

  if (phase === "summary") {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col px-4 py-6">
        <h1 className="text-3xl font-black text-white">Session complete</h1>
        <div
          className={`mt-6 rounded-2xl border p-5 ${
            metGoal
              ? "border-emerald-500/50 bg-emerald-500/10"
              : "border-zinc-700 bg-zinc-900"
          }`}
        >
          <p className="text-sm font-bold uppercase tracking-wider text-zinc-400">
            vs goal
          </p>
          <p className="mt-1 text-xl font-bold text-white">{goal.label}</p>
          <p
            className={`mt-3 text-2xl font-black ${
              metGoal ? "text-emerald-400" : "text-zinc-300"
            }`}
          >
            {metGoal ? "Goal crushed ✓" : "Below goal — next time"}
          </p>
        </div>
        <ul className="mt-6 space-y-2">
          {sets.map((s) => (
            <li
              key={s.setIndex}
              className={`flex justify-between rounded-xl px-4 py-3 text-sm ${
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
        <button
          type="button"
          onClick={saveAndDone}
          className="mt-8 flex min-h-[56px] w-full items-center justify-center rounded-2xl bg-orange-500 text-lg font-bold text-black"
        >
          Save session
        </button>
        <Link
          href="/"
          className="mt-3 flex min-h-[48px] items-center justify-center text-sm text-zinc-400"
        >
          Discard & go home
        </Link>
      </div>
    );
  }

  // active
  const displayTime = isBurnout
    ? formatMs(timerSnap?.elapsedMs ?? 0)
    : formatMs(timerSnap?.remainingMs ?? targetMs);

  return (
    <div className="relative mx-auto flex min-h-screen max-w-lg flex-col px-4 py-6 bg-zinc-950">
      {/* Big GO / countdown overlay */}
      {(preCount !== null || showGo) && (
        <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center bg-zinc-950/70">
          <p
            className={`font-black tabular-nums text-orange-500 drop-shadow-[0_0_40px_rgba(249,115,22,0.6)] ${
              showGo ? "text-8xl animate-pulse" : "text-9xl"
            }`}
          >
            {showGo ? "GO" : preCount}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <Link
          href={`/exercise/${exercise.slug}`}
          className="text-sm text-zinc-500"
          onClick={() => teardownTimer()}
        >
          Exit
        </Link>
        <p className="text-sm font-semibold text-zinc-400">
          {setIndex + 1} / {totalSets}
        </p>
      </div>

      <div className="mt-4">
        <CoachBot
          active
          muted={muted}
          onMuteChange={setMuted}
          onCommand={handleCoachCommand}
          announce={announce}
          onAnnounceConsumed={() => setAnnounce(null)}
        />
      </div>

      <div className="mt-3 flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/70 p-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={exercise.formExecImage || exercise.formImage}
          alt={`${exercise.name} execution reference`}
          className="h-14 w-14 shrink-0 rounded-lg object-cover object-center"
          width={56}
          height={56}
        />
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
            Form ref · exec
          </p>
          <p className="truncate text-xs text-zinc-400">{exercise.name}</p>
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

      <div
        className={`mt-4 rounded-2xl border p-5 ${
          isBurnout
            ? "border-red-500 bg-red-950/40 shadow-[0_0_40px_rgba(239,68,68,0.25)]"
            : "border-zinc-800 bg-zinc-900"
        }`}
      >
        <p
          className={`text-sm font-black uppercase tracking-widest ${
            isBurnout ? "text-red-400" : "text-orange-400"
          }`}
        >
          {isBurnout ? "BURNOUT — go to max" : `Working set ${setIndex + 1}`}
        </p>
        <p className="mt-1 text-zinc-400 text-sm">
          {isBurnout
            ? "Count-up only. Push until you tap Done."
            : `Target ${goal.targetSecPerSet}s · alarm at completion`}
        </p>
        <p
          className={`mt-6 text-center font-mono text-6xl font-black tabular-nums ${
            isBurnout ? "text-red-400" : "text-white"
          }`}
        >
          {displayTime}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => {
            if (countdownBusy.current) return;
            if (!timerSnap?.running) void runPreCountdown(true);
            else timerRef.current?.start();
          }}
          className="flex min-h-[56px] items-center justify-center rounded-xl bg-emerald-600 font-bold text-white active:scale-[0.97]"
        >
          Start
        </button>
        <button
          type="button"
          onClick={() => timerRef.current?.pause()}
          className="flex min-h-[56px] items-center justify-center rounded-xl bg-zinc-700 font-bold text-white active:scale-[0.97]"
        >
          Pause
        </button>
        <button
          type="button"
          onClick={() => {
            alarmFired.current = false;
            timerRef.current?.reset();
          }}
          className="flex min-h-[56px] items-center justify-center rounded-xl bg-zinc-800 font-bold text-zinc-200 active:scale-[0.97]"
        >
          Reset
        </button>
      </div>

      {exercise.tracking === "reps" && (
        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-sm font-semibold text-zinc-400">Reps this set</p>
          <div className="mt-3 flex items-center justify-center gap-6">
            <button
              type="button"
              aria-label="Decrease reps"
              onClick={() => setReps((r) => Math.max(0, r - 1))}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800 text-2xl font-bold text-white"
            >
              −
            </button>
            <span className="min-w-[4rem] text-center font-mono text-4xl font-black text-white">
              {reps}
            </span>
            <button
              type="button"
              aria-label="Increase reps"
              onClick={() => setReps((r) => r + 1)}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800 text-2xl font-bold text-white"
            >
              +
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={finishSet}
        className={`mt-auto flex min-h-[60px] w-full items-center justify-center rounded-2xl text-lg font-black ${
          isBurnout
            ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
            : "bg-orange-500 text-black"
        }`}
      >
        {isBurnout
          ? "Done — finish burnout"
          : setIndex + 1 >= totalSets
            ? "Finish set"
            : "Done — next set"}
      </button>
      <Disclaimer className="mt-4" />
    </div>
  );
}
