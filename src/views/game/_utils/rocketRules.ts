export type RocketForce = {
  thrust: number;
  torque: number;
};

export function calculateRocketForce(leftThrottle: number, rightThrottle: number): RocketForce {
  const normalizedLeft = Math.min(1, Math.max(0, leftThrottle));
  const normalizedRight = Math.min(1, Math.max(0, rightThrottle));
  const force = {
    thrust: normalizedLeft + normalizedRight,
    torque: normalizedRight - normalizedLeft,
  };
  return force;
}
