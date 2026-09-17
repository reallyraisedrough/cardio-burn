/**
 * Daily inspirational local notifications (morning / lunch / dinner).
 * Permission is opt-in only. Scheduling uses a client setTimeout chain plus
 * Service Worker showNotification; prefs live in localStorage.
 */

export type InspirationSlot = "morning" | "lunch" | "dinner";

export interface SlotTimes {
  morning: string; // "HH:MM" 24h local
  lunch: string;
  dinner: string;
}

export interface DailyInspirationSettings {
  enabled: boolean;
  times: SlotTimes;
}

export type NotificationPermissionState =
  | "granted"
  | "denied"
  | "default"
  | "unsupported";

const STORAGE_KEY = "cardio-burner-daily-inspiration";
const LAST_SHOWN_KEY = "cardio-burner-daily-inspiration-last-shown";

export const DEFAULT_TIMES: SlotTimes = {
  morning: "07:00",
  lunch: "12:00",
  dinner: "18:00",
};

const DEFAULT_SETTINGS: DailyInspirationSettings = {
  enabled: false,
  times: { ...DEFAULT_TIMES },
};

/** Short Drive-voice lines — no medical claims. */
const MESSAGES: Record<InspirationSlot, string[]> = {
  morning: [
    "Morning. Train today — start strong.",
    "Clock's ticking. Get after the work.",
    "Fresh day. Move first, excuses later.",
    "Rise and grind — one solid session.",
    "Consistency beats perfection. Start now.",
    "Hydrate, then hit your plan.",
    "Your future self wants today's work done.",
    "No drama. Show up and train.",
  ],
  lunch: [
    "Midday check: stand up, move, hydrate.",
    "Fuel smart — protein + real food.",
    "Lunch window: walk it off, drink water.",
    "Solid fuel in, empty sugar out.",
    "Stay consistent — small moves still count.",
    "Hydrate hard. Afternoon you will thank you.",
    "Choose the plate that fuels the work.",
    "Reset: breathe, stretch, keep the streak alive.",
  ],
  dinner: [
    "Evening: recover, protein, plan tomorrow.",
    "Rest is part of the program — use it.",
    "Dinner with purpose. Rebuild for tomorrow.",
    "Wind down strong. Hydrate. Sleep wins.",
    "Lay out tomorrow's session before you crash.",
    "Protein + chill. Consistency compounds.",
    "Recover tonight so you can push tomorrow.",
    "Close the day clean. Tomorrow you train.",
  ],
};

const SLOT_TITLES: Record<InspirationSlot, string> = {
  morning: "Cardio Burner — Morning",
  lunch: "Cardio Burner — Midday",
  dinner: "Cardio Burner — Evening",
};

const SLOT_URL: Record<InspirationSlot, string> = {
  morning: "/",
  lunch: "/",
  dinner: "/plan",
};

/** Active timeout handles (module scope — one scheduler per tab). */
const pendingTimers = new Map<InspirationSlot, ReturnType<typeof setTimeout>>();

function parseHHMM(value: string): { h: number; m: number } | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return { h, m: min };
}

export function normalizeTimeInput(value: string): string | null {
  const parsed = parseHHMM(value);
  if (!parsed) return null;
  return `${String(parsed.h).padStart(2, "0")}:${String(parsed.m).padStart(2, "0")}`;
}

export function getPermissionState(): NotificationPermissionState {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission as NotificationPermissionState;
}

export function loadSettings(): DailyInspirationSettings {
  if (typeof window === "undefined") return { ...DEFAULT_SETTINGS, times: { ...DEFAULT_TIMES } };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS, times: { ...DEFAULT_TIMES } };
    const parsed = JSON.parse(raw) as Partial<DailyInspirationSettings>;
    return {
      enabled: Boolean(parsed.enabled),
      times: {
        morning: normalizeTimeInput(parsed.times?.morning ?? "") ?? DEFAULT_TIMES.morning,
        lunch: normalizeTimeInput(parsed.times?.lunch ?? "") ?? DEFAULT_TIMES.lunch,
        dinner: normalizeTimeInput(parsed.times?.dinner ?? "") ?? DEFAULT_TIMES.dinner,
      },
    };
  } catch {
    return { ...DEFAULT_SETTINGS, times: { ...DEFAULT_TIMES } };
  }
}

