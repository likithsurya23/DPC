import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir, readFile, writeFile, rename, rm } from "node:fs/promises";
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

const modelDirectory = fileURLToPath(
    new URL("../../assets/models/", import.meta.url)
);

const generatedDirectory = path.join(
    modelDirectory,
    "generated",
    "glb"
);

function applyTransform(node, part) {
    const rotation = new Quaternion().setFromEuler(
        new Euler(...(part.rotation || [0, 0, 0]))
    );

    node.setTranslation(part.position || [0, 0, 0]);
    node.setRotation(rotation.toArray());

    const scale = part.scale ?? 1;

    node.setScale([scale, scale, scale]);
}

export async function generateGLB(product, accessories) {
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

        modelURL:
            `/assets/models/generated/glb/${configurationId}.glb`,
    };

    // Reuse a previously generated configuration.
    try {
        await readFile(metadataPath);
        await readFile(outputPath);

        return result;
    } catch {
        // Generate the GLB if it does not exist.
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

    const binary = await io.writeBinary(document);

    const temporaryPath =
        `${outputPath}.${randomUUID()}.tmp`;

    try {
        await writeFile(temporaryPath, binary);

        await rename(temporaryPath, outputPath);

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
        return null;
    }

    try {
        const content = await readFile(
            path.join(generatedDirectory, `${id}.json`),
            "utf-8"
        );

        return JSON.parse(content);
    } catch (error) {
        if (error.code === "ENOENT") {
            return null;
        }

        throw error;
    }
}