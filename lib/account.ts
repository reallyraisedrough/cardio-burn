/** Stub account on this device. Not a real auth server. */

export type Account =
  | { kind: "email"; email: string }
  | { kind: "guest" };

const KEY = "cb:account";

export function loadAccount(): Account | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Account;
    if (parsed?.kind === "guest") return { kind: "guest" };
    if (
      parsed?.kind === "email" &&
      typeof parsed.email === "string" &&
      parsed.email.includes("@")
    ) {
      return { kind: "email", email: parsed.email };
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function saveAccount(account: Account): void {
  localStorage.setItem(KEY, JSON.stringify(account));
}
