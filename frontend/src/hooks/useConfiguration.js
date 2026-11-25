"use client";

import { useMemo } from "react";

import { ACCESSORIES } from "@/config/showroomConfig";
import { useProducts } from "@/hooks/useProducts";
import { useConfigurationStore } from "@/stores/useConfigurationStore";

export function useConfiguration(productId) {
    const configuration = useConfigurationStore();
    const { products } = useProducts();

    const availableAccessories = useMemo(() => {
        const activeProduct = products.find((item) => item.id === productId);
        if (activeProduct?.accessories?.length > 0) {
            return activeProduct.accessories;
        }
        return productId ? ACCESSORIES : [];
    }, [productId, products]);

    const selectedAccessoryIds =
        configuration.productId === productId
            ? configuration.selectedAccessories
            : [];

    const selectedAccessoryModels = availableAccessories.filter((accessory) =>
        selectedAccessoryIds.includes(accessory.id)
    );

    return {
        ...configuration,
        availableAccessories,
        selectedAccessoryIds,
        selectedAccessoryModels,
        accessoryCount: selectedAccessoryModels.length,
    };
}
