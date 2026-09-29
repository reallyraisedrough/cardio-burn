"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Real athletes from the app's licensed form photos.
 * Studio backdrop is removed by flood-filling from the image edges
 * through near-white, low-saturation pixels only. Skin, hair, and
 * clothes stay. Output is grayscale. Start and exec are preloaded,
 * then hard-cut (no opacity crossfade) inside a small slot.
 */

/** Background pixels the edge flood may travel through. */
const BG_LUM = 210;
const BG_SAT = 32;
/**
 * A leftover component with no pixel darker than this is still studio
 * (a sealed-off white patch), not a person. Subject components always
 * contain hair, clothes, or shoes below this.
 */
const SUBJECT_DARK = 170;
const STEP_MS = 800;

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

/** Small slots, inset >= 4% from every edge. No tall h-[70%] crops. */
const FIGURES: FigureSpec[] = [
  {
    start: "/forms/squats-start.jpg",
    exec: "/forms/squats-exec.jpg",
    className: "left-[4%] top-[4%] h-[42vh] w-[22vw]",
    opacity: 0.52,
    mirror: false,
    startOnExec: false,
    offsetMs: 0,
  },
  {
    start: "/forms/burpees-start.jpg",
    exec: "/forms/burpees-exec.jpg",
    className: "right-[4%] top-[4%] h-[42vh] w-[22vw]",
    opacity: 0.46,
    mirror: true,
    startOnExec: true,
    offsetMs: 400,
  },
  {
    start: "/forms/squats-start.jpg",
    exec: "/forms/squats-exec.jpg",
    className: "bottom-[4%] left-[4%] h-[42vh] w-[22vw]",
    opacity: 0.4,
    mirror: true,
    startOnExec: true,
    offsetMs: 800,
  },
  {
    start: "/forms/burpees-start.jpg",
    exec: "/forms/burpees-exec.jpg",
    className: "bottom-[4%] right-[4%] h-[42vh] w-[22vw]",
    opacity: 0.38,
    mirror: false,
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

function knockout(img: HTMLImageElement): Cutout {
  const maxSide = 900;
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const src = document.createElement("canvas");
  src.width = w;
  src.height = h;
  const sctx = src.getContext("2d", { willReadFrequently: true });
  const full: Cutout = { canvas: src, minX: 0, minY: 0, maxX: w - 1, maxY: h - 1 };
  if (!sctx) return full;

  sctx.drawImage(img, 0, 0, w, h);
  const image = sctx.getImageData(0, 0, w, h);
  const d = image.data;
  const n = w * h;
  const lum = new Float32Array(n);
  const removable = new Uint8Array(n);

  for (let p = 0, i = 0; p < n; p++, i += 4) {
    const r = d[i];
    const g = d[i + 1];
    const b = d[i + 2];
    const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const sat = Math.max(r, g, b) - Math.min(r, g, b);
    lum[p] = L;
    if (L >= BG_LUM && sat <= BG_SAT) removable[p] = 1;
  }

  // Flood from the edges only. Interior skin is never visited unless it
  // is itself near-white and connected to the backdrop, which it is not.
  const bg = new Uint8Array(n);
  const seen = new Uint8Array(n);
  const stack: number[] = [];
  const seed = (p: number) => {
    if (seen[p]) return;
    seen[p] = 1;
    if (!removable[p]) return;
    bg[p] = 1;
    stack.push(p);
  };
  for (let x = 0; x < w; x++) {
    seed(x);
    seed((h - 1) * w + x);
  }
  for (let y = 0; y < h; y++) {
    seed(y * w);
    seed(y * w + (w - 1));
  }
  while (stack.length) {
    const p = stack.pop() as number;
    const x = p % w;
    const y = (p / w) | 0;
    if (x > 0) seed(p - 1);
    if (x < w - 1) seed(p + 1);
    if (y > 0) seed(p - w);
    if (y < h - 1) seed(p + w);
  }

  // Near-white islands the flood could not enter (a darker rim in front
  // of them). They have no dark subject pixel, so they are still backdrop.
  const vis = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    if (bg[i] || vis[i]) continue;
    stack.length = 0;
    stack.push(i);
    vis[i] = 1;
    const comp: number[] = [];
    let dark = false;
    while (stack.length) {
      const p = stack.pop() as number;
      comp.push(p);
      if (lum[p] < SUBJECT_DARK) dark = true;
      const x = p % w;
      const y = (p / w) | 0;
      if (x > 0) {
        const nb = p - 1;
        if (!bg[nb] && !vis[nb]) {
          vis[nb] = 1;
          stack.push(nb);
        }
      }
      if (x < w - 1) {
        const nb = p + 1;
        if (!bg[nb] && !vis[nb]) {
          vis[nb] = 1;
          stack.push(nb);
        }
      }
      if (y > 0) {
        const nb = p - w;
        if (!bg[nb] && !vis[nb]) {
          vis[nb] = 1;
          stack.push(nb);
        }
      }
      if (y < h - 1) {
        const nb = p + w;
        if (!bg[nb] && !vis[nb]) {
          vis[nb] = 1;
          stack.push(nb);
        }
      }
    }
    if (!dark) {
      for (const p of comp) bg[p] = 1;
    }
  }

  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;
  const out = sctx.createImageData(w, h);
  const od = out.data;
  for (let p = 0, i = 0; p < n; p++, i += 4) {
    const L = lum[p];
    od[i] = L;
    od[i + 1] = L;
    od[i + 2] = L;
    if (bg[p]) {
      od[i + 3] = 0;
      continue;
    }
    od[i + 3] = 255;
    const x = p % w;
    const y = (p / w) | 0;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  sctx.putImageData(out, 0, 0);

  // A short box means the cut kept only part of the body (legs). Do not
  // crop to it; keep the full frame so the head is not zoomed away.
  if (maxX < 0 || maxY - minY + 1 < h * 0.5) {
    return full;
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

/**
 * Contain the body inside the slot canvas. Feet sit on the bottom edge.
 * scale = min(slotW / bodyW, slotH / bodyH). CSS object-fit is not used;
 * a canvas ignores it in a way that was zooming the cropped legs.
 */
function drawContained(dest: HTMLCanvasElement, cut: Cutout) {
  const cssW = dest.clientWidth;
  const cssH = dest.clientHeight;
  if (cssW < 2 || cssH < 2) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const pw = Math.max(1, Math.round(cssW * dpr));
  const ph = Math.max(1, Math.round(cssH * dpr));
  if (dest.width !== pw || dest.height !== ph) {
    dest.width = pw;
    dest.height = ph;
  }
  const ctx = dest.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, pw, ph);
  const bodyW = cut.maxX - cut.minX + 1;
  const bodyH = cut.maxY - cut.minY + 1;
  const scale = Math.min(pw / bodyW, ph / bodyH);
  const dw = bodyW * scale;
  const dh = bodyH * scale;
  const dx = (pw - dw) / 2;
  const dy = ph - dh;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    cut.canvas,
    cut.minX,
    cut.minY,
    bodyW,
    bodyH,
    dx,
    dy,
    dw,
    dh,
  );
}

function LoginFigure({ spec }: { spec: FigureSpec }) {
  const viewRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<[Cutout, Cutout] | null>(null);
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
      drawContained(canvas, showExecRef.current ? frames[1] : frames[0]);
    };

    Promise.all([loadCutout(spec.start), loadCutout(spec.exec)])
      .then(([start, exec]) => {
        if (!alive) return;
        framesRef.current = [start, exec];
        paint();
        setReady(true);
      })
      .catch(() => {});

    const canvas = viewRef.current;
    const ro = new ResizeObserver(() => paint());
    if (canvas) ro.observe(canvas);

    if (reduced) {
      return () => {
        alive = false;
        ro.disconnect();
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
      ro.disconnect();
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
      <canvas ref={viewRef} className="block h-full w-full" />
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
