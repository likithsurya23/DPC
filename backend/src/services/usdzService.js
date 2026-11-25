import { writeFile, rename, rm } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { strToU8, zipSync } from "three/examples/jsm/libs/fflate.module.js";

const PRECISION = 7;

class USDNode {
    constructor(name, type = "", metadata = [], properties = []) {
        this.name = name;
        this.type = type;
        this.metadata = metadata;
        this.properties = properties;
        this.children = [];
    }

    addMetadata(key, value) {
        this.metadata.push({ key, value });
    }

    addProperty(property, metadata = []) {
        this.properties.push({ property, metadata });
    }

    addChild(child) {
        this.children.push(child);
    }

    toString(indent = 0) {
        const pad = "\t".repeat(indent);

        const formattedMetadata = this.metadata.map(({ key, value }) => {
            if (Array.isArray(value)) {
                const lines = [`${key} = {`];
                for (const line of value) {
                    lines.push(`${pad}\t\t${line}`);
                }
                lines.push(`${pad}\t}`);
                return lines.join("\n");
            }
            return `${key} = ${value}`;
        });

        const meta = formattedMetadata.length
            ? ` (\n${formattedMetadata.map((l) => `${pad}\t${l}`).join("\n")}\n${pad})`
            : "";

        const properties = this.properties.map(({ property, metadata }) => {
            const propMeta = metadata.length
                ? ` (\n${metadata.map((m) => `${pad}\t\t${m}`).join("\n")}\n${pad}\t)`
                : "";
            return `${pad}\t${property}${propMeta}`;
        });

        const children = this.children.map((c) => c.toString(indent + 1));
        const bodyLines = [];

        if (properties.length > 0) {
            bodyLines.push(...properties);
        }

        if (children.length > 0) {
            if (properties.length > 0) {
                bodyLines.push("");
            }
            for (let i = 0; i < children.length; i++) {
                bodyLines.push(children[i]);
                if (i < children.length - 1) {
                    bodyLines.push("");
                }
            }
        }

        const type = this.type ? `${this.type} ` : "";
        return `${pad}def ${type}"${this.name}"${meta}\n${pad}{\n${bodyLines.join("\n")}\n${pad}}`;
    }
}

function buildHeader() {
    return `#usda 1.0
(
\tcustomLayerData = {
\t\tstring creator = "DPC USDZExporter"
\t}
\tdefaultPrim = "Root"
\tmetersPerUnit = 1
\tupAxis = "Y"
)
`;
}

function sanitizeUsdName(rawName, fallback, usedNames) {
    let name = (rawName || "").replace(/[^A-Za-z0-9_]/g, "_");
    if (/^[0-9]/.test(name)) {
        name = `_${name}`;
    }
    if (!name) {
        name = fallback;
    }

    let uniqueName = name;
    let suffix = 1;
    while (usedNames.has(uniqueName)) {
        uniqueName = `${name}_${suffix++}`;
    }
    usedNames.add(uniqueName);
    return uniqueName;
}

function matrixDeterminant3x3(m) {
    return (
        m[0] * (m[5] * m[10] - m[6] * m[9]) -
        m[4] * (m[1] * m[10] - m[2] * m[9]) +
        m[8] * (m[1] * m[6] - m[2] * m[5])
    );
}

function formatMatrix4d(m) {
    const row = (o) =>
        `(${m[o]}, ${m[o + 1]}, ${m[o + 2]}, ${m[o + 3]})`;
    return `( ${row(0)}, ${row(4)}, ${row(8)}, ${row(12)} )`;
}

function transformPoint3(m, p, out) {
    out[0] = m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12];
    out[1] = m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13];
    out[2] = m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14];
    return out;
}

function computeNormalizedNormalMatrix(m) {
    // Cofactor transpose of upper-left 3x3 for non-uniform/negative scales
    const a00 = m[0], a01 = m[4], a02 = m[8];
    const a10 = m[1], a11 = m[5], a12 = m[9];
    const a20 = m[2], a21 = m[6], a22 = m[10];

    return [
        a11 * a22 - a12 * a21,
        a12 * a20 - a10 * a22,
        a10 * a21 - a11 * a20,
        a02 * a21 - a01 * a22,
        a00 * a22 - a02 * a20,
        a01 * a20 - a00 * a21,
        a01 * a12 - a02 * a11,
        a02 * a10 - a00 * a12,
        a00 * a11 - a01 * a10,
    ];
}

