import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ChoiceButtons, type ChoiceOption } from '@/shared/components/game/ChoiceButtons';
import { PlayerBadge } from '@/shared/components/game/PlayerBadge';
import { SplitPlayerBoard } from '@/shared/components/game/SplitPlayerBoard';
import { colors, spacing, typography } from '@/shared/theme/tokens';
import type { GameComponentProps } from '@/shared/types/game';
import { COUPLE_QUESTIONS } from '@/views/game/_constants/coupleQuestions';

type CoupleChoice = 'A' | 'B';

export function CoupleSyncGame({ onFinish }: GameComponentProps) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [choices, setChoices] = useState<Partial<Record<'p1' | 'p2', CoupleChoice>>>({});
  const [matches, setMatches] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const pendingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const question = COUPLE_QUESTIONS[questionIndex] ?? COUPLE_QUESTIONS[0];
  const options: readonly ChoiceOption<CoupleChoice>[] = [
    { value: 'A', label: question.optionA, color: colors.coral },
    { value: 'B', label: question.optionB, color: colors.blue },
  ];

  useEffect(() => () => {
    if (pendingTimerRef.current) {
      clearTimeout(pendingTimerRef.current);
    }
  }, []);

  const choose = (player: 'p1' | 'p2', choice: CoupleChoice) => {
    if (choices[player] || isRevealed) {
      return;
    }

    const nextChoices = { ...choices, [player]: choice };
    setChoices(nextChoices);
    if (!nextChoices.p1 || !nextChoices.p2) {
      return;
    }

    const didMatch = nextChoices.p1 === nextChoices.p2;
    const nextMatches = matches + Number(didMatch);
    setMatches(nextMatches);
    setIsRevealed(true);
    void Haptics.notificationAsync(
      didMatch ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning,
    );

    pendingTimerRef.current = setTimeout(() => {
      if (questionIndex + 1 >= COUPLE_QUESTIONS.length) {
        const subtitle = nextMatches >= 6 ? '거의 텔레파시 수준이에요.' : nextMatches >= 4 ? '꽤 잘 통하는 두 사람이네요.' : nextMatches >= 2 ? '다른 점까지 재미있는 사이예요.' : '서로를 알아갈 질문이 더 남았어요.';
        onFinish({ winner: 'team', title: `7개 중 ${nextMatches}개 일치`, subtitle, recordValue: nextMatches });
        return;
      }

      setQuestionIndex((current) => current + 1);
      setChoices({});
      setIsRevealed(false);
    }, 850);
  };

  const renderPanel = (player: 'p1' | 'p2') => (
    <View style={styles.panel}>
      <PlayerBadge player={player === 'p1' ? 'P1' : 'P2'} />
      <Text style={styles.question}>{question.prompt}</Text>
      <ChoiceButtons disabled={Boolean(choices[player])} onSelect={(choice) => choose(player, choice)} options={options} selectedValue={choices[player]} />
      <Text style={styles.status}>{choices[player] ? '선택 완료 🔒' : '상대에게 안 보이게 고르세요'}</Text>
    </View>
  );

  return (
    <SplitPlayerBoard
      center={<Text style={[styles.centerText, isRevealed && styles.revealed]}>{isRevealed ? (choices.p1 === choices.p2 ? '통했다! 💞' : '이번엔 달라요') : `${questionIndex + 1} / ${COUPLE_QUESTIONS.length}`}</Text>}
      playerOne={renderPanel('p1')}
      playerTwo={renderPanel('p2')}
    />
  );
}

const styles = StyleSheet.create({
  panel: { flex: 1, justifyContent: 'center', gap: spacing.md },
  question: { color: colors.ink, fontSize: typography.heading, fontWeight: '900', textAlign: 'center' },
  status: { color: colors.muted, fontSize: typography.caption, fontWeight: '700', textAlign: 'center' },
  centerText: { color: colors.muted, fontSize: typography.body, fontWeight: '900' },
  revealed: { color: colors.coral },
});
