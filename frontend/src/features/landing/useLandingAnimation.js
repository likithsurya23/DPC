"use client";

import { useCallback, useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

import { LANDING_SCENE_CONFIG } from "./landingConfig";

gsap.registerPlugin(useGSAP);

const BASE_ROT_Y = LANDING_SCENE_CONFIG.printer.baseRotationY;

export function useLandingAnimation({
    containerRef,
    layoutConfig,
    reducedMotion,
    onNavigateShowroom,
}) {
    const sceneNodesRef = useRef({});

    const cameraStateRef = useRef({
        posX: layoutConfig.cameraPosition[0],
        posY: layoutConfig.cameraPosition[1],
        posZ: layoutConfig.cameraPosition[2],
        targetX: layoutConfig.cameraTarget[0],
        targetY: layoutConfig.cameraTarget[1],
        targetZ: layoutConfig.cameraTarget[2],
        idleX: 0,
        idleY: 0,
        parallaxX: 0,
        parallaxY: 0,
    });

    const sceneAnimRef = useRef({
        ceilingLed: 2.6,
        sideLed: 2.4,
        archLed: 2.2,
        flutedLed: 0.85,
        podiumLed: 2.35,
        podiumRim: 1.65,
        podiumScale: 1,
        ambientLight: 0.48,
        hemiLight: 0.85,
        keyLight: 1.95,
        redCeilingLight: 2.4,
        podiumAccentLight: 1.35,
        printerRotY: BASE_ROT_Y,
    });

    const isNavigatingRef = useRef(false);
    const continuousTweensRef = useRef([]);
    const parallaxXToRef = useRef(null);
    const parallaxYToRef = useRef(null);
    const entrancePlayedRef = useRef(false);

    const registerSceneNodes = useCallback((entries) => {
        Object.entries(entries).forEach(([key, value]) => {
            if (value) {
                sceneNodesRef.current[key] = value;
            } else {
                delete sceneNodesRef.current[key];
            }
        });
    }, []);

    const getCameraState = useCallback(() => cameraStateRef.current, []);
    const getSceneAnimState = useCallback(() => sceneAnimRef.current, []);
    const getSceneNodes = useCallback(() => sceneNodesRef.current, []);

    // Sync layout changes when viewport switches between desktop / tablet / mobile
    useEffect(() => {
        if (!entrancePlayedRef.current || isNavigatingRef.current) return;

        const state = cameraStateRef.current;
        if (reducedMotion) {
            state.posX = layoutConfig.cameraPosition[0];
            state.posY = layoutConfig.cameraPosition[1];
            state.posZ = layoutConfig.cameraPosition[2];
            state.targetX = layoutConfig.cameraTarget[0];
            state.targetY = layoutConfig.cameraTarget[1];
            state.targetZ = layoutConfig.cameraTarget[2];
            return;
        }

        gsap.to(state, {
            posX: layoutConfig.cameraPosition[0],
            posY: layoutConfig.cameraPosition[1],
            posZ: layoutConfig.cameraPosition[2],
            targetX: layoutConfig.cameraTarget[0],
            targetY: layoutConfig.cameraTarget[1],
            targetZ: layoutConfig.cameraTarget[2],
            duration: 0.65,
            ease: "power2.out",
            overwrite: "auto",
        });
    }, [layoutConfig, reducedMotion]);

    const startContinuousAnimations = useCallback(() => {
        if (reducedMotion || isNavigatingRef.current) return;

        continuousTweensRef.current.forEach((t) => t.kill());
        continuousTweensRef.current = [];

        const anim = sceneAnimRef.current;

        continuousTweensRef.current.push(
            gsap.fromTo(
                anim,
                { printerRotY: BASE_ROT_Y - 0.08 },
                {
                    printerRotY: BASE_ROT_Y + 0.1,
                    duration: 5.8,
                    ease: "sine.inOut",
                    yoyo: true,
                    repeat: -1,
                }
            ),
            gsap.to(cameraStateRef.current, {
                idleX: 0.045,
                idleY: 0.025,
                duration: 4.8,
                ease: "sine.inOut",
                yoyo: true,
                repeat: -1,
            }),
            gsap.to(anim, {
                podiumLed: 3.1,
                podiumAccentLight: 1.85,
                duration: 2.6,
                ease: "sine.inOut",
                yoyo: true,
                repeat: -1,
            }),
            gsap.to(anim, {
                redCeilingLight: 2.95,
                ceilingLed: 3.0,
                duration: 3.8,
                ease: "sine.inOut",
                yoyo: true,
                repeat: -1,
            })
        );
    }, [reducedMotion]);

    useGSAP(
        () => {
            const state = cameraStateRef.current;
            const anim = sceneAnimRef.current;

            parallaxXToRef.current = gsap.quickTo(state, "parallaxX", {
                duration: 0.75,
                ease: "power3.out",
            });
            parallaxYToRef.current = gsap.quickTo(state, "parallaxY", {
                duration: 0.75,
                ease: "power3.out",
            });

            if (reducedMotion) {
                entrancePlayedRef.current = true;
                gsap.set("[data-anim='veil']", { autoAlpha: 0 });
                gsap.set(
                    [
                        "[data-anim='brand']",
                        "[data-anim='heading-top']",
                        "[data-anim='heading-main']",
                        "[data-anim='tagline']",
                        "[data-anim='cta']",
                    ],
                    {
                        autoAlpha: 1,
                        y: 0,
                        scale: 1,
                        clipPath: "inset(0% 0% 0% 0%)",
                    }
                );
                Object.assign(anim, {
                    ceilingLed: 2.6,
                    sideLed: 2.4,
                    archLed: 2.2,
                    flutedLed: 0.85,
                    podiumLed: 2.35,
                    podiumRim: 1.65,
                    podiumScale: 1,
                    ambientLight: 0.48,
                    hemiLight: 0.85,
                    keyLight: 1.95,
                    redCeilingLight: 2.4,
                    podiumAccentLight: 1.35,
                    printerRotY: BASE_ROT_Y,
                });
                state.posX = layoutConfig.cameraPosition[0];
                state.posY = layoutConfig.cameraPosition[1];
                state.posZ = layoutConfig.cameraPosition[2];
                state.targetX = layoutConfig.cameraTarget[0];
                state.targetY = layoutConfig.cameraTarget[1];
                state.targetZ = layoutConfig.cameraTarget[2];
                return;
            }

            state.posX = layoutConfig.introStartPosition[0];
            state.posY = layoutConfig.introStartPosition[1];
            state.posZ = layoutConfig.introStartPosition[2];
            state.targetX = layoutConfig.introStartTarget[0];
            state.targetY = layoutConfig.introStartTarget[1];
            state.targetZ = layoutConfig.introStartTarget[2];

            Object.assign(anim, {
                ceilingLed: 0,
                sideLed: 0,
                archLed: 0,
                flutedLed: 0.1,
                podiumLed: 0,
                podiumRim: 0,
                podiumScale: 0.94,
                ambientLight: 0.15,
                hemiLight: 0.2,
                keyLight: 0.4,
                redCeilingLight: 0.2,
                podiumAccentLight: 0,
                printerRotY: BASE_ROT_Y - 0.34,
            });

            gsap.set("[data-anim='brand']", { autoAlpha: 0, y: 14 });
            gsap.set("[data-anim='heading-top']", { autoAlpha: 0, y: 26 });
            gsap.set("[data-anim='heading-main']", {
                autoAlpha: 0,
                y: 28,
                clipPath: "inset(0% 0% 100% 0%)",
            });
            gsap.set("[data-anim='tagline']", { autoAlpha: 0, y: 14 });
            gsap.set("[data-anim='cta']", { autoAlpha: 0, y: 16, scale: 0.94 });

            const tl = gsap.timeline({
                onComplete: () => {
                    entrancePlayedRef.current = true;
                    startContinuousAnimations();
                },
            });

            // 1. Gradually reveal the showroom environment
            tl.to(
                "[data-anim='veil']",
                {
                    autoAlpha: 0,
                    duration: 0.85,
                    ease: "power2.out",
                },
                0
            ).to(
                anim,
                {
                    ambientLight: 0.48,
                    hemiLight: 0.85,
                    keyLight: 1.95,
                    duration: 0.95,
                    ease: "power2.out",
                },
                0
            );

            // 2. Illuminate the ceiling LED strips and side panels
            tl.to(
                anim,
                {
                    ceilingLed: 2.6,
                    sideLed: 2.4,
                    flutedLed: 0.85,
                    archLed: 2.2,
                    redCeilingLight: 2.4,
                    duration: 0.8,
                    ease: "power2.inOut",
                },
                0.22
            );

            // 3. Reveal the circular podium with a smooth lighting effect
            tl.to(
                anim,
                {
                    podiumScale: 1,
                    podiumLed: 2.35,
                    podiumRim: 1.65,
                    podiumAccentLight: 1.35,
                    duration: 0.85,
                    ease: "power3.out",
                },
                0.42
            );

            // 4. Smoothly introduce the printer with a cinematic camera movement
            tl.to(
                state,
                {
                    posX: layoutConfig.cameraPosition[0],
                    posY: layoutConfig.cameraPosition[1],
                    posZ: layoutConfig.cameraPosition[2],
                    targetX: layoutConfig.cameraTarget[0],
                    targetY: layoutConfig.cameraTarget[1],
                    targetZ: layoutConfig.cameraTarget[2],
                    duration: 1.45,
                    ease: "power3.out",
                },
                0.3
            ).to(
                anim,
                {
                    printerRotY: BASE_ROT_Y - 0.08,
                    duration: 1.4,
                    ease: "power3.out",
                },
                0.35
            );

            // 5. Fade in the Asia Business Solutions branding
            tl.to(
                "[data-anim='brand']",
                {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.6,
                    ease: "power3.out",
                },
                0.95
            );

            // 6. Reveal SHARP SMART with a smooth upward animation
            tl.to(
                "[data-anim='heading-top']",
                {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.65,
                    ease: "power3.out",
                },
                1.14
            );

            // 7. Reveal SOLUTIONS with a masked upward animation
            tl.to(
                "[data-anim='heading-main']",
                {
                    autoAlpha: 1,
                    y: 0,
                    clipPath: "inset(0% 0% 0% 0%)",
                    duration: 0.72,
                    ease: "power3.out",
                },
                1.32
            );

            // 8. Fade in the MFP tagline
            tl.to(
                "[data-anim='tagline']",
                {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.6,
                    ease: "power2.out",
                },
                1.62
            );

            // 9. Reveal the Explore Virtual Showroom button
            tl.to(
                "[data-anim='cta']",
                {
                    autoAlpha: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.65,
                    ease: "power3.out",
                },
                1.86
            );

            return () => {
                tl.kill();
                continuousTweensRef.current.forEach((t) => t.kill());
                continuousTweensRef.current = [];
            };
        },
        { scope: containerRef, dependencies: [reducedMotion] }
    );

    const handlePrinterLoaded = useCallback(() => {
        // Animation values in sceneAnimRef are synced continuously in frame loop
    }, []);

    const handlePointerMove = useCallback(
        (event) => {
            if (reducedMotion || isNavigatingRef.current) return;
            if (!parallaxXToRef.current || !parallaxYToRef.current) return;

            const rect = containerRef.current?.getBoundingClientRect();
            if (!rect || rect.width === 0 || rect.height === 0) return;

            const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            const ny = -(((event.clientY - rect.top) / rect.height) * 2 - 1);

            parallaxXToRef.current(nx * layoutConfig.parallax.x);
            parallaxYToRef.current(ny * layoutConfig.parallax.y);
        },
        [containerRef, layoutConfig.parallax.x, layoutConfig.parallax.y, reducedMotion]
    );

    const handlePointerLeave = useCallback(() => {
        if (reducedMotion || isNavigatingRef.current) return;
        if (parallaxXToRef.current) parallaxXToRef.current(0);
        if (parallaxYToRef.current) parallaxYToRef.current(0);
    }, [reducedMotion]);

    const handleCtaMouseEnter = useCallback(() => {
        if (reducedMotion || isNavigatingRef.current || !containerRef.current) return;

        const cta = containerRef.current.querySelector("[data-anim='cta']");
        const arrow = containerRef.current.querySelector("[data-anim='cta-arrow']");

        if (cta) {
            gsap.to(cta, {
                scale: 1.045,
                boxShadow:
                    "0 18px 38px -6px rgba(208, 12, 19, 0.65), 0 6px 16px rgba(0, 0, 0, 0.18)",
                duration: 0.32,
                ease: "power2.out",
                overwrite: "auto",
            });
        }

        if (arrow) {
            gsap.to(arrow, {
                x: 5,
                duration: 0.32,
                ease: "power2.out",
                overwrite: "auto",
            });
        }
    }, [containerRef, reducedMotion]);

    const handleCtaMouseLeave = useCallback(() => {
        if (reducedMotion || isNavigatingRef.current || !containerRef.current) return;

        const cta = containerRef.current.querySelector("[data-anim='cta']");
        const arrow = containerRef.current.querySelector("[data-anim='cta-arrow']");

        if (cta) {
            gsap.to(cta, {
                scale: 1,
                boxShadow:
                    "0 12px 28px -6px rgba(201, 13, 20, 0.52), 0 4px 10px rgba(0, 0, 0, 0.14)",
                duration: 0.32,
                ease: "power2.out",
                overwrite: "auto",
            });
        }

        if (arrow) {
            gsap.to(arrow, {
                x: 0,
                duration: 0.32,
                ease: "power2.out",
                overwrite: "auto",
            });
        }
    }, [containerRef, reducedMotion]);

    const handleCtaClick = useCallback(() => {
        if (isNavigatingRef.current) return;
        isNavigatingRef.current = true;

        continuousTweensRef.current.forEach((t) => t.kill());
        continuousTweensRef.current = [];

        if (reducedMotion) {
            onNavigateShowroom();
            return;
        }

        const exitTl = gsap.timeline({
            onComplete: () => {
                onNavigateShowroom();
            },
        });

        exitTl.to(
            cameraStateRef.current,
            {
                posX: layoutConfig.pushInPosition[0],
                posY: layoutConfig.pushInPosition[1],
                posZ: layoutConfig.pushInPosition[2],
                targetX: layoutConfig.pushInTarget[0],
                targetY: layoutConfig.pushInTarget[1],
                targetZ: layoutConfig.pushInTarget[2],
                idleX: 0,
                idleY: 0,
                parallaxX: 0,
                parallaxY: 0,
                duration: 0.72,
                ease: "power2.inOut",
            },
            0
        );

        if (containerRef.current) {
            const content = containerRef.current.querySelector("[data-anim='content']");
            const veil = containerRef.current.querySelector("[data-anim='veil']");

            if (content) {
                exitTl.to(
                    content,
                    {
                        autoAlpha: 0,
                        y: -14,
                        duration: 0.45,
                        ease: "power2.in",
                    },
                    0
                );
            }

            if (veil) {
                exitTl.to(
                    veil,
                    {
                        autoAlpha: 1,
                        duration: 0.42,
                        ease: "power2.in",
                    },
                    0.3
                );
            }
        }
    }, [containerRef, layoutConfig, onNavigateShowroom, reducedMotion]);

    return {
        getCameraState,
        getSceneAnimState,
        getSceneNodes,
        registerSceneNodes,
        handlePrinterLoaded,
        handlePointerMove,
        handlePointerLeave,
        handleCtaMouseEnter,
        handleCtaMouseLeave,
        handleCtaClick,
    };
}
