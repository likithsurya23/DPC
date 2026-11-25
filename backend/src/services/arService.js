import {
    AR_PRODUCTS,
    AR_ACCESSORIES,
} from "../config/arConfig.js";

import {
    generateGLB,
    getGeneratedConfiguration,
} from "./glbService.js";

function validationError(message) {
    const error = new Error(message);

    error.status = 400;

    return error;
}

export async function prepareARConfiguration({
    productId,
    accessoryIds = [],
}) {
    if (
        typeof productId !== "string" ||
        !Object.hasOwn(AR_PRODUCTS, productId)
    ) {
        throw validationError("Invalid product.");
    }

    if (
        !Array.isArray(accessoryIds) ||
        accessoryIds.length > 5 ||
        !accessoryIds.every((id) => typeof id === "string")
    ) {
        throw validationError("Invalid accessories.");
    }

    const product = AR_PRODUCTS[productId];

    const uniqueIds = [...new Set(accessoryIds)];

    const accessories = [];

    const exclusiveGroups = new Set();

    for (const id of uniqueIds) {
        if (
            !product.accessories.includes(id) ||
            !Object.hasOwn(AR_ACCESSORIES, id)
        ) {
            throw validationError(
                `Unsupported accessory: ${id}`
            );
        }

        const accessory = AR_ACCESSORIES[id];

        if (accessory.exclusiveGroup) {
            if (
                exclusiveGroups.has(
                    accessory.exclusiveGroup
                )
            ) {
                throw validationError(
                    "Conflicting accessory selection."
                );
            }

            exclusiveGroups.add(
                accessory.exclusiveGroup
            );
        }
    }

    // Preserve a consistent part order.
    for (const id of product.accessories) {
        if (uniqueIds.includes(id)) {
            accessories.push(AR_ACCESSORIES[id]);
        }
    }

    return generateGLB(product, accessories);
}

export async function getARConfiguration(id) {
    return getGeneratedConfiguration(id);
}