export function saveSettings(settings: DailyInspirationSettings): void {
  if (typeof window === "undefined") return;
  const next: DailyInspirationSettings = {
    enabled: Boolean(settings.enabled),
    times: {
      morning: normalizeTimeInput(settings.times.morning) ?? DEFAULT_TIMES.morning,
      lunch: normalizeTimeInput(settings.times.lunch) ?? DEFAULT_TIMES.lunch,
      dinner: normalizeTimeInput(settings.times.dinner) ?? DEFAULT_TIMES.dinner,
    },
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function pickMessage(slot: InspirationSlot): string {
  const bank = MESSAGES[slot];
  const i = Math.floor(Math.random() * bank.length);
  return bank[i]!;
}

function nextOccurrenceMs(hhmm: string, from = Date.now()): number {
  const parsed = parseHHMM(hhmm) ?? parseHHMM(DEFAULT_TIMES.morning)!;
  const d = new Date(from);
  d.setHours(parsed.h, parsed.m, 0, 0);
  if (d.getTime() <= from) {
    d.setDate(d.getDate() + 1);
  }
  return d.getTime();
}

function loadLastShown(): Partial<Record<InspirationSlot, string>> {
  try {
    const raw = localStorage.getItem(LAST_SHOWN_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<Record<InspirationSlot, string>>;
  } catch {
    return {};
  }
}

function markShown(slot: InspirationSlot): void {
  const dayKey = new Date().toISOString().slice(0, 10);
  const map = loadLastShown();
  map[slot] = dayKey;
  localStorage.setItem(LAST_SHOWN_KEY, JSON.stringify(map));
}

function alreadyShownToday(slot: InspirationSlot): boolean {
  const dayKey = new Date().toISOString().slice(0, 10);
  return loadLastShown()[slot] === dayKey;
}

async function showViaServiceWorker(
  title: string,
  body: string,
  slot: InspirationSlot
): Promise<boolean> {
  if (!("serviceWorker" in navigator)) return false;
  try {
    const reg = await navigator.serviceWorker.ready;
    const options: NotificationOptions = {
      body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag: `cardio-burner-${slot}`,
      
      data: { url: SLOT_URL[slot], slot },
    };
    // Prefer SW registration.showNotification
    if (reg.showNotification) {
      await reg.showNotification(title, options);
      return true;
    }
    // Ask SW to show (message handler)
    const sw = navigator.serviceWorker.controller;
    if (sw) {
      sw.postMessage({
        type: "SHOW_NOTIFICATION",
        title,
        options,
      });
      return true;
    }
  } catch {
    /* fall through */
  }
  return false;
}

async function showInspiration(slot: InspirationSlot): Promise<void> {
  if (getPermissionState() !== "granted") return;
  if (alreadyShownToday(slot)) return;

  const title = SLOT_TITLES[slot];
  const body = pickMessage(slot);
  const viaSw = await showViaServiceWorker(title, body, slot);
  if (!viaSw && "Notification" in window) {
    try {
      new Notification(title, {
        body,
        icon: "/icons/icon-192.png",
        tag: `cardio-burner-${slot}`,
        data: { url: SLOT_URL[slot], slot },
      });
    } catch {
      return;
    }
  }
  markShown(slot);
}

function clearTimers(): void {
  for (const t of pendingTimers.values()) clearTimeout(t);
  pendingTimers.clear();
}

function armSlot(slot: InspirationSlot, hhmm: string): void {
  const existing = pendingTimers.get(slot);
  if (existing) clearTimeout(existing);

  const fireAt = nextOccurrenceMs(hhmm);
  const delay = Math.max(0, fireAt - Date.now());
  // Cap single timeout to ~24h; browsers may clamp long delays anyway
  const capped = Math.min(delay, 24 * 60 * 60 * 1000);

  const handle = setTimeout(async () => {
    pendingTimers.delete(slot);
    const settings = loadSettings();
    if (!settings.enabled) return;
    await showInspiration(slot);
    // Re-arm for next day
    armSlot(slot, settings.times[slot]);
  }, capped);

  pendingTimers.set(slot, handle);
}

/** Cancel all pending inspiration timers. */
export function cancelScheduledInspiration(): void {
  clearTimers();
}

/**
 * Ensure next morning / lunch / dinner notifications are armed.
 * Call on page load, after enabling, or after time edits.
 */
export function ensureDailyInspirationScheduled(
  settings?: DailyInspirationSettings
): void {
  if (typeof window === "undefined") return;
  const s = settings ?? loadSettings();
  clearTimers();
  if (!s.enabled || getPermissionState() !== "granted") return;

  (["morning", "lunch", "dinner"] as InspirationSlot[]).forEach((slot) => {
    armSlot(slot, s.times[slot]);
  });

  // Best-effort: ask SW to keep prefs / try periodicsync nudge
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready
      .then((reg) => {
        navigator.serviceWorker.controller?.postMessage({
          type: "SYNC_INSPIRATION_PREFS",
          enabled: s.enabled,
          times: s.times,
        });
        const ps = (
          reg as ServiceWorkerRegistration & {
            periodicSync?: { register: (tag: string, opts: { minInterval: number }) => Promise<void> };
          }
        ).periodicSync;
        if (ps?.register) {
          ps.register("daily-inspiration", { minInterval: 12 * 60 * 60 * 1000 }).catch(() => {
            /* optional */
          });
        }
      })
      .catch(() => {
        /* optional */
      });
  }
}

/** Request permission (must be from a user gesture). Returns final state. */
export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  try {
    const result = await Notification.requestPermission();
    return result as NotificationPermissionState;
  } catch {
    return getPermissionState();
  }
}

/** Enable toggle flow: request permission if needed, persist, schedule. */
export async function setDailyInspirationEnabled(
  enabled: boolean,
  times?: SlotTimes
): Promise<{ ok: boolean; permission: NotificationPermissionState }> {
  const current = loadSettings();
  const nextTimes = times ?? current.times;

  if (!enabled) {
    const next = { enabled: false, times: nextTimes };
    saveSettings(next);
    cancelScheduledInspiration();
    return { ok: true, permission: getPermissionState() };
  }

  let permission = getPermissionState();
  if (permission === "default") {
    permission = await requestNotificationPermission();
  }
  if (permission !== "granted") {
    saveSettings({ enabled: false, times: nextTimes });
    cancelScheduledInspiration();
    return { ok: false, permission };
  }

  const next = { enabled: true, times: nextTimes };
  saveSettings(next);
  ensureDailyInspirationScheduled(next);
  return { ok: true, permission };
}

export function updateInspirationTimes(times: SlotTimes): void {
  const current = loadSettings();
  const next = {
    enabled: current.enabled,
    times: {
      morning: normalizeTimeInput(times.morning) ?? current.times.morning,
      lunch: normalizeTimeInput(times.lunch) ?? current.times.lunch,
      dinner: normalizeTimeInput(times.dinner) ?? current.times.dinner,
    },
  };
  saveSettings(next);
  ensureDailyInspirationScheduled(next);
}

/** Immediate test notification (user gesture). */
export async function sendTestNotification(): Promise<{ ok: boolean; error?: string }> {
  const permission = getPermissionState();
  if (permission === "unsupported") {
    return { ok: false, error: "Notifications not supported in this browser." };
  }
  if (permission !== "granted") {
    const next = await requestNotificationPermission();
    if (next !== "granted") {
      return { ok: false, error: "Permission not granted." };
    }
  }

  const title = "Cardio Burner — Test";
  const body = pickMessage("morning");
  const viaSw = await showViaServiceWorker(title, body, "morning");
  if (!viaSw && "Notification" in window) {
    try {
      new Notification(title, {
        body,
        icon: "/icons/icon-192.png",
        tag: "cardio-burner-test",
        data: { url: "/" },
      });
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Failed to show" };
    }
  }
  return { ok: true };
}

export function permissionLabel(state: NotificationPermissionState): string {
  switch (state) {
    case "granted":
      return "Granted";
    case "denied":
      return "Denied";
    case "default":
      return "Not asked";
    case "unsupported":
      return "Unsupported";
  }
}
