"use client";

import Hotspot from "./Hotspot";

import { HOTSPOTS } from "@/config/showroomConfig";
import { useShowroomStore } from "@/stores/useShowroomStore";
import { useConfigurationStore } from "@/stores/useConfigurationStore";

export default function HotspotList({ bounds, productId }) {
    const mode = useShowroomStore(
        (state) => state.mode
    );

    const showHotspots = useShowroomStore(
        (state) => state.showHotspots
    );

    const isTransitioning = useShowroomStore(
        (state) => state.isTransitioning
    );

    const isConfiguratorOpen = useConfigurationStore(
        (state) => state.isConfiguratorOpen
    );

    if (
        !bounds ||
        bounds.isEmpty() ||
        mode !== "product" ||
        !showHotspots ||
        isTransitioning ||
        isConfiguratorOpen
    ) {
        return null;
    }

    return (
        <group>
            {HOTSPOTS.map((hotspot) => {
                const [x, y, z] = hotspot.anchor;

                const position = [
                    bounds.min.x +
                    (bounds.max.x - bounds.min.x) * x,

                    bounds.min.y +
                    (bounds.max.y - bounds.min.y) * y,

                    bounds.min.z +
                    (bounds.max.z - bounds.min.z) * z,
                ];

                // Move surface hotspots slightly outward.
                const offset = 0.025;

                if (x === 1) position[0] += offset;
                if (x === 0) position[0] -= offset;

                if (y === 1) position[1] += offset;
                if (y === 0) position[1] -= offset;

                if (z === 1) position[2] += offset;
                if (z === 0) position[2] -= offset;

                return (
                    <Hotspot
                        key={hotspot.id}
                        hotspot={hotspot}
                        position={position}
                    />
                );
            })}
        </group>
    );
}