import Link from "next/link";

import { APP_CONFIG } from "@/config/appConfig";

export default function Header({ children }) {
    return (
        <header
            className="
                absolute inset-x-0 top-0 z-30
                flex items-center justify-between
                gap-4 px-5 py-5 md:px-12
            "
        >
            <Link
                href={APP_CONFIG.routes.home}
                className="flex items-center gap-5"
            >
                <span
                    className="
                        text-3xl font-black
                        tracking-wider text-primary
                    "
                >
                    {APP_CONFIG.brand}
                </span>

                <span
                    className="
                        hidden h-8 w-px
                        bg-gray-300 md:block
                    "
                />

                <span
                    className="
                        hidden text-xs font-medium
                        tracking-wide text-gray-600
                        md:block
                    "
                >
                    {APP_CONFIG.name}
                </span>
            </Link>

            <div className="flex items-center gap-3">
                {children}
            </div>
        </header>
    );
}