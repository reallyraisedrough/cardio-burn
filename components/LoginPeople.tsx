"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Real athletes from the app's licensed form photos.
 * Light studio backdrops are dropped with a luminance/saturation cut
 * so only the person remains. Start and exec are the same person:
 * both are preloaded, locked into one box, and hard-cut (no opacity
 * crossfade, so two bodies are never on screen together).
 */

const SAT_MAX = 28;
const LUM_CUT = 168;
const SOFT = 22;
const STEP_MS = 800;
/** Shared frame height after normalizing both photos to one scale. */
const NORM_H = 900;

type FigureSpec = {
  start: string;
  exec: string;
  className: string;
  opacity: number;
  mirror: boolean;
  /** First pose shown. */
  startOnExec: boolean;
  offsetMs: number;
};

const FIGURES: FigureSpec[] = [
  {
    start: "/forms/squats-start.jpg",
    exec: "/forms/squats-exec.jpg",
    className: "bottom-[2%] left-[2%] h-[70%] w-[32%]",
    opacity: 0.52,
    mirror: false,
    startOnExec: false,
    offsetMs: 0,
  },
  {
    start: "/forms/burpees-start.jpg",
    exec: "/forms/burpees-exec.jpg",
    className: "right-[2%] top-[3%] h-[38%] w-[36%]",
    opacity: 0.46,
    mirror: false,
    startOnExec: true,
    offsetMs: 400,
  },
  {
    start: "/forms/squats-start.jpg",
    exec: "/forms/squats-exec.jpg",
    className: "bottom-[2%] right-[2%] h-[52%] w-[26%]",
    opacity: 0.4,
    mirror: true,
    startOnExec: true,
    offsetMs: 800,
  },
  {
    start: "/forms/burpees-start.jpg",
    exec: "/forms/burpees-exec.jpg",
    className: "left-[2%] top-[4%] h-[32%] w-[32%]",
    opacity: 0.38,
    mirror: true,
    startOnExec: false,
    offsetMs: 200,
  },
];

type Cutout = {
  canvas: HTMLCanvasElement;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

const cutoutCache = new Map<string, Promise<Cutout>>();
const pairCache = new Map<string, [HTMLCanvasElement, HTMLCanvasElement]>();

function knockout(img: HTMLImageElement): Cutout {
  const maxSide = 900;
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const src = document.createElement("canvas");
  src.width = w;
  src.height = h;
  const sctx = src.getContext("2d", { willReadFrequently: true });
  if (!sctx) {
    return { canvas: src, minX: 0, minY: 0, maxX: w - 1, maxY: h - 1 };
  }
  sctx.drawImage(img, 0, 0, w, h);
  const image = sctx.getImageData(0, 0, w, h);
  const d = image.data;
  const alpha = new Float32Array(w * h);

  for (let p = 0, i = 0; p < alpha.length; p++, i += 4) {
    const r = d[i];
    const g = d[i + 1];
    const b = d[i + 2];
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const sat = Math.max(r, g, b) - Math.min(r, g, b);
    let a = 255;
    if (sat < SAT_MAX) {
      if (lum >= LUM_CUT + SOFT) a = 0;
      else if (lum >= LUM_CUT) a = ((LUM_CUT + SOFT - lum) / SOFT) * 255;
    }
    if (lum >= 236) a = Math.min(a, Math.max(0, ((250 - lum) / 14) * 255));
    alpha[p] = a;
  }

  const seen = new Uint8Array(alpha.length);
  const stack: number[] = [];
  const minArea = Math.max(80, Math.round(w * h * 0.002));
  for (let i = 0; i < alpha.length; i++) {
    if (seen[i] || alpha[i] <= 20) continue;
    stack.length = 0;
    stack.push(i);
    seen[i] = 1;
    const comp: number[] = [];
    while (stack.length) {
      const p = stack.pop() as number;
      comp.push(p);
      const x = p % w;
      const y = (p / w) | 0;
      if (x > 0) {
        const n = p - 1;
        if (!seen[n] && alpha[n] > 20) {
          seen[n] = 1;
          stack.push(n);
        }
      }
      if (x < w - 1) {
        const n = p + 1;
        if (!seen[n] && alpha[n] > 20) {
          seen[n] = 1;
          stack.push(n);
        }
      }
      if (y > 0) {
        const n = p - w;
        if (!seen[n] && alpha[n] > 20) {
          seen[n] = 1;
          stack.push(n);
        }
      }
      if (y < h - 1) {
        const n = p + w;
        if (!seen[n] && alpha[n] > 20) {
          seen[n] = 1;
          stack.push(n);
        }
      }
    }
    if (comp.length < minArea) {
      for (const p of comp) alpha[p] = 0;
    }
  }

  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;
  const outData = sctx.createImageData(w, h);
  const od = outData.data;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x;
      const si = p * 4;
      const lum = 0.2126 * d[si] + 0.7152 * d[si + 1] + 0.0722 * d[si + 2];
      od[si] = lum;
      od[si + 1] = lum;
      od[si + 2] = lum;
      od[si + 3] = alpha[p];
      if (alpha[p] <= 12) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  sctx.putImageData(outData, 0, 0);
  if (maxX < 0) {
    return { canvas: src, minX: 0, minY: 0, maxX: w - 1, maxY: h - 1 };
  }
  return { canvas: src, minX, minY, maxX, maxY };
}

function loadCutout(src: string): Promise<Cutout> {
  const cached = cutoutCache.get(src);
  if (cached) return cached;
  const pending = new Promise<Cutout>((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      const finish = () => {
        try {
          resolve(knockout(img));
        } catch (err) {
          reject(err);
        }
      };
      if (typeof img.decode === "function") {
        img.decode().then(finish).catch(finish);
      } else {
        finish();
      }
    };
    img.onerror = () => reject(new Error(`Could not load ${src}`));
    img.src = src;
  });
  cutoutCache.set(src, pending);
  return pending;
}

