"use client";

import { useEffect, useRef } from "react";
import { LANDING_SCENE_CONFIG } from "./landingConfig";

const { platform, colors } = LANDING_SCENE_CONFIG;

export default function DisplayPlatform({
    position = [0, 0, 0],
    registerSceneNodes,
}) {
    const podiumGroupRef = useRef(null);
    const podiumLedMatRef = useRef(null);
    const podiumRimLedMatRef = useRef(null);

    useEffect(() => {
        if (!registerSceneNodes) return;
        registerSceneNodes({
            podiumGroup: podiumGroupRef.current,
            podiumLedMat: podiumLedMatRef.current,
            podiumRimLedMat: podiumRimLedMatRef.current,
        });
    }, [registerSceneNodes]);

    const { radiusTop, radiusBottom, height } = platform;

    return (
        <group ref={podiumGroupRef} position={position}>
            {/* Top light-gray / off-white satin display surface flush at y = 0 */}
            <mesh position={[0, -0.008, 0]} receiveShadow>
                <cylinderGeometry
                    args={[radiusTop, radiusTop + 0.012, 0.016, 96]}
                />
                <meshStandardMaterial
                    color={colors.podiumDeck}
                    roughness={0.22}
                    metalness={0.14}
                />
            </mesh>

            {/* Flush inner surface */}
            <mesh position={[0, -0.0002, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <circleGeometry args={[radiusTop - 0.035, 96]} />
                <meshStandardMaterial
                    color="#eef0f4"
                    roughness={0.25}
                    metalness={0.1}
                />
            </mesh>

            {/* Thin glowing rim ring around the top perimeter */}
            <mesh position={[0, -0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <torusGeometry args={[radiusTop - 0.014, 0.008, 12, 128]} />
                <meshStandardMaterial
                    ref={podiumRimLedMatRef}
                    color="#ffffff"
                    emissive="#ffe2e4"
                    emissiveIntensity={1.65}
                    toneMapped={false}
                />
            </mesh>

            {/* Upper red cylindrical body */}
            <mesh position={[0, -0.042, 0]} receiveShadow castShadow>
                <cylinderGeometry
                    args={[radiusTop + 0.01, radiusTop + 0.02, 0.056, 96]}
                />
                <meshStandardMaterial
                    color={colors.redPrimary}
                    emissive="#4a0305"
                    emissiveIntensity={0.25}
                    roughness={0.26}
                    metalness={0.24}
                />
            </mesh>

            {/* Central inlaid glowing red/white LED strip wrapping the podium */}
            <mesh position={[0, -0.075, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <torusGeometry args={[radiusTop + 0.017, 0.011, 14, 128]} />
                <meshStandardMaterial
                    ref={podiumLedMatRef}
                    color="#ffffff"
                    emissive="#ff3b42"
                    emissiveIntensity={2.35}
                    toneMapped={false}
                />
            </mesh>

            {/* Lower red cylindrical base */}
            <mesh
                position={[0, -(height + 0.08) / 2, 0]}
                receiveShadow
                castShadow
            >
                <cylinderGeometry
                    args={[radiusTop + 0.02, radiusBottom, height - 0.08, 96]}
                />
                <meshStandardMaterial
                    color={colors.redDeep}
                    emissive="#3b0204"
                    emissiveIntensity={0.25}
                    roughness={0.28}
                    metalness={0.22}
                />
            </mesh>

            {/* Subtle soft red under-glow ring at floor contact */}
            <mesh
                position={[0, -height + 0.003, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
            >
                <ringGeometry args={[radiusBottom - 0.02, radiusBottom + 0.14, 96]} />
                <meshBasicMaterial
                    color="#ff2e36"
                    transparent
                    opacity={0.24}
                    toneMapped={false}
                />
            </mesh>
        </group>
    );
}
