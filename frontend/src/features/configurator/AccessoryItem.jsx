"use client";

import { Box, Check } from "lucide-react";

export default function AccessoryItem({
    accessory,
    selected,
    onToggle,
    disabled = false,
}) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={() => onToggle(accessory.id)}
            aria-pressed={selected}
            className={`
                flex w-full items-center gap-3
                rounded-xl border p-3 text-left
                transition-colors
                disabled:opacity-50
                ${selected
                    ? "border-primary bg-red-50"
                    : "border-gray-200 bg-white hover:border-gray-400"
                }
            `}
        >
            {/* Accessory icon */}
            <div
                className="
                    flex h-12 w-12 shrink-0
                    items-center justify-center
                    rounded-lg bg-gray-100
                "
            >
                <Box
                    size={24}
                    strokeWidth={1.4}
                    className="text-gray-500"
                />
            </div>

            {/* Accessory name */}
            <div className="min-w-0 flex-1">
                <h3
                    className="
                        text-sm font-medium
                        text-gray-900
                    "
                >
                    {accessory.name}
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                    {selected ? "Added" : "Optional accessory"}
                </p>
            </div>

            {/* Selection indicator */}
            <div
                className={`
                    flex h-5 w-5 shrink-0
                    items-center justify-center border
                    ${accessory.exclusiveGroup
                        ? "rounded-full"
                        : "rounded"
                    }
                    ${selected
                        ? "border-primary bg-primary text-white"
                        : "border-gray-300 bg-white"
                    }
                `}
            >
                {selected && <Check size={14} />}
            </div>
        </button>
    );
}

export const HOTSPOTS = [
    {
        id: "document-feeder",
        number: 1,
        title: "Document Feeder",

        description:
            "Explore the document feeding section of the printer.",

        anchor: [0.5, 1, 0.5],

        videoURL: null,
    },
    {
        id: "control-panel",
        number: 2,
        title: "Touchscreen Control Panel",

        description:
            "Explore the printer interface used to access printing, copying and scanning functions.",

        anchor: [0.75, 0.78, 1],

        videoURL: null,
    },
    {
        id: "output-tray",
        number: 3,
        title: "Output Tray",

        description:
            "Explore the section where processed documents are collected.",

        anchor: [0.5, 0.60, 1],

        videoURL: null,
    },
    {
        id: "paper-tray",
        number: 4,
        title: "Paper Tray",

        description:
            "Explore the paper loading and storage section.",

        anchor: [0.5, 0.25, 1],

        videoURL: null,
    },
    {
        id: "side-panel",
        number: 5,
        title: "Side Access Panel",

        description:
            "Explore the side access section of the printer.",

        anchor: [1, 0.5, 0.5],

        videoURL: null,
    },
];