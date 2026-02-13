"use client";

import { useRef, useEffect, useState, ReactNode } from "react";
import rough from "roughjs";

interface SketchyBoxProps {
  children: ReactNode;
  className?: string;
  strokeColor?: string;
  fillColor?: string;
  roughness?: number;
  strokeWidth?: number;
  fill?: boolean;
  onClick?: () => void;
}

export default function SketchyBox({
  children,
  className = "",
  strokeColor = "#3f3f46",
  fillColor = "rgba(24, 24, 27, 0.5)",
  roughness = 1.5,
  strokeWidth = 1.5,
  fill = true,
  onClick,
}: SketchyBoxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width: Math.ceil(width), height: Math.ceil(height) });
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!canvasRef.current || dimensions.width === 0 || dimensions.height === 0)
      return;

    const canvas = canvasRef.current;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    canvas.style.width = `${dimensions.width}px`;
    canvas.style.height = `${dimensions.height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    const rc = rough.canvas(canvas);

    const padding = 2;
    rc.rectangle(
      padding,
      padding,
      dimensions.width - padding * 2,
      dimensions.height - padding * 2,
      {
        stroke: strokeColor,
        strokeWidth,
        roughness,
        fill: fill ? fillColor : undefined,
        fillStyle: "solid",
        seed: 42,
      }
    );
  }, [dimensions, strokeColor, fillColor, roughness, strokeWidth, fill]);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : undefined }}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0"
        style={{ zIndex: 0 }}
      />
      <div className="relative" style={{ zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}
