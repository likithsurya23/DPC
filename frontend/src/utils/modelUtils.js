import * as THREE from "three";

export const ENVIRONMENT_LAYER = 0;
export const PRODUCT_LAYER = 1;

export function setObjectLayer(object, layer = PRODUCT_LAYER) {
    if (!object) return;
    object.layers.set(layer);
    object.traverse((child) => {
        child.layers.set(layer);
    });
}

export function prepareModel(scene) {
    const model = scene.clone(true);

    const container = new THREE.Group();
    container.add(model);

    container.updateMatrixWorld(true);

    // Calculate actual model bounds
    const boundingBox = new THREE.Box3().setFromObject(
        container,
        true
    );

    if (boundingBox.isEmpty()) {
        return {
            model: container,
            size: [0, 0, 0],
        };
    }

    const center = boundingBox.getCenter(
        new THREE.Vector3()
    );

    const size = boundingBox.getSize(
        new THREE.Vector3()
    );

    // Center horizontally and ground vertically
    model.position.x -= center.x;
    model.position.y -= boundingBox.min.y;
    model.position.z -= center.z;

    model.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    container.updateMatrixWorld(true);

    return {
        model: container,
        size: size.toArray(),
    };
}
export function prepareAssembly(
    scenes,
    parts,
    productRotation = [0, 0, 0],
    productScale = 1
) {
    const assembly = new THREE.Group();

    scenes.forEach((scene, index) => {
        const part = parts[index];

        // Preserve the original GLB transforms.
        const clonedScene = scene.clone(true);

        const partGroup = new THREE.Group();

        partGroup.position.set(
            ...(part.position || [0, 0, 0])
        );

        partGroup.rotation.set(
            ...(part.rotation || [0, 0, 0])
        );

        partGroup.scale.setScalar(
            part.scale ?? 1
        );

        clonedScene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        partGroup.add(clonedScene);

        assembly.add(partGroup);
    });

    // Apply overall product orientation before
    // calculating the final bounding box.
    assembly.rotation.set(...productRotation);
    assembly.scale.setScalar(productScale);

    const container = new THREE.Group();
    container.add(assembly);

    container.updateMatrixWorld(true);

    const bounds = new THREE.Box3().setFromObject(
        container,
        true
    );

    if (bounds.isEmpty()) {
        return {
            model: container,
            size: [0, 0, 0],
        };
    }

    const center = bounds.getCenter(
        new THREE.Vector3()
    );

    const size = bounds.getSize(
        new THREE.Vector3()
    );

    // Center the entire assembled printer.
    assembly.position.set(
        -center.x,
        -bounds.min.y,
        -center.z
    );

    container.updateMatrixWorld(true);

    return {
        model: container,
        size: size.toArray(),
    };
}