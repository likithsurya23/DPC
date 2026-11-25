"use client";

import { ACCESSORIES } from "@/config/showroomConfig";

import { useConfigurationStore } from
    "@/stores/useConfigurationStore";

export function useConfiguration(productId) {
    const configuration = useConfigurationStore();

    // Only the TU11 accessories are currently available.
    const availableAccessories =
        productId === "base-tu11"
            ? ACCESSORIES
            : [];

    const selectedAccessoryIds =
        configuration.productId === productId
            ? configuration.selectedAccessories
            : [];

    const selectedAccessoryModels =
        availableAccessories.filter((accessory) =>
            selectedAccessoryIds.includes(accessory.id)
        );

    return {
        ...configuration,

        availableAccessories,

        selectedAccessoryIds,

        selectedAccessoryModels,

        accessoryCount:
            selectedAccessoryModels.length,
    };
}