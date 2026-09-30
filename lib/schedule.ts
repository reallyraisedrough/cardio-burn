import { EXERCISES } from "./exercises";
import type { Exercise, IntensityMode } from "./types";
import { MODE_PRESETS } from "./modes";

export interface ExerciseCombo {
  label: string;
  exercises: Exercise[];
}

export interface SchedulePlan {
  mode: IntensityMode;
  title: string;
  frequency: string;
  exercisesPerSession: string;
  summary: string;
  /** Sample session combos (Beginning / Moderate) */
  sampleCombos: ExerciseCombo[];
  /** Expert split days */
  splitDays?: { dayLabel: string; exercises: Exercise[] }[];
  tips: string[];
}

export interface FoodHints {
  mode: IntensityMode;
  title: string;
  focus: string;
  tips: string[];
}

function pick(slugs: string[]): Exercise[] {
  return slugs
    .map((s) => EXERCISES.find((e) => e.slug === s))
    .filter((e): e is Exercise => Boolean(e));
}

const library = EXERCISES;
const mid = Math.ceil(library.length / 2);

/** Beginning: rotate 3-exercise sessions through the library. */
const BEGINNING_COMBOS: ExerciseCombo[] = [
  {
    label: "Core & push",
    exercises: pick(["planks", "push-ups", "sit-ups"]),
  },
  {
    label: "Legs & engine",
    exercises: pick(["squats", "lunges", "jogging"]),
  },
  {
    label: "Full-body blast",
    exercises: pick(["burpees", "dips", "skull-crushers"]),
  },
  // Still 3 moves. One yoga OR one stretch — strength stays in the session.
  {
    label: "Core & downward dog",
    exercises: pick(["planks", "push-ups", "downward-dog"]),
  },
  {
    label: "Legs & warrior",
    exercises: pick(["squats", "lunges", "warrior"]),
  },
  {
    label: "Core & child's pose",
    exercises: pick(["sit-ups", "planks", "childs-pose"]),
  },
  {
    label: "Push & cobra",
    exercises: pick(["dips", "push-ups", "cobra"]),
  },
  {
    label: "Legs & hamstring",
    exercises: pick(["squats", "lunges", "hamstring"]),
  },
  {
    label: "Engine & calf",
    exercises: pick(["jogging", "squats", "calf-stretch"]),
  },
  {
    label: "Legs & quad",
    exercises: pick(["lunges", "burpees", "quad-stretch"]),
  },
  {
    label: "Push & chest",
    exercises: pick(["push-ups", "dips", "chest-opener"]),
  },
  {
    label: "Core & shoulders",
    exercises: pick(["planks", "sit-ups", "shoulder-stretch"]),
  },
  {
    label: "Legs & hips",
    exercises: pick(["lunges", "squats", "hip-flexor"]),
  },
];

/** Moderate: Beginning’s 3 + 2 more. */
const MODERATE_COMBOS: ExerciseCombo[] = [
  {
    label: "Core & push + legs",
    exercises: pick(["planks", "push-ups", "sit-ups", "squats", "lunges"]),
  },
  {
    label: "Legs & engine + arms",
    exercises: pick(["squats", "lunges", "jogging", "dips", "skull-crushers"]),
  },
  {
    label: "Full-body + core",
    exercises: pick(["burpees", "dips", "skull-crushers", "planks", "push-ups"]),
  },
  // Still 5 moves: 3 strength + 1 yoga + 1 stretch.
  {
    label: "Core, dog, hamstrings",
    exercises: pick(["planks", "push-ups", "squats", "downward-dog", "hamstring"]),
  },
  {
    label: "Legs, warrior, quads",
    exercises: pick(["lunges", "jogging", "dips", "warrior", "quad-stretch"]),
  },
  {
    label: "Engine, cobra, calves",
    exercises: pick(["burpees", "sit-ups", "push-ups", "cobra", "calf-stretch"]),
  },
  {
    label: "Legs, child's pose, hips",
    exercises: pick(["squats", "lunges", "planks", "childs-pose", "hip-flexor"]),
  },
  {
    label: "Arms, chest, shoulders",
    exercises: pick(["dips", "skull-crushers", "push-ups", "chest-opener", "shoulder-stretch"]),
  },
];