function transformNormal3(nm, n, flip, out) {
    let x = nm[0] * n[0] + nm[1] * n[1] + nm[2] * n[2];
    let y = nm[3] * n[0] + nm[4] * n[1] + nm[5] * n[2];
    let z = nm[6] * n[0] + nm[7] * n[1] + nm[8] * n[2];
    if (flip) {
        x = -x;
        y = -y;
        z = -z;
    }
    const len = Math.hypot(x, y, z) || 1;
    out[0] = x / len;
    out[1] = y / len;
    out[2] = z / len;
    return out;
}

function getWrappingToken(wrapValue) {
    if (wrapValue === 33071) return "clamp";
    if (wrapValue === 33648) return "mirror";
    return "repeat";
}

function resolvePrimaryUvAttributeName(prim) {
    const mat = prim.getMaterial();
    if (!mat) return "TEXCOORD_0";

    const texInfos = [
        mat.getBaseColorTextureInfo(),
        mat.getMetallicRoughnessTextureInfo(),
        mat.getNormalTextureInfo(),
        mat.getOcclusionTextureInfo(),
        mat.getEmissiveTextureInfo(),
    ].filter(Boolean);

    const usedCoords = texInfos.map((info) => info.getTexCoord());
    if (usedCoords.length > 0 && usedCoords.every((c) => c === 1) && prim.getAttribute("TEXCOORD_1")) {
        // Map TEXCOORD_1 into primary primvars:st so Apple Quick Look reliably reads the UVs.
        return "TEXCOORD_1";
    }

    return prim.getAttribute("TEXCOORD_0") ? "TEXCOORD_0" : "TEXCOORD_1";
}

function getTexCoordUsdName(texInfo, remappedChannel1To0) {
    const channel = texInfo ? texInfo.getTexCoord() : 0;
    if (channel === 1 && remappedChannel1To0) {
        return "st";
    }
    return channel > 0 ? `st${channel}` : "st";
}

/**
 * Builds a single USD Mesh geometry .usda from a glTF primitive.
 * Fixes negative-determinant scales and converts doubleSided geometry into
 * explicit front + backface triangle pairs with inverted winding and negated normals
 * so Quick Look renders all exterior surfaces without backface-culling holes.
 */
