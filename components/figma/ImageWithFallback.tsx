"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "../ui/utils";

type ImageWithFallbackProps = {
  src: string;
  alt: string;
  className?: string;
};

function useNextImageOptimizer(src: string): boolean {
  if (src.startsWith("/")) return true;
  try {
    const host = new URL(src).hostname;
    return host === "picsum.photos";
  } catch {
    return false;
  }
}

export function ImageWithFallback({ src, alt, className }: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(false);
  const optimized = useNextImageOptimizer(src);

  if (failed) {
    return (
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center bg-gray-100 text-center text-xs text-gray-500",
          className,
        )}
      >
        Image unavailable
      </div>
    );
  }

  if (!optimized) {
    /* next/image requires every remote host in config; DB URLs are arbitrary HTTPS. */
    return (
      // eslint-disable-next-line @next/next/no-img-element -- user-supplied court photo URLs
      <img
        src={src}
        alt={alt}
        className={cn("absolute inset-0 h-full w-full", className)}
        loading="lazy"
        decoding="async"
        referrerPolicy="strict-origin-when-cross-origin"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={className}
      sizes="(max-width: 1024px) 100vw, 33vw"
      onError={() => setFailed(true)}
    />
  );
}
