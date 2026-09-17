"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_TIMES,
  ensureDailyInspirationScheduled,
  getPermissionState,
  loadSettings,
  permissionLabel,
  sendTestNotification,
  setDailyInspirationEnabled,
  updateInspirationTimes,
  type NotificationPermissionState,
  type SlotTimes,
} from "@/lib/notifications";

export function DailyInspirationSettings() {
  const [enabled, setEnabled] = useState(false);
  const [times, setTimes] = useState<SlotTimes>({ ...DEFAULT_TIMES });
  const [permission, setPermission] =
    useState<NotificationPermissionState>("default");
  const [busy, setBusy] = useState(false);
  const [testMsg, setTestMsg] = useState<string | null>(null);

  const refresh = useCallback(() => {
    const s = loadSettings();
    setEnabled(s.enabled);
    setTimes(s.times);
    setPermission(getPermissionState());
    if (s.enabled) ensureDailyInspirationScheduled(s);
  }, []);

  useEffect(() => {
    refresh();
    const onVis = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVis);

    if ("serviceWorker" in navigator) {
      const onMsg = (event: MessageEvent) => {
        if (event.data?.type === "REARM_INSPIRATION") {
          ensureDailyInspirationScheduled();
        }
      };
      navigator.serviceWorker.addEventListener("message", onMsg);
      return () => {
        document.removeEventListener("visibilitychange", onVis);
        navigator.serviceWorker.removeEventListener("message", onMsg);
      };
    }

    return () => document.removeEventListener("visibilitychange", onVis);
  }, [refresh]);

  const onToggle = async () => {
    setBusy(true);
    setTestMsg(null);
    try {
      const next = !enabled;
      const result = await setDailyInspirationEnabled(next, times);
      setPermission(result.permission);
      setEnabled(result.ok ? next : false);
      if (next && !result.ok) {
        if (result.permission === "denied") {
          setTestMsg("Notifications blocked — enable them in browser settings.");
        } else if (result.permission === "unsupported") {
          setTestMsg("This browser does not support notifications.");
        } else {
          setTestMsg("Permission needed to enable daily inspiration.");
        }
      }
    } finally {
      setBusy(false);
    }
  };

  const onTimeChange = (slot: keyof SlotTimes, value: string) => {
    const next = { ...times, [slot]: value };
    setTimes(next);
  };

  const onTimeBlur = (slot: keyof SlotTimes) => {
    updateInspirationTimes(times);
    const saved = loadSettings();
    setTimes(saved.times);
    setEnabled(saved.enabled);
  };

  const onTest = async () => {
    setBusy(true);
    setTestMsg(null);
    try {
      const result = await sendTestNotification();
      setPermission(getPermissionState());
      setTestMsg(result.ok ? "Test notification sent." : result.error ?? "Failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-orange-400">
            Daily inspiration
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Morning, lunch, and dinner nudges — workout, fuel, recover. Opt-in
            only; we never ask silently.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Daily inspiration"
          disabled={busy || permission === "unsupported"}
          onClick={onToggle}
          className={`relative mt-0.5 h-8 w-14 shrink-0 rounded-full transition ${
            enabled ? "bg-orange-500" : "bg-zinc-700"
          } disabled:opacity-50`}
        >
          <span
            className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white transition ${
              enabled ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      <p className="mt-3 text-xs text-zinc-500">
        Permission:{" "}
        <span className="font-semibold text-zinc-300">
          {permissionLabel(permission)}
        </span>
        {permission === "denied" && (
          <span className="text-zinc-500">
            {" "}
            — reset in your browser/site settings to allow again.
          </span>
        )}
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {(
          [
            ["morning", "Morning", "Workout / start strong"],
            ["lunch", "Lunch", "Move, hydrate, fuel"],
            ["dinner", "Dinner", "Recover & plan"],
          ] as const
        ).map(([slot, label, hint]) => (
          <label key={slot} className="block rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              {label}
            </span>
            <input
              type="time"
              value={times[slot]}
              onChange={(e) => onTimeChange(slot, e.target.value)}
              onBlur={() => onTimeBlur(slot)}
              disabled={busy}
              className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-2 text-sm font-semibold text-zinc-100 outline-none focus:border-orange-500"
            />
            <span className="mt-1 block text-[11px] text-zinc-500">{hint}</span>
          </label>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={onTest}
          className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm font-semibold text-zinc-100 hover:border-orange-500/60 hover:text-orange-400 disabled:opacity-50"
        >
          Send test notification
        </button>
        {testMsg && (
          <p className="text-xs text-zinc-400" role="status">
            {testMsg}
          </p>
        )}
      </div>
    </section>
  );
}