function buildPrimitiveGeometryUsda(prim, bakedNegativeMatrix = null) {
    const posAttr = prim.getAttribute("POSITION");
    if (!posAttr) return null;

    const vCount = posAttr.getCount();
    const normAttr = prim.getAttribute("NORMAL");
    const primaryUvName = resolvePrimaryUvAttributeName(prim);
    const uvStAttr = prim.getAttribute(primaryUvName);
    const uvSt1Attr = primaryUvName === "TEXCOORD_1" ? null : prim.getAttribute("TEXCOORD_1");
    const colorAttr = prim.getAttribute("COLOR_0");

    const indicesAttr = prim.getIndices();
    const rawIndices = [];
    if (indicesAttr) {
        for (let i = 0; i < indicesAttr.getCount(); i++) {
            rawIndices.push(indicesAttr.getScalar(i));
        }
    } else {
        for (let i = 0; i < vCount; i++) {
            rawIndices.push(i);
        }
    }

    const negScale = bakedNegativeMatrix ? matrixDeterminant3x3(bakedNegativeMatrix) < 0 : false;
    const normalMatrix = bakedNegativeMatrix ? computeNormalizedNormalMatrix(bakedNegativeMatrix) : null;

    const basePoints = new Array(vCount);
    const baseNormals = new Array(vCount);
    const pTmp = [0, 0, 0];
    const nTmp = [0, 1, 0];

    for (let i = 0; i < vCount; i++) {
        posAttr.getElement(i, pTmp);
        if (bakedNegativeMatrix) {
            transformPoint3(bakedNegativeMatrix, pTmp, pTmp);
        }
        basePoints[i] = [pTmp[0], pTmp[1], pTmp[2]];

        if (normAttr) {
            normAttr.getElement(i, nTmp);
            if (normalMatrix) {
                transformNormal3(normalMatrix, nTmp, false, nTmp);
            }
            baseNormals[i] = [nTmp[0], nTmp[1], nTmp[2]];
        } else {
            baseNormals[i] = [0, 0, 0];
        }
    }

    // Synthesize smooth normals when missing.
    if (!normAttr) {
        for (let t = 0; t + 2 < rawIndices.length; t += 3) {
            const i0 = rawIndices[t];
            const i1 = rawIndices[t + 1];
            const i2 = rawIndices[t + 2];
            const p0 = basePoints[i0], p1 = basePoints[i1], p2 = basePoints[i2];
            const ux = p1[0] - p0[0], uy = p1[1] - p0[1], uz = p1[2] - p0[2];
            const vx = p2[0] - p0[0], vy = p2[1] - p0[1], vz = p2[2] - p0[2];
            const nx = uy * vz - uz * vy;
            const ny = uz * vx - ux * vz;
            const nz = ux * vy - uy * vx;
            for (const idx of [i0, i1, i2]) {
                baseNormals[idx][0] += nx;
                baseNormals[idx][1] += ny;
                baseNormals[idx][2] += nz;
            }
        }
        for (let i = 0; i < vCount; i++) {
            const n = baseNormals[i];
            const len = Math.hypot(n[0], n[1], n[2]) || 1;
            n[0] /= len;
            n[1] /= len;
            n[2] /= len;
        }
    }

    const frontIndices = [];
    for (let t = 0; t + 2 < rawIndices.length; t += 3) {
        const i0 = rawIndices[t];
        const i1 = rawIndices[t + 1];
        const i2 = rawIndices[t + 2];
        if (negScale) {
            frontIndices.push(i0, i2, i1);
        } else {
            frontIndices.push(i0, i1, i2);
        }
    }

    const mat = prim.getMaterial();
    const isDoubleSided = mat ? mat.getDoubleSided() : false;

    const outPoints = [...basePoints];
    const outNormals = [...baseNormals];
    const outIndices = [...frontIndices];

    if (isDoubleSided) {
        // Emit explicit backface vertices with negated normals & reversed winding.
        for (let i = 0; i < vCount; i++) {
            outPoints.push(basePoints[i]);
            outNormals.push([-baseNormals[i][0], -baseNormals[i][1], -baseNormals[i][2]]);
        }
        for (let t = 0; t + 2 < frontIndices.length; t += 3) {
            outIndices.push(
                frontIndices[t] + vCount,
                frontIndices[t + 2] + vCount,
                frontIndices[t + 1] + vCount
            );
        }
    }

    const totalVerts = outPoints.length;
    const totalTris = outIndices.length / 3;

    const pointsStr = outPoints
        .map((p) => `(${p[0].toPrecision(PRECISION)}, ${p[1].toPrecision(PRECISION)}, ${p[2].toPrecision(PRECISION)})`)
        .join(", ");
    const normalsStr = outNormals
        .map((n) => `(${n[0].toPrecision(PRECISION)}, ${n[1].toPrecision(PRECISION)}, ${n[2].toPrecision(PRECISION)})`)
        .join(", ");

    const uvTmp = [0, 0];
    const formatUv = (attr) => {
        const arr = [];
        for (let i = 0; i < vCount; i++) {
            attr.getElement(i, uvTmp);
            arr.push(`(${uvTmp[0].toPrecision(PRECISION)}, ${(1 - uvTmp[1]).toPrecision(PRECISION)})`);
        }
        if (isDoubleSided) {
            for (let i = 0; i < vCount; i++) {
                arr.push(arr[i]);
            }
        }
        return arr.join(", ");
    };

    const rootNode = new USDNode("Geometry");
    const meshNode = new USDNode("Geometry", "Mesh");

    meshNode.addProperty(`int[] faceVertexCounts = [${new Array(totalTris).fill(3).join(", ")}]`);
    meshNode.addProperty(`int[] faceVertexIndices = [${outIndices.join(", ")}]`);
    meshNode.addProperty(`normal3f[] normals = [${normalsStr}]`, ['interpolation = "vertex"']);
    meshNode.addProperty(`point3f[] points = [${pointsStr}]`);

    if (uvStAttr) {
        meshNode.addProperty(`texCoord2f[] primvars:st = [${formatUv(uvStAttr)}]`, ['interpolation = "vertex"']);
    }
    if (uvSt1Attr) {
        meshNode.addProperty(`texCoord2f[] primvars:st1 = [${formatUv(uvSt1Attr)}]`, ['interpolation = "vertex"']);
    }

    if (colorAttr) {
        const cTmp = [1, 1, 1, 1];
        const colors = [];
        for (let i = 0; i < vCount; i++) {
            colorAttr.getElement(i, cTmp);
            colors.push(`(${cTmp[0].toPrecision(PRECISION)}, ${cTmp[1].toPrecision(PRECISION)}, ${cTmp[2].toPrecision(PRECISION)})`);
        }
        if (isDoubleSided) {
            for (let i = 0; i < vCount; i++) {
                colors.push(colors[i]);
            }
        }
        meshNode.addProperty(`color3f[] primvars:displayColor = [${colors.join(", ")}]`, ['interpolation = "vertex"']);
    }

    if (isDoubleSided) {
        meshNode.addProperty("uniform bool doubleSided = 1");
    }
    meshNode.addProperty('uniform token subdivisionScheme = "none"');

    rootNode.addChild(meshNode);

    return {
        usda: `${buildHeader()}\n${rootNode.toString()}`,
        remappedChannel1To0: primaryUvName === "TEXCOORD_1",
        vertexCount: totalVerts,
        triangleCount: totalTris,
    };
}

