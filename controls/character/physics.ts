/** Pure movement math, independent of React and Three.js. */
export type MovementSettings = {
  walkSpeed: number;
  runSpeed: number;
  gravity: number;
  jumpSpeed: number;
  maxJumps: number;
  acceleration: number;
  airAcceleration: number;
  jumpBuffer: number;
  flipDuration: number;
};
export type CharacterState = {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  grounded: boolean;
  jumps: number;
  jumpBuffer: number;
  flipRemaining: number;
  animationEpoch: number;
  resetRequested: boolean;
};
export type MovementInput = {
  x: number;
  z: number;
  sprint: boolean;
  jump: boolean;
  flip: boolean;
};
export function createCharacterState(): CharacterState {
  return {
    x: 0,
    y: 0,
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    grounded: true,
    jumps: 0,
    jumpBuffer: 0,
    flipRemaining: 0,
    animationEpoch: 0,
    resetRequested: false,
  };
}
export function stepCharacter(
  s: CharacterState,
  input: MovementInput,
  yaw: number,
  dt: number,
  config: MovementSettings,
) {
  const delta = Math.min(Math.max(dt, 0), 0.05);
  const length = Math.hypot(input.x, input.z);
  const x = length ? input.x / length : 0;
  const z = length ? input.z / length : 0;
  const dx = x * Math.cos(yaw) + z * Math.sin(yaw);
  const dz = z * Math.cos(yaw) - x * Math.sin(yaw);
  const speed = input.sprint ? config.runSpeed : config.walkSpeed;
  const smooth =
    1 -
    Math.exp(
      -delta * (s.grounded ? config.acceleration : config.airAcceleration),
    );
  s.vx += (dx * speed - s.vx) * smooth;
  s.vz += (dz * speed - s.vz) * smooth;
  s.jumpBuffer = input.jump
    ? config.jumpBuffer
    : Math.max(0, s.jumpBuffer - delta);
  s.flipRemaining = Math.max(0, s.flipRemaining - delta);
  if (input.flip && s.grounded) {
    s.jumpBuffer = config.jumpBuffer;
    s.flipRemaining = config.flipDuration;
  }
  if (s.jumpBuffer > 0 && (s.grounded || s.jumps < config.maxJumps)) {
    s.vy = config.jumpSpeed;
    s.grounded = false;
    s.jumps++;
    s.jumpBuffer = 0;
    s.animationEpoch++;
  }
  s.vy -= config.gravity * delta;
  s.x += s.vx * delta;
  s.z += s.vz * delta;
  s.y += s.vy * delta;
  if (s.y <= 0) {
    s.y = 0;
    s.vy = 0;
    s.grounded = true;
    s.jumps = 0;
    s.flipRemaining = 0;
  }
}
