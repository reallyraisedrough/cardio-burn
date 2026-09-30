import type { ExerciseSlug } from "./types";

/**
 * One digital human, posed for every exercise.
 * Same person every time: shaded skin, short hair, navy tank, black shorts,
 * and shoes. Thick chest, hips, thighs, calves, and arms. No blur, no photos.
 */

export type PosePhase = "start" | "exec";
export type FigureTone = "paper" | "mist";

type Pt = { x: number; y: number };
type Shade = false | "linear" | "radial";
type Shape = { d: string; fill: string; shade: Shade };

type Prop = "dip" | "skull" | "ham" | "wall";

type SideSpec = {
  plane: "side";
  torso: number;
  head?: number;
  thigh: number;
  shin: number;
  foot?: number;
  thighFar: number;
  shinFar: number;
  footFar?: number;
  arm: number;
  fore: number;
  armFar: number;
  foreFar: number;
  prop?: Prop;
  weight?: boolean;
};

type FrontSpec = {
  plane: "front";
  thighL: number;
  shinL: number;
  footL?: number;
  thighR: number;
  shinR: number;
  footR?: number;
  armL: number;
  foreL: number;
  armR: number;
  foreR: number;
  prop?: Prop;
  weight?: boolean;
};

type Spec = SideSpec | FrontSpec;

const STAND: SideSpec = {
  plane: "side",
  torso: 3,
  head: -6,
  thigh: 5,
  shin: 2,
  foot: 86,
  thighFar: -8,
  shinFar: 1,
  footFar: 86,
  arm: 9,
  fore: 5,
  armFar: -7,
  foreFar: -3,
};

const FRONT_STAND: FrontSpec = {
  plane: "front",
  thighL: -8,
  shinL: 0,
  footL: -72,
  thighR: 8,
  shinR: 0,
  footR: 72,
  armL: -8,
  foreL: -3,
  armR: 8,
  foreR: 3,
};

