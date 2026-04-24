import { CourtDiscovery } from "@/components/CourtDiscovery";
import { Header } from "@/components/Header";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <CourtDiscovery />
    </main>
  );
}
