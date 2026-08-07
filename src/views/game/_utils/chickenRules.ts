type ReleaseTimes = readonly [number | null, number | null];

export function resolveChickenRound(
  [p1ReleaseTime, p2ReleaseTime]: ReleaseTimes,
  explosionTime: number,
): 'p1' | 'p2' | 'draw' {
  const p1Exploded = p1ReleaseTime === null || p1ReleaseTime >= explosionTime;
  const p2Exploded = p2ReleaseTime === null || p2ReleaseTime >= explosionTime;

  if (p1Exploded && p2Exploded) {
    return 'draw';
  }

  if (p1Exploded) {
    return 'p2';
  }

  if (p2Exploded) {
    return 'p1';
  }

  if (p1ReleaseTime === p2ReleaseTime) {
    return 'draw';
  }

  return p1ReleaseTime > p2ReleaseTime ? 'p1' : 'p2';
}
