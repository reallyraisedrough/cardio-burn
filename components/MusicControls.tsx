"use client";

import { useState } from "react";
import { loadMusicPrefs, setMusicEnabled, setMusicVolume } from "@/lib/music";

/** Music on/off + volume. Stored in localStorage only; nothing leaves the device. */
export function MusicControls({ className = "" }: { className?: string }) {
  // Rendered only after a client-side tap (options pane), so reading storage here is safe.
  const [enabled, setEnabled] = useState(() => loadMusicPrefs().enabled);
  const [volume, setVolume] = useState(() => Math.round(loadMusicPrefs().volume * 100));

  return (
    <div
      className={`flex min-h-[44px] items-center gap-3 rounded-xl border px-3 ${
        enabled ? "border-orange-500/60 bg-orange-500/10" : "border-zinc-700 bg-zinc-900"
      } ${className}`}
    >
      <button
        type="button"
        aria-pressed={enabled}
        onClick={() => {
          const next = !enabled;
          setEnabled(next);
          setMusicEnabled(next);
        }}
        className={`flex min-h-[40px] shrink-0 items-center gap-2 text-sm font-semibold ${
          enabled ? "text-orange-300" : "text-zinc-300"
        }`}
      >
        <span aria-hidden>♫</span>
        <span>Music</span>
        <span className="text-xs font-bold uppercase tracking-wider">{enabled ? "On" : "Off"}</span>
      </button>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={volume}
        disabled={!enabled}
        aria-label="Music volume"
        onChange={(e) => {
          const v = Number(e.target.value);
          setVolume(v);
          setMusicVolume(v / 100);
        }}
        className="h-2 min-w-0 flex-1 accent-orange-500 disabled:opacity-40"
      />
      <span className="w-9 shrink-0 text-right font-mono text-xs text-zinc-400">{volume}%</span>
    </div>
  );
}
