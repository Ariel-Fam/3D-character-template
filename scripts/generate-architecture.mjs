// One source for the editable Excalidraw board and the in-app SVG overview.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const elements = [];
const svg = [];
let serial = 0;
const escape = (s) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
function base(type, x, y, width, height, extra = {}) {
  const id = `architecture-${++serial}`;
  const element = {
    id,
    type,
    x,
    y,
    width,
    height,
    angle: 0,
    strokeColor: "#29465f",
    backgroundColor: "transparent",
    fillStyle: "solid",
    strokeWidth: 2,
    strokeStyle: "solid",
    roughness: 1,
    opacity: 100,
    groupIds: [],
    frameId: null,
    roundness: null,
    seed: 1000 + serial,
    version: 1,
    versionNonce: 2000 + serial,
    isDeleted: false,
    boundElements: [],
    updated: 1,
    link: null,
    locked: false,
    ...extra,
  };
  elements.push(element);
  return element;
}
function text(x, y, value, size = 18, color = "#29465f", group = null) {
  const lines = value.split("\n");
  const width = Math.max(...lines.map((line) => line.length)) * size * 0.56;
  const e = base("text", x, y, width, lines.length * size * 1.35, {
    strokeColor: color,
    strokeWidth: 1,
    roughness: 0,
    fontSize: size,
    fontFamily: 2,
    text: value,
    originalText: value,
    textAlign: "left",
    verticalAlign: "top",
    containerId: null,
    lineHeight: 1.35,
    autoResize: true,
    ...(group ? { groupIds: [group] } : {}),
  });
  svg.push(
    `<text x="${x}" y="${y + size}" font-family="Arial,Helvetica,sans-serif" font-size="${size}" fill="${color}">${lines.map((line, i) => `<tspan x="${x}" dy="${i ? size * 1.35 : 0}">${escape(line)}</tspan>`).join("")}</text>`,
  );
  return e;
}
function card(key, x, y, w, h, title, body, fill, stroke = "#7695b1") {
  const e = base("rectangle", x, y, w, h, {
    backgroundColor: fill,
    strokeColor: stroke,
    roundness: { type: 3 },
    groupIds: [key],
  });
  svg.push(
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`,
  );
  text(x + 22, y + 18, title, 23, "#173c5b", key);
  text(x + 22, y + 60, body, 18, "#35546b", key);
  return e;
}
function arrow(start, end, points, label, labelX, labelY) {
  const [x, y] = points[0];
  const relative = points.map(([px, py]) => [px - x, py - y]);
  const maxX = Math.max(...points.map((p) => p[0])),
    minX = Math.min(...points.map((p) => p[0]));
  const maxY = Math.max(...points.map((p) => p[1])),
    minY = Math.min(...points.map((p) => p[1]));
  const e = base("arrow", x, y, maxX - minX, maxY - minY, {
    points: relative,
    lastCommittedPoint: null,
    startBinding: start ? { elementId: start.id, focus: 0, gap: 12 } : null,
    endBinding: end ? { elementId: end.id, focus: 0, gap: 12 } : null,
    startArrowhead: null,
    endArrowhead: "arrow",
    elbowed: false,
    strokeColor: "#4b789a",
    roughness: 0,
  });
  if (start) start.boundElements.push({ id: e.id, type: "arrow" });
  if (end) end.boundElements.push({ id: e.id, type: "arrow" });
  svg.push(
    `<polyline points="${points.map((p) => p.join(",")).join(" ")}" fill="none" stroke="#4b789a" stroke-width="2.5" marker-end="url(#arrow)" stroke-linejoin="round"/>`,
  );
  if (label) text(labelX, labelY, label, 16, "#486c86");
}

text(40, 32, "Character controller / architecture", 36, "#123956");
text(
  40,
  86,
  "A reusable Next.js + React Three Fiber template, from input to pixels",
  20,
  "#5a768c",
);
const parent = card(
  "parent",
  40,
  135,
  1710,
  90,
  "Project boundary",
  "Astro Runner root → character-controller-template/  ·  Standalone package, lockfile, tests, and local model copy; no runtime imports from the parent game.",
  "#f0f4f8",
);
const app = card(
  "app",
  650,
  270,
  500,
  160,
  "01  App shell",
  "app/layout.tsx → app/page.tsx\ncomponents/Playground.tsx\nCanvas, shared refs, blue scene + toolbar",
  "#e4f3ff",
);
const keyboard = card(
  "keyboard",
  40,
  500,
  450,
  170,
  "02  Keyboard input",
  "controls/character/useKeyboard.ts\nWASD + arrows, Shift, Space, B, R\nHeld keys + one-shot actions\nClear input on blur / hidden tab",
  "#eaf7ef",
  "#80a98f",
);
const refs = card(
  "refs",
  650,
  500,
  500,
  170,
  "03  Shared simulation refs",
  "CharacterState: pose, velocity, jumps, epoch\nCameraState: yaw, pitch, distance, snap\nCreated once by Playground via useRef\nPer-frame updates avoid React re-renders",
  "#f0edff",
  "#998bc0",
);
const mouse = card(
  "mouse",
  1300,
  500,
  450,
  170,
  "04  Mouse + browser capture",
  "controls/camera/useCameraInput.ts\nuseMouseLock.ts tracks lock UI / errors\nClick: capture · Escape: release\nMouse-look / drag orbit / wheel zoom",
  "#eaf7ef",
  "#80a98f",
);
const controller = card(
  "controller",
  650,
  790,
  500,
  170,
  "05  Character controller",
  "CharacterController.tsx → physics.ts\nuseFrame(-1): camera-relative movement\nAcceleration, gravity, double jump, backflip\nWrites pose + animation intent; R resets refs",
  "#fff2dd",
  "#bd9a60",
);
const camera = card(
  "camera",
  1300,
  790,
  450,
  170,
  "06  Third-person camera",
  "ThirdPersonCamera.tsx + config.ts\nReads character pose + orbit ref\nSmooth follow; bounded pitch + zoom\nuseFrame(0): position camera, lookAt target",
  "#e4f3ff",
);
const asset = card(
  "asset",
  40,
  1070,
  450,
  190,
  "07  Local character asset",
  "public/models/6animations.glb\nSix clips + embedded textures\nmodelUtils.ts: clone skeleton / materials\nNormalize to 1.85m; dispose cloned data",
  "#f0f4f8",
);
const model = card(
  "model",
  650,
  1070,
  500,
  190,
  "08  Animated character",
  "CharacterModel.tsx · useGLTF / useAnimations\nconfig.ts maps intent to clip names\nIdle_3 · Walking · Running\nRegular_Jump · Fall2 · Backflip\nCrossfades, one-shot replay, shared assets",
  "#fff2dd",
  "#bd9a60",
);
const render = card(
  "render",
  1300,
  1070,
  450,
  190,
  "09  Scene → pixels",
  "React Three Fiber → Three.js → WebGL\nBlue 2,000m plane + sky-blue background\nHemisphere + directional light, shadows\nFlat ground physics: Y = 0",
  "#e4f3ff",
);
arrow(parent, app, [
  [900, 237],
  [900, 258],
]);
arrow(
  app,
  refs,
  [
    [900, 442],
    [900, 488],
  ],
  "owns state",
  920,
  453,
);
arrow(
  keyboard,
  controller,
  [
    [502, 585],
    [565, 585],
    [565, 875],
    [638, 875],
  ],
  "movement intent",
  355,
  722,
);
arrow(
  refs,
  controller,
  [
    [900, 682],
    [900, 778],
  ],
  "read + update",
  920,
  716,
);
arrow(
  refs,
  camera,
  [
    [1162, 585],
    [1230, 585],
    [1230, 875],
    [1288, 875],
  ],
  "pose / orbit",
  1155,
  718,
);
arrow(
  mouse,
  camera,
  [
    [1525, 682],
    [1525, 778],
  ],
  "camera input",
  1545,
  716,
);
arrow(
  controller,
  model,
  [
    [900, 972],
    [900, 1058],
  ],
  "motion + epoch",
  920,
  1001,
);
arrow(
  asset,
  model,
  [
    [502, 1160],
    [638, 1160],
  ],
  "load",
  550,
  1120,
);
arrow(
  camera,
  render,
  [
    [1525, 972],
    [1525, 1058],
  ],
  "view",
  1545,
  1001,
);
arrow(
  model,
  render,
  [
    [1162, 1160],
    [1288, 1160],
  ],
  "draw",
  1200,
  1120,
);
text(
  40,
  1285,
  "Frame order: input events → movement / physics (-1) → animation + camera (0) → WebGL render.   UI state changes only for loading and mouse capture.",
  19,
);
card(
  "configuration",
  40,
  1360,
  820,
  150,
  "Tune or replace",
  "controls/character/config.ts: model path, clip names, speeds, gravity, jumps\ncontrols/camera/config.ts: follow speed, pitch limits, zoom limits, sensitivity\nReplace the environment in Playground; add collision logic in physics.ts.",
  "#f0f4f8",
);
card(
  "verification",
  910,
  1360,
  840,
  150,
  "Verify and run",
  "tests/controller.test.mjs: normalized movement, camera yaw, double jump, clips\nnpm test · npm run typecheck · npm run lint · npm run build\nnpm run dev → localhost:3002   |   Parent game stays on its own port.",
  "#f0f4f8",
);
text(
  40,
  1540,
  "Solid arrows: runtime flow   ·   Pastel cards: module responsibilities   ·   Generated from the actual template structure",
  17,
  "#698297",
);

const scene = {
  type: "excalidraw",
  version: 2,
  source: "https://excalidraw.com",
  elements,
  appState: { viewBackgroundColor: "#ffffff", gridSize: null, theme: "light" },
  files: {},
};
const output = path.join(root, "public/diagrams");
fs.mkdirSync(output, { recursive: true });
fs.writeFileSync(
  path.join(output, "architecture.excalidraw"),
  JSON.stringify(scene, null, 2) + "\n",
);
fs.writeFileSync(
  path.join(output, "architecture.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1800 1580" width="1800" height="1580" role="img" aria-labelledby="title desc"><title id="title">Character control template architecture</title><desc id="desc">App shell, keyboard and mouse input, shared simulation refs, movement physics, animation, camera follow, rendering, configuration, and verification.</desc><defs><marker id="arrow" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M 1 1 L 11 6 L 1 11" fill="none" stroke="#4b789a" stroke-width="1.7"/></marker></defs><rect width="1800" height="1580" fill="#ffffff"/>${svg.join("\n")}</svg>`,
);
console.log(
  `Generated ${elements.length} editable Excalidraw elements and an SVG overview.`,
);
