import type { ExerciseSlug } from "./types";

/**
 * One digital human, posed for every exercise.
 * Same person every time: shaded skin, short hair, navy tank, black shorts,
 * and shoes. Thick chest, hips, thighs, calves, and arms. No blur, no photos.
 *
 * Built for 4K: every outline is a smooth Bézier spline (no polygon facets), with
 * muscle light/shadow glazes, a detailed face, hair strands, fabric folds and
 * trainer detail. Pure vector, so it stays crisp at any size.
 */

export type PosePhase = "start" | "exec";
export type FigureTone = "paper" | "mist";

type Pt = { x: number; y: number };
type Shade = false | "linear" | "radial";
export type Shape = {
  d: string;
  fill: string;
  shade: Shade;
  stroke?: string;
  width?: number;
  opacity?: number;
};

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
  /** Absolute hand direction when the hand is planted (90 = flat, fingers forward). */
  hand?: number;
  handFar?: number;
  /** Foot lies on its laces (prone / kneeling) instead of on its sole. */
  soleUp?: boolean;
  soleUpFar?: boolean;
  /** Shorts hem along the thigh tube (default SHORTS_HEM_T); shorter when kneeling upright. */
  hem?: number;
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
  handL?: number;
  handR?: number;
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
  shinFar: 0,
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

/**
 * Joint angles per pose. Floor poses are tuned so every supporting hand, forearm, knee
 * and foot lands exactly on the floor line (nothing below it, nothing floating); check
 * with `node scripts/check-pose-contacts.mjs`.
 */
