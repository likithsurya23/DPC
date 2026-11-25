"use client";

import { useEffect, useRef } from "react";

import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import * as THREE from "three";

import { SHOWROOM_CONFIG } from "@/config/showroomConfig";
import { useShowroomStore } from "@/stores/useShowroomStore";

const settings = SHOWROOM_CONFIG.camera;

export default function CameraControls() {
    const controlsRef = useRef(null);
    const transitionRef = useRef(null);

    const { camera } = useThree();

    const mode = useShowroomStore(
        (state) => state.mode
    );

    const autoRotate = useShowroomStore(
        (state) => state.autoRotate
    );

    const isTransitioning = useShowroomStore(
        (state) => state.isTransitioning
    );

    const cameraCommand = useShowroomStore(
        (state) => state.cameraCommand
    );

    const setTransitioning = useShowroomStore(
        (state) => state.setTransitioning
    );

    function startTransition(preset) {
        const controls = controlsRef.current;

        if (!controls) return;

        controls.enabled = false;

        transitionRef.current = {
            startPosition: camera.position.clone(),
            startTarget: controls.target.clone(),

            endPosition: new THREE.Vector3(
                ...preset.position
            ),

            endTarget: new THREE.Vector3(
                ...preset.target
            ),

            elapsed: 0,
        };

        setTransitioning(true);
    }

    // Handle showroom/product mode changes.
    useEffect(() => {
        if (useShowroomStore.getState().isTransitioning) {
            startTransition(settings.presets[mode]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode]);

    // Smooth camera movement on every rendered frame.
    useFrame((_, delta) => {
        const controls = controlsRef.current;
        const transition = transitionRef.current;

        if (!controls || !transition) return;

        transition.elapsed += delta;

        const progress = Math.min(
            transition.elapsed /
            settings.transitionDuration,
            1
        );

        // Smooth acceleration and deceleration.
        const eased =
            progress * progress *
            (3 - 2 * progress);

        camera.position.lerpVectors(
            transition.startPosition,
            transition.endPosition,
            eased
        );

        controls.target.lerpVectors(
            transition.startTarget,
            transition.endTarget,
            eased
        );

        camera.lookAt(controls.target);

        if (progress >= 1) {
            transitionRef.current = null;

            controls.update();

            setTransitioning(false);
        }
    });

    // Handle zoom and reset.
    useEffect(() => {
        const controls = controlsRef.current;

        if (
            !controls ||
            !cameraCommand ||
            transitionRef.current
        ) {
            return;
        }

        if (cameraCommand.type === "reset") {
            startTransition(settings.presets[mode]);
            return;
        }

        if (mode !== "product") return;

        const direction = camera.position
            .clone()
            .sub(controls.target);

        const factor =
            cameraCommand.type === "zoomIn"
                ? 0.8
                : 1.25;

        const distance = THREE.MathUtils.clamp(
            direction.length() * factor,
            settings.minDistance,
            settings.maxDistance
        );

        direction.setLength(distance);

        camera.position
            .copy(controls.target)
            .add(direction);

        controls.update();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cameraCommand]);

    return (
        <OrbitControls
            ref={controlsRef}
            makeDefault

            target={settings.presets.showroom.target}

            enabled={
                mode === "product" &&
                !isTransitioning
            }

            enableRotate={mode === "product"}
            enableZoom={mode === "product"}
            enablePan={false}

            enableDamping
            dampingFactor={0.07}

            rotateSpeed={0.7}
            zoomSpeed={0.8}

            minDistance={settings.minDistance}

            maxDistance={
                mode === "showroom" || isTransitioning
                    ? 4.4
                    : settings.maxDistance
            }

            minPolarAngle={settings.minPolarAngle}
            maxPolarAngle={settings.maxPolarAngle}

            autoRotate={
                mode === "product" &&
                autoRotate &&
                !isTransitioning
            }

            autoRotateSpeed={settings.autoRotateSpeed}
        />
    );
}
