export const cameraConfig = {
  yaw: 0,
  pitch: 0.28,
  distance: 6,
  minDistance: 2.5,
  maxDistance: 12,
  minPitch: 0.06,
  maxPitch: 1.15,
  sensitivity: 0.003,
  zoomSpeed: 0.006,
  followSpeed: 12,
  targetHeight: 1.1,
};
export function createCameraState() {
  return {
    yaw: cameraConfig.yaw,
    pitch: cameraConfig.pitch,
    distance: cameraConfig.distance,
    snap: true,
  };
}
export type CameraState = ReturnType<typeof createCameraState>;
