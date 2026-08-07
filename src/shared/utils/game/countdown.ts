export function advanceCountdown(currentValue: number): number {
  const nextValue = Math.max(0, currentValue - 1);
  return nextValue;
}
