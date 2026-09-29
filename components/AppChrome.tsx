"use client";

import type { ReactNode } from "react";
import { ChromeProvider } from "./Chrome";
import { Nav } from "./Nav";

export function AppChrome({ children }: { children: ReactNode }) {
  return (
    <ChromeProvider>
      <main className="min-h-0 flex-1 overflow-hidden">{children}</main>
      <Nav />
    </ChromeProvider>
  );
}
