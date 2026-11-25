"use client";

import ProductAssembly from "./ProductAssembly";

import { useConfiguration } from
    "@/hooks/useConfiguration";

export default function ProductModel({
    product,
    configurationEnabled = true,
}) {
    const { selectedAccessoryModels } =
        useConfiguration(product.id);

    return (
        <ProductAssembly
            product={product}
            accessories={
                configurationEnabled
                    ? selectedAccessoryModels
                    : []
            }
        />
    );
}