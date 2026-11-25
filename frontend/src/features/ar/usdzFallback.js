import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { USDZExporter } from "three/examples/jsm/exporters/USDZExporter.js";
import {
    strFromU8,
    strToU8,
    unzipSync,
    zipSync,
} from "three/examples/jsm/libs/fflate.module.js";

function normalizeUVsForQuickLook(geometry, material) {
    const texMaps = [
        material.map,
        material.roughnessMap,
        material.metalnessMap,
        material.normalMap,
        material.aoMap,
        material.emissiveMap,
    ].filter(Boolean);

    if (
        texMaps.length > 0 &&
        texMaps.every((t) => t.channel === 1) &&
        geometry.attributes.uv1
    ) {
        geometry.setAttribute("uv", geometry.attributes.uv1.clone());
        geometry.deleteAttribute("uv1");
        texMaps.forEach((t) => {
            t.channel = 0;
        });
    }
}

function addExplicitBackfacesToGeometry(geometry) {
    const pos = geometry.attributes.position;
    if (!pos) return;

    if (!geometry.attributes.normal) {
        geometry.computeVertexNormals();
    }

    const indexAttr = geometry.index;
    const vCount = pos.count;
    const srcIndices = indexAttr
        ? Array.from(indexAttr.array)
        : Array.from({ length: vCount }, (_, i) => i);

    const outIndices = new Uint32Array(srcIndices.length * 2);
    outIndices.set(srcIndices, 0);
    for (let t = 0; t + 2 < srcIndices.length; t += 3) {
        const base = srcIndices.length + t;
        outIndices[base] = srcIndices[t] + vCount;
        outIndices[base + 1] = srcIndices[t + 2] + vCount;
        outIndices[base + 2] = srcIndices[t + 1] + vCount;
    }
    geometry.setIndex(new THREE.BufferAttribute(outIndices, 1));

    for (const [attrName, attr] of Object.entries(geometry.attributes)) {
        const itemSize = attr.itemSize;
        const arr = attr.array;
        const doubled = new arr.constructor(arr.length * 2);
        doubled.set(arr, 0);
        doubled.set(arr, arr.length);

        if (attrName === "normal") {
            for (let i = arr.length; i < doubled.length; i++) {
                doubled[i] = -doubled[i];
            }
        }
        geometry.setAttribute(
            attrName,
            new THREE.BufferAttribute(doubled, itemSize, attr.normalized)
        );
    }
}

function normalizeMaterialForUSDZ(srcMat) {
    // Convert MeshPhysicalMaterial (often emitted for KHR_materials_specular)
    // cleanly into MeshStandardMaterial while preserving maps, opacity & PBR factors.
    const mat = new THREE.MeshStandardMaterial({
        name: srcMat.name,
        color: srcMat.color ? srcMat.color.clone() : new THREE.Color(1, 1, 1),
        roughness: srcMat.roughness ?? 1,
        metalness: srcMat.metalness ?? 0,
        map: srcMat.map || null,
        roughnessMap: srcMat.roughnessMap || null,
        metalnessMap: srcMat.metalnessMap || null,
        normalMap: srcMat.normalMap || null,
        normalScale: srcMat.normalScale ? srcMat.normalScale.clone() : new THREE.Vector2(1, 1),
        aoMap: srcMat.aoMap || null,
        aoMapIntensity: srcMat.aoMapIntensity ?? 1,
        emissive: srcMat.emissive ? srcMat.emissive.clone() : new THREE.Color(0, 0, 0),
        emissiveIntensity: srcMat.emissiveIntensity ?? 1,
        emissiveMap: srcMat.emissiveMap || null,
        alphaMap: srcMat.alphaMap || null,
        alphaTest: srcMat.alphaTest ?? 0,
        transparent: Boolean(srcMat.transparent),
        opacity: srcMat.transparent ? (srcMat.opacity ?? 1) : 1,
        side: THREE.FrontSide,
    });

    if (mat.map) {
        mat.map = mat.map.clone();
        mat.map.needsUpdate = true;
    }

    return mat;
}

/**
 * Clones a loaded Three.js scene and prepares meshes/materials specifically
 * for Apple Quick Look USDZ export without mutating the source scene.
 */
