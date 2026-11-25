"use client";

import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ArrowRight, RotateCcw, Settings } from "lucide-react";

import AccessoryList from "./AccessoryList";
import { useConfigurationStore } from "@/stores/useConfigurationStore";
import { useConfiguration } from "@/hooks/useConfiguration";

gsap.registerPlugin(useGSAP);

export default function ConfiguratorPanel({ product }) {
    const panelRef = useRef(null);

    const openSummary = useConfigurationStore((state) => state.openSummary);
    const initializeConfiguration = useConfigurationStore(
        (state) => state.initializeConfiguration
    );
    const {
        productId: configuredProductId,
        availableAccessories,
        selectedAccessoryIds,
        accessoryCount,
        toggleAccessory,
        resetConfiguration,
    } = useConfiguration(product.id);

    useEffect(() => {
        if (product?.id && configuredProductId !== product.id) {
            initializeConfiguration(product.id);
        }
    }, [configuredProductId, initializeConfiguration, product?.id]);

    useGSAP(
        () => {
            const reducedMotion =
                typeof window !== "undefined" &&
                window.matchMedia("(prefers-reduced-motion: reduce)").matches;

            if (reducedMotion) {
                gsap.set([panelRef.current, "[data-config-item]"], {
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
                "[data-config-item]",
                { autoAlpha: 0, y: 10 },
                {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.35,
                    stagger: 0.05,
                    ease: "power2.out",
                },
                0.15
            );

            return () => {
                tl.kill();
            };
        },
        { scope: panelRef }
    );

    return (
        <aside
            ref={panelRef}
            aria-label="Product configuration"
            className="
                pointer-events-auto absolute
                inset-x-4 bottom-3 z-30
                flex max-h-[45dvh] flex-col overflow-hidden
                rounded-[22px] border border-gray-100
                bg-white/95 shadow-[0_18px_50px_rgba(15,23,42,0.1)]
                backdrop-blur-xl
                md:inset-x-auto md:bottom-6 md:right-8 md:top-24
                md:max-h-none md:w-[390px]
                lg:right-12 lg:w-[430px]
            "
        >
            {/* Header */}
            <div className="px-6 pb-3 pt-6">
                <h2 className="text-xl font-bold tracking-tight text-[#152336] md:text-[1.4rem]">
                    Configure Printer
                </h2>

                <p className="mt-1 text-xs text-gray-500 md:text-[13px]">
                    Select available accessories to customize your printer.
                </p>
            </div>

            {/* Accessory selection list */}
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-2">
                <AccessoryList
                    accessories={availableAccessories}
                    selectedIds={selectedAccessoryIds}
                    onToggle={toggleAccessory}
                />
            </div>

            {/* Footer actions */}
            <div className="space-y-3 px-6 pb-5 pt-3">
                <p className="text-xs text-gray-500">
                    {accessoryCount}{" "}
                    {accessoryCount === 1 ? "accessory" : "accessories"} selected
                </p>

                <button
                    type="button"
                    onClick={openSummary}
                    className="
                        flex w-full items-center justify-center gap-3
                        rounded-full bg-[#e01920] px-6 py-3.5
                        text-sm font-medium text-white
                        shadow-[0_10px_24px_-6px_rgba(224,25,32,0.5)]
                        transition-colors hover:bg-[#c81218]
                    "
                >
                    <Settings size={17} strokeWidth={1.9} />
                    <span>Review Configuration</span>
                    <ArrowRight size={17} strokeWidth={2} />
                </button>

                <button
                    type="button"
                    onClick={resetConfiguration}
                    disabled={accessoryCount === 0}
                    className="
                        mx-auto flex items-center justify-center gap-2
                        py-1 text-xs font-medium text-gray-600
                        transition-colors hover:text-gray-900
                        disabled:opacity-40
                    "
                >
                    <RotateCcw size={13} />
                    <span>Reset Configuration</span>
                </button>
            </div>
        </aside>
    );
}
