"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, DollarSign, Sliders, Star, X } from "lucide-react";

const amenities = [
  "Lighting",
  "Restrooms",
  "Parking",
  "Water Fountain",
  "Shade/Cover",
  "Pro Shop",
] as const;

type SectionKey = "distance" | "courtType" | "amenities" | "rating" | "cost";

function fieldId(label: string) {
  return label.toLowerCase().replace(/\//g, "-").replace(/\s+/g, "-");
}

type CollapsibleSectionProps = {
  id: SectionKey;
  title: string;
  isOpen: boolean;
  onToggle: (id: SectionKey) => void;
  as?: "div" | "fieldset";
  children: ReactNode;
};

function CollapsibleSection({
  id,
  title,
  isOpen,
  onToggle,
  as = "div",
  children,
}: CollapsibleSectionProps) {
  const Wrapper = as;
  const contentId = `filter-section-${id}`;

  return (
    <Wrapper className="mb-6 border-b border-gray-100 pb-6 last:mb-0 last:border-b-0 last:pb-0">
      <button
        type="button"
        onClick={() => onToggle(id)}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-sm font-medium text-gray-900">{title}</span>
        <ChevronDown
          className={`h-4 w-4 text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen ? (
        <div id={contentId} className="mt-3">
          {children}
        </div>
      ) : null}
    </Wrapper>
  );
}

type FilterSidebarProps = {
  onClose?: () => void;
  /** `sheet`: used inside mobile bottom sheet (no sticky, fills container). */
  variant?: "sidebar" | "sheet";
};

export function FilterSidebar({ onClose, variant = "sidebar" }: FilterSidebarProps) {
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    distance: true,
    courtType: true,
    amenities: true,
    rating: true,
    cost: true,
  });

  const toggleSection = (key: SectionKey) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const shellClassName =
    variant === "sheet"
      ? "flex h-full min-h-0 w-full flex-col overflow-hidden bg-white"
      : "sticky top-24 flex h-[calc(100dvh-9rem)] w-full shrink-0 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white lg:w-80 lg:self-start";

  return (
    <aside className={shellClassName}>
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-gray-100 px-6 py-4">
        <div className="flex items-center gap-2">
          <Sliders className="h-5 w-5 text-blue-600" />
          <h2 className="font-semibold text-gray-900">Filters</h2>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="rounded p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <form id="court-filters" className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4">
        <CollapsibleSection
          id="distance"
          title="Distance (miles)"
          isOpen={openSections.distance}
          onToggle={toggleSection}
        >
          <label htmlFor="distance-miles" className="sr-only">
            Distance (miles)
          </label>
          <input
            id="distance-miles"
            name="distanceMiles"
            type="range"
            min={0}
            max={50}
            step={5}
            defaultValue={10}
            className="mb-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0 mi</span>
            <span>50 mi</span>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          id="courtType"
          title="Court Type"
          isOpen={openSections.courtType}
          onToggle={toggleSection}
          as="fieldset"
        >
          <div className="space-y-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
              <input type="radio" name="courtType" value="all" defaultChecked className="accent-blue-600" />
              All Courts
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
              <input type="radio" name="courtType" value="outdoor" className="accent-blue-600" />
              Outdoor Only
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
              <input type="radio" name="courtType" value="indoor" className="accent-blue-600" />
              Indoor Only
            </label>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          id="amenities"
          title="Amenities"
          isOpen={openSections.amenities}
          onToggle={toggleSection}
        >
          <div className="space-y-3">
            {amenities.map((amenity) => {
              const id = fieldId(amenity);
              return (
                <label key={amenity} htmlFor={id} className="flex cursor-pointer items-center gap-2">
                  <input id={id} type="checkbox" name={`amenity-${id}`} className="rounded border-gray-300 accent-blue-600" />
                  <span className="text-sm text-gray-700">{amenity}</span>
                </label>
              );
            })}
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          id="rating"
          title="Minimum Rating"
          isOpen={openSections.rating}
          onToggle={toggleSection}
          as="fieldset"
        >
          <div className="space-y-2">
            {[
              { value: "any", label: "Any Rating" },
              { value: "3", label: "3+ Stars" },
              { value: "4", label: "4+ Stars" },
              { value: "4.5", label: "4.5+ Stars" },
            ].map(({ value, label }) => (
              <label
                key={value}
                htmlFor={`rating-${value}`}
                className="flex cursor-pointer items-center gap-2 text-sm text-gray-700"
              >
                <input
                  type="radio"
                  name="minRating"
                  value={value}
                  id={`rating-${value}`}
                  defaultChecked={value === "any"}
                  className="accent-blue-600"
                />
                <span className="flex items-center gap-1">
                  {label}
                  {value !== "any" ? (
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  ) : null}
                </span>
              </label>
            ))}
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          id="cost"
          title="Cost"
          isOpen={openSections.cost}
          onToggle={toggleSection}
        >
          <div className="space-y-3">
            {(["Free", "Paid"] as const).map((cost) => (
              <label key={cost} htmlFor={cost.toLowerCase()} className="flex cursor-pointer items-center gap-2">
                <input id={cost.toLowerCase()} type="checkbox" name={`cost-${cost.toLowerCase()}`} className="rounded border-gray-300 accent-blue-600" />
                <span className="flex items-center gap-1 text-sm text-gray-700">
                  {cost}
                  {cost === "Paid" ? <DollarSign className="h-3 w-3" /> : null}
                </span>
              </label>
            ))}
          </div>
        </CollapsibleSection>
        </div>

        <div className="shrink-0 border-t border-gray-100 bg-white px-6 py-4">
          <button
            type="reset"
            className="w-full rounded-lg border border-blue-200 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
          >
            Clear All Filters
          </button>
        </div>
      </form>
    </aside>
  );
}
