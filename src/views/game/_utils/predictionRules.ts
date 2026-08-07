export type PredictionChoice = 'A' | 'B';

export function scorePredictionRound(
  p1Prediction: PredictionChoice,
  p1Choice: PredictionChoice,
  p2Prediction: PredictionChoice,
  p2Choice: PredictionChoice,
): { p1: number; p2: number } {
  return {
    p1: Number(p1Prediction === p2Choice),
    p2: Number(p2Prediction === p1Choice),
  };
}
