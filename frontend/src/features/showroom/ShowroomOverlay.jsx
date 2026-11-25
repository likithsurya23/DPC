"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
    ArrowLeft,
    ArrowRight,
    ZoomIn,
    ZoomOut,
    RotateCcw,
    Rotate3D,
    MousePointer2,
    Settings,
} from "lucide-react";

import ConfigurationSummary from "@/features/summary/ConfigurationSummary";
import ConfiguratorPanel from "@/features/configurator/ConfiguratorPanel";
import HotspotDetails from "@/features/hotspots/HotspotDetails";
import ProductList from "@/features/catalogue/ProductList";
import Navigation from "@/components/layout/Navigation";
import BrandLogo from "@/components/layout/BrandLogo";

import { APP_CONFIG } from "@/config/appConfig";
import { useConfigurationStore } from "@/stores/useConfigurationStore";
import { useProducts } from "@/hooks/useProducts";
import { useProductStore } from "@/stores/useProductStore";
import { useShowroomStore } from "@/stores/useShowroomStore";
import { prepareAR } from "@/services/arService";

gsap.registerPlugin(useGSAP);

function ProductControlButton({
    icon: Icon,
    label,
    onClick,
    active = false,
    pressed,
}) {
    return (
        <button
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={pressed}
            onClick={onClick}
            className={`
                flex min-w-[66px] flex-col items-center justify-center gap-1
                rounded-xl border px-3 py-2.5
                shadow-[0_6px_18px_rgba(15,23,42,0.08)]
                transition-colors
                ${active
                    ? "border-[#e01920] bg-[#e01920] text-white"
                    : "border-gray-100 bg-white/95 text-gray-700 hover:bg-gray-50"
                }
            `}
        >
            <Icon size={18} strokeWidth={1.8} />
            <span className="text-[11px] font-medium leading-none">
                {label}
            </span>
        </button>
    );
}

