export type WireColor = 'red' | 'blue' | 'yellow';

export type BombStep = {
  instruction: string;
  answer: string;
};

export type BombPuzzle = {
  wireColors: readonly WireColor[];
  symbols: readonly string[];
  code: number;
  steps: readonly BombStep[];
};

const WIRES: readonly WireColor[] = ['red', 'blue', 'yellow'];
const SYMBOLS = ['★', '☂', '☀', '♣', '◆', '☾'] as const;
const WIRE_LABELS: Record<WireColor, string> = { red: '빨간색', blue: '파란색', yellow: '노란색' };

function positiveModulo(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}

export function createBombPuzzle(seed: number): BombPuzzle {
  const wireOffset = positiveModulo(seed, WIRES.length);
  const symbolOffset = positiveModulo(seed * 3 + 1, SYMBOLS.length);
  const wireColors = [WIRES[wireOffset], WIRES[(wireOffset + 1) % 3], WIRES[(wireOffset + 2) % 3]] as const;
  const symbols = [SYMBOLS[symbolOffset], SYMBOLS[(symbolOffset + 2) % SYMBOLS.length], SYMBOLS[(symbolOffset + 4) % SYMBOLS.length]] as const;
  const targetWire = wireColors[positiveModulo(seed + 1, wireColors.length)];
  const targetSymbol = symbols[positiveModulo(seed + 2, symbols.length)];
  const code = positiveModulo(seed * 7, 4) + 1;

  const steps: readonly BombStep[] = [
    { instruction: `1. ${WIRE_LABELS[targetWire]} 선을 누르세요`, answer: targetWire },
    { instruction: `2. ${targetSymbol} 기호를 누르세요`, answer: targetSymbol },
    { instruction: `3. 숫자 ${code}을 누르세요`, answer: String(code) },
  ];

  return { wireColors, symbols, code, steps };
}

export function validateBombStep(puzzle: BombPuzzle, stepIndex: number, input: string): boolean {
  const step = puzzle.steps[stepIndex];
  return step?.answer === input;
}
