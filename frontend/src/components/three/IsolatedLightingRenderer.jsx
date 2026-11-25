"use client";

import { useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { ENVIRONMENT_LAYER, PRODUCT_LAYER } from "@/utils/modelUtils";

export default function IsolatedLightingRenderer() {
    const { camera } = useThree();

    const { dummyTarget, noopMaterial } = useMemo(() => {
        const target = new THREE.WebGLRenderTarget(1, 1, {
            depthBuffer: false,
            stencilBuffer: false,
        });
        const mat = new THREE.MeshBasicMaterial({
            colorWrite: false,
            depthWrite: false,
        });
        return { dummyTarget: target, noopMaterial: mat };
    }, []);

    useEffect(() => {
        camera.layers.enableAll();
        return () => {
            dummyTarget.dispose();
            noopMaterial.dispose();
        };
    }, [camera, dummyTarget, noopMaterial]);

    useFrame((state) => {
        const { gl, scene, camera: activeCamera } = state;
        const prevTarget = gl.getRenderTarget();
        const prevAutoClear = gl.autoClear;
        const prevShadowAutoUpdate = gl.shadowMap.autoUpdate;
        const prevOverride = scene.overrideMaterial;
        const prevBackground = scene.background;

        try {
            // 1. Update directional shadow maps across all layers (1x1 no-op color/depth pass)
            if (gl.shadowMap.enabled) {
                activeCamera.layers.enableAll();
                gl.shadowMap.autoUpdate = true;
                gl.setRenderTarget(dummyTarget);
                scene.background = null;
                scene.overrideMaterial = noopMaterial;
                gl.render(scene, activeCamera);
                scene.overrideMaterial = prevOverride;
                scene.background = prevBackground;
                gl.setRenderTarget(prevTarget);
            }

            // 2. Render Showroom Environment & Podium (Layer 0) with background, floor, and red lighting
            gl.shadowMap.autoUpdate = false;
            gl.shadowMap.needsUpdate = false;
            gl.autoClear = true;
            scene.background = prevBackground;
            activeCamera.layers.set(ENVIRONMENT_LAYER);
            gl.render(scene, activeCamera);

            // 3. Render Printer (Layer 1) with neutral white studio lighting without clearing Pass 1 color/depth
            gl.autoClear = false;
            scene.background = null;
            activeCamera.layers.set(PRODUCT_LAYER);
            gl.render(scene, activeCamera);
        } finally {
            // 4. Restore scene background, full layers, and renderer flags
            scene.background = prevBackground;
            scene.overrideMaterial = prevOverride;
            gl.setRenderTarget(prevTarget);
            activeCamera.layers.enableAll();
            gl.autoClear = prevAutoClear;
            gl.shadowMap.autoUpdate = prevShadowAutoUpdate;
        }
    }, 1);

    return null;
}
