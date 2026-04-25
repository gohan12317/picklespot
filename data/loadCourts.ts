import "server-only";

import type { Document } from "mongodb";

import { getCourtsCollection } from "@/lib/mongodb";

import {
  courtListings as courtListingsFromJson,
  listingFromCourt,
  type CourtListing,
  type LokalpikolCourt,
} from "./courtListings";

function atlasDocumentToCourt(doc: Document): LokalpikolCourt {
  const { _id, ...rest } = doc;
  const row = { ...rest } as Partial<LokalpikolCourt>;
  if (typeof row.id !== "string" || !row.id.trim()) {
    row.id = _id != null ? String(_id) : "";
  }
  return row as LokalpikolCourt;
}

/** Only fields the UI needs; avoids shipping large or accidental extra fields from Atlas. */
const COURT_PROJECTION = {
  _id: 1,
  id: 1,
  court_name: 1,
  location: 1,
  city: 1,
  address: 1,
  google_maps_link: 1,
  hours_display: 1,
  court_details: 1,
  number_of_courts: 1,
  email: 1,
  phone: 1,
  book_court_url: 1,
  social_media_links: 1,
  street: 1,
  province: 1,
  full_address: 1,
  court_type: 1,
  logo: 1,
  photos: 1,
} as const;

async function loadCourtsFromAtlas(): Promise<CourtListing[]> {
  const coll = await getCourtsCollection();
  const docs = await coll
    .find({}, { projection: COURT_PROJECTION })
    .sort({ court_name: 1 })
    .toArray();
  if (process.env.NODE_ENV === "development") {
    const db = process.env.MONGODB_DB?.trim() || "picklespot";
    const name = process.env.MONGODB_COLLECTION?.trim() || "courts";
    console.info(`[loadCourts] Connected to Atlas — ${db}.${name} (${docs.length} documents)`);
  }
  return docs.map((d) => listingFromCourt(atlasDocumentToCourt(d)));
}

/**
 * Server-only. Uses Atlas when `MONGODB_URI` is set; otherwise bundled JSON.
 */
export async function loadCourts(): Promise<CourtListing[]> {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    if (process.env.NODE_ENV === "development") {
      console.info("[loadCourts] MONGODB_URI unset — using bundled lokalpikol_directory.json");
    }
    return courtListingsFromJson;
  }
  try {
    return await loadCourtsFromAtlas();
  } catch (err) {
    console.error("[loadCourts] Atlas fetch failed, using local JSON.", err);
    return courtListingsFromJson;
  }
}
