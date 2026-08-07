import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ChoiceButtons, type ChoiceOption } from '@/shared/components/game/ChoiceButtons';
import { PlayerBadge } from '@/shared/components/game/PlayerBadge';
import { SplitPlayerBoard } from '@/shared/components/game/SplitPlayerBoard';
import { colors, spacing, typography } from '@/shared/theme/tokens';
import type { GameComponentProps } from '@/shared/types/game';
import { scorePredictionRound, type PredictionChoice } from '@/views/game/_utils/predictionRules';

const TOTAL_ROUNDS = 5;
const OPTION_PAIRS = [
  ['집콕', '밖으로'], ['단맛', '매운맛'], ['계획', '즉흥'], ['바다', '산'], ['영화', '게임'],
] as const;

export function SecretPredictionGame({ onFinish }: GameComponentProps) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [stage, setStage] = useState<'predict' | 'choose' | 'reveal'>('predict');
  const [predictions, setPredictions] = useState<Partial<Record<'p1' | 'p2', PredictionChoice>>>({});
  const [choices, setChoices] = useState<Partial<Record<'p1' | 'p2', PredictionChoice>>>({});
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const labels = OPTION_PAIRS[roundIndex] ?? OPTION_PAIRS[0];
  const options: readonly ChoiceOption<PredictionChoice>[] = [
    { value: 'A', label: labels[0], color: colors.coral },
    { value: 'B', label: labels[1], color: colors.blue },
  ];

  const selectPrediction = (player: 'p1' | 'p2', value: PredictionChoice) => {
    const nextPredictions = { ...predictions, [player]: value };
    setPredictions(nextPredictions);
    if (nextPredictions.p1 && nextPredictions.p2) {
      setStage('choose');
    }
  };

  const selectChoice = (player: 'p1' | 'p2', value: PredictionChoice) => {
    const nextChoices = { ...choices, [player]: value };
    setChoices(nextChoices);

    if (!nextChoices.p1 || !nextChoices.p2 || !predictions.p1 || !predictions.p2) {
      return;
    }

    const earned = scorePredictionRound(predictions.p1, nextChoices.p1, predictions.p2, nextChoices.p2);
    const nextScores = { p1: scores.p1 + earned.p1, p2: scores.p2 + earned.p2 };
    setScores(nextScores);
    setStage('reveal');

    setTimeout(() => {
      if (roundIndex + 1 >= TOTAL_ROUNDS) {
        const winner = nextScores.p1 === nextScores.p2 ? 'draw' : nextScores.p1 > nextScores.p2 ? 'p1' : 'p2';
        onFinish({ winner, title: winner === 'draw' ? '서로를 똑같이 읽었어요' : `${winner.toUpperCase()} 예측왕`, subtitle: '상대의 마음을 더 정확하게 맞혔어요.', p1Score: nextScores.p1, p2Score: nextScores.p2 });
        return;
      }
      setRoundIndex((current) => current + 1);
      setPredictions({});
      setChoices({});
      setStage('predict');
    }, 900);
  };

  const renderPanel = (player: 'p1' | 'p2') => {
    const playerLabel = player === 'p1' ? 'P1' : 'P2';
    const prompt = stage === 'predict' ? '상대가 고를 답은?' : stage === 'choose' ? '나는 무엇을 고를까?' : '선택 공개!';
    const selectedValue = stage === 'predict' ? predictions[player] : choices[player];
    const onSelect = stage === 'predict' ? (value: PredictionChoice) => selectPrediction(player, value) : (value: PredictionChoice) => selectChoice(player, value);

    return (
      <View style={styles.panel}>
        <View style={styles.playerRow}>
          <PlayerBadge player={playerLabel} />
          <Text style={styles.score}>{scores[player]}점</Text>
        </View>
        <Text style={styles.prompt}>{prompt}</Text>
        <ChoiceButtons disabled={stage === 'reveal' || Boolean(selectedValue)} onSelect={onSelect} options={options} selectedValue={selectedValue} />
      </View>
    );
  };

  return (
    <SplitPlayerBoard
      center={<Text style={styles.round}>ROUND {roundIndex + 1} / {TOTAL_ROUNDS}</Text>}
      playerOne={renderPanel('p1')}
      playerTwo={renderPanel('p2')}
    />
  );
}

const styles = StyleSheet.create({
  panel: { flex: 1, justifyContent: 'center', gap: spacing.md },
  playerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  score: { color: colors.ink, fontSize: typography.body, fontWeight: '900' },
  prompt: { color: colors.ink, fontSize: typography.heading, fontWeight: '900', textAlign: 'center' },
  round: { color: colors.muted, fontSize: typography.caption, fontWeight: '900' },
});
