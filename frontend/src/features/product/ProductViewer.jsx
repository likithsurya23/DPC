"use client";

import { Suspense } from "react";

import ProductModel from "./ProductModel";

import SceneLoader from
    "@/components/three/SceneLoader";

export default function ProductViewer({
    product,
    configurationEnabled = true,
}) {
    if (!product?.modelURL) {
        return null;
    }

    return (
        <Suspense fallback={<SceneLoader />}>
            <ProductModel
                product={product}
                configurationEnabled={
                    configurationEnabled
                }
            />
        </Suspense>
    );
}