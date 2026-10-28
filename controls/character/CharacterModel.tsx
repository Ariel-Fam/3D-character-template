"use client";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { prepareModel } from "./modelUtils";
import { animations, characterConfig, type Motion } from "./config";
import type { CharacterState } from "./physics";

export default function CharacterModel({
  state,
  motion,
}: {
  state: RefObject<CharacterState>;
  motion: RefObject<Motion>;
}) {
  const { scene, animations: clips } = useGLTF(characterConfig.model);
  const { model, bounds } = useMemo(() => prepareModel(scene), [scene]);
  const { actions } = useAnimations(clips, model);
  const previous = useRef<THREE.AnimationAction | null>(null);
  const previousEpoch = useRef(-1);
  const scale =
    characterConfig.height / Math.max(bounds.max.y - bounds.min.y, 0.01);
  const center = bounds.getCenter(new THREE.Vector3());
  useEffect(
    () => () => {
      const materials = new Set<THREE.Material>();
      model.traverse((object) => {
        if ((object as THREE.Mesh).isMesh) {
          const material = (object as THREE.Mesh).material;
          (Array.isArray(material) ? material : [material]).forEach((m) =>
            materials.add(m),
          );
        }
        if ((object as THREE.SkinnedMesh).isSkinnedMesh)
          (object as THREE.SkinnedMesh).skeleton.dispose();
      });
      materials.forEach((material) => material.dispose());
    },
    [model],
  );
  // AnimationActions are mutable Three.js playback controls, not React state.
  /* eslint-disable react-hooks/immutability */
  useFrame(() => {
    const current = motion.current;
    const action = actions[animations[current]];
    const epoch = state.current.animationEpoch;
    if (
      !action ||
      (previous.current === action && previousEpoch.current === epoch)
    )
      return;
    const oneShot = current === "jump" || current === "backflip";
    action
      .reset()
      .setLoop(
        oneShot ? THREE.LoopOnce : THREE.LoopRepeat,
        oneShot ? 1 : Infinity,
      );
    action.clampWhenFinished = oneShot;
    action.setEffectiveTimeScale(
      current === "backflip" ? 2.5 : current === "jump" ? 2.6 : 1,
    );
    action.setEffectiveWeight(1);
    action.play();
    if (previous.current && previous.current !== action)
      action.crossFadeFrom(previous.current, 0.16, false);
    else action.fadeIn(0.12);
    previous.current = action;
    previousEpoch.current = epoch;
  });
  /* eslint-enable react-hooks/immutability */
  return (
    <group
      scale={scale}
      position={[-center.x * scale, -bounds.min.y * scale, -center.z * scale]}
    >
      <primitive object={model} dispose={null} />
    </group>
  );
}
