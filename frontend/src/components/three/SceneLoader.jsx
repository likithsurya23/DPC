"use client";

import { useContext, useEffect, useState } from "react";
import { context as fiberContext } from "@react-three/fiber";
import { useProgress } from "@react-three/drei";
import { LoaderCircle } from "lucide-react";

export default function SceneLoader() {
    const isInsideCanvas = !!useContext(fiberContext);
    const { active, progress } = useProgress();
    const [lingered, setLingered] = useState(false);

    useEffect(() => {
        if (active) {
            const frame = requestAnimationFrame(() => setLingered(true));
            return () => cancelAnimationFrame(frame);
        }

        const timer = setTimeout(() => setLingered(false), 300);
        return () => clearTimeout(timer);
    }, [active]);

    // If rendered inside a Three.js Canvas, return null so no HTML or nested React root is mounted/unmounted in WebGL
    if (isInsideCanvas) {
        return null;
    }

    if (!active && !lingered) {
        return null;
    }

    return (
        <div
            role="status"
            className={`
                pointer-events-none absolute inset-0 z-50
                flex items-center justify-center
                bg-black/10 backdrop-blur-sm
                transition-opacity duration-300
                ${active ? "opacity-100" : "opacity-0"}
            `}
        >
            <div
                className="
                    pointer-events-auto flex w-64 flex-col items-center
                    rounded-2xl border border-gray-200
                    bg-white/95 p-6 shadow-lg
                    backdrop-blur-md
                "
            >
                <LoaderCircle
                    size={34}
                    className="mb-4 animate-spin text-red-600"
                />

                <p className="text-sm font-semibold text-gray-800">
                    Loading 3D Product
                </p>

                <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                        className="h-full rounded-full bg-red-600 transition-all duration-200"
                        style={{
                            width: `${progress}%`,
                        }}
                    />
                </div>

                <p className="mt-3 text-xs font-mono text-gray-500">
                    {Math.round(progress)}%
                </p>
            </div>
        </div>
    );
}
