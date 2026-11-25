"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";

import { SHOWROOM_CONFIG } from "@/config/showroomConfig";
import { useShowroomStore } from "@/stores/useShowroomStore";
import { useConfigurationStore } from "@/stores/useConfigurationStore";

const settings = SHOWROOM_CONFIG.camera;

function getShowroomPreset(width) {
    return width < 768
        ? settings.presets.showroomMobile
        : settings.presets.showroom;
}

function getProductPreset(width, assemblySize, isSummaryOpen = false) {
    const isMobile = width < 768;
    const base = isMobile
        ? settings.presets.productMobile
        : isSummaryOpen
            ? settings.presets.productSummary
            : settings.presets.product;

    const [w = 0.59, h = 0.81, d = 0.64] = assemblySize || [];
    const span = Math.max(w * 0.92, h * 1.12, d * 0.95, 0.85);
    const extraScale = Math.max(0, (span - 0.9) * 1.35);

    const posOffset = extraScale * 1.15;
    const targetY = base.target[1] + Math.max(0, (h - 0.81) * 0.4);

    return {
        position: [
            base.position[0] + posOffset * 0.38,
            base.position[1] + posOffset * 0.32,
            base.position[2] + posOffset,
        ],
        target: [0, targetY, 0],
        viewOffset: base.viewOffset || [0, 0],
    };
}