function prepareClonedSceneForUSDZ(sourceScene) {
    const cloned = sourceScene.clone(true);
    cloned.updateMatrixWorld(true);

    cloned.traverse((obj) => {
        if (!obj.isMesh || !obj.geometry) return;

        const srcMat = Array.isArray(obj.material) ? obj.material[0] : obj.material;
        if (!srcMat) return;

        const geom = obj.geometry.clone();
        const isDoubleSided = srcMat.side === THREE.DoubleSide;
        const cleanMat = normalizeMaterialForUSDZ(srcMat);

        normalizeUVsForQuickLook(geom, cleanMat);

        // Bake negative-determinant local transforms into cloned geometry.
        if (obj.matrixWorld.determinant() < 0) {
            const flipScale = new THREE.Vector3(-1, 1, 1);
            geom.scale(flipScale.x, flipScale.y, flipScale.z);
            const idx = geom.index;
            if (idx) {
                for (let t = 0; t + 2 < idx.count; t += 3) {
                    const b = idx.getX(t + 1);
                    idx.setX(t + 1, idx.getX(t + 2));
                    idx.setX(t + 2, b);
                }
                idx.needsUpdate = true;
            }
            obj.scale.multiply(flipScale);
        }

        if (isDoubleSided) {
            addExplicitBackfacesToGeometry(geom);
        }

        obj.geometry = geom;
        obj.material = cleanMat;
    });

    cloned.updateMatrixWorld(true);
    return cloned;
}

/**
 * Repairs THREE.USDZExporter duplicate `inputs:opacity = 1` overwriting `inputs:opacity.connect`
 * on intentionally transparent decals and re-packs with 64-byte alignment.
 */
function patchUsdzArchiveForQuickLook(usdzBytes) {
    const entries = unzipSync(new Uint8Array(usdzBytes));
    const modelBytes = entries["model.usda"];
    if (modelBytes) {
        let usda = strFromU8(modelBytes);
        // Remove trailing static `float inputs:opacity = 1` inside shaders that already connect `inputs:opacity.connect`
        usda = usda.replace(
            /(float inputs:opacity\.connect = [^\n]+[\s\S]*?)\n\t+float inputs:opacity = 1\b/g,
            "$1"
        );
        entries["model.usda"] = strToU8(usda);
    }

    const orderedFiles = {};
    if (entries["model.usda"]) {
        orderedFiles["model.usda"] = entries["model.usda"];
    }
    for (const [name, data] of Object.entries(entries)) {
        if (name !== "model.usda") {
            orderedFiles[name] = data;
        }
    }

    let currentOffset = 0;
    const alignedFiles = {};
    for (const [filename, fileData] of Object.entries(orderedFiles)) {
        const filenameLength = strToU8(filename).length;
        const baseHeaderSize = 30 + filenameLength;
        const remainder = (currentOffset + baseHeaderSize) & 63;

        let extraTotalLength = 0;
        if (remainder !== 0) {
            const withExtraHeader = (currentOffset + baseHeaderSize + 4) & 63;
            const padLength = (64 - withExtraHeader) & 63;
            const padding = new Uint8Array(padLength);
            extraTotalLength = 4 + padLength;
            alignedFiles[filename] = [fileData, { extra: { 12345: padding } }];
        } else {
            alignedFiles[filename] = fileData;
        }
        currentOffset += baseHeaderSize + extraTotalLength + fileData.length;
    }

    return zipSync(alignedFiles, { level: 0 });
}

/**
 * Explicitly loads the configured GLB assembly (base printer + accessories),
 * repairs winding/double-sided meshes and materials on a clone, and exports
 * a Quick Look-compatible USDZ blob URL.
 */
export async function exportConfiguredGLBToUSDZ(modelURL) {
    if (!modelURL) {
        throw new Error("Missing configured GLB URL for USDZ export.");
    }

    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync(modelURL);
    const rootScene = gltf.scene || gltf.scenes?.[0];

    if (!rootScene) {
        throw new Error("Configured GLB does not contain an exportable 3D scene.");
    }

    const repairedScene = prepareClonedSceneForUSDZ(rootScene);

    const exporter = new USDZExporter();
    const rawBuffer = await exporter.parseAsync(repairedScene, {
        ar: {
            anchoring: { type: "plane" },
            planeAnchoring: { alignment: "horizontal" },
        },
        includeAnchoringProperties: true,
        onlyVisible: true,
        quickLookCompatible: true,
        maxTextureSize: 1024,
    });

    const fixedBytes = patchUsdzArchiveForQuickLook(rawBuffer);
    const blob = new Blob([fixedBytes], {
        type: "model/vnd.usdz+zip",
    });

    return URL.createObjectURL(blob);
}

/**
 * Triggers iOS Apple AR Quick Look directly via a hidden rel="ar" anchor.
 * Must be invoked within or immediately following a user tap interaction.
 */
export function launchIOSQuickLookAnchor(usdzUrl, filename = "printer-configuration.usdz") {
    if (typeof document === "undefined" || !usdzUrl) {
        return false;
    }

    const anchor = document.createElement("a");
    const previewImg = document.createElement("img");
    previewImg.alt = "";

    anchor.setAttribute("rel", "ar");
    anchor.setAttribute("href", `${usdzUrl}#allowsContentScaling=0`);
    anchor.setAttribute("download", filename);
    anchor.style.display = "none";
    anchor.appendChild(previewImg);

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    return true;
}
