import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import arRoutes from "./routes/arRoutes.js";
import productRoutes from "./routes/productRoutes.js";

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
    cors({
        origin:
            process.env.FRONTEND_URL || "http://localhost:3000",
    })
);

app.use(express.json());

// Serve GLB models and other assets
app.use(
    "/assets",
    express.static(path.join(__dirname, "../assets"))
);

// Health check
app.get("/api/v1/health", (req, res) => {
    res.json({
        success: true,
        message: "DPC Backend is running",
    });
});

// Product routes
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/ar", arRoutes);
export default app;