"use client";

import { useConfiguration } from "@/hooks/useConfiguration";

export default function ProductDetails({ product }) {
    const { accessoryCount } = useConfiguration(product.id);

    return (
        <div className="flex flex-col items-start gap-2">
            <p
                className="
                    text-[10px] font-semibold
                    uppercase tracking-[0.2em]
                    text-primary
                "
            >
                {product.category}
            </p>

            <h1
                className="
                    text-2xl font-semibold
                    tracking-tight text-gray-900
                    md:text-4xl
                "
            >
                {product.name}
            </h1>

            <p className="text-xs text-gray-500">
                {accessoryCount === 0
                    ? "Base Configuration"
                    : `${accessoryCount} Accessories Selected`}
            </p>
        </div>
    );
}