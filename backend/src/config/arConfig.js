import { readFileSync } from "node:fs";

const productsData = JSON.parse(
    readFileSync(new URL("../data/products.json", import.meta.url), "utf-8")
);

const accessoriesData = JSON.parse(
    readFileSync(new URL("../data/accessories.json", import.meta.url), "utf-8")
);

export const CATALOG_PRODUCTS = productsData.map((product) => ({
    ...product,
    accessories: (product.accessoryIds || [])
        .map((accId) => accessoriesData.find((acc) => acc.id === accId))
        .filter(Boolean),
}));

export const AR_PRODUCTS = Object.fromEntries(
    productsData.map((product) => [
        product.id,
        {
            id: product.id,
            name: product.name,
            file: product.file,
            rotation: product.rotation || [0, 0, 0],
            scale: product.scale ?? 1,
            accessories: product.accessoryIds || [],
        },
    ])
);

export const AR_ACCESSORIES = Object.fromEntries(
    accessoriesData.map((accessory) => [
        accessory.id,
        {
            file: accessory.file,
            exclusiveGroup: accessory.exclusiveGroup,
            position: accessory.position || [0, 0, 0],
            rotation: accessory.rotation || [0, 0, 0],
            scale: accessory.scale ?? 1,
        },
    ])
);
