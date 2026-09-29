"use client";

import Link from "next/link";
import { acceptConsent, declineConsent } from "@/lib/consent";

export function ConsentGate({
  onAccept,
  onDecline,
}: {
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <div className="page-in flex h-full flex-col overflow-hidden bg-zinc-950 px-4 py-6">
      <div className="mx-auto flex h-full w-full max-w-lg flex-col overflow-hidden">
        <p className="text-xs font-semibold uppercase tracking-widest text-orange-400">
          Data notice
        </p>
        <h1 className="mt-1 text-3xl font-black text-white">
          Before anything is saved
        </h1>
        <div className="mt-4 flex-1 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
          <p className="text-sm font-semibold text-zinc-200">
            Stored on this device only:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-zinc-300">
            <li>Workout times, sets, and reps</li>
            <li>Your mode</li>
            <li>Local progress</li>
            <li>Optional account email if you log in</li>
          </ul>
          <p className="mt-4 text-sm font-semibold leading-snug text-white">
            Data is not sold, traded, or viewed by the creator or anyone who
            built the app.
          </p>
          <p className="mt-3 text-xs leading-relaxed text-zinc-500">
            Not now still lets you browse. Workout history will not be saved
            until you accept.
          </p>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              acceptConsent();
              onAccept();
            }}
            className="flex min-h-[52px] w-full items-center justify-center rounded-xl bg-orange-500 text-base font-bold text-black"
          >
            Accept and continue
          </button>
          <button
            type="button"
            onClick={() => {
              declineConsent();
              onDecline();
            }}
            className="flex min-h-[48px] w-full items-center justify-center rounded-xl border border-zinc-700 text-sm font-semibold text-zinc-200"
          >
            Not now
          </button>
          <Link
            href="/privacy"
            className="flex min-h-[40px] items-center justify-center text-xs text-zinc-500 underline"
          >
            Privacy
          </Link>
        </div>
      </div>
    </div>
  );
}
