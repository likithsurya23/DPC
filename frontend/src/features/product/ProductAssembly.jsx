"use client";

import { useEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";

import HotspotList from "@/features/hotspots/HotspotList";
import { PRODUCT_LAYER, prepareAssembly, setObjectLayer } from "@/utils/modelUtils";
import { useShowroomStore } from "@/stores/useShowroomStore";

export default function ProductAssembly({
    product,
    accessories = [],
}) {
    const groupRef = useRef(null);
    const prevPartCountRef = useRef(1);
    const setAssemblySize = useShowroomStore((state) => state.setAssemblySize);

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

    const modelURLs = parts.map((part) => part.modelURL);
    const loadedModels = useGLTF(modelURLs);

    const { model, baseBounds, size } = useMemo(() => {
        const scenes = loadedModels.map((gltf) => gltf.scene);

        const result = prepareAssembly(
            scenes,
            parts,
            product.rotation || [0, 0, 0],
            product.scale ?? 1
        );

        result.model.updateMatrixWorld(true);
        setObjectLayer(result.model, PRODUCT_LAYER);

        const assembly = result.model.children[0];
        const basePart = assembly?.children[0];

        const baseBounds = basePart
            ? new THREE.Box3().setFromObject(basePart, true)
            : null;

        return {
            model: result.model,
            baseBounds,
            size: result.size,
        };
    }, [loadedModels, parts, product]);

    useEffect(() => {
        setAssemblySize(size);
    }, [size, setAssemblySize]);

    // Smooth GSAP settle animation when accessories are added or removed (keeps y = 0 grounded)
    useEffect(() => {
        const group = groupRef.current;
        if (!group) return;

        if (prevPartCountRef.current === parts.length) {
            return;
        }
        prevPartCountRef.current = parts.length;

        const reducedMotion =
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (reducedMotion) return;

        const tween = gsap.fromTo(
            group.scale,
            { x: 0.96, y: 0.96, z: 0.96 },
            {
                x: 1,
                y: 1,
                z: 1,
                duration: 0.45,
                ease: "power3.out",
            }
        );

        return () => {
            tween.kill();
        };
    }, [parts.length]);

    return (
        <group ref={groupRef} position={[0, 0, 0]}>
            <primitive object={model} dispose={null} />

            <HotspotList bounds={baseBounds} productId={product.id} />
        </group>
    );
}
