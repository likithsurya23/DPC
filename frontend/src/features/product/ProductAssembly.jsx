"use client";

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";

import * as THREE from "three";

import HotspotList from
    "@/features/hotspots/HotspotList";

import { prepareAssembly } from
    "@/utils/modelUtils";

export default function ProductAssembly({
    product,
    accessories = [],
}) {
    const parts = useMemo(
        () => [
            {
                id: product.id,
                modelURL: product.modelURL,
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                scale: 1,
            },
            ...accessories,
        ],
        [product, accessories]
    );

    const modelURLs = parts.map(
        (part) => part.modelURL
    );

    const loadedModels = useGLTF(modelURLs);

    const { model, baseBounds } = useMemo(() => {
        const scenes = loadedModels.map(
            (gltf) => gltf.scene
        );

        const result = prepareAssembly(
            scenes,
            parts,
            product.rotation || [0, 0, 0],
            product.scale ?? 1
        );

        result.model.updateMatrixWorld(true);

        // Retrieve the base printer from
        // the prepared assembly hierarchy.
        const assembly = result.model.children[0];

        const basePart = assembly?.children[0];

        const baseBounds = basePart
            ? new THREE.Box3().setFromObject(
                basePart,
                true
            )
            : null;

        return {
            model: result.model,
            baseBounds,
        };
    }, [loadedModels, parts, product]);

    return (
        <group>
            <primitive
                object={model}
                dispose={null}
            />

            <HotspotList
                bounds={baseBounds}
                productId={product.id}
            />
        </group>
    );
}