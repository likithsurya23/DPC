import { Montserrat } from "next/font/google";

import Showroom from "@/features/showroom/Showroom";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

export const metadata = {
  title: "Virtual Showroom",
};

export default function ShowroomPage() {
  return <Showroom fontClassName={montserrat.className} />;
}
