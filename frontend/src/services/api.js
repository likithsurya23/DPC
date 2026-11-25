import { API_CONFIG } from "@/config/apiConfig";

export async function apiRequest(
    endpoint,
    options = {}
) {
    const {
        signal,
        headers,
        ...requestOptions
    } = options;

    const baseURL = (API_CONFIG.baseURL || "").replace(
        /\/+$/,
        ""
    );

    const path = endpoint.replace(/^\/+/, "");

    const url = baseURL ? `${baseURL}/${path}` : `/${path}`;

    const controller = new AbortController();
    const timeoutMs = API_CONFIG.timeout || 15000;
    const timeoutId = setTimeout(() => {
        controller.abort(new Error(`Request timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    const onExternalAbort = () => {
        controller.abort(signal?.reason);
    };

    if (signal) {
        if (signal.aborted) {
            clearTimeout(timeoutId);
            controller.abort(signal.reason);
        } else {
            signal.addEventListener("abort", onExternalAbort, { once: true });
        }
    }

    try {
        const response = await fetch(url, {
            ...requestOptions,
            signal: controller.signal,

            headers: {
                Accept: "application/json",
                ...headers,
            },
        });

        if (!response.ok) {
            let serverMessage = "";
            try {
                const payload = await response.json();
                if (typeof payload?.message === "string") {
                    serverMessage = payload.message;
                }
            } catch {
                // Non-JSON error response
            }

            const error = new Error(
                serverMessage || `API request failed (${response.status})`
            );
            error.status = response.status;
            error.url = url;
            throw error;
        }

        return response.json();
    } catch (error) {
        if (error?.name !== "AbortError") {
            console.error("[API] Request failed:", {
                url,
                status: error?.status ?? null,
                message: error?.message ?? String(error),
            });
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
        if (signal) {
            signal.removeEventListener("abort", onExternalAbort);
        }
    }
}