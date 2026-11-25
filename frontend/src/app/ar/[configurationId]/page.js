import { Suspense } from "react";
import ARViewer from "@/features/ar/ARViewer";

export const metadata = {
  title: "Augmented Reality",
};

async function ARViewerWithParams({ params }) {
  const { configurationId } = await params;

  return (
    <ARViewer
      configurationId={configurationId}
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