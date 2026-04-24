import raw from "../../lokalpikol_directory.json";

export type CourtType = "indoor" | "outdoor" | "both";

export type CourtListing = {
  id: string;
  courtName: string;
  street: string | null;
  city: string;
  province: string | null;
  fullAddress: string;
  /** Raw hours line from directory (e.g. "6:00 AM - 12:00 PM") */
  openingHours: string;
  courtType: string;
  /** Line used on list cards */
  address: string;
  /** Badge on card, usually city */
  distance: string;
  courts: number;
  type: CourtType;
  typeLabel: string;
  /** Card copy, e.g. "Open …" */
  hours: string;
  image: string;
  images: string[];
  amenities: string[];
  rating?: number;
  reviews?: number;
  cost?: "free" | "paid" | null;
  categoryBadge?: string | null;
  phone?: string | null;
  email?: string | null;
  mapsUrl?: string | null;
  bookCourtUrl?: string | null;
};

type LokalpikolDirectory = {
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
    street?: string | null;
    province?: string | null;
    full_address?: string | null;
    court_type?: string | null;
  }>;
};

const directory = raw as LokalpikolDirectory;

const IMG = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

const COURT_GALLERY_POOL = [
  IMG("photo-1693142517898-2f986215e412"),
  IMG("photo-1626224583764-f87db24fe4b6"),
  IMG("photo-1554068864-3887f870e9a0"),
  IMG("photo-1521412644187-c49fa049e84d"),
  IMG("photo-1595435934249-043344853a57"),
  IMG("photo-1616530940355-351fabd9524b"),
] as const;

function galleryForCourtId(id: string): string[] {
  const pool = [...COURT_GALLERY_POOL];
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) >>> 0;
  }
  const r = h % pool.length;
  const rotated = [...pool.slice(r), ...pool.slice(0, r)];
  return rotated.slice(0, 5);
}

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

  const images = galleryForCourtId(c.id);

  const street = c.street?.trim() || null;
  const city = (c.city || "").trim() || "—";
  const province = c.province?.trim() || null;
  const addr = (c.address || "").trim();
  const loc = (c.location || "").trim();
  const fullAddress =
    c.full_address?.trim() ||
    loc ||
    [street || addr || null, city !== "—" ? city : null, province].filter(Boolean).join(", ") ||
    addr ||
    "—";

  const courtType = (c.court_type || c.court_details || "—").trim();
  const openingHours = (c.hours_display || "—").trim();

  return {
    id: c.id,
    courtName: c.court_name,
    street,
    city,
    province,
    fullAddress,
    openingHours,
    courtType,
    address: (c.address || c.location || "").trim(),
    distance: (c.city || "Philippines").trim(),
    courts: Math.max(1, c.number_of_courts || 1),
    type,
    typeLabel,
    hours: c.hours_display ? `Open ${c.hours_display}` : "Hours not listed",
    image: images[0]!,
    images,
    amenities,
    cost: null,
    categoryBadge: truncate(c.court_details || "Outdoor", 26),
    phone: c.phone,
    email: c.email,
    mapsUrl: c.google_maps_link,
    bookCourtUrl: c.book_court_url,
  };
}

export const courtListings: CourtListing[] = directory.courts.map(listingFromCourt);
