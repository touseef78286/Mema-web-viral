"use client";

import type { CSSProperties } from "react";
import { useMemo } from "react";

type Props = {
  active: boolean;
};

const RAIN_ITEMS = [
  "✎",
  "✐",
  "✦",
  "!!!",
  "^_^",
  "T_T",
  "O_O",
  ">_<",
  "ink",
  "zap",
];

export function MemeRain({ active }: Props) {
  const drops = useMemo(
    () =>
      Array.from({ length: 56 }, (_, index) => {
        const spin = (index % 2 === 0 ? 1 : -1) * (160 + (index % 9) * 24);
        return {
          key: index,
          item: RAIN_ITEMS[index % RAIN_ITEMS.length],
          left: `${(index * 17) % 101}%`,
          delay: `${(index % 13) * 0.06}s`,
          duration: `${0.9 + (index % 7) * 0.12}s`,
          size: `${20 + (index % 8) * 4}px`,
          spin: `${spin}deg`,
        };
      }),
    [],
  );

  if (!active) return null;

  return (
    <div
      className="fixed inset-0 z-50 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {drops.map((drop) => (
        <span
          key={drop.key}
          className="absolute -top-16 animate-meme-rain font-marker text-black/70 drop-shadow-[2px_2px_0_rgba(255,255,255,0.85)]"
          style={
            {
              left: drop.left,
              animationDelay: drop.delay,
              animationDuration: drop.duration,
              fontSize: drop.size,
              "--spin-deg": drop.spin,
            } as CSSProperties
          }
        >
          {drop.item}
        </span>
      ))}
    </div>
  );
}
