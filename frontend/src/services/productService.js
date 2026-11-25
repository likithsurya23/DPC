import { apiRequest } from "./api";
import { getAssetURL } from "@/config/apiConfig";

function normalizeProduct(product) {
    const id = product.id || product._id;

    const modelPath =
        product.modelURL ||
        product.modelUrl ||
        product.modelPath;

    if (!id || !modelPath) {
        throw new Error(
            "Product must contain an ID and model path."
        );
    }

    return {
        id: String(id),

        name: product.name,

        category:
            typeof product.category === "string"
                ? product.category
                : product.category?.name ||
                "Uncategorized",

        description: product.description || "",

        modelURL: getAssetURL(modelPath),

        thumbnailURL: product.thumbnailURL
            ? getAssetURL(product.thumbnailURL)
            : null,

        scale: product.scale ?? 1,

        rotation: product.rotation || [0, 0, 0],

        position: [0, 0, 0],
    };
}

export async function getProducts({ signal } = {}) {
    const response = await apiRequest(
        "/products",
        { signal }
    );

    const products = Array.isArray(response)
        ? response
        : response.data;

    if (!Array.isArray(products)) {
        throw new Error(
            "Invalid product catalogue response."
        );
    }

    return products.map(normalizeProduct);
}