"use client";

import ShowroomCanvas from "./ShowroomCanvas";
import ShowroomOverlay from "./ShowroomOverlay";

export default function Showroom() {
    return (
        <main
            className="
                relative h-dvh w-full
                overflow-hidden bg-[#edf0f3]
            "
        >
            <div className="absolute inset-0">
                <ShowroomCanvas />
            </div>

            <ShowroomOverlay />
        </main>
    );
}