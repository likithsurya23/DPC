"use cache";

import { APP_CONFIG } from "@/config/appConfig";

export default async function Footer() {
    return (
        <footer
            className="
                absolute inset-x-0 bottom-0 z-20
                flex flex-wrap items-center
                justify-between gap-3
                px-5 py-5 md:px-12
            "
        >
            <p className="text-xs text-gray-500">
                &copy; {new Date().getFullYear()}{" "}
                {APP_CONFIG.brand}
            </p>

            <p
                className="
                    text-[10px] uppercase
                    tracking-[0.2em]
                    text-gray-500
                "
            >
                Digital Product Experience
            </p>
        </footer>
    );
}