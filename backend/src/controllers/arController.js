import {
    prepareARConfiguration,
    getARConfiguration,
} from "../services/arService.js";

export async function prepareAR(req, res) {
    try {
        const configuration =
            await prepareARConfiguration(req.body || {});

        return res.status(200).json({
            success: true,
            data: configuration,
        });
    } catch (error) {
        console.error("AR generation failed:", error);

        return res.status(error.status || 500).json({
            success: false,

            message: error.status === 400
                ? error.message
                : "Unable to prepare AR configuration.",
        });
    }
}

export async function getAR(req, res) {
    try {
        const configuration =
            await getARConfiguration(
                req.params.configurationId
            );

        if (!configuration) {
            return res.status(404).json({
                success: false,
                message: "Configuration not found.",
            });
        }

        return res.json({
            success: true,
            data: configuration,
        });
    } catch (error) {
        console.error("AR retrieval failed:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve configuration.",
        });
    }
}