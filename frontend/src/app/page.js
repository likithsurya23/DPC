import { Montserrat } from "next/font/google";

import LandingPage from "@/features/landing/LandingPage";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  display: "swap",
});

export default function HomePage() {
  return <LandingPage fontClassName={montserrat.className} />;
}
