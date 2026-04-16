import Image from "next/image";
import { Header } from "../components/Header";


export default function Home() {
  return (
    <main>
      <Header />
      <h1>Welcome to PickleSpot!</h1>
      <p>Your one-stop destination for all things pickles.</p>
      <Image
        src="/pickle-image.jpg"
        alt="A delicious pickle"
        width={500}
        height={300}
      />
    </main>
  );
}
