"use client";
/* eslint-disable react-hooks/immutability -- Mutable simulation refs are updated inside the Three.js frame loop, independently of React state. */
import { useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { characterConfig, type Motion } from "./config";
import {
  createCharacterState,
  stepCharacter,
  type CharacterState,
} from "./physics";
import { createCameraState, type CameraState } from "../camera/config";
import { useKeyboard } from "./useKeyboard";
import CharacterModel from "./CharacterModel";

export default function CharacterController({
  state,
  orbit,
}: {
  state: RefObject<CharacterState>;
  orbit: RefObject<CameraState>;
}) {
  const avatar = useRef<THREE.Group>(null);
  const motion = useRef<Motion>("idle");
  const input = useKeyboard();
  useFrame((_, dt) => {
    const s = state.current,
      keys = input.current.keys;
    if (input.current.reset || s.resetRequested) {
      const epoch = s.animationEpoch + 1;
      Object.assign(s, createCharacterState(), { animationEpoch: epoch });
      Object.assign(orbit.current, createCameraState());
      input.current.reset = false;
      input.current.jump = false;
      input.current.flip = false;
      keys.clear();
      if (avatar.current) avatar.current.rotation.y = 0;
    }
    stepCharacter(
      s,
      {
        x:
          Number(keys.has("KeyD") || keys.has("ArrowRight")) -
          Number(keys.has("KeyA") || keys.has("ArrowLeft")),
        z:
          Number(keys.has("KeyS") || keys.has("ArrowDown")) -
          Number(keys.has("KeyW") || keys.has("ArrowUp")),
        sprint: keys.has("ShiftLeft") || keys.has("ShiftRight"),
        jump: input.current.jump,
        flip: input.current.flip,
      },
      orbit.current.yaw,
      dt,
      characterConfig,
    );
    input.current.jump = false;
    input.current.flip = false;
    const speed = Math.hypot(s.vx, s.vz);
    motion.current = !s.grounded
      ? s.flipRemaining > 0
        ? "backflip"
        : s.vy > 0
          ? "jump"
          : "falling"
      : speed > 0.15
        ? keys.has("ShiftLeft") || keys.has("ShiftRight")
          ? "running"
          : "walking"
        : "idle";
    if (avatar.current) {
      avatar.current.position.set(s.x, s.y, s.z);
      if (speed > 0.15) {
        const target = Math.atan2(s.vx, s.vz);
        const difference = Math.atan2(
          Math.sin(target - avatar.current.rotation.y),
          Math.cos(target - avatar.current.rotation.y),
        );
        avatar.current.rotation.y +=
          difference *
          (1 - Math.exp(-Math.min(dt, 0.05) * characterConfig.turnSpeed));
      }
    }
  }, -1);
  return (
    <group ref={avatar}>
      <CharacterModel state={state} motion={motion} />
    </group>
  );
}
