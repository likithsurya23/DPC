export const APP_CONFIG = {
    name: "Digital Product Catalogue",

    brand: "SHARP",

    description:
        "An interactive 3D product exploration experience.",

    routes: {
        home: "/",
        showroom: "/showroom",
    },

    api: {
        baseUrl:
            process.env.NEXT_PUBLIC_API_BASE_URL ||
            "http://localhost:5000/api/v1",

        assetUrl:
            process.env.NEXT_PUBLIC_ASSET_BASE_URL ||
            "http://localhost:5000",
    },
};