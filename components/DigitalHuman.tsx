import { useId } from "react";
import type { ExerciseSlug } from "@/lib/types";
import {
  buildFigure,
  figurePaints,
  type FigureTone,
  type PosePhase,
} from "@/lib/digitalHuman";

/**
 * The one digital human used everywhere a pose is shown.
 * Same person, filled and shaded: skin, hair, tank, shorts. No blur, no photo.
 * Rendered as live vector SVG (viewBox only, no fixed pixel size, no canvas),
 * so it stays crisp from a thumbnail up to a 4K screen.
 */
export function DigitalHuman({
  slug,
  phase = "exec",
  tone = "paper",
  className,
  title,
}: {
  slug: ExerciseSlug;
  phase?: PosePhase;
  tone?: FigureTone;
  className?: string;
  title?: string;
}) {
  const fig = buildFigure(slug, phase, tone);
  const uid = useId().replace(/:/g, "");
  const { paints, fillOf } = figurePaints(fig.shapes, uid);

  return (
    <svg
      viewBox={fig.viewBox}
      className={className}
      role={title ? "img" : "presentation"}
      aria-label={title}
      preserveAspectRatio="xMidYMid meet"
      shapeRendering="geometricPrecision"
    >
      <defs>
        {paints.map((paint) =>
          paint.mode === "radial" ? (
            <radialGradient key={paint.id} id={paint.id} cx="36%" cy="32%" r="72%">
              <stop offset="0%" stopColor={paint.hi} />
              <stop offset="48%" stopColor={paint.fill} />
              <stop offset="100%" stopColor={paint.lo} />
            </radialGradient>
          ) : (
            <linearGradient key={paint.id} id={paint.id} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={paint.hi} />
              <stop offset="46%" stopColor={paint.fill} />
              <stop offset="100%" stopColor={paint.lo} />
            </linearGradient>
          )
        )}
      </defs>
      {fig.shapes.map((shape, i) =>
        shape.stroke ? (
          <path
            key={i}
            d={shape.d}
            fill="none"
            stroke={shape.stroke}
            strokeWidth={shape.width}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={shape.opacity}
          />
        ) : (
          <path key={i} d={shape.d} fill={fillOf(shape)} opacity={shape.opacity} />
        )
      )}
    </svg>
  );
}
