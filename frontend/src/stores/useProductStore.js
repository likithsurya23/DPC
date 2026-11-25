import { create } from "zustand";

export const useProductStore = create((set) => ({
    isCatalogueOpen: false,

    searchQuery: "",

    selectedCategory: "All",

    openCatalogue: () =>
        set({
            isCatalogueOpen: true,
        }),

    closeCatalogue: () =>
        set({
            isCatalogueOpen: false,
        }),

    toggleCatalogue: () =>
        set((state) => ({
            isCatalogueOpen: !state.isCatalogueOpen,
        })),

    setSearchQuery: (value) =>
        set({
            searchQuery: value,
        }),

    setSelectedCategory: (category) =>
        set({
            selectedCategory: category,
        }),

    resetFilters: () =>
        set({
            searchQuery: "",
            selectedCategory: "All",
        }),
}));