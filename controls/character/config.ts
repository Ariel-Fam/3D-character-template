/** Tune movement and animation names here when replacing the character. */
export const characterConfig = {
  model: "/models/6animations.glb",
  height: 1.85,
  walkSpeed: 4,
  runSpeed: 8,
  gravity: 23,
  jumpSpeed: 9.8,
  maxJumps: 2,
  acceleration: 14,
  airAcceleration: 5,
  turnSpeed: 14,
  jumpBuffer: 0.12,
  flipDuration: 0.86,
};
export const animations = {
  idle: "Idle_3",
  walking: "Walking",
  running: "Running",
  jump: "Regular_Jump",
  falling: "Fall2",
  backflip: "Backflip",
} as const;
export type Motion = keyof typeof animations;
