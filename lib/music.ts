/**
 * Workout music: royalty-free (CC0) tracks in /public/music, played with one
 * HTMLAudioElement. Loops the playlist, ducks to ~25% while the coach speaks,
 * and pauses with the workout. Settings live in localStorage only.
 * See public/music/ATTRIBUTION.md for sources and licenses.
 */

export type MusicTrack = { src: string; title: string; artist: string };

export const MUSIC_PLAYLIST: MusicTrack[] = [
  { src: "/music/empacotatron.mp3", title: "Empacotatron", artist: "Fupi" },
  { src: "/music/chiptune-adventures-stage-1.mp3", title: "Stage 1", artist: "Juhani Junkala" },
  { src: "/music/160bpm-electronic-loop.mp3", title: "160BPM Electronic Loop", artist: "RUOK" },
  { src: "/music/city-loop.mp3", title: "City Loop", artist: "wipics" },
  { src: "/music/chiptune-adventures-boss-fight.mp3", title: "Boss Fight", artist: "Juhani Junkala" },
];

const ON_KEY = "cardio-burner-music-on";
const VOLUME_KEY = "cardio-burner-music-volume";
const DEFAULT_VOLUME = 0.6;
/** Music level while the coach is talking, as a fraction of the user volume. */
export const DUCK_LEVEL = 0.25;
const FADE_MS = 220;

export type MusicPrefs = { enabled: boolean; volume: number };

function clamp01(v: number): number {
  if (!Number.isFinite(v)) return DEFAULT_VOLUME;
  return Math.min(1, Math.max(0, v));
}

export function loadMusicPrefs(): MusicPrefs {
  if (typeof window === "undefined") return { enabled: true, volume: DEFAULT_VOLUME };
  try {
    const on = localStorage.getItem(ON_KEY);
    const vol = localStorage.getItem(VOLUME_KEY);
    return {
      enabled: on === null ? true : on === "1",
      volume: vol === null ? DEFAULT_VOLUME : clamp01(Number(vol)),
    };
  } catch {
    return { enabled: true, volume: DEFAULT_VOLUME };
  }
}

function savePref(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* private mode: keep in memory only */
  }
}

type Engine = {
  audio: HTMLAudioElement;
  gain: GainNode | null;
  ctx: AudioContext | null;
};

let engine: Engine | null = null;
let trackIndex = 0;
/** The workout wants music (started and not paused/ended). */
let wanted = false;
let ducked = false;
let prefs: MusicPrefs | null = null;
let fadeTimer: number | null = null;
let level = 0;

function currentPrefs(): MusicPrefs {
  if (!prefs) prefs = loadMusicPrefs();
  return prefs;
}

function targetLevel(): number {
  const p = currentPrefs();
  return p.volume * (ducked ? DUCK_LEVEL : 1);
}

function applyLevel(v: number) {
  level = v;
  if (!engine) return;
  if (engine.gain && engine.ctx) {
    engine.gain.gain.setValueAtTime(v, engine.ctx.currentTime);
  } else {
    engine.audio.volume = clamp01(v);
  }
}

/** Short linear fade so ducking never clicks. */
function fadeTo(target: number, ms = FADE_MS) {
  if (fadeTimer !== null) window.clearInterval(fadeTimer);
  const from = level;
  const steps = Math.max(1, Math.round(ms / 20));
  let i = 0;
  fadeTimer = window.setInterval(() => {
    i++;
    applyLevel(from + ((target - from) * i) / steps);
    if (i >= steps && fadeTimer !== null) {
      window.clearInterval(fadeTimer);
      fadeTimer = null;
    }
  }, 20);
}

function loadTrack(index: number) {
  if (!engine) return;
  trackIndex = ((index % MUSIC_PLAYLIST.length) + MUSIC_PLAYLIST.length) % MUSIC_PLAYLIST.length;
  engine.audio.src = MUSIC_PLAYLIST[trackIndex].src;
}

