"use client";

import {
    Printer,
    ArrowRight,
    CheckCircle2,
} from "lucide-react";

export default function ProductCard({
    product,
    isSelected = false,
    disabled = false,
    onSelect,
}) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={() => onSelect(product)}
            className={`
                flex w-full items-center
                gap-4 rounded-xl border
                p-3 text-left transition-colors
                disabled:opacity-50
                ${isSelected
                    ? "border-primary bg-red-50"
                    : "border-gray-200 bg-white hover:border-primary"
                }
            `}
        >
            {/* Product preview */}
            <div
                className="
                    flex h-20 w-20 shrink-0
                    items-center justify-center
                    overflow-hidden rounded-lg
                    bg-gray-100
                "
            >
                <Printer
                    size={36}
                    strokeWidth={1.2}
                    className="text-gray-500"
                />
            </div>

            {/* Product information */}
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <h3
                        className="
                            text-sm font-semibold
                            text-gray-900
                        "
                    >
                        {product.name}
                    </h3>

                    {isSelected && (
                        <CheckCircle2
                            size={15}
                            className="shrink-0 text-primary"
                        />
                    )}
                </div>

                <p className="mt-1 text-xs text-gray-500">
                    {product.category}
                </p>

                <span
                    className="
                        mt-3 inline-flex items-center
                        gap-2 text-xs font-semibold
                        text-primary
                    "
                >
                    {isSelected
                        ? "Selected Product"
                        : "Explore Product"}

                    <ArrowRight size={14} />
                </span>
            </div>
        </button>
    );
}