export default function CameraControls() {
    const controlsRef = useRef(null);
    const activeTweenRef = useRef(null);
    const hasMountedRef = useRef(false);
    const lastCommandTsRef = useRef(null);
    const lastFramedKeyRef = useRef("");
    const lastViewRef = useRef({ w: 0, h: 0, ox: 0, oy: 0 });

    const { size } = useThree();
    const isMobile = size.width < 768;
    const viewportWidthRef = useRef(size.width);

    useEffect(() => {
        viewportWidthRef.current = size.width;
    }, [size.width]);

    const initialPreset = getShowroomPreset(
        typeof window !== "undefined" ? window.innerWidth : 1280
    );
    const camProxyRef = useRef({
        posX: initialPreset.position[0],
        posY: initialPreset.position[1],
        posZ: initialPreset.position[2],
        targetX: initialPreset.target[0],
        targetY: initialPreset.target[1],
        targetZ: initialPreset.target[2],
        offsetX: initialPreset.viewOffset?.[0] ?? 0,
        offsetY: initialPreset.viewOffset?.[1] ?? 0,
        idleX: 0,
        idleY: 0,
        active: false,
    });

    const mode = useShowroomStore((state) => state.mode);
    const autoRotate = useShowroomStore((state) => state.autoRotate);
    const isTransitioning = useShowroomStore((state) => state.isTransitioning);
    const cameraCommand = useShowroomStore((state) => state.cameraCommand);
    const assemblySize = useShowroomStore((state) => state.assemblySize);
    const setTransitioning = useShowroomStore((state) => state.setTransitioning);

    const isSummaryOpen = useConfigurationStore((state) => state.isSummaryOpen);

    // Initial GSAP camera entrance glide when entering /showroom
    useEffect(() => {
        if (hasMountedRef.current) return;
        hasMountedRef.current = true;

        const targetPreset = getShowroomPreset(viewportWidthRef.current);
        const reducedMotion =
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        const proxy = camProxyRef.current;

        if (reducedMotion) {
            proxy.posX = targetPreset.position[0];
            proxy.posY = targetPreset.position[1];
            proxy.posZ = targetPreset.position[2];
            proxy.targetX = targetPreset.target[0];
            proxy.targetY = targetPreset.target[1];
            proxy.targetZ = targetPreset.target[2];
            proxy.offsetX = targetPreset.viewOffset?.[0] ?? 0;
            proxy.offsetY = targetPreset.viewOffset?.[1] ?? 0;
            proxy.active = true;
            requestAnimationFrame(() => {
                proxy.active = false;
            });
            return;
        }

        const introStart = settings.presets.showroomIntroStart;
        proxy.posX = introStart.position[0];
        proxy.posY = introStart.position[1];
        proxy.posZ = introStart.position[2];
        proxy.targetX = introStart.target[0];
        proxy.targetY = introStart.target[1];
        proxy.targetZ = introStart.target[2];
        proxy.offsetX =
            viewportWidthRef.current < 768
                ? 0
                : introStart.viewOffset?.[0] ?? 0;
        proxy.offsetY =
            viewportWidthRef.current < 768
                ? targetPreset.viewOffset?.[1] ?? 0
                : introStart.viewOffset?.[1] ?? 0;
        proxy.active = true;

        activeTweenRef.current = gsap.to(proxy, {
            posX: targetPreset.position[0],
            posY: targetPreset.position[1],
            posZ: targetPreset.position[2],
            targetX: targetPreset.target[0],
            targetY: targetPreset.target[1],
            targetZ: targetPreset.target[2],
            offsetX: targetPreset.viewOffset?.[0] ?? 0,
            offsetY: targetPreset.viewOffset?.[1] ?? 0,
            duration: 1.35,
            ease: "power3.out",
            onComplete: () => {
                proxy.active = false;
                activeTweenRef.current = null;
            },
        });

        return () => {
            if (activeTweenRef.current) {
                activeTweenRef.current.kill();
                activeTweenRef.current = null;
            }
        };
    }, []);

    // Responsive framing update when resizing in showroom mode
    useEffect(() => {
        if (
            mode !== "showroom" ||
            isTransitioning ||
            activeTweenRef.current?.isActive()
        ) {
            return;
        }

        const preset = isMobile
            ? settings.presets.showroomMobile
            : settings.presets.showroom;
        const proxy = camProxyRef.current;

        proxy.active = true;
        const tween = gsap.to(proxy, {
            posX: preset.position[0],
            posY: preset.position[1],
            posZ: preset.position[2],
            targetX: preset.target[0],
            targetY: preset.target[1],
            targetZ: preset.target[2],
            offsetX: preset.viewOffset?.[0] ?? 0,
            offsetY: preset.viewOffset?.[1] ?? 0,
            duration: 0.6,
            ease: "power2.out",
            onComplete: () => {
                proxy.active = false;
            },
        });

        return () => {
            tween.kill();
        };
    }, [isMobile, mode, isTransitioning]);

    // Handle showroom <-> product mode GSAP camera transitions
    useEffect(() => {
        if (!useShowroomStore.getState().isTransitioning) return;

        const controls = controlsRef.current;
        if (!controls) return;

        if (activeTweenRef.current) {
            activeTweenRef.current.kill();
        }

        const currentAssembly = useShowroomStore.getState().assemblySize;
        const currentSummaryOpen =
            useConfigurationStore.getState().isSummaryOpen;
        const width = viewportWidthRef.current;

        lastFramedKeyRef.current = `${width < 768}-${currentSummaryOpen}-${currentAssembly.join(",")}`;

        const preset =
            mode === "showroom"
                ? getShowroomPreset(width)
                : getProductPreset(width, currentAssembly, currentSummaryOpen);

        const proxy = camProxyRef.current;
        proxy.posX = controls.object.position.x;
        proxy.posY = controls.object.position.y;
        proxy.posZ = controls.object.position.z;
        proxy.targetX = controls.target.x;
        proxy.targetY = controls.target.y;
        proxy.targetZ = controls.target.z;
        proxy.active = true;

        const reducedMotion =
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        activeTweenRef.current = gsap.to(proxy, {
            posX: preset.position[0],
            posY: preset.position[1],
            posZ: preset.position[2],
            targetX: preset.target[0],
            targetY: preset.target[1],
            targetZ: preset.target[2],
            offsetX: preset.viewOffset?.[0] ?? 0,
            offsetY: preset.viewOffset?.[1] ?? 0,
            duration: reducedMotion ? 0.01 : settings.transitionDuration,
            ease: "power2.inOut",
            onComplete: () => {
                proxy.active = false;
                activeTweenRef.current = null;
                setTransitioning(false);
            },
        });
    }, [mode, setTransitioning]);

    // Automatically adjust product camera framing via GSAP when accessories or summary view change
    useEffect(() => {
        if (mode !== "product" || isTransitioning) return;

        const frameKey = `${isMobile}-${isSummaryOpen}-${assemblySize.join(",")}`;
        if (lastFramedKeyRef.current === frameKey) return;
        lastFramedKeyRef.current = frameKey;

        const controls = controlsRef.current;
        if (!controls) return;

        const preset = getProductPreset(
            viewportWidthRef.current,
            assemblySize,
            isSummaryOpen
        );
        const proxy = camProxyRef.current;

        if (activeTweenRef.current) {
            activeTweenRef.current.kill();
        }

        proxy.posX = controls.object.position.x;
        proxy.posY = controls.object.position.y;
        proxy.posZ = controls.object.position.z;
        proxy.targetX = controls.target.x;
        proxy.targetY = controls.target.y;
        proxy.targetZ = controls.target.z;
        proxy.active = true;

        const reducedMotion =
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        activeTweenRef.current = gsap.to(proxy, {
            posX: preset.position[0],
            posY: preset.position[1],
            posZ: preset.position[2],
            targetX: preset.target[0],
            targetY: preset.target[1],
            targetZ: preset.target[2],
            offsetX: preset.viewOffset?.[0] ?? 0,
            offsetY: preset.viewOffset?.[1] ?? 0,
            duration: reducedMotion ? 0.01 : 0.7,
            ease: "power2.out",
            onComplete: () => {
                proxy.active = false;
                activeTweenRef.current = null;
            },
        });
    }, [assemblySize, isMobile, isSummaryOpen, isTransitioning, mode]);

    // Handle zoom and reset commands in product mode once per command timestamp
    useEffect(() => {
        const controls = controlsRef.current;
        if (!controls || !cameraCommand) return;
        if (useShowroomStore.getState().isTransitioning) return;

        const cmdKey = `${cameraCommand.type}-${cameraCommand.timestamp ?? ""}`;
        if (lastCommandTsRef.current === cmdKey) return;
        lastCommandTsRef.current = cmdKey;

        const proxy = camProxyRef.current;
        const reducedMotion =
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (cameraCommand.type === "reset") {
            const currentMode = useShowroomStore.getState().mode;
            const currentAssembly = useShowroomStore.getState().assemblySize;
            const currentSummaryOpen =
                useConfigurationStore.getState().isSummaryOpen;

            const preset =
                currentMode === "showroom"
                    ? getShowroomPreset(viewportWidthRef.current)
                    : getProductPreset(
                        viewportWidthRef.current,
                        currentAssembly,
                        currentSummaryOpen
                    );

            if (activeTweenRef.current) {
                activeTweenRef.current.kill();
            }

            proxy.posX = controls.object.position.x;
            proxy.posY = controls.object.position.y;
            proxy.posZ = controls.object.position.z;
            proxy.targetX = controls.target.x;
            proxy.targetY = controls.target.y;
            proxy.targetZ = controls.target.z;
            proxy.active = true;

            activeTweenRef.current = gsap.to(proxy, {
                posX: preset.position[0],
                posY: preset.position[1],
                posZ: preset.position[2],
                targetX: preset.target[0],
                targetY: preset.target[1],
                targetZ: preset.target[2],
                offsetX: preset.viewOffset?.[0] ?? 0,
                offsetY: preset.viewOffset?.[1] ?? 0,
                duration: reducedMotion ? 0.01 : 0.75,
                ease: "power2.inOut",
                onComplete: () => {
                    proxy.active = false;
                    activeTweenRef.current = null;
                },
            });
            return;
        }

        if (useShowroomStore.getState().mode !== "product") return;

        const direction = controls.object.position
            .clone()
            .sub(controls.target);

        const factor = cameraCommand.type === "zoomIn" ? 0.8 : 1.25;
        const distance = THREE.MathUtils.clamp(
            direction.length() * factor,
            settings.minDistance,
            settings.maxDistance
        );

        direction.setLength(distance);
        const dest = controls.target.clone().add(direction);

        if (activeTweenRef.current) {
            activeTweenRef.current.kill();
        }

        proxy.posX = controls.object.position.x;
        proxy.posY = controls.object.position.y;
        proxy.posZ = controls.object.position.z;
        proxy.targetX = controls.target.x;
        proxy.targetY = controls.target.y;
        proxy.targetZ = controls.target.z;
        proxy.active = true;

        activeTweenRef.current = gsap.to(proxy, {
            posX: dest.x,
            posY: dest.y,
            posZ: dest.z,
            duration: reducedMotion ? 0.01 : 0.45,
            ease: "power2.out",
            onComplete: () => {
                proxy.active = false;
                activeTweenRef.current = null;
            },
        });
    }, [cameraCommand]);

    // Subtle GSAP camera presentation drift in Showroom mode
    useEffect(() => {
        if (mode !== "showroom" || isTransitioning) {
            camProxyRef.current.idleX = 0;
            camProxyRef.current.idleY = 0;
            return;
        }

        const reducedMotion =
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (reducedMotion) return;

        const proxy = camProxyRef.current;
        const tween = gsap.fromTo(
            proxy,
            { idleX: -0.025, idleY: -0.01 },
            {
                idleX: 0.025,
                idleY: 0.01,
                duration: 4.5,
                ease: "sine.inOut",
                yoyo: true,
                repeat: -1,
            }
        );

        return () => {
            tween.kill();
            proxy.idleX = 0;
            proxy.idleY = 0;
        };
    }, [isTransitioning, mode]);

    // Sync GSAP-driven camera position, target, and horizontal/vertical lens shift
    useFrame((state) => {
        const proxy = camProxyRef.current;
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
                ((ox !== 0 || oy !== 0) && (!view || !view.enabled || view.offsetX !== ox || view.offsetY !== oy));

            if (needsUpdate) {
                if (ox === 0 && oy === 0) {
                    state.camera.clearViewOffset();
                } else {
                    state.camera.setViewOffset(width, height, ox, oy, width, height);
                }
                lastViewRef.current = { w: width, h: height, ox, oy };
            }
        }

        if (proxy.active) {
            state.camera.position.set(
                proxy.posX + proxy.idleX,
                proxy.posY + proxy.idleY,
                proxy.posZ
            );

            if (controls) {
                controls.target.set(proxy.targetX, proxy.targetY, proxy.targetZ);
                controls.update();
            } else {
                state.camera.lookAt(proxy.targetX, proxy.targetY, proxy.targetZ);
            }
            return;
        }

        if (mode === "showroom" && !isTransitioning) {
            const basePreset = getShowroomPreset(width);
            state.camera.position.set(
                basePreset.position[0] + proxy.idleX,
                basePreset.position[1] + proxy.idleY,
                basePreset.position[2]
            );
            if (controls) {
                controls.target.set(
                    basePreset.target[0],
                    basePreset.target[1],
                    basePreset.target[2]
                );
                controls.update();
            }
        }
    });

    return (
        <OrbitControls
            ref={controlsRef}
            makeDefault
            target={initialPreset.target}
            enabled={mode === "product" && !isTransitioning}
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
                    ? 5.4
                    : settings.maxDistance
            }
            minPolarAngle={settings.minPolarAngle}
            maxPolarAngle={settings.maxPolarAngle}
            autoRotate={mode === "product" && autoRotate && !isTransitioning}
            autoRotateSpeed={settings.autoRotateSpeed}
        />
    );
}