const POSES: Record<ExerciseSlug, { start: Spec; exec: Spec }> = {
  planks: {
    start: {
      ...STAND,
      torso: 84,
      head: -16,
      thigh: -88,
      shin: -86,
      foot: 10,
      thighFar: -84,
      shinFar: -82,
      footFar: 12,
      arm: 16,
      fore: 14,
      armFar: 10,
      foreFar: 8,
    },
    exec: {
      ...STAND,
      torso: 88,
      head: -14,
      thigh: -90,
      shin: -88,
      foot: 8,
      thighFar: -86,
      shinFar: -84,
      footFar: 10,
      arm: 14,
      fore: 92,
      armFar: 8,
      foreFar: 88,
    },
  },
  burpees: {
    start: {
      ...STAND,
      torso: 8,
      head: -8,
      thigh: 22,
      shin: 10,
      thighFar: 12,
      shinFar: 6,
      arm: 28,
      fore: 16,
      armFar: 16,
      foreFar: 8,
    },
    exec: {
      ...STAND,
      torso: 86,
      head: -8,
      thigh: -86,
      shin: -84,
      foot: 8,
      thighFar: -82,
      shinFar: -80,
      footFar: 10,
      arm: 52,
      fore: 6,
      armFar: 44,
      foreFar: 2,
    },
  },
  jogging: {
    start: {
      ...STAND,
      torso: 16,
      head: -10,
      thigh: 24,
      shin: 8,
      thighFar: -20,
      shinFar: 10,
      arm: -28,
      fore: 8,
      armFar: 22,
      foreFar: 8,
    },
    exec: {
      ...STAND,
      torso: 18,
      head: -12,
      thigh: 76,
      shin: -38,
      foot: -16,
      thighFar: -46,
      shinFar: 32,
      footFar: 78,
      arm: -58,
      fore: -8,
      armFar: 64,
      foreFar: 22,
    },
  },
  dips: {
    start: {
      ...STAND,
      torso: -26,
      head: 8,
      thigh: 64,
      shin: 16,
      thighFar: 52,
      shinFar: 12,
      arm: -6,
      fore: -2,
      armFar: -12,
      foreFar: -6,
      prop: "dip",
    },
    exec: {
      ...STAND,
      torso: -36,
      head: 6,
      thigh: 72,
      shin: 20,
      thighFar: 60,
      shinFar: 16,
      arm: -68,
      fore: 6,
      armFar: -58,
      foreFar: 2,
      prop: "dip",
    },
  },
  lunges: {
    start: { ...STAND },
    exec: {
      ...STAND,
      torso: 10,
      head: -8,
      thigh: 74,
      shin: 14,
      thighFar: -52,
      shinFar: 16,
      arm: 14,
      fore: 8,
      armFar: -10,
      foreFar: -4,
    },
  },
  squats: {
    start: { ...STAND },
    exec: {
      ...STAND,
      torso: 32,
      head: -22,
      thigh: 70,
      shin: 24,
      thighFar: 58,
      shinFar: 18,
      arm: 48,
      fore: 72,
      armFar: 40,
      foreFar: 64,
    },
  },
  "push-ups": {
    start: {
      ...STAND,
      torso: 84,
      head: -16,
      thigh: -88,
      shin: -86,
      foot: 10,
      thighFar: -84,
      shinFar: -82,
      footFar: 12,
      arm: 16,
      fore: 14,
      armFar: 10,
      foreFar: 8,
    },
    exec: {
      ...STAND,
      torso: 80,
      head: -12,
      thigh: -84,
      shin: -82,
      foot: 10,
      thighFar: -80,
      shinFar: -78,
      footFar: 12,
      arm: 50,
      fore: 4,
      armFar: 42,
      foreFar: 0,
    },
  },
  "sit-ups": {
    start: {
      ...STAND,
      torso: -80,
      head: 6,
      thigh: 114,
      shin: 40,
      foot: 86,
      thighFar: 106,
      shinFar: 36,
      footFar: 86,
      arm: 172,
      fore: 168,
      armFar: 164,
      foreFar: 160,
    },
    exec: {
      ...STAND,
      torso: -34,
      head: -4,
      thigh: 104,
      shin: 38,
      thighFar: 96,
      shinFar: 34,
      arm: 68,
      fore: 52,
      armFar: 58,
      foreFar: 44,
    },
  },
  "skull-crushers": {
    start: {
      ...STAND,
      torso: -88,
      head: 4,
      thigh: 108,
      shin: 34,
      thighFar: 100,
      shinFar: 30,
      arm: 176,
      fore: 174,
      armFar: 168,
      foreFar: 166,
      prop: "skull",
      weight: true,
    },
    exec: {
      ...STAND,
      torso: -88,
      head: 2,
      thigh: 108,
      shin: 34,
      thighFar: 100,
      shinFar: 30,
      arm: 166,
      fore: -72,
      armFar: 158,
      foreFar: -80,
      prop: "skull",
      weight: true,
    },
  },
  "downward-dog": {
    start: {
      ...STAND,
      torso: 74,
      head: 12,
      thigh: 10,
      shin: 4,
      thighFar: 2,
      shinFar: 2,
      arm: 76,
      fore: 72,
      armFar: 68,
      foreFar: 64,
    },
    exec: {
      ...STAND,
      torso: 122,
      head: -8,
      thigh: -58,
      shin: -54,
      foot: 18,
      thighFar: -50,
      shinFar: -46,
      footFar: 16,
      arm: 24,
      fore: 20,
      armFar: 16,
      foreFar: 12,
    },
  },
  warrior: {
    start: {
      ...FRONT_STAND,
      armL: -118,
      foreL: -114,
      armR: 118,
      foreR: 114,
    },
    exec: {
      plane: "front",
      thighL: -82,
      shinL: -8,
      footL: -70,
      thighR: 74,
      shinR: 70,
      footR: 74,
      armL: -92,
      foreL: -90,
      armR: 92,
      foreR: 90,
    },
  },
  "childs-pose": {
    start: {
      ...STAND,
      torso: 2,
      head: -4,
      thigh: 12,
      shin: -96,
      foot: -90,
      thighFar: 4,
      shinFar: -88,
      footFar: -86,
      arm: 14,
      fore: 8,
      armFar: -6,
      foreFar: -2,
    },
    exec: {
      ...STAND,
      torso: 94,
      head: -8,
      thigh: 84,
      shin: -92,
      foot: -90,
      thighFar: 84,
      shinFar: -92,
      footFar: -90,
      arm: 86,
      fore: 88,
      armFar: 86,
      foreFar: 88,
    },
  },
  cobra: {
    start: {
      ...STAND,
      torso: 76,
      head: -28,
      thigh: -90,
      shin: -88,
      foot: 6,
      thighFar: -86,
      shinFar: -84,
      footFar: 8,
      arm: 42,
      fore: 6,
      armFar: 34,
      foreFar: 2,
    },
    exec: {
      ...STAND,
      torso: 50,
      head: -40,
      thigh: -94,
      shin: -92,
      foot: 8,
      thighFar: -90,
      shinFar: -88,
      footFar: 10,
      arm: 28,
      fore: 8,
      armFar: 20,
      foreFar: 4,
    },
  },
  "hip-flexor": {
    start: {
      ...STAND,
      torso: 2,
      head: -4,
      thigh: 12,
      shin: -96,
      foot: -90,
      thighFar: 4,
      shinFar: -88,
      footFar: -86,
      arm: 14,
      fore: 8,
      armFar: -6,
      foreFar: -2,
    },
    exec: {
      ...STAND,
      torso: -6,
      head: 2,
      thigh: 76,
      shin: 12,
      thighFar: -82,
      shinFar: -96,
      footFar: -70,
      arm: 36,
      fore: 18,
      armFar: 8,
      foreFar: 2,
    },
  },
  hamstring: {
    start: { ...STAND },
    exec: {
      ...STAND,
      torso: 42,
      head: -12,
      thigh: 104,
      shin: 100,
      foot: 78,
      thighFar: 6,
      shinFar: 2,
      arm: 96,
      fore: 88,
      armFar: 48,
      foreFar: 30,
      prop: "ham",
    },
  },
  "chest-opener": {
    start: { ...STAND },
    exec: {
      ...STAND,
      torso: -14,
      head: 8,
      thigh: 6,
      shin: 2,
      thighFar: -4,
      shinFar: 0,
      arm: -62,
      fore: -78,
      armFar: -50,
      foreFar: -66,
    },
  },
  "shoulder-stretch": {
    start: { ...FRONT_STAND },
    exec: {
      ...FRONT_STAND,
      armR: -86,
      foreR: -90,
      armL: 18,
      foreL: -70,
    },
  },
  "quad-stretch": {
    start: { ...STAND },
    exec: {
      ...STAND,
      torso: 4,
      head: -2,
      thigh: 3,
      shin: 1,
      foot: 86,
      thighFar: -22,
      shinFar: -148,
      footFar: -130,
      arm: 8,
      fore: 4,
      armFar: -36,
      foreFar: -42,
    },
  },
  "calf-stretch": {
    start: {
      ...STAND,
      torso: 12,
      head: -8,
      thigh: 14,
      shin: 6,
      thighFar: -10,
      shinFar: -4,
      arm: 68,
      fore: 66,
      armFar: 58,
      foreFar: 56,
      prop: "wall",
    },
    exec: {
      ...STAND,
      torso: 16,
      head: -10,
      thigh: 38,
      shin: 22,
      thighFar: -34,
      shinFar: -30,
      footFar: 82,
      arm: 74,
      fore: 72,
      armFar: 64,
      foreFar: 62,
      prop: "wall",
    },
  },
};

