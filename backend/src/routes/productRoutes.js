import { Router } from "express";
import { CATALOG_PRODUCTS } from "../config/arConfig.js";

const router = Router();

router.get("/", (req, res) => {
    res.json({
        success: true,
        data: CATALOG_PRODUCTS,
    });
});

router.get("/:id", (req, res) => {
    const product = CATALOG_PRODUCTS.find(
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
