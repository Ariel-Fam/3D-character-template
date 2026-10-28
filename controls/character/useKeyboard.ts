"use client";
import { useEffect, useRef } from "react";

export function useKeyboard() {
  const input = useRef({
    keys: new Set<string>(),
    jump: false,
    flip: false,
    reset: false,
  });
  useEffect(() => {
    const state = input.current;
    const down = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLElement &&
        e.target.closest("input, textarea, select, button, [contenteditable]")
      )
        return;
      if (
        ["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(
          e.code,
        )
      )
        e.preventDefault();
      state.keys.add(e.code);
      if (!e.repeat) {
        if (e.code === "Space") state.jump = true;
        if (e.code === "KeyB") state.flip = true;
        if (e.code === "KeyR") state.reset = true;
      }
    };
    const up = (e: KeyboardEvent) => {
      state.keys.delete(e.code);
    };
    const clear = () => {
      state.keys.clear();
      state.jump = false;
      state.flip = false;
      state.reset = false;
    };
    const visibility = () => {
      if (document.hidden) clear();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
      document.removeEventListener("visibilitychange", visibility);
      clear();
    };
  }, []);
  return input;
}
