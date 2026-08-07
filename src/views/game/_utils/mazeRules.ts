type Circle = {
  x: number;
  y: number;
  radius: number;
};

export function hasReachedCheckpoint(ball: Circle, checkpoint: Circle): boolean {
  const distance = Math.hypot(ball.x - checkpoint.x, ball.y - checkpoint.y);
  const reached = distance <= checkpoint.radius;
  return reached;
}

export function nextCheckpointIndex(current: number, total: number): number {
  const next = Math.min(total, current + 1);
  return next;
}
