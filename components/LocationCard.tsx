import type { ComponentType } from "react";
import {
  Car,
  Clock,
  Droplet,
  ExternalLink,
  Mail,
  MapPin,
  MapPinned,
  Phone,
  Share2,
  Star,
  Sun,
  Users,
  Wifi,
} from "lucide-react";

import type { CourtListing } from "@/data/courtListings";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { SocialMediaChips } from "./SocialMediaChips";
import { Badge } from "./ui/badge";

type LocationCardProps = Omit<
  CourtListing,
  | "id"
  | "type"
  | "images"
  | "street"
  | "city"
  | "province"
  | "fullAddress"
  | "openingHours"
  | "courtType"
  | "mapsUrl"
> & {
  onOpen?: () => void;
};

const amenityIcons: Record<string, ComponentType<{ className?: string }>> = {
  lighting: Sun,
  parking: Car,
  water: Droplet,
  wifi: Wifi,
  phone: Phone,
  email: Mail,
  maps: MapPinned,
  book: ExternalLink,
  social: Share2,
};

export function LocationCard({
  courtName,
  address,
  distance,
  rating,
  reviews,
  courts,
  typeLabel,
  cost,
  categoryBadge,
  hours,
  image,
  amenities,
  socialMediaLinks,
  onOpen,
}: LocationCardProps) {
  const showRating = rating != null && !Number.isNaN(rating);

  const shellClassName =
    "group overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-lg";

  const inner = (
    <>
      <div className="relative h-48 overflow-hidden">
        <ImageWithFallback
          src={image}
          alt={courtName}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-3 right-3 max-w-[min(55%,11rem)]">
          {cost != null ? (
            <Badge
              className={
                cost === "free"
                  ? "border-transparent bg-green-600 text-white"
                  : "border-transparent bg-blue-600 text-white"
              }
            >
              {cost === "free" ? "Free" : "Paid"}
            </Badge>
          ) : categoryBadge ? (
            <Badge className="border-transparent bg-slate-700 text-white">{categoryBadge}</Badge>
          ) : null}
        </div>
        <div className="absolute top-3 left-3">
          <Badge className="border-transparent bg-white font-medium text-gray-900">{distance}</Badge>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-2">
          <h3 className="mb-1 font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
            {courtName}
          </h3>
          {showRating ? (
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium text-gray-900">{rating}</span>
              </div>
              {reviews != null ? (
                <span className="text-sm text-gray-500">({reviews} reviews)</span>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Directory listing</p>
          )}
        </div>

        <div className="mb-3 flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
          <p className="text-sm text-gray-600">{address}</p>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2 gap-y-2 sm:gap-4">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">{courts} courts</span>
          </div>
          <Badge variant="outline" className="max-w-full truncate text-xs" title={typeLabel}>
            {typeLabel.length > 36 ? `${typeLabel.slice(0, 35)}…` : typeLabel}
          </Badge>
        </div>

        <div className="mb-3 flex items-center gap-2 border-b border-gray-100 pb-3">
          <Clock className="h-4 w-4 shrink-0 text-gray-400" />
          <span className="text-sm text-gray-600">{hours}</span>
        </div>

        {socialMediaLinks && socialMediaLinks.length > 0 ? (
          <div className="mb-3">
            <SocialMediaChips links={socialMediaLinks} />
          </div>
        ) : null}

        {amenities.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            {amenities.map((amenity) => {
              const Icon = amenityIcons[amenity];
              return Icon ? (
                <div
                  key={amenity}
                  className="flex items-center gap-1 rounded bg-gray-50 px-2 py-1 text-xs text-gray-600 capitalize"
                  title={amenity}
                >
                  <Icon className="h-3 w-3" />
                </div>
              ) : null;
            })}
          </div>
        ) : null}
      </div>
    </>
  );

  if (onOpen) {
    return (
      <div
        role="button"
        tabIndex={0}
        aria-label={`Open details for ${courtName}`}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a")) return;
          onOpen();
        }}
        onKeyDown={(e) => {
          if ((e.target as HTMLElement).closest("a")) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen();
          }
        }}
        className={`${shellClassName} block w-full cursor-pointer text-left outline-none ring-blue-500/30 focus-visible:ring-2`}
      >
        {inner}
      </div>
    );
  }

  return <article className={shellClassName}>{inner}</article>;
}
