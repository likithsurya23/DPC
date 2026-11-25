"use client";

import { useQuery } from "@tanstack/react-query";

import { getProducts } from "@/services/productService";
import { SHOWROOM_CONFIG } from "@/config/showroomConfig";

export function useProducts() {
    const query = useQuery({
        queryKey: ["products"],

        queryFn: ({ signal }) =>
            getProducts({ signal }),

        staleTime: 5 * 60 * 1000,

        retry: 1,
    });

    const isFallback =
        query.isError && !query.data;

    const products =
        query.data ??
        (isFallback
            ? [SHOWROOM_CONFIG.product]
            : []);

    return {
        products,

        isLoading: query.isPending,

        isError: query.isError,

        isFallback,

        error: query.error,

        refetch: query.refetch,
    };
}