import { apiRequest } from "./api";
import { getAssetURL } from "@/config/apiConfig";

export async function prepareAR(productId, accessoryIds = []) {
    try {
        const response = await apiRequest("/ar/prepare", {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify({
                productId,
                accessoryIds,
            }),
        });

        if (!response?.data?.configurationId) {
            throw new Error("Backend returned an invalid AR configuration.");
        }

        return response.data;
    } catch (error) {
        console.error("[AR] Failed to prepare AR configuration:", {
            productId,
            accessoryIds,
            status: error?.status ?? null,
            message: error?.message ?? String(error),
        });
        throw error;
    }
}

export async function getARConfiguration(
    configurationId,
    { signal } = {}
) {
    if (!configurationId) {
        throw new Error("Missing AR configuration ID.");
    }

    try {
        const response = await apiRequest(
            `/ar/${encodeURIComponent(configurationId)}`,
            { signal }
        );

        const configuration = response?.data;

        if (!configuration?.modelURL) {
            throw new Error("AR configuration is missing a 3D model URL.");
        }

        return {
            ...configuration,

            modelURL: getAssetURL(
                configuration.modelURL
            ),

            iosURL: configuration.iosURL
                ? getAssetURL(configuration.iosURL)
                : null,
        };
    } catch (error) {
        if (error?.name !== "AbortError") {
            console.error("[AR] Failed to retrieve AR configuration:", {
                configurationId,
                status: error?.status ?? null,
                message: error?.message ?? String(error),
            });
        }
        throw error;
    }
}