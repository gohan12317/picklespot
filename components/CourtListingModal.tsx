"use client";

import type { Dispatch, SetStateAction } from "react";
import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Layers,
  Mail,
  MapPin,
  MapPinned,
  Maximize2,
  Phone,
  Share2,
  Star,
  X,
} from "lucide-react";

import type { CourtListing } from "@/data/courtListings";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { SocialMediaChips } from "./SocialMediaChips";
import { Badge } from "./ui/badge";

function mapsSearchUrl(court: CourtListing): string {
  const direct = court.mapsUrl?.trim();
  if (direct) return direct;
  const q = encodeURIComponent(`${court.courtName} ${court.fullAddress}`.trim() || court.courtName);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

function telHref(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, "");
  return cleaned ? `tel:${cleaned}` : `tel:${phone}`;
}

type GalleryLightboxProps = {
  images: string[];
  courtName: string;
  slide: number;
  onSlideChange: Dispatch<SetStateAction<number>>;
  onClose: () => void;
};

function GalleryLightbox({ images, courtName, slide, onSlideChange, onClose }: GalleryLightboxProps) {
  const n = images.length;
  const pct = n > 0 ? 100 / n : 100;
  const go = useCallback(
    (dir: -1 | 1) => {
      if (n <= 1) return;
      onSlideChange((s) => (s + dir + n) % n);
    },
    [n, onSlideChange],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (n <= 1) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [n, onClose, go]);

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-zinc-950/97 backdrop-blur-md" role="dialog" aria-modal="true" aria-label="Photo gallery">
      <button
        type="button"
        className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 transition hover:bg-white/20"
        onClick={onClose}
        aria-label="Close gallery"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="flex flex-1 flex-col items-center justify-center px-2 pt-14 pb-4 sm:px-6">
        <p className="mb-3 max-w-lg truncate px-4 text-center text-sm font-medium text-white/90">{courtName}</p>
        <div className="relative aspect-[4/3] w-full max-w-4xl overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10 sm:aspect-video">
          <div
            className="flex h-full w-full transition-transform duration-500 ease-out motion-reduce:transition-none"
            style={{
              width: `${n * 100}%`,
              transform: `translateX(-${slide * pct}%)`,
            }}
          >
            {images.map((src, i) => (
              <div key={`lb-${src}-${i}`} className="relative h-full shrink-0 bg-black" style={{ width: `${pct}%` }}>
                <ImageWithFallback
                  src={src}
                  alt={i === slide ? `${courtName} — photo ${i + 1} of ${n}` : ""}
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        </div>

        {n > 1 ? (
          <div className="mt-4 flex w-full max-w-4xl items-center justify-between gap-4 px-2">
            <button
              type="button"
              onClick={() => go(-1)}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/15 transition hover:bg-white/20"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <span className="text-sm tabular-nums text-white/70">
              {slide + 1} <span className="text-white/40">/</span> {n}
            </span>
            <button
              type="button"
              onClick={() => go(1)}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/15 transition hover:bg-white/20"
              aria-label="Next photo"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        ) : null}

        {n > 1 ? (
          <div className="mt-4 flex max-w-full gap-2 overflow-x-auto px-4 pb-2 pb-[env(safe-area-inset-bottom)] [scrollbar-width:thin]">
            {images.map((src, i) => (
              <button
                key={`thumb-${i}`}
                type="button"
                onClick={() => onSlideChange(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === slide ? "true" : undefined}
                className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg ring-2 transition ${
                  i === slide ? "ring-white" : "ring-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <ImageWithFallback src={src} alt="" className="object-cover" />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

type ModalGalleryProps = {
  images: string[];
  courtName: string;
  badges: React.ReactNode;
  reducedMotion: boolean;
  slide: number;
  onSlideChange: Dispatch<SetStateAction<number>>;
  onOpenLightbox: () => void;
};

function ModalGallery({
  images,
  courtName,
  badges,
  reducedMotion,
  slide,
  onSlideChange,
  onOpenLightbox,
}: ModalGalleryProps) {
  const n = images.length;
  const pct = n > 0 ? 100 / n : 100;
  const go = useCallback(
    (dir: -1 | 1) => {
      if (n <= 1) return;
      onSlideChange((s) => (s + dir + n) % n);
    },
    [n, onSlideChange],
  );

  const labelId = useId();

  return (
    <div
      className="relative isolate flex h-full min-h-0 min-w-0 flex-col bg-gradient-to-b from-gray-900 to-gray-950"
      role="region"
      aria-roledescription="carousel"
      aria-labelledby={labelId}
    >
      <p id={labelId} className="sr-only">
        Photo gallery for {courtName}, {n} images
      </p>

      <div className="relative w-full flex-1 basis-0 min-h-0 overflow-hidden">
        <div
          className={`group relative flex h-full w-full ${reducedMotion ? "" : "transition-transform duration-500 ease-out motion-reduce:transition-none"}`}
          style={{
            width: `${n * 100}%`,
            transform: `translateX(-${slide * pct}%)`,
          }}
        >
          {images.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="relative h-full shrink-0 overflow-hidden"
              style={{ width: `${pct}%` }}
              aria-hidden={i !== slide}
            >
              <ImageWithFallback
                src={src}
                alt={i === slide ? `${courtName} — photo ${i + 1} of ${n}` : ""}
                className="object-cover transition duration-700 group-hover:scale-[1.02]"
              />
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />
        <button
          type="button"
          onClick={onOpenLightbox}
          className="pointer-events-auto absolute bottom-3 right-3 z-[2] flex items-center gap-2 rounded-full bg-black/50 px-3 py-2 text-xs font-semibold text-white shadow-lg ring-1 ring-white/15 backdrop-blur-md transition hover:bg-black/65 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          aria-label={`View all ${n} photos full screen`}
        >
          <Maximize2 className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          Photos
        </button>

        <div className="pointer-events-none absolute bottom-3 left-3 flex max-w-[min(100%,14rem)] flex-wrap items-end gap-2">{badges}</div>

        {n > 1 ? (
          <>
            <div className="pointer-events-none absolute left-3 top-1/2 z-[3] flex -translate-y-1/2">
              <button
                type="button"
                onClick={() => go(-1)}
                className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/45 text-white shadow-md backdrop-blur-md transition hover:bg-black/60 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </button>
            </div>
            <div className="pointer-events-none absolute right-3 top-1/2 z-[3] flex -translate-y-1/2">
              <button
                type="button"
                onClick={() => go(1)}
                className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/45 text-white shadow-md backdrop-blur-md transition hover:bg-black/60 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                aria-label="Next photo"
              >
                <ChevronRight className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </button>
            </div>
            <div className="pointer-events-none absolute right-3 top-3 rounded-lg bg-black/45 px-2 py-1 text-[11px] font-semibold tabular-nums text-white/95 ring-1 ring-white/10 backdrop-blur-sm">
              {slide + 1} <span className="text-white/50">/</span> {n}
            </div>
          </>
        ) : null}
      </div>

    </div>
  );
}

type CourtListingModalProps = {
  court: CourtListing | null;
  onClose: () => void;
};

function subscribePrefersReducedMotion(onStoreChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getPrefersReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getPrefersReducedMotionServerSnapshot() {
  return false;
}

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribePrefersReducedMotion,
    getPrefersReducedMotionSnapshot,
    getPrefersReducedMotionServerSnapshot,
  );
}

type CourtListingModalInnerProps = {
  court: CourtListing;
  onClose: () => void;
  reducedMotion: boolean;
};

function CourtListingModalInner({ court, onClose, reducedMotion }: CourtListingModalInnerProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [slide, setSlide] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const images = court.images?.length ? court.images : [court.image];

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const n = images.length;
    const onKey = (e: KeyboardEvent) => {
      if (lightboxOpen) {
        return;
      }
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (n <= 1) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setSlide((s) => (s - 1 + n) % n);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setSlide((s) => (s + 1) % n);
      }
    };
    window.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [court.id, onClose, images.length, lightboxOpen]);

  const showRating = court.rating != null && !Number.isNaN(court.rating);
  const mapsHref = mapsSearchUrl(court);
  const hasStreet = Boolean(court.street?.trim());
  const cityLine = [court.city, court.province?.trim()].filter(Boolean).join(" · ");

  const share = async () => {
    const text = [court.courtName, court.fullAddress, mapsHref].filter(Boolean).join("\n");
    try {
      if (navigator.share) {
        await navigator.share({ title: court.courtName, text });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      }
    } catch {
      /* user cancelled share */
    }
  };

  const badgeCluster = (
    <>
      {court.cost != null ? (
        <Badge
          className={
            court.cost === "free"
              ? "pointer-events-auto border-transparent bg-emerald-500/95 px-2.5 py-1 text-[11px] text-white shadow-sm"
              : "pointer-events-auto border-transparent bg-blue-600/95 px-2.5 py-1 text-[11px] text-white shadow-sm"
          }
        >
          {court.cost === "free" ? "Free" : "Paid"}
        </Badge>
      ) : court.categoryBadge ? (
        <Badge className="pointer-events-auto max-w-[12rem] truncate border-transparent bg-white/15 px-2.5 py-1 text-[11px] text-white ring-1 ring-white/20 backdrop-blur-sm">
          {court.categoryBadge}
        </Badge>
      ) : null}
      <Badge className="pointer-events-auto border-transparent bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-gray-900 shadow-sm">
        {court.distance}
      </Badge>
    </>
  );

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4" role="presentation">
        <button
          type="button"
          className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          aria-label="Close"
          onClick={onClose}
        />

        {/* Close button — floats outside the card, top-right of viewport */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-2 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-lg ring-1 ring-black/[0.08] backdrop-blur-sm transition hover:bg-white active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          aria-label="Close"
        >
          <X className="h-5 w-5" strokeWidth={2} aria-hidden />
        </button>

        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className="relative flex h-[100dvh] max-h-[100dvh] w-full max-w-md flex-col overflow-hidden rounded-t-[2rem] bg-white shadow-[0_-4px_32px_-4px_rgba(15,23,42,0.18),0_24px_64px_-8px_rgba(15,23,42,0.28)] sm:max-h-[min(90svh,820px)] sm:rounded-[2rem]"
        >
          {/* ── Gallery — grows to fill space above info ─────────── */}
          <div className="relative min-h-[80px] flex-1">
            <ModalGallery
              images={images}
              courtName={court.courtName}
              badges={badgeCluster}
              reducedMotion={reducedMotion}
              slide={slide}
              onSlideChange={setSlide}
              onOpenLightbox={() => setLightboxOpen(true)}
            />
          </div>

          {/* ── Info body — fixed size, no scroll ────────────────── */}
          <div className="shrink-0 overflow-hidden">

            {/* Court name + rating */}
            <div className="px-4 pb-0 pt-4">
              <div className="min-w-0">
                <h2
                  id={titleId}
                  className="line-clamp-2 text-[1.15rem] font-extrabold leading-tight tracking-tight text-slate-950 antialiased"
                >
                  {court.courtName}
                </h2>
                {showRating ? (
                  <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] text-amber-950 ring-1 ring-amber-200/70">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-500" strokeWidth={2} aria-hidden />
                    <span className="font-bold tabular-nums">{court.rating}</span>
                    {court.reviews != null ? <span className="text-amber-700/80">· {court.reviews} reviews</span> : null}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mx-4 mt-3 h-px bg-slate-100" />

            {/* Address */}
            <div className="flex items-start gap-3 px-4 py-2.5">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600" aria-hidden>
                <MapPin className="h-[13px] w-[13px]" strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                {hasStreet ? <p className="line-clamp-1 text-[13px] font-semibold leading-snug text-slate-800">{court.street}</p> : null}
                {cityLine ? <p className="text-[11px] font-medium text-slate-500">{cityLine}</p> : null}
                <p className="mt-0.5 line-clamp-2 text-[13px] leading-relaxed text-slate-600">{court.fullAddress}</p>
              </div>
            </div>

            {/* Social */}
            {court.socialMediaLinks.length > 0 ? (
              <>
                <div className="mx-4 h-px bg-slate-100" />
                <div className="px-4 py-2.5">
                  <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">Social</p>
                  <SocialMediaChips links={court.socialMediaLinks} />
                </div>
              </>
            ) : null}

            <div className="mx-4 h-px bg-slate-100" />

            {/* Hours + Courts */}
            <div className="grid grid-cols-2 gap-2.5 px-4 py-2.5">
              <div className="rounded-2xl bg-slate-50 p-2.5">
                <div className="mb-1.5 flex items-center gap-1.5">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-100 text-violet-600">
                    <Clock className="h-3 w-3" strokeWidth={2} aria-hidden />
                  </div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">Hours</p>
                </div>
                <p className="line-clamp-2 text-xs font-medium leading-relaxed text-slate-800">{court.openingHours}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-2.5">
                <div className="mb-1.5 flex items-center gap-1.5">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-teal-100 text-teal-600">
                    <Layers className="h-3 w-3" strokeWidth={2} aria-hidden />
                  </div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">Courts</p>
                </div>
                <p className="text-xl font-extrabold tabular-nums leading-none text-slate-900">{court.courts}</p>
                <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-500">{court.courtType}</p>
              </div>
            </div>

            {/* Phone + Email — only rendered when at least one exists */}
            {(court.phone?.trim() || court.email?.trim()) ? (
              <>
                <div className="mx-4 h-px bg-slate-100" />
                <div
                  className={`grid gap-2.5 px-4 py-2.5 pb-3 ${
                    court.phone?.trim() && court.email?.trim() ? "grid-cols-2" : "grid-cols-1"
                  }`}
                >
                  {court.phone?.trim() ? (
                    <a
                      href={telHref(court.phone)}
                      className="rounded-2xl bg-slate-50 p-2.5 transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/35 active:scale-[0.98]"
                    >
                      <div className="mb-1.5 flex items-center gap-1.5">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-100 text-emerald-600">
                          <Phone className="h-3 w-3" strokeWidth={2} aria-hidden />
                        </div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">Phone</p>
                      </div>
                      <p className="line-clamp-1 break-all font-mono text-xs font-semibold text-slate-900">{court.phone}</p>
                    </a>
                  ) : null}
                  {court.email?.trim() ? (
                    <a
                      href={`mailto:${court.email}`}
                      className="rounded-2xl bg-slate-50 p-2.5 transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35 active:scale-[0.98]"
                    >
                      <div className="mb-1.5 flex items-center gap-1.5">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-100 text-blue-600">
                          <Mail className="h-3 w-3" strokeWidth={2} aria-hidden />
                        </div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">Email</p>
                      </div>
                      <p className="line-clamp-1 break-all text-xs font-semibold text-slate-900">{court.email}</p>
                    </a>
                  ) : null}
                </div>
              </>
            ) : <div className="pb-2" />}
          </div>

          {/* ── Action bar ───────────────────────────────────────── */}
          <div className="shrink-0 space-y-2 border-t border-slate-100 bg-white/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm">
            <a
              href={mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition hover:from-blue-500 hover:to-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 active:scale-[0.99]"
            >
              <MapPinned className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
              Get directions
              <ExternalLink className="h-3.5 w-3.5 opacity-80" strokeWidth={2} aria-hidden />
            </a>

            {court.bookCourtUrl ? (
              <a
                href={court.bookCourtUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 active:scale-[0.99]"
              >
                Book
                <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              </a>
            ) : null}

            <button
              type="button"
              onClick={() => void share()}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40 active:scale-[0.99]"
            >
              <Share2 className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              Share
            </button>
          </div>
        </div>
      </div>

      {lightboxOpen ? (
        <GalleryLightbox
          images={images}
          courtName={court.courtName}
          slide={slide}
          onSlideChange={setSlide}
          onClose={() => setLightboxOpen(false)}
        />
      ) : null}
    </>
  );
}

export function CourtListingModal({ court, onClose }: CourtListingModalProps) {
  const reducedMotion = usePrefersReducedMotion();
  if (!court) return null;
  return (
    <CourtListingModalInner
      key={court.id}
      court={court}
      onClose={onClose}
      reducedMotion={reducedMotion}
    />
  );
}
