import { describe, expect, it } from "vitest";

import { courtListings, mapCourtType } from "./courtListings";

describe("mapCourtType", () => {
  it("treats plain outdoor as outdoor", () => {
    expect(mapCourtType("Outdoor courts")).toEqual({
      type: "outdoor",
      typeLabel: "Outdoor courts",
    });
  });

  it("treats indoor as indoor", () => {
    expect(mapCourtType("Indoor facility")).toEqual({
      type: "indoor",
      typeLabel: "Indoor facility",
    });
  });

  it("treats covered as indoor", () => {
    expect(mapCourtType("Covered")).toEqual({ type: "indoor", typeLabel: "Covered" });
  });

  it("treats outdoor + indoor combo as both", () => {
    expect(mapCourtType("Outdoor and indoor")).toEqual({
      type: "both",
      typeLabel: "Outdoor and indoor",
    });
  });

  it("defaults empty details to outdoor with trimmed label", () => {
    expect(mapCourtType("   ")).toEqual({ type: "outdoor", typeLabel: "Outdoor" });
  });
});

describe("courtListings", () => {
  it("maps directory entries with stable shape", () => {
    expect(courtListings.length).toBeGreaterThan(0);
    const first = courtListings[0]!;
    expect(first.id).toMatch(/\S/);
    expect(first.courtName).toBeTruthy();
    expect(["indoor", "outdoor", "both"]).toContain(first.type);
    expect(first.images.length).toBeGreaterThan(0);
  });
});
