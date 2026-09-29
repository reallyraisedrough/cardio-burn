"use client";

import { useEffect, useRef } from "react";

const GREENS = ["#00ff41", "#00e63c", "#00cc33", "#00dd39"];

type Column = {
  x: number;
  y: number;
  speed: number;
  size: number;
  gap: number;
  count: number;
  shade: number;
};

function drawDumbbell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
) {
  const plateW = Math.max(4, Math.round(size * 0.34));
  const plateH = Math.max(10, Math.round(size));
  const barW = Math.max(8, Math.round(size * 0.9));
  const barH = Math.max(2, Math.round(size * 0.2));
  const x0 = Math.round(x);
  const y0 = Math.round(y);
  ctx.fillRect(x0, y0, plateW, plateH);
  ctx.fillRect(x0 + plateW, y0 + Math.round((plateH - barH) / 2), barW, barH);
  ctx.fillRect(x0 + plateW + barW, y0, plateW, plateH);
}

export function DumbbellRain() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const columns: Column[] = [];
    let raf = 0;
    let running = true;

    const layout = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      columns.length = 0;
      const spacing = 36;
      const n = Math.ceil(w / spacing) + 1;
      for (let i = 0; i < n; i++) {
        columns.push({
          x: Math.round(i * spacing + (i % 2) * 8),
          y: Math.round(Math.random() * h),
          speed: 80 + (i % 6) * 26,
          size: 12 + (i % 3) * 3,
          gap: 26 + (i % 4) * 4,
          count: 7 + (i % 5),
          shade: i % GREENS.length,
        });
      }
    };

    layout();
    const observer = new ResizeObserver(layout);
    if (canvas.parentElement) observer.observe(canvas.parentElement);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let last = performance.now();

    const paint = (now: number) => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ctx.clearRect(0, 0, w, h);
      ctx.imageSmoothingEnabled = false;
      for (const col of columns) {
        if (!reduced) {
          col.y += col.speed * dt;
          const trail = col.count * col.gap;
          if (col.y - trail > h + 8) col.y = -col.gap;
        }
        for (let i = 0; i < col.count; i++) {
          const gy = col.y - i * col.gap;
          if (gy < -col.size - 2 || gy > h + 2) continue;
          const head = i === 0;
          ctx.globalAlpha = head ? 1 : Math.max(0.62, 0.95 - i * 0.05);
          ctx.fillStyle = head ? "#00ff41" : GREENS[(col.shade + i) % GREENS.length];
          drawDumbbell(ctx, col.x, gy, head ? col.size + 2 : col.size);
        }
      }
      ctx.globalAlpha = 1;
    };

    const frame = (now: number) => {
      if (!running) return;
      if (!document.hidden) paint(now);
      raf = requestAnimationFrame(frame);
    };

    if (reduced) {
      paint(performance.now());
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="pointer-events-none absolute inset-0 z-[1]"
      aria-hidden
    />
  );
}
