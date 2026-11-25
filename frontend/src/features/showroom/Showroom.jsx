"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

import ShowroomCanvas from "./ShowroomCanvas";
import ShowroomOverlay from "./ShowroomOverlay";

gsap.registerPlugin(useGSAP);

export default function Showroom({ fontClassName = "" }) {
    const containerRef = useRef(null);

    useGSAP(
        () => {
            const reducedMotion =
                typeof window !== "undefined" &&
                window.matchMedia("(prefers-reduced-motion: reduce)").matches;

            if (reducedMotion) {
                gsap.set("[data-showroom-veil]", { autoAlpha: 0 });
                return;
            }

            gsap.fromTo(
                "[data-showroom-veil]",
                { autoAlpha: 1 },
                {
                    autoAlpha: 0,
                    duration: 0.6,
                    ease: "power2.out",
                }
            );
        },
        { scope: containerRef }
    );

    return (
        <main
            ref={containerRef}
            className={`
                relative h-dvh w-full
                overflow-hidden bg-[#f3f4f6]
                ${fontClassName}
            `}
        >
            <div className="absolute inset-0">
                <ShowroomCanvas />
            </div>

            <ShowroomOverlay />

            <div
                data-showroom-veil
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-40 bg-[#f3f4f6]"
            />
        </main>
    );
}
