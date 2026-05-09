"use client";

import type { CSSProperties } from "react";
import { useMemo } from "react";

type Props = {
  emoji: string;
  className?: string;
  opacity?: number;
  sizePx?: number;
};

export function FloatingEmoji({ emoji, className, opacity = 0.55, sizePx }: Props) {
  const style = useMemo(() => {
    const seed = hash(`${emoji}:${className ?? ""}`);
    const left = seed % 100;
    const top = (seed >> 3) % 100;
    const dur = 10 + (seed % 10);
    const delay = ((seed >> 5) % 25) / 10;
    const size = sizePx ?? 18 + (seed % 26);
    const rot = ((seed % 400) - 200) / 10;
    return {
      left: `${left}%`,
      top: `${top}%`,
      opacity,
      fontSize: `${size}px`,
      transform: `rotate(${rot}deg)`,
      animationDuration: `${dur}s`,
      animationDelay: `${delay}s`,
    } as CSSProperties;
  }, [className, emoji, opacity, sizePx]);

  return (
    <div
      className={[
        "absolute pointer-events-none select-none animate-floaty-slow",
        className ?? "",
      ].join(" ")}
      style={style}
      aria-hidden="true"
    >
      {emoji}
    </div>
  );
}

function hash(value: string) {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}
