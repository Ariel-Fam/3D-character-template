"use client";
/* eslint-disable react-hooks/immutability -- Mutable simulation refs are updated inside the Three.js frame loop, independently of React state. */
import { useMemo, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { cameraConfig, type CameraState } from "./config";
import type { CharacterState } from "../character/physics";
import { useCameraInput } from "./useCameraInput";

export default function ThirdPersonCamera({
  character,
  orbit,
}: {
  character: RefObject<CharacterState>;
  orbit: RefObject<CameraState>;
}) {
  useCameraInput(orbit);
  const scratch = useMemo(
    () => ({ focus: new THREE.Vector3(), position: new THREE.Vector3() }),
    [],
  );
  useFrame(({ camera }, dt) => {
    const p = character.current,
      s = orbit.current;
    scratch.focus.set(p.x, p.y + cameraConfig.targetHeight, p.z);
    scratch.position
      .set(
        Math.sin(s.yaw) * Math.cos(s.pitch),
        Math.sin(s.pitch),
        Math.cos(s.yaw) * Math.cos(s.pitch),
      )
      .multiplyScalar(s.distance)
      .add(scratch.focus);
    if (s.snap) {
      camera.position.copy(scratch.position);
      s.snap = false;
    } else
      camera.position.lerp(
        scratch.position,
        1 - Math.exp(-Math.min(dt, 0.05) * cameraConfig.followSpeed),
      );
    camera.lookAt(scratch.focus);
  });
  return null;
}