function ensureEngine(): Engine | null {
  if (typeof window === "undefined") return null;
  if (engine) return engine;
  const audio = new Audio();
  audio.preload = "auto";
  audio.loop = false;
  audio.setAttribute("playsinline", "");
  audio.addEventListener("ended", () => {
    loadTrack(trackIndex + 1);
    if (wanted) void playNow();
  });
  audio.addEventListener("error", () => {
    // Skip a track that fails to load instead of going silent.
    if (!wanted) return;
    loadTrack(trackIndex + 1);
    void playNow();
  });

  // iOS ignores HTMLAudioElement.volume, so route through a GainNode when we can.
  let ctx: AudioContext | null = null;
  let gain: GainNode | null = null;
  try {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AC) {
      ctx = new AC();
      const source = ctx.createMediaElementSource(audio);
      gain = ctx.createGain();
      source.connect(gain);
      gain.connect(ctx.destination);
    }
  } catch {
    ctx = null;
    gain = null;
  }
  engine = { audio, gain, ctx };
  loadTrack(Math.floor(Math.random() * MUSIC_PLAYLIST.length));
  applyLevel(0);
  return engine;
}

async function playNow() {
  const e = ensureEngine();
  if (!e || !wanted || !currentPrefs().enabled) return;
  try {
    if (e.ctx && e.ctx.state === "suspended") await e.ctx.resume();
  } catch {
    /* resume can fail outside a gesture; the next tap retries */
  }
  try {
    await e.audio.play();
    fadeTo(targetLevel(), 400);
  } catch {
    /* autoplay blocked until the next user gesture */
  }
}

/**
 * Start workout music. Call directly inside a tap handler (the Begin / Start
 * workout button) so iOS and Chrome allow audio playback.
 */
export function startMusic(): void {
  if (!currentPrefs().enabled) return;
  wanted = true;
  const e = ensureEngine();
  if (!e) return;
  // Kick play() synchronously within the gesture; playNow() finishes the fade-in.
  if (e.ctx && e.ctx.state === "suspended") void e.ctx.resume().catch(() => {});
  void playNow();
}

/** Resume after a pause (also called from tap handlers). */
export function resumeMusic(): void {
  startMusic();
}

/** Pause with the workout; position is kept for resume. */
export function pauseMusic(): void {
  wanted = false;
  if (fadeTimer !== null) {
    window.clearInterval(fadeTimer);
    fadeTimer = null;
  }
  if (!engine) return;
  engine.audio.pause();
  applyLevel(0);
}

/** Workout over (summary, exit, unmount). Next workout picks up on the next track. */
export function stopMusic(): void {
  const wasPlaying = Boolean(engine && !engine.audio.paused);
  pauseMusic();
  if (engine && wasPlaying) loadTrack(trackIndex + 1);
}

export function isMusicPlaying(): boolean {
  return Boolean(engine && !engine.audio.paused);
}

/** Coach started talking: drop music to ~25%. */
export function duckMusic(): void {
  if (ducked) return;
  ducked = true;
  if (engine && !engine.audio.paused) fadeTo(targetLevel());
}

/** Coach finished: bring music back up. */
export function unduckMusic(): void {
  if (!ducked) return;
  ducked = false;
  if (engine && !engine.audio.paused) fadeTo(targetLevel(), 450);
}

export function setMusicEnabled(on: boolean): void {
  prefs = { ...currentPrefs(), enabled: on };
  savePref(ON_KEY, on ? "1" : "0");
  if (!on) {
    const keep = wanted;
    pauseMusic();
    wanted = keep;
  } else if (wanted) {
    void playNow();
  }
}

export function setMusicVolume(volume: number): void {
  const v = clamp01(volume);
  prefs = { ...currentPrefs(), volume: v };
  savePref(VOLUME_KEY, String(v));
  if (engine && !engine.audio.paused) fadeTo(targetLevel(), 80);
}
