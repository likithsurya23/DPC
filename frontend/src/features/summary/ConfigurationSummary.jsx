"use client";

import { useState } from "react";

import {
    X,
    Box,
    CheckCircle2,
    Settings2,
    Smartphone,
    Share2,
    LoaderCircle,
    Copy,
    Check,
    ExternalLink,
    ClipboardList,
} from "lucide-react";

import { ACCESSORIES } from "@/config/showroomConfig";

import { useConfigurationStore } from
    "@/stores/useConfigurationStore";

import { saveConfiguration } from
    "@/services/configurationService";

export default function ConfigurationSummary({
    product,
    onViewInAR,
    isPreparingAR = false,
}) {
    const [isSaving, setIsSaving] = useState(false);
    const [sharedURL, setSharedURL] = useState("");
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState("");

    const isSummaryOpen = useConfigurationStore(
        (state) => state.isSummaryOpen
    );

    const configuredProductId = useConfigurationStore(
        (state) => state.productId
    );

    const selectedAccessories = useConfigurationStore(
        (state) => state.selectedAccessories
    );

    const closeSummary = useConfigurationStore(
        (state) => state.closeSummary
    );

    const initializeConfiguration = useConfigurationStore(
        (state) => state.initializeConfiguration
    );

    if (!isSummaryOpen || !product) {
        return null;
    }

    const accessoryIds =
        configuredProductId === product.id
            ? selectedAccessories
            : [];

    const configuredAccessories = ACCESSORIES.filter(
        (accessory) =>
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
            const configuration =
                await saveConfiguration(
                    product.id,
                    accessoryIds
                );

            setSharedURL(configuration.shareURL);
        } catch (error) {
            console.error(
                "Configuration saving failed:",
                error
            );

            setError(
                "Unable to save configuration. Please try again."
            );
        } finally {
            setIsSaving(false);
        }
    }

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(
                sharedURL
            );

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
            className="
                pointer-events-auto absolute
                right-5 top-40 bottom-5 z-40
                flex w-[calc(100%-2.5rem)]
                flex-col overflow-hidden
                rounded-2xl border border-gray-200
                bg-white/95 shadow-xl
                backdrop-blur-xl
                sm:w-[360px]
            "
        >
            {/* Header */}
            <div className="border-b border-gray-100 p-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ClipboardList
                            size={19}
                            className="text-primary"
                        />

                        <span className="text-xs font-semibold tracking-wider text-primary">
                            CONFIGURATION SUMMARY
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={closeSummary}
                        disabled={isSaving || isPreparingAR}
                        aria-label="Close summary"
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                <h2 className="mt-3 text-xl font-semibold text-gray-900">
                    Your Configuration
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                    Review your selected product and accessories.
                </p>
            </div>

            {/* Scrollable summary content */}
            <div className="flex-1 space-y-6 overflow-y-auto p-5">

                {/* Base printer */}
                <section>
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Base Product
                    </h3>

                    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white">
                            <Box
                                size={23}
                                className="text-gray-500"
                            />
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-900">
                                {product.name}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                                Base Configuration
                            </p>
                        </div>

                        <CheckCircle2
                            size={18}
                            className="shrink-0 text-green-600"
                        />
                    </div>
                </section>

                {/* Selected accessories */}
                <section>
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Selected Accessories ({accessoryCount})
                    </h3>

                    {accessoryCount === 0 ? (
                        <div className="rounded-xl border border-dashed border-gray-200 p-5 text-center">
                            <Box
                                size={25}
                                className="mx-auto text-gray-400"
                            />

                            <p className="mt-2 text-xs text-gray-500">
                                No accessories selected.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {configuredAccessories.map(
                                (accessory) => (
                                    <div
                                        key={accessory.id}
                                        className="flex items-center gap-3 rounded-xl border border-gray-200 p-3"
                                    >
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                                            <Box
                                                size={18}
                                                className="text-gray-500"
                                            />
                                        </div>

                                        <p className="flex-1 text-sm font-medium text-gray-700">
                                            {accessory.name}
                                        </p>

                                        <CheckCircle2
                                            size={17}
                                            className="shrink-0 text-green-600"
                                        />
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </section>

                {/* Total configuration */}
                <section className="space-y-3 rounded-xl bg-gray-100 p-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                            Base Product
                        </span>

                        <span className="font-medium">
                            1
                        </span>
                    </div>

                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                            Accessories
                        </span>

                        <span className="font-medium">
                            {accessoryCount}
                        </span>
                    </div>

                    <div className="border-t border-gray-200 pt-3">
                        <div className="flex justify-between text-sm font-semibold">
                            <span>Total Components</span>

                            <span>
                                {accessoryCount + 1}
                            </span>
                        </div>
                    </div>
                </section>

                {/* Shareable link */}
                {sharedURL && (
                    <section className="space-y-3 rounded-xl border border-gray-200 p-3">
                        <p className="text-xs font-semibold text-green-600">
                            Configuration link generated
                        </p>

                        <input
                            type="text"
                            readOnly
                            value={sharedURL}
                            aria-label="Configuration link"
                            className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2 text-xs text-gray-600"
                        />

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={handleCopy}
                                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 p-2 text-xs"
                            >
                                {copied ? (
                                    <Check size={15} />
                                ) : (
                                    <Copy size={15} />
                                )}

                                {copied ? "Copied" : "Copy"}
                            </button>

                            <a
                                href={sharedURL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 p-2 text-xs"
                            >
                                <ExternalLink size={15} />
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

            {/* Bottom actions */}
            <div className="space-y-3 border-t border-gray-100 bg-white p-5">

                <button
                    type="button"
                    disabled={isSaving || isPreparingAR}
                    onClick={() => {
                        setSharedURL("");
                        setCopied(false);
                        setError("");

                        initializeConfiguration(
                            product.id
                        );
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                    <Settings2 size={17} />

                    Edit Configuration
                </button>

                <button
                    type="button"
                    onClick={onViewInAR}
                    disabled={isSaving || isPreparingAR}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
                >
                    {isPreparingAR ? (
                        <LoaderCircle
                            size={17}
                            className="animate-spin"
                        />
                    ) : (
                        <Smartphone size={17} />
                    )}

                    {isPreparingAR
                        ? "Preparing AR..."
                        : "View in AR"}
                </button>

                <button
                    type="button"
                    onClick={handleShare}
                    disabled={isSaving || isPreparingAR}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                    {isSaving ? (
                        <LoaderCircle
                            size={17}
                            className="animate-spin"
                        />
                    ) : (
                        <Share2 size={17} />
                    )}

                    {isSaving
                        ? "Saving Configuration..."
                        : "Save & Share"}
                </button>
            </div>
        </aside>
    );
}