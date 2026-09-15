"use client";

import { useEffect, useState } from "react";
import { PLANS } from "@/lib/plans";
import { isUnlocked, unlockDemo, setSubscriptionActive } from "@/lib/db";
import type { PlanId } from "@/lib/types";
import { Disclaimer } from "./Disclaimer";

export function SubscribeClient() {
  const [unlocked, setUnlocked] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const hasStripeKey = Boolean(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  );

  useEffect(() => {
    isUnlocked().then(setUnlocked).catch(() => setUnlocked(false));
  }, []);

  async function handleDemoUnlock() {
    setBusy("demo");
    setMessage(null);
    try {
      await unlockDemo();
      setUnlocked(true);
      setMessage("Demo unlock active — Progress is available offline.");
    } catch {
      setMessage("Could not unlock. Try again.");
    } finally {
      setBusy(null);
    }
  }

  async function handleCheckout(planId: PlanId) {
    setBusy(planId);
    setMessage(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (data.demo || data.url === null) {
        setMessage(
          data.message ||
            "Stripe keys not configured. Use Demo unlock below."
        );
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setMessage(data.error || "Checkout failed.");
    } catch {
      setMessage("Network error starting checkout.");
    } finally {
      setBusy(null);
    }
  }

  async function handleDemoPaid() {
    await setSubscriptionActive(true);
    setUnlocked(true);
    setMessage("Marked as subscribed (local stub).");
  }

  return (
    <div className="mx-auto max-w-lg px-4 pb-28 pt-6">
      <h1 className="text-3xl font-black text-white">Go Pro</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Unlock full progress history and keep crushing goals.
      </p>

      {unlocked && (
        <div className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-400">
          You&apos;re unlocked on this device.
        </div>
      )}

      <ul className="mt-6 space-y-3">
        {PLANS.map((plan) => (
          <li
            key={plan.id}
            className={`rounded-2xl border p-4 ${
              plan.highlight
                ? "border-orange-500/60 bg-orange-500/10"
                : "border-zinc-800 bg-zinc-900"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-bold text-white">{plan.name}</p>
                <p className="text-2xl font-black text-orange-400">
                  {plan.priceLabel}
                </p>
                <p className="mt-1 text-sm text-zinc-400">{plan.description}</p>
              </div>
              {plan.highlight && (
                <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold uppercase text-black">
                  Popular
                </span>
              )}
            </div>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => handleCheckout(plan.id)}
              className="mt-4 flex min-h-[52px] w-full items-center justify-center rounded-xl bg-white font-bold text-black transition active:scale-[0.98] disabled:opacity-50 hover:bg-zinc-200"
            >
              {busy === plan.id ? "Starting…" : `Choose ${plan.priceLabel}`}
            </button>
          </li>
        ))}
      </ul>

      {!hasStripeKey && (
        <div className="mt-8 rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/50 p-5">
          <p className="text-sm font-semibold text-zinc-200">
            No Stripe keys detected
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            Add keys from <code className="text-orange-300">.env.example</code>{" "}
            for real checkout. Until then, demo unlock works fully offline.
          </p>
          <button
            type="button"
            disabled={busy !== null}
            onClick={handleDemoUnlock}
            className="mt-4 flex min-h-[52px] w-full items-center justify-center rounded-xl bg-orange-500 font-bold text-black disabled:opacity-50"
          >
            {busy === "demo" ? "Unlocking…" : "Demo unlock"}
          </button>
          <button
            type="button"
            onClick={handleDemoPaid}
            className="mt-2 w-full text-center text-xs text-zinc-500 underline"
          >
            Simulate webhook success (local stub)
          </button>
        </div>
      )}

      {hasStripeKey && !unlocked && (
        <button
          type="button"
          disabled={busy !== null}
          onClick={handleDemoUnlock}
          className="mt-6 flex min-h-[48px] w-full items-center justify-center rounded-xl border border-zinc-700 text-sm font-semibold text-zinc-300"
        >
          Demo unlock (offline)
        </button>
      )}

      {message && (
        <p className="mt-4 text-center text-sm text-zinc-300">{message}</p>
      )}

      <Disclaimer className="mt-8" />
    </div>
  );
}
