"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useChrome } from "./Chrome";

const links = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/plan", label: "Plan", icon: "📅" },
  { href: "/progress", label: "Progress", icon: "📈" },
  { href: "/subscribe", label: "Pro", icon: "⚡" },
];

export function Nav() {
  const pathname = usePathname();
  const { hideNav } = useChrome();
  const hide =
    hideNav ||
    pathname?.startsWith("/workout/") ||
    pathname === "/privacy" ||
    pathname === "/terms";

  if (hide) return null;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-lg items-stretch justify-around">
        {links.map((l) => {
          const active =
            l.href === "/"
              ? pathname === "/"
              : pathname?.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex min-h-[64px] flex-1 flex-col items-center justify-center gap-0.5 text-xs font-semibold transition ${
                active ? "text-orange-400" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <span className="text-xl" aria-hidden>
                {l.icon}
              </span>
              {l.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
