"use client";

import { useEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

import { ACCESSORIES, SHOWROOM_CONFIG } from "@/config/showroomConfig";
import { APP_CONFIG } from "@/config/appConfig";
import { getAssetURL } from "@/config/apiConfig";
import { useProducts } from "@/hooks/useProducts";
import { PRODUCT_LAYER, prepareAssembly, setObjectLayer } from "@/utils/modelUtils";

import {
    LANDING_ACCESSORY_IDS,
    LANDING_SCENE_CONFIG,
} from "./landingConfig";

function isValidModelURL(url) {
    return typeof url === "string" && url.trim().length > 0;
}

function resolveLandingParts(product) {
    const baseURL = isValidModelURL(product?.modelURL)
        ? product.modelURL
        : SHOWROOM_CONFIG.product.modelURL;

    if (!isValidModelURL(baseURL)) {
        return [];
    }

    const basePart = {
        id: product?.id || SHOWROOM_CONFIG.product.id,
        modelURL: baseURL,
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: 1,
    };

    const sourceAccessories = ACCESSORIES;

    const apiAccessories = Array.isArray(product?.accessories)
        ? product.accessories
        : [];

    const selectedAccessories = LANDING_ACCESSORY_IDS.map((accId) => {
        const configMatch = sourceAccessories.find((item) => item.id === accId);
        const apiMatch = apiAccessories.find((item) => item.id === accId);

        const rawPath =
            apiMatch?.modelURL ||
            apiMatch?.modelPath ||
            configMatch?.modelURL;

        if (!isValidModelURL(rawPath)) {
            return null;
        }

        const resolvedURL = rawPath.startsWith("http")
            ? rawPath
            : getAssetURL(rawPath);

        return {
            id: accId,
            modelURL: resolvedURL,
            position: configMatch?.position || [0, 0, 0],
            rotation: configMatch?.rotation || [0, 0, 0],
            scale: configMatch?.scale ?? 1,
        };
    }).filter(Boolean);

    return [basePart, ...selectedAccessories];
}

function AssembledPrinter({
    parts,
    printerScale,
    registerSceneNodes,
    onLoaded,
}) {
    const printerGroupRef = useRef(null);

    const modelURLs = useMemo(
        () => parts.map((part) => part.modelURL).filter(isValidModelURL),
        [parts]
    );

    const loadedModels = useGLTF(modelURLs);

    const { model } = useMemo(() => {
        const scenes = loadedModels.map((gltf) => gltf.scene);

        const result = prepareAssembly(
            scenes,
            parts,
            [0, 0, 0],
            printerScale
        );

        // Center horizontally using the floor-standing base footprint so overhanging upper trays
        // do not shift the printer base off-center on the circular podium.
        const assembly = result.model.children[0];
        if (assembly) {
            const floorFootprintBox = new THREE.Box3();
            assembly.children.forEach((partGroup, idx) => {
                if (parts[idx]?.id !== "bp-tr12") {
                    floorFootprintBox.expandByObject(partGroup, true);
                }
            });
            if (!floorFootprintBox.isEmpty()) {
                const floorCenter = floorFootprintBox.getCenter(new THREE.Vector3());
                assembly.position.x -= floorCenter.x;
                assembly.position.z -= floorCenter.z;
                result.model.updateMatrixWorld(true);
            }
        }

        setObjectLayer(result.model, PRODUCT_LAYER);

        return result;
    }, [loadedModels, parts, printerScale]);

    useEffect(() => {
        if (registerSceneNodes) {
            registerSceneNodes({ printerGroup: printerGroupRef.current });
        }
        if (onLoaded) {
            onLoaded();
        }
        return () => {
            if (registerSceneNodes) {
                registerSceneNodes({ printerGroup: null });
            }
        };
    }, [registerSceneNodes, onLoaded]);

    return (
        <group
            ref={printerGroupRef}
            position={[0, 0, 0]}
            rotation={[0, LANDING_SCENE_CONFIG.printer.baseRotationY, 0]}
        >
            <primitive object={model} dispose={null} />
        </group>
    );
}

export default function PrinterModel({
    position = [0, 0, 0],
    printerScale = 1,
    registerSceneNodes,
    onLoaded,
    onUnavailable,
}) {
    const { products, isLoading } = useProducts();

    const activeProduct = useMemo(() => {
        if (!Array.isArray(products) || products.length === 0) {
            return SHOWROOM_CONFIG.product;
        }
        return (
            products.find(
                (item) => item.id === APP_CONFIG.defaultProductId
            ) || products[0]
        );
    }, [products]);

    const parts = useMemo(
        () => resolveLandingParts(activeProduct),
        [activeProduct]
    );

    useEffect(() => {
        parts.forEach((part) => {
            if (isValidModelURL(part.modelURL)) {
                useGLTF.preload(part.modelURL);
            }
        });
    }, [parts]);

    useEffect(() => {
        if (!isLoading && parts.length === 0 && onUnavailable) {
            onUnavailable();
        }
    }, [isLoading, parts.length, onUnavailable]);

    if (parts.length === 0) {
        return null;
    }

    return (
        <group position={position}>
            <AssembledPrinter
                parts={parts}
                printerScale={printerScale}
                registerSceneNodes={registerSceneNodes}
                onLoaded={onLoaded}
            />
        </group>
    );
}
