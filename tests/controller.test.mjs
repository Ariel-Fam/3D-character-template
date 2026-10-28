import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";
import ts from "typescript";
async function loadSource(path) {
  const { outputText } = ts.transpileModule(
    readFileSync(new URL(path, import.meta.url), "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2020,
      },
    },
  );
  return import(
    `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
  );
}
const { createCharacterState, stepCharacter } = await loadSource(
  "../controls/character/physics.ts",
);
const { characterConfig, animations } = await loadSource(
  "../controls/character/config.ts",
);
const idle = { x: 0, z: 0, sprint: false, jump: false, flip: false };
function advance(s, input = idle, frames = 120, yaw = 0) {
  for (let i = 0; i < frames; i++)
    stepCharacter(s, input, yaw, 1 / 120, characterConfig);
}

test("diagonal input is normalized and movement follows camera yaw", () => {
  const straight = createCharacterState(),
    diagonal = createCharacterState(),
    rotated = createCharacterState();
  advance(straight, { ...idle, z: -1 });
  advance(diagonal, { ...idle, x: 1, z: -1 });
  advance(rotated, { ...idle, z: -1 }, 120, Math.PI / 2);
  assert.ok(
    Math.abs(Math.hypot(diagonal.x, diagonal.z) - Math.abs(straight.z)) < 1e-8,
  );
  assert.ok(rotated.x < -3 && Math.abs(rotated.z) < 1e-8);
});
test("double jump accepts two impulses, rejects a third, and resets on landing", () => {
  const s = createCharacterState();
  stepCharacter(s, { ...idle, jump: true }, 0, 1 / 120, characterConfig);
  advance(s, idle, 12);
  stepCharacter(s, { ...idle, jump: true }, 0, 1 / 120, characterConfig);
  assert.equal(s.jumps, 2);
  const epoch = s.animationEpoch;
  advance(s, idle, 20);
  stepCharacter(s, { ...idle, jump: true }, 0, 1 / 120, characterConfig);
  assert.equal(s.animationEpoch, epoch);
  advance(s, idle, 240);
  assert.equal(s.y, 0);
  assert.equal(s.vy, 0);
  assert.equal(s.jumps, 0);
  assert.equal(s.grounded, true);
});
test("backflip launches only from the ground and sprint doubles top speed", () => {
  const flip = createCharacterState();
  stepCharacter(flip, { ...idle, flip: true }, 0, 1 / 120, characterConfig);
  assert.ok(flip.y > 0 && flip.flipRemaining > 0);
  const epoch = flip.animationEpoch;
  stepCharacter(flip, { ...idle, flip: true }, 0, 1 / 120, characterConfig);
  assert.equal(flip.animationEpoch, epoch);
  const walk = createCharacterState(),
    run = createCharacterState();
  advance(walk, { ...idle, z: -1 });
  advance(run, { ...idle, z: -1, sprint: true });
  assert.ok(Math.abs(run.vz / walk.vz - 2) < 1e-8);
});
test("bundled character contains all six named animations and embedded textures", () => {
  const file = readFileSync(
    new URL("../public/models/6animations.glb", import.meta.url),
  );
  const gltf = JSON.parse(file.subarray(20, 20 + file.readUInt32LE(12)));
  assert.deepEqual(
    new Set(gltf.animations.map((clip) => clip.name)),
    new Set(Object.values(animations)),
  );
  assert.ok(
    gltf.images.length > 0 &&
      gltf.images.every((image) => image.bufferView !== undefined),
  );
});
