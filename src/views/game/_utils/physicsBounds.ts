type CircleBounds = {
  x: number;
  y: number;
  radius: number;
};

type ArenaBounds = CircleBounds;

export function isCircleOutsideArena(circle: CircleBounds, arena: ArenaBounds): boolean {
  const horizontalDistance = circle.x - arena.x;
  const verticalDistance = circle.y - arena.y;
  const centerDistance = Math.hypot(horizontalDistance, verticalDistance);
  return centerDistance - circle.radius > arena.radius;
}

export function detectGoal(
  puck: Pick<CircleBounds, 'y' | 'radius'>,
  field: { height: number },
): 'top' | 'bottom' | undefined {
  if (puck.y + puck.radius < 0) {
    return 'top';
  }

  if (puck.y - puck.radius > field.height) {
    return 'bottom';
  }

  return undefined;
}
