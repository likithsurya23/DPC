import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { envConfig } from "./config/env.js";
import arRoutes from "./routes/arRoutes.js";
import productRoutes from "./routes/productRoutes.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function isOriginAllowed(origin) {
    if (!origin) return true;

    const normalized = origin.replace(/\/+$/, "");
    if (envConfig.allowedOrigins.includes(normalized)) {
        return true;
    }

    if (envConfig.allowLocalOrigins) {
        try {
            const { hostname } = new URL(normalized);
            if (
                hostname === "localhost" ||
                hostname === "127.0.0.1" ||
                hostname === "::1"
            ) {
                return true;
            }
        } catch {
            return false;
        }
    }

    return envConfig.allowedOrigins.length === 0;
}

app.use(
    cors({
        origin: (origin, callback) => {
            if (isOriginAllowed(origin)) {
                callback(null, true);
            } else {
                callback(new Error(`Origin not allowed by CORS: ${origin}`));
            }
        },
    })
);

app.use(express.json());

// Serve GLB/USDZ models and other assets with explicit AR MIME types
app.use(
    envConfig.assetsRoute,
    express.static(path.join(__dirname, "../assets"), {
        setHeaders(res, filePath) {
            if (filePath.endsWith(".usdz")) {
                res.setHeader("Content-Type", "model/vnd.usdz+zip");
            } else if (filePath.endsWith(".glb")) {
                res.setHeader("Content-Type", "model/gltf-binary");
            }
        },
    })
);

// Health check
app.get(`${envConfig.apiPrefix}/health`, (req, res) => {
    res.json({
        success: true,
        message: "DPC Backend is running",
    });
});

// Product & AR routes
app.use(`${envConfig.apiPrefix}/products`, productRoutes);
app.use(`${envConfig.apiPrefix}/ar`, arRoutes);

export default app;
