import * as Haptics from 'expo-haptics';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ChoiceButtons, type ChoiceOption } from '@/shared/components/game/ChoiceButtons';
import { PlayerBadge } from '@/shared/components/game/PlayerBadge';
import { SplitPlayerBoard } from '@/shared/components/game/SplitPlayerBoard';
import { colors, spacing, typography } from '@/shared/theme/tokens';
import type { GameComponentProps } from '@/shared/types/game';
import { COLOR_KEYS, createColorTrapRound, scoreColorAnswer, type ColorKey } from '@/views/game/_utils/colorTrapRules';

const TOTAL_ROUNDS = 10;
const COLOR_VALUES: Record<ColorKey, string> = { red: '#F04F4F', blue: '#4D8BFF', green: '#24A866', yellow: '#E7B520' };
const COLOR_LABELS: Record<ColorKey, string> = { red: '빨강', blue: '파랑', green: '초록', yellow: '노랑' };
const OPTIONS: readonly ChoiceOption<ColorKey>[] = COLOR_KEYS.map((colorKey) => ({ value: colorKey, label: COLOR_LABELS[colorKey], color: COLOR_VALUES[colorKey] }));

export function ColorTrapGame({ onFinish, roundKey }: GameComponentProps) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [answers, setAnswers] = useState<Partial<Record<'p1' | 'p2', ColorKey>>>({});
  const round = useMemo(() => createColorTrapRound(roundKey * 100 + roundIndex + 1), [roundIndex, roundKey]);

  const submitAnswer = (player: 'p1' | 'p2', answer: ColorKey) => {
    if (answers[player]) {
      return;
    }

    const earnedScore = scoreColorAnswer(round, answer);
    const nextScores = { ...scores, [player]: scores[player] + earnedScore };
    const nextAnswers = { ...answers, [player]: answer };
    setScores(nextScores);
    setAnswers(nextAnswers);
    void Haptics.notificationAsync(
      earnedScore > 0 ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error,
    );

    if (nextAnswers.p1 && nextAnswers.p2) {
      setTimeout(() => {
        if (roundIndex + 1 >= TOTAL_ROUNDS) {
          const winner = nextScores.p1 === nextScores.p2 ? 'draw' : nextScores.p1 > nextScores.p2 ? 'p1' : 'p2';
          onFinish({ winner, title: winner === 'draw' ? '무승부!' : `${winner.toUpperCase()} 승리`, subtitle: '글자의 뜻보다 진짜 색을 더 잘 봤어요.', p1Score: nextScores.p1, p2Score: nextScores.p2 });
          return;
        }

        setRoundIndex((current) => current + 1);
        setAnswers({});
      }, 450);
    }
  };

  const renderPanel = (player: 'p1' | 'p2') => (
    <View style={styles.panel}>
      <View style={styles.playerRow}>
        <PlayerBadge player={player === 'p1' ? 'P1' : 'P2'} />
        <Text style={styles.score}>{scores[player]}점</Text>
      </View>
      <Text style={[styles.colorWord, { color: COLOR_VALUES[round.inkColor] }]}>{round.wordLabel}</Text>
      <Text style={styles.hint}>글자색은?</Text>
      <ChoiceButtons disabled={Boolean(answers[player])} onSelect={(answer) => submitAnswer(player, answer)} options={OPTIONS} selectedValue={answers[player]} />
    </View>
  );

  return (
    <SplitPlayerBoard
      center={<Text style={styles.round}>ROUND {roundIndex + 1} / {TOTAL_ROUNDS}</Text>}
      playerOne={renderPanel('p1')}
      playerTwo={renderPanel('p2')}
    />
  );
}

const styles = StyleSheet.create({
  panel: { flex: 1, justifyContent: 'center', gap: spacing.sm },
  playerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  score: { color: colors.ink, fontSize: typography.body, fontWeight: '900' },
  colorWord: { fontSize: 42, fontWeight: '900', textAlign: 'center' },
  hint: { color: colors.muted, fontSize: typography.caption, fontWeight: '800', textAlign: 'center' },
  round: { color: colors.muted, fontSize: typography.caption, fontWeight: '900' },
});
