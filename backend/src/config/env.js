import dotenv from "dotenv";

dotenv.config();

const rawOrigins = process.env.FRONTEND_URL || "";

export const envConfig = {
    port: Number(process.env.PORT || 5000),
    host: process.env.HOST || "0.0.0.0",
    allowedOrigins: rawOrigins
        .split(",")
        .map((origin) => origin.trim().replace(/\/+$/, ""))
        .filter(Boolean),
    allowLocalOrigins: process.env.ALLOW_LOCAL_ORIGINS !== "false",
    apiPrefix: process.env.API_PREFIX || "/api/v1",
    assetsRoute: process.env.ASSETS_ROUTE || "/assets",
};

