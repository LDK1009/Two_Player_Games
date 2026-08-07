export const COLOR_KEYS = ['red', 'blue', 'green', 'yellow'] as const;
export type ColorKey = (typeof COLOR_KEYS)[number];

const COLOR_LABELS: Record<ColorKey, string> = {
  red: '빨강',
  blue: '파랑',
  green: '초록',
  yellow: '노랑',
};

export type ColorTrapRound = {
  wordColor: ColorKey;
  wordLabel: string;
  inkColor: ColorKey;
};

function seededValue(seed: number): number {
  const normalizedValue = Math.abs(Math.sin(seed * 12.9898) * 43758.5453);
  return normalizedValue - Math.floor(normalizedValue);
}

export function createColorTrapRound(seed: number): ColorTrapRound {
  const wordIndex = Math.floor(seededValue(seed) * COLOR_KEYS.length);
  const inkIndex = Math.floor(seededValue(seed + 17) * COLOR_KEYS.length);
  const wordColor = COLOR_KEYS[wordIndex] ?? 'red';
  const inkColor = COLOR_KEYS[inkIndex] ?? 'blue';

  return {
    wordColor,
    wordLabel: COLOR_LABELS[wordColor],
    inkColor,
  };
}

export function scoreColorAnswer(round: ColorTrapRound, answer: ColorKey): number {
  return answer === round.inkColor ? 1 : -1;
}
