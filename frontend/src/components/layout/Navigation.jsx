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
                rounded-full border border-gray-200
                bg-white/90 p-1 shadow-sm
                backdrop-blur-md
            "
        >
            {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        aria-current={
                            isActive ? "page" : undefined
                        }
                        className={`
                            flex items-center gap-2
                            rounded-full px-3 py-2
                            text-xs font-medium
                            transition-colors
                            md:px-4
                            ${isActive
                                ? "bg-primary text-white"
                                : "text-gray-600 hover:bg-gray-100"
                            }
                        `}
                    >
                        <Icon size={16} />

                        <span>{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}