"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Box } from "lucide-react";

import { APP_CONFIG } from "@/config/appConfig";

const navigationItems = [
    {
        label: "Home",
        href: APP_CONFIG.routes.home,
        icon: Home,
    },
    {
        label: "Showroom",
        href: APP_CONFIG.routes.showroom,
        icon: Box,
    },
];

export default function Navigation() {
    const pathname = usePathname();

    return (
        <nav
            aria-label="Main navigation"
            className="
                flex items-center gap-1
                rounded-full border border-gray-100
                bg-white p-1.5
                shadow-[0_6px_24px_rgba(15,23,42,0.08)]
            "
        >
            {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        aria-current={isActive ? "page" : undefined}
                        className={`
                            flex items-center gap-2
                            rounded-full px-3.5 py-2
                            text-xs font-medium
                            transition-colors
                            md:px-4
                            ${isActive
                                ? "bg-[#e01920] text-white shadow-sm"
                                : "text-gray-700 hover:bg-gray-100"
                            }
                        `}
                    >
                        <Icon size={15} strokeWidth={2} />
                        <span>{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
