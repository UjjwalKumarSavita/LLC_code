"use client";

import { useEffect, useRef } from "react";

type Point = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
};

export function AmbientCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let frame = 0;
    let width = 0;
    let height = 0;
    let points: Point[] = [];
    let pointerX = -1000;
    let pointerY = -1000;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const createPoints = () => {
      const count = Math.min(72, Math.max(28, Math.floor(width / 22)));
      points = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        radius: Math.random() * 1.15 + 0.35,
      }));
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.min(Math.max(rect.width || window.innerWidth, 1), window.innerWidth * 1.5, 2400);
      height = Math.min(Math.max(rect.height || window.innerHeight, 1), window.innerHeight * 1.5, 1600);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      createPoints();
    };

    const draw = () => {
      const isLight = document.documentElement.dataset.theme === "light";
      const ink = isLight ? "0, 0, 0" : "255, 255, 255";

      context.clearRect(0, 0, width, height);

      for (let index = 0; index < points.length; index += 1) {
        const point = points[index];
        if (!reducedMotion) {
          point.x += point.vx;
          point.y += point.vy;
        }

        if (point.x < -10) point.x = width + 10;
        if (point.x > width + 10) point.x = -10;
        if (point.y < -10) point.y = height + 10;
        if (point.y > height + 10) point.y = -10;

        const pointerDistance = Math.hypot(point.x - pointerX, point.y - pointerY);
        if (pointerDistance < 150 && pointerDistance > 0 && !reducedMotion) {
          point.x += ((point.x - pointerX) / pointerDistance) * 0.25;
          point.y += ((point.y - pointerY) / pointerDistance) * 0.25;
        }

        context.beginPath();
        context.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(${ink}, 0.44)`;
        context.fill();

        for (let otherIndex = index + 1; otherIndex < points.length; otherIndex += 1) {
          const other = points[otherIndex];
          const distance = Math.hypot(point.x - other.x, point.y - other.y);
          if (distance < 112) {
            context.beginPath();
            context.moveTo(point.x, point.y);
            context.lineTo(other.x, other.y);
            context.strokeStyle = `rgba(${ink}, ${0.095 * (1 - distance / 112)})`;
            context.lineWidth = 0.6;
            context.stroke();
          }
        }
      }

      if (!reducedMotion) frame = requestAnimationFrame(draw);
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerX = event.clientX - rect.left;
      pointerY = event.clientY - rect.top;
    };

    const onPointerLeave = () => {
      pointerX = -1000;
      pointerY = -1000;
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);
    resize();
    draw();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <canvas
      aria-hidden="true"
      className="ambient-canvas"
      ref={canvasRef}
      style={{ pointerEvents: "none" }}
    />
  );
}
