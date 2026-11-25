"use client";

import { Html } from "@react-three/drei";
import { useShowroomStore } from "@/stores/useShowroomStore";

export default function Hotspot({ hotspot, position }) {
    const selectedHotspot = useShowroomStore(
        (state) => state.selectedHotspot
    );

    const selectHotspot = useShowroomStore(
        (state) => state.selectHotspot
    );

    const isSelected = selectedHotspot === hotspot.id;

    return (
        <Html
            position={position}
            center
            occlude={false}
            zIndexRange={[100, 0]}
            style={{ pointerEvents: "auto" }}
        >
            <button
                type="button"
                title={hotspot.title}
                aria-label={hotspot.title}
                aria-pressed={isSelected}
                onPointerDown={(event) => {
                    event.stopPropagation();
                }}
                onClick={(event) => {
                    event.stopPropagation();
                    selectHotspot(hotspot.id);
                }}
                className={`
                    relative flex h-8 w-8
                    items-center justify-center
                    rounded-full border-2 border-white
                    text-xs font-bold text-white
                    shadow-lg transition-transform
                    hover:scale-110
                    ${isSelected
                        ? "bg-gray-900"
                        : "bg-primary"
                    }
                `}
            >
                {!isSelected && (
                    <span
                        className="
                            pointer-events-none
                            absolute inset-0
                            animate-ping rounded-full
                            bg-primary opacity-30
                        "
                    />
                )}

                <span className="relative">
                    {hotspot.number}
                </span>
            </button>
        </Html>
    );
}