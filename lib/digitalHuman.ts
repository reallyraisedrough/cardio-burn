import type { ExerciseSlug } from "./types";

/**
 * One solid digital human, posed for every exercise.
 * Same thick body everywhere: torso, hips, thighs, calves, upper arms,
 * forearms, neck, and a real head. Flat fills, hard edges, no blur.
 */

export type PosePhase = "start" | "exec";
export type FigureTone = "paper" | "mist";

type Pt = { x: number; y: number };
type Shape = { d: string; fill: string };

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
  neck: 18,
  head: 26,
  upper: 50,
  fore: 44,
  hand: 17,
  thigh: 68,
  shin: 64,
  foot: 30,
};

const TONE = {
  paper: {
    near: "#f4f4f5",
    far: "#a1a1aa",
    prop: "#3f3f46",
    metal: "#fb923c",
    ground: "#52525b",
  },
  mist: {
    near: "#e4e4e7",
    far: "#71717a",
    prop: "#52525b",
    metal: "#fb923c",
    ground: "#3f3f46",
  },
} as const;

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

function sideTorso(hip: Pt, shoulder: Pt): Pt[] {
  const dx = shoulder.x - hip.x;
  const dy = shoulder.y - hip.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const chestW = (t: number) => {
    if (t < 0.34) return 28 + (22 - 28) * smooth(t / 0.34);
    if (t < 0.7) return 22 + (40 - 22) * smooth((t - 0.34) / 0.36);
    return 40 + (20 - 40) * smooth((t - 0.7) / 0.3);
  };
  const backW = (t: number) => {
    if (t < 0.2) return 46 + (38 - 46) * smooth(t / 0.2);
    if (t < 0.42) return 38 + (24 - 38) * smooth((t - 0.2) / 0.22);
    if (t < 0.78) return 24 + (26 - 24) * smooth((t - 0.42) / 0.36);
    return 26 + (20 - 26) * smooth((t - 0.78) / 0.22);
  };
  const n = 28;
  const chest: Pt[] = [];
  const back: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    chest.push({
      x: hip.x + dx * t + nx * chestW(t),
      y: hip.y + dy * t + ny * chestW(t),
    });
    back.push({
      x: hip.x + dx * t - nx * backW(t),
      y: hip.y + dy * t - ny * backW(t),
    });
  }
  back.reverse();
  return [...chest, ...back];
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

