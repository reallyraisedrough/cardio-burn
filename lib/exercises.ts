import type { Exercise, ExerciseSlug } from "./types";
export type { Exercise, ExerciseSlug } from "./types";

export const EXERCISES: Exercise[] = [
  {
    slug: "planks",
    name: "Planks",
    emoji: "🧱",
    description: "Isometric core hold — build a rock-solid midline.",
    formCues: [
      "Elbows under shoulders, forearms flat on the floor.",
      "Body in one straight line from head to heels.",
      "Squeeze glutes and brace your midsection.",
      "Keep neck neutral — gaze slightly ahead of your hands.",
      "Breathe steadily; don't hold your breath.",
    ],
    defaultSetDurationSec: 40,
    tracking: "timed",
  },
  {
    slug: "burpees",
    name: "Burpees",
    emoji: "🔥",
    description: "Full-body cardio blaster — squat, plank, jump.",
    formCues: [
      "Drop into a squat and plant hands on the floor.",
      "Jump or step feet back to a strong plank.",
      "Chest can kiss the floor, then push up.",
      "Jump feet forward under your hips.",
      "Explode up with a soft landing.",
      "Keep a smooth rhythm — quality over frantic speed.",
    ],
    defaultSetDurationSec: 45,
    tracking: "reps",
    defaultReps: 10,
  },
  {
    slug: "jogging",
    name: "Jogging",
    emoji: "🏃",
    description: "Steady-state cardio to build engine and endurance.",
    formCues: [
      "Land softly midfoot, not heavy on the heels.",
      "Keep a slight forward lean from the ankles.",
      "Relax shoulders; swing arms naturally.",
      "Breathe in a comfortable rhythmic pattern.",
      "Maintain an easy conversational pace for working sets.",
    ],
    defaultSetDurationSec: 90,
    tracking: "timed",
  },
  {
    slug: "dips",
    name: "Dips",
    emoji: "💪",
    description: "Triceps and chest pressing using a chair or parallel bars.",
    formCues: [
      "Hands on a sturdy surface, fingers forward.",
      "Lower with control until elbows are about 90°.",
      "Keep elbows tracking slightly back, not flaring wide.",
      "Press up by driving through your palms.",
      "Stay tall through the chest; avoid shrugging.",
    ],
    defaultSetDurationSec: 40,
    tracking: "reps",
    defaultReps: 12,
  },
  {
    slug: "lunges",
    name: "Lunges",
    emoji: "🦵",
    description: "Unilateral leg strength and balance.",
    formCues: [
      "Step forward and lower until both knees bend ~90°.",
      "Front knee tracks over mid-foot, not past toes aggressively.",
      "Back knee floats just above the floor.",
      "Drive through the front heel to stand.",
      "Keep torso upright and core braced.",
      "Alternate legs or finish one side then the other.",
    ],
    defaultSetDurationSec: 45,
    tracking: "reps",
    defaultReps: 16,
  },
  {
    slug: "squats",
    name: "Squats",
    emoji: "🏋️",
    description: "Foundational lower-body strength mover.",
    formCues: [
      "Feet about shoulder-width, toes slightly out.",
      "Sit hips back and down like into a chair.",
      "Keep chest proud and heels planted.",
      "Knees track in line with toes.",
      "Stand by driving through midfoot and squeezing glutes.",
    ],
    defaultSetDurationSec: 45,
    tracking: "reps",
    defaultReps: 15,
  },
  {
    slug: "push-ups",
    name: "Push-ups",
    emoji: "🫸",
    description: "Classic upper-body push for chest, shoulders, triceps.",
    formCues: [
      "Hands under shoulders, body in a rigid plank.",
      "Lower chest toward the floor with control.",
      "Elbows ~45° from your torso.",
      "Press up without sagging hips or piked butt.",
      "Modify on knees if needed — keep the same line.",
    ],
    defaultSetDurationSec: 40,
    tracking: "reps",
    defaultReps: 12,
  },
  {
    slug: "sit-ups",
    name: "Sit-ups",
    emoji: "🧘",
    description: "Core flexion for abdominal endurance.",
    formCues: [
      "Lie on your back, knees bent, feet planted.",
      "Lightly support the head — don't yank the neck.",
      "Curl shoulders up using your abs, not momentum.",
      "Exhale on the way up; inhale on the way down.",
      "Control the descent — no collapsing.",
    ],
    defaultSetDurationSec: 40,
    tracking: "reps",
    defaultReps: 15,
  },
  {
    slug: "skull-crushers",
    name: "Skull Crushers",
    emoji: "🦾",
    description: "Triceps isolation — use light dumbbells or a water bottle.",
    formCues: [
      "Lie on your back, arms extended above the chest.",
      "Keep upper arms still; bend only at the elbows.",
      "Lower weight toward forehead / behind head with control.",
      "Extend elbows to lock out without slamming.",
      "Use a weight you can control for every rep.",
    ],
    defaultSetDurationSec: 40,
    tracking: "reps",
    defaultReps: 12,
  },
];

export function getExercise(slug: string): Exercise | undefined {
  return EXERCISES.find((e) => e.slug === slug);
}

export function isValidSlug(slug: string): slug is ExerciseSlug {
  return EXERCISES.some((e) => e.slug === slug);
}

export const DISCLAIMER =
  "Not medical advice. Consult a professional before starting any exercise program. Stop immediately if you feel pain, dizziness, or unusual discomfort.";
