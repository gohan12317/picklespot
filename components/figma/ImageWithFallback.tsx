"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "../ui/utils";

type ImageWithFallbackProps = {
  src: string;
  alt: string;
  className?: string;
};

export function ImageWithFallback({ src, alt, className }: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(false);

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
