import type { CSSProperties } from "react";
import type { ExerciseSlug } from "@/lib/types";
import { POSE_FRAMES, POSE_VERSION } from "@/lib/poseFrames";

export type PosePhase = "start" | "exec";
export type FigureTone = "paper" | "mist";

/** Public URL of the 720x1280 WebP render for one exercise phase. */
export function poseSrc(slug: ExerciseSlug, phase: PosePhase) {
  return `/poses/${slug}-${phase}.webp?v=${POSE_VERSION}`;
}

/**
 * The one digital human used everywhere a pose is shown: a realistic 3D-rendered
 * athlete (same person, outfit and lighting in every pose), pre-rendered per
 * exercise and phase. Start and exec share one camera, so switching phase is a
 * hard cut with no crossfade and no jump.
 *
 * fit="contain" shows the whole 9:16 frame; fit="crop" zooms a square container
 * onto the figure (used for small thumbnails).
 */
export function DigitalHuman({
  slug,
  phase = "exec",
  className,
  title,
  fit = "contain",
  preloadOther = false,
}: {
  slug: ExerciseSlug;
  phase?: PosePhase;
  /** Kept for API compatibility with the old vector figure. */
  tone?: FigureTone;
  className?: string;
  title?: string;
  fit?: "contain" | "crop";
  /** Also load the other phase so a phase toggle is an instant hard cut. */
  preloadOther?: boolean;
}) {
  const phases: PosePhase[] = preloadOther ? ["start", "exec"] : [phase];
  const frame = POSE_FRAMES[slug];
  let style: CSSProperties = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "contain",
  };
  if (fit === "crop" && frame) {
    // square window around the union bbox of both phases (normalised image coords)
    const [x0, y0, x1, y1] = frame;
    const ar = 16 / 9;
    const s = Math.max(x1 - x0, (y1 - y0) * ar) * 1.1;
    const cx = (x0 + x1) / 2;
    const cy = ((y0 + y1) / 2) * ar;
    style = {
      position: "absolute",
      width: `${100 / s}%`,
      height: "auto",
      maxWidth: "none",
      left: `${(0.5 - cx / s) * 100}%`,
      top: `${(0.5 - cy / s) * 100}%`,
    };
  }

  return (
    <div
      className={`relative overflow-hidden bg-[#09090b] ${className ?? ""}`}
      role={title ? "img" : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
    >
      {phases.map((p) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={p}
          src={poseSrc(slug, p)}
          alt=""
          width={720}
          height={1280}
          decoding="async"
          draggable={false}
          style={{ ...style, visibility: p === phase ? "visible" : "hidden" }}
        />
      ))}
    </div>
  );
}
