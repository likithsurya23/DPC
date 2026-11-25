"use client";

import {
    X,
    PackageSearch,
    LoaderCircle,
    AlertCircle,
} from "lucide-react";

import ProductCard from "./ProductCard";
import ProductFilter from "./ProductFilter";

import { useProducts } from "@/hooks/useProducts";
import { useProductStore } from "@/stores/useProductStore";
import { useShowroomStore } from "@/stores/useShowroomStore";

export default function ProductList() {
    const {
        products,
        isLoading,
        isError,
        isFallback,
        refetch,
    } = useProducts();

    const {
        isCatalogueOpen,
        searchQuery,
        selectedCategory,
        closeCatalogue,
        resetFilters,
    } = useProductStore();

    const selectedProduct = useShowroomStore(
        (state) => state.selectedProduct
    );

    const enterProduct = useShowroomStore(
        (state) => state.enterProduct
    );

    const isTransitioning = useShowroomStore(
        (state) => state.isTransitioning
    );

    const categories = [
        ...new Set(
            products.map((product) =>
                product.category
            )
        ),
    ].filter(Boolean);

    const query = searchQuery
        .trim()
        .toLowerCase();

    const filteredProducts = products.filter(
        (product) => {
            const matchesSearch =
                `${product.name} ${product.category}`
                    .toLowerCase()
                    .includes(query);

            const matchesCategory =
                selectedCategory === "All" ||
                product.category === selectedCategory;

            return (
                matchesSearch &&
                matchesCategory
            );
        }
    );

    function handleProductSelect(product) {
        if (isTransitioning) return;

        enterProduct(product.id);
        closeCatalogue();
    }

    if (!isCatalogueOpen) {
        return null;
    }

    return (
        <aside
            aria-label="Product catalogue"
            className="
                pointer-events-auto absolute
                bottom-5 left-5 top-24 z-40
                flex w-[calc(100%-2.5rem)]
                flex-col overflow-hidden
                rounded-2xl border border-gray-200
                bg-white/95 shadow-xl
                backdrop-blur-xl sm:w-[350px]
            "
        >
            {/* Panel header */}
            <div
                className="
                    flex items-center
                    justify-between border-b
                    border-gray-100 p-5
                "
            >
                <div>
                    <h2
                        className="
                            text-lg font-semibold
                            text-gray-900
                        "
                    >
                        Product Catalogue
                    </h2>

                    <p className="mt-1 text-xs text-gray-500">
                        Explore available products
                    </p>
                </div>

                <button
                    type="button"
                    aria-label="Close catalogue"
                    onClick={closeCatalogue}
                    className="
                        rounded-lg p-2
                        text-gray-500
                        hover:bg-gray-100
                    "
                >
                    <X size={20} />
                </button>
            </div>

            {/* Search and filters */}
            <div className="border-b border-gray-100 p-4">
                <ProductFilter
                    categories={categories}
                />
            </div>

            {/* Product list */}
            <div
                className="
                    min-h-0 flex-1
                    space-y-3 overflow-y-auto p-4
                "
            >
                {isLoading ? (
                    <div
                        role="status"
                        className="
                            flex flex-col
                            items-center py-16
                        "
                    >
                        <LoaderCircle
                            size={30}
                            className="
                                animate-spin
                                text-primary
                            "
                        />

                        <p className="mt-4 text-sm text-gray-500">
                            Loading products...
                        </p>
                    </div>
                ) : (
                    <>
                        {/* API warning */}
                        {isError && (
                            <div
                                role="alert"
                                className="
                                    rounded-lg border
                                    border-amber-200
                                    bg-amber-50 p-3
                                "
                            >
                                <div
                                    className="
                                        flex items-start
                                        gap-2 text-amber-700
                                    "
                                >
                                    <AlertCircle
                                        size={17}
                                        className="shrink-0"
                                    />

                                    <p className="text-xs">
                                        {isFallback
                                            ? "Backend catalogue unavailable. Showing the development product."
                                            : "Could not refresh the catalogue. Showing cached products."}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => refetch()}
                                    className="
                                        mt-2 text-xs
                                        font-semibold
                                        text-amber-800
                                    "
                                >
                                    Retry
                                </button>
                            </div>
                        )}

                        {/* Empty state */}
                        {filteredProducts.length === 0 ? (
                            <div
                                className="
                                    flex flex-col
                                    items-center py-12
                                    text-center
                                "
                            >
                                <PackageSearch
                                    size={42}
                                    strokeWidth={1.3}
                                    className="text-gray-400"
                                />

                                <h3
                                    className="
                                        mt-4 text-sm
                                        font-semibold
                                    "
                                >
                                    No products found
                                </h3>

                                <p
                                    className="
                                        mt-2 text-xs
                                        text-gray-500
                                    "
                                >
                                    Try a different search
                                    or category.
                                </p>

                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="
                                        mt-4 text-xs
                                        font-semibold
                                        text-primary
                                    "
                                >
                                    Reset Filters
                                </button>
                            </div>
                        ) : (
                            filteredProducts.map(
                                (product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        disabled={isTransitioning}
                                        isSelected={
                                            selectedProduct ===
                                            product.id
                                        }
                                        onSelect={
                                            handleProductSelect
                                        }
                                    />
                                )
                            )
                        )}
                    </>
                )}
            </div>

            {/* Product count */}
            <div
                className="
                    border-t border-gray-100
                    px-5 py-4
                    text-xs text-gray-500
                "
            >
                {filteredProducts.length} of{" "}
                {products.length} products
            </div>
        </aside>
    );
}