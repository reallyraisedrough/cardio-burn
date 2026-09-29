"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { saveAccount } from "@/lib/account";
import { PoseSilhouette } from "./PoseSilhouette";

export function LoginScreen({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  function continueEmail(e: FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Enter an email to continue, or use guest.");
      return;
    }
    saveAccount({ kind: "email", email: trimmed });
    onDone();
  }

  function continueGuest() {
    saveAccount({ kind: "guest" });
    onDone();
  }

  return (
    <div className="relative h-full overflow-hidden bg-zinc-950">
      <PoseSilhouette />
      <div className="relative z-10 flex h-full items-center justify-center px-4">
        <form
          onSubmit={continueEmail}
          className="page-in w-full max-w-sm rounded-3xl border border-zinc-800 bg-zinc-950/85 p-6 shadow-2xl backdrop-blur"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-400">
            Cardio Burner
          </p>
          <h1 className="mt-1 text-3xl font-black text-white">Welcome</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Local stub sign-in. Nothing is sent to a server.
          </p>
          <label className="mt-5 block text-xs font-bold uppercase tracking-wider text-zinc-500">
            Email
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(ev) => {
                setEmail(ev.target.value);
                setError(null);
              }}
              placeholder="you@example.com"
              className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-3 text-base text-white outline-none focus:border-orange-500"
            />
          </label>
          {error && (
            <p className="mt-2 text-sm text-red-400" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="mt-4 flex min-h-[52px] w-full items-center justify-center rounded-xl bg-orange-500 text-base font-bold text-black"
          >
            Continue
          </button>
          <button
            type="button"
            onClick={continueGuest}
            className="mt-2 flex min-h-[48px] w-full items-center justify-center rounded-xl border border-zinc-700 text-sm font-semibold text-zinc-200"
          >
            Continue as guest
          </button>
          <div className="mt-4 flex justify-center gap-4 text-center text-xs text-zinc-500">
            <Link href="/privacy" className="underline hover:text-zinc-300">
              Privacy draft
            </Link>
            <Link href="/data-policy" className="underline hover:text-zinc-300">
              Data-collection draft
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
