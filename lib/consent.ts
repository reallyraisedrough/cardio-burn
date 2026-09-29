/** Local-only data notice. Acceptance lives in localStorage, never a server. */

export type ConsentChoice = "accepted" | "declined";

const KEY = "cb:data-consent";

export function getConsent(): ConsentChoice | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(KEY);
    if (v === "accepted" || v === "declined") return v;
  } catch {
    /* ignore */
  }
  return null;
}

/** IndexedDB workout writes (and reads that would create the DB) require acceptance. */
export function canStoreWorkoutData(): boolean {
  return getConsent() === "accepted";
}

export function acceptConsent(): void {
  localStorage.setItem(KEY, "accepted");
}

export function declineConsent(): void {
  localStorage.setItem(KEY, "declined");
}