const LEN = {
  torso: 84,
  neck: 16,
  head: 23,
  upper: 50,
  fore: 44,
  hand: 17,
  thigh: 68,
  shin: 64,
  foot: 30,
};

type Palette = {
  skin: string;
  skinFar: string;
  skinDeep: string;
  hair: string;
  tank: string;
  tankLite: string;
  shorts: string;
  shortsFar: string;
  waist: string;
  shoe: string;
  shoeFar: string;
  sole: string;
  stripe: string;
  sclera: string;
  iris: string;
  pupil: string;
  brow: string;
  mouth: string;
  prop: string;
  metal: string;
  ground: string;
};

const BODY: Omit<Palette, "prop" | "ground"> = {
  skin: "#d08a5b",
  skinFar: "#b57145",
  skinDeep: "#7c4e32",
  hair: "#3a2418",
  tank: "#1e4e8c",
  tankLite: "#3c74b8",
  shorts: "#1a1a1a",
  shortsFar: "#111111",
  waist: "#0e0e0e",
  shoe: "#e6e1da",
  shoeFar: "#cfc8be",
  sole: "#292524",
  stripe: "#ea580c",
  sclera: "#f6f1ea",
  iris: "#6b3e22",
  pupil: "#1a120e",
  brow: "#2c1a10",
  mouth: "#a15a56",
  metal: "#fb923c",
};

const PALETTE: Record<FigureTone, Palette> = {
  paper: { ...BODY, prop: "#3f3f46", ground: "#52525b" },
  mist: { ...BODY, prop: "#52525b", ground: "#3f3f46" },
};

function hexChannels(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function mixHex(a: string, b: string, t: number): string {
  const A = hexChannels(a);
  const B = hexChannels(b);
  const c = A.map((v, i) => Math.round(v + (B[i] - v) * t));
  return "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
}

/** Highlight and shadow around a base color. Not a blur. */
export function shadeOf(fill: string): { hi: string; lo: string } {
  const [r, g, b] = hexChannels(fill);
  const L = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  const hiT = L > 0.72 ? 0.18 : L < 0.16 ? 0.26 : 0.4;
  const loT = L < 0.14 ? 0.18 : 0.4;
  return { hi: mixHex(fill, "#fff1e4", hiT), lo: mixHex(fill, "#140c08", loT) };
}

/** Side-view profile. Local +x is the face, +y is up. */
const PROFILE: Pt[] = [
  { x: 0.18, y: -0.92 },
  { x: -0.02, y: -1.02 },
  { x: -0.32, y: -0.86 },
  { x: -0.58, y: -0.55 },
  { x: -0.78, y: -0.16 },
  { x: -0.88, y: 0.22 },
  { x: -0.8, y: 0.58 },
  { x: -0.55, y: 0.88 },
  { x: -0.18, y: 1.05 },
  { x: 0.2, y: 1.06 },
  { x: 0.52, y: 0.88 },
  { x: 0.72, y: 0.58 },
  { x: 0.78, y: 0.32 },
  { x: 0.74, y: 0.16 },
  { x: 0.8, y: 0.05 },
  { x: 0.86, y: -0.05 },
  { x: 0.7, y: -0.16 },
  { x: 0.76, y: -0.32 },
  { x: 0.6, y: -0.52 },
  { x: 0.36, y: -0.74 },
  { x: 0.2, y: -0.9 },
];

const FRONT_HEAD: Pt[] = [
  { x: 0, y: 1.05 },
  { x: 0.32, y: 0.98 },
  { x: 0.62, y: 0.76 },
  { x: 0.82, y: 0.42 },
  { x: 0.9, y: 0.16 },
  { x: 1.02, y: 0.02 },
  { x: 1.04, y: -0.16 },
  { x: 0.9, y: -0.28 },
  { x: 0.78, y: -0.48 },
  { x: 0.48, y: -0.82 },
  { x: 0.22, y: -1.02 },
  { x: 0, y: -1.08 },
  { x: -0.22, y: -1.02 },
  { x: -0.48, y: -0.82 },
  { x: -0.78, y: -0.48 },
  { x: -0.9, y: -0.28 },
  { x: -1.04, y: -0.16 },
  { x: -1.02, y: 0.02 },
  { x: -0.9, y: 0.16 },
  { x: -0.82, y: 0.42 },
  { x: -0.62, y: 0.76 },
  { x: -0.32, y: 0.98 },
];

function dir(deg: number): Pt {
  const r = (deg * Math.PI) / 180;
  return { x: Math.sin(r), y: Math.cos(r) };
}

function add(p: Pt, d: Pt, len: number): Pt {
  return { x: p.x + d.x * len, y: p.y + d.y * len };
}

/** Thick limb with a muscle profile and round ends so joints fuse into one body. */
function solidLimb(a: Pt, b: Pt, radii: number[]): Pt[] {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;
  const n = radii.length - 1;
  const pts: Pt[] = [];
  const cap = 7;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const r = radii[i];
    pts.push({ x: a.x + dx * t + px * r, y: a.y + dy * t + py * r });
  }
  const rb = radii[n];
  for (let i = 1; i < cap; i++) {
    const ang = (Math.PI * i) / cap;
    pts.push({
      x: b.x + Math.cos(ang) * px * rb + Math.sin(ang) * ux * rb,
      y: b.y + Math.cos(ang) * py * rb + Math.sin(ang) * uy * rb,
    });
  }
  for (let i = n; i >= 0; i--) {
    const t = i / n;
    const r = radii[i];
    pts.push({ x: a.x + dx * t - px * r, y: a.y + dy * t - py * r });
  }
  const ra = radii[0];
  for (let i = 1; i < cap; i++) {
    const ang = (Math.PI * i) / cap;
    pts.push({
      x: a.x - Math.cos(ang) * px * ra - Math.sin(ang) * ux * ra,
      y: a.y - Math.cos(ang) * py * ra - Math.sin(ang) * uy * ra,
    });
  }
  return pts;
}


