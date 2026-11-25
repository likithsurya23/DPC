"use client";

import { useEffect, useRef } from "react";

export default function SceneLighting({
    showcaseX = 0.9,
    isMobile = false,
    registerSceneNodes,
}) {
    const ambientLightRef = useRef(null);
    const hemiLightRef = useRef(null);
    const keyLightRef = useRef(null);
    const redCeilingLightRef = useRef(null);
    const podiumAccentLightRef = useRef(null);

    useEffect(() => {
        if (!registerSceneNodes) return;
        registerSceneNodes({
            ambientLight: ambientLightRef.current,
            hemiLight: hemiLightRef.current,
            keyLight: keyLightRef.current,
            redCeilingLight: redCeilingLightRef.current,
            podiumAccentLight: podiumAccentLightRef.current,
        });
    }, [registerSceneNodes]);

    return (
        <>
            {/* Neutral studio base illumination preserving true printer colors */}
            <ambientLight
                ref={ambientLightRef}
                intensity={0.48}
                color="#ffffff"
            />

            <hemisphereLight
                ref={hemiLightRef}
                args={["#ffffff", "#d5d8de", 0.85]}
            />

            {/* Primary key studio light casting clean contact & ground shadows */}
            <directionalLight
                ref={keyLightRef}
                position={[showcaseX + 2.2, 3.4, 3.0]}
                intensity={1.95}
                color="#ffffff"
                castShadow
                shadow-mapSize-width={isMobile ? 1024 : 2048}
                shadow-mapSize-height={isMobile ? 1024 : 2048}
                shadow-camera-left={-3.0}
                shadow-camera-right={3.0}
                shadow-camera-top={3.0}
                shadow-camera-bottom={-3.0}
                shadow-camera-near={0.2}
                shadow-camera-far={12}
                shadow-normalBias={0.015}
                shadow-bias={-0.0001}
            />

            {/* Left soft fill light so finisher & left side remain crisp */}
            <directionalLight
                position={[showcaseX - 3.0, 2.2, 2.2]}
                intensity={0.9}
                color="#f7f9fc"
            />

            {/* Back studio rim light separating printer silhouette from white wall */}
            <directionalLight
                position={[showcaseX, 2.4, -2.5]}
                intensity={0.95}
                color="#ffffff"
            />

            {/* Soft red showroom ceiling bounce */}
            <pointLight
                ref={redCeilingLightRef}
                position={[0, 2.4, 0.4]}
                intensity={2.4}
                distance={10}
                decay={1.8}
                color="#ff8a8f"
            />

            {/* Subtle left & right wing red ambient fill */}
            <pointLight
                position={[-3.6, 1.2, 0.2]}
                intensity={2.2}
                distance={7}
                decay={2}
                color="#ff4d54"
            />
            <pointLight
                position={[3.6, 1.2, 0.2]}
                intensity={2.2}
                distance={7}
                decay={2}
                color="#ff4d54"
            />

            {/* Soft red accent wash near podium perimeter */}
            <pointLight
                ref={podiumAccentLightRef}
                position={[showcaseX, 0.12, 1.15]}
                intensity={1.35}
                distance={4}
                decay={2}
                color="#ff454d"
            />
        </>
    );
}
