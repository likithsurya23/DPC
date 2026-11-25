"use client";

import {
    X,
    RotateCcw,
    Settings2,
    Check,
} from "lucide-react";

import AccessoryList from "./AccessoryList";

import { useConfigurationStore } from
    "@/stores/useConfigurationStore";

import { useConfiguration } from
    "@/hooks/useConfiguration";

export default function ConfiguratorPanel({
    product,
}) {
    const openSummary = useConfigurationStore(
        (state) => state.openSummary
    );
    const {
        isConfiguratorOpen,
        availableAccessories,
        selectedAccessoryIds,
        accessoryCount,
        toggleAccessory,
        resetConfiguration,
        closeConfigurator,
    } = useConfiguration(product.id);

    if (!isConfiguratorOpen) {
        return null;
    }

    return (
        <aside
            aria-label="Product configuration"
            className="
                pointer-events-auto absolute
                bottom-5 right-5 top-24 z-40
                flex w-[calc(100%-2.5rem)]
                flex-col overflow-hidden
                rounded-2xl border border-gray-200
                bg-white/95 shadow-xl
                backdrop-blur-xl sm:w-[340px]
            "
        >
            {/* Header */}
            <div
                className="
                    flex items-start justify-between
                    border-b border-gray-100 p-5
                "
            >
                <div>
                    <div className="flex items-center gap-2">
                        <Settings2
                            size={19}
                            className="text-primary"
                        />

                        <h2 className="text-lg font-semibold">
                            Configure Product
                        </h2>
                    </div>

                    <p className="mt-2 text-xs text-gray-500">
                        {product.name}
                    </p>
                </div>

                <button
                    type="button"
                    aria-label="Close configuration"
                    onClick={closeConfigurator}
                    className="
                        rounded-lg p-2
                        text-gray-500 hover:bg-gray-100
                    "
                >
                    <X size={20} />
                </button>
            </div>

            {/* Accessory selection */}
            <div
                className="
                    min-h-0 flex-1
                    overflow-y-auto p-4
                "
            >
                <h3
                    className="
                        mb-4 text-xs font-semibold
                        uppercase tracking-wider
                        text-gray-500
                    "
                >
                    Available Accessories
                </h3>

                <AccessoryList
                    accessories={availableAccessories}
                    selectedIds={selectedAccessoryIds}
                    onToggle={toggleAccessory}
                />
            </div>

            {/* Configuration actions */}
            <div
                className="
                    space-y-3 border-t
                    border-gray-100 p-4
                "
            >
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                        {accessoryCount} accessories selected
                    </span>

                    <button
                        type="button"
                        onClick={resetConfiguration}
                        disabled={accessoryCount === 0}
                        className="
                            flex items-center gap-1
                            text-xs text-gray-600
                            disabled:opacity-40
                        "
                    >
                        <RotateCcw size={13} />
                        Reset
                    </button>
                </div>

                <button
                    type="button"
                    onClick={openSummary}
                    className="
                        flex items-center justify-center
                        gap-2 rounded-xl bg-primary
                        px-5 py-3 text-sm font-medium
                        text-white hover:bg-primary-hover
                    "
                >
                    Review Configuration
                </button>
            </div>
        </aside>
    );
}