import {
    APP_CONFIG,
    isLoopbackUrl,
    resolveApiBaseUrl,
    resolveAppUrl,
    resolveAssetBaseUrl,
} from "./appConfig";

export const API_CONFIG = {
    get baseURL() {
        return resolveApiBaseUrl();
    },
    get assetURL() {
        return resolveAssetBaseUrl();
    },
    get appURL() {
        return resolveAppUrl();
    },
    timeout: APP_CONFIG.api.timeout,
};

function getRuntimeOrigin() {
    if (typeof window !== "undefined") {
        return window.location.origin;
    }
    return "";
}

export function getAssetURL(path) {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) {
        return path;
    }
    const base = API_CONFIG.assetURL || getRuntimeOrigin();
    return base ? new URL(path, base).toString() : path;
}

export function getARPageURL(configurationId) {
    const arPath = `${APP_CONFIG.routes.ar}/${encodeURIComponent(configurationId)}`;
    // Always prefer configured NEXT_PUBLIC_APP_URL (e.g., public HTTPS tunnel URL) over localhost origin
    const base = API_CONFIG.appURL || getRuntimeOrigin();
    return base ? new URL(arPath, base).toString() : arPath;
}

export function isLoopbackURL(url) {
    return isLoopbackUrl(url);
}
