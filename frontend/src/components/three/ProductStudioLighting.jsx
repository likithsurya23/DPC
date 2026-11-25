"use client";

import { useEffect, useRef } from "react";

import { PRODUCT_LAYER, setObjectLayer } from "@/utils/modelUtils";

export default function ProductStudioLighting({ position = [0, 0, 0] }) {
    const groupRef = useRef(null);

    useEffect(() => {
        if (groupRef.current) {
            setObjectLayer(groupRef.current, PRODUCT_LAYER);
        }
    }, []);

    return (
        <group ref={groupRef} position={position}>
            {/* Dedicated neutral white studio lighting isolated exclusively to the printer */}
            <ambientLight intensity={0.44} color="#ffffff" />
            <hemisphereLight args={["#ffffff", "#d8dce2", 0.76]} />

            {/* Primary front-right key light for clear form & material separation without overexposure */}
            <directionalLight
                position={[2.4, 3.2, 2.8]}
                intensity={1.55}
                color="#ffffff"
            />

            {/* Soft front-left fill light */}
            <directionalLight
                position={[-2.6, 2.0, 2.2]}
                intensity={0.82}
                color="#f8faff"
            />

            {/* Overhead studio softbox fill */}
            <directionalLight
                position={[0, 3.6, 1.0]}
                intensity={0.5}
                color="#ffffff"
            />

            {/* Clean back rim light to define silhouette edges */}
            <directionalLight
                position={[0, 2.2, -2.6]}
                intensity={0.85}
                color="#ffffff"
            />
        </group>
    );
}

