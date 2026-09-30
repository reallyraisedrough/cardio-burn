import { useId } from "react";
import type { ExerciseSlug } from "@/lib/types";
import {
  buildFigure,
  shadeOf,
  type FigureTone,
  type PosePhase,
} from "@/lib/digitalHuman";

/**
 * The one digital human used everywhere a pose is shown.
 * Same person, filled and shaded: skin, hair, tank, shorts. No blur, no photo.
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
  const paints: { key: string; id: string; fill: string; mode: "linear" | "radial" }[] = [];
  const seen = new Set<string>();
  for (const shape of fig.shapes) {
    if (shape.shade === false) continue;
    const key = `${shape.shade}:${shape.fill}`;
    if (seen.has(key)) continue;
    seen.add(key);
    paints.push({ key, id: `${uid}-${paints.length}`, fill: shape.fill, mode: shape.shade });
  }
  const ids = new Map(paints.map((p) => [p.key, p.id]));

  return (
    <svg
      viewBox={fig.viewBox}
      className={className}
      role={title ? "img" : "presentation"}
      aria-label={title}
      shapeRendering="geometricPrecision"
    >
      <defs>
        {paints.map((paint) => {
          const tone = shadeOf(paint.fill);
          if (paint.mode === "radial") {
            return (
              <radialGradient key={paint.id} id={paint.id} cx="36%" cy="32%" r="72%">
                <stop offset="0%" stopColor={tone.hi} />
                <stop offset="48%" stopColor={paint.fill} />
                <stop offset="100%" stopColor={tone.lo} />
              </radialGradient>
            );
          }
          return (
            <linearGradient key={paint.id} id={paint.id} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={tone.hi} />
              <stop offset="46%" stopColor={paint.fill} />
              <stop offset="100%" stopColor={tone.lo} />
            </linearGradient>
          );
        })}
      </defs>
      {fig.shapes.map((shape, i) => (
        <path
          key={i}
          d={shape.d}
          fill={
            shape.shade === false ? shape.fill : `url(#${ids.get(`${shape.shade}:${shape.fill}`)})`
          }
        />
      ))}
    </svg>
  );
}
