import { CourtDiscovery } from "@/components/CourtDiscovery";
import { Header } from "@/components/Header";
import { loadCourts } from "@/data/loadCourts";

/** Courts come from Atlas at request time when `MONGODB_URI` is set; avoid baking a build-time snapshot. */
export const dynamic = "force-dynamic";

export default async function Home() {
  const courtListings = await loadCourts();

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <CourtDiscovery courtListings={courtListings} />
    </main>
  );
}
