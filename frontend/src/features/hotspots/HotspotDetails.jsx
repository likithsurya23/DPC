"use client";

import {
    X,
    Info,
    Video,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import { HOTSPOTS } from
    "@/config/showroomConfig";

import { useShowroomStore } from
    "@/stores/useShowroomStore";

export default function HotspotDetails() {
    const selectedHotspot = useShowroomStore(
        (state) => state.selectedHotspot
    );

    const selectHotspot = useShowroomStore(
        (state) => state.selectHotspot
    );

    const closeHotspot = useShowroomStore(
        (state) => state.closeHotspot
    );

    const index = HOTSPOTS.findIndex(
        (item) => item.id === selectedHotspot
    );

    if (index === -1) {
        return null;
    }

    const hotspot = HOTSPOTS[index];

    return (
        <aside
            aria-label="Product feature details"
            className="
                pointer-events-auto absolute
                right-5 top-40 z-40
                w-[calc(100%-2.5rem)]
                max-h-[calc(100dvh-12rem)]
                overflow-y-auto
                rounded-2xl border border-gray-200
                bg-white/95 shadow-xl
                backdrop-blur-xl sm:w-[340px]
            "
        >
            {/* Header */}
            <div
                className="
                    flex items-center
                    justify-between
                    border-b border-gray-100 p-5
                "
            >
                <div className="flex items-center gap-2">
                    <Info
                        size={19}
                        className="text-primary"
                    />

                    <span
                        className="
                            text-xs font-semibold
                            uppercase tracking-wider
                            text-primary
                        "
                    >
                        Feature {hotspot.number}
                    </span>
                </div>

                <button
                    type="button"
                    aria-label="Close feature details"
                    onClick={closeHotspot}
                    className="
                        rounded-lg p-2
                        text-gray-500 hover:bg-gray-100
                    "
                >
                    <X size={20} />
                </button>
            </div>

            {/* Feature information */}
            <div className="space-y-4 p-5">
                <h2
                    className="
                        text-xl font-semibold
                        text-gray-900
                    "
                >
                    {hotspot.title}
                </h2>

                <p
                    className="
                        text-sm leading-relaxed
                        text-gray-600
                    "
                >
                    {hotspot.description}
                </p>

                {/* Optional demonstration video */}
                {hotspot.videoURL ? (
                    <video
                        key={hotspot.videoURL}
                        src={hotspot.videoURL}
                        controls
                        playsInline
                        preload="metadata"
                        className="
                            aspect-video w-full
                            rounded-xl bg-black
                        "
                    />
                ) : (
                    <div
                        className="
                            flex flex-col items-center
                            justify-center gap-3
                            rounded-xl bg-gray-100
                            px-4 py-8 text-center
                        "
                    >
                        <Video
                            size={30}
                            strokeWidth={1.5}
                            className="text-gray-400"
                        />

                        <p className="text-xs text-gray-500">
                            Demonstration video not available
                        </p>
                    </div>
                )}
            </div>

            {/* Previous / next feature */}
            <div
                className="
                    flex items-center
                    justify-between
                    border-t border-gray-100 p-4
                "
            >
                <button
                    type="button"
                    aria-label="Previous feature"
                    disabled={index === 0}
                    onClick={() =>
                        selectHotspot(
                            HOTSPOTS[index - 1].id
                        )
                    }
                    className="
                        rounded-lg border
                        border-gray-200 p-2
                        text-gray-600
                        hover:bg-gray-100
                        disabled:opacity-30
                    "
                >
                    <ChevronLeft size={18} />
                </button>

                <span className="text-xs text-gray-500">
                    {index + 1} of {HOTSPOTS.length}
                </span>

                <button
                    type="button"
                    aria-label="Next feature"
                    disabled={
                        index === HOTSPOTS.length - 1
                    }
                    onClick={() =>
                        selectHotspot(
                            HOTSPOTS[index + 1].id
                        )
                    }
                    className="
                        rounded-lg border
                        border-gray-200 p-2
                        text-gray-600
                        hover:bg-gray-100
                        disabled:opacity-30
                    "
                >
                    <ChevronRight size={18} />
                </button>
            </div>
        </aside>
    );
}