"use client";

import { Text, RoundedBox } from "@react-three/drei";
import { SHOWROOM_CONFIG } from "@/config/showroomConfig";

const { environment: env } = SHOWROOM_CONFIG;
const floorY = -env.platform.height;
const ceilingY = floorY + env.room.height;
const radius = env.room.width / 2;

function GlowRing({ radius, y, color = "#ffffff", thickness = 0.018 }) {
    return (
        <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[radius, thickness, 8, 128]} />
            <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
    );
}

function Floor() {
    return (
        <group>
            <mesh position={[0, floorY, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <circleGeometry args={[radius, 128]} />
                <meshStandardMaterial color="#d7dadd" roughness={0.32} metalness={0.12} />
            </mesh>
            <GlowRing radius={2.0} y={floorY + 0.008} color="#f8f8f8" thickness={0.008} />
            <GlowRing radius={3.65} y={floorY + 0.008} color="#f8f8f8" thickness={0.008} />
        </group>
    );
}

function Architecture() {
    return (
        <group>
            {/* Continuous curved exhibition wall, viewed from inside. */}
            <mesh position={[0, floorY + env.room.height / 2, 0]} receiveShadow>
                <cylinderGeometry args={[radius, radius, env.room.height, 128, 1, true]} />
                <meshStandardMaterial color="#e8e9eb" roughness={0.7} side={1} />
            </mesh>
            <mesh position={[0, ceilingY, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <circleGeometry args={[radius, 128]} />
                <meshStandardMaterial color="#e1e3e6" roughness={0.65} />
            </mesh>
            <GlowRing radius={radius - 0.06} y={floorY + 0.12} color={env.accentColor} thickness={0.014} />
            <GlowRing radius={radius - 0.12} y={ceilingY - 0.08} thickness={0.025} />
            {/* Architectural vertical ribs around the room. */}
            {Array.from({ length: 32 }, (_, i) => {
                const a = i * Math.PI * 2 / 32;
                return (
                    <mesh key={i} position={[Math.sin(a) * (radius - 0.065), floorY + env.room.height / 2, Math.cos(a) * (radius - 0.065)]} rotation={[0, a, 0]}>
                        <boxGeometry args={[0.045, env.room.height - 0.25, 0.05]} />
                        <meshStandardMaterial color={i % 8 === 0 ? env.accentColor : "#c9cdd2"} roughness={0.5} />
                    </mesh>
                );
            })}
            {/* Main ceiling feature. */}
            <mesh position={[0, ceilingY - 0.12, 0]}>
                <cylinderGeometry args={[1.7, 1.7, 0.16, 96]} />
                <meshStandardMaterial color="#c4c9ce" roughness={0.4} metalness={0.25} />
            </mesh>
            <GlowRing radius={1.56} y={ceilingY - 0.215} thickness={0.045} />
            <GlowRing radius={2.65} y={ceilingY - 0.07} thickness={0.022} />
        </group>
    );
}

function FeatureWall() {
    return (
        <group position={[0, 1.65, -3.92]}>
            <RoundedBox args={[3.8, 2.6, 0.16]} radius={0.08} smoothness={4}>
                <meshStandardMaterial color="#fafafa" roughness={0.45} />
            </RoundedBox>
            <Text position={[0, 0.48, 0.095]} fontSize={0.52} color={env.accentColor} anchorX="center" anchorY="middle">SHARP</Text>
            <Text position={[0, -0.02, 0.095]} fontSize={0.13} color="#4c525a" anchorX="center" anchorY="middle">DIGITAL PRODUCT EXPERIENCE</Text>
            <mesh position={[0, -0.27, 0.095]}>
                <planeGeometry args={[0.75, 0.025]} />
                <meshBasicMaterial color={env.accentColor} />
            </mesh>
        </group>
    );
}

function ProductPlatform() {
    const { platform } = env;
    return (
        <group>
            <mesh position={[0, -platform.height / 2, 0]} receiveShadow>
                <cylinderGeometry args={[platform.radiusTop, platform.radiusBottom, platform.height, 128]} />
                <meshStandardMaterial color="#f2f3f4" roughness={0.35} metalness={0.18} />
            </mesh>
            <GlowRing radius={platform.radiusTop - 0.025} y={0.002} color={env.accentColor} thickness={0.009} />
        </group>
    );
}

export default function ShowroomEnvironment() {
    return (
        <>
            <color attach="background" args={[env.backgroundColor]} />
            <Floor />
            <Architecture />
            <FeatureWall />
            <ProductPlatform />
        </>
    );
}