function footPoly(ankle: Pt, deg: number): Pt[] {
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

function limbChain(
  origin: Pt,
  upperDeg: number,
  foreDeg: number,
  kind: "arm" | "leg",
  footDeg?: number
): { knee: Pt; end: Pt; toe: Pt; parts: Pt[][] } {
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
    parts.push(solidLimb(root, knee, [16, 18, 15.5, 13]));
    parts.push(solidLimb(elbow, end, [13, 14.5, 12, 9]));
    const hand = add(end, dLower, LEN.hand);
    const wrist = add(end, dLower, -4);
    parts.push(solidLimb(wrist, hand, [8.2, 9, 6.6]));
    return { knee, end, toe: hand, parts };
  }
  const root = add(origin, dUpper, -8);
  const kneeIn = add(knee, dLower, -8);
  parts.push(solidLimb(root, knee, [26, 32, 26, 18]));
  parts.push(solidLimb(kneeIn, end, [18, 24, 18, 12]));
  const fd = footDeg ?? autoFoot(foreDeg);
  const toe = add(end, dir(fd), LEN.foot);
  parts.push(footPoly(end, fd));
  return { knee, end, toe, parts };
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

function fit(shapes: { pts: Pt[]; fill: string }[]): Shape[] {
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

type Fill = { near: string; far: string; prop: string; metal: string; ground: string };

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

function buildSide(spec: SideSpec, fill: Fill): { pts: Pt[]; fill: string }[] {
  const hip = { x: 0, y: 0 };
  const down = dir(spec.torso);
  const up = { x: down.x, y: -down.y };
  const shoulder = add(hip, up, LEN.torso);
  const n = chestNormal(hip, shoulder);
  const spine = {
    x: (shoulder.x - hip.x) / LEN.torso,
    y: (shoulder.y - hip.y) / LEN.torso,
  };
  const farHip = { x: hip.x - n.x * 11, y: hip.y - n.y * 6 };
  const farShoulder = { x: shoulder.x - n.x * 8, y: shoulder.y - n.y * 4 };
  const nearLeg = limbChain(hip, spec.thigh, spec.shin, "leg", spec.foot);
  const farLeg = limbChain(farHip, spec.thighFar, spec.shinFar, "leg", spec.footFar);
  const nearArm = limbChain(shoulder, spec.arm, spec.fore, "arm");
  const farArm = limbChain(farShoulder, spec.armFar, spec.foreFar, "arm");

  const headTilt = spec.torso + (spec.head ?? 0);
  const neckBase = add(shoulder, spine, -8);
  const neckTop = add(shoulder, spine, LEN.neck);
  const headCenter = add(shoulder, spine, LEN.neck + LEN.head * 0.55);
  const head = placeHead(headCenter, headTilt, LEN.head, PROFILE);
  const neck = solidLimb(neckBase, neckTop, [20, 17, 14, 13]);

  const shapes: { pts: Pt[]; fill: string }[] = [];
  const { minX, maxX, maxY } = boundsOf([
    ...farLeg.parts,
    ...nearLeg.parts,
    sideTorso(hip, shoulder),
    head,
  ]);

  if (spec.prop === "dip") {
    const top = Math.max(nearArm.end.y, farArm.end.y);
    const hx = (nearArm.end.x + farArm.end.x) / 2;
    shapes.push({ pts: rect(hx - 118, top, 136, 48), fill: fill.prop });
  } else if (spec.prop === "skull") {
    const mid = { x: (hip.x + shoulder.x) / 2, y: (hip.y + shoulder.y) / 2 };
    const backY = mid.y - n.y * 22;
    const left = Math.min(headCenter.x, hip.x, nearLeg.knee.x) - 22;
    const right = Math.max(headCenter.x, hip.x, nearLeg.knee.x) + 28;
    shapes.push({ pts: rect(left, backY, right - left, 32), fill: fill.prop });
  } else if (spec.prop === "ham") {
    const top = nearLeg.toe.y;
    const ground = farLeg.toe.y;
    const h = Math.max(20, ground - top);
    shapes.push({
      pts: rect(nearLeg.end.x - 22, top, 56, h),
      fill: fill.prop,
    });
  } else if (spec.prop === "wall") {
    const x = Math.max(nearArm.toe.x, farArm.toe.x) + 8;
    const top = Math.min(nearArm.toe.y, farArm.toe.y) - 40;
    shapes.push({ pts: rect(x, top, 16, maxY - top + 10), fill: fill.prop });
  }

  shapes.push({ pts: rect(minX - 10, maxY + 2, maxX - minX + 20, 8), fill: fill.ground });

  for (const part of farLeg.parts) shapes.push({ pts: part, fill: fill.near });
  for (const part of farArm.parts) shapes.push({ pts: part, fill: fill.near });
  shapes.push({ pts: sideTorso(hip, shoulder), fill: fill.near });
  shapes.push({ pts: neck, fill: fill.near });
  for (const part of nearLeg.parts) shapes.push({ pts: part, fill: fill.near });
  for (const part of nearArm.parts) shapes.push({ pts: part, fill: fill.near });
  shapes.push({ pts: head, fill: fill.near });

  if (spec.weight) {
    for (const pts of dumbbell(nearArm.end, spec.fore)) {
      shapes.push({ pts, fill: fill.metal });
    }
  }

  return shapes;
}

function frontTorso(hip: Pt, shoulderY: number): Pt[] {
  const len = hip.y - shoulderY;
  const yAt = (t: number) => shoulderY + len * t;
  const halfW = (t: number) => {
    if (t < 0.08) return 42 + (54 - 42) * smooth(t / 0.08);
    if (t < 0.22) return 54 + (38 - 54) * smooth((t - 0.08) / 0.14);
    if (t < 0.42) return 38 + (28 - 38) * smooth((t - 0.22) / 0.2);
    if (t < 0.7) return 28 + (40 - 28) * smooth((t - 0.42) / 0.28);
    return 40 + (46 - 40) * smooth((t - 0.7) / 0.3);
  };
  const n = 24;
  const right: Pt[] = [];
  const left: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = halfW(t);
    right.push({ x: hip.x + x, y: yAt(t) });
    left.push({ x: hip.x - x, y: yAt(t) });
  }
  left.reverse();
  return [...right, ...left];
}


function buildFront(spec: FrontSpec, fill: Fill): { pts: Pt[]; fill: string }[] {
  const hip = { x: 0, y: 0 };
  const shoulderY = hip.y - LEN.torso;
  const shoulderL = { x: hip.x - 46, y: shoulderY + 6 };
  const shoulderR = { x: hip.x + 46, y: shoulderY + 6 };
  const hipL = { x: hip.x - 28, y: hip.y + 4 };
  const hipR = { x: hip.x + 28, y: hip.y + 4 };
  const legL = limbChain(hipL, spec.thighL, spec.shinL, "leg", spec.footL);
  const legR = limbChain(hipR, spec.thighR, spec.shinR, "leg", spec.footR);
  const armL = limbChain(shoulderL, spec.armL, spec.foreL, "arm");
  const armR = limbChain(shoulderR, spec.armR, spec.foreR, "arm");
  const axis = { x: 0, y: -1 };
  const neckBase = add({ x: hip.x, y: shoulderY }, axis, -6);
  const neckTop = add({ x: hip.x, y: shoulderY }, axis, LEN.neck);
  const headCenter = add({ x: hip.x, y: shoulderY }, axis, LEN.neck + LEN.head * 0.62);
  const head = placeHead(headCenter, 0, LEN.head, FRONT_HEAD);
  const neck = solidLimb(neckBase, neckTop, [22, 18, 15, 13]);

  const shapes: { pts: Pt[]; fill: string }[] = [];
  const { minX, maxX, maxY } = boundsOf([
    ...legL.parts,
    ...legR.parts,
    ...armL.parts,
    ...armR.parts,
    frontTorso(hip, shoulderY),
    head,
  ]);
  shapes.push({ pts: rect(minX - 10, maxY + 2, maxX - minX + 20, 8), fill: fill.ground });

  for (const part of legL.parts) shapes.push({ pts: part, fill: fill.near });
  for (const part of armL.parts) shapes.push({ pts: part, fill: fill.near });
  shapes.push({ pts: frontTorso(hip, shoulderY), fill: fill.near });
  shapes.push({ pts: neck, fill: fill.near });
  for (const part of legR.parts) shapes.push({ pts: part, fill: fill.near });
  for (const part of armR.parts) shapes.push({ pts: part, fill: fill.near });
  shapes.push({ pts: head, fill: fill.near });
  return shapes;
}

export function buildFigure(
  slug: ExerciseSlug,
  phase: PosePhase,
  tone: FigureTone = "paper"
): { viewBox: string; shapes: Shape[] } {
  const spec = POSES[slug][phase];
  const fill = TONE[tone];
  const raw = spec.plane === "side" ? buildSide(spec, fill) : buildFront(spec, fill);
  return { viewBox: "0 0 200 260", shapes: fit(raw) };
}
