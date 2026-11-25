function trimEnv(value) {
    return typeof value === "string" ? value.trim() : "";
}

export function isLoopbackUrl(url) {
    if (!url) {
        return false;
    }

    try {
        const fallbackOrigin =
            typeof window !== "undefined"
                ? window.location.origin
                : "http://localhost";
        const { hostname } = new URL(url, fallbackOrigin);
        return (
            hostname === "localhost" ||
            hostname === "127.0.0.1" ||
            hostname === "::1" ||
            hostname === "[::1]"
        );
    } catch {
        return false;
    }
}

function resolveBrowserOrigin(fallbackPort) {
    if (typeof window === "undefined") {
        return "";
    }

    if (!fallbackPort || !isLoopbackUrl(window.location.origin)) {
        return window.location.origin;
    }

    return `${window.location.protocol}//${window.location.hostname}:${fallbackPort}`;
}

function preferTunnelOriginOverLoopback(configuredUrl) {
    if (
        typeof window !== "undefined" &&
        isLoopbackUrl(configuredUrl) &&
        !isLoopbackUrl(window.location.origin)
    ) {
        return window.location.origin;
    }

    return configuredUrl;
}

export function resolveApiBaseUrl() {
    const explicitBase = trimEnv(process.env.NEXT_PUBLIC_API_BASE_URL);
    if (explicitBase) {
        const resolved = preferTunnelOriginOverLoopback(explicitBase);
        const cleanBase = resolved.replace(/\/+$/, "");
        return resolved === explicitBase
            ? cleanBase
            : `${cleanBase}/api/v1`;
    }

    const apiRoot = trimEnv(process.env.NEXT_PUBLIC_API_URL);
    if (apiRoot) {
        const resolved = preferTunnelOriginOverLoopback(apiRoot);
        const cleanRoot = resolved.replace(/\/+$/, "");
        return cleanRoot.endsWith("/api/v1")
            ? cleanRoot
            : `${cleanRoot}/api/v1`;
    }

    const browserOrigin = resolveBrowserOrigin(5000);
    return browserOrigin ? `${browserOrigin}/api/v1` : "";
}

export function resolveAssetBaseUrl() {
    const explicitAsset = trimEnv(process.env.NEXT_PUBLIC_ASSET_BASE_URL);
    if (explicitAsset) {
        return preferTunnelOriginOverLoopback(explicitAsset).replace(/\/+$/, "");
    }

    const apiRoot = trimEnv(process.env.NEXT_PUBLIC_API_URL);
    if (apiRoot) {
        return preferTunnelOriginOverLoopback(apiRoot)
            .replace(/\/api\/v1\/?$/i, "")
            .replace(/\/+$/, "");
    }

    const explicitBase = trimEnv(process.env.NEXT_PUBLIC_API_BASE_URL);
    if (explicitBase) {
        return preferTunnelOriginOverLoopback(explicitBase)
            .replace(/\/api\/v1\/?$/i, "")
            .replace(/\/+$/, "");
    }

    return resolveBrowserOrigin(5000);
}

export function resolveAppUrl() {
    const configuredAppUrl = trimEnv(process.env.NEXT_PUBLIC_APP_URL);
    if (configuredAppUrl) {
        return configuredAppUrl.replace(/\/+$/, "");
    }

    return resolveBrowserOrigin();
}

export const APP_CONFIG = {
    name: "Digital Product Catalogue",

    brand: "SHARP",

    brandDisplay: {
        prefix: trimEnv(process.env.NEXT_PUBLIC_BRAND_PREFIX) || "asia",
        highlight: trimEnv(process.env.NEXT_PUBLIC_BRAND_HIGHLIGHT) || "business",
        suffix: trimEnv(process.env.NEXT_PUBLIC_BRAND_SUFFIX) || "solutions",
    },

    defaultProductId:
        trimEnv(process.env.NEXT_PUBLIC_DEFAULT_PRODUCT_ID) || "base-tu11",

    description:
        "An interactive 3D product exploration experience.",

    routes: {
        home: "/",
        showroom: "/showroom",
        ar: "/ar",
    },

    api: {
        baseUrl: resolveApiBaseUrl(),
        assetUrl: resolveAssetBaseUrl(),
        appUrl: resolveAppUrl(),
        timeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT || 15000),
    },
};
