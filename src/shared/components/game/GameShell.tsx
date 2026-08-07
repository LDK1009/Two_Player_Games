import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography } from '@/shared/theme/tokens';
import type { GameDefinition, GamePhase, GameResult } from '@/shared/types/game';

type GameShellProps = {
  definition: GameDefinition;
  phase: GamePhase;
  countdown: number;
  result?: GameResult;
  children: ReactNode;
  onStart: () => void;
  onReplay: () => void;
  onHome: () => void;
};

export function GameShell({
  definition,
  phase,
  countdown,
  result,
  children,
  onStart,
  onReplay,
  onHome,
}: GameShellProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" onPress={onHome} style={styles.backButton}>
          <Text style={styles.backText}>‹ 홈</Text>
        </Pressable>
        <Text numberOfLines={1} style={styles.headerTitle}>{definition.title}</Text>
        <View style={[styles.modeBadge, { backgroundColor: definition.accent }]}>
          <Text style={styles.modeText}>{definition.mode}</Text>
        </View>
      </View>

      <View style={styles.content}>
        {phase === 'ready' && (
          <Animated.View entering={FadeInDown.duration(320)} style={styles.centerCard}>
            <Text style={styles.icon}>{definition.icon}</Text>
            <Text style={styles.title}>{definition.title}</Text>
            <Text style={styles.rule}>{definition.rule}</Text>
            <Text style={styles.duration}>약 {definition.durationSeconds}초</Text>
            <Pressable onPress={onStart} style={[styles.primaryButton, { backgroundColor: definition.accent }]}>
              <Text style={styles.primaryButtonText}>게임 시작</Text>
            </Pressable>
          </Animated.View>
        )}

        {phase === 'countdown' && (
          <Animated.View entering={FadeIn.duration(180)} style={styles.countdownWrap}>
            <Text style={styles.countdown}>{countdown}</Text>
            <Text style={styles.countdownHint}>준비!</Text>
          </Animated.View>
        )}

        {phase === 'playing' && children}

        {phase === 'result' && result && (
          <Animated.View entering={FadeInDown.springify()} style={styles.centerCard}>
            <Text style={styles.resultEyebrow}>RESULT</Text>
            <Text style={styles.title}>{result.title}</Text>
            <Text style={styles.rule}>{result.subtitle}</Text>
            {(result.p1Score !== undefined || result.p2Score !== undefined) && (
              <View style={styles.scoreRow}>
                <Text style={styles.p1Score}>P1 {result.p1Score ?? 0}</Text>
                <Text style={styles.scoreDivider}>:</Text>
                <Text style={styles.p2Score}>{result.p2Score ?? 0} P2</Text>
              </View>
            )}
            <Pressable onPress={onReplay} style={[styles.primaryButton, { backgroundColor: definition.accent }]}>
              <Text style={styles.primaryButtonText}>한 판 더</Text>
            </Pressable>
            <Pressable onPress={onHome} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>다른 게임 고르기</Text>
            </Pressable>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: {
    height: 56,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  backButton: { minWidth: 58, paddingVertical: spacing.sm },
  backText: { color: colors.muted, fontSize: typography.body, fontWeight: '800' },
  headerTitle: { flex: 1, color: colors.ink, fontSize: typography.heading, fontWeight: '900', textAlign: 'center' },
  modeBadge: { minWidth: 58, borderRadius: radius.pill, paddingVertical: spacing.xs, paddingHorizontal: spacing.sm },
  modeText: { color: colors.surface, fontSize: typography.caption, fontWeight: '900', textAlign: 'center' },
  content: { flex: 1, padding: spacing.md },
  centerCard: {
    flex: 1,
    borderRadius: radius.lg,
    padding: spacing.xl,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  icon: { fontSize: 72 },
  title: { color: colors.ink, fontSize: typography.title, fontWeight: '900', textAlign: 'center' },
  rule: { color: colors.muted, fontSize: typography.body, lineHeight: 23, textAlign: 'center' },
  duration: { color: colors.muted, fontSize: typography.caption, fontWeight: '800' },
  primaryButton: { width: '100%', minHeight: 58, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginTop: spacing.sm },
  primaryButtonText: { color: colors.surface, fontSize: typography.heading, fontWeight: '900' },
  secondaryButton: { padding: spacing.md },
  secondaryButtonText: { color: colors.muted, fontSize: typography.body, fontWeight: '800' },
  countdownWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  countdown: { color: colors.ink, fontSize: 128, fontWeight: '900' },
  countdownHint: { color: colors.muted, fontSize: typography.heading, fontWeight: '800' },
  resultEyebrow: { color: colors.coral, fontSize: typography.caption, fontWeight: '900', letterSpacing: 2 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginVertical: spacing.md },
  p1Score: { color: colors.coral, fontSize: typography.heading, fontWeight: '900' },
  p2Score: { color: colors.blue, fontSize: typography.heading, fontWeight: '900' },
  scoreDivider: { color: colors.ink, fontSize: typography.heading, fontWeight: '900' },
});
