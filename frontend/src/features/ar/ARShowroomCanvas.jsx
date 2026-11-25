"use client";

import { Component, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";

import Lighting from "@/components/three/Lighting";
import ProductStudioLighting from "@/components/three/ProductStudioLighting";
import IsolatedLightingRenderer from "@/components/three/IsolatedLightingRenderer";
import ShowroomEnvironment from "@/features/showroom/ShowroomEnvironment";
import { SHOWROOM_CONFIG } from "@/config/showroomConfig";
import {
    PRODUCT_LAYER,
    prepareModel,
    setObjectLayer,
} from "@/utils/modelUtils";

class ARSceneErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error) {
        console.error("AR 3D preview error:", error);
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

function ARPrinterModel({ modelURL, onBoundsMeasured, onLoaded }) {
    const { scene } = useGLTF(modelURL);

    const { model, size } = useMemo(() => {
        const result = prepareModel(scene);
        setObjectLayer(result.model, PRODUCT_LAYER);
        return result;
    }, [scene]);

    useEffect(() => {
        if (onBoundsMeasured && size) {
            onBoundsMeasured(size);
        }
        if (onLoaded) {
            onLoaded();
        }
    }, [onBoundsMeasured, onLoaded, size]);

    return (
        <group position={[0, 0, 0]}>
            <primitive object={model} dispose={null} />
        </group>
    );
}

function ARCameraRig({ modelSize }) {
    const controlsRef = useRef(null);
    const lastViewRef = useRef({ w: 0, h: 0, ox: 0, oy: 0 });
    const hasEnteredRef = useRef(false);
    const { size } = useThree();

    const isMobile = size.width < 768;
    const isTablet = size.width >= 768 && size.width < 1100;

    const framing = useMemo(() => {
        const [w = 0.59, h = 0.81, d = 0.64] = modelSize || [];
        const span = Math.max(w * 0.92, h * 1.12, d * 0.95, 0.85);
        const extraScale = Math.max(0, (span - 0.9) * 1.35);
        const posOffset = extraScale * 1.15;
        const targetY = 0.4 + Math.max(0, (h - 0.81) * 0.4);

        const offsetX = isMobile ? 0 : isTablet ? 0.14 : 0.165;
        const offsetY = isMobile ? 0.08 : -0.02;

        return {
            position: [
                1.15 + posOffset * 0.38,
                1.16 + posOffset * 0.32,
                2.72 + posOffset,
            ],
            target: [0, targetY, 0],
            offsetX,
            offsetY,
        };
    }, [isMobile, isTablet, modelSize]);

    const proxyRef = useRef({
        posX: 1.45,
        posY: 1.38,
        posZ: 3.45,
        targetX: 0,
        targetY: 0.36,
        targetZ: 0,
        offsetX: framing.offsetX,
        offsetY: framing.offsetY,
        active: true,
    });

    useEffect(() => {
        const proxy = proxyRef.current;
        const reducedMotion =
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (reducedMotion) {
            proxy.posX = framing.position[0];
            proxy.posY = framing.position[1];
            proxy.posZ = framing.position[2];
            proxy.targetX = framing.target[0];
            proxy.targetY = framing.target[1];
            proxy.targetZ = framing.target[2];
            proxy.offsetX = framing.offsetX;
            proxy.offsetY = framing.offsetY;
            proxy.active = true;
            requestAnimationFrame(() => {
                proxy.active = false;
            });
            hasEnteredRef.current = true;
            return;
        }

        const duration = hasEnteredRef.current ? 0.75 : 1.15;
        hasEnteredRef.current = true;
        proxy.active = true;

        const tween = gsap.to(proxy, {
            posX: framing.position[0],
            posY: framing.position[1],
            posZ: framing.position[2],
            targetX: framing.target[0],
            targetY: framing.target[1],
            targetZ: framing.target[2],
            offsetX: framing.offsetX,
            offsetY: framing.offsetY,
            duration,
            ease: "power3.out",
            onComplete: () => {
                proxy.active = false;
            },
        });

        return () => {
            tween.kill();
        };
    }, [framing]);

    useFrame((state) => {
        const proxy = proxyRef.current;
        const controls = controlsRef.current;
        const { width, height } = state.size;

        if (width > 0 && height > 0) {
            const ox = Math.round(proxy.offsetX * width);
            const oy = Math.round(proxy.offsetY * height);
            const prev = lastViewRef.current;
            const view = state.camera.view;

            const needsUpdate =
                prev.w !== width ||
                prev.h !== height ||
                prev.ox !== ox ||
                prev.oy !== oy ||
                ((ox !== 0 || oy !== 0) &&
                    (!view ||
                        !view.enabled ||
                        view.offsetX !== ox ||
                        view.offsetY !== oy));

            if (needsUpdate) {
                if (ox === 0 && oy === 0) {
                    state.camera.clearViewOffset();
                } else {
                    state.camera.setViewOffset(width, height, ox, oy, width, height);
                }
                lastViewRef.current = { w: width, h: height, ox, oy };
            }
        }

        if (!proxy.active) return;

        state.camera.position.set(proxy.posX, proxy.posY, proxy.posZ);
        if (controls) {
            controls.target.set(proxy.targetX, proxy.targetY, proxy.targetZ);
            controls.update();
        } else {
            state.camera.lookAt(proxy.targetX, proxy.targetY, proxy.targetZ);
        }
    });

    return (
        <OrbitControls
            ref={controlsRef}
            makeDefault
            target={[0, 0.4, 0]}
            enableRotate
            enableZoom
            enablePan={false}
            enableDamping
            dampingFactor={0.07}
            rotateSpeed={0.7}
            zoomSpeed={0.8}
            minDistance={SHOWROOM_CONFIG.camera.minDistance}
            maxDistance={SHOWROOM_CONFIG.camera.maxDistance}
            minPolarAngle={SHOWROOM_CONFIG.camera.minPolarAngle}
            maxPolarAngle={SHOWROOM_CONFIG.camera.maxPolarAngle}
        />
    );
}

export default function ARShowroomCanvas({ modelURL, onModelLoaded, onModelError }) {
    const [modelSize, setModelSize] = useState([0.59, 0.81, 0.64]);
    const isExpandedPlatform = modelSize[0] > 0.85;

    useEffect(() => {
        if (modelURL) {
            useGLTF.preload(modelURL);
        }
    }, [modelURL]);

    return (
        <ARSceneErrorBoundary onError={onModelError}>
            <Canvas
                shadows="percentage"
                dpr={SHOWROOM_CONFIG.renderer.dpr}
                camera={{
                    position: [1.45, 1.38, 3.45],
                    fov: SHOWROOM_CONFIG.camera.fov,
                    near: SHOWROOM_CONFIG.camera.near,
                    far: SHOWROOM_CONFIG.camera.far,
                }}
                gl={{
                    antialias: true,
                    alpha: false,
                    powerPreference: "high-performance",
                    toneMapping: THREE.ACESFilmicToneMapping,
                    toneMappingExposure: 1,
                }}
            >
                <Lighting />
                <ProductStudioLighting position={[0, 0, 0]} />
                <IsolatedLightingRenderer />
                <ARCameraRig modelSize={modelSize} />

                <Suspense fallback={null}>
                    <ShowroomEnvironment isExpandedPlatform={isExpandedPlatform} />
                </Suspense>

                {modelURL && (
                    <Suspense fallback={null}>
                        <ARPrinterModel
                            modelURL={modelURL}
                            onBoundsMeasured={setModelSize}
                            onLoaded={onModelLoaded}
                        />
                    </Suspense>
                )}
            </Canvas>
        </ARSceneErrorBoundary>
    );
}

