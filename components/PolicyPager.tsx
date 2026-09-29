"use client";

import Link from "next/link";
import { useState } from "react";

type PolicyStep = {
  eyebrow: string;
  title: string;
  body: string;
  bullets?: string[];
};

export function PolicyPager({
  title,
  description,
  steps,
}: {
  title: string;
  description: string;
  steps: PolicyStep[];
}) {
  const [step, setStep] = useState(0);
  const current = steps[step];
  const isFirst = step === 0;
  const isLast = step === steps.length - 1;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-zinc-950 px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-lg flex-col">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-200">
            ← Home
          </Link>
          <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Draft policy
          </span>
        </div>

        <div className="mt-6 flex min-h-0 flex-1 flex-col">
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-400">
            {current.eyebrow}
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
            {step === 0 ? title : current.title}
          </h1>
          {step === 0 ? (
            <p className="mt-3 text-sm leading-relaxed text-zinc-300">{description}</p>
          ) : (
            <p className="mt-3 text-sm leading-relaxed text-zinc-300">{current.body}</p>
          )}

          {current.bullets && (
            <ul className="mt-6 space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 text-sm leading-relaxed text-zinc-200">
              {current.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          )}

          {step === 0 && (
            <div className="mt-6 rounded-2xl border border-orange-500/40 bg-orange-500/10 p-4 text-sm leading-relaxed text-orange-100">
              This is a plain-language draft, not legal advice. A lawyer should
              review it before any App Store or Google Play submission.
            </div>
          )}

          <div className="mt-auto pt-6">
            <div className="mb-4 flex items-center justify-between text-xs text-zinc-500">
              <span>
                Step {step + 1} of {steps.length}
              </span>
              <span aria-hidden>{"●".repeat(step + 1)}{"○".repeat(steps.length - step - 1)}</span>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep((value) => Math.max(0, value - 1))}
                disabled={isFirst}
                className="min-h-[50px] flex-1 rounded-xl border border-zinc-700 px-4 text-sm font-semibold text-zinc-200 disabled:cursor-not-allowed disabled:opacity-35"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep((value) => Math.min(steps.length - 1, value + 1))}
                disabled={isLast}
                className="min-h-[50px] flex-1 rounded-xl bg-orange-500 px-4 text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-35"
              >
                Next
              </button>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-center text-xs text-zinc-500">
              <Link href="/privacy" className="underline hover:text-zinc-300">
                Privacy draft
              </Link>
              <Link href="/data-policy" className="underline hover:text-zinc-300">
                Data-collection draft
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
