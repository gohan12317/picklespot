import raw from "../../lokalpikol_directory.json";

export type CourtType = "indoor" | "outdoor" | "both";

export type CourtListing = {
  id: string;
  name: string;
  address: string;
  /** Shown on the image (left badge), e.g. city */
  distance: string;
  courts: number;
  type: CourtType;
  /** Full directory court type string for the outline chip */
  typeLabel: string;
  hours: string;
  image: string;
  /** phone | email | maps | book — icons on the card */
  amenities: string[];
  rating?: number;
  reviews?: number;
  cost?: "free" | "paid" | null;
  /** Short label on the image (right badge) when `cost` is not set */
  categoryBadge?: string | null;
};

type LokalpikolDirectory = {
  source: string;
  scraped_at: string;
  expected_total_from_directory: number;
  total_listings: number;
  courts: Array<{
    id: string;
    court_name: string;
    location: string;
    city: string;
    address: string;
    google_maps_link: string | null;
    hours_display: string;
    court_details: string;
    number_of_courts: number;
    email: string | null;
    phone: string | null;
    book_court_url: string | null;
  }>;
};

const directory = raw as LokalpikolDirectory;

const DEFAULT_COURT_IMAGE =
  "https://images.unsplash.com/photo-1693142517898-2f986215e412?auto=format&fit=crop&w=1080&q=80";

export const directoryMeta = {
  source: directory.source,
  scrapedAt: directory.scraped_at,
  totalListings: directory.total_listings,
} as const;

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
}

export function mapCourtType(details: string): { type: CourtType; typeLabel: string } {
  const label = details?.trim() || "Outdoor";
  const d = label.toLowerCase();
  const outdoor = d.includes("outdoor");
  const covered = d.includes("covered");
  const indoor = d.includes("indoor");
  if ((outdoor && covered) || (outdoor && indoor) || d.includes("covered and outdoor")) {
    return { type: "both", typeLabel: label };
  }
  if (outdoor) return { type: "outdoor", typeLabel: label };
  if (covered || indoor) return { type: "indoor", typeLabel: label };
  return { type: "outdoor", typeLabel: label };
}

function listingFromCourt(
  c: LokalpikolDirectory["courts"][number],
): CourtListing {
  const { type, typeLabel } = mapCourtType(c.court_details || "Outdoor");
  const amenities: string[] = [];
  if (c.phone) amenities.push("phone");
  if (c.email) amenities.push("email");
  if (c.google_maps_link) amenities.push("maps");
  if (c.book_court_url) amenities.push("book");

  return {
    id: c.id,
    name: c.court_name,
    address: (c.address || c.location || "").trim(),
    distance: (c.city || "Philippines").trim(),
    courts: Math.max(1, c.number_of_courts || 1),
    type,
    typeLabel,
    hours: c.hours_display ? `Open ${c.hours_display}` : "Hours not listed",
    image: DEFAULT_COURT_IMAGE,
    amenities,
    cost: null,
    categoryBadge: truncate(c.court_details || "Outdoor", 26),
  };
}

export const courtListings: CourtListing[] = directory.courts.map(listingFromCourt);
