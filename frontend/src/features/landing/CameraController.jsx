"use client";

import { useFrame } from "@react-three/fiber";

export default function CameraController({
    layoutConfig,
    getCameraState,
    getSceneAnimState,
    getSceneNodes,
}) {
    useFrame((state) => {
        const camera = state.camera;
        if (layoutConfig && camera.fov !== layoutConfig.fov) {
            camera.fov = layoutConfig.fov;
            camera.updateProjectionMatrix();
        }

        const cam = getCameraState ? getCameraState() : null;
        if (cam) {
            camera.position.set(
                cam.posX + cam.parallaxX + cam.idleX,
                cam.posY + cam.parallaxY + cam.idleY,
                cam.posZ
            );

            camera.lookAt(
                cam.targetX + cam.parallaxX * 0.35 + cam.idleX * 0.4,
                cam.targetY + cam.parallaxY * 0.65 + cam.idleY,
                cam.targetZ
            );
        }

        const anim = getSceneAnimState ? getSceneAnimState() : null;
        const nodes = getSceneNodes ? getSceneNodes() : null;
        if (!anim || !nodes) return;

        if (nodes.ceilingLedMat) nodes.ceilingLedMat.emissiveIntensity = anim.ceilingLed;
        if (nodes.sidePanelLedMat) nodes.sidePanelLedMat.emissiveIntensity = anim.sideLed;
        if (nodes.archLedMat) nodes.archLedMat.emissiveIntensity = anim.archLed;
        if (nodes.flutedPanelMat) nodes.flutedPanelMat.emissiveIntensity = anim.flutedLed;
        if (nodes.podiumLedMat) nodes.podiumLedMat.emissiveIntensity = anim.podiumLed;
        if (nodes.podiumRimLedMat) nodes.podiumRimLedMat.emissiveIntensity = anim.podiumRim;
        if (nodes.podiumGroup) nodes.podiumGroup.scale.setScalar(anim.podiumScale);
        if (nodes.ambientLight) nodes.ambientLight.intensity = anim.ambientLight;
        if (nodes.hemiLight) nodes.hemiLight.intensity = anim.hemiLight;
        if (nodes.keyLight) nodes.keyLight.intensity = anim.keyLight;
        if (nodes.redCeilingLight) nodes.redCeilingLight.intensity = anim.redCeilingLight;
        if (nodes.podiumAccentLight) nodes.podiumAccentLight.intensity = anim.podiumAccentLight;
        if (nodes.printerGroup) nodes.printerGroup.rotation.y = anim.printerRotY;
    });

    return null;
}
