import { notFound } from "next/navigation";
import { EXERCISES, getExercise, isValidSlug } from "@/lib/exercises";
import { WorkoutClient } from "@/components/WorkoutClient";

export function generateStaticParams() {
  return EXERCISES.map((e) => ({ slug: e.slug }));
}

export default async function WorkoutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isValidSlug(slug)) notFound();
  const exercise = getExercise(slug);
  if (!exercise) notFound();
  return <WorkoutClient exercise={exercise} />;
}
