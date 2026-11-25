import { apiRequest } from "./api";
import { getAssetURL } from "@/config/apiConfig";

export async function prepareAR(productId, accessoryIds = []) {
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

    return response.data;
}

export async function getARConfiguration(
    configurationId,
    { signal } = {}
) {
    const response = await apiRequest(
        `/ar/${encodeURIComponent(configurationId)}`,
        { signal }
    );

    const configuration = response.data;

    return {
        ...configuration,

        modelURL: getAssetURL(
            configuration.modelURL
        ),

        iosURL: configuration.iosURL
            ? getAssetURL(configuration.iosURL)
            : null,
    };
}