"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ArrowLeft, LoaderCircle, Smartphone } from "lucide-react";

import Navigation from "@/components/layout/Navigation";
import BrandLogo from "@/components/layout/BrandLogo";
import ModelViewer from "./ModelViewer";
import ARQRCode from "./ARQRCode";

import { APP_CONFIG } from "@/config/appConfig";
import { getARPageURL } from "@/config/apiConfig";
import { getARConfiguration } from "@/services/arService";
import { useARSupport } from "@/hooks/useARSupport";
import { useShowroomStore } from "@/stores/useShowroomStore";
import { useConfigurationStore } from "@/stores/useConfigurationStore";

gsap.registerPlugin(useGSAP);

const DynamicARShowroomCanvas = dynamic(
    () => import("./ARShowroomCanvas"),
    { ssr: false }
);

export default function ARViewer({ configurationId, fontClassName = "" }) {
    const router = useRouter();
    const containerRef = useRef(null);
    const device = useARSupport();

    const [previewReady, setPreviewReady] = useState(false);
    const [previewError, setPreviewError] = useState(false);

    const handlePreviewLoaded = useCallback(() => {
        setPreviewReady(true);
    }, []);

    const handlePreviewError = useCallback(() => {
        setPreviewError(true);
    }, []);

    const {
        data: configuration,
        isPending,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ["ar-configuration", configurationId],
        queryFn: ({ signal }) => getARConfiguration(configurationId, { signal }),
        retry: 1,
    });

    const pageURL = getARPageURL(configurationId);

    const handleBackToReview = useCallback(() => {
        const targetProductId =
            configuration?.productId || APP_CONFIG.defaultProductId;
        const currentConfigState = useConfigurationStore.getState();

        useShowroomStore.setState({
            mode: "product",
            selectedProduct: targetProductId,
            isTransitioning: false,
            autoRotate: false,
            cameraCommand: null,
        });

        useConfigurationStore.setState({
            productId: currentConfigState.productId || targetProductId,
            isConfiguratorOpen: false,
            isSummaryOpen: true,
        });

        router.push(APP_CONFIG.routes.showroom);
    }, [configuration?.productId, router]);

    useGSAP(
        () => {
            const reducedMotion =
                typeof window !== "undefined" &&
                window.matchMedia("(prefers-reduced-motion: reduce)").matches;

            if (reducedMotion) {
                gsap.set(
                    [
                        "[data-ar-anim='header']",
                        "[data-ar-anim='back']",
                        "[data-ar-anim='eyebrow']",
                        "[data-ar-anim='title']",
                        "[data-ar-anim='subtitle']",
                        "[data-ar-anim='qr']",
                        "[data-ar-anim='notice']",
                    ],
                    { autoAlpha: 1, x: 0, y: 0 }
                );
                return;
            }

            const tl = gsap.timeline();

            tl.fromTo(
                "[data-ar-anim='header']",
                { autoAlpha: 0, y: -12 },
                { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out" },
                0.05
            )
                .fromTo(
                    "[data-ar-anim='back']",
                    { autoAlpha: 0, x: -12 },
                    { autoAlpha: 1, x: 0, duration: 0.4, ease: "power3.out" },
                    0.12
                )
                .fromTo(
                    "[data-ar-anim='eyebrow']",
                    { autoAlpha: 0, y: 10 },
                    { autoAlpha: 1, y: 0, duration: 0.4, ease: "power3.out" },
                    0.18
                )
                .fromTo(
                    "[data-ar-anim='title']",
                    { autoAlpha: 0, y: 14 },
                    { autoAlpha: 1, y: 0, duration: 0.45, ease: "power3.out" },
                    0.24
                )
                .fromTo(
                    "[data-ar-anim='subtitle']",
                    { autoAlpha: 0, y: 10 },
                    { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" },
                    0.32
                );

            const qr = containerRef.current?.querySelector("[data-ar-anim='qr']");
            if (qr) {
                tl.fromTo(
                    qr,
                    { autoAlpha: 0, x: 24 },
                    { autoAlpha: 1, x: 0, duration: 0.5, ease: "power3.out" },
                    0.22
                );
            }

            const notice = containerRef.current?.querySelector("[data-ar-anim='notice']");
            if (notice) {
                tl.fromTo(
                    notice,
                    { autoAlpha: 0, y: 12 },
                    { autoAlpha: 1, y: 0, duration: 0.45, ease: "power2.out" },
                    0.38
                );
            }

            return () => {
                tl.kill();
            };
        },
        { scope: containerRef, dependencies: [isPending, isError, device.isReady] }
    );

    return (
        <main
            ref={containerRef}
            className={`
                relative h-dvh w-full overflow-hidden
                bg-[#f3f4f6]
                ${fontClassName}
            `}
        >
            {/* Desktop / Tablet 3D Showroom Preview Stage */}
            {!isPending && !isError && device.isReady && !device.isMobile && !previewError && (
                <div className="absolute inset-0 z-0">
                    <DynamicARShowroomCanvas
                        modelURL={configuration?.modelURL}
                        onModelLoaded={handlePreviewLoaded}
                        onModelError={handlePreviewError}
                    />
                </div>
            )}

            {/* Common Showroom Header */}
            <header
                data-ar-anim="header"
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

            {/* Back to Review Pill */}
            <button
                data-ar-anim="back"
                type="button"
                onClick={handleBackToReview}
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
                <span>Back to Review</span>
            </button>

            {isPending ? (
                <div className="relative z-10 flex h-full flex-col items-center justify-center gap-4">
                    <LoaderCircle size={36} className="animate-spin text-[#d71920]" />
                    <p className="text-sm font-medium text-gray-600">
                        Preparing AR experience...
                    </p>
                </div>
            ) : isError ? (
                <div className="relative z-10 flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
                    <h2 className="text-xl font-bold text-[#152336]">
                        Unable to load configuration
                    </h2>
                    <p className="max-w-sm text-sm text-gray-500">
                        Check your backend connection or verify that the AR configuration exists.
                    </p>
                    {error?.message ? (
                        <p className="max-w-md rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                            {error.message}
                        </p>
                    ) : null}
                    <button
                        type="button"
                        onClick={() => refetch()}
                        className="rounded-full bg-[#e01920] px-6 py-3 text-sm font-medium text-white shadow-[0_10px_24px_-6px_rgba(224,25,32,0.5)] hover:bg-[#c81218]"
                    >
                        Try Again
                    </button>
                </div>
            ) : (
                <>
                    {/* Left AR Title Block matching reference */}
                    <section
                        className="
                            pointer-events-none absolute
                            left-5 top-32 z-20
                            max-w-md md:left-12 md:top-32
                        "
                    >
                        <p
                            data-ar-anim="eyebrow"
                            className="text-xs font-bold uppercase tracking-[0.12em] text-[#d71920]"
                        >
                            AUGMENTED REALITY
                        </p>

                        <h1
                            data-ar-anim="title"
                            className="mt-2 text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl md:text-[2.1rem]"
                        >
                            {configuration.productName}
                        </h1>

                        <p
                            data-ar-anim="subtitle"
                            className="mt-1.5 text-sm text-gray-500"
                        >
                            Experience the printer in your own space.
                        </p>
                    </section>

                    {/* Mobile View: Native ModelViewer with AR launch button */}
                    {device.isReady && device.isMobile && (
                        <div className="relative z-10 flex h-full flex-col px-5 pb-6 pt-56">
                            <div className="min-h-0 flex-1 overflow-hidden rounded-[22px] border border-gray-100 bg-white/95 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
                                <ModelViewer
                                    key={configuration.modelURL}
                                    modelURL={configuration.modelURL}
                                    iosURL={configuration.iosURL}
                                    productName={configuration.productName}
                                />
                            </div>

                            {!device.isSecureContext && (
                                <p className="mt-3 rounded-xl bg-amber-50 p-3 text-center text-xs text-amber-700">
                                    A secure HTTPS connection is required for browser-based WebXR AR.
                                </p>
                            )}
                        </div>
                    )}

                    {/* Desktop/Tablet View: Model loading state & fallback notice + Right QR Panel */}
                    {device.isReady && !device.isMobile && (
                        <>
                            {!previewReady && !previewError && (
                                <div className="pointer-events-none absolute bottom-20 left-1/2 z-20 -translate-x-1/2 md:left-[33%]">
                                    <div className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs text-gray-600 shadow-sm">
                                        <LoaderCircle size={14} className="animate-spin text-[#d71920]" />
                                        <span>Loading 3D Preview...</span>
                                    </div>
                                </div>
                            )}

                            {previewError && (
                                <div className="absolute inset-y-0 left-0 z-10 flex w-full items-center justify-center px-6 md:w-[calc(100%-410px)] lg:w-[calc(100%-440px)]">
                                    <div className="h-[52dvh] w-full max-w-xl overflow-hidden rounded-[22px] border border-gray-100 bg-white shadow-lg">
                                        <ModelViewer
                                            key={configuration.modelURL}
                                            modelURL={configuration.modelURL}
                                            iosURL={configuration.iosURL}
                                            productName={configuration.productName}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* AR-unavailable notice for desktop preview */}
                            {!previewError && (
                                <div
                                    data-ar-anim="notice"
                                    className="
                                        pointer-events-none absolute
                                        bottom-6 left-6 z-20
                                        flex w-auto justify-center
                                        md:left-0 md:w-[calc(100%-390px)]
                                        lg:w-[calc(100%-440px)]
                                    "
                                >
                                    <div
                                        className="
                                            flex items-center gap-2.5
                                            rounded-full border border-gray-100
                                            bg-white/95 px-5 py-2.5
                                            text-xs text-gray-600
                                            shadow-[0_6px_18px_rgba(15,23,42,0.08)]
                                        "
                                    >
                                        <Smartphone size={14} className="shrink-0 text-[#d71920]" />
                                        <span>
                                            AR is unavailable on this device or browser. You can still explore the 3D model.
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Right-side Mobile QR Code Card */}
                            <aside
                                data-ar-anim="qr"
                                aria-label="Mobile AR QR Code"
                                className="
                                    pointer-events-auto absolute
                                    right-6 top-24 bottom-6 z-30
                                    flex w-[340px] flex-col items-center justify-center
                                    overflow-y-auto rounded-[22px] border border-gray-100
                                    bg-white/95 p-6
                                    shadow-[0_18px_50px_rgba(15,23,42,0.1)]
                                    backdrop-blur-xl
                                    lg:right-12 lg:w-[370px] lg:p-7
                                "
                            >
                                <ARQRCode url={pageURL} />
                            </aside>
                        </>
                    )}
                </>
            )}
        </main>
    );
}
