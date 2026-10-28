"use client";
import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { useProgress } from "@react-three/drei";
import CharacterController from "../controls/character/CharacterController";
import ThirdPersonCamera from "../controls/camera/ThirdPersonCamera";
import { createCharacterState } from "../controls/character/physics";
import { createCameraState } from "../controls/camera/config";
import { useMouseLock } from "../controls/camera/useMouseLock";

export default function Playground() {
  const { active: loading } = useProgress();
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const mouseLock = useMouseLock(canvas);
  const character = useRef(createCharacterState());
  const orbit = useRef(createCameraState());
  return (
    <main className="playground">
      <div className="scene">
        <Canvas
          shadows="percentage"
          onCreated={({ gl }) => {
            gl.domElement.tabIndex = 0;
            canvas.current = gl.domElement;
          }}
          dpr={[1, 1.5]}
          camera={{ position: [0, 3, 6], fov: 50, near: 0.1, far: 1500 }}
        >
          <color attach="background" args={["#87ceeb"]} />
          <fog attach="fog" args={["#87ceeb", 45, 140]} />
          <hemisphereLight args={["#e1f5ff", "#3478af", 1.8]} />
          <directionalLight
            position={[8, 16, 10]}
            intensity={2.4}
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
            shadow-normalBias={0.025}
          />
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[2000, 2000]} />
            <meshStandardMaterial color="#4eaae0" roughness={0.95} />
          </mesh>
          <Suspense fallback={null}>
            <CharacterController state={character} orbit={orbit} />
            <ThirdPersonCamera character={character} orbit={orbit} />
          </Suspense>
        </Canvas>
      </div>
      {loading && (
        <div className="loading" role="status">
          Loading character…
        </div>
      )}
      <header className="title">
        <h1>Character control template</h1>
        <p>Flat ground. Blue sky. Six animations.</p>
      </header>
      <nav className="toolbar" aria-label="Template tools">
        <a href="/architecture">Architecture</a>
        <button onClick={mouseLock.toggle} aria-pressed={mouseLock.locked}>
          {mouseLock.locked ? "Release mouse" : "Lock mouse"}
        </button>
        <button
          onClick={() => {
            character.current.resetRequested = true;
            canvas.current?.focus({ preventScroll: true });
          }}
        >
          Reset position
        </button>
      </nav>
      {mouseLock.error && (
        <p className="capture-error" role="status">
          {mouseLock.error}
        </p>
      )}
      <div className="alignment-container">

        <footer className="controls" aria-label="Keyboard and camera controls">
          <span>
            <kbd>W A S D / ↑ ← ↓ →</kbd> Move
          </span>
          <span>
            <kbd>SHIFT</kbd> Sprint
          </span>
          <span>
            <kbd>SPACE</kbd> Jump / double jump
          </span>
          <span>
            <kbd>B</kbd> Backflip
          </span>
          <span>
            <kbd>DRAG</kbd> Orbit
          </span>
          <span>
            <kbd>SCROLL</kbd> Zoom
          </span>
          <span>
            <kbd>CLICK / ESC</kbd> Lock / release mouse
          </span>
          <span>
            <kbd>R</kbd> Reset
          </span>
        </footer>
      </div>
    </main>
  );
}
