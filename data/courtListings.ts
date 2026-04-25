import raw from "./lokalpikol_directory.json";

export type CourtType = "indoor" | "outdoor" | "both";

export type SocialMediaLink = {
  platform: string;
  url: string;
};

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
  socialMediaLinks: SocialMediaLink[];
};

export type LokalpikolCourt = {
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
  social_media_links?: SocialMediaLink[];
  street?: string | null;
  province?: string | null;
  full_address?: string | null;
  court_type?: string | null;
  logo?: string | null;
  photos?: string[];
};

function normalizeDirectory(raw: unknown): { courts: LokalpikolCourt[] } {
  if (Array.isArray(raw)) {
    return {
      courts: (raw as Array<Record<string, unknown>>).map((row) => {
        const { _directory, ...c } = row;
        void _directory;
        return c as LokalpikolCourt;
      }),
    };
  }
  const o = raw as { courts?: LokalpikolCourt[] };
  return { courts: o.courts ?? [] };
}

const directory = normalizeDirectory(raw);

function galleryForCourtId(id: string): string[] {
  // Deterministic seed from the court id so the same court always shows the same placeholder images
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) >>> 0;
  }
  // Generate 3 distinct seeds
  return [h % 1000, (h * 7) % 1000, (h * 13) % 1000].map(
    (seed) => `https://picsum.photos/seed/${seed}/1200/800`,
  );
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

export function listingFromCourt(c: LokalpikolCourt): CourtListing {
  const { type, typeLabel } = mapCourtType(c.court_details || "Outdoor");
  const amenities: string[] = [];
  if (c.phone) amenities.push("phone");
  if (c.email) amenities.push("email");
  if (c.google_maps_link) amenities.push("maps");
  if (c.book_court_url) amenities.push("book");
  const socialMediaLinks: SocialMediaLink[] = (c.social_media_links ?? [])
    .map((l) => ({
      platform: String(l?.platform ?? "Link").trim() || "Link",
      url: String(l?.url ?? "").trim(),
    }))
    .filter((l) => l.url.length > 0);
  if (socialMediaLinks.length) amenities.push("social");

  const fromPhotos = (c.photos ?? []).filter((u) => {
    if (typeof u !== "string" || !u.trim()) return false;
    try {
      const parsed = new URL(u.trim());
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  });
  const logoUrl = (() => {
    if (typeof c.logo !== "string" || !c.logo.trim()) return null;
    try {
      const p = new URL(c.logo.trim());
      return p.protocol === "http:" || p.protocol === "https:" ? c.logo.trim() : null;
    } catch {
      return null;
    }
  })();
  const images = (() => {
    const photos = fromPhotos.length > 0 ? fromPhotos : galleryForCourtId(c.id);
    if (!logoUrl) return photos;
    // Logo first, then photos (skip logo if it also appears in the photos array)
    const rest = photos.filter((u) => u !== logoUrl);
    return [logoUrl, ...rest];
  })();

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
    image: logoUrl ?? images[0]!,
    images,
    amenities,
    cost: null,
    categoryBadge: truncate(c.court_details || "Outdoor", 26),
    phone: c.phone,
    email: c.email,
    mapsUrl: c.google_maps_link,
    bookCourtUrl: c.book_court_url,
    socialMediaLinks,
  };
}

export const courtListings: CourtListing[] = directory.courts.map(listingFromCourt);