function rect(x: number, y: number, w: number, h: number): Pt[] {
  return [
    { x, y },
    { x: x + w, y },
    { x: x + w, y: y + h },
    { x, y: y + h },
  ];
}

function hex(c: Pt, radius: number): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 180) * (i * 60 - 30);
    pts.push({ x: c.x + Math.cos(a) * radius, y: c.y + Math.sin(a) * radius });
  }
  return pts;
}

function smooth(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

function chestW(t: number): number {
  if (t < 0.32) return 18 + (13 - 18) * smooth(t / 0.32);
  if (t < 0.66) return 13 + (26 - 13) * smooth((t - 0.32) / 0.34);
  return 26 + (11 - 26) * smooth((t - 0.66) / 0.34);
}

function backW(t: number): number {
  if (t < 0.24) return 26 + (16 - 26) * smooth(t / 0.24);
  if (t < 0.5) return 16 + (13 - 16) * smooth((t - 0.24) / 0.26);
  if (t < 0.78) return 13 + (15 - 13) * smooth((t - 0.5) / 0.28);
  return 15 + (11 - 15) * smooth((t - 0.78) / 0.22);
}

function torsoHalf(t: number): number {
  if (t < 0.1) return 30 + (38 - 30) * smooth(t / 0.1);
  if (t < 0.28) return 38 + (30 - 38) * smooth((t - 0.1) / 0.18);
  if (t < 0.5) return 30 + (20 - 30) * smooth((t - 0.28) / 0.22);
  if (t < 0.74) return 20 + (28 - 20) * smooth((t - 0.5) / 0.24);
  return 28 + (30 - 28) * smooth((t - 0.74) / 0.26);
}

const THIGH_R = [16, 24, 20, 13];
const SHIN_R = [12, 14, 21, 16, 10];
const ARM_R = [12, 15, 13, 10];
const FORE_R = [10, 12.5, 11, 8];

type Raw = { pts: Pt[]; fill: string; shade: Shade };

function push(shapes: Raw[], pts: Pt[], fill: string, shade: Shade = "linear") {
  shapes.push({ pts, fill, shade });
}

function spineFrame(hip: Pt, shoulder: Pt): { dx: number; dy: number; nx: number; ny: number } {
  const dx = shoulder.x - hip.x;
  const dy = shoulder.y - hip.y;
  const len = Math.hypot(dx, dy) || 1;
  return { dx, dy, nx: -dy / len, ny: dx / len };
}

function sideEdges(
  hip: Pt,
  shoulder: Pt,
  t0: number,
  t1: number,
  samples: number,
  chestScale: (t: number) => number,
  backScale: (t: number) => number
): Pt[] {
  const { dx, dy, nx, ny } = spineFrame(hip, shoulder);
  const chest: Pt[] = [];
  const back: Pt[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = t0 + ((t1 - t0) * i) / samples;
    const cw = chestW(t) * chestScale(t);
    const bw = backW(t) * backScale(t);
    chest.push({ x: hip.x + dx * t + nx * cw, y: hip.y + dy * t + ny * cw });
    back.push({ x: hip.x + dx * t - nx * bw, y: hip.y + dy * t - ny * bw });
  }
  back.reverse();
  return [...chest, ...back];
}

function sideTorso(hip: Pt, shoulder: Pt): Pt[] {
  return sideEdges(hip, shoulder, 0, 1, 28, () => 1, () => 1);
}

function strapFront(t: number): number {
  if (t < 0.64) return 1;
  return 1 - 0.58 * smooth((t - 0.64) / 0.28);
}

function strapBack(t: number): number {
  if (t < 0.7) return 1;
  return 1 - 0.4 * smooth((t - 0.7) / 0.22);
}

function sideTank(hip: Pt, shoulder: Pt): Pt[] {
  return sideEdges(hip, shoulder, 0.3, 0.93, 18, strapFront, strapBack);
}

function sideShorts(hip: Pt, shoulder: Pt): Pt[] {
  return sideEdges(hip, shoulder, 0, 0.48, 14, () => 1, () => 1);
}

function sideWaist(hip: Pt, shoulder: Pt): Pt[] {
  return sideEdges(hip, shoulder, 0.34, 0.44, 6, () => 1, () => 1);
}

/** Lighter panel along the chest so the pec reads under the tank. */
function sideChest(hip: Pt, shoulder: Pt): Pt[] {
  const { dx, dy, nx, ny } = spineFrame(hip, shoulder);
  const outer: Pt[] = [];
  const inner: Pt[] = [];
  const n = 10;
  for (let i = 0; i <= n; i++) {
    const t = 0.52 + (0.8 - 0.52) * (i / n);
    const bulge = Math.sin((i / n) * Math.PI);
    outer.push({
      x: hip.x + dx * t + nx * chestW(t) * 0.98,
      y: hip.y + dy * t + ny * chestW(t) * 0.98,
    });
    inner.push({
      x: hip.x + dx * t + nx * chestW(t) * (0.42 - 0.12 * bulge),
      y: hip.y + dy * t + ny * chestW(t) * (0.42 - 0.12 * bulge),
    });
  }
  inner.reverse();
  return [...outer, ...inner];
}

function frontBand(
  hip: Pt,
  shoulderY: number,
  t0: number,
  t1: number,
  samples: number,
  scale: (t: number) => number
): Pt[] {
  const len = hip.y - shoulderY;
  const right: Pt[] = [];
  const left: Pt[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = t0 + ((t1 - t0) * i) / samples;
    const x = torsoHalf(t) * scale(t);
    const y = shoulderY + len * t;
    right.push({ x: hip.x + x, y });
    left.push({ x: hip.x - x, y });
  }
  left.reverse();
  return [...right, ...left];
}

function frontTorso(hip: Pt, shoulderY: number): Pt[] {
  return frontBand(hip, shoulderY, 0, 1, 24, () => 1);
}

function frontArmhole(t: number): number {
  if (t > 0.18) return 1;
  return 1 - 0.18 * (1 - smooth(t / 0.18));
}

function frontTank(hip: Pt, shoulderY: number): Pt[] {
  return frontBand(hip, shoulderY, 0.02, 0.62, 16, frontArmhole);
}

function frontShorts(hip: Pt, shoulderY: number): Pt[] {
  return frontBand(hip, shoulderY, 0.56, 1, 12, () => 1);
}

function frontWaist(hip: Pt, shoulderY: number): Pt[] {
  return frontBand(hip, shoulderY, 0.54, 0.64, 6, () => 1);
}

function frontScoop(hip: Pt, shoulderY: number): Pt[] {
  const len = hip.y - shoulderY;
  const yTop = shoulderY - 2;
  const yBot = shoulderY + len * 0.22;
  const w = 16;
  return [
    { x: hip.x - w, y: yTop },
    { x: hip.x + w, y: yTop },
    { x: hip.x + w * 0.82, y: yTop + (yBot - yTop) * 0.38 },
    { x: hip.x + w * 0.42, y: yBot },
    { x: hip.x, y: yBot + 5 },
    { x: hip.x - w * 0.42, y: yBot },
    { x: hip.x - w * 0.82, y: yTop + (yBot - yTop) * 0.38 },
  ];
}

function frontPec(hip: Pt, shoulderY: number, side: number): Pt[] {
  const len = hip.y - shoulderY;
  const c = { x: hip.x + side * 12, y: shoulderY + len * 0.32 };
  return worldOval(c, 11, 9, 0);
}

function worldOval(c: Pt, rx: number, ry: number, rotDeg: number, n = 14): Pt[] {
  const t = (rotDeg * Math.PI) / 180;
  const co = Math.cos(t);
  const si = Math.sin(t);
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const lx = Math.cos(a) * rx;
    const ly = Math.sin(a) * ry;
    pts.push({ x: c.x + lx * co - ly * si, y: c.y + lx * si + ly * co });
  }
  return pts;
}

