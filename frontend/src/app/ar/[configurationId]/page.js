import { Suspense } from "react";
import { Montserrat } from "next/font/google";

import ARViewer from "@/features/ar/ARViewer";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

export const metadata = {
  title: "Augmented Reality",
};

async function ARViewerWithParams({ params }) {
  const { configurationId } = await params;

  return (
    <ARViewer
      configurationId={configurationId}
      fontClassName={montserrat.className}
    />
  );
}

export default function ARPage({ params }) {
  return (
    <Suspense fallback={null}>
      <ARViewerWithParams params={params} />
    </Suspense>
  );
}
