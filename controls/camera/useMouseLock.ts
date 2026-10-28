"use client";
import { useEffect, useState, type RefObject } from "react";

/** Browser capture state is separate from the per-frame orbit simulation. */
export function useMouseLock(canvas: RefObject<HTMLCanvasElement | null>) {
  const [locked, setLocked] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const change = () => {
      setLocked(document.pointerLockElement === canvas.current);
      setError("");
    };
    const failed = () =>
      setError("Mouse capture is unavailable. Drag to look around.");
    document.addEventListener("pointerlockchange", change);
    document.addEventListener("pointerlockerror", failed);
    return () => {
      document.removeEventListener("pointerlockchange", change);
      document.removeEventListener("pointerlockerror", failed);
    };
  }, [canvas]);
  const toggle = async () => {
    if (!canvas.current) return;
    if (document.pointerLockElement === canvas.current)
      document.exitPointerLock();
    else {
      try {
        canvas.current.focus({ preventScroll: true });
        await canvas.current.requestPointerLock();
      } catch {
        setError("Mouse capture is unavailable. Drag to look around.");
      }
    }
  };
  return { locked, error, toggle };
}
