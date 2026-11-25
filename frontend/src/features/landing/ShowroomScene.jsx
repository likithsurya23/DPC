"use client";

import { Component, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";

import ShowroomEnvironment from "./ShowroomEnvironment";
import DisplayPlatform from "./DisplayPlatform";
import SceneLighting from "./SceneLighting";
import PrinterModel from "./PrinterModel";
import CameraController from "./CameraController";
import ProductStudioLighting from "@/components/three/ProductStudioLighting";
import IsolatedLightingRenderer from "@/components/three/IsolatedLightingRenderer";

class SceneErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error) {
        console.error("Landing 3D scene error:", error);
    }

    render() {
        if (this.state.hasError) {
            return <WebGLFallback />;
        }
        return this.props.children;
    }
}

class ModelErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error) {
        console.error("Landing printer model error:", error);
        if (this.props.onError) {
            this.props.onError();
        }
    }

    render() {
        if (this.state.hasError) {
            return null;
        }
        return this.props.children;
    }
}

export function WebGLFallback() {
    return (
        <div
            aria-hidden="true"
            className="
                absolute inset-0 overflow-hidden
                bg-[radial-gradient(circle_at_70%_50%,#ffffff_0%,#f1f2f5_52%,#e4e6eb_100%)]
            "
        >
            <div
                className="
                    absolute inset-x-0 top-0 h-28
                    bg-gradient-to-b from-[#c90d14]/25 to-transparent
                "
            />
            <div
                className="
                    absolute bottom-[16%] right-[12%]
                    h-24 w-[420px] max-w-[70vw]
                    rounded-[100%] border-2 border-[#d71920]/40
                    bg-gradient-to-b from-[#eaecf0] to-[#c90d14]/20
                    shadow-[0_20px_50px_rgba(201,13,20,0.2)]
                "
            />
        </div>
    );
}

export default function ShowroomScene({
    layoutConfig,
    isMobile = false,
    reducedMotion = false,
    registerSceneNodes,
    getCameraState,
    getSceneAnimState,
    getSceneNodes,
    onPrinterLoaded,
    onPrinterError,
}) {
    const showcasePosition = [layoutConfig.showcaseX, 0, 0];

    return (
        <SceneErrorBoundary>
            <Canvas
                shadows={isMobile ? "soft" : "percentage"}
                dpr={isMobile ? [1, 1.5] : [1, 1.75]}
                camera={{
                    position: layoutConfig.cameraPosition,
                    fov: layoutConfig.fov,
                    near: 0.1,
                    far: 50,
                }}
                gl={{
                    antialias: true,
                    alpha: false,
                    powerPreference: "high-performance",
                    toneMapping: THREE.ACESFilmicToneMapping,
                    toneMappingExposure: 1.02,
                }}
                fallback={<WebGLFallback />}
            >
                <SceneLighting
                    showcaseX={layoutConfig.showcaseX}
                    isMobile={isMobile}
                    registerSceneNodes={registerSceneNodes}
                />

                <ProductStudioLighting position={showcasePosition} />

                <IsolatedLightingRenderer />

                <CameraController
                    layoutConfig={layoutConfig}
                    getCameraState={getCameraState}
                    getSceneAnimState={getSceneAnimState}
                    getSceneNodes={getSceneNodes}
                />

                <ShowroomEnvironment
                    showcaseX={layoutConfig.showcaseX}
                    isMobile={isMobile}
                    reducedQuality={reducedMotion}
                    registerSceneNodes={registerSceneNodes}
                />

                <DisplayPlatform
                    position={showcasePosition}
                    registerSceneNodes={registerSceneNodes}
                />

                <ModelErrorBoundary onError={onPrinterError}>
                    <Suspense fallback={null}>
                        <PrinterModel
                            position={showcasePosition}
                            printerScale={layoutConfig.printerScale}
                            registerSceneNodes={registerSceneNodes}
                            onLoaded={onPrinterLoaded}
                            onUnavailable={onPrinterError}
                        />
                    </Suspense>
                </ModelErrorBoundary>
            </Canvas>
        </SceneErrorBoundary>
    );
}
