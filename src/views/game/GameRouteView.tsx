import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GameShell } from '@/shared/components/game/GameShell';
import { getGameDefinition } from '@/shared/constants/games';
import { useGameCountdown } from '@/shared/hooks/useGameCountdown';
import { useGameRecordsStore } from '@/shared/store/useGameRecordsStore';
import { colors, radius, spacing, typography } from '@/shared/theme/tokens';
import type { GamePhase, GameResult } from '@/shared/types/game';
import { GameComponentResolver } from '@/views/game/_components/GameComponentResolver';

type GameRouteViewProps = {
  gameId: string;
};

export function GameRouteView({ gameId }: GameRouteViewProps) {
  const definition = getGameDefinition(gameId);
  const [phase, setPhase] = useState<GamePhase>('ready');
  const [result, setResult] = useState<GameResult>();
  const [roundKey, setRoundKey] = useState(0);
  const saveResult = useGameRecordsStore((state) => state.saveResult);
  const handleCountdownComplete = useCallback(() => setPhase('playing'), []);
  const countdown = useGameCountdown(phase === 'countdown', handleCountdownComplete);

  if (!definition) {
    return (
      <SafeAreaView style={styles.errorSafeArea}>
        <View style={styles.errorCard}>
          <Text style={styles.errorIcon}>🫥</Text>
          <Text style={styles.errorTitle}>게임을 찾을 수 없어요</Text>
          <Pressable onPress={() => router.replace('/')} style={styles.homeButton}>
            <Text style={styles.homeButtonText}>홈으로</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const handleFinish = (nextResult: GameResult) => {
    if (phase !== 'playing') {
      return;
    }

    saveResult(definition.id, nextResult);
    setResult(nextResult);
    setPhase('result');
  };

  const handleReplay = () => {
    setResult(undefined);
    setRoundKey((currentKey) => currentKey + 1);
    setPhase('countdown');
  };

  return (
    <GameShell
      countdown={countdown}
      definition={definition}
      onHome={() => router.replace('/')}
      onReplay={handleReplay}
      onStart={() => setPhase('countdown')}
      phase={phase}
      result={result}
    >
      <GameComponentResolver
        gameId={definition.id}
        key={`${definition.id}-${roundKey}`}
        onFinish={handleFinish}
        roundKey={roundKey}
      />
    </GameShell>
  );
}

const styles = StyleSheet.create({
  errorSafeArea: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  errorCard: { flex: 1, borderRadius: radius.lg, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  errorIcon: { fontSize: 64 },
  errorTitle: { color: colors.ink, fontSize: typography.heading, fontWeight: '900' },
  homeButton: { borderRadius: radius.md, backgroundColor: colors.ink, paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  homeButtonText: { color: colors.surface, fontSize: typography.body, fontWeight: '900' },
});