function scaleBox(
  cut: Cutout,
  scaleX: number,
  scaleY: number,
  w: number,
  h: number,
) {
  const clamp = (v: number, max: number) => Math.min(max, Math.max(0, v));
  return {
    minX: clamp(Math.floor(cut.minX * scaleX), w - 1),
    minY: clamp(Math.floor(cut.minY * scaleY), h - 1),
    maxX: clamp(Math.ceil(cut.maxX * scaleX), w - 1),
    maxY: clamp(Math.ceil(cut.maxY * scaleY), h - 1),
  };
}

/**
 * Both poses share one canvas. Each photo is scaled so the full body
 * fits (same camera scale, head through feet, never a legs-only crop),
 * then bottom-centered so the feet stay planted when the hard cut swaps.
 */
function alignPair(a: Cutout, b: Cutout): [HTMLCanvasElement, HTMLCanvasElement] {
  const aH = NORM_H;
  const bH = NORM_H;
  const aW = Math.max(1, Math.round((a.canvas.width * NORM_H) / a.canvas.height));
  const bW = Math.max(1, Math.round((b.canvas.width * NORM_H) / b.canvas.height));
  const aScaleX = aW / a.canvas.width;
  const aScaleY = aH / a.canvas.height;
  const bScaleX = bW / b.canvas.width;
  const bScaleY = bH / b.canvas.height;
  const aBox = scaleBox(a, aScaleX, aScaleY, aW, aH);
  const bBox = scaleBox(b, bScaleX, bScaleY, bW, bH);
  const aBodyW = aBox.maxX - aBox.minX + 1;
  const aBodyH = aBox.maxY - aBox.minY + 1;
  const bBodyW = bBox.maxX - bBox.minX + 1;
  const bBodyH = bBox.maxY - bBox.minY + 1;
  const pad = Math.max(8, Math.round(NORM_H * 0.02));
  const outW = Math.max(aBodyW, bBodyW) + pad * 2;
  const outH = Math.max(aBodyH, bBodyH) + pad * 2;

  const place = (
    cut: Cutout,
    box: { minX: number; minY: number; maxX: number; maxY: number },
    dw: number,
    dh: number,
  ) => {
    const out = document.createElement("canvas");
    out.width = outW;
    out.height = outH;
    const ctx = out.getContext("2d");
    if (!ctx) return out;
    const bodyW = box.maxX - box.minX + 1;
    const dx = Math.round((outW - bodyW) / 2) - box.minX;
    const dy = outH - pad - box.maxY;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(cut.canvas, 0, 0, cut.canvas.width, cut.canvas.height, dx, dy, dw, dh);
    return out;
  };

  return [place(a, aBox, aW, aH), place(b, bBox, bW, bH)];
}

function alignedPair(startSrc: string, execSrc: string, start: Cutout, exec: Cutout) {
  const key = `${startSrc}|${execSrc}`;
  const hit = pairCache.get(key);
  if (hit) return hit;
  const pair = alignPair(start, exec);
  pairCache.set(key, pair);
  return pair;
}

function drawFrame(dest: HTMLCanvasElement, src: HTMLCanvasElement) {
  if (dest.width !== src.width || dest.height !== src.height) {
    dest.width = src.width;
    dest.height = src.height;
  } else {
    dest.getContext("2d")?.clearRect(0, 0, dest.width, dest.height);
  }
  dest.getContext("2d")?.drawImage(src, 0, 0);
}

function LoginFigure({ spec }: { spec: FigureSpec }) {
  const viewRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<[HTMLCanvasElement, HTMLCanvasElement] | null>(null);
  const showExecRef = useRef(spec.startOnExec);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) showExecRef.current = true;

    const paint = () => {
      const canvas = viewRef.current;
      const frames = framesRef.current;
      if (!canvas || !frames) return;
      drawFrame(canvas, showExecRef.current ? frames[1] : frames[0]);
    };

    Promise.all([loadCutout(spec.start), loadCutout(spec.exec)])
      .then(([start, exec]) => {
        if (!alive) return;
        framesRef.current = alignedPair(spec.start, spec.exec, start, exec);
        paint();
        setReady(true);
      })
      .catch(() => {});

    if (reduced) {
      return () => {
        alive = false;
      };
    }

    let interval = 0;
    const tick = () => {
      showExecRef.current = !showExecRef.current;
      paint();
    };
    const kick = window.setTimeout(() => {
      tick();
      interval = window.setInterval(tick, STEP_MS);
    }, spec.offsetMs === 0 ? STEP_MS : spec.offsetMs);

    return () => {
      alive = false;
      window.clearTimeout(kick);
      window.clearInterval(interval);
    };
  }, [spec]);

  return (
    <div
      className={`pointer-events-none absolute ${spec.className}`}
      style={{
        opacity: ready ? spec.opacity : 0,
        transform: spec.mirror ? "scaleX(-1)" : undefined,
      }}
    >
      <canvas
        ref={viewRef}
        className="absolute inset-0 h-full w-full object-contain object-bottom"
        style={{ objectFit: "contain", objectPosition: "center bottom" }}
      />
    </div>
  );
}

export function LoginPeople() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      {FIGURES.map((spec) => (
        <LoginFigure key={`${spec.start}-${spec.className}`} spec={spec} />
      ))}
    </div>
  );
}
