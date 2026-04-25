"use client";

import { ExternalLink } from "lucide-react";

import type { SocialMediaLink } from "@/data/courtListings";
import { cn } from "./ui/utils";

function abbrev(platform: string): string {
  const p = platform.trim().toLowerCase();
  if (p.includes("facebook")) return "Facebook";
  if (p.includes("instagram")) return "Instagram";
  if (p.includes("tiktok")) return "TikTok";
  if (p.includes("youtube")) return "YouTube";
  if (p.includes("twitter") || p === "x" || p.includes(" x ")) return "X";
  if (p.length <= 10) return platform.trim();
  return `${platform.trim().slice(0, 9)}…`;
}

function validLinks(links: SocialMediaLink[] | undefined): SocialMediaLink[] {
  if (!links?.length) return [];
  return links.filter((l) => typeof l.url === "string" && l.url.trim().length > 0);
}

type SocialMediaChipsProps = {
  links: SocialMediaLink[] | undefined;
  /** Tighter padding and type for modal / dense cards */
  dense?: boolean;
  className?: string;
};

export function SocialMediaChips({ links, dense, className }: SocialMediaChipsProps) {
  const items = validLinks(links);
  if (!items.length) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {items.map((l, i) => (
        <a
          key={`${l.url}-${i}`}
          href={l.url.trim()}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "inline-flex max-w-full items-center gap-1 rounded-full font-medium text-blue-700 ring-1 ring-blue-200/70 transition hover:bg-blue-50 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50",
            dense ? "bg-blue-50/90 px-2.5 py-1 text-xs" : "bg-blue-50/90 px-2.5 py-1 text-xs",
          )}
          title={`${l.platform.trim()} (opens in new tab)`}
        >
          <span className="min-w-0 truncate">{abbrev(l.platform)}</span>
          <ExternalLink className="h-3 w-3 shrink-0 opacity-70" strokeWidth={1.75} aria-hidden />
        </a>
      ))}
    </div>
  );
}
