"use client";

import {
    ArrowLeft,
    ArrowRight,
    ZoomIn,
    ZoomOut,
    RotateCcw,
    Rotate3D,
    MousePointer2,
    LayoutGrid,
    Settings2,
    Scan,
    ClipboardList,
    Smartphone,
    LoaderCircle,
} from "lucide-react";

import ConfigurationSummary from
    "@/features/summary/ConfigurationSummary";

import ConfiguratorPanel from
    "@/features/configurator/ConfiguratorPanel";

import ProductDetails from
    "@/features/product/ProductDetails";

import { useConfigurationStore } from
    "@/stores/useConfigurationStore";

import HotspotDetails from
    "@/features/hotspots/HotspotDetails";

import Header from "@/components/layout/Header";
import Navigation from "@/components/layout/Navigation";

import ProductList from "@/features/catalogue/ProductList";

import { useProducts } from "@/hooks/useProducts";
import { useProductStore } from "@/stores/useProductStore";
import { useShowroomStore } from "@/stores/useShowroomStore";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { prepareAR } from "@/services/arService";

function ControlButton({
    icon: Icon,
    label,
    onClick,
    active = false,
    pressed,
    disabled = false,
}) {
    return (
        <button
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={pressed}
            disabled={disabled}
            onClick={onClick}
            className={`
                flex h-11 w-11
                items-center justify-center
                rounded-xl border shadow-sm
                transition-colors
                disabled:opacity-40
                ${active
                    ? "border-primary bg-primary text-white"
                    : "border-gray-200 bg-white/95 text-gray-700 hover:bg-gray-100"
                }
            `}
        >
            <Icon size={19} strokeWidth={1.8} />
        </button>
    );
}