function chestNormal(hip: Pt, shoulder: Pt): Pt {
  const dx = shoulder.x - hip.x;
  const dy = shoulder.y - hip.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: -dy / len, y: dx / len };
}

function placeHead(center: Pt, tiltDeg: number, r: number, local: Pt[]): Pt[] {
  const t = (tiltDeg * Math.PI) / 180;
  const c = Math.cos(t);
  const s = Math.sin(t);
  return local.map((p) => {
    const lx = p.x * r;
    const ly = p.y * r;
    return {
      x: center.x + lx * c + ly * s,
      y: center.y - ly * c + lx * s,
    };
  });
}

function localOval(cx: number, cy: number, rx: number, ry: number, rot = 0, n = 12): Pt[] {
  const co = Math.cos(rot);
  const si = Math.sin(rot);
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const lx = Math.cos(a) * rx;
    const ly = Math.sin(a) * ry;
    pts.push({ x: cx + lx * co - ly * si, y: cy + lx * si + ly * co });
  }
  return pts;
}

const HAIR_SIDE: Pt[] = [
  { x: 0.38, y: 0.58 },
  { x: 0.55, y: 0.78 },
  { x: 0.22, y: 1.16 },
  { x: -0.2, y: 1.24 },
  { x: -0.68, y: 1.02 },
  { x: -1.02, y: 0.58 },
  { x: -1.08, y: 0.12 },
  { x: -0.9, y: -0.28 },
  { x: -0.58, y: -0.22 },
  { x: -0.42, y: 0.2 },
  { x: -0.12, y: 0.52 },
  { x: 0.16, y: 0.5 },
];

const HAIR_FRONT: Pt[] = [
  { x: -0.72, y: 0.12 },
  { x: -1.02, y: 0.4 },
  { x: -0.88, y: 0.86 },
  { x: -0.42, y: 1.18 },
  { x: 0, y: 1.26 },
  { x: 0.42, y: 1.18 },
  { x: 0.88, y: 0.86 },
  { x: 1.02, y: 0.4 },
  { x: 0.72, y: 0.12 },
  { x: 0.5, y: 0.3 },
  { x: 0.2, y: 0.16 },
  { x: 0, y: 0.32 },
  { x: -0.2, y: 0.16 },
  { x: -0.5, y: 0.3 },
];

