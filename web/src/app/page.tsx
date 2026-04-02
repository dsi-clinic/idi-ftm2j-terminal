import { Navbar } from "../components/navbar";
import { Hero } from "../components/hero";
import { Footer } from "../components/footer";

export default function Landing() {
  return (
    <div
      style={{ background: "#000", minHeight: "100vh", position: "relative" }}
    >
      <Navbar />
      <Hero />
      <Footer />
    </div>
  );
}
