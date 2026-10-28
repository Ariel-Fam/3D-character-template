# Character control template

A self-contained Next.js App Router starter with the six-animation character,
a flat blue plane, and a sky-blue background. The model starts at the origin.
There are no imports or asset links to the parent Astro Runner project.

## Run

```sh
cd character-controller-template
npm install
npm run dev
```

Open http://localhost:3002. This uses a separate port so the parent app can keep
running on port 3000. To choose another port, run `npx next dev --webpack --port 3003`.
While this folder remains inside the parent project, it can also use the parent's
already installed dependencies. Copy the whole folder elsewhere and run
`npm install` to use it independently. Node.js 20.9+ is required.

## Controls

| Input | Action |
| --- | --- |
| WASD / arrow keys | Move relative to the camera |
| Shift | Sprint |
| Space | Jump; press again in the air to double jump |
| B | Backflip from the ground |
| Left or right mouse drag | Orbit the character |
| Mouse wheel | Zoom |
| Click the scene / Lock mouse button | Capture the mouse for free mouse-look |
| Escape / Release mouse button | Release captured mouse |
| R / Reset position | Return the character and camera to the origin |

Keyboard and mouse are the intended inputs. Losing window focus clears held keys.

## Reuse and customize

- `controls/character/CharacterController.tsx`: movement-to-animation coordination.
- `controls/character/physics.ts`: pure movement math, acceleration, gravity,
  double jump, and flat-ground contact. Add your own collision system here.
- `controls/character/config.ts`: movement settings, model path, and clip names.
- `controls/character/CharacterModel.tsx`: skeleton-safe cloning, scale, animation
  crossfades, and material cleanup.
- `controls/character/useKeyboard.ts`: keyboard input and focus cleanup.
- `controls/camera/`: camera settings, mouse input, and smooth third-person follow.
- `components/Playground.tsx`: minimal environment, lighting, and controls overlay.
- `public/models/6animations.glb`: the actual model, with embedded textures and
  Walking, Running, Idle_3, Regular_Jump, Fall2, and Backflip animations.

Copy `controls/` and the model into a project with React Three Fiber, Drei, and
Three.js. Place the controller and camera inside a Canvas and supply shared refs
created with `createCharacterState()` and `createCameraState()` as shown in
`Playground.tsx`. Relative imports keep the template independent of alias setup.
The simulation uses refs to avoid per-frame React renders. Camera settings and
character settings are deliberately separate.

The visual plane is 2,000m wide and fades into the blue background. Physics uses
a flat ground at Y=0; replacing the environment requires corresponding collision
logic. The starter contains no obstacles, combat, audio, or extra scenery.
The avatar keeps its original colors; the environment is blue throughout.

## Verify

```sh
npm test
npm run typecheck
npm run lint
npm run build
npm start
```

Development and production builds use Next.js's Webpack compiler, so the nested
project can also resolve dependencies installed in its parent folder. No remote
fonts or other external assets are needed. The provided character is copied from
the parent project; retain the original model's licensing when redistributing it.


## Architecture diagram

Open [the Architecture page](http://localhost:3002/architecture), or use the
Architecture button in the scene toolbar. It shows the entire template from input
to WebGL rendering and its boundary inside the parent Astro Runner project.

- `public/diagrams/architecture.excalidraw`: editable native Excalidraw board.
- `public/diagrams/architecture.svg`: local full-size overview used in the app.
- `scripts/generate-architecture.mjs`: a single source for both artifacts.
- `docs/architecture.md`: module responsibilities and frame-order notes.

To edit the board, download the `.excalidraw` file from the Architecture page and
open it in Excalidraw. To regenerate both artifacts from their source, run
`npm run diagram`. Regeneration replaces the diagram files, so preserve any edits
made directly in Excalidraw before running it.