const POSES: Record<ExerciseSlug, { start: Spec; exec: Spec }> = {
  planks: {
    start: {
      ...STAND,
      torso: 71.5,
      head: -12,
      thigh: -71.5,
      shin: -71.5,
      foot: 26.5,
      thighFar: -71.5,
      shinFar: -71.5,
      footFar: 26.5,
      arm: 0,
      fore: 0,
      armFar: 0,
      foreFar: 0,
      hand: 90,
      handFar: 90,
    },
    exec: {
      ...STAND,
      torso: 82.2,
      head: -12,
      thigh: -82.2,
      shin: -82.2,
      foot: 15.8,
      thighFar: -82.2,
      shinFar: -82.2,
      footFar: 15.8,
      arm: 0,
      fore: 83.6,
      armFar: 0,
      foreFar: 83.6,
      hand: 90,
      handFar: 90,
    },
  },
  burpees: {
    start: {
      ...STAND,
      torso: 8,
      head: -8,
      thigh: 18.5,
      shin: 6,
      thighFar: 8.9,
      shinFar: 17.7,
      arm: 28,
      fore: 16,
      armFar: 16,
      foreFar: 8,
    },
    exec: {
      ...STAND,
      torso: 71.5,
      head: -12,
      thigh: -71.5,
      shin: -71.5,
      foot: 26.5,
      thighFar: -71.5,
      shinFar: -71.5,
      footFar: 26.5,
      arm: 0,
      fore: 0,
      armFar: 0,
      foreFar: 0,
      hand: 90,
      handFar: 90,
    },
  },
  jogging: {
    start: {
      ...STAND,
      torso: 16,
      head: -10,
      thigh: 22.6,
      shin: 7.5,
      thighFar: -21.4,
      shinFar: 10.6,
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
      thigh: 61,
      shin: 9.5,
      thighFar: 50.7,
      shinFar: 34.1,
      arm: -6,
      fore: -2,
      armFar: -6,
      foreFar: -2,
      prop: "dip",
    },
    exec: {
      ...STAND,
      torso: -36,
      head: 6,
      thigh: 69.8,
      shin: 12.5,
      thighFar: 59.4,
      shinFar: 36.6,
      arm: -68,
      fore: 6,
      armFar: -68,
      foreFar: 6,
      prop: "dip",
    },
  },
  lunges: {
    start: { ...STAND },
    exec: {
      ...STAND,
      torso: 6,
      thigh: 82.5,
      shin: 4,
      thighFar: 0,
      shinFar: -100.6,
      footFar: 19.4,
      arm: -20,
      fore: -10,
      armFar: 16,
      foreFar: 26,
    },
  },
  squats: {
    start: { ...STAND },
    exec: {
      ...STAND,
      torso: 32,
      head: -22,
      thigh: 67.8,
      shin: 15.4,
      thighFar: 57.3,
      shinFar: 37.7,
      arm: 48,
      fore: 72,
      armFar: 40,
      foreFar: 64,
    },
  },
  "push-ups": {
    start: {
      ...STAND,
      torso: 71.5,
      head: -12,
      thigh: -71.5,
      shin: -71.5,
      foot: 26.5,
      thighFar: -71.5,
      shinFar: -71.5,
      footFar: 26.5,
      arm: 0,
      fore: 0,
      armFar: 0,
      foreFar: 0,
      hand: 90,
      handFar: 90,
    },
    exec: {
      ...STAND,
      torso: 88.6,
      head: -12,
      thigh: -88.6,
      shin: -88.6,
      foot: 20.1,
      thighFar: -88.6,
      shinFar: -88.6,
      footFar: 20.1,
      arm: -99.6,
      fore: 26.9,
      armFar: -99.6,
      foreFar: 26.9,
      hand: 90,
      handFar: 90,
    },
  },
  "sit-ups": {
    start: {
      ...STAND,
      torso: -90.8,
      head: -10,
      thigh: 127.7,
      shin: -32.4,
      foot: 88,
      thighFar: 126.3,
      shinFar: -34.5,
      footFar: 88,
      arm: 172,
      fore: 168,
      armFar: 164,
      foreFar: 160,
    },
    exec: {
      ...STAND,
      torso: -34,
      head: -4,
      thigh: 127.6,
      shin: 40.3,
      foot: 88,
      thighFar: 126.4,
      shinFar: 41.9,
      footFar: 88,
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
      thigh: 107.9,
      shin: 26.8,
      thighFar: 100.7,
      shinFar: 40.3,
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
      thigh: 107.9,
      shin: 26.8,
      thighFar: 100.7,
      shinFar: 40.3,
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
      torso: 77.8,
      head: -14,
      thigh: 0,
      shin: -105.5,
      foot: 10.1,
      thighFar: 0,
      shinFar: -105.5,
      footFar: 10.1,
      arm: 0,
      fore: 0,
      armFar: 0,
      foreFar: 0,
      hand: 90,
      handFar: 90,
    },
    exec: {
      ...STAND,
      torso: 126,
      head: 4,
      thigh: -43,
      shin: -43,
      foot: 90,
      thighFar: -43,
      shinFar: -43,
      footFar: 90,
      arm: 54,
      fore: 54,
      armFar: 54,
      foreFar: 54,
      hand: 90,
      handFar: 90,
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
      thighR: 57.5,
      shinR: 53.5,
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
      thigh: 6,
      shin: -83.2,
      foot: -66.8,
      thighFar: 0,
      shinFar: -83.9,
      footFar: -66,
      arm: 14,
      fore: 8,
      armFar: -6,
      foreFar: -2,
      hem: 0.4,
      soleUp: true,
      soleUpFar: true,
    },
    exec: {
      ...STAND,
      torso: 102,
      head: 10.1,
      thigh: 67.5,
      shin: -82.9,
      foot: -67.2,
      thighFar: 67.5,
      shinFar: -82.9,
      footFar: -67.2,
      arm: 72,
      fore: 83.6,
      armFar: 72,
      foreFar: 83.6,
      soleUp: true,
      soleUpFar: true,
      hand: 90,
      handFar: 90,
    },
  },
  cobra: {
    start: {
      ...STAND,
      torso: 93.3,
      head: -22,
      thigh: -80.7,
      shin: -82.2,
      foot: -67.7,
      thighFar: -80.7,
      shinFar: -82.2,
      footFar: -67.7,
      arm: -106.1,
      fore: 42.9,
      armFar: -106.1,
      foreFar: 42.9,
      soleUp: true,
      soleUpFar: true,
      hand: 90,
      handFar: 90,
    },
    exec: {
      ...STAND,
      torso: 35.1,
      head: -42,
      thigh: -80.7,
      shin: -82.2,
      foot: -67.7,
      thighFar: -80.7,
      shinFar: -82.2,
      footFar: -67.7,
      arm: -10,
      fore: 13.8,
      armFar: -10,
      foreFar: 13.8,
      soleUp: true,
      soleUpFar: true,
      hand: 90,
      handFar: 90,
    },
  },
  "hip-flexor": {
    start: {
      ...STAND,
      torso: 2,
      head: -4,
      thigh: 6,
      shin: -83.2,
      foot: -66.8,
      thighFar: 0,
      shinFar: -83.9,
      footFar: -66,
      arm: 14,
      fore: 8,
      armFar: -6,
      foreFar: -2,
      hem: 0.4,
      soleUp: true,
      soleUpFar: true,
    },
    exec: {
      ...STAND,
      torso: -6,
      head: 2,
      thigh: 84.1,
      shin: 6,
      thighFar: -3.7,
      shinFar: -82.5,
      footFar: -67.6,
      arm: 36,
      fore: 18,
      armFar: 8,
      foreFar: 2,
      soleUpFar: true,
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
      thigh: 4.9,
      shin: 1.7,
      thighFar: -5.1,
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
      thigh: 11.9,
      shin: 5.2,
      thighFar: -12.1,
      shinFar: -4.8,
      arm: 57.6,
      fore: 56.8,
      armFar: 65.9,
      foreFar: 63.4,
      prop: "wall",
      hand: 180,
      handFar: 180,
    },
    exec: {
      ...STAND,
      torso: 16,
      head: -10,
      thigh: 38.1,
      shin: 22,
      thighFar: -33.9,
      shinFar: -30,
      footFar: 82,
      arm: 62.1,
      fore: 61.4,
      armFar: 71.9,
      foreFar: 69.7,
      prop: "wall",
      hand: 180,
      handFar: 180,
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

function lerpPt(a: Pt, b: Pt, t: number): Pt {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function catmull(p0: number, p1: number, p2: number, p3: number, f: number): number {
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * f +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * f * f +
      (-p0 + 3 * p1 - 3 * p2 + p3) * f * f * f)
  );
}

/** Smooth radius along a limb: a spline through the muscle profile, not straight facets. */
function radiusAt(radii: number[], t: number): number {
  const n = radii.length - 1;
  if (n <= 0) return radii[0];
  const x = Math.min(1, Math.max(0, t)) * n;
  const i = Math.min(n - 1, Math.floor(x));
  const f = x - i;
  const g = (k: number) => radii[Math.max(0, Math.min(n, k))];
  return Math.max(0.2, catmull(g(i - 1), g(i), g(i + 1), g(i + 2), f));
}

const LIMB_STEPS = 18;
const CAP_STEPS = 12;

/** r: radii on the +normal side; rb (optional): radii on the other side. */
type Seg = { a: Pt; b: Pt; r: number[]; rb?: number[] };

/** Thick limb with a muscle profile and round ends so joints fuse into one body. */
function solidLimb(a: Pt, b: Pt, radii: number[], back: number[] = radii): Pt[] {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;
  const pts: Pt[] = [];
  for (let i = 0; i <= LIMB_STEPS; i++) {
    const t = i / LIMB_STEPS;
    const r = radiusAt(radii, t);
    pts.push({ x: a.x + dx * t + px * r, y: a.y + dy * t + py * r });
  }
  for (let i = 1; i < CAP_STEPS; i++) {
    const ang = (Math.PI * i) / CAP_STEPS;
    const rb = radiusAt(radii, 1) + (radiusAt(back, 1) - radiusAt(radii, 1)) * (i / CAP_STEPS);
    pts.push({
      x: b.x + Math.cos(ang) * px * rb + Math.sin(ang) * ux * rb,
      y: b.y + Math.cos(ang) * py * rb + Math.sin(ang) * uy * rb,
    });
  }
  for (let i = LIMB_STEPS; i >= 0; i--) {
    const t = i / LIMB_STEPS;
    const r = radiusAt(back, t);
    pts.push({ x: a.x + dx * t - px * r, y: a.y + dy * t - py * r });
  }
  for (let i = 1; i < CAP_STEPS; i++) {
    const ang = (Math.PI * i) / CAP_STEPS;
    const ra = radiusAt(back, 0) + (radiusAt(radii, 0) - radiusAt(back, 0)) * (i / CAP_STEPS);
    pts.push({
      x: a.x - Math.cos(ang) * px * ra - Math.sin(ang) * ux * ra,
      y: a.y - Math.cos(ang) * py * ra - Math.sin(ang) * uy * ra,
    });
  }
  return pts;
}

/** Point on a limb: t along its length, off as a signed fraction of the local radius. */
function segAt(seg: Seg, t: number, off: number): Pt {
  const dx = seg.b.x - seg.a.x;
  const dy = seg.b.y - seg.a.y;
  const len = Math.hypot(dx, dy) || 1;
  const r = radiusAt(off < 0 && seg.rb ? seg.rb : seg.r, t) * off;
  return { x: seg.a.x + dx * t + (-dy / len) * r, y: seg.a.y + dy * t + (dx / len) * r };
}

function segPts(seg: Seg, pairs: [number, number][]): Pt[] {
  return pairs.map(([t, off]) => segAt(seg, t, off));
}

/** Lens-shaped muscle belly lying along a limb. */
function segLens(seg: Seg, t0: number, t1: number, center: number, half: number, n = 16): Pt[] {
  const top: Pt[] = [];
  const bot: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const t = t0 + (t1 - t0) * u;
    const b = Math.pow(Math.sin(Math.PI * u), 0.75);
    top.push(segAt(seg, t, center + half * b));
    bot.push(segAt(seg, t, center - half * b));
  }
  bot.reverse();
  return [...top, ...bot.slice(1, -1)];
}

function segAngle(seg: Seg): number {
  return (Math.atan2(seg.b.y - seg.a.y, seg.b.x - seg.a.x) * 180) / Math.PI;
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
/** Side view: the calf bulges behind, the shin front (tibia) stays nearly straight. */
const CALF_R = [12, 14.5, 22.5, 17, 10];
const TIBIA_R = [12, 13.2, 14.2, 11.6, 9.6];
const ARM_R = [11.5, 13.5, 12, 9.5];
/** Forearm: full below the elbow, tapering to a slim wrist. */
const FORE_R = [9, 10.2, 8.4, 6.4, 5];
/** Hand, wrist to fingertips: palm widens a little, fingers taper to a round tip. */
const HAND_R = [4.6, 5.5, 5.9, 5.5, 4.7, 3.9];
const HAND_LEN = 20;

type Raw = {
  /** Body part this shape belongs to (e.g. "handN", "footF", "torso"); "" for props. */
  tag?: string;
  pts: Pt[];
  fill: string;
  shade: Shade;
  sharp?: boolean;
  stroke?: string;
  width?: number;
  opacity?: number;
};

/** Body part currently being drawn; stamped on every shape for floor-contact checks. */
let TAG = "";
let SIDE = "";

function withTag<T>(tag: string, fn: () => T): T {
  const prev = TAG;
  TAG = tag;
  try {
    return fn();
  } finally {
    TAG = prev;
  }
}

function push(shapes: Raw[], pts: Pt[], fill: string, shade: Shade = "linear") {
  shapes.push({ pts, fill, shade, tag: TAG });
}

/** Hard-edged prop (bench, wall, floor): straight sides on purpose. */
function pushFlat(shapes: Raw[], pts: Pt[], fill: string) {
  shapes.push({ pts, fill, shade: false, sharp: true, tag: "" });
}

/** Translucent flat tone laid over a body part: muscle light and shadow. Not a blur. */
function glaze(shapes: Raw[], pts: Pt[], fill: string, opacity: number) {
  shapes.push({ pts, fill, shade: false, opacity, tag: TAG });
}

/** Thin open curve: hair strands, seams, folds, creases, laces. */
function line(shapes: Raw[], pts: Pt[], color: string, opacity: number, width: number) {
  shapes.push({ pts, fill: "none", shade: false, stroke: color, width, opacity, tag: TAG });
}

function lit(c: string): string {
  return mixHex(c, "#fff1e4", 0.34);
}

function dark(c: string): string {
  return mixHex(c, "#140c08", 0.46);
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

/** Side torso point: t from hip to shoulder, w > 0 toward the chest, w < 0 toward the back. */
function torsoAt(hip: Pt, shoulder: Pt, t: number, w: number): Pt {
  const { dx, dy, nx, ny } = spineFrame(hip, shoulder);
  const width = w >= 0 ? chestW(t) * w : backW(t) * w;
  return { x: hip.x + dx * t + nx * width, y: hip.y + dy * t + ny * width };
}

function torsoPts(hip: Pt, shoulder: Pt, pairs: [number, number][]): Pt[] {
  return pairs.map(([t, w]) => torsoAt(hip, shoulder, t, w));
}

function torsoLens(hip: Pt, shoulder: Pt, t0: number, t1: number, c: number, h: number): Pt[] {
  const top: Pt[] = [];
  const bot: Pt[] = [];
  const n = 16;
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const t = t0 + (t1 - t0) * u;
    const b = Math.pow(Math.sin(Math.PI * u), 0.75);
    top.push(torsoAt(hip, shoulder, t, c + h * b));
    bot.push(torsoAt(hip, shoulder, t, c - h * b));
  }
  bot.reverse();
  return [...top, ...bot.slice(1, -1)];
}

function sideTorso(hip: Pt, shoulder: Pt): Pt[] {
  return sideEdges(hip, shoulder, 0, 1, 40, () => 1, () => 1);
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
  return sideEdges(hip, shoulder, 0.3, 0.93, 28, strapFront, strapBack);
}


function sideWaist(hip: Pt, shoulder: Pt): Pt[] {
  return sideEdges(hip, shoulder, 0.34, 0.44, 10, () => 1, () => 1);
}

/** Lighter panel along the chest so the pec reads under the tank. */
function sideChest(hip: Pt, shoulder: Pt): Pt[] {
  const { dx, dy, nx, ny } = spineFrame(hip, shoulder);
  const outer: Pt[] = [];
  const inner: Pt[] = [];
  const n = 16;
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

/** Tank and shorts fabric on the side view: folds, bindings, seams, waistband. */
function sideTankDetail(shapes: Raw[], hip: Pt, shoulder: Pt, pal: Palette) {
  const T = (pairs: [number, number][]) => torsoPts(hip, shoulder, pairs);
  const fold = dark(pal.tank);
  const sheen = lit(pal.tankLite);
  glaze(shapes, torsoLens(hip, shoulder, 0.48, 0.9, -0.72, 0.24), fold, 0.34);
  glaze(shapes, torsoLens(hip, shoulder, 0.6, 0.86, 0.2, 0.18), sheen, 0.14);
  line(shapes, T([[0.55, 0.42], [0.53, 0.72], [0.56, 0.97]]), fold, 0.42, 0.9);
  line(shapes, T([[0.47, -0.92], [0.5, -0.4], [0.48, 0.2], [0.5, 0.9]]), fold, 0.46, 0.95);
  line(shapes, T([[0.485, -0.86], [0.515, -0.38], [0.497, 0.16]]), sheen, 0.3, 0.55);
  line(shapes, T([[0.54, -0.82], [0.57, -0.3], [0.555, 0.38]]), fold, 0.4, 0.85);
  line(shapes, T([[0.555, -0.76], [0.585, -0.28], [0.57, 0.3]]), sheen, 0.26, 0.5);
  line(shapes, T([[0.61, -0.7], [0.635, -0.22]]), fold, 0.34, 0.75);
  const front: [number, number][] = [];
  const back: [number, number][] = [];
  for (let i = 0; i <= 10; i++) {
    const t = 0.64 + (0.93 - 0.64) * (i / 10);
    front.push([t, strapFront(t) * 0.95]);
    const tb = 0.7 + (0.93 - 0.7) * (i / 10);
    back.push([tb, -strapBack(tb) * 0.95]);
  }
  line(shapes, T(front), pal.tankLite, 0.6, 0.85);
  line(shapes, T(back), pal.tankLite, 0.45, 0.75);
}

function sideShortsDetail(shapes: Raw[], hip: Pt, shoulder: Pt) {
  const T = (pairs: [number, number][]) => torsoPts(hip, shoulder, pairs);
  line(shapes, T([[0.34, -0.05], [0.18, -0.08], [0.02, -0.1]]), "#2e2e2e", 0.85, 0.6);
  line(shapes, T([[0.3, -0.8], [0.2, -0.55]]), "#000000", 0.45, 0.8);
}

function sideWaistDetail(shapes: Raw[], hip: Pt, shoulder: Pt) {
  const T = (pairs: [number, number][]) => torsoPts(hip, shoulder, pairs);
  line(shapes, T([[0.437, -0.95], [0.442, 0], [0.437, 0.95]]), "#3a3a3a", 0.75, 0.5);
  line(shapes, T([[0.35, -0.95], [0.354, 0], [0.35, 0.95]]), "#2a2a2a", 0.8, 0.45);
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

function frontAt(hip: Pt, shoulderY: number, t: number, w: number): Pt {
  return { x: hip.x + torsoHalf(t) * w, y: shoulderY + (hip.y - shoulderY) * t };
}

function frontPts(hip: Pt, shoulderY: number, pairs: [number, number][]): Pt[] {
  return pairs.map(([t, w]) => frontAt(hip, shoulderY, t, w));
}

function frontLens(hip: Pt, shoulderY: number, t0: number, t1: number, c: number, h: number): Pt[] {
  const top: Pt[] = [];
  const bot: Pt[] = [];
  const n = 16;
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const t = t0 + (t1 - t0) * u;
    const b = Math.pow(Math.sin(Math.PI * u), 0.75);
    top.push(frontAt(hip, shoulderY, t, c + h * b));
    bot.push(frontAt(hip, shoulderY, t, c - h * b));
  }
  bot.reverse();
  return [...top, ...bot.slice(1, -1)];
}

function frontTorso(hip: Pt, shoulderY: number): Pt[] {
  return frontBand(hip, shoulderY, 0, 1, 36, () => 1);
}

function frontArmhole(t: number): number {
  if (t > 0.18) return 1;
  return 1 - 0.18 * (1 - smooth(t / 0.18));
}

function frontTank(hip: Pt, shoulderY: number): Pt[] {
  return frontBand(hip, shoulderY, 0.02, 0.62, 24, frontArmhole);
}


function frontWaist(hip: Pt, shoulderY: number): Pt[] {
  return frontBand(hip, shoulderY, 0.54, 0.64, 10, () => 1);
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

function frontTankDetail(shapes: Raw[], hip: Pt, shoulderY: number, pal: Palette) {
  const F = (pairs: [number, number][]) => frontPts(hip, shoulderY, pairs);
  const fold = dark(pal.tank);
  const sheen = lit(pal.tankLite);
  for (const s of [-1, 1]) {
    glaze(shapes, frontLens(hip, shoulderY, 0.1, 0.6, 0.82 * s, 0.16), fold, 0.34);
    line(shapes, F([[0.41, -0.92 * s], [0.44, -0.5 * s], [0.42, -0.1 * s]]), fold, 0.38, 0.85);
    line(shapes, F([[0.5, -0.92 * s], [0.53, -0.46 * s], [0.515, -0.05 * s]]), fold, 0.42, 0.9);
    line(shapes, F([[0.505, -0.86 * s], [0.537, -0.44 * s]]), sheen, 0.28, 0.5);
    line(shapes, F([[0.04, 0.97 * s], [0.1, 0.92 * s], [0.18, 0.97 * s]]), pal.tankLite, 0.55, 0.8);
  }
  line(shapes, F([[0.53, -0.18], [0.545, 0.28]]), fold, 0.36, 0.75);
  line(shapes, F([[0.47, 0.18], [0.5, 0.55]]), fold, 0.32, 0.7);
  const scoop = frontScoop(hip, shoulderY);
  line(shapes, [...scoop.slice(1), scoop[0]], pal.tankLite, 0.6, 0.85);
}

function frontScoopDetail(shapes: Raw[], hip: Pt, shoulderY: number, pal: Palette) {
  const D = dark(pal.skin);
  for (const s of [-1, 1]) {
    line(
      shapes,
      [
        { x: hip.x + 2.5 * s, y: shoulderY + 4.2 },
        { x: hip.x + 8 * s, y: shoulderY + 2.6 },
        { x: hip.x + 14.5 * s, y: shoulderY + 2.2 },
      ],
      D,
      0.34,
      0.8
    );
  }
  glaze(shapes, worldOval({ x: hip.x, y: shoulderY + 5.2 }, 2.4, 1.7, 0), D, 0.3);
  glaze(shapes, worldOval({ x: hip.x, y: shoulderY + 10 }, 9, 3.5, 0), lit(pal.skin), 0.18);
}

function frontShortsDetail(shapes: Raw[], hip: Pt, shoulderY: number) {
  const F = (pairs: [number, number][]) => frontPts(hip, shoulderY, pairs);
  line(shapes, F([[0.64, 0], [0.82, 0], [1.0, 0]]), "#2e2e2e", 0.85, 0.6);
  line(shapes, F([[0.66, 0.05], [0.79, 0.18], [0.87, 0.04]]), "#2e2e2e", 0.65, 0.5);
  for (const s of [-1, 1]) {
    line(shapes, F([[0.86, -0.1 * s], [0.93, -0.36 * s], [0.99, -0.62 * s]]), "#000000", 0.5, 0.85);
    line(shapes, F([[0.85, -0.18 * s], [0.91, -0.44 * s]]), "#3d3d3d", 0.45, 0.5);
    line(shapes, F([[0.7, 0.92 * s], [0.84, 0.86 * s], [0.98, 0.9 * s]]), "#2e2e2e", 0.7, 0.55);
  }
}

function frontWaistDetail(shapes: Raw[], hip: Pt, shoulderY: number) {
  const F = (pairs: [number, number][]) => frontPts(hip, shoulderY, pairs);
  line(shapes, F([[0.545, -0.97], [0.541, 0], [0.545, 0.97]]), "#3a3a3a", 0.75, 0.5);
  line(shapes, F([[0.632, -0.97], [0.636, 0], [0.632, 0.97]]), "#2a2a2a", 0.8, 0.45);
  const knot = frontAt(hip, shoulderY, 0.6, 0);
  line(shapes, [{ x: knot.x - 1, y: knot.y }, { x: knot.x - 2.6, y: knot.y + 5 }, { x: knot.x - 2, y: knot.y + 10 }], "#d8d3cc", 0.92, 0.75);
  line(shapes, [{ x: knot.x + 1, y: knot.y }, { x: knot.x + 2.8, y: knot.y + 4.6 }, { x: knot.x + 3.4, y: knot.y + 9 }], "#d8d3cc", 0.92, 0.75);
  glaze(shapes, worldOval({ x: knot.x, y: knot.y }, 1.6, 1.2, 0), "#e7e2db", 0.95);
}

function worldOval(c: Pt, rx: number, ry: number, rotDeg: number, n = 24): Pt[] {
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

function localOval(cx: number, cy: number, rx: number, ry: number, rot = 0, n = 20): Pt[] {
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

/** Almond eye opening in head-local units. */
function almond(cx: number, cy: number, w: number, h: number, lower: number, lift = 0): Pt[] {
  const top: Pt[] = [];
  const bot: Pt[] = [];
  const n = 12;
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const x = cx - w + 2 * w * u;
    const s = Math.pow(Math.sin(Math.PI * u), 0.85);
    top.push({ x, y: cy + h * s + lift * (u - 0.5) });
    bot.push({ x, y: cy - h * lower * s + lift * (u - 0.5) });
  }
  bot.reverse();
  return [...top, ...bot.slice(1, -1)];
}

function almondTop(cx: number, cy: number, w: number, h: number, lift = 0, raise = 0): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i <= 12; i++) {
    const u = i / 12;
    pts.push({
      x: cx - w + 2 * w * u,
      y: cy + (h + raise) * Math.pow(Math.sin(Math.PI * u), 0.85) + lift * (u - 0.5),
    });
  }
  return pts;
}

/** Tapered shape between two curves: brows, lips. */
function band(upper: Pt[], lower: Pt[]): Pt[] {
  return [...upper, ...lower.slice().reverse()];
}

function polyLength(poly: Pt[]): number[] {
  const acc = [0];
  for (let i = 1; i < poly.length; i++) {
    acc.push(acc[i - 1] + Math.hypot(poly[i].x - poly[i - 1].x, poly[i].y - poly[i - 1].y));
  }
  return acc;
}

function samplePoly(poly: Pt[], s: number): Pt {
  const acc = polyLength(poly);
  const total = acc[acc.length - 1] || 1;
  const target = Math.min(1, Math.max(0, s)) * total;
  for (let i = 1; i < poly.length; i++) {
    if (acc[i] >= target) {
      const seg = acc[i] - acc[i - 1] || 1;
      return lerpPt(poly[i - 1], poly[i], (target - acc[i - 1]) / seg);
    }
  }
  return poly[poly.length - 1];
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

/** Outer and inner edges of the side hair, front to nape, for strand flow. */
const HAIR_SIDE_OUTER = HAIR_SIDE.slice(1, 8);
const HAIR_SIDE_INNER: Pt[] = [
  { x: 0.38, y: 0.6 },
  { x: 0.16, y: 0.52 },
  { x: -0.12, y: 0.54 },
  { x: -0.42, y: 0.22 },
  { x: -0.58, y: -0.2 },
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

const HAIR_FRONT_OUTER = HAIR_FRONT.slice(0, 9);
const HAIR_FRONT_INNER: Pt[] = [
  { x: -0.72, y: 0.14 },
  { x: -0.5, y: 0.32 },
  { x: -0.2, y: 0.18 },
  { x: 0, y: 0.34 },
  { x: 0.2, y: 0.18 },
  { x: 0.5, y: 0.32 },
  { x: 0.72, y: 0.14 },
];

function sideHairStrands(): { pts: Pt[]; light: boolean }[] {
  const out: { pts: Pt[]; light: boolean }[] = [];
  const count = 13;
  for (let k = 0; k < count; k++) {
    const f = 0.1 + (0.8 * k) / (count - 1);
    const start = 0.02 + 0.05 * ((k * 7) % 3);
    const end = 0.84 + 0.05 * ((k * 5) % 3);
    const pts: Pt[] = [];
    for (let i = 0; i <= 16; i++) {
      const s = start + ((end - start) * i) / 16;
      pts.push(lerpPt(samplePoly(HAIR_SIDE_INNER, s), samplePoly(HAIR_SIDE_OUTER, s), f));
    }
    out.push({ pts, light: k % 2 === 1 });
  }
  return out;
}

function frontHairStrands(): { pts: Pt[]; light: boolean }[] {
  const out: { pts: Pt[]; light: boolean }[] = [];
  const count = 17;
  for (let k = 0; k < count; k++) {
    const s = 0.03 + (0.94 * k) / (count - 1);
    const a = samplePoly(HAIR_FRONT_INNER, s);
    const start = { x: a.x, y: a.y + 0.05 };
    const end = samplePoly(HAIR_FRONT_OUTER, 0.5 + (s - 0.5) * 0.62);
    const mid = lerpPt(start, end, 0.5);
    const bulge = { x: mid.x + mid.x * 0.12, y: mid.y + 0.04 };
    const pts = [start, lerpPt(start, bulge, 0.55), bulge, lerpPt(bulge, end, 0.6), { x: end.x * 0.94, y: end.y - 0.04 }];
    out.push({ pts, light: k % 2 === 1 });
  }
  return out;
}

function pushHead(shapes: Raw[], plane: "side" | "front", center: Pt, tilt: number, pal: Palette) {
  const r = LEN.head;
  const H = (pts: Pt[]) => placeHead(center, tilt, r, pts);
  const W = (f: number) => f * r;
  const skinLit = lit(pal.skin);
  const skinDark = dark(pal.skin);
  const hairDark = mixHex(pal.hair, "#000000", 0.45);
  const hairLit = mixHex(pal.hair, "#fff1e4", 0.3);
  const lid = mixHex(pal.brow, "#000000", 0.25);
  const lipDark = mixHex(pal.mouth, "#140c08", 0.45);
  const lipLit = mixHex(pal.mouth, "#fff1e4", 0.3);
  const skull = plane === "side" ? PROFILE : FRONT_HEAD;
  push(shapes, H(skull), pal.skin, "radial");

  if (plane === "side") {
    glaze(shapes, H(localOval(0.3, -0.04, 0.2, 0.13, -0.2)), skinLit, 0.24);
    glaze(
      shapes,
      H(band(
        [{ x: -0.36, y: -0.5 }, { x: -0.06, y: -0.7 }, { x: 0.22, y: -0.72 }, { x: 0.38, y: -0.66 }],
        [{ x: -0.3, y: -0.64 }, { x: -0.02, y: -0.88 }, { x: 0.18, y: -0.86 }, { x: 0.36, y: -0.7 }]
      )),
      skinDark,
      0.16
    );
    line(shapes, H([{ x: 0.62, y: 0.14 }, { x: 0.71, y: 0.04 }, { x: 0.75, y: -0.02 }]), skinLit, 0.4, W(0.035));
    push(shapes, H(HAIR_SIDE), pal.hair, "radial");
    for (const strand of sideHairStrands()) {
      line(shapes, H(strand.pts), strand.light ? hairLit : hairDark, strand.light ? 0.42 : 0.55, W(strand.light ? 0.016 : 0.022));
    }

    push(shapes, H(localOval(-0.72, 0.02, 0.2, 0.28)), pal.skin);
    line(shapes, H([{ x: -0.6, y: 0.2 }, { x: -0.72, y: 0.26 }, { x: -0.86, y: 0.16 }, { x: -0.88, y: -0.04 }, { x: -0.8, y: -0.2 }]), skinDark, 0.5, W(0.035));
    glaze(shapes, H(localOval(-0.7, 0.0, 0.09, 0.16)), pal.skinDeep, 0.85);
    line(shapes, H([{ x: -0.74, y: 0.12 }, { x: -0.78, y: 0.0 }, { x: -0.72, y: -0.1 }]), skinLit, 0.45, W(0.022));
    glaze(shapes, H(localOval(-0.68, -0.21, 0.07, 0.06)), skinLit, 0.3);

    line(shapes, H(almondTop(0.5, 0.26, 0.13, 0.09, 0.02, 0.07)), skinDark, 0.32, W(0.022));
    push(shapes, H(almond(0.5, 0.26, 0.13, 0.09, 0.7, 0.02)), pal.sclera, false);
    push(shapes, H(localOval(0.545, 0.25, 0.062, 0.066)), pal.iris, false);
    glaze(shapes, H(localOval(0.545, 0.25, 0.04, 0.043)), mixHex(pal.iris, "#c08a5a", 0.35), 0.6);
    push(shapes, H(localOval(0.555, 0.245, 0.03, 0.032)), pal.pupil, false);
    glaze(shapes, H(localOval(0.57, 0.27, 0.014, 0.014)), "#ffffff", 0.92);
    line(shapes, H(almondTop(0.5, 0.26, 0.13, 0.09, 0.02, 0.006)), lid, 0.95, W(0.032));
    line(shapes, H([{ x: 0.4, y: 0.21 }, { x: 0.5, y: 0.195 }, { x: 0.6, y: 0.21 }]), skinDark, 0.38, W(0.016));
    line(shapes, H([{ x: 0.6, y: 0.33 }, { x: 0.66, y: 0.37 }]), lid, 0.85, W(0.014));
    line(shapes, H([{ x: 0.62, y: 0.31 }, { x: 0.69, y: 0.33 }]), lid, 0.85, W(0.014));
    line(shapes, H([{ x: 0.63, y: 0.28 }, { x: 0.7, y: 0.28 }]), lid, 0.8, W(0.012));
    push(
      shapes,
      H(band(
        [{ x: 0.3, y: 0.42 }, { x: 0.4, y: 0.47 }, { x: 0.52, y: 0.49 }, { x: 0.64, y: 0.45 }],
        [{ x: 0.31, y: 0.385 }, { x: 0.41, y: 0.425 }, { x: 0.52, y: 0.44 }, { x: 0.64, y: 0.43 }]
      )),
      pal.brow,
      false
    );
    line(shapes, H([{ x: 0.36, y: 0.43 }, { x: 0.44, y: 0.47 }]), mixHex(pal.brow, "#fff1e4", 0.2), 0.45, W(0.01));
    glaze(shapes, H(localOval(0.68, -0.07, 0.075, 0.055)), skinDark, 0.26);
    line(shapes, H([{ x: 0.6, y: -0.08 }, { x: 0.66, y: -0.115 }, { x: 0.71, y: -0.1 }]), pal.skinDeep, 0.6, W(0.024));
    glaze(shapes, H(localOval(0.75, -0.01, 0.035, 0.026)), skinLit, 0.45);
    line(shapes, H([{ x: 0.57, y: -0.05 }, { x: 0.55, y: -0.2 }, { x: 0.6, y: -0.34 }]), skinDark, 0.24, W(0.02));
    push(
      shapes,
      H(band(
        [{ x: 0.6, y: -0.285 }, { x: 0.67, y: -0.25 }, { x: 0.72, y: -0.245 }, { x: 0.765, y: -0.275 }],
        [{ x: 0.6, y: -0.3 }, { x: 0.68, y: -0.305 }, { x: 0.76, y: -0.3 }]
      )),
      pal.mouth,
      false
    );
    push(
      shapes,
      H(band(
        [{ x: 0.61, y: -0.305 }, { x: 0.68, y: -0.31 }, { x: 0.75, y: -0.305 }],
        [{ x: 0.62, y: -0.33 }, { x: 0.67, y: -0.37 }, { x: 0.73, y: -0.36 }]
      )),
      lipLit,
      false
    );
    line(shapes, H([{ x: 0.58, y: -0.3 }, { x: 0.68, y: -0.306 }, { x: 0.765, y: -0.3 }]), lipDark, 0.85, W(0.016));
    line(shapes, H([{ x: 0.63, y: -0.41 }, { x: 0.69, y: -0.43 }]), skinDark, 0.3, W(0.02));
    return;
  }

  for (const sx of [-1, 1]) {
    glaze(shapes, H(localOval(0.42 * sx, -0.18, 0.2, 0.12)), skinLit, 0.22);
  }
  glaze(
    shapes,
    H(band(
      [{ x: -0.55, y: -0.6 }, { x: -0.3, y: -0.9 }, { x: 0, y: -0.98 }, { x: 0.3, y: -0.9 }, { x: 0.55, y: -0.6 }],
      [{ x: -0.48, y: -0.56 }, { x: -0.25, y: -0.8 }, { x: 0, y: -0.86 }, { x: 0.25, y: -0.8 }, { x: 0.48, y: -0.56 }]
    )),
    skinDark,
    0.15
  );
  glaze(shapes, H(localOval(0, -0.8, 0.14, 0.07)), skinLit, 0.28);
  push(shapes, H(HAIR_FRONT), pal.hair, "radial");
  for (const strand of frontHairStrands()) {
    line(shapes, H(strand.pts), strand.light ? hairLit : hairDark, strand.light ? 0.42 : 0.55, W(strand.light ? 0.016 : 0.022));
  }
  for (const sx of [-1, 1]) {
    glaze(shapes, H(localOval(0.9 * sx, -0.08, 0.08, 0.14)), pal.skinDeep, 0.55);
    line(shapes, H([{ x: 0.93 * sx, y: 0.06 }, { x: 0.99 * sx, y: -0.06 }, { x: 0.95 * sx, y: -0.22 }]), skinDark, 0.45, W(0.025));
    const ex = 0.32 * sx;
    const lift = 0.02 * sx;
    line(shapes, H(almondTop(ex, 0.08, 0.15, 0.085, lift, 0.075)), skinDark, 0.3, W(0.022));
    push(shapes, H(almond(ex, 0.08, 0.15, 0.085, 0.75, lift)), pal.sclera, false);
    push(shapes, H(localOval(ex, 0.07, 0.062, 0.066)), pal.iris, false);
    glaze(shapes, H(localOval(ex, 0.07, 0.04, 0.043)), mixHex(pal.iris, "#c08a5a", 0.35), 0.6);
    push(shapes, H(localOval(ex, 0.065, 0.03, 0.032)), pal.pupil, false);
    glaze(shapes, H(localOval(ex - 0.02, 0.09, 0.015, 0.015)), "#ffffff", 0.92);
    line(shapes, H(almondTop(ex, 0.08, 0.15, 0.085, lift, 0.006)), lid, 0.95, W(0.032));
    line(shapes, H([{ x: ex - 0.12, y: 0.03 }, { x: ex, y: 0.005 }, { x: ex + 0.12, y: 0.03 }]), skinDark, 0.36, W(0.016));
    const outer = ex + 0.15 * sx;
    line(shapes, H([{ x: outer, y: 0.1 }, { x: outer + 0.05 * sx, y: 0.14 }]), lid, 0.85, W(0.014));
    line(shapes, H([{ x: outer - 0.04 * sx, y: 0.14 }, { x: outer + 0.01 * sx, y: 0.19 }]), lid, 0.8, W(0.012));
    push(
      shapes,
      H(band(
        [{ x: 0.13 * sx, y: 0.25 }, { x: 0.26 * sx, y: 0.31 }, { x: 0.4 * sx, y: 0.32 }, { x: 0.5 * sx, y: 0.28 }],
        [{ x: 0.13 * sx, y: 0.215 }, { x: 0.26 * sx, y: 0.265 }, { x: 0.4 * sx, y: 0.28 }, { x: 0.5 * sx, y: 0.265 }]
      )),
      pal.brow,
      false
    );
    line(shapes, H([{ x: 0.1 * sx, y: 0.12 }, { x: 0.105 * sx, y: -0.04 }, { x: 0.11 * sx, y: -0.12 }]), skinDark, 0.22, W(0.022));
    glaze(shapes, H(localOval(0.07 * sx, -0.2, 0.035, 0.022)), pal.skinDeep, 0.75);
    line(shapes, H([{ x: 0.06 * sx, y: -0.13 }, { x: 0.12 * sx, y: -0.16 }, { x: 0.11 * sx, y: -0.21 }]), skinDark, 0.4, W(0.018));
    line(shapes, H([{ x: 0.2 * sx, y: -0.24 }, { x: 0.24 * sx, y: -0.36 }, { x: 0.22 * sx, y: -0.46 }]), skinDark, 0.18, W(0.02));
  }
  glaze(shapes, H(localOval(0, -0.12, 0.05, 0.04)), skinLit, 0.45);
  line(shapes, H([{ x: -0.025, y: -0.27 }, { x: -0.03, y: -0.38 }]), skinDark, 0.24, W(0.014));
  line(shapes, H([{ x: 0.025, y: -0.27 }, { x: 0.03, y: -0.38 }]), skinDark, 0.24, W(0.014));
  push(
    shapes,
    H(band(
      [{ x: -0.17, y: -0.47 }, { x: -0.07, y: -0.42 }, { x: 0, y: -0.435 }, { x: 0.07, y: -0.42 }, { x: 0.17, y: -0.47 }],
      [{ x: -0.17, y: -0.475 }, { x: 0, y: -0.48 }, { x: 0.17, y: -0.475 }]
    )),
    pal.mouth,
    false
  );
  push(
    shapes,
    H(band(
      [{ x: -0.15, y: -0.48 }, { x: 0, y: -0.485 }, { x: 0.15, y: -0.48 }],
      [{ x: -0.14, y: -0.5 }, { x: -0.07, y: -0.555 }, { x: 0, y: -0.565 }, { x: 0.07, y: -0.555 }, { x: 0.14, y: -0.5 }]
    )),
    lipLit,
    false
  );
  line(shapes, H([{ x: -0.19, y: -0.465 }, { x: 0, y: -0.483 }, { x: 0.19, y: -0.465 }]), lipDark, 0.85, W(0.016));
  glaze(shapes, H(localOval(0, -0.52, 0.05, 0.015)), "#ffffff", 0.2);
  line(shapes, H([{ x: -0.07, y: -0.64 }, { x: 0, y: -0.66 }, { x: 0.07, y: -0.64 }]), skinDark, 0.3, W(0.02));
}

function neckDetail(shapes: Raw[], neck: Seg, skin: string, front: boolean) {
  const L = lit(skin);
  const D = dark(skin);
  if (front) {
    glaze(shapes, segLens(neck, 0.6, 1.0, 0, 0.8), D, 0.3);
    line(shapes, segPts(neck, [[0.92, 0.55], [0.5, 0.32], [0.06, 0.1]]), D, 0.26, 0.8);
    line(shapes, segPts(neck, [[0.92, -0.55], [0.5, -0.32], [0.06, -0.1]]), D, 0.26, 0.8);
    glaze(shapes, segLens(neck, 0.15, 0.55, 0, 0.18), L, 0.22);
    return;
  }
  glaze(shapes, segLens(neck, 0.55, 1.0, 0.35, 0.55), D, 0.32);
  line(shapes, segPts(neck, [[0.95, -0.5], [0.5, 0.1], [0.06, 0.6]]), D, 0.26, 0.8);
  glaze(shapes, segLens(neck, 0.0, 0.5, -0.5, 0.34), L, 0.24);
}

function footFrame(ankle: Pt, deg: number, up = false) {
  const d = dir(deg);
  let nx = -d.y;
  let ny = d.x;
  // The sole faces the floor, unless the foot lies on its laces (prone, kneeling).
  if (up ? ny > 0 : ny < 0) {
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

function at(p: Pt, d: Pt, along: number, n: Pt, down: number): Pt {
  return { x: p.x + d.x * along + n.x * down, y: p.y + d.y * along + n.y * down };
}

function footPoly(ankle: Pt, deg: number, up = false): Pt[] {
  const { n, heel, mid, ball, toe } = footFrame(ankle, deg, up);
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

function solePoly(ankle: Pt, deg: number, up = false): Pt[] {
  const { n, heel, ball, toe } = footFrame(ankle, deg, up);
  return [
    { x: heel.x + n.x * 7, y: heel.y + n.y * 7 },
    { x: ball.x + n.x * 7, y: ball.y + n.y * 7 },
    { x: toe.x + n.x * 4, y: toe.y + n.y * 4 },
    { x: toe.x + n.x * 10, y: toe.y + n.y * 10 },
    { x: ball.x + n.x * 14, y: ball.y + n.y * 14 },
    { x: heel.x + n.x * 14, y: heel.y + n.y * 14 },
  ];
}

function shoeStripe(ankle: Pt, deg: number, up = false): Pt[] {
  const { n, d, mid } = footFrame(ankle, deg, up);
  const a = add(mid, d, -1);
  const b = add(mid, d, 7);
  return [
    { x: a.x + n.x * 1, y: a.y + n.y * 1 },
    { x: b.x + n.x * 1, y: b.y + n.y * 1 },
    { x: b.x + n.x * 12, y: b.y + n.y * 12 },
    { x: a.x + n.x * 11, y: a.y + n.y * 11 },
  ];
}

/** Trainer: upper, heel counter, toe cap, midsole, outsole tread, swoosh stripe, laces. */
function pushShoe(shapes: Raw[], ankle: Pt, deg: number, upper: string, pal: Palette, up = false) {
  withTag("foot" + SIDE, () => drawShoe(shapes, ankle, deg, upper, pal, up));
}

function drawShoe(shapes: Raw[], ankle: Pt, deg: number, upper: string, pal: Palette, up: boolean) {
  const { d, n, heel, ball, toe } = footFrame(ankle, deg, up);
  push(shapes, footPoly(ankle, deg, up), upper);
  glaze(shapes, worldOval(at(heel, d, 2.5, n, 6), 4.6, 5.6, deg), dark(upper), 0.22);
  line(shapes, [at(ball, d, 3, n, -1.5), at(ball, d, 8, n, 3), at(ball, d, 7, n, 9)], dark(upper), 0.35, 0.7);
  line(shapes, [at(heel, d, 1, n, 0.5), at(ankle, d, -2, n, -3.2), at(ankle, d, 3, n, -4)], dark(upper), 0.4, 0.75);
  push(shapes, solePoly(ankle, deg, up), pal.sole, false);
  line(shapes, [at(heel, d, 0.5, n, 8.6), at(ball, d, 0, n, 8.6), at(toe, d, -2, n, 6)], "#f4f1ec", 0.85, 1.3);
  for (let i = 0; i < 6; i++) {
    const p = add(heel, d, 3 + i * 5.2);
    line(shapes, [at(p, d, 0, n, 11.5), at(p, d, 1.6, n, 13.6)], "#4a4440", 0.8, 0.55);
  }
  push(shapes, shoeStripe(ankle, deg, up), pal.stripe, false);
  line(shapes, [at(ankle, d, 3, n, 3), at(ankle, d, 11, n, 9.5)], mixHex(pal.stripe, "#fff1e4", 0.3), 0.6, 0.45);
  for (let i = 0; i < 4; i++) {
    const p = add(ankle, d, 1 + i * 3.8);
    line(shapes, [at(p, d, -0.6, n, -3.6), at(p, d, 1.6, n, -1.2)], "#8f8981", 0.95, 0.9);
    glaze(shapes, worldOval(at(p, d, -0.8, n, -0.8), 0.7, 0.7, 0, 10), "#5d5751", 0.8);
  }
}

type Chain = { knee: Pt; end: Pt; toe: Pt; parts: Pt[][]; segs: Seg[]; thumbSide?: number; soleUp?: boolean };

function limbChain(
  origin: Pt,
  upperDeg: number,
  foreDeg: number,
  kind: "arm" | "leg",
  footDeg?: number,
  handDeg?: number,
  soleUp = false
): Chain {
  const upperLen = kind === "arm" ? LEN.upper : LEN.thigh;
  const lowerLen = kind === "arm" ? LEN.fore : LEN.shin;
  const dUpper = dir(upperDeg);
  const dLower = dir(foreDeg);
  const knee = add(origin, dUpper, upperLen);
  const end = add(knee, dLower, lowerLen);
  if (kind === "arm") {
    const root = add(origin, dUpper, -4);
    const elbow = add(knee, dLower, -8);
    // Hands follow the forearm unless planted (e.g. flat on the floor).
    const dHand = handDeg === undefined ? dLower : dir(handDeg);
    const hand = add(end, dHand, HAND_LEN - 2);
    const wrist = add(end, dHand, -2);
    const segs: Seg[] = [
      { a: root, b: knee, r: ARM_R },
      { a: elbow, b: end, r: FORE_R },
      { a: wrist, b: hand, r: HAND_R },
    ];
    return { knee, end, toe: hand, parts: segs.map((s) => solidLimb(s.a, s.b, s.r)), segs };
  }
  const root = add(origin, dUpper, -8);
  const kneeIn = add(knee, dLower, -8);
  const segs: Seg[] = [
    { a: root, b: knee, r: THIGH_R },
    { a: kneeIn, b: end, r: SHIN_R },
  ];
  const fd = footDeg ?? autoFoot(foreDeg);
  const toe = add(end, dir(fd), LEN.foot);
  return { knee, end, toe, parts: [...segs.map((s) => solidLimb(s.a, s.b, s.r)), footPoly(end, fd, soleUp)], segs, soleUp };
}


/**
 * Muscle definition. ant = which side of the limb faces forward (-1 or 1 in side view,
 * 0 when the limb faces the camera); med = inner side of the limb in the front view.
 */
function upperArmMuscles(shapes: Raw[], seg: Seg, skin: string, ant: number, med: number) {
  const L = lit(skin);
  const D = dark(skin);
  glaze(shapes, segLens(seg, 0.02, 0.44, 0, 0.74), L, 0.34);
  line(shapes, segPts(seg, [[0.3, -0.9], [0.45, 0], [0.3, 0.9]]), D, 0.26, 0.9);
  if (ant !== 0) {
    glaze(shapes, segLens(seg, 0.4, 0.9, ant * 0.4, 0.42), L, 0.4);
    glaze(shapes, segLens(seg, 0.34, 0.94, -ant * 0.52, 0.34), D, 0.3);
    line(shapes, segPts(seg, [[0.46, -ant * 0.06], [0.66, -ant * 0.1], [0.86, -ant * 0.08]]), D, 0.26, 0.8);
  } else {
    glaze(shapes, segLens(seg, 0.4, 0.9, -med * 0.1, 0.4), L, 0.38);
    glaze(shapes, segLens(seg, 0.3, 0.95, 0.8, 0.18), D, 0.3);
    glaze(shapes, segLens(seg, 0.3, 0.95, -0.8, 0.18), D, 0.3);
  }
}

function forearmMuscles(shapes: Raw[], seg: Seg, skin: string, ant: number, med: number) {
  const L = lit(skin);
  const D = dark(skin);
  const lead = ant !== 0 ? ant : -med;
  glaze(shapes, segLens(seg, 0.06, 0.6, lead * 0.28, 0.5), L, 0.36);
  glaze(shapes, segLens(seg, 0.12, 0.9, -lead * 0.56, 0.3), D, 0.28);
  line(shapes, segPts(seg, [[0.2, -lead * 0.05], [0.5, lead * 0.1], [0.85, lead * 0.2]]), D, 0.22, 0.7);
  glaze(shapes, segLens(seg, 0.86, 1.0, 0, 0.5), D, 0.16);
}

/** Fingers held together (three thin separations) plus a separate thumb on thumbSide. */
function handDetail(shapes: Raw[], seg: Seg, skin: string, thumbSide: number) {
  const L = lit(skin);
  const D = dark(skin);
  const side = thumbSide >= 0 ? 1 : -1;
  glaze(shapes, segLens(seg, 0.06, 0.5, -side * 0.1, 0.55), L, 0.22);
  line(shapes, segPts(seg, [[0.5, -0.85], [0.47, 0], [0.5, 0.85]]), D, 0.22, 0.4);
  for (const off of [-0.42, 0, 0.42]) {
    line(shapes, segPts(seg, [[0.55, off], [0.75, off * 0.95], [0.93, off * 0.75]]), D, 0.34, 0.38);
  }
  const base = segAt(seg, 0.14, side * 0.62);
  const tip = segAt(seg, 0.6, side * 1.38);
  const thumb: Seg = { a: base, b: tip, r: [2.9, 2.7, 2.2] };
  push(shapes, solidLimb(thumb.a, thumb.b, thumb.r), skin);
  line(shapes, segPts(thumb, [[0.15, -side * 0.9], [0.45, -side * 0.95], [0.75, -side * 0.85]]), D, 0.3, 0.4);
  glaze(shapes, worldOval(segAt(thumb, 0.92, side * 0.1), 1.4, 1.1, segAngle(thumb)), L, 0.4);
}

function thighMuscles(shapes: Raw[], seg: Seg, skin: string, ant: number, med: number) {
  const L = lit(skin);
  const D = dark(skin);
  const angle = segAngle(seg);
  if (ant !== 0) {
    glaze(shapes, segLens(seg, 0.42, 0.92, ant * 0.36, 0.44), L, 0.38);
    glaze(shapes, segLens(seg, 0.7, 0.97, ant * 0.6, 0.26), L, 0.3);
    line(shapes, segPts(seg, [[0.46, -ant * 0.02], [0.68, ant * 0.06], [0.88, ant * 0.12]]), D, 0.26, 0.85);
    glaze(shapes, segLens(seg, 0.4, 0.96, -ant * 0.6, 0.32), D, 0.3);
    glaze(shapes, worldOval(segAt(seg, 0.985, ant * 0.62), 6, 4.4, angle), L, 0.34);
    return;
  }
  glaze(shapes, segLens(seg, 0.42, 0.92, -med * 0.05, 0.42), L, 0.36);
  glaze(shapes, segLens(seg, 0.68, 0.96, med * 0.5, 0.3), L, 0.34);
  glaze(shapes, segLens(seg, 0.4, 0.96, -med * 0.72, 0.22), D, 0.28);
  line(shapes, segPts(seg, [[0.48, -med * 0.3], [0.7, -med * 0.26], [0.9, -med * 0.2]]), D, 0.22, 0.8);
  glaze(shapes, worldOval(segAt(seg, 0.98, 0), 6, 5, angle), L, 0.34);
}

function shinMuscles(shapes: Raw[], seg: Seg, skin: string, ant: number, med: number) {
  const L = lit(skin);
  const D = dark(skin);
  if (ant !== 0) {
    glaze(shapes, segLens(seg, 0.1, 0.62, -ant * 0.44, 0.46), L, 0.36);
    line(shapes, segPts(seg, [[0.22, -ant * 0.15], [0.44, -ant * 0.28], [0.66, -ant * 0.38]]), D, 0.24, 0.8);
    glaze(shapes, segLens(seg, 0.66, 0.98, -ant * 0.55, 0.24), D, 0.3);
    glaze(shapes, segLens(seg, 0.08, 0.86, ant * 0.66, 0.16), L, 0.3);
    glaze(shapes, segLens(seg, 0.0, 0.16, ant * 0.2, 0.5), D, 0.2);
    return;
  }
  glaze(shapes, segLens(seg, 0.1, 0.6, med * 0.5, 0.36), L, 0.32);
  glaze(shapes, segLens(seg, 0.12, 0.62, -med * 0.6, 0.28), L, 0.24);
  glaze(shapes, segLens(seg, 0.08, 0.88, -med * 0.05, 0.16), L, 0.3);
  line(shapes, segPts(seg, [[0.12, med * 0.18], [0.5, med * 0.14], [0.86, med * 0.1]]), D, 0.2, 0.7);
}

function pushThigh(shapes: Raw[], leg: Chain, skin: string, ant: number, med: number) {
  withTag("thigh" + SIDE, () => {
    push(shapes, leg.parts[0], skin);
    thighMuscles(shapes, leg.segs[0], skin, ant, med);
  });
}

function pushShin(shapes: Raw[], leg: Chain, skin: string, ant: number, med: number) {
  withTag("shin" + SIDE, () => {
    push(shapes, leg.parts[1], skin);
    shinMuscles(shapes, leg.segs[1], skin, ant, med);
  });
}

function pushLeg(
  shapes: Raw[],
  leg: Chain,
  footDeg: number,
  skin: string,
  shoe: string,
  pal: Palette,
  ant: number,
  med: number
) {
  pushThigh(shapes, leg, skin, ant, med);
  pushShin(shapes, leg, skin, ant, med);
  pushShoe(shapes, leg.end, footDeg, shoe, pal, leg.soleUp);
}

function monotoneHull(points: Pt[]): Pt[] {
  const pts = points.slice().sort((a, b) => a.x - b.x || a.y - b.y);
  if (pts.length < 3) return pts;
  const cross = (o: Pt, a: Pt, b: Pt) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lower: Pt[] = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper: Pt[] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  upper.pop();
  lower.pop();
  return [...lower, ...upper];
}

/** Hull points resampled densely so the smooth outline hugs the hull instead of bowing out. */
function denseLoop(loop: Pt[], step = 3): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < loop.length; i++) {
    const a = loop[i];
    const b = loop[(i + 1) % loop.length];
    const n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / step));
    for (let k = 0; k < n; k++) out.push(lerpPt(a, b, k / n));
  }
  return out;
}

/** Shorts leg: loose tube over the upper thigh, same axis as the thigh, round at the hip. */
function shortsTube(origin: Pt, thighDeg: number): Seg {
  const d = dir(thighDeg);
  return { a: add(origin, d, -8), b: add(origin, d, LEN.thigh), r: THIGH_R.map((r) => r * 1.07) };
}

const SHORTS_HEM_T = 0.5;

function tubeOutline(seg: Seg, t1: number): Pt[] {
  const steps = 16;
  const pts: Pt[] = [];
  for (let i = 0; i <= steps; i++) pts.push(segAt(seg, (t1 * i) / steps, 1));
  for (let i = steps; i >= 0; i--) pts.push(segAt(seg, (t1 * i) / steps, -1));
  const dx = seg.b.x - seg.a.x;
  const dy = seg.b.y - seg.a.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const r = radiusAt(seg.r, 0);
  for (let i = 1; i < CAP_STEPS; i++) {
    const ang = (Math.PI * i) / CAP_STEPS;
    pts.push({
      x: seg.a.x - Math.cos(ang) * -uy * r - Math.sin(ang) * ux * r,
      y: seg.a.y - Math.cos(ang) * ux * r - Math.sin(ang) * uy * r,
    });
  }
  return pts;
}

/**
 * Pelvis part of the shorts: one piece wrapping the lower torso, the glutes and the
 * near thigh root, so the garment reads as continuous with both legs.
 */
function shortsPelvis(band: Pt[], roots: Seg[]): Pt[] {
  const pts = [...band];
  for (const root of roots) {
    // Hip joint (8 units down the tube); the tube's own round cap covers the thigh root.
    const len = Math.hypot(root.b.x - root.a.x, root.b.y - root.a.y) || 1;
    const t = 8 / len;
    const r = radiusAt(root.r, t);
    pts.push(...worldOval(segAt(root, t, 0), r, r, 0, 28));
  }
  return denseLoop(monotoneHull(pts));
}

function pushShortsLeg(shapes: Raw[], seg: Seg, fill: string, ant: number, med: number, hem = SHORTS_HEM_T) {
  // Detail is laid out for the default hem; scale it with a shorter/longer leg.
  const k = hem / SHORTS_HEM_T;
  shapes.push({ pts: tubeOutline(seg, hem), fill, shade: false, tag: "shorts" });
  const lead = ant !== 0 ? ant : med;
  glaze(shapes, segLens(seg, 0.1 * k, 0.46 * k, lead * 0.4, 0.34), lit(fill), 0.09);
  line(shapes, segPts(seg, [[0.488 * k, -0.97], [0.5 * k, 0], [0.488 * k, 0.97]]), "#050505", 0.7, 1.1);
  line(shapes, segPts(seg, [[0.455 * k, -0.95], [0.468 * k, 0], [0.455 * k, 0.95]]), "#3a3a3a", 0.7, 0.4);
  line(shapes, segPts(seg, [[0.12 * k, lead * 0.7], [0.27 * k, lead * 0.35], [0.43 * k, lead * 0.1]]), "#000000", 0.5, 0.9);
  line(shapes, segPts(seg, [[0.14 * k, lead * 0.55], [0.29 * k, lead * 0.2], [0.44 * k, -lead * 0.05]]), "#3d3d3d", 0.5, 0.6);
  if (ant !== 0) {
    line(shapes, segPts(seg, [[0.04 * k, -ant * 0.05], [0.26 * k, -ant * 0.08], [0.49 * k, -ant * 0.1]]), "#2e2e2e", 0.8, 0.6);
  }
}

function pushArm(shapes: Raw[], arm: Chain, skin: string, ant: number, med: number) {
  withTag("upper" + SIDE, () => {
    push(shapes, arm.parts[0], skin);
    upperArmMuscles(shapes, arm.segs[0], skin, ant, med);
  });
  withTag("fore" + SIDE, () => {
    push(shapes, arm.parts[1], skin);
    forearmMuscles(shapes, arm.segs[1], skin, ant, med);
  });
  withTag("hand" + SIDE, () => {
    push(shapes, arm.parts[2], skin);
    handDetail(shapes, arm.segs[2], skin, arm.thumbSide ?? (ant !== 0 ? ant : med));
  });
}

function autoFoot(shin: number): number {
  const n = ((shin % 360) + 360) % 360;
  const distDown = Math.min(n, 360 - n);
  if (distDown < 58) return 86;
  if (n > 180 && n < 345) return 14;
  return 86;
}

function num(v: number): string {
  return (Math.round(v * 100) / 100).toString();
}

function linePath(pts: Pt[], closed: boolean): string {
  return pts.map((p, i) => `${i === 0 ? "M" : "L"}${num(p.x)} ${num(p.y)}`).join("") + (closed ? "Z" : "");
}

/**
 * Smooth outline: a Catmull-Rom spline through every point, written as cubic Béziers,
 * so contours stay round at any zoom instead of showing polygon facets.
 */
function curvePath(pts: Pt[], closed: boolean): string {
  const n = pts.length;
  if (n < 3) return linePath(pts, closed);
  const get = (i: number) => (closed ? pts[((i % n) + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${num(pts[0].x)} ${num(pts[0].y)}`;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = get(i - 1);
    const p1 = get(i);
    const p2 = get(i + 1);
    const p3 = get(i + 2);
    const span = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const clampHandle = (vx: number, vy: number) => {
      const l = Math.hypot(vx, vy);
      const max = span * 0.5;
      return l > max && l > 0 ? { x: (vx / l) * max, y: (vy / l) * max } : { x: vx, y: vy };
    };
    const t1 = clampHandle((p2.x - p0.x) / 6, (p2.y - p0.y) / 6);
    const t2 = clampHandle((p3.x - p1.x) / 6, (p3.y - p1.y) / 6);
    d += `C${num(p1.x + t1.x)} ${num(p1.y + t1.y)} ${num(p2.x - t2.x)} ${num(p2.y - t2.y)} ${num(p2.x)} ${num(p2.y)}`;
  }
  return d + (closed ? "Z" : "");
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
  return shapes.map((shape) => {
    const pts = shape.pts.map((p) => ({ x: p.x * s + ox, y: p.y * s + oy }));
    const open = Boolean(shape.stroke);
    const out: Shape = {
      fill: shape.fill,
      shade: shape.shade,
      d: shape.sharp ? linePath(pts, true) : curvePath(pts, !open),
    };
    if (shape.stroke) {
      out.stroke = shape.stroke;
      out.width = Math.round((shape.width ?? 1) * s * 1000) / 1000;
    }
    if (shape.opacity !== undefined && shape.opacity < 1) out.opacity = shape.opacity;
    return out;
  });
}

function dumbbell(wrist: Pt, foreDeg: number): { bar: Pt[]; plates: Pt[][]; caps: Pt[][] } {
  const along = dir(foreDeg);
  const px = -along.y;
  const py = along.x;
  const grip = add(wrist, along, 12);
  const a = add(grip, { x: px, y: py }, 18);
  const b = add(grip, { x: px, y: py }, -18);
  return {
    bar: solidLimb(a, b, [3.4, 3.4]),
    plates: [hex(a, 12), hex(b, 12)],
    caps: [worldOval(a, 4.2, 4.2, 0), worldOval(b, 4.2, 4.2, 0)],
  };
}


type Box = { minX: number; maxX: number; minY: number; maxY: number };

function boxOf(shapes: Raw[], keep: (tag: string) => boolean): Box | null {
  let b: Box | null = null;
  for (const sh of shapes) {
    if (sh.stroke || sh.fill === "none" || !keep(sh.tag ?? "")) continue;
    for (const p of sh.pts) {
      if (!b) b = { minX: p.x, maxX: p.x, minY: p.y, maxY: p.y };
      else {
        if (p.x < b.minX) b.minX = p.x;
        if (p.x > b.maxX) b.maxX = p.x;
        if (p.y < b.minY) b.minY = p.y;
        if (p.y > b.maxY) b.maxY = p.y;
      }
    }
  }
  return b;
}

/** Props and the floor touch the body exactly (a hair of overlap so no seam shows). */
const CONTACT_OVERLAP = 0.35;

function isBody(tag: string): boolean {
  return tag !== "" && tag !== "weight";
}

/** In profile the lower leg is asymmetric: calf behind (+normal), tibia in front. */
function sideShin(leg: Chain): Chain {
  const seg = { ...leg.segs[1], r: CALF_R, rb: TIBIA_R };
  const parts = leg.parts.slice();
  parts[1] = solidLimb(seg.a, seg.b, seg.r, seg.rb);
  return { ...leg, segs: [leg.segs[0], seg], parts };
}

function sideBody(spec: SideSpec, pal: Palette) {
  const hip = { x: 0, y: 0 };
  const down = dir(spec.torso);
  const up = { x: down.x, y: -down.y };
  const shoulder = add(hip, up, LEN.torso);
  const spine = {
    x: (shoulder.x - hip.x) / LEN.torso,
    y: (shoulder.y - hip.y) / LEN.torso,
  };
  // Far-side limbs sit a little behind in depth: a horizontal shift only, so
  // near and far hands/feet share the same floor.
  const farHip = { x: hip.x - 6, y: hip.y };
  const farShoulder = { x: shoulder.x - 6, y: shoulder.y };
  const nearFoot = spec.foot ?? autoFoot(spec.shin);
  const farFoot = spec.footFar ?? autoFoot(spec.shinFar);
  const nearLeg = sideShin(limbChain(hip, spec.thigh, spec.shin, "leg", nearFoot, undefined, spec.soleUp));
  const farLeg = sideShin(limbChain(farHip, spec.thighFar, spec.shinFar, "leg", farFoot, undefined, spec.soleUpFar));
  const nearArm = limbChain(shoulder, spec.arm, spec.fore, "arm", undefined, spec.hand);
  const farArm = limbChain(farShoulder, spec.armFar, spec.foreFar, "arm", undefined, spec.handFar);

  const headTilt = spec.torso + (spec.head ?? 0);
  const neckBase = add(shoulder, spine, -8);
  const neckTop = add(shoulder, spine, LEN.neck);
  const headCenter = add(shoulder, spine, LEN.neck + LEN.head * 0.55);
  const neckSeg: Seg = { a: neckBase, b: neckTop, r: [13, 12, 11, 10] };
  const neck = solidLimb(neckSeg.a, neckSeg.b, neckSeg.r);

  const shapes: Raw[] = [];
  const ANT = -1;
  SIDE = "F";
  pushLeg(shapes, farLeg, farFoot, pal.skinFar, pal.shoeFar, pal, ANT, 0);
  const farTube = shortsTube(farHip, spec.thighFar);
  pushShortsLeg(shapes, farTube, pal.shortsFar, ANT, 0, spec.hem);
  pushArm(shapes, farArm, pal.skinFar, ANT, 0);

  SIDE = "N";
  withTag("torso", () => push(shapes, sideTorso(hip, shoulder), pal.skin));
  pushThigh(shapes, nearLeg, pal.skin, ANT, 0);
  withTag("tank", () => {
    push(shapes, sideTank(hip, shoulder), pal.tank);
    push(shapes, sideChest(hip, shoulder), pal.tankLite);
    sideTankDetail(shapes, hip, shoulder, pal);
  });
  const nearTube = shortsTube(hip, spec.thigh);
  withTag("shorts", () => {
    shapes.push({ pts: shortsPelvis(sideEdges(hip, shoulder, -0.03, 0.44, 22, () => 1.04, () => 1.04), [nearTube, farTube]), fill: pal.shorts, shade: false, tag: "shorts" });
    glaze(shapes, torsoLens(hip, shoulder, 0.02, 0.28, -0.55, 0.3), lit(pal.shorts), 0.1);
    line(shapes, torsoPts(hip, shoulder, [[0.26, -0.97], [0.12, -0.9], [0.02, -0.6]]), "#000000", 0.45, 0.85);
    pushShortsLeg(shapes, nearTube, pal.shorts, ANT, 0, spec.hem);
    sideShortsDetail(shapes, hip, shoulder);
    push(shapes, sideWaist(hip, shoulder), pal.waist, false);
    sideWaistDetail(shapes, hip, shoulder);
  });
  pushShin(shapes, nearLeg, pal.skin, ANT, 0);
  pushShoe(shapes, nearLeg.end, nearFoot, pal.shoe, pal, nearLeg.soleUp);
  withTag("neck", () => {
    push(shapes, neck, pal.skin);
    neckDetail(shapes, neckSeg, pal.skin, false);
  });
  pushArm(shapes, nearArm, pal.skin, ANT, 0);
  withTag("head", () => pushHead(shapes, "side", headCenter, headTilt, pal));
  SIDE = "";

  if (spec.weight) {
    withTag("weight", () => {
      const bell = dumbbell(nearArm.end, spec.fore);
      push(shapes, bell.bar, pal.metal);
      for (const plate of bell.plates) {
        shapes.push({ pts: plate, fill: pal.metal, shade: "linear", sharp: true, tag: "weight" });
      }
      for (const cap of bell.caps) glaze(shapes, cap, dark(pal.metal), 0.45);
    });
  }
  return { shapes, nearLeg, farLeg, nearArm, farArm, hip, shoulder };
}

function buildSide(spec: SideSpec, pal: Palette): Raw[] {
  const { shapes, nearLeg } = sideBody(spec, pal);
  const body = boxOf(shapes, isBody)!;
  const floor = body.maxY - CONTACT_OVERLAP;
  const props: Raw[] = [];
  const hands = boxOf(shapes, (t) => t === "handN" || t === "handF");
  if (spec.prop === "dip" && hands) {
    // Bench top exactly under the planted hands.
    const top = hands.maxY - CONTACT_OVERLAP;
    const hx = (hands.minX + hands.maxX) / 2;
    pushFlat(props, rect(hx - 118, top, 136, Math.max(12, floor - top)), pal.prop);
  } else if (spec.prop === "skull") {
    const torso = boxOf(shapes, (t) => t === "torso" || t === "shorts" || t === "tank")!;
    const top = torso.maxY - CONTACT_OVERLAP;
    const left = Math.min(torso.minX, nearLeg.knee.x) - 22;
    const right = Math.max(torso.maxX, nearLeg.knee.x) - 10;
    pushFlat(props, rect(left, top, right - left, Math.max(12, floor - top)), pal.prop);
  } else if (spec.prop === "ham") {
    const foot = boxOf(shapes, (t) => t === "footN")!;
    const top = foot.maxY - CONTACT_OVERLAP;
    const cx = (foot.minX + foot.maxX) / 2;
    pushFlat(props, rect(cx - 26, top, 52, Math.max(12, floor - top)), pal.prop);
  } else if (spec.prop === "wall" && hands) {
    // Wall face exactly at the palms.
    const x = hands.maxX - CONTACT_OVERLAP;
    const top = Math.min(hands.minY, body.minY) - 30;
    pushFlat(props, rect(x, top, 16, floor - top + 8), pal.prop);
  }
  pushFlat(props, rect(body.minX - 10, floor, body.maxX - body.minX + 20, 8), pal.ground);
  return [...props, ...shapes];
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
  const armL = limbChain(shoulderL, spec.armL, spec.foreL, "arm", undefined, spec.handL);
  const armR = limbChain(shoulderR, spec.armR, spec.foreR, "arm", undefined, spec.handR);
  const axis = { x: 0, y: -1 };
  const neckBase = add({ x: hip.x, y: shoulderY }, axis, -6);
  const neckTop = add({ x: hip.x, y: shoulderY }, axis, LEN.neck);
  const headCenter = add({ x: hip.x, y: shoulderY }, axis, LEN.neck + LEN.head * 0.62);
  const neckSeg: Seg = { a: neckBase, b: neckTop, r: [14, 12, 11, 10] };
  const neck = solidLimb(neckSeg.a, neckSeg.b, neckSeg.r);

  const shapes: Raw[] = [];
  SIDE = "L";
  pushLeg(shapes, legL, footL, pal.skin, pal.shoe, pal, 0, -1);
  SIDE = "R";
  pushLeg(shapes, legR, footR, pal.skin, pal.shoe, pal, 0, 1);
  SIDE = "";
  withTag("torso", () => push(shapes, frontTorso(hip, shoulderY), pal.skin));
  withTag("tank", () => {
    push(shapes, frontTank(hip, shoulderY), pal.tank);
    push(shapes, frontPec(hip, shoulderY, -1), pal.tankLite);
    push(shapes, frontPec(hip, shoulderY, 1), pal.tankLite);
    frontTankDetail(shapes, hip, shoulderY, pal);
  });
  withTag("torso", () => {
    push(shapes, frontScoop(hip, shoulderY), pal.skin);
    frontScoopDetail(shapes, hip, shoulderY, pal);
  });
  const tubeL = shortsTube(hipL, spec.thighL);
  const tubeR = shortsTube(hipR, spec.thighR);
  withTag("shorts", () => {
    shapes.push({ pts: shortsPelvis(frontBand(hip, shoulderY, 0.56, 1.02, 20, () => 1.03), [tubeL, tubeR]), fill: pal.shorts, shade: false, tag: "shorts" });
    pushShortsLeg(shapes, tubeL, pal.shorts, 0, -1);
    pushShortsLeg(shapes, tubeR, pal.shorts, 0, 1);
    frontShortsDetail(shapes, hip, shoulderY);
    // Inseam: where the two shorts legs meet below the crotch.
    const innerL = segAt(tubeL, SHORTS_HEM_T, -1);
    const innerR = segAt(tubeR, SHORTS_HEM_T, 1);
    const crotch = { x: hip.x, y: hip.y + 4 };
    line(shapes, [crotch, lerpPt(crotch, lerpPt(innerL, innerR, 0.5), 0.55), lerpPt(innerL, innerR, 0.5)], "#000000", 0.6, 0.9);
    push(shapes, frontWaist(hip, shoulderY), pal.waist, false);
    frontWaistDetail(shapes, hip, shoulderY);
  });
  SIDE = "L";
  pushArm(shapes, armL, pal.skin, 0, -1);
  SIDE = "R";
  pushArm(shapes, armR, pal.skin, 0, 1);
  SIDE = "";
  withTag("neck", () => {
    push(shapes, neck, pal.skin);
    neckDetail(shapes, neckSeg, pal.skin, true);
  });
  withTag("head", () => pushHead(shapes, "front", headCenter, 0, pal));

  const body = boxOf(shapes, isBody)!;
  const floor = body.maxY - CONTACT_OVERLAP;
  const ground: Raw[] = [];
  pushFlat(ground, rect(body.minX - 10, floor, body.maxX - body.minX + 20, 8), pal.ground);
  return [...ground, ...shapes];
}

/** Lowest point of each body part vs. the floor and props, in figure units (for pose QA). */
export function poseContacts(
  slug: ExerciseSlug,
  phase: PosePhase
): { floor: number; parts: Record<string, Box>; props: Box[] } {
  const spec = POSES[slug][phase];
  const raw = spec.plane === "side" ? buildSide(spec, PALETTE.paper) : buildFront(spec, PALETTE.paper);
  const parts: Record<string, Box> = {};
  const tags = new Set(raw.map((r) => r.tag ?? "").filter(isBody));
  for (const t of tags) parts[t] = boxOf(raw, (x) => x === t)!;
  const flats = raw.filter((r) => r.sharp && r.tag === "");
  const props = flats.map((r) => boxOf([{ ...r, tag: "p" }], () => true)!);
  const floor = props[props.length - 1].minY;
  return { floor, parts, props: props.slice(0, -1) };
}

/** Same as poseContacts but for an arbitrary spec (used to tune pose angles). */
export function specContacts(spec: Spec): { floor: number; parts: Record<string, Box>; props: Box[] } {
  const raw = spec.plane === "side" ? buildSide(spec, PALETTE.paper) : buildFront(spec, PALETTE.paper);
  const parts: Record<string, Box> = {};
  const tags = new Set(raw.map((r) => r.tag ?? "").filter(isBody));
  for (const t of tags) parts[t] = boxOf(raw, (x) => x === t)!;
  const flats = raw.filter((r) => r.sharp && r.tag === "");
  const props = flats.map((r) => boxOf([{ ...r, tag: "p" }], () => true)!);
  return { floor: props[props.length - 1].minY, parts, props: props.slice(0, -1) };
}

/** Joint positions of a side-view spec (hip at the origin), for pose QA. */
export function specJoints(spec: SideSpec) {
  const b = sideBody(spec, PALETTE.paper);
  return {
    hip: b.hip,
    shoulder: b.shoulder,
    knee: b.nearLeg.knee,
    ankle: b.nearLeg.end,
    elbow: b.nearArm.knee,
    wrist: b.nearArm.end,
    kneeFar: b.farLeg.knee,
    ankleFar: b.farLeg.end,
    elbowFar: b.farArm.knee,
    wristFar: b.farArm.end,
  };
}

export { POSES as POSE_SPECS };

export const FIGURE_VIEWBOX = "0 0 200 260";

export function buildFigure(
  slug: ExerciseSlug,
  phase: PosePhase,
  tone: FigureTone = "paper"
): { viewBox: string; shapes: Shape[] } {
  const spec = POSES[slug][phase];
  const pal = PALETTE[tone];
  const raw = spec.plane === "side" ? buildSide(spec, pal) : buildFront(spec, pal);
  return { viewBox: FIGURE_VIEWBOX, shapes: fit(raw) };
}

export type FigurePaint = { id: string; fill: string; mode: "linear" | "radial"; hi: string; lo: string };

/** One gradient per (mode, base color); shared by the React component and the 4K exporter. */
export function figurePaints(shapes: Shape[], uid: string): { paints: FigurePaint[]; fillOf: (s: Shape) => string } {
  const paints: FigurePaint[] = [];
  const ids = new Map<string, string>();
  for (const shape of shapes) {
    if (shape.shade === false) continue;
    const key = `${shape.shade}:${shape.fill}`;
    if (ids.has(key)) continue;
    const id = `${uid}-${paints.length}`;
    ids.set(key, id);
    const tone = shadeOf(shape.fill);
    paints.push({ id, fill: shape.fill, mode: shape.shade, hi: tone.hi, lo: tone.lo });
  }
  const fillOf = (s: Shape) =>
    s.shade === false ? s.fill : `url(#${ids.get(`${s.shade}:${s.fill}`)})`;
  return { paints, fillOf };
}

/** Standalone SVG markup of a pose (vector), used for the 4K PNG exports. */
export function figureSvg(
  slug: ExerciseSlug,
  phase: PosePhase,
  opts: { tone?: FigureTone; width?: number; height?: number; background?: string } = {}
): string {
  const fig = buildFigure(slug, phase, opts.tone ?? "paper");
  const { paints, fillOf } = figurePaints(fig.shapes, `dh-${slug}-${phase}`);
  const size =
    opts.width && opts.height ? ` width="${opts.width}" height="${opts.height}"` : "";
  const defs = paints
    .map((p) =>
      p.mode === "radial"
        ? `<radialGradient id="${p.id}" cx="36%" cy="32%" r="72%"><stop offset="0%" stop-color="${p.hi}"/><stop offset="48%" stop-color="${p.fill}"/><stop offset="100%" stop-color="${p.lo}"/></radialGradient>`
        : `<linearGradient id="${p.id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${p.hi}"/><stop offset="46%" stop-color="${p.fill}"/><stop offset="100%" stop-color="${p.lo}"/></linearGradient>`
    )
    .join("");
  const [vx, vy, vw, vh] = fig.viewBox.split(" ").map(Number);
  const bg = opts.background
    ? `<rect x="${vx - vw * 4}" y="${vy - vh * 4}" width="${vw * 9}" height="${vh * 9}" fill="${opts.background}"/>`
    : "";
  const body = fig.shapes
    .map((s) => {
      const op = s.opacity !== undefined ? ` opacity="${s.opacity}"` : "";
      if (s.stroke) {
        return `<path d="${s.d}" fill="none" stroke="${s.stroke}" stroke-width="${s.width}" stroke-linecap="round" stroke-linejoin="round"${op}/>`;
      }
      return `<path d="${s.d}" fill="${fillOf(s)}"${op}/>`;
    })
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${fig.viewBox}"${size} preserveAspectRatio="xMidYMid meet" shape-rendering="geometricPrecision">${bg}<defs>${defs}</defs>${body}</svg>`;
}
