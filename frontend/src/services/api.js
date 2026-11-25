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

    const baseURL = API_CONFIG.baseURL.replace(
        /\/+$/,
        ""
    );

    const path = endpoint.replace(/^\/+/, "");

    const url = `${baseURL}/${path}`;

    const response = await fetch(url, {
        ...requestOptions,
        signal,

        headers: {
            Accept: "application/json",
            ...headers,
        },
    });

    if (!response.ok) {
        throw new Error(
            `API request failed: ${response.status}`
        );
    }

    return response.json();
}