# Template architecture

The native [Excalidraw board](../public/diagrams/architecture.excalidraw) and its
[SVG overview](../public/diagrams/architecture.svg) describe the implemented app.
The diagram is available in the running template at `/architecture`.

## Project boundary

The folder is a standalone Next.js app nested inside Astro Runner. It owns its
package manifest, dependency lockfile, model copy, tests, and build output. It
can resolve parent-installed dependencies while nested, but no source modules or
runtime model requests reference the parent city, combat, or district systems.

## Ownership and flow

`app/layout.tsx` owns document metadata and global styling. `app/page.tsx` renders
`components/Playground.tsx`, the client boundary. Playground owns the Canvas,
blue environment, loading indicator, toolbar, and two refs:

- Character state: position, velocity, ground contact, jump count, backflip timer,
  animation replay epoch, and reset request.
- Orbit state: yaw, pitch, distance, and whether to snap the camera after reset.

`useKeyboard` records held keys and one-shot jump, flip, and reset requests.
`CharacterController` runs at frame priority -1 and calls the pure
`stepCharacter` function. Movement is camera-relative and diagonals are
normalized. Physics writes back to the character ref, clamps ground contact to
Y=0, and caps jumps at two. The controller moves and rotates the character group
and selects the current animation intent.

`CharacterModel` loads the local six-animation GLB through Drei's shared loader
cache. `modelUtils` clones skeletons and materials, enables shadows, and computes
bounds. The visual is normalized to 1.85m. Intent selects a clip through the
character config; walking and idle loop, jumping and backflip play once, and
animation changes crossfade. The epoch allows the second jump to replay its clip.
Cloned materials and skeleton resources are disposed on unmount.

`useCameraInput` maps mouse movement and wheel input into the orbit ref. Clicking
the scene captures the pointer for mouse-look; dragging works without capture.
A drag is distinguished from a click so releasing a drag does not unexpectedly
capture the pointer. `useMouseLock` tracks browser pointer-lock changes and errors
for the toolbar. Escape releases capture using the browser's normal mechanism.
`ThirdPersonCamera` reads the character and orbit refs, computes a follow position,
lerps toward it, and looks at a point above the character's feet. Pitch and zoom
are bounded by camera config. R resets both refs; reset returns keyboard focus
to the canvas.

Animation and camera callbacks run at the default frame priority 0, after
movement and before React Three Fiber renders the scene through Three.js/WebGL.
Simulation refs avoid React state updates on every frame; React state is used for
loading and capture UI. The blue plane is visual scenery while collision is the
pure Y=0 constraint in physics. A different environment needs corresponding
collision logic.

## Configuration and verification

Character config sets clip names, model path, dimensions, gravity, acceleration,
speeds, and jump behavior. Camera config separately sets sensitivity, follow
smoothing, pitch limits, and zoom limits. The keyboard hook clears held input
when focus is lost or the document becomes hidden. DOM listeners are cleaned up
on unmount, including releasing pointer lock owned by the canvas.

Tests exercise movement normalization, camera-relative input, the double-jump cap,
landing reset, grounded backflips, sprint speed, and all six bundled clips. Run
`npm test`, `npm run typecheck`, `npm run lint`, and `npm run build` to verify the
app. `npm run diagram` regenerates the editable board and SVG from one source.

File-format reference: [Excalidraw JSON schema](https://docs.excalidraw.com/docs/codebase/json-schema/).
