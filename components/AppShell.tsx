"use client";

import { useEffect, useState } from "react";
import { loadAccount } from "@/lib/account";
import { getConsent } from "@/lib/consent";
import { getExercise } from "@/lib/exercises";
import type { TodayPrescription } from "@/lib/prescription";
import { useChrome } from "./Chrome";
import { ConsentGate } from "./ConsentGate";
import { HomeClient } from "./HomeClient";
import { LoginScreen } from "./LoginScreen";
import { WorkoutClient } from "./WorkoutClient";

type Screen = "boot" | "login" | "consent" | "home" | "workout";

export function AppShell() {
  const { setHideNav } = useChrome();
  const [screen, setScreen] = useState<Screen>("boot");
  const [rx, setRx] = useState<TodayPrescription | null>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const account = loadAccount();
    if (!account) {
      setScreen("login");
      return;
    }
    if (getConsent() === null) {
      setScreen("consent");
      return;
    }
    setScreen("home");
  }, []);

  useEffect(() => {
    setHideNav(screen !== "home");
  }, [screen, setHideNav]);

  if (screen === "boot") {
    return (
      <div className="flex h-full items-center justify-center text-sm text-zinc-500">
        Loading…
      </div>
    );
  }

  if (screen === "login") {
    return (
      <LoginScreen
        onDone={() => {
          setScreen(getConsent() === null ? "consent" : "home");
        }}
      />
    );
  }

  if (screen === "consent") {
    return (
      <ConsentGate
        onAccept={() => setScreen("home")}
        onDecline={() => setScreen("home")}
      />
    );
  }

  if (screen === "workout" && rx) {
    const move = rx.moves[index];
    const exercise = move ? getExercise(move.slug) : undefined;
    if (!move || !exercise) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3">
          <p className="text-zinc-400">Nothing prescribed.</p>
          <button
            type="button"
            className="rounded-xl bg-orange-500 px-4 py-3 font-bold text-black"
            onClick={() => setScreen("home")}
          >
            Back home
          </button>
        </div>
      );
    }
    const last = index >= rx.moves.length - 1;
    return (
      <div key={`${move.slug}-${index}`} className="page-in h-full overflow-hidden">
        <WorkoutClient
          exercise={exercise}
          prescribed={move}
          modeLock={rx.mode}
          stepLabel={`Exercise ${index + 1} of ${rx.moves.length}`}
          finishLabel={last ? "Finish workout" : "Next exercise"}
          onExit={() => setScreen("home")}
          onFinished={() => {
            if (last) setScreen("home");
            else setIndex((n) => n + 1);
          }}
        />
      </div>
    );
  }

  return (
    <HomeClient
      onStart={(next) => {
        setRx(next);
        setIndex(0);
        setScreen("workout");
      }}
      onReviewConsent={() => setScreen("consent")}
    />
  );
}
