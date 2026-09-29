"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Real athletes from the app's licensed form photos.
 * Light studio backdrops are dropped with a luminance/saturation cut
 * so only the person remains. Each figure crossfades start <-> exec.
 */

const SAT_MAX = 28;
const LUM_CUT = 168;
const SOFT = 22;
const STEP_MS = 800;
const FADE_MS = 450;

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
    className: "bottom-0 left-[-6%] h-[62%] w-[48%]",
    opacity: 0.52,
    mirror: false,
    startOnExec: false,
    offsetMs: 0,
  },
  {
    start: "/forms/burpees-start.jpg",
    exec: "/forms/burpees-exec.jpg",
    className: "right-[-8%] top-[2%] h-[36%] w-[70%]",
    opacity: 0.46,
    mirror: false,
    startOnExec: true,
    offsetMs: 400,
  },
  {
    start: "/forms/squats-start.jpg",
    exec: "/forms/squats-exec.jpg",
    className: "bottom-[1%] right-[-4%] h-[48%] w-[40%]",
    opacity: 0.4,
    mirror: true,
    startOnExec: true,
    offsetMs: 800,
  },
  {
    start: "/forms/burpees-start.jpg",
    exec: "/forms/burpees-exec.jpg",
    className: "left-[-4%] top-[7%] h-[30%] w-[56%]",
    opacity: 0.38,
    mirror: true,
    startOnExec: false,
    offsetMs: 200,
  },
];

const cutoutCache = new Map<string, Promise<HTMLCanvasElement>>();

function knockout(img: HTMLImageElement): HTMLCanvasElement {
  const maxSide = 900;
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const src = document.createElement("canvas");
  src.width = w;
  src.height = h;
  const sctx = src.getContext("2d", { willReadFrequently: true });
  if (!sctx) return src;
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
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (alpha[y * w + x] <= 12) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0) return src;

  const cw = maxX - minX + 1;
  const ch = maxY - minY + 1;
  const out = document.createElement("canvas");
  out.width = cw;
  out.height = ch;
  const octx = out.getContext("2d");
  if (!octx) return out;
  const outData = octx.createImageData(cw, ch);
  const od = outData.data;
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      const si = ((y + minY) * w + (x + minX)) * 4;
      const di = (y * cw + x) * 4;
      const lum = 0.2126 * d[si] + 0.7152 * d[si + 1] + 0.0722 * d[si + 2];
      od[di] = lum;
      od[di + 1] = lum;
      od[di + 2] = lum;
      od[di + 3] = alpha[(y + minY) * w + (x + minX)];
    }
  }
  octx.putImageData(outData, 0, 0);
  return out;
}

function loadCutout(src: string): Promise<HTMLCanvasElement> {
  const cached = cutoutCache.get(src);
  if (cached) return cached;
  const pending = new Promise<HTMLCanvasElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        resolve(knockout(img));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error(`Could not load ${src}`));
    img.src = src;
  });
  cutoutCache.set(src, pending);
  return pending;
}

function paint(dest: HTMLCanvasElement, src: HTMLCanvasElement) {
  dest.width = src.width;
  dest.height = src.height;
  const ctx = dest.getContext("2d");
  ctx?.drawImage(src, 0, 0);
}

function LoginFigure({ spec }: { spec: FigureSpec }) {
  const startRef = useRef<HTMLCanvasElement>(null);
  const execRef = useRef<HTMLCanvasElement>(null);
  const [showExec, setShowExec] = useState(spec.startOnExec);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.all([loadCutout(spec.start), loadCutout(spec.exec)])
      .then(([start, exec]) => {
        if (!alive || !startRef.current || !execRef.current) return;
        paint(startRef.current, start);
        paint(execRef.current, exec);
        setReady(true);
      })
      .catch(() => {});

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setShowExec(true);
      return () => {
        alive = false;
      };
    }

    let interval = 0;
    const kick = window.setTimeout(() => {
      setShowExec((v) => !v);
      interval = window.setInterval(() => setShowExec((v) => !v), STEP_MS);
    }, spec.offsetMs === 0 ? STEP_MS : spec.offsetMs);

    return () => {
      alive = false;
      window.clearTimeout(kick);
      window.clearInterval(interval);
    };
  }, [spec]);

  const startOpacity = ready && !showExec ? 1 : 0;
  const execOpacity = ready && showExec ? 1 : 0;

  return (
    <div
      className={`pointer-events-none absolute ${spec.className}`}
      style={{
        opacity: spec.opacity,
        transform: spec.mirror ? "scaleX(-1)" : undefined,
      }}
    >
      <canvas
        ref={startRef}
        className="absolute inset-0 h-full w-full object-contain object-bottom"
        style={{ opacity: startOpacity, transition: `opacity ${FADE_MS}ms linear` }}
      />
      <canvas
        ref={execRef}
        className="absolute inset-0 h-full w-full object-contain object-bottom"
        style={{ opacity: execOpacity, transition: `opacity ${FADE_MS}ms linear` }}
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
