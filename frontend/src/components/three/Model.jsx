"use client";

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";

import { prepareModel } from "@/utils/modelUtils";

export default function Model({
  modelPath,
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) {
  if (!modelPath) {
    throw new Error(
      "Model component requires a valid modelPath."
    );
  }

  return (
    <LoadedModel
      modelPath={modelPath}
      scale={scale}
      position={position}
      rotation={rotation}
    />
  );
}

function LoadedModel({
  modelPath,
  scale,
  position,
  rotation,
}) {
  const { scene } = useGLTF(modelPath);

  const { model } = useMemo(
    () => prepareModel(scene),
    [scene]
  );

  return (
    <group
      position={position}
      rotation={rotation}
      scale={scale}
    >
      <primitive
        object={model}
        dispose={null}
      />
    </group>
  );
}