import { apiRequest } from "./api";
import { getAssetURL } from "@/config/apiConfig";

function normalizeAccessory(accessory) {
    const id = accessory.id || accessory._id;
    const modelPath =
        accessory.modelURL ||
        accessory.modelUrl ||
        accessory.modelPath;

    if (!id || !modelPath) {
        return null;
    }

    return {
        id: String(id),
        name: accessory.name || String(id),
        description: accessory.description || "",
        modelURL: getAssetURL(modelPath),
        exclusiveGroup: accessory.exclusiveGroup,
        position: accessory.position || [0, 0, 0],
        rotation: accessory.rotation || [0, 0, 0],
        scale: accessory.scale ?? 1,
    };
}

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

    const accessories = Array.isArray(product.accessories)
        ? product.accessories.map(normalizeAccessory).filter(Boolean)
        : [];

    return {
        id: String(id),
        name: product.name,
        category:
            typeof product.category === "string"
                ? product.category
                : product.category?.name || "Uncategorized",
        description: product.description || "",
        modelURL: getAssetURL(modelPath),
        thumbnailURL: product.thumbnailURL
            ? getAssetURL(product.thumbnailURL)
            : null,
        supportsHotspots: Boolean(product.supportsHotspots),
        accessories,
        scale: product.scale ?? 1,
        rotation: product.rotation || [0, 0, 0],
        position: [0, 0, 0],
    };
}

export async function getProducts({ signal } = {}) {
    const response = await apiRequest("/products", { signal });

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
