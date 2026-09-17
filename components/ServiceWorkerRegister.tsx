"use client";

import { useEffect } from "react";
import {
  ensureDailyInspirationScheduled,
  loadSettings,
} from "@/lib/notifications";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js")
      .then(() => {
        const settings = loadSettings();
        if (settings.enabled) ensureDailyInspirationScheduled(settings);
      })
      .catch(() => {
        /* optional */
      });

    const onMsg = (event: MessageEvent) => {
      if (event.data?.type === "REARM_INSPIRATION") {
        ensureDailyInspirationScheduled();
      }
    };
    navigator.serviceWorker.addEventListener("message", onMsg);
    return () => navigator.serviceWorker.removeEventListener("message", onMsg);
  }, []);
  return null;
}
