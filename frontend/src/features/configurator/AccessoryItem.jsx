"use client";

import { useState } from "react";
import { Check, Info } from "lucide-react";

import AccessoryThumbnail from "./AccessoryThumbnail";

export default function AccessoryItem({
    accessory,
    selected,
    onToggle,
    disabled = false,
}) {
    const [showInfo, setShowInfo] = useState(false);

    return (
        <div
            data-config-item
            className={`
                rounded-xl border transition-all
                ${selected
                    ? "border-[#e01920] bg-red-50/50 shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }
            `}
        >
            <div className="flex items-center gap-3 px-3.5 py-2.5">
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onToggle(accessory.id)}
                    aria-pressed={selected}
                    className="
                        flex min-w-0 flex-1 items-center gap-3
                        text-left disabled:opacity-50
                    "
                >
                    {/* Selection checkbox */}
                    <span
                        className={`
                            flex h-[18px] w-[18px] shrink-0
                            items-center justify-center rounded-[4px] border
                            transition-colors
                            ${selected
                                ? "border-[#e01920] bg-[#e01920] text-white"
                                : "border-gray-400 bg-white"
                            }
                        `}
                    >
                        {selected && <Check size={13} strokeWidth={2.6} />}
                    </span>

                    {/* Accessory preview */}
                    <AccessoryThumbnail accessoryId={accessory.id} />

                    {/* Accessory name */}
                    <span className="truncate text-sm font-medium text-gray-800">
                        {accessory.name}
                    </span>
                </button>

                {/* Info toggle */}
                <button
                    type="button"
                    aria-label={`Details for ${accessory.name}`}
                    aria-expanded={showInfo}
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowInfo((prev) => !prev);
                    }}
                    className={`
                        flex h-7 w-7 shrink-0 items-center justify-center
                        rounded-full transition-colors
                        ${showInfo
                            ? "bg-gray-100 text-[#e01920]"
                            : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                        }
                    `}
                >
                    <Info size={16} strokeWidth={1.8} />
                </button>
            </div>

            {showInfo && (
                <p className="border-t border-gray-100 px-3.5 py-2 text-xs leading-relaxed text-gray-500">
                    {accessory.description ||
                        "Compatible optional accessory."}
                </p>
            )}
        </div>
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
        anchor: [0.5, 0.6, 1],
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
