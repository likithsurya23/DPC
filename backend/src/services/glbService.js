import path from "node:path";
import { fileURLToPath } from "node:url";
import { access, mkdir, readFile, writeFile, rename, rm } from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";

import { Document, NodeIO } from "@gltf-transform/core";

import {
    mergeDocuments,
    unpartition,
    center,
} from "@gltf-transform/functions";

import {
    KHRONOS_EXTENSIONS,
} from "@gltf-transform/extensions";

import { Euler, Quaternion } from "three";
import {
    convertGLTFDocumentToUSDZ,
    writeUSDZFile,
} from "./usdzService.js";

const modelDirectory = fileURLToPath(
    new URL("../../assets/models/", import.meta.url)
);

const generatedDirectory = path.join(
    modelDirectory,
    "generated",
    "glb"
);

const generatedUsdzDirectory = path.join(
    modelDirectory,
    "generated",
    "usdz"
);

async function ensureUsdzExists(configurationId, glbPath, document = null) {
    const usdzPath = path.join(
        generatedUsdzDirectory,
        `${configurationId}.usdz`
    );

    try {
        await access(usdzPath);
        return `/assets/models/generated/usdz/${configurationId}.usdz`;
    } catch {
        // Generate Quick Look-compatible USDZ from the configured GLB.
    }

    await mkdir(generatedUsdzDirectory, { recursive: true });

    let sourceDoc = document;
    if (!sourceDoc) {
        const io = new NodeIO().registerExtensions(KHRONOS_EXTENSIONS);
        sourceDoc = await io.read(glbPath);
    }

    const usdzBytes = convertGLTFDocumentToUSDZ(sourceDoc);
    await writeUSDZFile(usdzPath, usdzBytes);

    return `/assets/models/generated/usdz/${configurationId}.usdz`;
}

function applyTransform(node, part) {
    const rotation = new Quaternion().setFromEuler(
        new Euler(...(part.rotation || [0, 0, 0]))
    );

    node.setTranslation(part.position || [0, 0, 0]);
    node.setRotation(rotation.toArray());

    const scale = part.scale ?? 1;

    node.setScale([scale, scale, scale]);
}

export async function generateGLB(product, accessories, accessoryIds = []) {
    const io = new NodeIO().registerExtensions(
        KHRONOS_EXTENSIONS
    );

    const parts = [
        {
            file: product.file,
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            scale: 1,
        },
        ...accessories,
    ];

    const sourceFiles = await Promise.all(
        parts.map((part) =>
            readFile(path.join(modelDirectory, part.file))
        )
    );

    // Create a deterministic configuration ID.
    const hash = createHash("sha256");

    hash.update(JSON.stringify({
        version: 1,
        product,
        parts,
    }));

    sourceFiles.forEach((file) => hash.update(file));

    const configurationId = hash.digest("hex");

    await mkdir(generatedDirectory, {
        recursive: true,
    });

    await mkdir(generatedUsdzDirectory, {
        recursive: true,
    });

    const outputPath = path.join(
        generatedDirectory,
        `${configurationId}.glb`
    );

    const metadataPath = path.join(
        generatedDirectory,
        `${configurationId}.json`
    );

    const result = {
        configurationId,
        productId: product.id,
        productName: product.name,
        accessoryIds,
        createdAt: new Date().toISOString(),

        modelURL:
            `/assets/models/generated/glb/${configurationId}.glb`,
        iosURL:
            `/assets/models/generated/usdz/${configurationId}.usdz`,
    };

    // Reuse a previously generated configuration.
    try {
        const existingContent = await readFile(metadataPath, "utf-8");
        await access(outputPath);

        const iosURL = await ensureUsdzExists(configurationId, outputPath);
        const existingMetadata = JSON.parse(existingContent);
        const merged = {
            ...existingMetadata,
            accessoryIds: existingMetadata.accessoryIds || accessoryIds,
            iosURL: existingMetadata.iosURL || iosURL,
        };

        if (!existingMetadata.iosURL) {
            await writeFile(metadataPath, JSON.stringify(merged));
        }

        return merged;
    } catch {
        // Generate the GLB if it does not exist or metadata is incomplete.
    }

    const document = new Document();

    const targetScene = document.createScene(
        "Configured Printer"
    );

    document.getRoot().setDefaultScene(targetScene);

    const assembly = document.createNode("Printer Assembly");

    targetScene.addChild(assembly);

    applyTransform(assembly, {
        rotation: product.rotation,
        scale: product.scale,
    });

    for (let index = 0; index < parts.length; index++) {
        const source = await io.readBinary(
            sourceFiles[index]
        );

        const sourceScene =
            source.getRoot().getDefaultScene() ||
            source.getRoot().listScenes()[0];

        if (!sourceScene) {
            throw new Error("Source model has no scene.");
        }

        const map = mergeDocuments(document, source);

        const importedScene = map.get(sourceScene);

        const partNode = document.createNode(
            `Part ${index + 1}`
        );

        applyTransform(partNode, parts[index]);

        for (const child of importedScene.listChildren()) {
            partNode.addChild(child);
        }

        assembly.addChild(partNode);

        // Keep only the configured printer scene.
        for (const scene of document.getRoot().listScenes()) {
            if (scene !== targetScene) {
                scene.dispose();
            }
        }
    }

    await document.transform(
        unpartition(),

        // Center horizontally and ground the assembly.
        center({ pivot: "below" })
    );

    const usdzBytes = convertGLTFDocumentToUSDZ(document);
    const binary = await io.writeBinary(document);

    const temporaryPath =
        `${outputPath}.${randomUUID()}.tmp`;
    const usdzPath = path.join(
        generatedUsdzDirectory,
        `${configurationId}.usdz`
    );

    try {
        await writeFile(temporaryPath, binary);

        await rename(temporaryPath, outputPath);

        await writeUSDZFile(usdzPath, usdzBytes);

        await writeFile(
            metadataPath,
            JSON.stringify(result)
        );
    } finally {
        await rm(temporaryPath, { force: true });
    }

    return result;
}

export async function getGeneratedConfiguration(id) {
    if (!/^[a-f0-9]{64}$/.test(id)) {
        console.warn("[GLB] Rejected malformed configuration ID:", { id });
        return null;
    }

    const metadataPath = path.join(generatedDirectory, `${id}.json`);
    const glbPath = path.join(generatedDirectory, `${id}.glb`);

    try {
        const content = await readFile(metadataPath, "utf-8");
        await access(glbPath);

        const metadata = JSON.parse(content);
        const iosURL = await ensureUsdzExists(id, glbPath);

        if (!metadata.iosURL) {
            metadata.iosURL = iosURL;
            await writeFile(metadataPath, JSON.stringify(metadata));
        }

        return metadata;
    } catch (error) {
        if (error.code === "ENOENT") {
            console.warn("[GLB] Persisted AR asset missing on disk:", {
                id,
                missingPath: error.path,
            });
            return null;
        }

        throw error;
    }
}