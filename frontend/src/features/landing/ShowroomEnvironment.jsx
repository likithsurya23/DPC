"use client";

import { useEffect, useMemo, useRef } from "react";
import { MeshReflectorMaterial } from "@react-three/drei";
import * as THREE from "three";

import { LANDING_SCENE_CONFIG } from "./landingConfig";

const { room, platform, colors } = LANDING_SCENE_CONFIG;
const FLOOR_Y = -platform.height;
const CEILING_Y = 2.38;

function getWallPoint(angleOffset, radiusOffset = 0) {
    const r = room.radius + radiusOffset;
    const theta = Math.PI + angleOffset;
    return {
        x: Math.sin(theta) * r,
        z: room.centerZ + Math.cos(theta) * r,
    };
}

function getWallZAtX(x, radiusOffset = 0) {
    const r = room.radius + radiusOffset;
    const clampedX = Math.max(-r + 0.01, Math.min(r - 0.01, x));
    return room.centerZ - Math.sqrt(r * r - clampedX * clampedX);
}

export default function ShowroomEnvironment({
    showcaseX = 0.9,
    isMobile = false,
    reducedQuality = false,
    registerSceneNodes,
}) {
    const environmentGroupRef = useRef(null);
    const ceilingLedMatRef = useRef(null);
    const sidePanelLedMatRef = useRef(null);
    const archLedMatRef = useRef(null);
    const flutedPanelMatRef = useRef(null);
    const redCeilingMatRef = useRef(null);
    const redWingMatRef = useRef(null);

    useEffect(() => {
        if (!registerSceneNodes) return;
        registerSceneNodes({
            environmentGroup: environmentGroupRef.current,
            ceilingLedMat: ceilingLedMatRef.current,
            sidePanelLedMat: sidePanelLedMatRef.current,
            archLedMat: archLedMatRef.current,
            flutedPanelMat: flutedPanelMatRef.current,
            redCeilingMat: redCeilingMatRef.current,
            redWingMat: redWingMatRef.current,
        });
    }, [registerSceneNodes]);

    const wallArc = room.arcHalfAngle * 2;
    const wallThetaStart = Math.PI - room.arcHalfAngle;

    const archGeometry = useMemo(() => {
        const halfWidth = 1.48;
        const archPeakY = 1.92;
        const baseY = FLOOR_Y + 0.02;
        const points = [];
        const segments = 40;

        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const u = t * 2 - 1;
            const x = showcaseX + u * halfWidth;
            const y = baseY + (archPeakY - baseY) * (1 - u * u * 0.92);
            const z = getWallZAtX(x, -0.04);
            points.push(new THREE.Vector3(x, y, z));
        }

        const curve = new THREE.CatmullRomCurve3(points);
        return new THREE.TubeGeometry(curve, 72, 0.014, 10, false);
    }, [showcaseX]);

    const archBackdropGeometry = useMemo(() => {
        const halfWidth = 1.46;
        const archPeakY = 1.9;
        const baseY = FLOOR_Y + 0.02;
        const cols = 28;
        const positions = [];
        const indices = [];

        for (let i = 0; i <= cols; i++) {
            const t = i / cols;
            const u = t * 2 - 1;
            const x = showcaseX + u * halfWidth;
            const topY = baseY + (archPeakY - baseY) * (1 - u * u * 0.92);
            const z = getWallZAtX(x, -0.02);
            positions.push(x, baseY, z);
            positions.push(x, topY, z);
        }

        for (let i = 0; i < cols; i++) {
            const a = i * 2;
            const b = a + 1;
            const c = a + 2;
            const d = a + 3;
            indices.push(a, c, b, b, c, d);
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(positions, 3)
        );
        geo.setIndex(indices);
        geo.computeVertexNormals();
        return geo;
    }, [showcaseX]);

    const flutedSlats = useMemo(() => {
        const slats = [];
        const countPerSide = isMobile ? 10 : 14;
        const startAngle = 0.56;
        const endAngle = 0.87;

        [-1, 1].forEach((side) => {
            for (let i = 0; i < countPerSide; i++) {
                const t = i / (countPerSide - 1);
                const angle = side * (startAngle + t * (endAngle - startAngle));
                const pos = getWallPoint(angle, -0.07);
                slats.push({
                    key: `${side}-${i}`,
                    position: [pos.x, FLOOR_Y + 1.24, pos.z],
                    rotationY: angle,
                });
            }
        });

        return slats;
    }, [isMobile]);

    const sideWings = useMemo(() => {
        return [-1, 1].map((side) => {
            const innerAngle = side * 0.89;
            const outerAngle = side * 1.18;
            const innerPt = getWallPoint(innerAngle, -0.14);
            const outerPt = getWallPoint(outerAngle, -0.58);

            const dx = outerPt.x - innerPt.x;
            const dz = outerPt.z - innerPt.z;
            const width = Math.hypot(dx, dz) + 0.8;
            const midX = (innerPt.x + outerPt.x) / 2 + side * 0.25;
            const midZ = (innerPt.z + outerPt.z) / 2 + 0.3;
            const rotY = Math.atan2(-dz, dx);

            return {
                side,
                width,
                midX,
                midZ,
                rotY,
                edgePos: [innerPt.x, FLOOR_Y + 1.26, innerPt.z + 0.04],
                edgeRotY: innerAngle,
            };
        });
    }, []);

    return (
        <group ref={environmentGroupRef}>
            <color attach="background" args={[colors.background]} />
            <fog attach="fog" args={[colors.background, 9.5, 18]} />

            {/* Glossy white showroom floor */}
            <mesh
                position={[0, FLOOR_Y, 0.2]}
                rotation={[-Math.PI / 2, 0, 0]}
                receiveShadow
            >
                <circleGeometry args={[9.5, 96]} />
                {reducedQuality || isMobile ? (
                    <meshStandardMaterial
                        color={colors.floorWhite}
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
                        color={colors.floorWhite}
                        metalness={0.1}
                        mirror={0.38}
                    />
                )}
            </mesh>

            {/* Main curved white showroom back wall */}
            <mesh
                position={[0, FLOOR_Y + room.wallHeight / 2, room.centerZ]}
                receiveShadow
            >
                <cylinderGeometry
                    args={[
                        room.radius,
                        room.radius,
                        room.wallHeight,
                        96,
                        1,
                        true,
                        wallThetaStart,
                        wallArc,
                    ]}
                />
                <meshStandardMaterial
                    color={colors.wallWhite}
                    roughness={0.55}
                    metalness={0.03}
                    side={THREE.BackSide}
                />
            </mesh>

            {/* Subtle horizontal architectural light cove across back wall */}
            <group position={[0, 1.96, room.centerZ]} rotation={[-Math.PI / 2, 0, 0]}>
                <mesh rotation={[0, 0, Math.PI / 2 - wallArc / 2]}>
                    <torusGeometry args={[room.radius - 0.025, 0.008, 8, 96, wallArc]} />
                    <meshBasicMaterial
                        color="#ffffff"
                        transparent
                        opacity={0.75}
                        toneMapped={false}
                    />
                </mesh>
            </group>

            {/* Subtle floor baseboard accent trim */}
            <group position={[0, FLOOR_Y + 0.015, room.centerZ]} rotation={[-Math.PI / 2, 0, 0]}>
                <mesh rotation={[0, 0, Math.PI / 2 - wallArc / 2]}>
                    <torusGeometry args={[room.radius - 0.03, 0.014, 8, 96, wallArc]} />
                    <meshStandardMaterial
                        color="#d7dade"
                        roughness={0.4}
                        metalness={0.1}
                    />
                </mesh>
            </group>

            {/* Upper white ceiling plane */}
            <mesh
                position={[0, CEILING_Y + 0.56, room.centerZ - 1.2]}
                rotation={[Math.PI / 2, 0, 0]}
            >
                <circleGeometry args={[room.radius + 1.5, 64]} />
                <meshStandardMaterial
                    color="#f6eef0"
                    roughness={0.55}
                    metalness={0.05}
                />
            </mesh>

            {/* Curved red ceiling overhang fascia */}
            <group position={[0, 0, room.centerZ]}>
                <mesh position={[0, CEILING_Y + 0.25, 0]}>
                    <cylinderGeometry
                        args={[
                            room.radius - 0.55,
                            room.radius - 0.42,
                            0.5,
                            96,
                            1,
                            true,
                            wallThetaStart,
                            wallArc,
                        ]}
                    />
                    <meshStandardMaterial
                        ref={redCeilingMatRef}
                        color={colors.redPrimary}
                        emissive="#4a0305"
                        emissiveIntensity={0.35}
                        roughness={0.28}
                        metalness={0.18}
                        side={THREE.DoubleSide}
                    />
                </mesh>

                <mesh position={[0, CEILING_Y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry
                        args={[
                            room.radius - 0.62,
                            room.radius + 0.05,
                            96,
                            1,
                            Math.PI / 2 - wallArc / 2,
                            wallArc,
                        ]}
                    />
                    <meshStandardMaterial
                        color={colors.redDeep}
                        emissive="#3b0204"
                        emissiveIntensity={0.3}
                        roughness={0.35}
                        metalness={0.15}
                        side={THREE.DoubleSide}
                    />
                </mesh>

                {/* Crisp white LED strip along bottom edge of curved red ceiling */}
                <group position={[0, CEILING_Y - 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <mesh rotation={[0, 0, Math.PI / 2 - wallArc / 2]}>
                        <torusGeometry
                            args={[room.radius - 0.52, 0.024, 12, 112, wallArc]}
                        />
                        <meshStandardMaterial
                            ref={ceilingLedMatRef}
                            color="#ffffff"
                            emissive="#ffffff"
                            emissiveIntensity={2.6}
                            toneMapped={false}
                        />
                    </mesh>
                    <mesh position={[0, 0, 0.025]} rotation={[0, 0, Math.PI / 2 - wallArc / 2]}>
                        <torusGeometry
                            args={[room.radius - 0.49, 0.042, 10, 96, wallArc]}
                        />
                        <meshBasicMaterial
                            color="#ff6b70"
                            transparent
                            opacity={0.35}
                            toneMapped={false}
                        />
                    </mesh>
                </group>
            </group>

            {/* Backlit fluted vertical wall panels (left & right) */}
            <group>
                {[-1, 1].map((side) => {
                    const start = side === -1 ? Math.PI - 0.88 : Math.PI + 0.55;
                    const len = 0.33;
                    return (
                        <mesh
                            key={`flute-back-${side}`}
                            position={[0, FLOOR_Y + 1.24, room.centerZ]}
                        >
                            <cylinderGeometry
                                args={[
                                    room.radius - 0.02,
                                    room.radius - 0.02,
                                    2.5,
                                    24,
                                    1,
                                    true,
                                    start,
                                    len,
                                ]}
                            />
                            <meshStandardMaterial
                                ref={side === -1 ? flutedPanelMatRef : undefined}
                                color="#ffffff"
                                emissive="#ffe8ea"
                                emissiveIntensity={0.85}
                                side={THREE.BackSide}
                                toneMapped={false}
                            />
                        </mesh>
                    );
                })}

                {flutedSlats.map((slat) => (
                    <mesh
                        key={slat.key}
                        position={slat.position}
                        rotation={[0, slat.rotationY, 0]}
                        castShadow={false}
                        receiveShadow
                    >
                        <cylinderGeometry args={[0.022, 0.022, 2.52, 10]} />
                        <meshStandardMaterial
                            color="#f3f4f6"
                            emissive="#ffffff"
                            emissiveIntensity={0.16}
                            roughness={0.35}
                            metalness={0.08}
                        />
                    </mesh>
                ))}
            </group>

            {/* Red architectural side wings with illuminated vertical LED edges */}
            {sideWings.map((wing) => (
                <group key={`wing-${wing.side}`}>
                    <mesh
                        position={[wing.midX, FLOOR_Y + 1.38, wing.midZ]}
                        rotation={[0, wing.rotY, 0]}
                    >
                        <boxGeometry args={[wing.width, 2.86, 0.14]} />
                        <meshStandardMaterial
                            ref={wing.side === -1 ? redWingMatRef : undefined}
                            color={colors.redPrimary}
                            emissive="#4a0204"
                            emissiveIntensity={0.35}
                            roughness={0.28}
                            metalness={0.18}
                        />
                    </mesh>

                    <mesh
                        position={wing.edgePos}
                        rotation={[0, wing.edgeRotY, wing.side * 0.06]}
                    >
                        <cylinderGeometry args={[0.017, 0.017, 2.56, 10]} />
                        <meshStandardMaterial
                            ref={wing.side === -1 ? sidePanelLedMatRef : undefined}
                            color="#ffffff"
                            emissive="#ffffff"
                            emissiveIntensity={2.4}
                            toneMapped={false}
                        />
                    </mesh>
                </group>
            ))}

            {/* Curved illuminated arch behind the printer */}
            <mesh geometry={archBackdropGeometry}>
                <meshBasicMaterial
                    color="#fff5f6"
                    transparent
                    opacity={0.35}
                    side={THREE.DoubleSide}
                />
            </mesh>

            <mesh geometry={archGeometry}>
                <meshStandardMaterial
                    ref={archLedMatRef}
                    color="#ffffff"
                    emissive="#ffffff"
                    emissiveIntensity={2.2}
                    toneMapped={false}
                />
            </mesh>
        </group>
    );
}