function pushHead(shapes: Raw[], plane: "side" | "front", center: Pt, tilt: number, pal: Palette) {
  const r = LEN.head;
  const skull = plane === "side" ? PROFILE : FRONT_HEAD;
  push(shapes, placeHead(center, tilt, r, skull), pal.skin, "radial");
  const hair = plane === "side" ? HAIR_SIDE : HAIR_FRONT;
  push(shapes, placeHead(center, tilt, r, hair), pal.hair, "radial");
  if (plane === "side") {
    push(shapes, placeHead(center, tilt, r, localOval(-0.72, 0.02, 0.2, 0.28)), pal.skin);
    push(shapes, placeHead(center, tilt, r, localOval(-0.7, 0.0, 0.09, 0.16)), pal.skinDeep, false);
    push(shapes, placeHead(center, tilt, r, localOval(0.5, 0.26, 0.13, 0.09)), pal.sclera, false);
    push(shapes, placeHead(center, tilt, r, localOval(0.54, 0.24, 0.065, 0.065)), pal.iris, false);
    push(shapes, placeHead(center, tilt, r, localOval(0.555, 0.23, 0.032, 0.032)), pal.pupil, false);
    push(shapes, placeHead(center, tilt, r, localOval(0.46, 0.42, 0.16, 0.035, -0.35)), pal.brow, false);
    push(shapes, placeHead(center, tilt, r, localOval(0.66, -0.3, 0.1, 0.038)), pal.mouth, false);
  } else {
    for (const sx of [-1, 1]) {
      push(shapes, placeHead(center, tilt, r, localOval(0.9 * sx, -0.08, 0.08, 0.14)), pal.skinDeep, false);
      push(shapes, placeHead(center, tilt, r, localOval(0.32 * sx, 0.08, 0.13, 0.1)), pal.sclera, false);
      push(shapes, placeHead(center, tilt, r, localOval(0.32 * sx, 0.06, 0.062, 0.062)), pal.iris, false);
      push(shapes, placeHead(center, tilt, r, localOval(0.33 * sx, 0.05, 0.03, 0.03)), pal.pupil, false);
      push(shapes, placeHead(center, tilt, r, localOval(0.32 * sx, 0.26, 0.15, 0.038)), pal.brow, false);
    }
    push(shapes, placeHead(center, tilt, r, localOval(0, -0.16, 0.055, 0.09)), pal.skinDeep, false);
    push(shapes, placeHead(center, tilt, r, localOval(0, -0.48, 0.15, 0.042)), pal.mouth, false);
  }
}

function footFrame(ankle: Pt, deg: number) {
  const d = dir(deg);
  let nx = -d.y;
  let ny = d.x;
  if (ny < 0) {
    nx = -nx;
    ny = -ny;
  }
  const n = { x: nx, y: ny };
  const heel = add(ankle, d, -12);
  const mid = add(ankle, d, 4);
  const ball = add(ankle, d, 16);
  const toe = add(ankle, d, 30);
  return { d, n, heel, mid, ball, toe };
}

function footPoly(ankle: Pt, deg: number): Pt[] {
  const { n, heel, mid, ball, toe } = footFrame(ankle, deg);
  return [
    { x: heel.x + n.x * 2, y: heel.y + n.y * 2 },
    { x: heel.x + n.x * 13, y: heel.y + n.y * 13 },
    { x: mid.x + n.x * 11, y: mid.y + n.y * 11 },
    { x: ball.x + n.x * 12, y: ball.y + n.y * 12 },
    { x: toe.x + n.x * 8, y: toe.y + n.y * 8 },
    { x: toe.x + n.x * 2, y: toe.y + n.y * 2 },
    { x: ball.x - n.x * 3, y: ball.y - n.y * 3 },
    { x: ankle.x - n.x * 4, y: ankle.y - n.y * 4 },
    { x: heel.x - n.x * 1, y: heel.y - n.y * 1 },
  ];
}

function solePoly(ankle: Pt, deg: number): Pt[] {
  const { n, heel, ball, toe } = footFrame(ankle, deg);
  return [
    { x: heel.x + n.x * 7, y: heel.y + n.y * 7 },
    { x: ball.x + n.x * 7, y: ball.y + n.y * 7 },
    { x: toe.x + n.x * 4, y: toe.y + n.y * 4 },
    { x: toe.x + n.x * 10, y: toe.y + n.y * 10 },
    { x: ball.x + n.x * 14, y: ball.y + n.y * 14 },
    { x: heel.x + n.x * 14, y: heel.y + n.y * 14 },
  ];
}

function shoeStripe(ankle: Pt, deg: number): Pt[] {
  const { n, d, mid } = footFrame(ankle, deg);
  const a = add(mid, d, -1);
  const b = add(mid, d, 7);
  return [
    { x: a.x + n.x * 1, y: a.y + n.y * 1 },
    { x: b.x + n.x * 1, y: b.y + n.y * 1 },
    { x: b.x + n.x * 12, y: b.y + n.y * 12 },
    { x: a.x + n.x * 11, y: a.y + n.y * 11 },
  ];
}

type Chain = { knee: Pt; end: Pt; toe: Pt; parts: Pt[][] };

function limbChain(
  origin: Pt,
  upperDeg: number,
  foreDeg: number,
  kind: "arm" | "leg",
  footDeg?: number
): Chain {
  const upperLen = kind === "arm" ? LEN.upper : LEN.thigh;
  const lowerLen = kind === "arm" ? LEN.fore : LEN.shin;
  const dUpper = dir(upperDeg);
  const dLower = dir(foreDeg);
  const knee = add(origin, dUpper, upperLen);
  const end = add(knee, dLower, lowerLen);
  const parts: Pt[][] = [];
  if (kind === "arm") {
    const root = add(origin, dUpper, -4);
    const elbow = add(knee, dLower, -8);
    parts.push(solidLimb(root, knee, ARM_R));
    parts.push(solidLimb(elbow, end, FORE_R));
    const hand = add(end, dLower, LEN.hand);
    const wrist = add(end, dLower, -4);
    parts.push(solidLimb(wrist, hand, [7, 7.6, 5.6]));
    return { knee, end, toe: hand, parts };
  }
  const root = add(origin, dUpper, -8);
  const kneeIn = add(knee, dLower, -8);
  parts.push(solidLimb(root, knee, THIGH_R));
  parts.push(solidLimb(kneeIn, end, SHIN_R));
  const fd = footDeg ?? autoFoot(foreDeg);
  const toe = add(end, dir(fd), LEN.foot);
  parts.push(footPoly(end, fd));
  return { knee, end, toe, parts };
}

