"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
    Box,
    Check,
    SlidersHorizontal,
    Smartphone,
    Share2,
    LoaderCircle,
    Copy,
    ExternalLink,
} from "lucide-react";

import { ACCESSORIES } from "@/config/showroomConfig";
import { useConfigurationStore } from "@/stores/useConfigurationStore";
import { saveConfiguration } from "@/services/configurationService";
import AccessoryThumbnail, {
    BaseModelThumbnail,
} from "@/features/configurator/AccessoryThumbnail";

gsap.registerPlugin(useGSAP);

export default function ConfigurationSummary({
    product,
    onViewInAR,
    isPreparingAR = false,
}) {
    const panelRef = useRef(null);

    const [isSaving, setIsSaving] = useState(false);
    const [sharedURL, setSharedURL] = useState("");
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState("");

    const isSummaryOpen = useConfigurationStore((state) => state.isSummaryOpen);
    const configuredProductId = useConfigurationStore((state) => state.productId);
    const selectedAccessories = useConfigurationStore(
        (state) => state.selectedAccessories
    );
    const initializeConfiguration = useConfigurationStore(
        (state) => state.initializeConfiguration
    );

    useGSAP(
        () => {
            if (!isSummaryOpen || !panelRef.current) return;

            const reducedMotion =
                typeof window !== "undefined" &&
                window.matchMedia("(prefers-reduced-motion: reduce)").matches;

            if (reducedMotion) {
                gsap.set([panelRef.current, "[data-summary-item]"], {
                    autoAlpha: 1,
                    x: 0,
                    y: 0,
                });
                return;
            }

            const tl = gsap.timeline();

            tl.fromTo(
                panelRef.current,
                { autoAlpha: 0, x: 24 },
                { autoAlpha: 1, x: 0, duration: 0.45, ease: "power3.out" }
            ).fromTo(
                "[data-summary-item]",
                { autoAlpha: 0, y: 10 },
                {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.35,
                    stagger: 0.05,
                    ease: "power2.out",
                },
                0.14
            );

            return () => {
                tl.kill();
            };
        },
        { scope: panelRef, dependencies: [isSummaryOpen] }
    );

    if (!isSummaryOpen || !product) {
        return null;
    }

    const accessoryIds =
        configuredProductId === product.id ? selectedAccessories : [];

    const configuredAccessories = ACCESSORIES.filter((accessory) =>
        accessoryIds.includes(accessory.id)
    );

    const accessoryCount = configuredAccessories.length;

    async function handleShare() {
        if (isSaving) return;

        setIsSaving(true);
        setError("");
        setSharedURL("");
        setCopied(false);

        try {
            const configuration = await saveConfiguration(
                product.id,
                accessoryIds
            );

            setSharedURL(configuration.shareURL);
        } catch (err) {
            console.error("Configuration saving failed:", err);
            setError("Unable to save configuration. Please try again.");
        } finally {
            setIsSaving(false);
        }
    }

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(sharedURL);
            setCopied(true);
            setError("");
        } catch {
            setError(
                "Unable to copy automatically. Please copy the link manually."
            );
        }
    }

    return (
        <aside
            ref={panelRef}
            aria-label="Configuration summary"
            className="
                pointer-events-auto absolute
                inset-x-4 bottom-3 z-30
                flex max-h-[52dvh] flex-col overflow-hidden
                rounded-[22px] border border-gray-100
                bg-white/95 shadow-[0_18px_50px_rgba(15,23,42,0.1)]
                backdrop-blur-xl
                md:inset-x-auto md:bottom-6 md:right-8 md:top-24
                md:max-h-none md:w-[440px]
                lg:right-12 lg:w-[490px]
            "
        >
            {/* Header */}
            <div className="px-6 pb-3 pt-6">
                <div className="flex items-start gap-3">
                    <Box
                        size={22}
                        strokeWidth={1.9}
                        className="mt-0.5 shrink-0 text-[#d71920]"
                    />

                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-[0.06em] text-[#d71920]">
                            CONFIGURATION SUMMARY
                        </h2>

                        <p className="mt-0.5 text-xs text-gray-500">
                            Review your selected product and accessories.
                        </p>
                    </div>
                </div>
            </div>

            {/* Scrollable summary content */}
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-2">
                {/* Base product */}
                <section data-summary-item>
                    <h3 className="mb-2.5 border-l-[2.5px] border-[#d71920] pl-2 text-xs font-bold text-[#152336]">
                        Base Product
                    </h3>

                    <div className="flex items-center gap-3.5 rounded-xl bg-[#fdf0f1] px-4 py-3">
                        <BaseModelThumbnail />

                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-[#152336]">
                                {product.name}
                            </p>

                            <p className="mt-0.5 text-xs text-gray-600">
                                {product.description ||
                                    "Multi-function industrial printer base unit."}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Selected accessories */}
                <section data-summary-item>
                    <h3 className="mb-2.5 border-l-[2.5px] border-[#d71920] pl-2 text-xs font-bold text-[#152336]">
                        Selected Accessories ({accessoryCount})
                    </h3>

                    {accessoryCount === 0 ? (
                        <div className="rounded-xl border border-dashed border-gray-200 p-5 text-center">
                            <Box
                                size={22}
                                className="mx-auto text-gray-400"
                            />
                            <p className="mt-2 text-xs text-gray-500">
                                No accessories selected.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2.5">
                            {configuredAccessories.map((accessory) => (
                                <div
                                    key={accessory.id}
                                    data-summary-item
                                    className="
                                        flex items-center gap-3.5
                                        rounded-xl border border-gray-200
                                        bg-white px-4 py-2.5
                                        shadow-[0_2px_8px_rgba(15,23,42,0.03)]
                                    "
                                >
                                    <AccessoryThumbnail
                                        accessoryId={accessory.id}
                                    />

                                    <p className="min-w-0 flex-1 truncate text-sm font-medium text-gray-800">
                                        {accessory.name}
                                    </p>

                                    <span
                                        aria-label="Selected"
                                        className="
                                            flex h-5 w-5 shrink-0
                                            items-center justify-center
                                            rounded-full bg-[#22c55e] text-white
                                        "
                                    >
                                        <Check size={12} strokeWidth={3} />
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Shareable link after Save & Share */}
                {sharedURL && (
                    <section className="space-y-2.5 rounded-xl border border-gray-200 bg-gray-50/70 p-3.5">
                        <p className="text-xs font-semibold text-green-600">
                            Configuration link generated
                        </p>

                        <input
                            type="text"
                            readOnly
                            value={sharedURL}
                            aria-label="Configuration link"
                            className="w-full rounded-lg border border-gray-200 bg-white p-2 text-xs text-gray-600"
                        />

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={handleCopy}
                                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white p-2 text-xs font-medium text-gray-700 hover:bg-gray-100"
                            >
                                {copied ? (
                                    <Check size={14} />
                                ) : (
                                    <Copy size={14} />
                                )}
                                {copied ? "Copied" : "Copy"}
                            </button>

                            <a
                                href={sharedURL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white p-2 text-xs font-medium text-gray-700 hover:bg-gray-100"
                            >
                                <ExternalLink size={14} />
                                Open
                            </a>
                        </div>
                    </section>
                )}

                {error && (
                    <p
                        role="alert"
                        className="rounded-lg bg-red-50 p-3 text-xs text-red-600"
                    >
                        {error}
                    </p>
                )}
            </div>

            {/* Bottom action buttons matching wireframe */}
            <div className="grid grid-cols-1 gap-2.5 border-t border-gray-100 bg-white px-6 py-5 sm:grid-cols-3">
                <button
                    type="button"
                    disabled={isSaving || isPreparingAR}
                    onClick={() => {
                        setSharedURL("");
                        setCopied(false);
                        setError("");
                        initializeConfiguration(product.id);
                    }}
                    className="
                        flex items-center justify-center gap-1.5
                        rounded-xl border border-gray-200 bg-white
                        px-3 py-2.5 text-xs font-medium text-gray-700
                        transition-colors hover:bg-gray-50
                        disabled:opacity-50
                    "
                >
                    <SlidersHorizontal size={14} strokeWidth={1.9} />
                    <span className="whitespace-nowrap">Edit Configuration</span>
                </button>

                <button
                    type="button"
                    onClick={onViewInAR}
                    disabled={isSaving || isPreparingAR}
                    className="
                        flex items-center justify-center gap-1.5
                        rounded-xl bg-[#e01920] px-3 py-2.5
                        text-xs font-medium text-white
                        shadow-[0_8px_20px_-4px_rgba(224,25,32,0.45)]
                        transition-colors hover:bg-[#c81218]
                        disabled:opacity-50
                    "
                >
                    {isPreparingAR ? (
                        <LoaderCircle size={14} className="animate-spin" />
                    ) : (
                        <Smartphone size={14} strokeWidth={1.9} />
                    )}
                    <span className="whitespace-nowrap">
                        {isPreparingAR ? "Preparing AR..." : "View in AR"}
                    </span>
                </button>

                <button
                    type="button"
                    onClick={handleShare}
                    disabled={isSaving || isPreparingAR}
                    className="
                        flex items-center justify-center gap-1.5
                        rounded-xl border border-gray-200 bg-white
                        px-3 py-2.5 text-xs font-medium text-gray-700
                        transition-colors hover:bg-gray-50
                        disabled:opacity-50
                    "
                >
                    {isSaving ? (
                        <LoaderCircle size={14} className="animate-spin" />
                    ) : (
                        <Share2 size={14} strokeWidth={1.9} />
                    )}
                    <span className="whitespace-nowrap">
                        {isSaving ? "Saving..." : "Save & Share"}
                    </span>
                </button>
            </div>
        </aside>
    );
}
