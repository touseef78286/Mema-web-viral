"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type Props = {
  src: string;
  fallback: string;
  className?: string;
  floatClassName?: string;
  imgClassName?: string;
  randomRotate?: boolean;
  alt?: string;
};

export function FloatingSticker({
  src,
  fallback,
  className,
  floatClassName,
  imgClassName,
  randomRotate,
  alt,
}: Props) {
  const [failed, setFailed] = useState(false);
  const rot = useMemo(() => {
    if (!randomRotate) return 0;
    return ((hash(src) % 440) - 220) / 10;
  }, [randomRotate, src]);

  return (
    <div
      className={[
        "pointer-events-none select-none",
        "absolute",
        floatClassName ?? "animate-floaty",
        className ?? "",
      ].join(" ")}
      aria-hidden="true"
    >
      <div style={{ transform: `rotate(${rot}deg)` }}>
        {failed ? (
          <div className="grid place-items-center text-5xl drop-shadow-[0_6px_0_rgba(0,0,0,0.4)]">
            {fallback}
          </div>
        ) : (
          <Image
            src={src}
            alt={alt ?? ""}
            width={96}
            height={96}
            className={[
              "object-contain drop-shadow-[0_10px_0_rgba(0,0,0,0.35)]",
              imgClassName ?? "h-20 w-20 md:h-24 md:w-24",
            ].join(" ")}
            onError={() => setFailed(true)}
            draggable={false}
          />
        )}
      </div>
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
