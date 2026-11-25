import { prepareAR } from "./arService";

import { getARPageURL } from "@/config/apiConfig";

export async function saveConfiguration(
    productId,
    accessoryIds = []
) {
    const configuration = await prepareAR(
        productId,
        accessoryIds
    );

    if (!configuration?.configurationId) {
        throw new Error(
            "Unable to save configuration."
        );
    }

    return {
        ...configuration,

        shareURL: getARPageURL(
            configuration.configurationId
        ),
    };
}