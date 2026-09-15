import { DISCLAIMER } from "@/lib/exercises";

export function Disclaimer({ className = "" }: { className?: string }) {
  return (
    <p
      className={`text-[11px] leading-relaxed text-zinc-500 ${className}`}
      role="note"
    >
      {DISCLAIMER}
    </p>
  );
}
