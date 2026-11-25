"use client";

import { Search, X } from "lucide-react";

import { useProductStore } from "@/stores/useProductStore";

export default function ProductFilter({
    categories = [],
}) {
    const {
        searchQuery,
        selectedCategory,
        setSearchQuery,
        setSelectedCategory,
    } = useProductStore();

    const categoryList = [
        "All",
        ...categories,
    ];

    return (
        <div className="space-y-4">
            {/* Search field */}
            <div className="relative">
                <Search
                    size={17}
                    className="
                        absolute left-3 top-1/2
                        -translate-y-1/2
                        text-gray-400
                    "
                />

                <input
                    type="search"
                    aria-label="Search products"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(event) =>
                        setSearchQuery(
                            event.target.value
                        )
                    }
                    className="
                        w-full rounded-lg
                        border border-gray-200
                        bg-gray-50 py-3
                        pl-10 pr-10 text-sm
                        outline-none
                        focus:border-primary
                    "
                />

                {searchQuery && (
                    <button
                        type="button"
                        aria-label="Clear search"
                        onClick={() =>
                            setSearchQuery("")
                        }
                        className="
                            absolute right-3 top-1/2
                            -translate-y-1/2
                            text-gray-400
                        "
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Category filters */}
            <div className="flex flex-wrap gap-2">
                {categoryList.map((category) => (
                    <button
                        key={category}
                        type="button"
                        onClick={() =>
                            setSelectedCategory(
                                category
                            )
                        }
                        aria-pressed={
                            selectedCategory ===
                            category
                        }
                        className={`
                            rounded-full px-3 py-2
                            text-xs font-medium
                            transition-colors
                            ${selectedCategory ===
                                category
                                ? "bg-primary text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }
                        `}
                    >
                        {category}
                    </button>
                ))}
            </div>
        </div>
    );
}