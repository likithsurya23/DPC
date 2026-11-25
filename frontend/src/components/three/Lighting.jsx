"use client";

export default function Lighting() {
    return (
        <>
            {/* Environment & podium lighting (Layer 0 only; printer uses isolated ProductStudioLighting) */}
            <ambientLight intensity={0.45} color="#ffffff" />
            <hemisphereLight args={["#ffffff", "#dde1e7", 0.88]} />
            <directionalLight
                position={[2.4, 3.6, 2.6]}
                intensity={2.1}
                color="#ffffff"
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-left={-2.4}
                shadow-camera-right={2.4}
                shadow-camera-top={2.4}
                shadow-camera-bottom={-2.4}
                shadow-camera-near={0.1}
                shadow-camera-far={12}
                shadow-normalBias={0.015}
                shadow-bias={-0.00015}
            />
            <directionalLight position={[-2.6, 2.2, 1.6]} intensity={0.8} color="#f8faff" />
            <directionalLight position={[0, 2.6, -2.8]} intensity={0.95} color="#ffffff" />
            {/* Subtle red ambient wash strictly on Layer 0 architectural backdrop & podium */}
            <pointLight position={[-1.4, 1.2, -3.1]} intensity={1.8} distance={6.5} decay={2} color="#ff5a60" />
            <pointLight position={[0, 0.2, 1.1]} intensity={0.9} distance={3.2} decay={2} color="#ff4b52" />
            {[-2.8, 2.8].map((x) =>
                [-2.8, 2.8].map((z) => (
                    <pointLight
                        key={`${x}-${z}`}
                        position={[x, 3.2, z]}
                        intensity={7.5}
                        distance={9}
                        decay={2}
                        color="#ffffff"
                    />
                ))
            )}
        </>
    );
}