export function getSchedulePlan(mode: IntensityMode): SchedulePlan {
  const preset = MODE_PRESETS[mode];

  if (mode === "beginning") {
    return {
      mode,
      title: `${preset.label} weekly plan`,
      frequency: "At least every other day",
      exercisesPerSession: "3 different exercises per session",
      summary:
        "Train every other day minimum. Each session is 3 moves. Rotate the strength library, and some days swap in one yoga pose or one stretch.",
      sampleCombos: BEGINNING_COMBOS,
      tips: [
        "Rest at least one full day between sessions.",
        "Rotate combos so you hit most of the library across the week.",
        `${preset.workingSets} working sets + burnout on each exercise you pick.`,
      ],
    };
  }

  if (mode === "moderate") {
    return {
      mode,
      title: `${preset.label} weekly plan`,
      frequency: "At least every other day",
      exercisesPerSession: "5 exercises per session",
      summary:
        "Same every-other-day cadence as Beginning, but stack 5 exercises. Some days are strength; some add one yoga pose and one stretch inside the five.",
      sampleCombos: MODERATE_COMBOS,
      tips: [
        "Keep at least one rest day between sessions.",
        "Build on Beginning combos: add two complementary moves.",
        `${preset.workingSets} working sets + burnout per exercise — pace yourself.`,
      ],
    };
  }

  // Expert / Master: full library across 2 training days
  const day1 = library.slice(0, mid);
  const day2 = library.slice(mid);
  return {
    mode,
    title: `${preset.label} (Master) weekly plan`,
    frequency: "At least every other day",
    exercisesPerSession: "All exercises, split across 2 days",
    summary:
      "Cover the full library over two training days, then rest. Day 1 is the first half; Day 2 is the second half. Repeat the every-other-day pattern.",
    sampleCombos: [],
    splitDays: [
      { dayLabel: "Day 1 — first half", exercises: day1 },
      { dayLabel: "Day 2 — second half", exercises: day2 },
    ],
    tips: [
      "Example cadence: Day 1 → rest → Day 2 → rest → repeat.",
      "Hit every exercise in the library across the two days.",
      `${preset.workingSets} working sets + burnout each — quality over rushing.`,
    ],
  };
}

export const FOOD_HINTS: Record<IntensityMode, FoodHints> = {
  beginning: {
    mode: "beginning",
    title: "Fuel tips — Beginning",
    focus: "Build consistency, recover well, stay hydrated.",
    tips: [
      "Include a protein source at each meal to support recovery.",
      "Drink water throughout the day — aim to start sessions hydrated.",
      "If you feel dizzy training fasted, eat a light snack first.",
      "Simple carbs around workouts (fruit, toast) can help energy without heaviness.",
      "Keep it simple: protein + produce + water beats perfect macros.",
    ],
  },
  moderate: {
    mode: "moderate",
    title: "Fuel tips — Moderate",
    focus: "Protein + veggies, time carbs near sessions, cut empty sugar.",
    tips: [
      "Prioritize protein and vegetables at most meals.",
      "Time most of your carbs near training for stamina and recovery.",
      "Swap sugary drinks for water or unsweetened options.",
      "A balanced plate after sessions helps the next day’s work feel easier.",
      "Stay consistent — fuel supports fat burning, strength, and engine work.",
    ],
  },
  expert: {
    mode: "expert",
    title: "Fuel tips — Expert",
    focus: "Higher protein awareness, electrolytes, goal-matched calories.",
    tips: [
      "Lean toward a higher protein intake to support volume and recovery.",
      "On long or stacked sessions, consider electrolytes with your fluids.",
      "Strength focus? A slight calorie surplus can help. Cutting? A modest deficit — not a crash.",
      "Keep carbs available around hard sessions so quality stays high.",
      "Sleep and food are part of the program — treat them like sets.",
    ],
  },
};

export function getFoodHints(mode: IntensityMode): FoodHints {
  return FOOD_HINTS[mode];
}

/** One-liner for Home under the mode selector. */
export function scheduleHomeBlurb(mode: IntensityMode): string {
  const plan = getSchedulePlan(mode);
  return `${plan.frequency} · ${plan.exercisesPerSession}`;
}

export function foodHomeBlurb(mode: IntensityMode): string {
  return getFoodHints(mode).focus;
}
