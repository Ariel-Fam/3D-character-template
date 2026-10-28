"use client";
import { useEffect, type RefObject } from "react";
import { useThree } from "@react-three/fiber";
import { cameraConfig, type CameraState } from "./config";

export function useCameraInput(state: RefObject<CameraState>) {
  const { gl } = useThree();
  useEffect(() => {
    const canvas = gl.domElement;
    let dragging = false;
    let dragDistance = 0;
    const down = (e: PointerEvent) => {
      if (e.button === 0 || e.button === 2) {
        dragging = true;
        dragDistance = 0;
      }
    };
    const release = () => {
      dragging = false;
    };
    const move = (e: MouseEvent) => {
      if (!dragging && document.pointerLockElement !== canvas) return;
      if (dragging)
        dragDistance += Math.abs(e.movementX) + Math.abs(e.movementY);
      const s = state.current;
      s.yaw -= e.movementX * cameraConfig.sensitivity;
      s.pitch = Math.max(
        cameraConfig.minPitch,
        Math.min(
          cameraConfig.maxPitch,
          s.pitch + e.movementY * cameraConfig.sensitivity,
        ),
      );
    };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      state.current.distance = Math.max(
        cameraConfig.minDistance,
        Math.min(
          cameraConfig.maxDistance,
          state.current.distance + e.deltaY * cameraConfig.zoomSpeed,
        ),
      );
    };
    const lock = () => {
      if (document.pointerLockElement === canvas || dragDistance > 5) return;
      try {
        canvas.focus({ preventScroll: true });
        canvas.requestPointerLock()?.catch(() => {});
      } catch {}
    };
    const menu = (e: Event) => e.preventDefault();
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("wheel", wheel, { passive: false });
    canvas.addEventListener("click", lock);
    canvas.addEventListener("contextmenu", menu);
    window.addEventListener("mousemove", move);
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    window.addEventListener("blur", release);
    return () => {
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("wheel", wheel);
      canvas.removeEventListener("click", lock);
      canvas.removeEventListener("contextmenu", menu);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
      window.removeEventListener("blur", release);
      if (document.pointerLockElement === canvas) document.exitPointerLock();
    };
  }, [gl, state]);
}
