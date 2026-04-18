"use client";

import { useCallback, useState } from "react";

type ImageSlotProps = {
  /** File name under `demo/public/` (e.g. `hero.png`). */
  filename: string;
  className?: string;
  alt?: string;
};

export function ImageSlot({ filename, className = "", alt = "" }: ImageSlotProps) {
  const [failed, setFailed] = useState(false);
  const onError = useCallback(() => setFailed(true), []);

  if (failed) {
    return (
      <div
        className={`flex min-h-[12rem] flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/[0.04] p-6 text-center ${className}`}
      >
        <p className="text-sm text-mist">
          Drop your image here as{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-zinc-100">
            public/{filename}
          </code>
        </p>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-white/[0.04] ${className}`}>
      {/* Optional asset — no static import so missing files degrade to placeholder */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/${filename}`}
        alt={alt}
        className="h-full w-full object-cover"
        onError={onError}
      />
    </div>
  );
}
