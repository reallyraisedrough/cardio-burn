"use client";

import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import { canStoreWorkoutData } from "./consent";
import type { WorkoutSession } from "./types";

interface CardioDB extends DBSchema {
  sessions: {
    key: string;
    value: WorkoutSession;
    indexes: { "by-exercise": string; "by-date": string };
  };
  meta: {
    key: string;
    value: string | boolean | number;
  };
}

const DB_NAME = "cardio-burner";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<CardioDB>> | null = null;

function assertStorage() {
  if (!canStoreWorkoutData()) {
    throw new Error("CONSENT_REQUIRED");
  }
}

function getDb() {
  if (typeof window === "undefined") {
    throw new Error("IndexedDB is only available in the browser");
  }
  assertStorage();
  if (!dbPromise) {
    dbPromise = openDB<CardioDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore("sessions", { keyPath: "id" });
        store.createIndex("by-exercise", "exerciseSlug");
        store.createIndex("by-date", "completedAt");
        db.createObjectStore("meta");
      },
    });
  }
  return dbPromise;
}

export async function saveSession(session: WorkoutSession): Promise<void> {
  const db = await getDb();
  await db.put("sessions", session);
}

export async function getAllSessions(): Promise<WorkoutSession[]> {
  if (!canStoreWorkoutData()) return [];
  const db = await getDb();
  const all = await db.getAll("sessions");
  return all.sort(
    (a, b) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );
}

export async function getSessionsForExercise(
  slug: string
): Promise<WorkoutSession[]> {
  if (!canStoreWorkoutData()) return [];
  const db = await getDb();
  const rows = await db.getAllFromIndex("sessions", "by-exercise", slug);
  return rows.sort(
    (a, b) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );
}

export async function getLastSession(
  slug: string
): Promise<WorkoutSession | null> {
  const sessions = await getSessionsForExercise(slug);
  return sessions[0] ?? null;
}

export async function setMeta(
  key: string,
  value: string | boolean | number
): Promise<void> {
  const db = await getDb();
  await db.put("meta", value, key);
}

export async function getMeta<T extends string | boolean | number>(
  key: string
): Promise<T | undefined> {
  const db = await getDb();
  return (await db.get("meta", key)) as T | undefined;
}

const DEMO_UNLOCK_KEY = "demoUnlocked";
const SUB_KEY = "subscriptionActive";

export async function isUnlocked(): Promise<boolean> {
  if (!canStoreWorkoutData()) return false;
  try {
    const demo = await getMeta<boolean>(DEMO_UNLOCK_KEY);
    const sub = await getMeta<boolean>(SUB_KEY);
    return Boolean(demo || sub);
  } catch {
    return false;
  }
}

export async function unlockDemo(): Promise<void> {
  await setMeta(DEMO_UNLOCK_KEY, true);
}

export async function setSubscriptionActive(active: boolean): Promise<void> {
  await setMeta(SUB_KEY, active);
}

/** localStorage fallback helpers for simple flags when needed */
export function lsGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(`cb:${key}`);
  } catch {
    return null;
  }
}

export function lsSet(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`cb:${key}`, value);
  } catch {
    /* ignore */
  }
}
