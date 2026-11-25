import { create } from "zustand";

export const useShowroomStore = create((set) => ({
    mode: "showroom",
    selectedProduct: null,
    isTransitioning: false,
    autoRotate: false,
    cameraCommand: null,
    showHotspots: false,
    selectedHotspot: null,
    assemblySize: [0.59, 0.81, 0.64],

    setAssemblySize: (size) =>
        set((state) => {
            if (!Array.isArray(size) || size.length !== 3) return state;
            const prev = state.assemblySize;
            if (
                Math.abs(prev[0] - size[0]) < 0.005 &&
                Math.abs(prev[1] - size[1]) < 0.005 &&
                Math.abs(prev[2] - size[2]) < 0.005
            ) {
                return state;
            }
            return { assemblySize: size };
        }),

    toggleHotspots: () =>
        set((state) => ({
            showHotspots: !state.showHotspots,
            selectedHotspot: null,
        })),

    selectHotspot: (hotspotId) =>
        set({
            selectedHotspot: hotspotId,
        }),

    closeHotspot: () =>
        set({
            selectedHotspot: null,
        }),

    resetHotspots: () =>
        set({
            showHotspots: false,
            selectedHotspot: null,
        }),

    enterProduct: (productId) =>
        set((state) => {
            if (state.isTransitioning) {
                return state;
            }

            if (
                state.mode === "product" &&
                state.selectedProduct === productId
            ) {
                return state;
            }

            const isEnteringShowroomProduct =
                state.mode === "showroom";

            return {
                mode: "product",
                selectedProduct: productId,
                isTransitioning: isEnteringShowroomProduct,
                autoRotate: false,
                cameraCommand: null,
            };
        }),

    returnToShowroom: () =>
        set((state) => {
            if (
                state.isTransitioning ||
                state.mode === "showroom"
            ) {
                return state;
            }

            return {
                mode: "showroom",
                selectedProduct: null,
                isTransitioning: true,
                autoRotate: false,
                cameraCommand: null,
            };
        }),

    setTransitioning: (value) =>
        set({
            isTransitioning: value,
        }),

    toggleAutoRotate: () =>
        set((state) => ({
            autoRotate: !state.autoRotate,
        })),

    zoomIn: () =>
        set({
            cameraCommand: {
                type: "zoomIn",
                timestamp: Date.now(),
            },
        }),

    zoomOut: () =>
        set({
            cameraCommand: {
                type: "zoomOut",
                timestamp: Date.now(),
            },
        }),

    resetCamera: () =>
        set({
            autoRotate: false,
            cameraCommand: {
                type: "reset",
                timestamp: Date.now(),
            },
        }),
}));