function limbSegment(a: Pt, b: Pt, radii: number[], t0: number, t1: number): Pt[] {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const n = radii.length - 1;
  const rAt = (t: number) => {
    const x = Math.min(1, Math.max(0, t)) * n;
    const i = Math.min(n - 1, Math.floor(x));
    const f = x - i;
    return radii[i] * (1 - f) + radii[i + 1] * f;
  };
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;
  const steps = 8;
  const pts: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = t0 + ((t1 - t0) * i) / steps;
    const r = rAt(t);
    pts.push({ x: a.x + dx * t + px * r, y: a.y + dy * t + py * r });
  }
  for (let i = steps; i >= 0; i--) {
    const t = t0 + ((t1 - t0) * i) / steps;
    const r = rAt(t);
    pts.push({ x: a.x + dx * t - px * r, y: a.y + dy * t - py * r });
  }
  return pts;
}

function pushLeg(shapes: Raw[], leg: Chain, footDeg: number, skin: string, shoe: string, pal: Palette) {
  push(shapes, leg.parts[0], skin);
  push(shapes, leg.parts[1], skin);
  push(shapes, leg.parts[2], shoe);
  push(shapes, solePoly(leg.end, footDeg), pal.sole, false);
  push(shapes, shoeStripe(leg.end, footDeg), pal.stripe, false);
}

function pushShortsLeg(shapes: Raw[], origin: Pt, thighDeg: number, fill: string) {
  const d = dir(thighDeg);
  const root = add(origin, d, -18);
  const knee = add(origin, d, LEN.thigh);
  const radii = THIGH_R.map((r, i) => r * (i === 0 ? 1.7 : i === 1 ? 1.2 : 1.04));
  push(shapes, limbSegment(root, knee, radii, 0, 0.5), fill);
}

function pushArm(shapes: Raw[], arm: Chain, skin: string) {
  for (const part of arm.parts) push(shapes, part, skin);
}

function autoFoot(shin: number): number {
  const n = ((shin % 360) + 360) % 360;
  const distDown = Math.min(n, 360 - n);
  if (distDown < 58) return 86;
  if (n > 180 && n < 345) return 14;
  return 86;
}

function path(pts: Pt[]): string {
  return (
    pts
      .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join("") + "Z"
  );
}

function fit(shapes: Raw[]): Shape[] {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const s of shapes) {
    for (const p of s.pts) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }
  }
  const vbW = 200;
  const vbH = 260;
  const pad = 8;
  const bw = Math.max(1, maxX - minX);
  const bh = Math.max(1, maxY - minY);
  const s = Math.min((vbW - pad * 2) / bw, (vbH - pad * 2) / bh);
  const ox = (vbW - bw * s) / 2 - minX * s;
  const oy = (vbH - bh * s) / 2 - minY * s;
  return shapes.map((shape) => ({
    fill: shape.fill,
    shade: shape.shade,
    d: path(
      shape.pts.map((p) => ({
        x: p.x * s + ox,
        y: p.y * s + oy,
      }))
    ),
  }));
}

function dumbbell(wrist: Pt, foreDeg: number): Pt[][] {
  const along = dir(foreDeg);
  const px = -along.y;
  const py = along.x;
  const grip = add(wrist, along, 12);
  const a = add(grip, { x: px, y: py }, 18);
  const b = add(grip, { x: px, y: py }, -18);
  const bar = solidLimb(a, b, [3.4, 3.4]);
  return [bar, hex(a, 12), hex(b, 12)];
}

function boundsOf(parts: Pt[][]): { minX: number; maxX: number; maxY: number } {
  let minX = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const part of parts) {
    for (const p of part) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }
  }
  return { minX, maxX, maxY };
}

