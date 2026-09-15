import Link from "next/link";
import { DISCLAIMER } from "@/lib/exercises";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-8 pb-28">
      <Link href="/" className="text-sm text-zinc-400">
        ← Home
      </Link>
      <h1 className="mt-4 text-3xl font-black text-white">Terms</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-zinc-300">
        <p>
          By using Cardio Burner you agree that workouts are provided for
          general fitness entertainment only.
        </p>
        <p className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-zinc-400">
          {DISCLAIMER}
        </p>
        <p>
          Subscriptions renew according to the plan you select until canceled.
          Lifetime unlocks are device-local unless otherwise stated at purchase.
        </p>
        <p>
          Demo unlock is for evaluation and may be reset if you clear site data.
        </p>
      </div>
    </div>
  );
}