export default function ShowroomOverlay() {
    const router = useRouter();
    const overlayRef = useRef(null);

    const [isPreparingAR, setIsPreparingAR] = useState(false);

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
        enterProduct,
        returnToShowroom,
        toggleAutoRotate,
        zoomIn,
        zoomOut,
        resetCamera,
        showHotspots,
        selectedHotspot,
        resetHotspots,
    } = useShowroomStore();

    const initializeConfiguration = useConfigurationStore(
        (state) => state.initializeConfiguration
    );
    const closeConfigurator = useConfigurationStore(
        (state) => state.closeConfigurator
    );

    const isSummaryOpen = useConfigurationStore(
        (state) => state.isSummaryOpen
    );
    const closeSummary = useConfigurationStore(
        (state) => state.closeSummary
    );

    const { isCatalogueOpen } = useProductStore();

    const product =
        products.find((item) => item.id === selectedProduct) || products[0];

    // GSAP entrance animations for showroom and product configuration views
    useGSAP(
        () => {
            const reducedMotion =
                typeof window !== "undefined" &&
                window.matchMedia("(prefers-reduced-motion: reduce)").matches;

            if (reducedMotion) {
                gsap.set(
                    [
                        "[data-showroom-anim='header']",
                        "[data-showroom-anim='eyebrow']",
                        "[data-showroom-anim='line']",
                        "[data-showroom-anim='heading']",
                        "[data-showroom-anim='subtitle']",
                        "[data-showroom-anim='cta']",
                        "[data-product-anim='back']",
                        "[data-product-anim='title']",
                        "[data-product-anim='controls']",
                        "[data-review-anim='eyebrow']",
                        "[data-review-anim='line']",
                    ],
                    { autoAlpha: 1, y: 0, scaleX: 1, scale: 1 }
                );
                return;
            }

            const tl = gsap.timeline();

            tl.fromTo(
                "[data-showroom-anim='header']",
                { autoAlpha: 0, y: -12 },
                { autoAlpha: 1, y: 0, duration: 0.55, ease: "power3.out" },
                0.08
            );

            if (mode === "showroom") {
                tl.fromTo(
                    "[data-showroom-anim='eyebrow']",
                    { autoAlpha: 0, y: 12 },
                    { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out" },
                    0.22
                )
                    .fromTo(
                        "[data-showroom-anim='line']",
                        { scaleX: 0, transformOrigin: "left center" },
                        { scaleX: 1, duration: 0.45, ease: "power3.out" },
                        0.32
                    )
                    .fromTo(
                        "[data-showroom-anim='heading']",
                        { autoAlpha: 0, y: 20 },
                        { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" },
                        0.38
                    )
                    .fromTo(
                        "[data-showroom-anim='subtitle']",
                        { autoAlpha: 0, y: 14 },
                        { autoAlpha: 1, y: 0, duration: 0.55, ease: "power2.out" },
                        0.52
                    )
                    .fromTo(
                        "[data-showroom-anim='cta']",
                        { autoAlpha: 0, y: 14, scale: 0.96 },
                        { autoAlpha: 1, y: 0, scale: 1, duration: 0.55, ease: "power3.out" },
                        0.66
                    );
            } else if (mode === "product" && !isTransitioning && isSummaryOpen) {
                tl.fromTo(
                    "[data-product-anim='back']",
                    { autoAlpha: 0, x: -12 },
                    { autoAlpha: 1, x: 0, duration: 0.4, ease: "power3.out" },
                    0.05
                )
                    .fromTo(
                        "[data-review-anim='eyebrow']",
                        { autoAlpha: 0, y: 10 },
                        { autoAlpha: 1, y: 0, duration: 0.4, ease: "power3.out" },
                        0.1
                    )
                    .fromTo(
                        "[data-review-anim='line']",
                        { scaleX: 0, transformOrigin: "left center" },
                        { scaleX: 1, duration: 0.4, ease: "power3.out" },
                        0.16
                    );
            } else if (mode === "product" && !isTransitioning) {
                tl.fromTo(
                    "[data-product-anim='back']",
                    { autoAlpha: 0, x: -12 },
                    { autoAlpha: 1, x: 0, duration: 0.4, ease: "power3.out" },
                    0.05
                )
                    .fromTo(
                        "[data-product-anim='title']",
                        { autoAlpha: 0, y: -10 },
                        { autoAlpha: 1, y: 0, duration: 0.45, ease: "power3.out" },
                        0.1
                    )
                    .fromTo(
                        "[data-product-anim='controls']",
                        { autoAlpha: 0, y: 14 },
                        { autoAlpha: 1, y: 0, duration: 0.45, ease: "power3.out" },
                        0.15
                    );
            }

            return () => {
                tl.kill();
            };
        },
        { scope: overlayRef, dependencies: [mode, isTransitioning, isSummaryOpen] }
    );

    const handleConfigurePrinter = useCallback(() => {
        if (!product || isTransitioning) return;

        resetHotspots();
        closeSummary();
        initializeConfiguration(product.id);
        enterProduct(product.id);
    }, [
        closeSummary,
        enterProduct,
        initializeConfiguration,
        isTransitioning,
        product,
        resetHotspots,
    ]);

    const handleCtaEnter = useCallback(() => {
        if (!overlayRef.current) return;
        const btn = overlayRef.current.querySelector("[data-showroom-anim='cta']");
        const arrow = overlayRef.current.querySelector("[data-showroom-anim='cta-arrow']");

        if (btn) {
            gsap.to(btn, {
                scale: 1.035,
                duration: 0.25,
                ease: "power2.out",
                overwrite: "auto",
            });
        }
        if (arrow) {
            gsap.to(arrow, {
                x: 4,
                duration: 0.25,
                ease: "power2.out",
                overwrite: "auto",
            });
        }
    }, []);

    const handleCtaLeave = useCallback(() => {
        if (!overlayRef.current) return;
        const btn = overlayRef.current.querySelector("[data-showroom-anim='cta']");
        const arrow = overlayRef.current.querySelector("[data-showroom-anim='cta-arrow']");

        if (btn) {
            gsap.to(btn, {
                scale: 1,
                duration: 0.25,
                ease: "power2.out",
                overwrite: "auto",
            });
        }
        if (arrow) {
            gsap.to(arrow, {
                x: 0,
                duration: 0.25,
                ease: "power2.out",
                overwrite: "auto",
            });
        }
    }, []);

    async function handleViewInAR() {
        if (!product || isPreparingAR) return;

        setIsPreparingAR(true);

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

            router.push(`/ar/${configuration.configurationId}`);
        } catch (error) {
            console.error("AR preparation failed:", error);
        } finally {
            setIsPreparingAR(false);
        }
    }

    return (
        <div
            ref={overlayRef}
            className="pointer-events-none absolute inset-0 z-10"
        >
            {/* Common showroom header */}
            <header
                data-showroom-anim="header"
                className="
                    pointer-events-auto absolute inset-x-0 top-0 z-30
                    flex items-center justify-between gap-4
                    px-5 py-5 md:px-12 md:py-6
                "
            >
                <Link
                    href={APP_CONFIG.routes.home}
                    className="
                        select-none text-base font-bold
                        tracking-[-0.03em] text-[#24282e]
                        sm:text-lg md:text-[1.35rem]
                    "
                >
                    <BrandLogo />
                </Link>

                <Navigation />
            </header>

            {/* Showroom mode overview */}
            {mode === "showroom" &&
                !isTransitioning &&
                !isCatalogueOpen && (
                    <section
                        className="
                            absolute left-5 top-24 z-20
                            max-w-[310px]
                            md:left-12 md:top-1/2 md:max-w-[350px] md:-translate-y-[52%]
                            lg:left-16
                        "
                    >
                        <div className="inline-block">
                            <p
                                data-showroom-anim="eyebrow"
                                className="
                                    -mr-[0.18em] text-[11px] font-bold uppercase
                                    tracking-[0.18em] text-[#d71920]
                                "
                            >
                                VIRTUAL EXPERIENCE
                            </p>

                            <div
                                data-showroom-anim="line"
                                aria-hidden="true"
                                className="mt-2 h-[2px] w-full bg-[#d71920]"
                            />
                        </div>

                        <h1
                            data-showroom-anim="heading"
                            className="
                                mt-4 text-4xl font-extrabold
                                leading-[1.04] tracking-[-0.03em]
                                text-[#111c2d]
                                sm:text-[2.95rem] lg:text-[3.65rem]
                            "
                        >
                            Virtual
                            <br />
                            Showroom
                        </h1>

                        <p
                            data-showroom-anim="subtitle"
                            className="
                                mt-4 max-w-[300px] text-sm
                                leading-[1.65] text-[#4b5563]
                                md:text-[15.5px]
                            "
                        >
                            Explore and configure the base model with available accessories.
                        </p>

                        <button
                            data-showroom-anim="cta"
                            type="button"
                            disabled={!product || isTransitioning}
                            onClick={handleConfigurePrinter}
                            onMouseEnter={handleCtaEnter}
                            onMouseLeave={handleCtaLeave}
                            style={{
                                background:
                                    "linear-gradient(180deg, #e61e25 0%, #c61017 100%)",
                            }}
                            className="
                                pointer-events-auto mt-7
                                inline-flex items-center gap-3
                                rounded-full px-7 py-3.5 text-sm font-medium
                                text-white
                                shadow-[0_12px_28px_-6px_rgba(224,25,32,0.52)]
                                transition-shadow hover:shadow-[0_16px_32px_-6px_rgba(224,25,32,0.62)]
                                disabled:opacity-50
                                md:mt-8
                            "
                        >
                            <Settings size={17} strokeWidth={1.9} />
                            <span>Configure Printer</span>
                            <span
                                data-showroom-anim="cta-arrow"
                                aria-hidden="true"
                                className="inline-flex items-center"
                            >
                                <ArrowRight size={17} strokeWidth={2} />
                            </span>
                        </button>
                    </section>
                )}

            {/* Product Configuration view matching wireframe */}
            {mode === "product" &&
                product &&
                !isTransitioning &&
                !isCatalogueOpen && (
                    <>
                        {/* Back to Showroom pill */}
                        <button
                            data-product-anim="back"
                            type="button"
                            onClick={() => {
                                closeConfigurator();
                                closeSummary();
                                resetHotspots();
                                returnToShowroom();
                            }}
                            className="
                                pointer-events-auto absolute
                                left-5 top-20 z-20
                                flex items-center gap-2
                                rounded-full border border-gray-100
                                bg-white/95 px-4 py-2
                                text-xs font-medium text-gray-700
                                shadow-[0_6px_18px_rgba(15,23,42,0.08)]
                                transition-colors hover:bg-gray-50
                                md:left-12
                            "
                        >
                            <ArrowLeft size={14} strokeWidth={2} />
                            <span>Back to Showroom</span>
                        </button>

                        {/* Review Configuration left eyebrow */}
                        {isSummaryOpen && (
                            <section
                                className="
                                    pointer-events-none absolute
                                    left-5 top-32 z-20
                                    md:left-12 md:top-32
                                "
                            >
                                <div className="inline-block">
                                    <p
                                        data-review-anim="eyebrow"
                                        className="
                                            -mr-[0.14em] text-[11px] font-bold uppercase
                                            tracking-[0.14em] text-[#d71920]
                                        "
                                    >
                                        REVIEW CONFIGURATION
                                    </p>

                                    <div
                                        data-review-anim="line"
                                        aria-hidden="true"
                                        className="mt-1.5 h-[2px] w-full bg-[#d71920]"
                                    />
                                </div>
                            </section>
                        )}

                        {/* Centered left-stage title & bottom controls */}
                        {!isSummaryOpen && (
                            <div
                                className="
                                    pointer-events-none absolute inset-y-0 left-0 z-20
                                    flex w-full flex-col items-center justify-between
                                    pb-[47dvh] pt-28
                                    md:w-[calc(100%-430px)] md:pb-6 md:pt-[15vh]
                                    lg:w-[calc(100%-480px)]
                                "
                            >
                                <h1
                                    data-product-anim="title"
                                    className="
                                        text-center text-lg font-bold
                                        tracking-tight text-[#152336]
                                        md:text-[1.45rem]
                                    "
                                >
                                    {product.name}
                                </h1>

                                <div
                                    data-product-anim="controls"
                                    className="
                                        pointer-events-auto flex
                                        flex-col items-center gap-2 md:gap-3
                                    "
                                >
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <ProductControlButton
                                            icon={Rotate3D}
                                            label="Rotate"
                                            onClick={toggleAutoRotate}
                                            active={autoRotate}
                                            pressed={autoRotate}
                                        />
                                        <ProductControlButton
                                            icon={ZoomIn}
                                            label="Zoom In"
                                            onClick={zoomIn}
                                        />
                                        <ProductControlButton
                                            icon={ZoomOut}
                                            label="Zoom Out"
                                            onClick={zoomOut}
                                        />
                                        <ProductControlButton
                                            icon={RotateCcw}
                                            label="Reset"
                                            onClick={resetCamera}
                                        />
                                    </div>

                                    <div
                                        className="
                                            hidden items-center gap-2
                                            rounded-full border border-gray-100
                                            bg-white/95 px-5 py-2
                                            text-xs text-gray-600
                                            shadow-[0_6px_18px_rgba(15,23,42,0.07)]
                                            md:flex
                                        "
                                    >
                                        <MousePointer2 size={14} />
                                        <span>Drag to rotate · Scroll to zoom</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

            {/* Transition status pill */}
            {isTransitioning && (
                <div
                    role="status"
                    className="
                        absolute bottom-8 left-1/2
                        flex -translate-x-1/2
                        items-center gap-2
                        whitespace-nowrap
                        rounded-full bg-white/95
                        px-5 py-3 text-xs
                        text-gray-600 shadow-sm
                    "
                >
                    {mode === "product"
                        ? "Moving to product..."
                        : "Returning to showroom..."}
                </div>
            )}

            {/* Floating catalogue panel */}
            <ProductList />

            {/* Right-side Configure Printer panel */}
            {mode === "product" &&
                product &&
                !isTransitioning &&
                !isCatalogueOpen &&
                !isSummaryOpen && (
                    <ConfiguratorPanel product={product} />
                )}

            {/* Configuration summary panel */}
            {mode === "product" &&
                product &&
                isSummaryOpen &&
                !isTransitioning &&
                !isCatalogueOpen && (
                    <ConfigurationSummary
                        key={product.id}
                        product={product}
                        onViewInAR={handleViewInAR}
                        isPreparingAR={isPreparingAR}
                    />
                )}

            {/* Hotspot details panel */}
            {mode === "product" &&
                (product?.supportsHotspots ||
                    product?.id === APP_CONFIG.defaultProductId) &&
                showHotspots &&
                selectedHotspot &&
                !isTransitioning &&
                !isCatalogueOpen &&
                !isSummaryOpen && (
                    <HotspotDetails />
                )}
        </div>
    );
}
