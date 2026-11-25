"use client";

import { useEffect, useRef, useState } from "react";

export default function ModelViewer({
    modelURL,
    iosURL,
    productName = "SHARP Printer",
}) {
    const viewerRef = useRef(null);

    const [isRegistered, setIsRegistered] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [canActivateAR, setCanActivateAR] = useState(false);
    const [error, setError] = useState("");
    const [arStatus, setARStatus] = useState("");

    // Register the custom element on the browser only.
    useEffect(() => {
        let active = true;

        import("@google/model-viewer")
            .then(() => customElements.whenDefined("model-viewer"))
            .then(() => {
                if (active) setIsRegistered(true);
            })
            .catch(() => {
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

        function handleLoad() {
            setIsLoaded(true);
            setCanActivateAR(Boolean(viewer.canActivateAR));
        }

        function handleError() {
            setError("Unable to load the 3D model.");
        }

        function handleARStatus(event) {
            const status = event.detail.status;

            setARStatus(status);

            if (status === "failed") {
                setError(
                    "Unable to launch AR on this device."
                );
            }
        }

        function checkSupport() {
            setCanActivateAR(Boolean(viewer.canActivateAR));
        }

        viewer.addEventListener("load", handleLoad);
        viewer.addEventListener("error", handleError);
        viewer.addEventListener("ar-status", handleARStatus);

        if (viewer.loaded) {
            handleLoad();
        }

        // Capability detection may complete asynchronously.
        const timer = window.setInterval(checkSupport, 1000);

        checkSupport();

        return () => {
            window.clearInterval(timer);

            viewer.removeEventListener("load", handleLoad);
            viewer.removeEventListener("error", handleError);
            viewer.removeEventListener("ar-status", handleARStatus);
        };
    }, [isRegistered, modelURL]);

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

    return (
        <div className="relative h-full w-full">
            <model-viewer
                ref={viewerRef}
                src={modelURL}
                ios-src={iosURL || undefined}
                alt={`3D model of ${productName}`}
                ar=""
                ar-modes="webxr scene-viewer quick-look"
                ar-placement="floor"
                ar-scale="fixed"
                camera-controls=""
                shadow-intensity="1"
                touch-action="pan-y"
                loading="eager"
                style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#f3f4f6",
                }}
            >
                {/* Native AR activation button */}
                <button
                    slot="ar-button"
                    type="button"
                    disabled={!isLoaded}
                    className="
                        absolute bottom-8 left-1/2
                        -translate-x-1/2
                        whitespace-nowrap rounded-full
                        bg-primary px-8 py-4
                        text-sm font-semibold text-white
                        shadow-lg disabled:opacity-50
                    "
                >
                    View in Your Space
                </button>
            </model-viewer>

            {!isLoaded && !error && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <p className="text-sm text-gray-500">
                        Loading printer model...
                    </p>
                </div>
            )}

            {isLoaded && !canActivateAR && (
                <div className="absolute bottom-5 left-1/2 w-[90%] max-w-sm -translate-x-1/2 rounded-xl bg-white p-3 text-center shadow-sm">
                    <p className="text-xs text-gray-500">
                        AR is unavailable on this device or browser.
                        You can still explore the 3D model.
                    </p>
                </div>
            )}

            {error && (
                <div
                    role="alert"
                    className="absolute left-4 right-4 top-4 rounded-lg bg-red-50 p-4 text-sm text-red-700"
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