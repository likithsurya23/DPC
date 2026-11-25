import { create } from "zustand";
import { ACCESSORIES } from "@/config/showroomConfig";

export const useConfigurationStore = create((set) => ({
    productId: null,

    isConfiguratorOpen: false,

    isSummaryOpen: false,

    selectedAccessories: [],

    // Initialize configuration
    initializeConfiguration: (productId) =>
        set((state) => {
            if (state.productId === productId) {
                return {
                    isConfiguratorOpen: true,
                    isSummaryOpen: false,
                };
            }

            return {
                productId,
                selectedAccessories: [],
                isConfiguratorOpen: true,
                isSummaryOpen: false,
            };
        }),

    // Close configurator
    closeConfigurator: () =>
        set({
            isConfiguratorOpen: false,
        }),

    // Open configuration summary
    openSummary: () =>
        set({
            isConfiguratorOpen: false,
            isSummaryOpen: true,
        }),

    // Close configuration summary
    closeSummary: () =>
        set({
            isSummaryOpen: false,
        }),

    // Return to configuration editing
    editConfiguration: () =>
        set({
            isSummaryOpen: false,
            isConfiguratorOpen: true,
        }),

    // Select or deselect accessories
    toggleAccessory: (accessoryId) =>
        set((state) => {
            const accessory = ACCESSORIES.find(
                (item) => item.id === accessoryId
            );

            if (!accessory) return state;

            if (
                state.selectedAccessories.includes(
                    accessoryId
                )
            ) {
                return {
                    selectedAccessories:
                        state.selectedAccessories.filter(
                            (id) => id !== accessoryId
                        ),
                };
            }

            let selectedAccessories = [
                ...state.selectedAccessories,
            ];

            // Exclusive accessory selection
            if (accessory.exclusiveGroup) {
                selectedAccessories =
                    selectedAccessories.filter((id) => {
                        const item = ACCESSORIES.find(
                            (part) => part.id === id
                        );

                        return (
                            item?.exclusiveGroup !==
                            accessory.exclusiveGroup
                        );
                    });
            }

            return {
                selectedAccessories: [
                    ...selectedAccessories,
                    accessoryId,
                ],
            };
        }),

    // Reset accessories
    resetConfiguration: () =>
        set({
            selectedAccessories: [],
        }),

    // Clear complete configuration
    clearConfiguration: () =>
        set({
            productId: null,
            selectedAccessories: [],
            isConfiguratorOpen: false,
            isSummaryOpen: false,
        }),
}));