function buildUsdMaterial(mat, matUsdId, remappedChannel1To0, textureRegistry) {
    const materialNode = new USDNode(matUsdId, "Material");
    const surface = new USDNode("PreviewSurface", "Shader");
    surface.addProperty('uniform token info:id = "UsdPreviewSurface"');

    const alphaMode = mat ? mat.getAlphaMode() : "OPAQUE";
    const baseColor = mat ? mat.getBaseColorFactor() : [1, 1, 1, 1];
    const alphaValue = mat ? mat.getAlpha() : 1;
    const alphaCutoff = mat ? mat.getAlphaCutoff() : 0.5;
    const roughness = mat ? mat.getRoughnessFactor() : 1;
    const metallic = mat ? mat.getMetallicFactor() : 0;

    function registerTexture(texture) {
        let entry = textureRegistry.map.get(texture);
        if (!entry) {
            const mime = texture.getMimeType() || "image/png";
            const ext = mime === "image/jpeg" ? "jpg" : "png";
            const fileName = `textures/Texture_${textureRegistry.nextId++}.${ext}`;
            const rawImage = texture.getImage();
            if (!rawImage) return null;
            entry = {
                fileName,
                bytes: new Uint8Array(rawImage),
            };
            textureRegistry.map.set(texture, entry);
        }
        return entry;
    }

    function addTextureShaderChain(texture, texInfo, mapType, colorScale, colorSpace) {
        const texEntry = registerTexture(texture);
        if (!texEntry) return null;

        const varname = getTexCoordUsdName(texInfo, remappedChannel1To0);
        const texShaderName = `Texture_${mapType}`;

        const primvarReader = new USDNode(`PrimvarReader_${mapType}`, "Shader");
        primvarReader.addProperty('uniform token info:id = "UsdPrimvarReader_float2"');
        primvarReader.addProperty("float2 inputs:fallback = (0.0, 0.0)");
        primvarReader.addProperty(`string inputs:varname = "${varname}"`);
        primvarReader.addProperty("float2 outputs:result");

        const texShader = new USDNode(texShaderName, "Shader");
        texShader.addProperty('uniform token info:id = "UsdUVTexture"');
        texShader.addProperty(`asset inputs:file = @${texEntry.fileName}@`);
        texShader.addProperty(
            `float2 inputs:st.connect = </Materials/${matUsdId}/PrimvarReader_${mapType}.outputs:result>`
        );

        if (colorScale) {
            texShader.addProperty(
                `float4 inputs:scale = (${colorScale[0]}, ${colorScale[1]}, ${colorScale[2]}, ${colorScale[3]})`
            );
        }
        if (mapType === "normal") {
            texShader.addProperty("float4 inputs:scale = (2, 2, 2, 1)");
            texShader.addProperty("float4 inputs:bias = (-1, -1, -1, 0)");
        }

        texShader.addProperty(`token inputs:sourceColorSpace = "${colorSpace}"`);
        texShader.addProperty(`token inputs:wrapS = "${getWrappingToken(texInfo?.getWrapS())}"`);
        texShader.addProperty(`token inputs:wrapT = "${getWrappingToken(texInfo?.getWrapT())}"`);
        texShader.addProperty("float outputs:r");
        texShader.addProperty("float outputs:g");
        texShader.addProperty("float outputs:b");
        texShader.addProperty("float3 outputs:rgb");
        if (mapType === "diffuse" && (alphaMode === "BLEND" || alphaMode === "MASK")) {
            texShader.addProperty("float outputs:a");
        }

        materialNode.addChild(primvarReader);
        materialNode.addChild(texShader);
        return texShaderName;
    }

    const baseColorTex = mat?.getBaseColorTexture();
    const baseColorInfo = mat?.getBaseColorTextureInfo();

    if (baseColorTex) {
        const texScaleAlpha = alphaMode === "BLEND" ? alphaValue : 1.0;
        const texShaderName = addTextureShaderChain(
            baseColorTex,
            baseColorInfo,
            "diffuse",
            [baseColor[0], baseColor[1], baseColor[2], texScaleAlpha],
            "sRGB"
        );
        if (texShaderName) {
            surface.addProperty(
                `color3f inputs:diffuseColor.connect = </Materials/${matUsdId}/${texShaderName}.outputs:rgb>`
            );
            if (alphaMode === "BLEND") {
                surface.addProperty(
                    `float inputs:opacity.connect = </Materials/${matUsdId}/${texShaderName}.outputs:a>`
                );
            } else if (alphaMode === "MASK") {
                surface.addProperty(
                    `float inputs:opacity.connect = </Materials/${matUsdId}/${texShaderName}.outputs:a>`
                );
                surface.addProperty(`float inputs:opacityThreshold = ${alphaCutoff}`);
            } else {
                surface.addProperty("float inputs:opacity = 1");
            }
        }
    } else {
        surface.addProperty(
            `color3f inputs:diffuseColor = (${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]})`
        );
        const solidOpacity = alphaMode === "BLEND" ? alphaValue : 1;
        surface.addProperty(`float inputs:opacity = ${solidOpacity}`);
    }

    const emissiveTex = mat?.getEmissiveTexture();
    const emissiveFactor = mat ? mat.getEmissiveFactor() : [0, 0, 0];
    if (emissiveTex) {
        const texShaderName = addTextureShaderChain(
            emissiveTex,
            mat.getEmissiveTextureInfo(),
            "emissive",
            [emissiveFactor[0] || 1, emissiveFactor[1] || 1, emissiveFactor[2] || 1, 1],
            "sRGB"
        );
        if (texShaderName) {
            surface.addProperty(
                `color3f inputs:emissiveColor.connect = </Materials/${matUsdId}/${texShaderName}.outputs:rgb>`
            );
        }
    } else if (emissiveFactor.some((c) => c > 0)) {
        surface.addProperty(
            `color3f inputs:emissiveColor = (${emissiveFactor[0]}, ${emissiveFactor[1]}, ${emissiveFactor[2]})`
        );
    }

    const normalTex = mat?.getNormalTexture();
    if (normalTex) {
        const texShaderName = addTextureShaderChain(
            normalTex,
            mat.getNormalTextureInfo(),
            "normal",
            null,
            "raw"
        );
        if (texShaderName) {
            surface.addProperty(
                `normal3f inputs:normal.connect = </Materials/${matUsdId}/${texShaderName}.outputs:rgb>`
            );
        }
    }

    const occTex = mat?.getOcclusionTexture();
    if (occTex) {
        const occStrength = mat.getOcclusionStrength();
        const texShaderName = addTextureShaderChain(
            occTex,
            mat.getOcclusionTextureInfo(),
            "occlusion",
            [occStrength, occStrength, occStrength, 1],
            "raw"
        );
        if (texShaderName) {
            surface.addProperty(
                `float inputs:occlusion.connect = </Materials/${matUsdId}/${texShaderName}.outputs:r>`
            );
        }
    }

    const mrTex = mat?.getMetallicRoughnessTexture();
    const mrInfo = mat?.getMetallicRoughnessTextureInfo();
    if (mrTex) {
        const roughShaderName = addTextureShaderChain(
            mrTex,
            mrInfo,
            "roughness",
            [roughness, roughness, roughness, 1],
            "raw"
        );
        if (roughShaderName) {
            surface.addProperty(
                `float inputs:roughness.connect = </Materials/${matUsdId}/${roughShaderName}.outputs:g>`
            );
        }

        const metalShaderName = addTextureShaderChain(
            mrTex,
            mrInfo,
            "metallic",
            [metallic, metallic, metallic, 1],
            "raw"
        );
        if (metalShaderName) {
            surface.addProperty(
                `float inputs:metallic.connect = </Materials/${matUsdId}/${metalShaderName}.outputs:b>`
            );
        }
    } else {
        surface.addProperty(`float inputs:roughness = ${roughness}`);
        surface.addProperty(`float inputs:metallic = ${metallic}`);
    }

    surface.addProperty("int inputs:useSpecularWorkflow = 0");
    surface.addProperty("token outputs:surface");

    materialNode.addChild(surface);
    materialNode.addProperty(
        `token outputs:surface.connect = </Materials/${matUsdId}/PreviewSurface.outputs:surface>`
    );

    return materialNode;
}

