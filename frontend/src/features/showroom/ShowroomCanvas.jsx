"use client";

import { Component } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";

import ShowroomScene from "./ShowroomScene";

import { SHOWROOM_CONFIG } from "@/config/showroomConfig";

class SceneErrorBoundary extends Component {
    constructor(props) {
        super(props);

        this.state = {
            hasError: false,
        };
    }

    static getDerivedStateFromError() {
        return {
            hasError: true,
        };
    }

    componentDidCatch(error) {
        console.error("Showroom rendering error:", error);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div
                    className="
                        flex h-full w-full flex-col
                        items-center justify-center
                        bg-gray-100 px-6 text-center
                    "
                >
                    <h2 className="text-xl font-semibold">
                        Unable to load 3D experience
                    </h2>

                    <p className="mt-3 text-sm text-gray-500">
                        Check the backend connection and
                        model availability.
                    </p>

                    <button
                        onClick={() => window.location.reload()}
                        className="
                            mt-5 rounded-lg bg-primary
                            px-5 py-3 text-sm text-white
                        "
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default function ShowroomCanvas() {
    const { camera, renderer } = SHOWROOM_CONFIG;

    return (
        <SceneErrorBoundary>
            <Canvas
                shadows="percentage"

                dpr={renderer.dpr}

                camera={{
                    position: camera.position,
                    fov: camera.fov,
                    near: camera.near,
                    far: camera.far,
                }}

                gl={{
                    antialias: true,
                    alpha: false,
                    powerPreference: "high-performance",
                    toneMapping: THREE.ACESFilmicToneMapping,
                    toneMappingExposure: 1,
                }}

                fallback={
                    <div
                        className="
                            flex h-full items-center
                            justify-center bg-gray-100
                            p-8 text-center
                        "
                    >
                        Your browser does not support
                        the required 3D rendering features.
                    </div>
                }
            >
                <ShowroomScene />
            </Canvas>
        </SceneErrorBoundary>
    );
}