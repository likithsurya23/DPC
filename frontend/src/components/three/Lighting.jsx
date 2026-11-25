"use client";

export default function Lighting() {
    return (
        <>
            <ambientLight intensity={0.32} />
            <hemisphereLight args={["#ffffff", "#aeb5bf", 0.8]} />
            <directionalLight position={[2.5, 3, 2.4]} intensity={2.1} castShadow
                shadow-mapSize-width={2048} shadow-mapSize-height={2048}
                shadow-camera-left={-2.5} shadow-camera-right={2.5}
                shadow-camera-top={2.5} shadow-camera-bottom={-2.5}
                shadow-camera-near={0.1} shadow-camera-far={12}
                shadow-normalBias={0.012} shadow-bias={-0.0001} />
            <directionalLight position={[-2.5, 2, 1]} intensity={0.7} />
            <directionalLight position={[0, 2.5, -2.5]} intensity={1.1} />
            {[-2.5, 2.5].map(x => [-2.5, 2.5].map(z => (
                <pointLight key={`${x}-${z}`} position={[x, 2.9, z]} intensity={8} distance={7} decay={2} color="#ffffff" />
            )))}
        </>
    );
}
