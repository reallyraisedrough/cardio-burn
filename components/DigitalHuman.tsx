import type { ExerciseSlug } from "@/lib/types";
import {
  buildFigure,
  type FigureTone,
  type PosePhase,
} from "@/lib/digitalHuman";

/**
 * The one digital human used everywhere a pose is shown.
 * Same body, flat fills, sharp edges. Pose comes from the exercise slug.
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
  return (
    <svg
      viewBox={fig.viewBox}
      className={className}
      role={title ? "img" : "presentation"}
      aria-label={title}
      shapeRendering="geometricPrecision"
    >
      {fig.shapes.map((shape, i) => (
        <path key={i} d={shape.d} fill={shape.fill} stroke="none" />
      ))}
    </svg>
  );
}
