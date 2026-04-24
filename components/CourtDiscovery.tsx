"use client";

import { useEffect, useState } from "react";
import { Filter, LayoutGrid, List, Map, SlidersHorizontal } from "lucide-react";

import type { CourtListing } from "@/data/courtListings";
import { courtListings, directoryMeta } from "@/data/courtListings";
import { FilterSidebar } from "./FilterSidebar";
import { LocationCard } from "./LocationCard";

type ViewMode = "grid" | "list" | "map";

function listingCardProps(court: CourtListing) {
  const { id, type, ...props } = court;
  void id;
  void type;
  return props;
}

const LG_QUERY = "(min-width: 1024px)";

export function CourtDiscovery() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [desktopFiltersVisible, setDesktopFiltersVisible] = useState(true);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [isLg, setIsLg] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(LG_QUERY);
    const sync = () => {
      const next = mq.matches;
      setIsLg(next);
      if (next) {
        setMobileSheetOpen(false);
      }
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!mobileSheetOpen || isLg === true) {
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileSheetOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileSheetOpen, isLg]);

  const showDesktopSidebar = isLg === true && desktopFiltersVisible;
  const showMobileSheet = isLg !== true && mobileSheetOpen;

  return (
    <>
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-gray-900">
                {courtListings.length} courts in directory
              </p>
              <p className="text-sm text-gray-500">
                Data from{" "}
                <a
                  href={directoryMeta.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline-offset-2 hover:underline"
                >
                  directory.lokalpikol.com
                </a>
                {directoryMeta.scrapedAt
                  ? ` · scraped ${new Date(directoryMeta.scrapedAt).toLocaleDateString()}`
                  : null}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined" && window.matchMedia(LG_QUERY).matches) {
                    setDesktopFiltersVisible(true);
                  } else {
                    setMobileSheetOpen(true);
                  }
                }}
                className={`flex h-10 items-center gap-2 rounded-md border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 ${
                  desktopFiltersVisible ? "lg:hidden" : ""
                }`}
                aria-expanded={isLg === true ? undefined : mobileSheetOpen || undefined}
                aria-haspopup={isLg === true ? undefined : "dialog"}
                aria-controls={showMobileSheet ? "court-filters-sheet" : undefined}
                aria-label="Open filters"
              >
                <Filter className="h-4 w-4" />
                Filters
              </button>

              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 shrink-0 text-gray-400" />
                <label htmlFor="sort-courts" className="sr-only">
                  Sort results
                </label>
                <select
                  id="sort-courts"
                  name="sort"
                  defaultValue="distance"
                  className="h-10 w-[180px] rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="distance">Closest first</option>
                  <option value="rating">Highest rated</option>
                  <option value="reviews">Most reviewed</option>
                  <option value="courts">Most courts</option>
                </select>
              </div>

              <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-1">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`rounded p-2 transition-colors ${
                    viewMode === "grid"
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  aria-pressed={viewMode === "grid"}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`rounded p-2 transition-colors ${
                    viewMode === "list"
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  aria-pressed={viewMode === "list"}
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("map")}
                  className={`rounded p-2 transition-colors ${
                    viewMode === "map"
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  aria-pressed={viewMode === "map"}
                  aria-label="Map view"
                >
                  <Map className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {showDesktopSidebar ? (
            <div className="hidden w-full shrink-0 lg:block lg:w-80">
              <FilterSidebar
                variant="sidebar"
                onClose={() => setDesktopFiltersVisible(false)}
              />
            </div>
          ) : null}

          {showMobileSheet ? (
            <div
              className="fixed inset-0 z-50 flex items-end justify-center lg:hidden"
              role="presentation"
            >
              <button
                type="button"
                className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
                aria-label="Close filters"
                onClick={() => setMobileSheetOpen(false)}
              />
              <div
                id="court-filters-sheet"
                role="dialog"
                aria-modal="true"
                aria-labelledby="court-filters-sheet-title"
                className="relative flex max-h-[min(92dvh,100dvh)] w-full max-w-lg flex-col rounded-t-2xl border border-b-0 border-gray-200 bg-white shadow-2xl"
              >
                <div
                  className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-gray-300"
                  aria-hidden
                />
                <p id="court-filters-sheet-title" className="sr-only">
                  Filter courts
                </p>
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-1">
                  <FilterSidebar
                    variant="sheet"
                    onClose={() => setMobileSheetOpen(false)}
                  />
                </div>
                <div className="shrink-0 border-t border-gray-100 bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
                  <button
                    type="button"
                    onClick={() => setMobileSheetOpen(false)}
                    className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
                  >
                    View {courtListings.length} courts
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <div className="min-w-0 flex-1">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                {courtListings.map((court) => (
                  <LocationCard key={court.id} {...listingCardProps(court)} />
                ))}
              </div>
            ) : null}

            {viewMode === "list" ? (
              <div className="space-y-4">
                {courtListings.map((court) => (
                  <LocationCard key={court.id} {...listingCardProps(court)} />
                ))}
              </div>
            ) : null}

            {viewMode === "map" ? (
              <div className="flex h-[600px] items-center justify-center rounded-lg border border-gray-200 bg-white p-8">
                <div className="text-center">
                  <Map className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                  <p className="mb-2 font-medium text-gray-600">Map View</p>
                  <p className="text-sm text-gray-500">
                    Interactive map showing all pickleball courts in your area
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