export default function ShowroomOverlay() {
    const router = useRouter();

    const [isPreparingAR, setIsPreparingAR] = useState(false);

    const [arError, setARError] = useState("");

    const configuredProductId = useConfigurationStore(
        (state) => state.productId
    );

    const selectedAccessories = useConfigurationStore(
        (state) => state.selectedAccessories
    );
    const { products } = useProducts();

    const {
        mode,
        selectedProduct,
        isTransitioning,
        autoRotate,
        returnToShowroom,
        toggleAutoRotate,
        zoomIn,
        zoomOut,
        resetCamera,
        showHotspots,
        selectedHotspot,
        toggleHotspots,
        resetHotspots,
    } = useShowroomStore();

    const isConfiguratorOpen = useConfigurationStore(
        (state) => state.isConfiguratorOpen
    );
    const initializeConfiguration = useConfigurationStore(
        (state) => state.initializeConfiguration
    );
    const closeConfigurator = useConfigurationStore(
        (state) => state.closeConfigurator
    );

    const isSummaryOpen = useConfigurationStore(
        (state) => state.isSummaryOpen
    );

    const openSummary = useConfigurationStore(
        (state) => state.openSummary
    );

    const closeSummary = useConfigurationStore(
        (state) => state.closeSummary
    );

    const {
        isCatalogueOpen,
        toggleCatalogue,
        openCatalogue,
    } = useProductStore();

    const product =
        products.find(
            (item) => item.id === selectedProduct
        ) || products[0];

    async function handleViewInAR() {
        if (!product || isPreparingAR) return;

        setIsPreparingAR(true);
        setARError("");

        try {
            const accessoryIds =
                configuredProductId === product.id
                    ? selectedAccessories
                    : [];

            const configuration = await prepareAR(
                product.id,
                accessoryIds
            );

            if (!configuration?.configurationId) {
                throw new Error("Invalid AR configuration.");
            }

            closeConfigurator();

            closeSummary();
            resetHotspots();

            router.push(
                `/ar/${configuration.configurationId}`
            );
        } catch (error) {
            console.error("AR preparation failed:", error);

            setARError(
                "Unable to prepare AR. Please check the backend connection and try again."
            );
        } finally {
            setIsPreparingAR(false);
        }
    }
    return (
        <div
            className="
                pointer-events-none absolute
                inset-0 z-10
            "
        >
            {/* Common header */}
            <div className="pointer-events-auto">
                <Header>
                    <Navigation />
                </Header>
            </div>

            {/* Catalogue toggle */}
            {mode === "product" && !isTransitioning && (
                <button
                    type="button"
                    onClick={() => {
                        closeConfigurator();
                        closeSummary();
                        resetHotspots();
                        toggleCatalogue();
                    }}
                    aria-expanded={isCatalogueOpen}
                    className={`
                        pointer-events-auto absolute
                        right-5 top-24
                        flex items-center gap-2
                        rounded-full border px-5 py-3
                        text-xs font-medium shadow-sm
                        transition-colors md:right-12
                        ${isCatalogueOpen
                            ? "border-primary bg-primary text-white"
                            : "border-gray-200 bg-white text-gray-700"
                        }
                    `}
                >
                    <LayoutGrid size={17} />
                    <span>Products</span>
                </button>
            )}

            {/* Showroom overview */}
            {mode === "showroom" &&
                !isTransitioning &&
                !isCatalogueOpen && (
                    <section
                        className="
                            absolute left-5 top-24
                            max-w-xs md:left-12
                            md:top-32
                        "
                    >
                        <p
                            className="
                                text-[10px] font-semibold
                                uppercase tracking-[0.25em]
                                text-primary
                            "
                        >
                            SHARP Virtual Experience
                        </p>

                        <h1
                            className="
                                mt-3 text-3xl
                                font-semibold
                                leading-tight
                                text-gray-900
                                md:text-5xl
                            "
                        >
                            Virtual
                            <br />
                            Showroom
                        </h1>

                        <p
                            className="
                                mt-4 text-sm
                                leading-relaxed
                                text-gray-500
                            "
                        >
                            Discover our products
                            through an immersive
                            3D experience.
                        </p>

                        <button
                            type="button"
                            onClick={openCatalogue}
                            className="
                                pointer-events-auto
                                mt-6 flex items-center
                                gap-3 rounded-full
                                bg-primary px-6 py-3
                                text-sm text-white
                                hover:bg-primary-hover
                            "
                        >
                            Browse Products

                            <ArrowRight size={17} />
                        </button>

                    </section>
                )}

            {/* Product information */}
            {mode === "product" &&
                product &&
                !isTransitioning &&
                !isCatalogueOpen && (
                    <section
                        className="
                            pointer-events-none absolute
                            left-5 top-24 z-20
                            flex max-w-xs flex-col
                            items-start gap-5
                            md:left-12 md:top-28
                        "
                    >
                        {/* Back button */}
                        <button
                            type="button"
                            onClick={() => {
                                closeConfigurator();
                                closeSummary();
                                resetHotspots();
                                returnToShowroom();
                            }}
                            className="
                                pointer-events-auto
                                flex items-center gap-2
                                rounded-full border border-gray-200
                                bg-white/95 px-4 py-2
                                text-xs font-medium
                                text-gray-600 shadow-sm
                                hover:bg-gray-100
                            "
                        >
                            <ArrowLeft size={15} />
                            Back to Showroom
                        </button>


                        {/* Product details */}
                        <ProductDetails product={product} />

                        {/* Configuration button */}
                        <button
                            type="button"
                            onClick={() => {
                                resetHotspots();
                                closeSummary();
                                if (isConfiguratorOpen) {
                                    closeConfigurator();
                                } else {
                                    initializeConfiguration(product.id);
                                }
                            }}
                            className="
                                pointer-events-auto
                                flex items-center gap-3
                                rounded-full bg-primary
                                px-6 py-3 text-sm font-medium
                                text-white shadow-sm
                                hover:bg-primary-hover
                            "
                        >
                            <Settings2 size={18} />

                            {isConfiguratorOpen
                                ? "Close Configuration"
                                : "Configure Product"}
                        </button>

                        <button
                            type="button"
                            aria-expanded={isSummaryOpen}
                            onClick={() => {
                                resetHotspots();

                                if (isSummaryOpen) {
                                    closeSummary();
                                } else {
                                    openSummary();
                                }
                            }}
                            className={`
                                pointer-events-auto
                                flex items-center gap-3
                                rounded-full border px-6 py-3
                                text-sm font-medium shadow-sm
                                transition-colors
                                ${isSummaryOpen
                                    ? "border-primary bg-primary text-white"
                                    : "border-gray-200 bg-white text-gray-700 hover:border-primary hover:text-primary"
                                }
                            `}
                        >
                            <ClipboardList size={18} />

                            {isSummaryOpen
                                ? "Close Summary"
                                : "Review Configuration"}
                        </button>

                        {/* Hotspot visibility toggle */}
                        {product.id === "base-tu11" && (
                            <button
                                type="button"
                                aria-pressed={Boolean(showHotspots)}
                                onClick={() => {
                                    closeConfigurator();
                                    closeSummary();
                                    toggleHotspots();
                                }}
                                className={`
                                    pointer-events-auto
                                    flex items-center gap-3
                                    rounded-full border px-6 py-3
                                    text-sm font-medium shadow-sm
                                    transition-colors
                                    ${showHotspots
                                        ? "border-primary bg-primary text-white"
                                        : "border-gray-200 bg-white text-gray-700 hover:border-primary hover:text-primary"
                                    }
                                `}
                            >
                                <Scan size={18} />
                                {showHotspots ? "Hide Hotspots" : "Show Hotspots"}
                            </button>
                        )}

                        {/* View in AR */}
                        {product.id === "base-tu11" && (
                            <button
                                type="button"
                                onClick={handleViewInAR}
                                disabled={isPreparingAR}
                                className="pointer-events-auto flex items-center gap-3 rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
                            >
                                {isPreparingAR ? (
                                    <LoaderCircle
                                        size={18}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <Smartphone size={18} />
                                )}

                                {isPreparingAR
                                    ? "Preparing AR..."
                                    : "View in AR"}
                            </button>
                        )}

                        {arError && (
                            <p
                                role="alert"
                                className="max-w-xs text-xs text-red-600"
                            >
                                {arError}
                            </p>
                        )}
                    </section>
                )}


            {/* Camera controls */}
            {mode === "product" &&
                product &&
                !isTransitioning &&
                !isConfiguratorOpen &&
                !isCatalogueOpen &&
                !selectedHotspot &&
                !isSummaryOpen && (
                    <div
                        className="
                            pointer-events-auto absolute
                            right-5 top-1/2 flex
                            -translate-y-1/2
                            flex-col gap-2
                            md:right-12
                        "
                    >
                        <ControlButton
                            icon={ZoomIn}
                            label="Zoom In"
                            onClick={zoomIn}
                        />

                        <ControlButton
                            icon={ZoomOut}
                            label="Zoom Out"
                            onClick={zoomOut}
                        />

                        <ControlButton
                            icon={Rotate3D}
                            label="Auto Rotate"
                            onClick={toggleAutoRotate}
                            active={autoRotate}
                            pressed={autoRotate}
                        />

                        <ControlButton
                            icon={RotateCcw}
                            label="Reset Camera"
                            onClick={resetCamera}
                        />
                    </div>
                )}

            {/* Bottom instruction */}
            {!isCatalogueOpen && (
                <div
                    role={isTransitioning ? "status" : undefined}
                    className="
                        absolute bottom-8 left-1/2
                        flex -translate-x-1/2
                        items-center gap-2
                        whitespace-nowrap
                        rounded-full bg-white/90
                        px-5 py-3 text-xs
                        text-gray-500 shadow-sm
                    "
                >
                    {isTransitioning ? (
                        mode === "product"
                            ? "Moving to product..."
                            : "Returning to showroom..."
                    ) : mode === "product" ? (
                        <>
                            <MousePointer2 size={15} />

                            <span className="hidden md:inline">
                                Drag to rotate · Scroll to zoom
                            </span>

                            <span className="md:hidden">
                                Drag to rotate · Pinch to zoom
                            </span>
                        </>
                    ) : (
                        "Select a product to explore"
                    )}
                </div>
            )}

            {/* Floating catalogue panel */}
            <ProductList />

            {mode === "product" &&
                product &&
                !isTransitioning &&
                !isCatalogueOpen &&
                isConfiguratorOpen &&
                !isSummaryOpen && (
                    <ConfiguratorPanel product={product} />
                )}

            {/* Configuration summary panel */}
            {mode === "product" &&
                product &&
                isSummaryOpen &&
                !isTransitioning &&
                !isCatalogueOpen &&
                !isConfiguratorOpen && (
                    <ConfigurationSummary
                        key={product.id}
                        product={product}
                        onViewInAR={handleViewInAR}
                        isPreparingAR={isPreparingAR}
                    />
                )}

            {/* Hotspot details panel */}
            {mode === "product" &&
                product?.id === "base-tu11" &&
                showHotspots &&
                selectedHotspot &&
                !isTransitioning &&
                !isCatalogueOpen &&
                !isConfiguratorOpen &&
                !isSummaryOpen && (
                    <HotspotDetails />
                )}
        </div>
    );
}