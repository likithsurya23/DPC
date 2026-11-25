"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MeshReflectorMaterial, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";

import { SHOWROOM_CONFIG } from "@/config/showroomConfig";
import { useShowroomStore } from "@/stores/useShowroomStore";

const { environment: env } = SHOWROOM_CONFIG;
const floorY = -env.platform.height;
const ceilingY = floorY + env.room.height;
const radius = env.room.width / 2;

function GlowRing({ radius: ringRadius, y, color = "#ffffff", thickness = 0.018 }) {
    return (
        <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[ringRadius, thickness, 10, 144]} />
            <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
    );
}

function Floor({ isMobile }) {
    return (
        <group>
            <mesh position={[0, floorY, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <circleGeometry args={[radius + 0.6, 128]} />
                {isMobile ? (
                    <meshStandardMaterial
                        color={env.floorColor}
                        roughness={0.22}
                        metalness={0.14}
                    />
                ) : (
                    <MeshReflectorMaterial
                        blur={[280, 70]}
                        resolution={512}
                        mixBlur={0.85}
                        mixStrength={0.62}
                        roughness={0.34}
                        depthScale={0.45}
                        minDepthThreshold={0.4}
                        maxDepthThreshold={1.4}
                        color={env.floorColor}
                        metalness={0.1}
                        mirror={0.38}
                    />
                )}
            </mesh>
        </group>
    );
}

function Architecture() {
    return (
        <group>
            {/* Continuous curved exhibition wall, viewed from inside. */}
            <mesh position={[0, floorY + env.room.height / 2, 0]} receiveShadow>
                <cylinderGeometry args={[radius, radius, env.room.height, 128, 1, true]} />
                <meshStandardMaterial color={env.wallColor} roughness={0.68} metalness={0.02} side={1} />
            </mesh>
            <mesh position={[0, ceilingY, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <circleGeometry args={[radius, 128]} />
                <meshStandardMaterial color="#f5f6f8" roughness={0.7} />
            </mesh>

            {/* Subtle horizontal architectural wall cove & base red LED trim */}
            <GlowRing radius={radius - 0.04} y={1.95} color="#ffffff" thickness={0.008} />
            <GlowRing radius={radius - 0.06} y={floorY + 0.028} color={env.accentColor} thickness={0.015} />
            <GlowRing radius={radius - 0.12} y={ceilingY - 0.08} color="#ffffff" thickness={0.025} />

            {/* Clean architectural vertical ribs around the room. */}
            {Array.from({ length: 36 }, (_, i) => {
                const a = (i * Math.PI * 2) / 36;
                return (
                    <mesh
                        key={i}
                        position={[
                            Math.sin(a) * (radius - 0.055),
                            floorY + env.room.height / 2,
                            Math.cos(a) * (radius - 0.055),
                        ]}
                        rotation={[0, a, 0]}
                        receiveShadow
                    >
                        <boxGeometry args={[0.034, env.room.height - 0.08, 0.045]} />
                        <meshStandardMaterial
                            color="#e7eaef"
                            emissive="#ffffff"
                            emissiveIntensity={0.18}
                            roughness={0.34}
                            metalness={0.06}
                        />
                    </mesh>
                );
            })}

            {/* Tiered circular ceiling canopy with illuminated ring */}
            <mesh position={[0, ceilingY - 0.12, 0]}>
                <cylinderGeometry args={[2.15, 2.25, 0.18, 96]} />
                <meshStandardMaterial color="#e6e8ec" roughness={0.42} metalness={0.15} />
            </mesh>
            <mesh position={[0, ceilingY - 0.2, 0]}>
                <cylinderGeometry args={[1.65, 1.65, 0.08, 96]} />
                <meshStandardMaterial color={env.accentColor} emissive="#5c0508" emissiveIntensity={0.35} roughness={0.32} />
            </mesh>
            <GlowRing radius={1.66} y={ceilingY - 0.24} color="#ffffff" thickness={0.026} />
            <GlowRing radius={2.2} y={ceilingY - 0.2} color="#ffffff" thickness={0.02} />
            <GlowRing radius={3.25} y={ceilingY - 0.07} color="#ffffff" thickness={0.018} />
        </group>
    );
}

function IlluminatedBackdrop() {
    const portalLedRef = useRef(null);

    const archCurveGeo = useMemo(() => {
        const points = [];
        const segments = 40;
        const halfWidth = 1.38;
        const peakY = 1.98;
        const baseY = floorY + 0.02;

        for (let i = 0; i <= segments; i++) {
            const u = (i / segments) * 2 - 1;
            const x = u * halfWidth;
            const y = baseY + (peakY - baseY) * (1 - u * u * 0.9);
            points.push(new THREE.Vector3(x, y, 0.1));
        }

        const curve = new THREE.CatmullRomCurve3(points);
        return new THREE.TubeGeometry(curve, 64, 0.013, 10, false);
    }, []);

    useEffect(() => {
        const mat = portalLedRef.current;
        if (!mat) return;

        const reducedMotion =
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (reducedMotion) return;

        const tween = gsap.fromTo(
            mat,
            { emissiveIntensity: 1.7 },
            {
                emissiveIntensity: 2.3,
                duration: 2.8,
                ease: "sine.inOut",
                yoyo: true,
                repeat: -1,
            }
        );

        return () => {
            tween.kill();
        };
    }, []);

    // Positioned directly behind the printer along the showroom camera view axis (-0.98, 0, -2.42)
    return (
        <group position={[-1.45, 0, -3.55]} rotation={[0, 0.4, 0]}>
            {/* Architectural recessed feature wall panel */}
            <RoundedBox
                position={[0, 1.32, 0]}
                args={[3.3, 2.9, 0.14]}
                radius={0.08}
                smoothness={4}
                receiveShadow
            >
                <meshStandardMaterial color="#f9fafb" roughness={0.44} metalness={0.04} />
            </RoundedBox>

            {/* Flanking illuminated vertical light fins */}
            {[-1.5, 1.5].map((xPos) => (
                <group key={xPos} position={[xPos, 1.24, 0.08]}>
                    <mesh>
                        <boxGeometry args={[0.04, 2.65, 0.04]} />
                        <meshStandardMaterial color="#e5e7eb" roughness={0.35} />
                    </mesh>
                    <mesh position={[xPos > 0 ? -0.025 : 0.025, 0, 0.01]}>
                        <boxGeometry args={[0.014, 2.55, 0.014]} />
                        <meshStandardMaterial
                            color="#ffffff"
                            emissive="#ffffff"
                            emissiveIntensity={1.6}
                            toneMapped={false}
                        />
                    </mesh>
                </group>
            ))}

            {/* Subtle illuminated architectural arch framing the printer */}
            <mesh geometry={archCurveGeo}>
                <meshStandardMaterial
                    ref={portalLedRef}
                    color="#ffffff"
                    emissive="#ffd6d8"
                    emissiveIntensity={2.0}
                    toneMapped={false}
                />
            </mesh>

            {/* Thin red architectural accent bar at base of portal */}
            <mesh position={[0, floorY + 0.05, 0.08]}>
                <boxGeometry args={[2.9, 0.025, 0.02]} />
                <meshBasicMaterial color={env.accentColor} toneMapped={false} />
            </mesh>
        </group>
    );
}

function ProductPlatform({ expanded }) {
    const { platform } = env;
    const platformRef = useRef(null);
    const ringMatRef = useRef(null);
    const mode = useShowroomStore((state) => state.mode);
    const isExpanded = expanded ?? mode === "product";

    useEffect(() => {
        const group = platformRef.current;
        if (!group) return;

        const targetScale =
            isExpanded ? (platform.productScale ?? 1.22) : 1;

        const reducedMotion =
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (reducedMotion) {
            group.scale.set(targetScale, 1, targetScale);
            return;
        }

        const tween = gsap.to(group.scale, {
            x: targetScale,
            y: 1,
            z: targetScale,
            duration: 0.9,
            ease: "power2.inOut",
        });

        return () => {
            tween.kill();
        };
    }, [isExpanded, platform.productScale]);

    useEffect(() => {
        const mat = ringMatRef.current;
        if (!mat) return;

        const reducedMotion =
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (reducedMotion) return;

        const tween = gsap.fromTo(
            mat,
            { emissiveIntensity: 2.0 },
            {
                emissiveIntensity: 2.9,
                duration: 2.6,
                ease: "sine.inOut",
                yoyo: true,
                repeat: -1,
            }
        );

        return () => {
            tween.kill();
        };
    }, []);

    const { radiusTop, radiusBottom, height } = platform;

    return (
        <group ref={platformRef}>
            {/* Top light-gray / off-white satin display surface flush at y = 0 */}
            <mesh position={[0, -0.008, 0]} receiveShadow>
                <cylinderGeometry args={[radiusTop, radiusTop + 0.012, 0.016, 96]} />
                <meshStandardMaterial color={env.platformColor} roughness={0.22} metalness={0.14} />
            </mesh>

            {/* Flush inner surface */}
            <mesh position={[0, -0.0002, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <circleGeometry args={[radiusTop - 0.035, 96]} />
                <meshStandardMaterial color="#eef0f4" roughness={0.25} metalness={0.1} />
            </mesh>

            {/* Thin glowing rim ring around the top perimeter */}
            <mesh position={[0, -0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <torusGeometry args={[radiusTop - 0.014, 0.008, 12, 128]} />
                <meshStandardMaterial
                    color="#ffffff"
                    emissive="#ffe2e4"
                    emissiveIntensity={1.65}
                    toneMapped={false}
                />
            </mesh>

            {/* Upper red cylindrical body */}
            <mesh position={[0, -0.042, 0]} receiveShadow castShadow>
                <cylinderGeometry args={[radiusTop + 0.01, radiusTop + 0.02, 0.056, 96]} />
                <meshStandardMaterial
                    color={env.accentColor}
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
                    ref={ringMatRef}
                    color="#ffffff"
                    emissive="#ff3b42"
                    emissiveIntensity={2.35}
                    toneMapped={false}
                />
            </mesh>

            {/* Lower red cylindrical base */}
            <mesh position={[0, -(height + 0.08) / 2, 0]} receiveShadow castShadow>
                <cylinderGeometry args={[radiusTop + 0.02, radiusBottom, height - 0.08, 96]} />
                <meshStandardMaterial
                    color={env.accentDeep || "#9b070c"}
                    emissive="#3b0204"
                    emissiveIntensity={0.25}
                    roughness={0.28}
                    metalness={0.22}
                />
            </mesh>

            {/* Subtle soft red under-glow ring at floor contact */}
            <mesh position={[0, -height + 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[radiusBottom - 0.02, radiusBottom + 0.14, 96]} />
                <meshBasicMaterial color="#ff2e36" transparent opacity={0.24} toneMapped={false} />
            </mesh>
        </group>
    );
}

export default function ShowroomEnvironment({ isExpandedPlatform } = {}) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const update = () => setIsMobile(window.innerWidth < 768);
        const frame = requestAnimationFrame(update);
        window.addEventListener("resize", update);
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener("resize", update);
        };
    }, []);

    return (
        <>
            <color attach="background" args={[env.backgroundColor]} />
            <fog attach="fog" args={[env.backgroundColor, 11, 22]} />
            <Floor isMobile={isMobile} />
            <Architecture />
            <IlluminatedBackdrop />
            <ProductPlatform expanded={isExpandedPlatform} />
        </>
    );
}
