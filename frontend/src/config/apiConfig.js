import { APP_CONFIG } from "./appConfig";

export const API_CONFIG = {
    baseURL: APP_CONFIG.api.baseUrl,

    assetURL: APP_CONFIG.api.assetUrl,

    appURL:
        process.env.NEXT_PUBLIC_APP_URL ||
        "http://localhost:3000",

    timeout: 15000,
};

export function getAssetURL(path) {
    return new URL(path, API_CONFIG.assetURL).toString();
}

export function getARPageURL(configurationId) {
    return new URL(
        `/ar/${encodeURIComponent(configurationId)}`,
        API_CONFIG.appURL
    ).toString();
}