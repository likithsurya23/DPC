import {
    prepareARConfiguration,
    getARConfiguration,
} from "../services/arService.js";

export async function prepareAR(req, res) {
    const { productId, accessoryIds } = req.body || {};

    try {
        const configuration =
            await prepareARConfiguration(req.body || {});

        console.info("[AR] Configuration ready:", {
            productId,
            accessoryIds: accessoryIds || [],
            configurationId: configuration.configurationId,
        });

        return res.status(200).json({
            success: true,
            data: configuration,
        });
    } catch (error) {
        console.error("[AR] Configuration preparation failed:", {
            productId,
            accessoryIds: accessoryIds || [],
            status: error.status || 500,
            message: error.message,
        });

        return res.status(error.status || 500).json({
            success: false,

            message: error.status === 400
                ? error.message
                : "Unable to prepare AR configuration.",
        });
    }
}

export async function getAR(req, res) {
    const { configurationId } = req.params;

    try {
        const configuration =
            await getARConfiguration(configurationId);

        if (!configuration) {
            console.warn("[AR] Configuration not found:", {
                configurationId,
            });

            return res.status(404).json({
                success: false,
                message: "Configuration not found or expired.",
            });
        }

        return res.json({
            success: true,
            data: configuration,
        });
    } catch (error) {
        console.error("[AR] Configuration retrieval failed:", {
            configurationId,
            message: error.message,
        });

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve configuration.",
        });
    }
}