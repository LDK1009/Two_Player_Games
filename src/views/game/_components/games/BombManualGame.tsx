import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ChoiceButtons, type ChoiceOption } from '@/shared/components/game/ChoiceButtons';
import { PlayerBadge } from '@/shared/components/game/PlayerBadge';
import { SplitPlayerBoard } from '@/shared/components/game/SplitPlayerBoard';
import { colors, radius, spacing, typography } from '@/shared/theme/tokens';
import type { GameComponentProps } from '@/shared/types/game';
import { createBombPuzzle, validateBombStep, type WireColor } from '@/views/game/_utils/bombRules';

const INITIAL_SECONDS = 45;
const WIRE_LABELS: Record<WireColor, string> = { red: '빨강', blue: '파랑', yellow: '노랑' };
const WIRE_COLORS: Record<WireColor, string> = { red: '#F04F4F', blue: '#4D8BFF', yellow: '#E7B520' };

export function BombManualGame({ onFinish, roundKey }: GameComponentProps) {
  const puzzle = useMemo(() => createBombPuzzle(roundKey + 31), [roundKey]);
  const [stepIndex, setStepIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(INITIAL_SECONDS);
  const finishedRef = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((current) => {
        const next = current - 1;
        if (next <= 0 && !finishedRef.current) {
          finishedRef.current = true;
          onFinish({ winner: 'draw', title: '시간 초과 💥', subtitle: '설명을 더 짧고 정확하게 전달해보세요.' });
        }
        return Math.max(0, next);
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onFinish]);

  const finishSuccess = () => {
    if (finishedRef.current) {
      return;
    }
    finishedRef.current = true;
    onFinish({ winner: 'team', title: '폭탄 해체 성공!', subtitle: `${INITIAL_SECONDS - secondsLeft}초 만에 완벽한 협동`, recordValue: secondsLeft });
  };

  const submit = (input: string) => {
    if (finishedRef.current) {
      return;
    }

    if (validateBombStep(puzzle, stepIndex, input)) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (stepIndex === puzzle.steps.length - 1) {
        finishSuccess();
      } else {
        setStepIndex((current) => current + 1);
      }
      return;
    }

    const nextMistakes = mistakes + 1;
    setMistakes(nextMistakes);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    if (nextMistakes >= 2) {
      finishedRef.current = true;
      onFinish({ winner: 'draw', title: '해체 실패 💥', subtitle: '오답이 두 번 누적됐어요.' });
    }
  };

  const options: readonly ChoiceOption<string>[] = stepIndex === 0
    ? puzzle.wireColors.map((wire) => ({ value: wire, label: WIRE_LABELS[wire], color: WIRE_COLORS[wire] }))
    : stepIndex === 1
      ? puzzle.symbols.map((symbol) => ({ value: symbol, label: symbol, color: colors.ink }))
      : ['1', '2', '3', '4'].map((code) => ({ value: code, label: code, color: colors.coral }));

  const manual = (
    <View style={styles.manualPanel}>
      <View style={styles.manualHeader}>
        <PlayerBadge player="P2" />
        <Text style={styles.manualTitle}>해체 설명서</Text>
      </View>
      {puzzle.steps.map((step, index) => (
        <Text key={step.instruction} style={[styles.instruction, index === stepIndex && styles.activeInstruction]}>{step.instruction}</Text>
      ))}
      <Text style={styles.manualHint}>P1에게 말로만 알려주세요!</Text>
    </View>
  );

  const bomb = (
    <View style={styles.bombPanel}>
      <View style={styles.bombHeader}>
        <PlayerBadge player="P1" />
        <Text style={styles.timer}>{secondsLeft}s</Text>
        <Text style={styles.mistakes}>실수 {mistakes}/2</Text>
      </View>
      <Text style={styles.bombIcon}>💣</Text>
      <Text style={styles.stepTitle}>STEP {stepIndex + 1}</Text>
      <ChoiceButtons onSelect={submit} options={options} />
    </View>
  );

  return <SplitPlayerBoard center={<Text style={styles.centerText}>설명하는 사람 ↑ · 누르는 사람 ↓</Text>} playerOne={bomb} playerTwo={manual} />;
}

const styles = StyleSheet.create({
  manualPanel: { flex: 1, justifyContent: 'center', gap: spacing.sm, borderRadius: radius.md, backgroundColor: '#272730', padding: spacing.md },
  manualHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  manualTitle: { color: colors.surface, fontSize: typography.heading, fontWeight: '900' },
  instruction: { color: '#9292A2', fontSize: typography.body, fontWeight: '800', paddingVertical: spacing.xs },
  activeInstruction: { color: '#FFE66D', fontSize: 18 },
  manualHint: { color: '#BDBDCA', fontSize: typography.caption, marginTop: spacing.sm },
  bombPanel: { flex: 1, justifyContent: 'center', gap: spacing.sm },
  bombHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timer: { color: colors.coral, fontSize: typography.heading, fontWeight: '900' },
  mistakes: { color: colors.muted, fontSize: typography.caption, fontWeight: '800' },
  bombIcon: { fontSize: 48, textAlign: 'center' },
  stepTitle: { color: colors.ink, fontSize: typography.body, fontWeight: '900', textAlign: 'center' },
  centerText: { color: colors.muted, fontSize: typography.caption, fontWeight: '800' },
});