function packUsdzArchive(files) {
    // Apple Quick Look requires ZIP entries to be uncompressed (STORE / level 0)
    // and every file payload offset aligned on a 64-byte boundary.
    let currentOffset = 0;
    const alignedFiles = {};

    for (const filename of Object.keys(files)) {
        const fileData = files[filename];
        const filenameLength = Buffer.byteLength(filename, "utf8");
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
 * Generates a Quick Look-compatible USDZ buffer from a @gltf-transform Document
 * without mutating the source Document.
 */
export function convertGLTFDocumentToUSDZ(document) {
    const sourceScene =
        document.getRoot().getDefaultScene() ||
        document.getRoot().listScenes()[0];

    if (!sourceScene) {
        throw new Error("Configured GLTF document has no scene to export as USDZ.");
    }

    const files = {
        "model.usda": null,
    };

    const usedNames = new Set();
    const textureRegistry = { map: new Map(), nextId: 1 };
    const materialCache = new Map();
    const materialsNode = new USDNode("Materials", "Scope");

    const rootNode = new USDNode("Root", "Xform");
    const scenesNode = new USDNode("Scenes", "Scope");
    scenesNode.addMetadata("kind", '"sceneLibrary"');
    rootNode.addChild(scenesNode);

    const sceneNode = new USDNode("Scene", "Xform");
    sceneNode.addMetadata("customData", [
        "bool preliminary_collidesWithEnvironment = 0",
        'string sceneName = "Scene"',
    ]);
    sceneNode.addMetadata("sceneName", '"Scene"');
    sceneNode.addProperty('token preliminary:anchoring:type = "plane"');
    sceneNode.addProperty('token preliminary:planeAnchoring:alignment = "horizontal"');
    scenesNode.addChild(sceneNode);

    let geometryCounter = 1;
    let materialCounter = 1;

    function visitNode(gltfNode, parentUsdNode) {
        const nodeMatrix = gltfNode.getMatrix();
        const isNegativeScale = matrixDeterminant3x3(nodeMatrix) < 0;

        const mesh = gltfNode.getMesh();
        if (mesh) {
            const prims = mesh.listPrimitives();

            // If matrix has negative determinant, bake it cleanly into geometry and emit identity Xform.
            const baseXformNode = new USDNode(
                sanitizeUsdName(gltfNode.getName(), "MeshNode", usedNames),
                "Xform"
            );
            const emitMatrix = isNegativeScale
                ? [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
                : nodeMatrix;
            baseXformNode.addProperty(`matrix4d xformOp:transform = ${formatMatrix4d(emitMatrix)}`);
            baseXformNode.addProperty('uniform token[] xformOpOrder = ["xformOp:transform"]');

            prims.forEach((prim, primIndex) => {
                const geomResult = buildPrimitiveGeometryUsda(
                    prim,
                    isNegativeScale ? nodeMatrix : null
                );
                if (!geomResult) return;

                const geomFileName = `geometries/Geometry_${geometryCounter++}.usda`;
                files[geomFileName] = strToU8(geomResult.usda);

                const mat = prim.getMaterial() || null;
                const matCacheKey = `${mat ? mat.getName() + "_" + matCounterKey(mat) : "default"}_${geomResult.remappedChannel1To0 ? "st1to0" : "std"}`;
                let matUsdId = materialCache.get(matCacheKey);
                if (!matUsdId) {
                    matUsdId = `Material_${materialCounter++}`;
                    materialCache.set(matCacheKey, matUsdId);
                    materialsNode.addChild(
                        buildUsdMaterial(mat, matUsdId, geomResult.remappedChannel1To0, textureRegistry)
                    );
                }

                const primNodeName = sanitizeUsdName(
                    `${gltfNode.getName() || "Mesh"}_Prim${primIndex}`,
                    `Mesh_${geometryCounter}`,
                    usedNames
                );
                const meshXformNode = new USDNode(primNodeName, "Xform");
                meshXformNode.addMetadata("prepend references", `@./${geomFileName}@</Geometry>`);
                meshXformNode.addMetadata("prepend apiSchemas", '["MaterialBindingAPI"]');
                meshXformNode.addProperty(`rel material:binding = </Materials/${matUsdId}>`);
                baseXformNode.addChild(meshXformNode);
            });

            parentUsdNode.addChild(baseXformNode);
            for (const child of gltfNode.listChildren()) {
                visitNode(child, baseXformNode);
            }
            return;
        }

        const xformNode = new USDNode(
            sanitizeUsdName(gltfNode.getName(), "XformNode", usedNames),
            "Xform"
        );
        xformNode.addProperty(`matrix4d xformOp:transform = ${formatMatrix4d(nodeMatrix)}`);
        xformNode.addProperty('uniform token[] xformOpOrder = ["xformOp:transform"]');
        parentUsdNode.addChild(xformNode);

        for (const child of gltfNode.listChildren()) {
            visitNode(child, xformNode);
        }
    }

    const materialIdRegistry = new WeakMap();
    let nextMatKey = 1;
    function matCounterKey(mat) {
        if (!materialIdRegistry.has(mat)) {
            materialIdRegistry.set(mat, nextMatKey++);
        }
        return materialIdRegistry.get(mat);
    }

    for (const child of sourceScene.listChildren()) {
        visitNode(child, sceneNode);
    }

    const mainUsda = `${buildHeader()}\n${rootNode.toString()}\n\n${materialsNode.toString()}`;
    files["model.usda"] = strToU8(mainUsda);

    for (const entry of textureRegistry.map.values()) {
        files[entry.fileName] = entry.bytes;
    }

    return packUsdzArchive(files);
}

/**
 * Writes a USDZ byte array atomically to disk.
 */
export async function writeUSDZFile(outputPath, usdzBytes) {
    const tempPath = `${outputPath}.${randomUUID()}.tmp`;
    try {
        await writeFile(tempPath, usdzBytes);
        await rename(tempPath, outputPath);
    } finally {
        await rm(tempPath, { force: true });
    }
}
