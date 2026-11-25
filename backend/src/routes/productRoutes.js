import { Router } from "express";

const router = Router();

const products = [
    {
        id: "base-tu11",
        name: "Base Model TU11",
        category: "Multifunction Printer",

        modelPath:
            "/assets/models/products/Base-Model-TU11.glb",

        dimensions: {
            width: 0.603,
            height: 0.822,
            depth: 0.648,
            unit: "m",
        },

        accessories: [
            {
                id: "bp-tr12",
                name: "BP TR12",
                modelPath:
                    "/assets/models/accessories/BP-TR12.glb",
            },
            {
                id: "bp-tr12-variant",
                name: "BP TR12 Variant",
                modelPath:
                    "/assets/models/accessories/BP-TR12%201.glb",
            },
            {
                id: "fn15",
                name: "Finisher FN15",
                modelPath:
                    "/assets/models/accessories/Finisher-FN15.glb",
            },
            {
                id: "lc10",
                name: "Large Capacitor LC10",
                modelPath:
                    "/assets/models/accessories/Large-Capacitor-LC10.glb",
            },
            {
                id: "de12",
                name: "Tray DE12",
                modelPath:
                    "/assets/models/accessories/TRAY-DE12.glb",
            },
        ],
    },
];

router.get("/", (req, res) => {
    res.json({
        success: true,
        data: products,
    });
});

router.get("/:id", (req, res) => {
    const product = products.find(
        (item) => item.id === req.params.id
    );

    if (!product) {
        return res.status(404).json({
            success: false,
            message: "Product not found",
        });
    }

    res.json({
        success: true,
        data: product,
    });
});

export default router;