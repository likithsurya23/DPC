"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import { APP_CONFIG } from "@/config/appConfig";

import HeroContent from "./HeroContent";
import { WebGLFallback } from "./ShowroomScene";
import { LANDING_SCENE_CONFIG, getViewportLayout } from "./landingConfig";
import { useLandingAnimation } from "./useLandingAnimation";

const DynamicShowroomScene = dynamic(
    () => import("./ShowroomScene"),
    {
        ssr: false,
        loading: () => <WebGLFallback />,
    }
);

function detectWebGLSupport() {
    if (typeof window === "undefined") return true;
    try {
        const canvas = document.createElement("canvas");
        return Boolean(
            window.WebGLRenderingContext &&
                (canvas.getContext("webgl2") ||
                    canvas.getContext("webgl") ||
                    canvas.getContext("experimental-webgl"))
        );
    } catch {
        return false;
    }
}

export default function LandingPage({ fontClassName = "" }) {
    const router = useRouter();
    const containerRef = useRef(null);

    const [viewportMode, setViewportMode] = useState("desktop");
    const [reducedMotion, setReducedMotion] = useState(false);
    const [webglSupported, setWebglSupported] = useState(true);
    const [modelReady, setModelReady] = useState(false);
    const [modelFailed, setModelFailed] = useState(false);

    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            setViewportMode(getViewportLayout(window.innerWidth));
            setWebglSupported(detectWebGLSupport());
        });

        const motionQuery = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );
        const motionFrame = requestAnimationFrame(() => {
            setReducedMotion(motionQuery.matches);
        });

        const handleResize = () => {
            setViewportMode(getViewportLayout(window.innerWidth));
        };

        const handleMotionChange = (e) => {
            setReducedMotion(e.matches);
        };

        window.addEventListener("resize", handleResize);
        motionQuery.addEventListener("change", handleMotionChange);

        return () => {
            cancelAnimationFrame(frame);
            cancelAnimationFrame(motionFrame);
            window.removeEventListener("resize", handleResize);
            motionQuery.removeEventListener("change", handleMotionChange);
        };
    }, []);

    const layoutConfig = useMemo(
        () => LANDING_SCENE_CONFIG.layouts[viewportMode],
        [viewportMode]
    );

    const isMobile = viewportMode === "mobile";

    const handleNavigateShowroom = useCallback(() => {
        router.push(APP_CONFIG.routes.showroom);
    }, [router]);

    const {
        getCameraState,
        getSceneAnimState,
        getSceneNodes,
        registerSceneNodes,
        handlePrinterLoaded,
        handlePointerMove,
        handlePointerLeave,
        handleCtaMouseEnter,
        handleCtaMouseLeave,
        handleCtaClick,
    } = useLandingAnimation({
        containerRef,
        layoutConfig,
        reducedMotion,
        onNavigateShowroom: handleNavigateShowroom,
    });

    const onPrinterLoaded = useCallback(() => {
        setModelReady(true);
        handlePrinterLoaded();
    }, [handlePrinterLoaded]);

    const onPrinterError = useCallback(() => {
        setModelFailed(true);
    }, []);

    return (
        <main
            ref={containerRef}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            className={`
                relative h-dvh w-full overflow-hidden
                bg-[#f4f5f7] select-none
                ${fontClassName}
            `}
        >
            {/* Full-screen interactive 3D showroom canvas */}
            <div className="absolute inset-0 z-0">
                {webglSupported ? (
                    <DynamicShowroomScene
                        layoutConfig={layoutConfig}
                        isMobile={isMobile}
                        reducedMotion={reducedMotion}
                        registerSceneNodes={registerSceneNodes}
                        getCameraState={getCameraState}
                        getSceneAnimState={getSceneAnimState}
                        getSceneNodes={getSceneNodes}
                        onPrinterLoaded={onPrinterLoaded}
                        onPrinterError={onPrinterError}
                    />
                ) : (
                    <WebGLFallback />
                )}
            </div>

            {/* Subtle model loading status indicator that never blocks hero or CTA */}
            {webglSupported && !modelReady && !modelFailed && (
                <div
                    role="status"
                    aria-live="polite"
                    className="
                        pointer-events-none absolute bottom-6 right-6 z-10
                        hidden items-center gap-2 rounded-full
                        bg-white/75 px-3.5 py-1.5 text-[11px] font-medium
                        text-gray-600 shadow-sm backdrop-blur-sm md:flex
                    "
                >
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#c90d14]" />
                    <span>Loading 3D Showroom...</span>
                </div>
            )}

            {/* Foreground hero branding, heading, tagline, and CTA */}
            <HeroContent
                onCtaMouseEnter={handleCtaMouseEnter}
                onCtaMouseLeave={handleCtaMouseLeave}
                onCtaClick={handleCtaClick}
            />

            {/* Entrance & exit cinematic reveal veil */}
            <div
                data-anim="veil"
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-30 bg-[#f4f5f7]"
            />
        </main>
    );
}