function buildSide(spec: SideSpec, pal: Palette): Raw[] {
  const hip = { x: 0, y: 0 };
  const down = dir(spec.torso);
  const up = { x: down.x, y: -down.y };
  const shoulder = add(hip, up, LEN.torso);
  const nrm = chestNormal(hip, shoulder);
  const spine = {
    x: (shoulder.x - hip.x) / LEN.torso,
    y: (shoulder.y - hip.y) / LEN.torso,
  };
  const farHip = { x: hip.x - nrm.x * 14, y: hip.y - nrm.y * 7 };
  const farShoulder = { x: shoulder.x - nrm.x * 10, y: shoulder.y - nrm.y * 5 };
  const nearFoot = spec.foot ?? autoFoot(spec.shin);
  const farFoot = spec.footFar ?? autoFoot(spec.shinFar);
  const nearLeg = limbChain(hip, spec.thigh, spec.shin, "leg", nearFoot);
  const farLeg = limbChain(farHip, spec.thighFar, spec.shinFar, "leg", farFoot);
  const nearArm = limbChain(shoulder, spec.arm, spec.fore, "arm");
  const farArm = limbChain(farShoulder, spec.armFar, spec.foreFar, "arm");

  const headTilt = spec.torso + (spec.head ?? 0);
  const neckBase = add(shoulder, spine, -8);
  const neckTop = add(shoulder, spine, LEN.neck);
  const headCenter = add(shoulder, spine, LEN.neck + LEN.head * 0.55);
  const neck = solidLimb(neckBase, neckTop, [13, 12, 11, 10]);

  const shapes: Raw[] = [];
  const { minX, maxX, maxY } = boundsOf([
    ...farLeg.parts,
    ...nearLeg.parts,
    sideTorso(hip, shoulder),
    placeHead(headCenter, headTilt, LEN.head, PROFILE),
  ]);

  if (spec.prop === "dip") {
    const top = Math.max(nearArm.end.y, farArm.end.y);
    const hx = (nearArm.end.x + farArm.end.x) / 2;
    push(shapes, rect(hx - 118, top, 136, 48), pal.prop, false);
  } else if (spec.prop === "skull") {
    const mid = { x: (hip.x + shoulder.x) / 2, y: (hip.y + shoulder.y) / 2 };
    const backY = mid.y - nrm.y * 22;
    const left = Math.min(headCenter.x, hip.x, nearLeg.knee.x) - 22;
    const right = Math.max(headCenter.x, hip.x, nearLeg.knee.x) + 28;
    push(shapes, rect(left, backY, right - left, 32), pal.prop, false);
  } else if (spec.prop === "ham") {
    const top = nearLeg.toe.y;
    const ground = farLeg.toe.y;
    const h = Math.max(20, ground - top);
    push(shapes, rect(nearLeg.end.x - 22, top, 56, h), pal.prop, false);
  } else if (spec.prop === "wall") {
    const x = Math.max(nearArm.toe.x, farArm.toe.x) + 8;
    const top = Math.min(nearArm.toe.y, farArm.toe.y) - 40;
    push(shapes, rect(x, top, 16, maxY - top + 10), pal.prop, false);
  }

  push(shapes, rect(minX - 10, maxY + 2, maxX - minX + 20, 8), pal.ground, false);

  pushLeg(shapes, farLeg, farFoot, pal.skinFar, pal.shoeFar, pal);
  pushShortsLeg(shapes, farHip, spec.thighFar, pal.shortsFar);
  pushArm(shapes, farArm, pal.skinFar);

  push(shapes, sideTorso(hip, shoulder), pal.skin);
  push(shapes, nearLeg.parts[0], pal.skin);
  push(shapes, sideTank(hip, shoulder), pal.tank);
  push(shapes, sideChest(hip, shoulder), pal.tankLite);
  push(shapes, sideShorts(hip, shoulder), pal.shorts);
  push(shapes, sideWaist(hip, shoulder), pal.waist, false);
  pushShortsLeg(shapes, hip, spec.thigh, pal.shorts);
  push(shapes, nearLeg.parts[1], pal.skin);
  push(shapes, nearLeg.parts[2], pal.shoe);
  push(shapes, solePoly(nearLeg.end, nearFoot), pal.sole, false);
  push(shapes, shoeStripe(nearLeg.end, nearFoot), pal.stripe, false);
  push(shapes, neck, pal.skin);
  pushArm(shapes, nearArm, pal.skin);
  pushHead(shapes, "side", headCenter, headTilt, pal);

  if (spec.weight) {
    for (const pts of dumbbell(nearArm.end, spec.fore)) {
      push(shapes, pts, pal.metal);
    }
  }
  return shapes;
}

function buildFront(spec: FrontSpec, pal: Palette): Raw[] {
  const hip = { x: 0, y: 0 };
  const shoulderY = hip.y - LEN.torso;
  const shoulderL = { x: hip.x - 34, y: shoulderY + 8 };
  const shoulderR = { x: hip.x + 34, y: shoulderY + 8 };
  const hipL = { x: hip.x - 14, y: hip.y + 2 };
  const hipR = { x: hip.x + 14, y: hip.y + 2 };
  const footL = spec.footL ?? autoFoot(spec.shinL);
  const footR = spec.footR ?? autoFoot(spec.shinR);
  const legL = limbChain(hipL, spec.thighL, spec.shinL, "leg", footL);
  const legR = limbChain(hipR, spec.thighR, spec.shinR, "leg", footR);
  const armL = limbChain(shoulderL, spec.armL, spec.foreL, "arm");
  const armR = limbChain(shoulderR, spec.armR, spec.foreR, "arm");
  const axis = { x: 0, y: -1 };
  const neckBase = add({ x: hip.x, y: shoulderY }, axis, -6);
  const neckTop = add({ x: hip.x, y: shoulderY }, axis, LEN.neck);
  const headCenter = add({ x: hip.x, y: shoulderY }, axis, LEN.neck + LEN.head * 0.62);
  const neck = solidLimb(neckBase, neckTop, [14, 12, 11, 10]);

  const shapes: Raw[] = [];
  const { minX, maxX, maxY } = boundsOf([
    ...legL.parts,
    ...legR.parts,
    ...armL.parts,
    ...armR.parts,
    frontTorso(hip, shoulderY),
    placeHead(headCenter, 0, LEN.head, FRONT_HEAD),
  ]);
  push(shapes, rect(minX - 10, maxY + 2, maxX - minX + 20, 8), pal.ground, false);

  pushLeg(shapes, legL, footL, pal.skin, pal.shoe, pal);
  pushLeg(shapes, legR, footR, pal.skin, pal.shoe, pal);
  push(shapes, frontTorso(hip, shoulderY), pal.skin);
  push(shapes, frontTank(hip, shoulderY), pal.tank);
  push(shapes, frontPec(hip, shoulderY, -1), pal.tankLite);
  push(shapes, frontPec(hip, shoulderY, 1), pal.tankLite);
  push(shapes, frontScoop(hip, shoulderY), pal.skin);
  push(shapes, frontShorts(hip, shoulderY), pal.shorts);
  push(shapes, frontWaist(hip, shoulderY), pal.waist, false);
  pushShortsLeg(shapes, hipL, spec.thighL, pal.shorts);
  pushShortsLeg(shapes, hipR, spec.thighR, pal.shorts);
  pushArm(shapes, armL, pal.skin);
  pushArm(shapes, armR, pal.skin);
  push(shapes, neck, pal.skin);
  pushHead(shapes, "front", headCenter, 0, pal);
  return shapes;
}

export function buildFigure(
  slug: ExerciseSlug,
  phase: PosePhase,
  tone: FigureTone = "paper"
): { viewBox: string; shapes: Shape[] } {
  const spec = POSES[slug][phase];
  const pal = PALETTE[tone];
  const raw = spec.plane === "side" ? buildSide(spec, pal) : buildFront(spec, pal);
  return { viewBox: "0 0 200 260", shapes: fit(raw) };
}
