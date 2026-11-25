"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LoaderCircle, Smartphone } from "lucide-react";

import { SHOWROOM_CONFIG } from "@/config/showroomConfig";
import { useARSupport } from "@/hooks/useARSupport";
import {
    exportConfiguredGLBToUSDZ,
    launchIOSQuickLookAnchor,
} from "./usdzFallback";

export default function ModelViewer({
    modelURL,
    iosURL,
    productName = "SHARP Printer",
}) {
    const viewerRef = useRef(null);
    const device = useARSupport();

    const [isRegistered, setIsRegistered] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [canActivateAR, setCanActivateAR] = useState(false);
    const [arSupportChecked, setARSupportChecked] = useState(false);
    const [isLaunchingAR, setIsLaunchingAR] = useState(false);
    const [fallbackUsdzURL, setFallbackUsdzURL] = useState("");
    const fallbackUsdzRef = useRef("");
    const [error, setError] = useState("");
    const [arStatus, setARStatus] = useState("");

    useEffect(() => {
        fallbackUsdzRef.current = fallbackUsdzURL;
    }, [fallbackUsdzURL]);

    // Clean up generated fallback USDZ object URLs on change or unmount.
    useEffect(() => {
        return () => {
            if (fallbackUsdzURL) {
                URL.revokeObjectURL(fallbackUsdzURL);
            }
        };
    }, [fallbackUsdzURL]);

    // Register the custom element on the browser only.
    useEffect(() => {
        let active = true;

        import("@google/model-viewer")
            .then(() => customElements.whenDefined("model-viewer"))
            .then(() => {
                if (active) {
                    setIsRegistered(true);
                }
            })
            .catch((initError) => {
                console.error("[AR] Failed to register model-viewer:", {
                    message: initError?.message ?? String(initError),
                });
                if (active) {
                    setError("Unable to initialize the AR viewer.");
                }
            });

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        if (!isRegistered) return;

        const viewer = viewerRef.current;

        if (!viewer) return;

        let active = true;
        const probeTimers = [];

        // Ensure React 19 custom-element property reflection sets boolean `ar = true`
        // rather than empty string `""` (falsy), which would disable all AR modes.
        viewer.ar = true;
        viewer.setAttribute("ar", "");

        async function evaluateARCapabilities(reason) {
            if (!active || !viewer) return;

            try {
                if (viewer.updateComplete) {
                    await viewer.updateComplete;
                }
            } catch {
                // Ignore update settlement rejections during teardown
            }

            if (!active || !viewer) return;

            const supported = Boolean(viewer.canActivateAR);
            setCanActivateAR(supported);

            if (supported || reason === "settled") {
                setARSupportChecked(true);
                console.info("[AR] Capability detection:", {
                    reason,
                    canActivateAR: supported,
                    loaded: Boolean(viewer.loaded),
                    isAndroid: device.isAndroid,
                    isIOS: device.isIOS,
                    isSecureContext: device.isSecureContext,
                    hasNavigatorXR: typeof navigator !== "undefined" && Boolean(navigator.xr),
                });
            }
        }

        function handleLoad() {
            if (!active) return;

            setIsLoaded(true);
            setError("");

            void evaluateARCapabilities("load");

            // Model Viewer checks WebXR / Scene Viewer / Quick Look asynchronously.
            probeTimers.push(
                window.setTimeout(() => void evaluateARCapabilities("recheck-250ms"), 250),
                window.setTimeout(() => void evaluateARCapabilities("recheck-750ms"), 750),
                window.setTimeout(() => void evaluateARCapabilities("settled"), 1500)
            );
        }

        function handleError(event) {
            const detail = event?.detail;
            console.error("[AR] Model Viewer failed to load configured model:", {
                modelURL,
                type: detail?.type ?? "unknown",
                sourceError: detail?.sourceError?.message ?? detail?.sourceError ?? null,
            });
            setError("Unable to load the configured 3D printer model.");
        }

        function handleARStatus(event) {
            const status = event?.detail?.status || "";
            setARStatus(status);

            console.info("[AR] Status changed:", {
                status,
                canActivateAR: Boolean(viewer.canActivateAR),
            });

            if (status === "failed") {
                void evaluateARCapabilities("ar-status-failed");
                setIsLaunchingAR(false);
                console.error("[AR] Model Viewer reported AR activation failure:", {
                    modelURL,
                    iosURL: iosURL || fallbackUsdzRef.current || null,
                    isAndroid: device.isAndroid,
                    isIOS: device.isIOS,
                    isSecureContext: device.isSecureContext,
                });
                setError("Unable to launch AR on this device or browser.");
            } else if (status === "session-started" || status === "not-presenting") {
                setIsLaunchingAR(false);
            }
        }

        viewer.addEventListener("load", handleLoad);
        viewer.addEventListener("error", handleError);
        viewer.addEventListener("ar-status", handleARStatus);

        if (viewer.loaded) {
            handleLoad();
        } else {
            void evaluateARCapabilities("mount");
        }

        return () => {
            active = false;
            probeTimers.forEach((timerId) => window.clearTimeout(timerId));

            viewer.removeEventListener("load", handleLoad);
            viewer.removeEventListener("error", handleError);
            viewer.removeEventListener("ar-status", handleARStatus);
        };
    }, [
        isRegistered,
        modelURL,
        iosURL,
        device.isAndroid,
        device.isIOS,
        device.isSecureContext,
    ]);

    const handleLaunchAR = useCallback(async () => {
        const viewer = viewerRef.current;

        if (!viewer || isLaunchingAR) {
            return;
        }

        setError("");
        setIsLaunchingAR(true);

        // If an explicit USDZ fallback was already generated on iOS, launch directly on tap.
        if (device.isIOS && fallbackUsdzURL) {
            try {
                launchIOSQuickLookAnchor(fallbackUsdzURL);
            } finally {
                setIsLaunchingAR(false);
            }
            return;
        }

        try {
            viewer.ar = true;
            await viewer.activateAR();
            setIsLaunchingAR(false);
        } catch (activationError) {
            console.error("[AR] Automatic AR activation failed:", {
                message: activationError?.message ?? String(activationError),
                isIOS: device.isIOS,
                isAndroid: device.isAndroid,
                canActivateAR: Boolean(viewer.canActivateAR),
                modelURL,
            });

            // Explicit USDZ export fallback for Apple Quick Look if automatic conversion fails.
            if (device.isIOS && modelURL) {
                try {
                    console.info("[AR] Attempting explicit USDZ export fallback for Quick Look...");
                    const generatedUrl = await exportConfiguredGLBToUSDZ(modelURL);
                    setFallbackUsdzURL(generatedUrl);

                    const launched = launchIOSQuickLookAnchor(generatedUrl);
                    if (!launched) {
                        setError("USDZ model prepared. Tap Launch AR Experience again to open Quick Look.");
                    }
                    setIsLaunchingAR(false);
                    return;
                } catch (usdzError) {
                    console.error("[AR] Explicit USDZ export fallback failed:", {
                        message: usdzError?.message ?? String(usdzError),
                        modelURL,
                    });
                }
            }

            setIsLaunchingAR(false);
            setError(
                "Unable to launch AR on this device or browser. You can still inspect the 3D printer here."
            );
        }
    }, [isLaunchingAR, device.isIOS, device.isAndroid, fallbackUsdzURL, modelURL]);

    if (!modelURL) {
        return <p>No AR model available.</p>;
    }

    if (!isRegistered) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="text-sm text-gray-500">
                    {error || "Initializing AR viewer..."}
                </p>
            </div>
        );
    }

    const effectiveIosURL = iosURL || fallbackUsdzURL || undefined;
    const isARSupported = canActivateAR || Boolean(fallbackUsdzURL);

    return (
        <div className="relative h-full w-full">
            <model-viewer
                ref={viewerRef}
                src={modelURL}
                ios-src={effectiveIosURL}
                alt={`3D model of ${productName}`}
                ar={true}
                ar-modes="webxr scene-viewer quick-look"
                ar-placement="floor"
                ar-scale="fixed"
                camera-controls={true}
                shadow-intensity="1"
                touch-action="pan-y"
                loading="eager"
                style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: SHOWROOM_CONFIG.environment.backgroundColor,
                }}
            >
                {/* Suppress default floating icon so our unified action button handles direct launch */}
                <span slot="ar-button" aria-hidden="true" hidden />
            </model-viewer>

            {!isLoaded && !error && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs text-gray-600 shadow-xs">
                        <LoaderCircle size={14} className="animate-spin text-[#d71920]" />
                        <span>Loading printer model...</span>
                    </div>
                </div>
            )}

            {isLoaded && isARSupported && (
                <div className="pointer-events-auto absolute bottom-5 left-1/2 z-20 -translate-x-1/2">
                    <button
                        type="button"
                        onClick={handleLaunchAR}
                        disabled={isLaunchingAR}
                        className="
                            inline-flex items-center gap-2 whitespace-nowrap
                            rounded-full bg-[#e01920] px-7 py-3.5
                            text-sm font-semibold text-white
                            shadow-[0_12px_28px_-6px_rgba(224,25,32,0.5)]
                            transition-colors hover:bg-[#c81218]
                            disabled:cursor-not-allowed disabled:opacity-60
                        "
                    >
                        {isLaunchingAR ? (
                            <>
                                <LoaderCircle size={16} className="animate-spin" />
                                <span>Preparing AR...</span>
                            </>
                        ) : (
                            <>
                                <Smartphone size={16} />
                                <span>Launch AR Experience</span>
                            </>
                        )}
                    </button>
                </div>
            )}

            {isLoaded && arSupportChecked && !isARSupported && (
                <div className="absolute bottom-5 left-1/2 w-[90%] max-w-sm -translate-x-1/2 rounded-xl border border-gray-100 bg-white/95 p-3 text-center shadow-sm">
                    <p className="text-xs text-gray-500">
                        AR is unavailable on this device or browser.
                        You can still explore the 3D model.
                    </p>
                </div>
            )}

            {error && (
                <div
                    role="alert"
                    className="absolute left-4 right-4 top-4 z-20 rounded-xl border border-red-200 bg-red-50/95 p-3.5 text-center text-xs font-medium text-red-700 shadow-xs"
                >
                    {error}
                </div>
            )}

            {arStatus === "session-started" && (
                <p role="status" className="sr-only">
                    AR session started.
                </p>
            )}
        </div>
    );
}